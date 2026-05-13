import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    requirement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Requirement',
      required: true,
    },
    bid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bid',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderModel',
    },
    senderModel: {
      type: String,
      required: true,
      enum: ['User', 'Vendor'],
    },
    senderRole: {
      type: String,
      required: true,
      enum: ['user', 'vendor'],
    },
    text: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['text', 'offer', 'image', 'card', 'contact'],
      default: 'text',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    image: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['sent', 'read'],
      default: 'sent',
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Message || mongoose.model('Message', messageSchema);
