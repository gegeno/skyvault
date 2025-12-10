import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import {
  sendOtpSchema,
  registerSchema,
  loginSchema,
  googleLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';
import {
  sendOtp,
  registerUser,
  loginUser,
  logoutUser,
  googleLogin,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller.js';

export const authRouter = Router();

/**
 * @route   POST /api/v1/auth/send-otp
 * @desc    Send OTP to user's email for registration
 */
authRouter.post('/send-otp', validate(sendOtpSchema), sendOtp);

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register a new user after OTP verification
 */
authRouter.post('/register', validate(registerSchema), registerUser);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Log in an existing user
 */
authRouter.post('/login', validate(loginSchema), loginUser);

/**
 * @route   POST /api/v1/auth/google-login
 * @desc    Handle Google Sign-In (Login or Register)
 */
authRouter.post('/google-login', validate(googleLoginSchema), googleLogin);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Send a password reset link to the user's email
 */
authRouter.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset the user's password using a token
 */
authRouter.post('/reset-password', validate(resetPasswordSchema), resetPassword);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Log out the currently authenticated user
 */
authRouter.post('/logout', authMiddleware, logoutUser);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get the current user's session data
 */
authRouter.get('/me', authMiddleware, getMe);
