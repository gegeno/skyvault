import { z } from 'zod';

/**
 * @desc "Schema for search request"
 * @Validates
 * 1. query.q: String, length must be between 1 and 10 characters
 */
export const searchSchema = z.object({
  query: z.object({
    q: z
      .string()
      .min(1, { error: 'Search query cannot be empty' })
      .max(10, { error: 'Search query is too long' }),
  }),
});
