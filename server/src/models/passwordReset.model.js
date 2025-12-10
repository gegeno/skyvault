import mongoose from 'mongoose';

// Password Reset Schema Definition
const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: '15m',
  },
});

export const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);
