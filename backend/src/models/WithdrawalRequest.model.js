import mongoose from 'mongoose';

const withdrawalRequestSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Withdrawal amount must be at least ₹1'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    // Snapshot of bank details at time of request
    bankSnapshot: {
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
      upiId: { type: String, default: '' },
    },
    adminNote: { type: String, default: '' },
    transactionRef: { type: String, default: '' }, // UTR / bank reference after transfer
    processedAt: { type: Date, default: null },
    processedBy: { type: String, default: '' }, // admin identifier
  },
  { timestamps: true }
);

withdrawalRequestSchema.index({ vendor: 1, status: 1 });

export default mongoose.models.WithdrawalRequest ||
  mongoose.model('WithdrawalRequest', withdrawalRequestSchema);
