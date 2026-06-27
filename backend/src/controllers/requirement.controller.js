import Requirement from '../models/Requirement.model.js';
import Vendor from '../models/Vendor.model.js';
import Bid from '../models/Bid.model.js';
import { success, error } from '../utils/response.js';
import { getRevenueModelConfig } from './settings.controller.js';
import { sendNotificationToUser, sendNotificationToMultipleUsers, sendNotificationToAdmins } from '../utils/pushNotificationHelper.js';

/**
 * @route   POST /api/requirements
 * @desc    Post a new logistics requirement
 * @access  Private (User)
 */
export const createRequirement = async (req, res, next) => {
  try {
    const { serviceType, vehicleType, pickup, drops, items, weight, date, time, notes, price } = req.body;

    if (!date) {
      return error(res, 'Booking date is required', 400, 'MISSING_DATE');
    }

    // Ensure date/time are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const reqDate = new Date(date);
    reqDate.setHours(0, 0, 0, 0);

    if (reqDate < today) {
      return error(res, 'Booking date cannot be in the past', 400, 'INVALID_DATE');
    }

    if (reqDate.getTime() === today.getTime()) {
      if (!time) {
        return error(res, 'Booking time is required', 400, 'MISSING_TIME');
      }
      
      // If booking date is today, check if time has already passed
      // Add a 5-minute grace period for network latency/clock skew
      const [reqHours, reqMinutes] = time.split(':').map(Number);
      const now = new Date();
      now.setMinutes(now.getMinutes() - 5); // 5 min grace period
      
      if (reqHours < now.getHours() || (reqHours === now.getHours() && reqMinutes < now.getMinutes())) {
        return error(res, 'Booking time cannot be in the past', 400, 'INVALID_TIME');
      }
    }

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
      price: price ? Number(price) : 1733,
    });

    // Send push notifications asynchronously (do not block client response)
    (async () => {
      try {
        // 1. Notify Customer
        await sendNotificationToUser(req.user.id, 'user', {
          title: 'Booking Created 📦',
          body: `Your load request for ${serviceType} has been posted successfully.`,
          type: 'booking_created',
          entityId: requirement._id.toString(),
          deepLink: '/user/requests',
          priority: 'normal'
        });

        // 2. Notify Admin
        await sendNotificationToAdmins({
          title: 'New Booking Posted 🔔',
          body: `A new load request for ${serviceType} has been posted by customer.`,
          type: 'new_booking',
          entityId: requirement._id.toString(),
          deepLink: '/admin/deals',
          priority: 'normal'
        });

        // 3. Notify Drivers matching this service category
        const matchingVendors = await Vendor.find({ serviceCategories: serviceType, status: 'Verified' });
        if (matchingVendors.length > 0) {
          const vendorIds = matchingVendors.map(v => v._id.toString());
          await sendNotificationToMultipleUsers(vendorIds, 'vendor', {
            title: 'New Load Request Available 🚚',
            body: `New load request for ${serviceType} is available in your operating area. Tap to bid.`,
            type: 'new_load_request',
            entityId: requirement._id.toString(),
            deepLink: '/driver/leads',
            priority: 'high'
          });
        }
      } catch (fcmErr) {
        console.error('[FCM] Error broadcasting requirement creation:', fcmErr.message);
      }
    })();

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
    
    // Add bid count for each requirement
    const reqsWithBidCount = await Promise.all(
      requirements.map(async (r) => {
        const bidCount = await Bid.countDocuments({ requirement: r._id });
        return { ...r.toObject(), bidCount };
      })
    );
    
    success(res, reqsWithBidCount, 'Your requirements retrieved');
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

    // Subscription gate: verify active subscription
    const config = await getRevenueModelConfig();
    const isSubscriptionRequired = config.model === 'subscription' || config.model === 'subscription_commission';

    if (isSubscriptionRequired && vendor.subscriptionStatus !== 'Active') {
      return error(res, 'An active subscription plan is required to browse leads.', 403, 'ACTIVE_SUBSCRIPTION_REQUIRED');
    }

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
      .populate({
        path: 'acceptedBid',
        populate: {
          path: 'vendor',
          select: 'name phone rating businessName isVerified profileImage'
        }
      });

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

    // Trigger cancel notifications if status is updated to cancelled
    if (status === 'cancelled') {
      (async () => {
        try {
          // 1. Notify Customer
          await sendNotificationToUser(requirement.user.toString(), 'user', {
            title: 'Booking Cancelled ❌',
            body: `Your booking for ${requirement.serviceType} has been cancelled.`,
            type: 'booking_cancelled',
            entityId: requirement._id.toString(),
            deepLink: '/user/requests',
            priority: 'high'
          });

          // 2. Notify Driver (if a bid was accepted)
          const acceptedBid = await Bid.findOne({ requirement: requirement._id, status: 'accepted' });
          if (acceptedBid && acceptedBid.vendor) {
            await sendNotificationToUser(acceptedBid.vendor.toString(), 'vendor', {
              title: 'Booking Cancelled ❌',
              body: `The booking for ${requirement.serviceType} (Gig ID: ${acceptedBid._id.toString().slice(-8)}) has been cancelled by the system.`,
              type: 'booking_cancelled',
              entityId: requirement._id.toString(),
              deepLink: '/driver/gigs',
              priority: 'high'
            });
          }
        } catch (fcmErr) {
          console.error('[FCM] Error sending cancellation notification:', fcmErr.message);
        }
      })();
    }

    success(res, requirement, `Status updated to ${status}`);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   DELETE /api/requirements/:id
 * @desc    Delete a requirement (owner only, if not accepted)
 * @access  Private (User/Owner)
 */
export const deleteRequirement = async (req, res, next) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) return error(res, 'Requirement not found', 404, 'NOT_FOUND');

    // Only owner can delete their requirement
    if (requirement.user.toString() !== req.user.id) {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }

    // Cannot delete if already accepted
    if (requirement.status === 'accepted') {
      return error(res, 'Cannot delete a requirement with an accepted bid', 400, 'CANNOT_DELETE');
    }

    // Delete associated bids first
    await Bid.deleteMany({ requirement: req.params.id });

    // Delete the requirement
    await Requirement.deleteOne({ _id: req.params.id });

    success(res, null, 'Requirement deleted successfully');
  } catch (err) {
    next(err);
  }
};
