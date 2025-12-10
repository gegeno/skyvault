import { z } from 'zod';

/**
 * @desc "Schema for the 'send-otp' endpoint"
 * @Validates
 * 1. email: Must be a valid email address
 */
export const sendOtpSchema = z.object({
  body: z.object({
    email: z.email({ error: 'Must be a valid email address' }),
  }),
});

/**
 * @desc "Strong password validation schema"
 * @Validates
 * 1. String: Length must be between 8 and 16 characters
 * 2. Complexity: Must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character
 */
const passwordSchema = z
  .string()
  .min(8, { error: 'Password must be at least 8 characters long' })
  .max(16, { error: 'Password must be no more than 16 characters' })
  .regex(/[A-Z]/, {
    error: 'Password must contain at least one uppercase letter',
  })
  .regex(/[a-z]/, {
    error: 'Password must contain at least one lowercase letter',
  })
  .regex(/\d/, { error: 'Password must contain at least one number' })
  .regex(/[^A-Za-z0-9]/, {
    error: 'Password must contain at least one special character',
  });

/**
 * @desc "Schema for the 'register' endpoint"
 * @Validates
 * 1. name: String, minimum 3 characters
 * 2. email: Must be a valid email address
 * 3. password: Must adhere to strong password rules
 * 4. otp: String, exactly 4 digits
 */
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(3, { error: 'Name must be at least 3 characters long' }),
    email: z.email({ error: 'Must be a valid email address' }),
    password: passwordSchema,
    otp: z
      .string()
      .length(4, { error: 'OTP must be exactly 4 digits' })
      .regex(/^\d{4}$/, { error: 'OTP must only contain digits' }),
  }),
});

/**
 * @desc "Schema for the 'login' endpoint"
 * @Validates
 * 1. email: Must be a valid email address
 * 2. password: String, cannot be empty
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.email({ error: 'Must be a valid email address' }),
    password: z.string().min(1, { error: 'Password cannot be empty' }),
  }),
});

/**
 * @desc "Schema for the 'google-login' endpoint"
 * @Validates
 * 1. idToken: String, cannot be empty
 */
export const googleLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(1, { error: 'idToken cannot be empty' }),
  }),
});

/**
 * @desc "Schema for the 'forgot-password' endpoint"
 * @Validates
 * 1. email: Must be a valid email address
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email({ error: 'Must be a valid email address' }),
  }),
});

/**
 * @desc "Schema for the 'reset-password' endpoint"
 * @Validates
 * 1. token: String, cannot be empty
 * 2. password: Must adhere to strong password rules
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, { error: 'Token cannot be empty' }),
    password: passwordSchema,
  }),
});
