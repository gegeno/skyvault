import { StatusCodes } from 'http-status-codes';
import { ApiError } from '../utils/ApiError.js';

/**
 * A middleware function that validates the request against a Zod schema.
 * This validator checks req.body, req.params, and req.query.
 * @param {z.ZodSchema<any>} schema - The Zod schema to validate against.
 * @returns {Function} - An Express middleware function.
 */
export const validate = (schema) => async (req, res, next) => {
  try {
    // An object to validate all parts of the request
    const objectToValidate = {
      body: req.body,
      params: req.params,
      query: req.query,
    };

    await schema.parseAsync(objectToValidate);
    return next();
  } catch (error) {
    // Check if the error is a Zod validation error
    if (error.name === 'ZodError') {
      // Format Zod errors into a simple array of messages
      const errorMap = {};

      for (const issue of error.issues || []) {
        const key = issue.path.join('.');
        const cleanKey = key.replace(/^(body|params|query)\./, '');
        errorMap[cleanKey] = errorMap[cleanKey] || [];
        errorMap[cleanKey].push(issue.message);
      }

      const errorMessages = [errorMap];

      // Create a custom ApiError
      const apiError = new ApiError(
        StatusCodes.BAD_REQUEST,
        'Invalid input data. Please check your fields.',
        true, // isOperational
        errorMessages,
      );
      return next(apiError);
    }

    return next(
      new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'An unexpected error occurred during validation.',
      ),
    );
  }
};
