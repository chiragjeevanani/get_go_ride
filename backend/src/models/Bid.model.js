import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema(
  {
    requirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      required: true,
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    vehicleType: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    // Commission tracking for flexible revenue model
    platformCommission: {
      type: Number,
      default: 0,
    },
    vendorEarning: {
      type: Number,
      default: 0,
    },
    // ─── Payment Lifecycle (50% advance + 50% final) ─────────────────────────
    paymentStatus: {
      type: String,
      enum: ['unpaid', 'advance_paid', 'completed'],
      default: 'unpaid',
    },
    gigStatus: {
      type: String,
      enum: ['scheduled', 'in_progress', 'arrived', 'completed'],
      default: 'scheduled',
    },
    advanceAmount: { type: Number, default: 0 },   // 50% of bid amount
    finalAmount: { type: Number, default: 0 },     // 50% of bid amount
    advancePaymentId: { type: String, default: '' },   // Razorpay payment ID
    advanceOrderId: { type: String, default: '' },     // Razorpay order ID
    finalPaymentId: { type: String, default: '' },     // Razorpay payment ID or 'cash'
    finalOrderId: { type: String, default: '' },       // Razorpay order ID for final payment link
    finalPaymentMethod: {
      type: String,
      enum: ['cash', 'online', null],
      default: null,
    },
    finalPaymentLinkUrl: { type: String, default: '' }, // Razorpay payment link short_url
    
    // ─── OTP Verification & Feedback ──────────────────────────────────────────
    completionOtp: { type: String, default: null },
    proofOfDelivery: { type: String, default: '' },
    feedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String, default: '' }
    },
  },
  { timestamps: true }
);

// Ensure a vendor can only place one bid per requirement
bidSchema.index({ requirement: 1, vendor: 1 }, { unique: true });

export default mongoose.models.Bid || mongoose.model('Bid', bidSchema);
