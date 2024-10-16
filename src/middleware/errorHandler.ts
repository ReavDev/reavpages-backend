import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

/**
 * Global error handling middleware for logging errors and sending appropriate responses.
 * This should be added at the end of all route definitions to catch any errors that occur
 * during the request-response cycle.
 *
 * @param err - The error object (extended with statusCode and isOperational properties).
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The Express next middleware function (for chaining).
 *
 * @example
 * app.use(errorHandler);
 */
const errorHandler = (
  err: Error & { statusCode?: number; isOperational?: boolean },
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction,
) => {
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || "Internal Server Error";

  // Send JSON response with the error status and message
  res.status(statusCode).json({
    status: "error",
    message,
  });
};

export default errorHandler;
