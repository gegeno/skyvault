import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { redisClient } from '../config/redis.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { Otp } from '../models/otp.model.js';
import { User } from '../models/user.model.js';
import { Directory } from '../models/directory.model.js';
import { PasswordReset } from '../models/passwordReset.model.js';
import { createSession } from '../services/session.service.js';
import { verifyGoogleToken } from '../services/googleAuth.service.js';
import {
  sendOtpEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
} from '../services/email.service.js';

// Environment variables
const ENV = process.env.NODE_ENV;
const COOKIE_NAME = process.env.COOKIE_NAME || 'ssid';
const CLIENT_URL = ENV === 'production' ? process.env.CLIENT_URL_PROD : process.env.CLIENT_URL_DEV;

/**
 * @desc    Generate, save, and send an OTP
 * @route   POST /api/v1/auth/send-otp
 * @access  Public
 */
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(StatusCodes.CONFLICT, 'User with this email already exists. Please log in.');
  }

  // Generate 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  // Send OTP email (this will throw an error if it fails)
  await sendOtpEmail(email, otp);

  // Save the hashed OTP to the database
  const hashedOtp = await bcrypt.hash(otp, 10);
  await Otp.findOneAndUpdate(
    { email },
    { otp: hashedOtp },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(StatusCodes.CREATED, 'OTP sent successfully. Please check your email.', {
      email,
    }),
  );
};

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const registerUser = async (req, res) => {
  const { name, email, password, otp } = req.body;
  const userName = name
    .trim()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Find and validate OTP
  const savedOtp = await Otp.findOne({ email });
  if (!savedOtp) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired OTP.');
  }
  const isOtpValid = await bcrypt.compare(otp, savedOtp.otp);
  if (!isOtpValid) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired OTP.');
  }

  // Start a database transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  let newUser;
  try {
    // Create the user
    const user = new User({
      name: userName,
      email,
      password,
    });
    await user.save({ session });

    // Create the user's root directories (Root & Trash)
    const rootDir = new Directory({
      name: 'root',
      owner: user._id,
      parentDirectory: null,
    });
    const trashDir = new Directory({
      name: 'trash',
      owner: user._id,
      parentDirectory: null,
    });
    await Promise.all([rootDir.save({ session }), trashDir.save({ session })]);

    // Link the root directories back to the user
    user.rootDirectory = rootDir._id;
    user.rootTrashDirectory = trashDir._id;
    await user.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    newUser = user;
  } catch (error) {
    // If any operation fails, abort transaction
    await session.abortTransaction();
    if (error.code === 11000 && error.keyPattern?.email) {
      throw new ApiError(StatusCodes.CONFLICT, 'User with this email already exists.');
    }
    throw error;
  } finally {
    session.endSession();
  }

  // Send welcome email
  await sendWelcomeEmail(email, userName.split(' ')[0]);

  // Delete the used OTP
  await Otp.deleteOne({ email });

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(StatusCodes.CREATED, 'User registered successfully.', {
      userId: newUser._id,
      email: newUser.email,
      name: newUser.name,
    }),
  );
};

