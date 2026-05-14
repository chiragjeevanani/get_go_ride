import Bid from '../models/Bid.model.js';
import Requirement from '../models/Requirement.model.js';
import Message from '../models/Message.model.js';
import User from '../models/User.model.js';
import Vendor from '../models/Vendor.model.js';
import SystemSetting from '../models/SystemSetting.model.js';
import { success, error } from '../utils/response.js';
import { getIO } from '../config/socket.js';
import razorpay from '../config/razorpay.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

// Helper to resolve bid from either bidId, requirementId (as bidId fallback) OR requirementId + vendorId
const resolveBid = async (params, user) => {
  const bidId = params.bidId?.trim();
  const requestId = params.requestId?.trim();
  const vendorId = params.vendorId?.trim();

  let bid = null;

  try {
    // 1. If we have a direct Bid ID (as bidId)
    if (bidId && mongoose.Types.ObjectId.isValid(bidId)) {
      const bId = new mongoose.Types.ObjectId(bidId);
      
      // Try direct Bid lookup
      bid = await Bid.findById(bId)
        .populate({
          path: 'requirement',
          populate: { path: 'user', select: 'name phone profileImage' }
        })
        .populate('vendor', 'name phone profileImage rating businessName isVerified');

      // 2. Fallback: If not found, check if bidId is actually a Requirement ID
      if (!bid && user) {
        const uId = new mongoose.Types.ObjectId(user.id || user._id);
        const query = user.role === 'vendor'
          ? { requirement: bId, vendor: uId }
          : (user.role === 'admin' ? { _id: bId } : { requirement: bId });

        bid = await Bid.findOne(query)
          .populate({
            path: 'requirement',
            populate: { path: 'user', select: 'name phone profileImage' }
          })
          .populate('vendor', 'name phone profileImage rating businessName isVerified');
      }
    } 
    
    // 3. Fallback: Try finding by composite ID (requestId + vendorId)
    if (!bid && requestId && vendorId && (mongoose.Types.ObjectId.isValid(requestId) || requestId === 'current') && mongoose.Types.ObjectId.isValid(vendorId)) {
      let rId;
      if (requestId === 'current') {
        // Find latest active requirement for this user
        const latestReq = await Requirement.findOne({ user: user.id || user._id })
          .sort({ createdAt: -1 });
        if (!latestReq) return null;
        rId = latestReq._id;
      } else {
        rId = new mongoose.Types.ObjectId(requestId);
      }

      const vId = new mongoose.Types.ObjectId(vendorId);
      
      bid = await Bid.findOne({ requirement: rId, vendor: vId })
        .populate({
          path: 'requirement',
          populate: { path: 'user', select: 'name phone profileImage' }
        })
        .populate('vendor', 'name phone profileImage rating businessName isVerified');
    }
  } catch (err) {
    console.error('ResolveBid fatal error:', err);
    return null;
  }

  return bid;
};

/**
 * Helper function to get revenue model configuration
 */
const getRevenueModelConfig = async () => {
  const revenueModel = await SystemSetting.findOne({ key: 'revenueModel' });
  const commissionRate = await SystemSetting.findOne({ key: 'commissionRate' });

  return {
    model: revenueModel?.value || 'subscription',
    rate: commissionRate?.value || 10
  };
};

/**
 * Helper function to calculate platform commission based on revenue model
 */
const calculateCommission = async (amount) => {
  const config = await getRevenueModelConfig();

  // No commission in subscription-only mode
  if (config.model === 'subscription') {
    return { platformCommission: 0, vendorEarning: amount, rate: 0 };
  }

  // Calculate commission for commission-based modes
  const rate = config.model === 'commission' ? config.rate : config.rate;
  const platformCommission = Math.round(amount * (rate / 100));
  const vendorEarning = amount - platformCommission;

  return { platformCommission, vendorEarning, rate };
};

/**
 * Helper to execute actual bid acceptance and lock requirement
 * Includes commission calculation based on revenue model
 */
