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
 * @desc "Schema for initiating a file upload"
 * @Validates
 * 1. name: String, cannot be empty
 * 2. size: Number, must be a positive integer
 * 3. mimeType: String, minimum 3 characters
 * 4. parentId (Optional): Must be a valid Mongoose ObjectId or null (for root)
 */
export const initiateUploadSchema = z.object({
  body: z.object({
    name: z.string().min(1, { error: 'File name cannot be empty' }),
    size: z.number().int().positive({ error: 'File size must be positive' }),
    mimeType: z.string().min(3, { error: 'A valid MIME type is required' }),
    parentId: z.optional(mongoId.nullable()), // Can be null, or a valid ID
  }),
});

/**
 * @desc "Schema for completing a file upload"
 * @Validates
 * 1. fileId: Must be a valid Mongoose ObjectId
 */
export const completeUploadSchema = z.object({
  body: z.object({
    fileId: mongoId,
  }),
});

/**
 * @desc "Schema for renaming a file"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId
 * 2. name: String, cannot be empty
 */
export const renameFileSchema = z.object({
  params: z.object({
    id: mongoId,
  }),
  body: z.object({
    name: z.string().min(1, { error: 'New file name cannot be empty' }),
  }),
});

/**
 * @desc "Schema for deleting a file"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId
 */
export const deleteFileSchema = z.object({
  params: z.object({
    id: mongoId,
  }),
});

/**
 * @desc "Schema for getting a file (download/view)"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId
 * 2. query.download (Optional): String, must be 'true' or empty string
 */
export const getFileSchema = z.object({
  params: z.object({
    id: mongoId,
  }),
  query: z.object({
    // 'download' query param is optional and can be 'true' or empty
    download: z
      .string()
      .refine((val) => val === 'true' || val === '', {
        message: 'Query param "download" must be "true" or empty',
      })
      .optional(),
  }),
});

/**
 * @desc "Schema for moving a file"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId (file to move)
 * 2. newParentId: Must be a valid Mongoose ObjectId or null (for root)
 */
export const moveFileSchema = z.object({
  params: z.object({
    id: mongoId,
  }),
  body: z.object({
    newParentId: mongoId.nullable(), // Allow moving to root (null)
  }),
});

/**
 * @desc "Schema for copying a file"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId (file to copy)
 * 2. targetParentId: Must be a valid Mongoose ObjectId or null (destination)
 */
export const copyFileSchema = z.object({
  params: z.object({
    id: mongoId,
  }),
  body: z.object({
    targetParentId: mongoId.nullable(), // Allow copying to root (null)
  }),
});
