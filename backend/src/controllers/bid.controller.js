import Bid from '../models/Bid.model.js';
import Requirement from '../models/Requirement.model.js';
import { success, error } from '../utils/response.js';

/**
 * @route   POST /api/leads/:id/bid
 * @desc    Vendor place a bid on a lead
 * @access  Private (Vendor)
 */
export const placeBid = async (req, res, next) => {
  try {
    const { amount, notes } = req.body;
    const requirementId = req.params.id;

    // Check if requirement exists and is open
    const requirement = await Requirement.findById(requirementId);
    if (!requirement) return error(res, 'Requirement not found', 404, 'NOT_FOUND');
    if (['accepted', 'completed', 'cancelled'].includes(requirement.status)) {
      return error(res, 'Requirement is no longer open for bidding', 400, 'CLOSED');
    }

    // Check for existing bid
    const existingBid = await Bid.findOne({ requirement: requirementId, vendor: req.user.id });
    if (existingBid) {
      return error(res, 'You have already placed a bid on this lead', 400, 'ALREADY_BID');
    }

    const bid = await Bid.create({
      requirement: requirementId,
      vendor: req.user.id,
      amount,
      notes,
    });

    // Update requirement status to 'bidding' if it was 'pending'
    if (requirement.status === 'pending') {
      requirement.status = 'bidding';
      await requirement.save();
    }

    success(res, bid, 'Bid placed successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/requirements/:id/bids
 * @desc    Get all bids for a specific requirement
 * @access  Private (Owner/Admin)
 */
export const getBidsForRequirement = async (req, res, next) => {
  try {
    const requirement = await Requirement.findById(req.params.id);
    if (!requirement) return error(res, 'Requirement not found', 404, 'NOT_FOUND');

    // Only owner or admin can see all bids
    if (requirement.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }

    const bids = await Bid.find({ requirement: req.params.id })
      .populate('vendor', 'name phone rating vehicleType')
      .sort({ amount: 1 });

    success(res, bids, 'Bids retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/bids/:id/accept
 * @desc    User accepts a bid, locking the lead
 * @access  Private (User/Owner)
 */
export const acceptBid = async (req, res, next) => {
  try {
    const bid = await Bid.findById(req.params.id).populate('requirement');
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    const requirement = bid.requirement;
    if (requirement.user.toString() !== req.user.id) {
      return error(res, 'Access denied', 403, 'FORBIDDEN');
    }

    if (requirement.status === 'accepted') {
      return error(res, 'Requirement already has an accepted bid', 400, 'ALREADY_ACCEPTED');
    }

    // Accept this bid
    bid.status = 'accepted';
    await bid.save();

    // Update requirement
    requirement.status = 'accepted';
    requirement.acceptedBid = bid._id;
    await requirement.save();

    // Reject all other bids for this requirement
    await Bid.updateMany(
      { requirement: requirement._id, _id: { $ne: bid._id } },
      { $set: { status: 'rejected' } }
    );

    success(res, bid, 'Bid accepted and requirement locked');
  } catch (err) {
    next(err);
  }
};
