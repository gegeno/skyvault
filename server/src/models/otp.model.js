import mongoose from 'mongoose';

// OTP Schema Definition
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '5m', // This creates a TTL index (Time-To-Live)
    // MongoDB will automatically delete this document after 5 minutes
  },
});

export const Otp = mongoose.model('Otp', otpSchema);
