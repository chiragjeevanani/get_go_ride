import Vendor from '../models/Vendor.model.js';
import { success, error } from '../utils/response.js';

// --- Vendor Facing ---

/**
 * @route   GET /api/vendors/me
 * @desc    Get current vendor profile
 * @access  Private (Vendor)
 */
export const getMyProfile = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.user.id);
    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');
    
    success(res, vendor, 'Profile retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/vendors/me
 * @desc    Update vendor profile
 * @access  Private (Vendor)
 */
export const updateMyProfile = async (req, res, next) => {
  try {
    const { name, nativeCity, profileImage, location } = req.body;
    
    const updatedVendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      { $set: { name, nativeCity, profileImage, location } },
      { new: true, runValidators: true }
    );

    if (!updatedVendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');

    success(res, updatedVendor, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/vendors/me/onboarding
 * @desc    Submit onboarding wizard data
 * @access  Private (Vendor)
 */
export const submitOnboarding = async (req, res, next) => {
  try {
    const { vehicleType, vehicleRegNumber, vehicleCapacity, serviceCategories, operatingAreas, location } = req.body;
    
    const vendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      { 
        $set: { 
          vehicleType, 
          vehicleRegNumber, 
          vehicleCapacity, 
          serviceCategories, 
          operatingAreas, 
          location,
          onboardingComplete: true
        } 
      },
      { new: true, runValidators: true }
    );

    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');

    success(res, vendor, 'Onboarding completed successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/vendors/me/documents
 * @desc    Upload document via Multer
 * @access  Private (Vendor)
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return error(res, 'No file uploaded', 400, 'VALIDATION_ERROR');
    }

    const { title } = req.body;
    if (!title) {
      return error(res, 'Document title is required', 400, 'VALIDATION_ERROR');
    }

    const newDoc = {
      title,
      fileUrl: req.file.path,
      status: 'Pending',
      uploadedAt: new Date()
    };

    const vendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      { $push: { documents: newDoc } },
      { new: true }
    );

    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');

    success(res, vendor, 'Document uploaded successfully', 201);
  } catch (err) {
    next(err);
  }
};


// --- Admin Facing ---

/**
 * @route   GET /api/vendors
 * @desc    Get all vendors (paginated, searchable)
 * @access  Private (Admin)
 */
export const getAllVendors = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const isVerified = req.query.isVerified;

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { vehicleRegNumber: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';

    const vendors = await Vendor.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Vendor.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Vendors retrieved successfully',
      data: vendors,
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
 * @route   GET /api/vendors/:id
 * @desc    Get vendor details by ID
 * @access  Private (Admin)
 */
export const getVendorById = async (req, res, next) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');
    
    success(res, vendor, 'Vendor retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/vendors/:id/verify
 * @desc    Approve/Reject vendor (also updates overall status)
 * @access  Private (Admin)
 */
export const verifyVendor = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Verified', 'Rejected', 'Suspended'].includes(status)) {
      return error(res, 'Invalid status', 400, 'VALIDATION_ERROR');
    }

    const isVerified = status === 'Verified';

    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { $set: { status, isVerified } },
      { new: true }
    );

    if (!vendor) return error(res, 'Vendor not found', 404, 'NOT_FOUND');
    
    success(res, vendor, `Vendor status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/vendors/:id/document/:docId
 * @desc    Approve/Reject individual document
 * @access  Private (Admin)
 */
export const verifyDocument = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Verified', 'Rejected'].includes(status)) {
      return error(res, 'Invalid status', 400, 'VALIDATION_ERROR');
    }

    const vendor = await Vendor.findOneAndUpdate(
      { _id: req.params.id, 'documents._id': req.params.docId },
      { $set: { 'documents.$.status': status } },
      { new: true }
    );

    if (!vendor) return error(res, 'Vendor or document not found', 404, 'NOT_FOUND');
    
    success(res, vendor, `Document status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};
