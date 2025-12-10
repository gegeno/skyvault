import { z } from 'zod';
import mongoose from 'mongoose';

/**
 * @desc "Custom validator for Mongoose ObjectId"
 * @Validates
 * 1. String: Must be a valid Mongoose ObjectId format
 */
const mongoId = z.string().refine(
  (val) => {
    return mongoose.Types.ObjectId.isValid(val);
  },
  {
    message: 'Invalid ID format',
  },
);

/**
 * @desc "Schema for creating a share link for a file"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId
 */
export const createFileShareSchema = z.object({
  params: z.object({
    id: mongoId,
  }),
});

/**
 * @desc "Schema for creating a share link for a directory"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId
 */
export const createDirectoryShareSchema = z.object({
  params: z.object({
    id: mongoId,
  }),
});

/**
 * @desc "Schema for deleting a share link for a file"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId
 */
export const deleteFileShareSchema = z.object({
  params: z.object({
    id: mongoId,
  }),
});

/**
 * @desc "Schema for deleting a share link for a directory"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId
 */
export const deleteDirectoryShareSchema = z.object({
  params: z.object({
    id: mongoId,
  }),
});

/**
 * @desc "Schema for getting public share details"
 * @Validates
 * 1. params.shareId: String, cannot be empty
 */
export const getPublicShareSchema = z.object({
  params: z.object({
    shareId: z.string().min(1, { error: 'shareId cannot be empty' }),
  }),
});

/**
 * @desc "Schema for downloading a public file"
 * @Validates
 * 1. params.shareId: String, cannot be empty
 */
export const downloadPublicFileSchema = z.object({
  params: z.object({
    shareId: z.string().min(1, { error: 'shareId cannot be empty' }),
  }),
});
