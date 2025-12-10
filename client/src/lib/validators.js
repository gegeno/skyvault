import { z } from 'zod';

// Only create an account with trusted email domains
export const TRUSTED_DOMAINS = [
  '@gmail.com',
  '@outlook.com',
  '@yahoo.com',
  '@icloud.com',
  '@protonmail.com',
];

// Strong password schema
export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(16, 'Password must be no more than 16 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/\d/, 'Must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character');

// Email username (local part) schema
export const EmailLocalSchema = z
  .string()
  .trim()
  .min(1, 'Email username is required')
  .regex(
    /^[a-zA-Z0-9._%+-]+$/,
    'Username can only contain letters, numbers, dots, underscores, percent, plus, and hyphens',
  );

// Email domain schema
export const EmailDomainSchema = z.enum(TRUSTED_DOMAINS, {
  errorMap: () => ({ message: 'Please select a valid email domain' }),
});

// Login schema
export const loginSchema = z.object({
  email: z.email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Register step 1 schema
export const registerStep1Schema = z
  .object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters'),
    emailLocal: EmailLocalSchema,
    emailDomain: EmailDomainSchema,
    password: PasswordSchema,
  })
  .transform((data) => ({
    ...data,
    email: `${data.emailLocal}${data.emailDomain}`.toLowerCase(),
  }));

// Register step 2 schema
export const registerStep2Schema = z.object({
  otp: z
    .string()
    .trim()
    .length(4, 'OTP must be exactly 4 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
});

// forgot password schema
export const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address'),
});

// reset password schema
export const resetPasswordSchema = z
  .object({
    password: PasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
