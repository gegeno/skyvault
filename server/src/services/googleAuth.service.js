import { OAuth2Client } from 'google-auth-library';
import { StatusCodes } from 'http-status-codes';
import { logger } from '../config/logger.js';
import { ApiError } from '../utils/ApiError.js';

// Environment Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

if (!GOOGLE_CLIENT_ID) {
  logger.warn('GOOGLE_CLIENT_ID is not set. Google Auth will not work.');
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID token.
 * @param {string} idToken - The ID token received from the client.
 * @returns {Promise<object>} - The token payload containing user info.
 */
export const verifyGoogleToken = async (idToken) => {
  if (!GOOGLE_CLIENT_ID) {
    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Google Auth is not configured on the server.',
    );
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid Google token: No payload.');
    }

    // Check if email is verified
    if (!payload.email_verified) {
      throw new ApiError(StatusCodes.UNAUTHORIZED, 'Google account email is not verified.');
    }

    return {
      name: payload.name,
      email: payload.email,
      googleId: payload.sub, // 'sub' is Google's unique ID for the user
    };
  } catch (error) {
    logger.error('Google token verification failed:', error.message);
    throw new ApiError(StatusCodes.UNAUTHORIZED, 'Invalid or expired Google token.');
  }
};
