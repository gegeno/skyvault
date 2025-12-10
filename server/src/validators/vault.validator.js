import { z } from 'zod';

/**
 * @desc "Schema for validating PIN code"
 * @Validates
 * 1. String: Length must be between 4 and 6 digits
 * 2. Format: Must only contain digits
 */
const pinSchema = z
  .string()
  .min(4, 'PIN must be at least 4 digits')
  .max(6, 'PIN cannot be more than 6 digits')
  .regex(/^\d+$/, 'PIN must only contain digits');

/**
 * @desc "Schema for setting up the vault"
 * @Validates
 * 1. pin: Must adhere to PIN schema rules (4-6 digits)
 */
export const setupVaultSchema = z.object({
  body: z.object({
    pin: pinSchema,
  }),
});

/**
 * @desc "Schema for unlocking the vault"
 * @Validates
 * 1. pin: Must adhere to PIN schema rules (4-6 digits)
 */
export const unlockVaultSchema = z.object({
  body: z.object({
    pin: pinSchema,
  }),
});
