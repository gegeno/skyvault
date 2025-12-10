import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { redisClient } from '../config/redis.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/user.model.js';
import { Directory } from '../models/directory.model.js';

const COOKIE_NAME = process.env.COOKIE_NAME;

/**
 * @desc    Set up the secure vault for the first time
 * @route   POST /api/v1/vault/setup
 * @access  Private
 */
export const setupVault = async (req, res) => {
  const { pin } = req.body;
  const { userId } = req.user;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Check if vault is already set up
  if (user.hasVault) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vault is already set up.');
  }

  // Hash the PIN
  const hashedPin = await bcrypt.hash(pin, 10);

  // Start a transaction to create the vault directory and update the user
  const session = await mongoose.startSession();
  session.startTransaction();

  let newVaultDir;
  try {
    // Create the root vault directory
    newVaultDir = new Directory({
      name: 'Secure Vault',
      owner: userId,
      parentDirectory: null,
      size: 0,
    });
    await newVaultDir.save({ session });

    // Update the user
    user.hasVault = true;
    user.vaultPin = hashedPin;
    user.rootVaultDirectory = newVaultDir._id;
    await user.save({ session });

    // Commit the transaction
    await session.commitTransaction();
  } catch (error) {
    await session.abortTransaction();
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to set up vault.', error);
  } finally {
    session.endSession();
  }

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(StatusCodes.CREATED, 'Secure Vault set up successfully', {
      rootVaultDirectory: newVaultDir._id,
    }),
  );
};

/**
 * @desc    Unlock the secure vault
 * @route   POST /api/v1/vault/unlock
 * @access  Private
 */
export const unlockVault = async (req, res) => {
  const { pin } = req.body;
  const { userId } = req.user;
  const sessionId = req.signedCookies[COOKIE_NAME];

  // Find user and include the vaultPin
  const user = await User.findById(userId).select('+vaultPin');

  // Check if vault is available
  if (!user || !user.hasVault || !user.vaultPin) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Vault is not set up.');
  }

  // Compare the PIN
  const isPinCorrect = await bcrypt.compare(pin, user.vaultPin);
  if (!isPinCorrect) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid PIN.');
  }

  // Update the session in Redis for vault unlock status
  const redisKey = `session:${sessionId}`;
  const sessionDataString = await redisClient.get(redisKey);
  if (!sessionDataString) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Session not found.');
  }

  const sessionData = JSON.parse(sessionDataString);
  sessionData.isVaultUnlocked = true;

  // Save the updated session
  await redisClient.set(redisKey, JSON.stringify(sessionData), {
    KEEPTTL: true,
  });

  // Update vault unlock status for the current request
  req.user.isVaultUnlocked = true;

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, 'Vault unlocked successfully.'));
};

/**
 * @desc    Lock the secure vault
 * @route   POST /api/v1/vault/lock
 * @access  Private
 */
export const lockVault = async (req, res) => {
  const sessionId = req.signedCookies[COOKIE_NAME];

  const redisKey = `session:${sessionId}`;
  const sessionDataString = await redisClient.get(redisKey);

  if (sessionDataString) {
    // Update the session in Redis to lock the vault
    const sessionData = JSON.parse(sessionDataString);
    sessionData.isVaultUnlocked = false;

    await redisClient.set(redisKey, JSON.stringify(sessionData), {
      KEEPTTL: true,
    });
  }

  // Update vault unlock status for the current request
  req.user.isVaultUnlocked = false;

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, 'Vault locked successfully.'));
};
