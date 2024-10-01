import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import ApiError from "../utils/apiErrorHandler.util";
import TokenService from "../services/token.service";
import UserService from "../services/user.service";

/**
 * Middleware to guard routes for authenticated admin users.
 *
 * This middleware verifies the JWT token, extracts the user's email,
 * checks if the user exists and if the user's role is 'admin',
 * and proceeds if the user is authenticated as an admin.
 * If no valid token is provided, the user does not exist, or
 * the user is not an admin, it throws an error.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @throws {ApiError} If the token is missing, invalid, the user is not found,
 *                    or the user is not authorized as an admin.
 */
export const adminGuard = async (
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
        new ApiError(httpStatus.UNAUTHORIZED, "Access token not provided"),
      );
    }

    // Verify the token and extract the payload
    const payload = await TokenService.verifyToken(token, "access", "jwt");

    if (typeof payload === "boolean") {
      if (!payload) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid token payload");
      }
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid token type");
    }

    if (!payload || !payload.sub) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid token payload");
    }

    // Fetch the user by their email from the payload
    const user = await UserService.getUserById(payload.sub);

    // Check if the user has the 'admin' role
    if (user.role !== "admin") {
      return next(
        new ApiError(httpStatus.FORBIDDEN, "Forbidden: Admin access required"),
      );
    }

    // Proceed with the request
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    return next(
      new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      ),
    );
  }
};
