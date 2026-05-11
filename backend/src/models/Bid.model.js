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
  },
  { timestamps: true }
);

// Ensure a vendor can only place one bid per requirement
bidSchema.index({ requirement: 1, vendor: 1 }, { unique: true });

export default mongoose.models.Bid || mongoose.model('Bid', bidSchema);
