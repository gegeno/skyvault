import mongoose from 'mongoose';

// Directory Schema Definition
const directorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    parentDirectory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Directory',
      default: null, // null parent means root directory
    },
    size: {
      type: Number,
      default: 0, // Total size in bytes of all files/sub-folders within
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  },
);

// Text index allows for efficient partial text search on directory names
directorySchema.index({ name: 'text' });

// Export Model
export const Directory = mongoose.model('Directory', directorySchema);
