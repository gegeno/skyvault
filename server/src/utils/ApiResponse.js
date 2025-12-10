// Standardized API Response Wrapper
export class ApiResponse {
  /**
   * Creates a new ApiResponse instance.
   * @param {number} statusCode - The HTTP status code.
   * @param {object | Array | string} data - The response data.
   * @param {string} [message="Success"] - A descriptive message.
   */
  constructor(statusCode, message = 'Success', data) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}
