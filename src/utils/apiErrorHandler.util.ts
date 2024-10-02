/**
 * Custom error class for API errors.
 */
class ApiError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  /**
   * Constructor for creating an ApiError instance.
   * @param statusCode - The HTTP status code for the error.
   * @param message - The error message.
   * @param isOperational - Indicates whether the error is operational (default: true).
   * @param stack - Optional stack trace for the error.
   */
  constructor(
    statusCode: number,
    message: string,
    isOperational = true,
    stack?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }

    // Set the prototype explicitly to ensure instanceof checks work correctly.
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

export default ApiError;
