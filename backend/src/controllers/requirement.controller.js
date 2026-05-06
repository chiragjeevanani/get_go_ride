import Requirement from '../models/Requirement.model.js';
import Vendor from '../models/Vendor.model.js';
import { success, error } from '../utils/response.js';

/**
 * @route   POST /api/requirements
 * @desc    Post a new logistics requirement
 * @access  Private (User)
 */
export const createRequirement = async (req, res, next) => {
  try {
    const { serviceType, vehicleType, pickup, drops, items, weight, date, time, notes } = req.body;

    const requirement = await Requirement.create({
      user: req.user.id,
      serviceType,
      vehicleType,
      pickup,
      drops,
      items,
      weight,
      date,
      time,
      notes,
    });

    success(res, requirement, 'Requirement posted successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/requirements/my
 * @desc    Get current user's posted requirements
 * @access  Private (User)
 */
export const getMyRequirements = async (req, res, next) => {
  try {
    const requirements = await Requirement.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('acceptedBid');
    
    success(res, requirements, 'Your requirements retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/leads
 * @desc    Get leads matching vendor's categories (for drivers)
 * @access  Private (Vendor)
 */
export const getAvailableLeads = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');

    // Filter leads by vendor's service categories and status 'pending' or 'bidding'
    const leads = await Requirement.find({
      serviceType: { $in: vendor.serviceCategories },
      status: { $in: ['pending', 'bidding'] },
      // Exclude requirements where this vendor already bid? 
      // For now, list all available
    }).sort({ createdAt: -1 });

    success(res, leads, 'Available leads retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/requirements/:id
 * @desc    Get full details of a requirement
 * @access  Private
 */
export const getRequirementDetails = async (req, res, next) => {
  try {
    const requirement = await Requirement.findById(req.params.id)
      .populate('user', 'name phone')
      .populate('acceptedBid');

    if (!requirement) return error(res, 'Requirement not found', 404, 'NOT_FOUND');

    success(res, requirement, 'Requirement details retrieved');
  } catch (err) {
    next(err);
  }
};

// --- Admin Facing ---

/**
 * @route   GET /api/requirements
 * @desc    Get all requirements (admin)
 * @access  Private (Admin)
 */
export const getAllRequirements = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const status = req.query.status || '';

    const query = {};
    if (status) query.status = status;

    const requirements = await Requirement.find(query)
      .populate('user', 'name phone')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Requirement.countDocuments(query);

    res.status(200).json({
      success: true,
      data: requirements,
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
 * @route   PATCH /api/requirements/:id/status
 * @desc    Update requirement status (admin)
 * @access  Private (Admin)
 */
export const updateRequirementStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    const requirement = await Requirement.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );

    if (!requirement) return error(res, 'Requirement not found', 404, 'NOT_FOUND');

    success(res, requirement, `Status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};
