import mongoose from 'mongoose';

const otpSessionSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'vendor'],
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }, // MongoDB TTL — auto-delete
  },
});

export default mongoose.model('OtpSession', otpSessionSchema);
