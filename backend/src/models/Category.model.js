import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String, // lucide icon name or image path
      default: 'Package',
    },
    image: {
      type: String, // URL to category image
      default: '',
    },
    filters: [
      {
        name: String,
        type: { type: String, default: 'text' }, // text, select, checkbox
        options: [String], // for select type
      }
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    }
  },
  { timestamps: true }
);

export default mongoose.models.Category || mongoose.model('Category', categorySchema);
