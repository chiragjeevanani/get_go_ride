import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceType: {
      type: String,
      enum: ['goods', 'house', 'emergency', 'construction'],
      required: true,
    },
    vehicleType: {
      type: String,
      required: true,
    },
    pickup: {
      address: { type: String, required: true },
      lat: Number,
      lon: Number,
    },
    drops: [
      {
        address: { type: String, required: true },
        lat: Number,
        lon: Number,
      },
    ],
    items: {
      type: String,
      required: true,
    },
    weight: {
      type: String, // e.g. "500kg"
      default: '',
    },
    date: {
      type: Date,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    notes: String,
    status: {
      type: String,
      enum: ['pending', 'bidding', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
    },
    acceptedBid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      default: null,
    },
  },
  { timestamps: true }
);

// Index for geo-queries and driver filtering
requirementSchema.index({ serviceType: 1, status: 1 });

export default mongoose.model('Requirement', requirementSchema);
