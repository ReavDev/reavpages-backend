/**
 * Factory function to create an ApiError instance.
 * @param statusCode - The HTTP status code for the error.
 * @param message - The error message.
 * @param isOperational - Indicates whether the error is operational (default: true).
 * @param stack - Optional stack trace for the error.
 * @returns {Error} - The created ApiError instance.
 */
const ApiError = (
  statusCode: number,
  message: string,
  isOperational = true,
  stack?: string,
): Error => {
  const error = new Error(message) as Error & {
    statusCode?: number;
    isOperational?: boolean;
  };
  error.statusCode = statusCode;
  error.isOperational = isOperational;
  if (stack) {
    error.stack = stack;
  } else {
    Error.captureStackTrace(error, ApiError);
  }
  return error;
};

export default ApiError;
