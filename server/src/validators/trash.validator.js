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
 * @desc "Schema for permanently deleting an item"
 * @Validates
 * 1. params.id: Must be a valid Mongoose ObjectId
 */
export const permanentDeleteSchema = z.object({
  params: z.object({
    id: mongoId,
  }),
});

/**
 * @desc "Schema for emptying the trash"
 * @Validates
 * 1. No parameters required
 */
export const emptyTrashSchema = z.object({});
