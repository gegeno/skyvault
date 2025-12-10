import mongoose from 'mongoose';

// ShareLink Schema Definition
const shareLinkSchema = new mongoose.Schema(
  {
    shareId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      sparse: true, // Only indexed if field exists
      index: true,
    },
    directory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Directory',
      sparse: true, // Only indexed if field exists
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const ShareLink = mongoose.model('ShareLink', shareLinkSchema);