const executeBidAcceptance = async (bid, requirement, userId, refId = '', paymentMethod = 'Wallet') => {
  // Calculate commission based on current revenue model
  const { platformCommission, vendorEarning, rate } = await calculateCommission(bid.amount);

  // Accept this bid
  bid.status = 'accepted';
  bid.platformCommission = platformCommission;
  bid.vendorEarning = vendorEarning;
  await bid.save();

  // Update requirement to locked status
  requirement.status = 'accepted';
  requirement.acceptedBid = bid._id;
  requirement.platformCommission = platformCommission;
  await requirement.save();

  // Update vendor earnings if commission is being deducted
  if (platformCommission > 0 && bid.vendor) {
    await Vendor.findByIdAndUpdate(bid.vendor._id, {
      $inc: {
        totalEarnings: vendorEarning,
        platformDues: platformCommission
      }
    });
  }

  // Reject all other bids on this requirement
  await Bid.updateMany(
    { requirement: requirement._id, _id: { $ne: bid._id } },
    { $set: { status: 'rejected' } }
  );

  // Create contract acceptance message with payment details
  const refText = refId ? ` (Payment Ref: ${refId})` : '';
  const commissionNote = platformCommission > 0 ? ` (Platform: ₹${platformCommission})` : '';
  const msg = await Message.create({
    requirement: requirement._id,
    bid: bid._id,
    sender: userId,
    senderModel: 'User',
    senderRole: 'user',
    text: `🤝 DEAL ACCEPTED & PAID! FINALIZED PRICE AT ₹${bid.amount}${refText}${commissionNote}.`,
    type: 'text',
  });

  // Realtime broadcast via Socket.io
  try {
    const io = getIO();
    io.to(bid._id.toString()).emit('receive_message', msg);
    io.to(bid._id.toString()).emit('deal_accepted', { bidId: bid._id });
  } catch (wsErr) {
    console.error('Socket broadcast failed:', wsErr.message);
  }

  // Send automated contact and address cards
  const customer = await User.findById(userId);
  if (customer) {
    await sendAutomatedAcceptanceMessages(bid, requirement, customer);
  }

  return msg;
};

/**
 * Helper to send automated contact and journey cards in chat
 */
const sendAutomatedAcceptanceMessages = async (bid, requirement, customer) => {
  try {
    const io = getIO();
    
    // 1. Contact Information Message
    const contactMsg = await Message.create({
      requirement: requirement._id,
      bid: bid._id,
      sender: customer._id,
      senderModel: 'User',
      senderRole: 'user',
      text: `Customer Contact: ${customer.name || 'User'} (${customer.phone})`,
      type: 'contact',
      metadata: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email
      }
    });
    io.to(bid._id.toString()).emit('receive_message', contactMsg);

    // 2. Journey Details (Address Card)
    const journeyMsg = await Message.create({
      requirement: requirement._id,
      bid: bid._id,
      sender: customer._id,
      senderModel: 'User',
      senderRole: 'user',
      text: `Pickup: ${requirement.pickup.address} | Drop: ${requirement.drops?.[0]?.address || 'N/A'}`,
      type: 'card',
      metadata: {
        pickup: requirement.pickup,
        drops: requirement.drops,
        date: requirement.date,
        time: requirement.time
      }
    });
    io.to(bid._id.toString()).emit('receive_message', journeyMsg);
  } catch (err) {
    console.error('Failed to send automated acceptance messages:', err);
  }
};

/**
 * @route   GET /api/chats/user/active
 * @desc    Fetch active chats/negotiations for current user (customer)
 * @access  Private (User)
 */
