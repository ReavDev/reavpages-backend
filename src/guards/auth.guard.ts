import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import ApiError from "../utils/apiErrorHandler.util";
import TokenService from "../services/token.service";
import UserService from "../services/user.service";

/**
 * Middleware to guard routes for any authenticated users.
 *
 * This middleware verifies the JWT token, extracts the user's email,
 * checks if the user exists, and proceeds if the user is authenticated.
 * It does not check roles — that is done by separate role-based guards.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @throws {ApiError} If the token is missing, invalid, or the user is not authenticated.
 */
export const authGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    // Extract the token from the Authorization header
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    // If no token is provided, throw an unauthorized error
    if (!token) {
      return next(
        ApiError(httpStatus.UNAUTHORIZED, "Access token not provided"),
      );
    }

    // Verify the token and extract the payload
    const payload = await TokenService.verifyToken(token, "access");

    // If the payload doesn't contain userEmail, throw a User not found error
    if (!payload.userEmail) {
      return next(ApiError(httpStatus.NOT_FOUND, "User not found"));
    }

    // Fetch the user by their email from the payload
    const user = await UserService.getUserByEmail(payload.userEmail);

    // Ensure the user exists and has a defined role
    if (!user || typeof user.role === "undefined") {
      return next(ApiError(httpStatus.FORBIDDEN, "Forbidden: Access required"));
    }

    // Proceed with the request
    next();
  } catch {
    // If any error occurs, throw an internal server error
    return next(
      ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Something went wrong"),
    );
  }
};
