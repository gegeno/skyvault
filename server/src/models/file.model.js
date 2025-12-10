import mongoose from 'mongoose';

// File Schema Definition
const fileSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    size: {
      type: Number,
      required: true, // File size in bytes
    },
    mimeType: {
      type: String,
      required: true,
    },
    storageKey: {
      type: String,
      required: true,
      unique: true, // The unique key for S3 object
    },
    status: {
      type: String,
      enum: ['pending', 'available'],
      default: 'available', // File is ready for access
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Auto-delete 'pending' files older than 24 hour if not uploaded successfully
fileSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 86400, partialFilterExpression: { status: 'pending' } },
);

// Export Model
export const File = mongoose.model('File', fileSchema);