export const getUserActiveChats = async (req, res, next) => {
  try {
    const myRequirements = await Requirement.find({ user: req.user.id });
    const reqIds = myRequirements.map(r => r._id);

    // Find all bids placed on user's requirements
    const bids = await Bid.find({ requirement: { $in: reqIds } })
      .populate('vendor', 'name phone profileImage rating isVerified businessName')
      .populate('requirement', 'serviceType status requirementId createdAt')
      .sort({ updatedAt: -1 });

    const chats = await Promise.all(
      bids.map(async (bid) => {
        const lastMsg = await Message.findOne({ bid: bid._id }).sort({ createdAt: -1 });
        return {
          id: bid._id,
          vendor: bid.vendor,
          requirement: bid.requirement,
          amount: bid.amount,
          status: bid.status,
          lastMessage: lastMsg || {
            text: bid.notes || `Proposal received: ₹${bid.amount}`,
            createdAt: bid.createdAt,
          },
        };
      })
    );

    success(res, chats, 'User active chats retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/chats/driver/active
 * @desc    Fetch active chats/negotiations for current driver (vendor)
 * @access  Private (Vendor)
 */
export const getDriverActiveChats = async (req, res, next) => {
  try {
    // Find all bids placed by this driver/vendor
    const bids = await Bid.find({ vendor: req.user.id })
      .populate({
        path: 'requirement',
        populate: { path: 'user', select: 'name phone profileImage' }
      })
      .sort({ updatedAt: -1 });

    const chats = await Promise.all(
      bids.map(async (bid) => {
        const lastMsg = await Message.findOne({ bid: bid._id }).sort({ createdAt: -1 });
        return {
          id: bid._id,
          requirement: bid.requirement,
          amount: bid.amount,
          status: bid.status,
          lastMessage: lastMsg || {
            text: bid.notes || `Proposal sent: ₹${bid.amount}`,
            createdAt: bid.createdAt,
          },
        };
      })
    );

    success(res, chats, 'Driver active chats retrieved');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   GET /api/chats/:bidId/messages or /api/chats/messages/:requestId/:vendorId
 * @desc    Get message history for a specific bid/negotiation room
 * @access  Private (Owner/Driver)
 */
export const getMessages = async (req, res, next) => {
  try {
    const bid = await resolveBid(req.params, req.user);
        if (!bid) return error(res, `Negotiation/Bid not found for ID: ${req.params.bidId} (Role: ${req.user.role}, UID: ${req.user.id})`, 404, 'NOT_FOUND');

    // Secure checking
    const requirementUser = bid.requirement.user?._id?.toString() || bid.requirement.user?.toString();
    const vendorUser = bid.vendor?._id?.toString() || bid.vendor?.toString();

    if (req.user.role !== 'admin') {
      if (req.user.role === 'user' && requirementUser !== req.user.id) {
        return error(res, 'Access denied', 403, 'FORBIDDEN');
      }
      if (req.user.role === 'vendor' && vendorUser !== req.user.id) {
        return error(res, 'Access denied', 403, 'FORBIDDEN');
      }
    }

    const messages = await Message.find({ bid: bid._id })
      .sort({ createdAt: 1 });

    success(res, { messages, bid }, 'Messages retrieved successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/chats/:bidId/messages or /api/chats/messages/:requestId/:vendorId
 * @desc    Send a standard text or image message
 * @access  Private (User/Vendor)
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { text, type, image } = req.body;

    const bid = await resolveBid(req.params, req.user);
        if (!bid) return error(res, `Negotiation/Bid not found for ID: ${req.params.bidId} (Role: ${req.user.role}, UID: ${req.user.id})`, 404, 'NOT_FOUND');

    let senderRole = '';
    let senderModel = '';

    const requirementUser = bid.requirement.user?._id?.toString() || bid.requirement.user?.toString();
    const vendorUser = bid.vendor?._id?.toString() || bid.vendor?.toString();

    if (req.user.role === 'user') {
      if (requirementUser !== req.user.id) {
        return error(res, 'Access denied', 403, 'FORBIDDEN');
      }
      senderRole = 'user';
      senderModel = 'User';
    } else if (req.user.role === 'vendor') {
      if (vendorUser !== req.user.id) {
        return error(res, 'Access denied', 403, 'FORBIDDEN');
      }
      senderRole = 'vendor';
      senderModel = 'Vendor';
    }

    const msg = await Message.create({
      requirement: bid.requirement._id,
      bid: bid._id,
      sender: req.user.id,
      senderModel,
      senderRole,
      text,
      type: type || 'text',
      image: image || '',
    });

    // Realtime broadcast via Socket.io
    try {
      const io = getIO();
      io.to(bid._id.toString()).emit('receive_message', msg);
    } catch (wsErr) {
      console.error('Socket broadcast failed:', wsErr.message);
    }

    success(res, msg, 'Message sent successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/chats/:bidId/typing
 * @desc    Emit typing indicator to the other party
 * @access  Private (User/Vendor)
 */
export const sendTypingIndicator = async (req, res, next) => {
  try {
    const bid = await resolveBid(req.params, req.user);
        if (!bid) return error(res, `Negotiation/Bid not found for ID: ${req.params.bidId} (Role: ${req.user.role}, UID: ${req.user.id})`, 404, 'NOT_FOUND');

    const isUser = req.user.role === 'user';
    const typingData = {
      bidId: bid._id.toString(),
      sender: req.user.id,
      senderRole: isUser ? 'user' : 'vendor',
      isTyping: true,
    };

    // Broadcast typing indicator via Socket.io
    try {
      const io = getIO();
      io.to(bid._id.toString()).emit('user_typing', typingData);
    } catch (wsErr) {
      console.error('Socket typing broadcast failed:', wsErr.message);
    }

    success(res, typingData, 'Typing indicator sent');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   PATCH /api/chats/:bidId/read
 * @desc    Mark messages as read
 * @access  Private (User/Vendor)
 */
export const markMessagesAsRead = async (req, res, next) => {
  try {
    const bid = await resolveBid(req.params, req.user);
        if (!bid) return error(res, `Negotiation/Bid not found for ID: ${req.params.bidId} (Role: ${req.user.role}, UID: ${req.user.id})`, 404, 'NOT_FOUND');

    // Update all unread messages for this bid (that are not from current user)
    await Message.updateMany(
      {
        bid: bid._id,
        sender: { $ne: req.user.id },
        status: 'sent'
      },
      {
        $set: {
          status: 'read',
          readAt: new Date()
        }
      }
    );

    // Broadcast read receipt via Socket.io
    try {
      const io = getIO();
      io.to(bid._id.toString()).emit('messages_read', {
        bidId: bid._id.toString(),
        readBy: req.user.id
      });
    } catch (wsErr) {
      console.error('Socket read receipt broadcast failed:', wsErr.message);
    }

    success(res, null, 'Messages marked as read');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/chats/:bidId/offer or /api/chats/offer/:requestId/:vendorId
 * @desc    Submit a formal price proposal/counter-offer (updates active Bid state)
 * @access  Private (User/Vendor)
 */
export const sendOffer = async (req, res, next) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      return error(res, 'Please provide a valid price proposal amount', 400, 'INVALID_AMOUNT');
    }

    const bid = await resolveBid(req.params, req.user);
        if (!bid) return error(res, `Negotiation/Bid not found for ID: ${req.params.bidId} (Role: ${req.user.role}, UID: ${req.user.id})`, 404, 'NOT_FOUND');

    let senderRole = '';
    let senderModel = '';
    let text = '';

    const requirementUser = bid.requirement.user?._id?.toString() || bid.requirement.user?.toString();
    const vendorUser = bid.vendor?._id?.toString() || bid.vendor?.toString();

    if (req.user.role === 'user') {
      if (requirementUser !== req.user.id) {
        return error(res, 'Access denied', 403, 'FORBIDDEN');
      }
      senderRole = 'user';
      senderModel = 'User';
      text = `Counter Offer: ₹${amount}`;
    } else if (req.user.role === 'vendor') {
      if (vendorUser !== req.user.id) {
        return error(res, 'Access denied', 403, 'FORBIDDEN');
      }
      senderRole = 'vendor';
      senderModel = 'Vendor';
      text = `Proposal Sent: ₹${amount}`;
    }

    // Update active bid amount in database (Option B: Active Bid Syncing)
    bid.amount = amount;
    await bid.save();

    // Create a message of type 'offer'
    const msg = await Message.create({
      requirement: bid.requirement._id,
      bid: bid._id,
      sender: req.user.id,
      senderModel,
      senderRole,
      text,
      type: 'offer',
      price: amount,
    });

    // Realtime broadcast via Socket.io
    try {
      const io = getIO();
      io.to(bid._id.toString()).emit('receive_message', msg);
      io.to(bid._id.toString()).emit('bid_updated', { bidId: bid._id, amount });
    } catch (wsErr) {
      console.error('Socket broadcast failed:', wsErr.message);
    }

    success(res, msg, 'Offer submitted and updated successfully', 201);
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/chats/:bidId/accept or /api/chats/accept/:requestId/:vendorId
 * @desc    Accept negotiation and lock requirement (triggers contract finalization)
 * @access  Private (User/Owner of Requirement)
 */
export const acceptDeal = async (req, res, next) => {
  try {
    const bid = await resolveBid(req.params, req.user);
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    const requirement = bid.requirement;
    const requirementUser = requirement.user?._id?.toString() || requirement.user?.toString();
    if (requirementUser !== req.user.id) {
      return error(res, 'Access denied. Only requirement owner can accept deals', 403, 'FORBIDDEN');
    }

    if (requirement.status === 'accepted') {
      return error(res, 'This requirement already has an accepted bid', 400, 'ALREADY_ACCEPTED');
    }

    // Accept this bid
    bid.status = 'accepted';
    await bid.save();

    // Update requirement to locked status
    requirement.status = 'accepted';
    requirement.acceptedBid = bid._id;
    await requirement.save();

    // Reject all other bids on this requirement
    await Bid.updateMany(
      { requirement: requirement._id, _id: { $ne: bid._id } },
      { $set: { status: 'rejected' } }
    );

    // Create contract acceptance message
    const msg = await Message.create({
      requirement: requirement._id,
      bid: bid._id,
      sender: req.user.id,
      senderModel: 'User',
      senderRole: 'user',
      text: `🤝 DEAL ACCEPTED! FINALIZED PRICE AT ₹${bid.amount}.`,
      type: 'text',
    });

    // Send automated contact and address cards
    const customer = await User.findById(req.user.id);
    if (customer) {
      await sendAutomatedAcceptanceMessages(bid, requirement, customer);
    }

    // Realtime broadcast via Socket.io
    try {
      const io = getIO();
      io.to(bid._id.toString()).emit('receive_message', msg);
      io.to(bid._id.toString()).emit('deal_accepted', { bidId: bid._id });
    } catch (wsErr) {
      console.error('Socket broadcast failed:', wsErr.message);
    }

    success(res, { bid, message: msg }, 'Deal accepted and requirement locked successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/chats/accept/:requestId/:vendorId/pay-wallet or /api/chats/:bidId/accept/pay-wallet
 * @desc    Accept deal and pay using wallet balance
 * @access  Private (User)
 */
export const acceptDealWithWallet = async (req, res, next) => {
  try {
    const bid = await resolveBid(req.params, req.user);
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    const requirement = bid.requirement;
    const requirementUser = requirement.user?._id?.toString() || requirement.user?.toString();
    if (requirementUser !== req.user.id) {
      return error(res, 'Access denied. Only requirement owner can accept deals', 403, 'FORBIDDEN');
    }

    if (requirement.status === 'accepted') {
      const acceptedBidId = requirement.acceptedBid?._id?.toString() || requirement.acceptedBid?.toString();
      if (acceptedBidId !== bid._id.toString()) {
        return error(res, 'This requirement already has another accepted bid', 400, 'ALREADY_ACCEPTED');
      }
      // If it's the same bid, we allow proceeding to payment finalization
    }

    // Check wallet balance
    const user = await User.findById(req.user.id);
    if (!user) return error(res, 'User not found', 404, 'NOT_FOUND');

    const amountToDeduct = bid.amount;
    if ((user.wallet?.balance || 0) < amountToDeduct) {
      return error(res, 'Insufficient wallet balance', 400, 'INSUFFICIENT_BALANCE');
    }

    // Deduct balance and log transaction
    user.wallet.balance = (user.wallet.balance || 0) - amountToDeduct;
    user.wallet.transactions.push({
      type: 'debit',
      amount: amountToDeduct,
      description: `Payment for vehicle hire (Bid ref: ${bid._id})`,
      date: new Date()
    });
    await user.save();

    const msg = await executeBidAcceptance(bid, requirement, req.user.id, 'Wallet Balance');

    success(res, { bid, message: msg }, 'Payment processed from wallet and deal accepted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/chats/accept/:requestId/:vendorId/create-order or /api/chats/:bidId/accept/create-order
 * @desc    Create Razorpay Order for direct bid payment
 * @access  Private (User)
 */
export const createAcceptDealOrder = async (req, res, next) => {
  try {
    const bid = await resolveBid(req.params, req.user);
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    const requirement = bid.requirement;
    const requirementUser = requirement.user?._id?.toString() || requirement.user?.toString();
    if (requirementUser !== req.user.id) {
      return error(res, 'Access denied. Only requirement owner can accept deals', 403, 'FORBIDDEN');
    }

    if (requirement.status === 'accepted') {
      const acceptedBidId = requirement.acceptedBid?._id?.toString() || requirement.acceptedBid?.toString();
      if (acceptedBidId !== bid._id.toString()) {
        return error(res, 'This requirement already has another accepted bid', 400, 'ALREADY_ACCEPTED');
      }
    }

    const options = {
      amount: Math.round(bid.amount * 100), // amount in paise
      currency: 'INR',
      receipt: `dp_${bid._id.toString().slice(-12)}_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    success(res, order, 'Razorpay deal acceptance order created successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/chats/accept/:requestId/:vendorId/verify-payment or /api/chats/:bidId/accept/verify-payment
 * @desc    Verify Razorpay payment and accept/finalize deal
 * @access  Private (User)
 */
export const verifyAcceptDealPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return error(res, 'All payment details are required', 400, 'VALIDATION_ERROR');
    }

    const bid = await resolveBid(req.params, req.user);
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    const requirement = bid.requirement;
    const requirementUser = requirement.user?._id?.toString() || requirement.user?.toString();
    if (requirementUser !== req.user.id) {
      return error(res, 'Access denied. Only requirement owner can accept deals', 403, 'FORBIDDEN');
    }

    if (requirement.status === 'accepted') {
      const acceptedBidId = requirement.acceptedBid?._id?.toString() || requirement.acceptedBid?.toString();
      if (acceptedBidId !== bid._id.toString()) {
        return error(res, 'This requirement already has another accepted bid', 400, 'ALREADY_ACCEPTED');
      }
    }

    // Verify signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '');
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      return error(res, 'Invalid payment signature verification failed', 400, 'PAYMENT_VERIFICATION_FAILED');
    }

    // Log dummy debit/credit tracking for bookkeeping (Optional but nice to record in user transactions)
    const user = await User.findById(req.user.id);
    if (user) {
      user.wallet.transactions.push({
        type: 'debit',
        amount: bid.amount,
        description: `Direct Payment (Razorpay: ${razorpay_payment_id})`,
        date: new Date()
      });
      await user.save();
    }

    const msg = await executeBidAcceptance(bid, requirement, req.user.id, razorpay_payment_id);

    success(res, { bid, message: msg }, 'Payment verified and deal accepted successfully');
  } catch (err) {
    next(err);
  }
};

/**
 * @route   POST /api/chats/:bidId/reopen or /api/chats/reopen/:requestId/:vendorId
 * @desc    Cancel acceptance, reopen/unlock negotiation
 * @access  Private (User/Owner of Requirement)
 */
export const reopenDeal = async (req, res, next) => {
  try {
    const bid = await resolveBid(req.params, req.user);
    if (!bid) return error(res, 'Bid not found', 404, 'NOT_FOUND');

    const requirement = bid.requirement;
    const requirementUser = requirement.user?._id?.toString() || requirement.user?.toString();
    if (requirementUser !== req.user.id) {
      return error(res, 'Access denied. Only requirement owner can reopen deals', 403, 'FORBIDDEN');
    }

    // Reset this bid status
    bid.status = 'pending';
    await bid.save();

    // Update requirement to bidding status and remove acceptedBid reference
    requirement.status = 'bidding';
    requirement.acceptedBid = null;
    await requirement.save();

    // Change all other bids back to pending status
    await Bid.updateMany(
      { requirement: requirement._id },
      { $set: { status: 'pending' } }
    );

    // Create contract acceptance message
    const msg = await Message.create({
      requirement: requirement._id,
      bid: bid._id,
      sender: req.user.id,
      senderModel: 'User',
      senderRole: 'user',
      text: `⚠️ DEAL REOPENED! User returned to negotiation. Negotiation is active again.`,
      type: 'text',
    });

    // Realtime broadcast via Socket.io
    try {
      const io = getIO();
      io.to(bid._id.toString()).emit('receive_message', msg);
      io.to(bid._id.toString()).emit('deal_reopened', { bidId: bid._id });
    } catch (wsErr) {
      console.error('Socket broadcast failed:', wsErr.message);
    }

    success(res, { bid, message: msg }, 'Deal reopened and negotiation unlocked successfully');
  } catch (err) {
    next(err);
  }
};
