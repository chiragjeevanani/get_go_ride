import Vendor from '../models/Vendor.model.js';
import WithdrawalRequest from '../models/WithdrawalRequest.model.js';
import { success, error } from '../utils/response.js';

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER: Save / Update bank details (one-time setup)
// POST /api/vendors/me/bank-details
// ─────────────────────────────────────────────────────────────────────────────
export const saveBankDetails = async (req, res, next) => {
  try {
    const { accountHolderName, accountNumber, ifscCode, bankName, upiId } = req.body;

    if (!accountHolderName || !accountNumber || !ifscCode || !bankName) {
      return error(res, 'Account holder name, account number, IFSC and bank name are required', 400, 'VALIDATION_ERROR');
    }

    // Validate IFSC format: 4 alpha + 0 + 6 alphanumeric
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.toUpperCase())) {
      return error(res, 'Invalid IFSC code format (e.g. SBIN0001234)', 400, 'VALIDATION_ERROR');
    }

    // Validate account number length (9-18 digits)
    if (!/^\d{9,18}$/.test(accountNumber)) {
      return error(res, 'Account number must be 9-18 digits', 400, 'VALIDATION_ERROR');
    }

    const vendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          bankDetails: {
            accountHolderName: accountHolderName.trim(),
            accountNumber: accountNumber.trim(),
            ifscCode: ifscCode.toUpperCase().trim(),
            bankName: bankName.trim(),
            upiId: (upiId || '').trim(),
          },
        },
      },
      { new: true, runValidators: true }
    );

    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');

    success(res, vendor.bankDetails, 'Bank details saved successfully');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER: Get saved bank details
// GET /api/vendors/me/bank-details
// ─────────────────────────────────────────────────────────────────────────────
export const getBankDetails = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id).select('bankDetails');
    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');

    success(res, vendor.bankDetails || {}, 'Bank details retrieved');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER: Request a withdrawal
// POST /api/vendors/me/withdraw  { amount }
// ─────────────────────────────────────────────────────────────────────────────
export const requestWithdrawal = async (req, res, next) => {
  try {
    const { amount } = req.body;
    const withdrawAmount = Number(amount);

    if (!withdrawAmount || withdrawAmount < 100) {
      return error(res, 'Minimum withdrawal amount is ₹100', 400, 'VALIDATION_ERROR');
    }

    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');

    // Check bank details exist
    const bd = vendor.bankDetails;
    if (!bd || !bd.accountNumber || !bd.ifscCode) {
      return error(
        res,
        'Please add your bank details before requesting a withdrawal',
        400,
        'BANK_DETAILS_MISSING'
      );
    }

    // Check active balance
    const activeBalance = vendor.wallet.activeBalance || 0;
    if (withdrawAmount > activeBalance) {
      return error(
        res,
        `Insufficient balance. Available active balance: ₹${activeBalance}`,
        400,
        'INSUFFICIENT_BALANCE'
      );
    }

    // Check no pending withdrawal already
    const existingPending = await WithdrawalRequest.findOne({
      vendor: req.user.id,
      status: 'pending',
    });
    if (existingPending) {
      return error(
        res,
        'You already have a pending withdrawal request. Please wait for it to be processed.',
        400,
        'PENDING_EXISTS'
      );
    }

    // Deduct active balance (reserve it)
    vendor.wallet.activeBalance = activeBalance - withdrawAmount;
    vendor.wallet.transactions.push({
      type: 'withdrawal',
      amount: withdrawAmount,
      description: `Withdrawal request of ₹${withdrawAmount} submitted`,
      date: new Date(),
    });
    await vendor.save();

    // Create withdrawal request with bank snapshot
    const withdrawal = await WithdrawalRequest.create({
      vendor: req.user.id,
      amount: withdrawAmount,
      status: 'pending',
      bankSnapshot: {
        accountHolderName: bd.accountHolderName,
        accountNumber: bd.accountNumber,
        ifscCode: bd.ifscCode,
        bankName: bd.bankName,
        upiId: bd.upiId || '',
      },
    });

    success(res, withdrawal, 'Withdrawal request submitted successfully', 201);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DRIVER: Get withdrawal history
// GET /api/vendors/me/withdrawals
// ─────────────────────────────────────────────────────────────────────────────
export const getMyWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await WithdrawalRequest.find({ vendor: req.user.id })
      .sort({ createdAt: -1 });

    success(res, withdrawals, 'Withdrawal history retrieved');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Get all withdrawal requests (filterable by status)
// GET /api/admin/withdrawals?status=pending&page=1&limit=20
// ─────────────────────────────────────────────────────────────────────────────
export const getAllWithdrawals = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (status) query.status = status;

    const withdrawals = await WithdrawalRequest.find(query)
      .populate('vendor', 'name phone wallet bankDetails')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await WithdrawalRequest.countDocuments(query);
    const pendingCount = await WithdrawalRequest.countDocuments({ status: 'pending' });

    success(res, {
      withdrawals,
      pendingCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    }, 'Withdrawals retrieved');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN: Process a withdrawal (approve/reject/mark paid)
// PATCH /api/admin/withdrawals/:id
// Body: { action: 'approve' | 'reject' | 'paid', adminNote?, transactionRef? }
// ─────────────────────────────────────────────────────────────────────────────
export const processWithdrawal = async (req, res, next) => {
  try {
    const { action, adminNote, transactionRef } = req.body;

    if (!['approve', 'reject', 'paid'].includes(action)) {
      return error(res, 'action must be approve, reject, or paid', 400, 'VALIDATION_ERROR');
    }

    const withdrawal = await WithdrawalRequest.findById(req.params.id).populate('vendor');
    if (!withdrawal) return error(res, 'Withdrawal request not found', 404, 'NOT_FOUND');

    const vendor = withdrawal.vendor;

    if (action === 'approve') {
      if (withdrawal.status !== 'pending') {
        return error(res, 'Only pending requests can be approved', 400, 'INVALID_STATE');
      }
      withdrawal.status = 'approved';
      withdrawal.adminNote = adminNote || '';
      withdrawal.processedAt = new Date();
    } else if (action === 'paid') {
      if (!['pending', 'approved'].includes(withdrawal.status)) {
        return error(res, 'Only pending/approved requests can be marked as paid', 400, 'INVALID_STATE');
      }
      if (!transactionRef) {
        return error(res, 'Transaction reference (UTR) is required to mark as paid', 400, 'VALIDATION_ERROR');
      }
      withdrawal.status = 'paid';
      withdrawal.transactionRef = transactionRef;
      withdrawal.adminNote = adminNote || '';
      withdrawal.processedAt = new Date();
    } else if (action === 'reject') {
      if (withdrawal.status !== 'pending') {
        return error(res, 'Only pending requests can be rejected', 400, 'INVALID_STATE');
      }
      withdrawal.status = 'rejected';
      withdrawal.adminNote = adminNote || 'Rejected by admin';
      withdrawal.processedAt = new Date();

      // Refund back to active balance
      if (vendor) {
        const v = await Vendor.findById(vendor._id);
        if (v) {
          v.wallet.activeBalance = (v.wallet.activeBalance || 0) + withdrawal.amount;
          v.wallet.transactions.push({
            type: 'credit',
            amount: withdrawal.amount,
            description: `Withdrawal of ₹${withdrawal.amount} rejected — refunded to wallet`,
            date: new Date(),
          });
          await v.save();
        }
      }
    }

    await withdrawal.save();
    success(res, withdrawal, `Withdrawal ${action} successfully`);
  } catch (err) {
    next(err);
  }
};
