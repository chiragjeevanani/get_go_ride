import User from '../models/User.model.js';
import SystemSetting from '../models/SystemSetting.model.js';
import Requirement from '../models/Requirement.model.js';
import Bid from '../models/Bid.model.js';
import { success, error } from '../utils/response.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';

// --- User Facing ---

/**
 * @route   GET /api/users/me
 * @desc    Get current user profile
 * @access  Private (User)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');
    
    success(res, user, 'Profile retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/users/me
 * @desc    Update user profile
 * @access  Private (User)
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, email, profileImage, location } = req.body;
    
    // Validate email if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return error(res, 'Invalid email format', 400, 'VALIDATION_ERROR');
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, email, profileImage, location } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) return error(res, 'User not found', 404, 'NOT_FOUND');

    success(res, updatedUser, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/users/me/wallet
 * @desc    Get user wallet balance and transactions
 * @access  Private (User)
 */
export const getMyWallet = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');
    
    // Auto-credit signup bonus if wallet is empty and no transactions exist (safety net for new/existing accounts)
    if ((user.wallet.balance || 0) === 0 && user.wallet.transactions.length === 0) {
      const bonusSetting = await SystemSetting.findOne({ key: 'walletSignupBonus' });
      const signupBonus = bonusSetting ? Number(bonusSetting.value) : 50;
      
      if (signupBonus > 0) {
        user.wallet.balance = signupBonus;
        user.wallet.transactions.push({
          type: 'credit',
          amount: signupBonus,
          description: 'Welcome Sign-up Bonus',
          date: new Date()
        });
        await user.save();
      }
    }
    
    success(res, user.wallet, 'Wallet retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/users/me/wallet/add-money
 * @desc    Add mock money to user's wallet
 * @access  Private (User)
 */
export const addMoneyToWallet = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return error(res, 'Invalid amount', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findById(req.user.id);
    if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');

    user.wallet.balance = (user.wallet.balance || 0) + Number(amount);
    user.wallet.transactions.push({
      type: 'credit',
      amount: Number(amount),
      description: 'Wallet Top Up',
      date: new Date()
    });

    await user.save();

    success(res, user.wallet, 'Wallet loaded successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/users/me/wallet/create-order
 * @desc    Create Razorpay Order for Wallet Top Up
 * @access  Private (User)
 */
export const createWalletOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return error(res, 'Invalid amount', 400, 'VALIDATION_ERROR');
    }

    const options = {
      amount: Math.round(Number(amount) * 100), // amount in paise
      currency: 'INR',
      receipt: `wt_${req.user.id.toString().slice(-12)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    success(res, order, 'Razorpay wallet order created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/users/me/wallet/verify-payment
 * @desc    Verify Razorpay payment signature and credit wallet
 * @access  Private (User)
 */
export const verifyWalletPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !amount) {
      return error(res, 'All payment details are required', 400, 'VALIDATION_ERROR');
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return error(res, 'Invalid payment signature verification failed', 400, 'PAYMENT_VERIFICATION_FAILED');
    }

    // Load user and update balance
    const user = await User.findById(req.user.id);
    if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');

    user.wallet.balance = (user.wallet.balance || 0) + Number(amount);
    user.wallet.transactions.push({
      type: 'credit',
      amount: Number(amount),
      description: `Wallet top-up (Ref: ${razorpay_payment_id})`,
      date: new Date()
    });

    await user.save();
    success(res, user.wallet, 'Wallet loaded successfully via Razorpay');
  } catch (err) {
    next(err);
  }
};


/**
 * @route   POST /api/users/me/addresses
 * @desc    Save a new address
 * @access  Private (User)
 */
export const saveAddress = async (req, res, next) => {
  try {
    const { label, address, lat, lon } = req.body;
    if (!label || !address) {
      return error(res, 'Label and address are required', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { savedAddresses: { label, address, lat, lon } } },
      { new: true }
    );

    if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');

    success(res, user, 'Address saved successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/users/me/addresses/:addressId
 * @desc    Delete a saved address
 * @access  Private (User)
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { savedAddresses: { _id: req.params.addressId } } },
      { new: true }
    );

    if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');

    success(res, user, 'Address deleted successfully');
  } catch (err) {
    next(err);
  }
};


/**
 * @route   GET /api/users/me/addresses
 * @desc    Get user's saved addresses
 * @access  Private (User)
 */
export const getMyAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('savedAddresses');
    if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');
    
    success(res, user.savedAddresses || [], 'Addresses retrieved successfully');
  } catch (err) {
    next(err);
  }
};


/**
 * @route   GET /api/users
 * @desc    Get all users (paginated, searchable)
 * @access  Private (Admin)
 */
export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;

    const users = await User.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Users retrieved successfully',
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/users/:id
 * @desc    Get user details by ID
 * @access  Private (Admin)
 */
export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');
    
    // Fetch all requirements for the user and populate acceptedBid to compute stats
    const requirements = await Requirement.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate('acceptedBid');
    
    const totalRequests = requirements.length;
    const successfulHires = requirements.filter(r => ['accepted', 'completed'].includes(r.status)).length;
    
    const revenue = requirements.reduce((sum, r) => {
      if (['accepted', 'completed'].includes(r.status) && r.acceptedBid) {
        return sum + (r.acceptedBid.amount || 0);
      }
      return sum;
    }, 0);
    
    const recentActivity = requirements.slice(0, 5).map(r => ({
      id: r._id,
      serviceType: r.serviceType,
      pickup: r.pickup.address,
      drops: r.drops.map(d => d.address).join(', '),
      date: r.date,
      amount: r.acceptedBid ? r.acceptedBid.amount : 0,
      status: r.status,
      createdAt: r.createdAt
    }));
    
    const userObj = user.toObject();
    userObj.totalRequests = totalRequests;
    userObj.successfulHires = successfulHires;
    userObj.revenue = revenue;
    userObj.recentActivity = recentActivity;
    
    success(res, userObj, 'User retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Toggle user status (Active/Blocked)
 * @access  Private (Admin)
 */
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Active', 'Blocked'].includes(status)) {
      return error(res, 'Invalid status', 400, 'VALIDATION_ERROR');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');
    
    success(res, user, `User status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};