/**
 * @desc    Log in an existing user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findOne({ email }).select('+password'); // Include password
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Invalid email or password.');
  }

  // Check if user has a password (they might be a Google-only user)
  if (!user.password) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'This account was created with Google. Please log in with Google.',
    );
  }

  // Compare the provided password with the stored hash
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid email or password.');
  }

  // If credentials are valid, create a session and send the cookie
  await createSession(res, user);

  return res.status(StatusCodes.OK).json(
    new ApiResponse(StatusCodes.OK, 'User logged in successfully.', {
      userId: user._id,
      email: user.email,
      name: user.name,
    }),
  );
};

/**
 * @desc    Log out the currently authenticated user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logoutUser = async (req, res) => {
  const sessionId = req.signedCookies[COOKIE_NAME];
  const redisKey = `session:${sessionId}`;

  // Delete the session from Redis
  await redisClient.del(redisKey);

  // Define cookie options for clearing
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    signed: true,
    sameSite: 'Lax',
  };

  // Clear the cookie on the client's browser
  res.clearCookie(COOKIE_NAME, cookieOptions);

  // Send a successful response
  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, 'Logged out successfully.'));
};

/**
 * @desc    Handle Google Sign-In (Login or Register)
 * @route   POST /api/v1/auth/google-login
 * @access  Public
 */
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  // Verify the Google token
  const { name, email, googleId } = await verifyGoogleToken(idToken);

  // Check if user already exists
  let user = await User.findOne({ email });
  let responseMessage = 'User logged in successfully.';
  let statusCode = StatusCodes.OK;

  if (user) {
    // If user signed up with email first, link their Google ID
    if (!user.googleId) {
      user.googleId = googleId;
      await user.save();
    }
  } else {
    // New user (Register)
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const newUser = new User({
        name,
        email,
        googleId,
      });
      await newUser.save({ session });

      // Create Root and Trash directories
      const rootDir = new Directory({
        name: 'root',
        owner: newUser._id,
        parentDirectory: null,
      });
      const trashDir = new Directory({
        name: 'trash',
        owner: newUser._id,
        parentDirectory: null,
      });
      await Promise.all([rootDir.save({ session }), trashDir.save({ session })]);

      // Link directories to user
      newUser.rootDirectory = rootDir._id;
      newUser.rootTrashDirectory = trashDir._id;
      await newUser.save({ session });

      await session.commitTransaction();
      user = newUser; // Set the user for session creation
      responseMessage = 'User registered and logged in successfully.';
      statusCode = StatusCodes.CREATED;
    } catch (error) {
      await session.abortTransaction();
      logger.error('Google registration transaction failed:', error);
      throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to create user account.');
    } finally {
      session.endSession();
    }
  }

  // Create session and send cookie
  await createSession(res, user);

  // Send welcome email
  await sendWelcomeEmail(email, name.split(' ')[0]);

  // Send successful response
  return res.status(statusCode).json(
    new ApiResponse(statusCode, responseMessage, {
      userId: user._id,
      email: user.email,
      name: user.name,
    }),
  );
};

/**
 * @desc    Get the currently authenticated user's session data AND fresh DB stats
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getMe = async (req, res) => {
  const { userId, isVaultUnlocked } = req.user;

  const user = await User.findById(userId).select(
    'name email storageUsed storageQuota hasVault rootDirectory rootTrashDirectory rootVaultDirectory',
  );

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.');
  }

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    storageUsed: user.storageUsed,
    storageQuota: user.storageQuota,
    hasVault: user.hasVault,
    rootDirectory: user.rootDirectory,
    rootTrashDirectory: user.rootTrashDirectory,
    rootVaultDirectory: user.rootVaultDirectory,
    isVaultUnlocked: !!isVaultUnlocked,
  };

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, 'User data retrieved successfully.', userData));
};

/**
 * @desc    Send a password reset link
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (user) {
    try {
      // Generate a secure random token
      const token = crypto.randomBytes(32).toString('hex');

      // Save the token to the DB.
      await PasswordReset.findOneAndUpdate(
        { userId: user._id },
        { userId: user._id, token: token },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      );

      //Create the reset link
      const resetLink = `${CLIENT_URL}/reset-password?token=${token}`;

      // Send the email
      await sendPasswordResetEmail(user.email, user.name.split(' ')[0], resetLink);
    } catch (error) {
      logger.error(`Password reset email failed for ${email}:`, error);
    }
  } else {
    logger.debug(`Password reset requested for non-existent or Google-only user: ${email}`);
  }

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        'If an account with this email exists, a password reset link has been sent.',
      ),
    );
};

/**
 * @desc    Reset the user's password using a token
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  // Find the token record in the database and validate
  const tokenRecord = await PasswordReset.findOne({ token: token });
  if (!tokenRecord) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid or expired password reset token.');
  }

  // Find the user associated with the token
  const user = await User.findById(tokenRecord.userId);
  if (!user) {
    await tokenRecord.deleteOne(); // Clean up invalid token
    throw new ApiError(StatusCodes.NOT_FOUND, 'User associated with this token no longer exists.');
  }

  // Set the new password
  user.password = password;
  await user.save();

  // Delete the token so it cannot be used again
  await tokenRecord.deleteOne();

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, 'Password has been reset successfully. Please log in.'));
};
