import mongoose from 'mongoose';
import { z } from 'zod';

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
 * @desc "Schema for getting directory contents"
 * @Validates
 * 1. params.id (Optional): Must be a valid Mongoose ObjectId if provided
 */
export const getDirectorySchema = z.object({
  params: z.object({
    id: z.optional(mongoId),
  }),
});

/**
 * @desc "Schema for creating a new directory"
 * @Validates
 * 1. name: String, cannot be empty
 * 2. parentId (Optional): Must be a valid Mongoose ObjectId or null (for root)
 */
export const createDirectorySchema = z.object({
  body: z.object({
    name: z.string().min(1, { error: 'Directory name cannot be empty' }),
    parentId: z.optional(mongoId.nullable()), // Can be null or a valid ID
  }),
});

/**
 * @desc "Schema for renaming a directory"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId
 * 2. name: String, cannot be empty
 */
export const renameDirectorySchema = z.object({
  params: z.object({
    id: mongoId,
  }),
  body: z.object({
    name: z.string().min(1, { error: 'New directory name cannot be empty' }),
  }),
});

/**
 * @desc "Schema for deleting a directory"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId
 */
export const deleteDirectorySchema = z.object({
  params: z.object({
    id: mongoId,
  }),
});

/**
 * @desc "Schema for moving a directory"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId (directory to move)
 * 2. newParentId: Must be a valid Mongoose ObjectId or null (for root)
 */
export const moveDirectorySchema = z.object({
  params: z.object({
    id: mongoId,
  }),
  body: z.object({
    newParentId: mongoId.nullable(), // Allow moving to root (null)
  }),
});

/**
 * @desc "Schema for copying a directory"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId (source directory)
 * 2. targetParentId: Must be a valid Mongoose ObjectId or null (destination)
 */
export const copyDirectorySchema = z.object({
  params: z.object({
    id: mongoId, // The ID of the directory to copy
  }),
  body: z.object({
    targetParentId: mongoId.nullable(), // The ID of the target directory
  }),
});
