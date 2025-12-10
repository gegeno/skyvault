// Standardized API Error Wrapper
export class ApiError extends Error {
  /**
   * Creates a new ApiError instance.
   * @param {number} statusCode - The HTTP status code
   * @param {string} message - The error message.
   * @param {boolean} [isOperational=true] - True if it's an expected, operational error.
   * @param {Array} [errors=[]] - A list of detailed validation errors.
   * @param {string} [stack=""] - Optional stack trace.
   */
  constructor(
    statusCode,
    message = 'Something went wrong',
    isOperational = true,
    errors = [],
    stack = '',
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errors = errors;
    this.success = false;
    this.data = null;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
