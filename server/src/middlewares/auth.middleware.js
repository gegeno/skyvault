import { StatusCodes } from 'http-status-codes';
import { redisClient } from '../config/redis.js';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

const COOKIE_NAME = process.env.COOKIE_NAME;

/**
 * Middleware to verify a user's session:
 * Checks for a signed session cookie.
 * Verifies the session ID exists in Redis.
 * Attaches the session data (user) to req.user.
 */
export const authMiddleware = async (req, res, next) => {
  // Get the session ID from the signed cookie
  const sessionId = req.signedCookies[COOKIE_NAME];

  // Check if the session cookie exists
  if (!sessionId) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'You are not logged in. Please log in.');
  }

  // Define the Redis key
  const redisKey = `session:${sessionId}`;
  let sessionData;

  // Try to get the session from Redis
  try {
    sessionData = await redisClient.get(redisKey);
  } catch (err) {
    logger.error('Redis error in auth middleware:', err);
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Session service is unavailable.');
  }

  // Check if the session data exists in Redis (it might be expired)
  if (!sessionData) {
    // Clear the invalid cookie from the user's browser
    res.clearCookie(COOKIE_NAME);
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Your session has expired. Please log in again.');
  }

  // Parse the session data and attach it to the request object
  let userSession;
  try {
    userSession = JSON.parse(sessionData);
  } catch (err) {
    logger.error('Failed to parse session data from Redis:', {
      key: redisKey,
      data: sessionData,
      error: err,
    });
    throw new ApiError(StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to read session data.');
  }

  // Attach the user's session data ({ userId, rootDirectoryId })
  req.user = userSession;
  next();
};
