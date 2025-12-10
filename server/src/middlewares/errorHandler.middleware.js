import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError.js';
import { logger } from '../config/logger.js';

/**
 * Global error handling middleware.
 */
export const globalErrorHandler = (err, req, res, _next) => {
  let statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred!';
  let errors = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else {
    logger.error('Unhandled Error:', err);
  }

  const response = {
    success: false,
    message,
    errors,
    data: null,
  };

  res.status(statusCode).json(response);
};
