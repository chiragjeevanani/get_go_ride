import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      unique: true,
      match: [/^\d{10}$/, 'Phone must be a valid 10-digit number'],
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Active', 'Blocked'],
      default: 'Active',
    },
    wallet: {
      balance: { type: Number, default: 0 },
      coins: { type: Number, default: 0 },
      transactions: [
        {
          type: { type: String, enum: ['credit', 'debit'] },
          amount: Number,
          description: String,
          date: { type: Date, default: Date.now },
        },
      ],
    },
    totalRequests: {
      type: Number,
      default: 0,
    },
    savedAddresses: [
      {
        label: String,
        address: String,
        lat: Number,
        lon: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);
