import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import ApiError from "../utils/apiErrorHandler.util";
import UserService from "../services/user.service";
import TokenService from "../services/token.service";

/**
 * Middleware to guard routes that require Super Admin access.
 *
 * This middleware verifies the JWT token, extracts the user's email,
 * checks if the user exists, and ensures they have the 'superAdmin' role.
 * If the user doesn't meet these conditions, the request is rejected.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next middleware function.
 * @throws {ApiError} If the token is missing, invalid, or the user does not have sufficient permissions.
 */
export const superAdminGuard = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Extract the Authorization header and split to get the token
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

    // Check if the user has the 'superAdmin' role
    if (user.role !== "superAdmin") {
      return next(
        new ApiError(
          httpStatus.FORBIDDEN,
          "Forbidden: Super Admin access required",
        ),
      );
    }

    // Proceed with request
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
