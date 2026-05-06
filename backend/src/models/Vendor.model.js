import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      match: [/^\d{10}$/, 'Phone must be a valid 10-digit number'],
    },
    name: { type: String, trim: true, default: '' },
    profileImage: { type: String, default: '' },
    nativeCity: { type: String, default: '' },

    // Vehicle details (filled during onboarding wizard)
    vehicleType: { type: String, default: '' },
    vehicleRegNumber: { type: String, default: '' },
    vehicleCapacity: { type: String, default: '' },

    // Service offering
    serviceCategories: [{ type: String }],
    operatingAreas: { type: String, default: '' },

    // KYC documents
    documents: [
      {
        title: String,
        fileUrl: { type: String, default: '' },
        status: {
          type: String,
          enum: ['Pending', 'Verified', 'Rejected'],
          default: 'Pending',
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],

    // Admin verification
    isVerified: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['Pending', 'Verified', 'Rejected', 'Suspended'],
      default: 'Pending',
    },

    // Performance
    rating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
    leadsWon: { type: Number, default: 0 },
    reliabilityScore: { type: Number, default: 100 },

    // Subscription
    subscriptionStatus: {
      type: String,
      enum: ['Active', 'Expired', 'None'],
      default: 'None',
    },
    activeSubscription: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubscriptionPlan',
      default: null,
    },
    subscriptionStartedAt: { type: Date, default: null },
    subscriptionExpiresAt: { type: Date, default: null },

    // Lead quota tracking (reset per plan period)
    leadQuotaUsed: { type: Number, default: 0 },
    leadQuotaResetAt: { type: Date, default: null },

    // Verified badge (granted by active plan feature)
    hasVerifiedBadge: { type: Boolean, default: false },

    location: { type: String, default: '' },

    // Onboarding tracking
    onboardingComplete: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for lead filtering
vendorSchema.index({ serviceCategories: 1, status: 1 });

export default mongoose.model('Vendor', vendorSchema);
