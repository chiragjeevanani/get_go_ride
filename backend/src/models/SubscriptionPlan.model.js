import mongoose from 'mongoose';

const subscriptionPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Plan name is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    durationDays: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 1,
    },
    leadQuota: {
      type: {
        type: String,
        enum: ['limited', 'unlimited'],
        default: 'unlimited',
      },
      limit: {
        type: Number,
        default: null, // null when unlimited
      },
      period: {
        type: String,
        enum: ['day', 'week', 'month'],
        default: 'day',
      },
    },
    features: {
      verifiedBadge: { type: Boolean, default: false },
      prioritySupport: { type: Boolean, default: false },
      freeMarketing: { type: Boolean, default: false },
      custom: [{ type: String, trim: true }],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.SubscriptionPlan || mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
