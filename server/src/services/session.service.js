import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { redisClient } from '../config/redis.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

// ENV
const COOKIE_NAME = process.env.COOKIE_NAME;
const SESSION_MAX_AGE_MS = Number(process.env.SESSION_MAX_AGE) || 604800000; // 7 days
const SESSION_MAX_AGE_SEC = Math.floor(SESSION_MAX_AGE_MS / 1000);

/**
 * Creates a new session in Redis and sends a secure cookie to the client.
 * @param {object} res - The Express response object.
 * @param {object} user - The authenticated user object from the database.
 */
export const createSession = async (res, user) => {
  try {
    // Generate a secure, random session ID
    const sessionId = crypto.randomUUID();

    // Define the Redis key
    const redisKey = `session:${sessionId}`;

    // Define the data to store in the session
    const sessionData = {
      userId: user._id.toString(),
      rootDirectoryId: user.rootDirectory.toString(),
      rootTrashDirectoryId: user.rootTrashDirectory.toString(),
      isVaultUnlocked: false,
    };

    // Set the session in Redis with the expiry time (in seconds)
    await redisClient.set(redisKey, JSON.stringify(sessionData), {
      EX: SESSION_MAX_AGE_SEC,
    });

    // Define secure cookie options
    const cookieOptions = {
      httpOnly: true, // Cookie cannot be accessed by client-side JavaScript
      secure: process.env.NODE_ENV === 'production', // Send only over HTTPS
      signed: true, // Sign the cookie using COOKIE_SECRET
      maxAge: SESSION_MAX_AGE_MS, // Cookie expiry in milliseconds
      sameSite: 'Lax', // Protects against CSRF
    };

    // Set the cookie on the response object
    res.cookie(COOKIE_NAME, sessionId, cookieOptions);

    logger.debug(`Session created successfully for user: ${user.email}`);
  } catch (error) {
    logger.error('Failed to create session:', error);
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'An error occurred during the login process.',
    );
  }
};
