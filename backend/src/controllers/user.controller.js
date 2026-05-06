import User from '../models/User.model.js';
import SystemSetting from '../models/SystemSetting.model.js';
import { success, error } from '../utils/response.js';

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
    const user = await User.findById(req.user.id).select('wallet');
    if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');
    
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
    
    success(res, user, 'User retrieved successfully');
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
