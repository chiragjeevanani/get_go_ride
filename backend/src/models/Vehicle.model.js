import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    capacity: {
      type: String, // e.g. "800kg", "2.5 Tonnes"
      required: true,
    },
    details: {
      type: String, // e.g. "LCV • 4 Tyres • Open Body"
      default: '',
    },
    image: {
      type: String, // Image URL/path or dynamic path
      default: '',
    },
    categorySlug: {
      type: String, // Associated Category Slug (for backward compatibility)
      default: '',
    },
    categorySlugs: {
      type: [String], // Associated Category Slugs
      default: [],
    },
    isMostBooked: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save hook to ensure both categorySlug and categorySlugs are synchronized
vehicleSchema.pre('save', function (next) {
  if (this.categorySlugs && this.categorySlugs.length > 0) {
    this.categorySlug = this.categorySlugs[0];
  } else if (this.categorySlug) {
    this.categorySlugs = [this.categorySlug];
  }
  next();
});

export default mongoose.models.Vehicle || mongoose.model('Vehicle', vehicleSchema);
