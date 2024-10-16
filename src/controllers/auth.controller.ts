import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import AuthService from "../services/auth.service";
import ApiError from "../utils/apiErrorHandler.util";

/**
 * AuthController providing various authentication-related functionalities.
 */
const AuthController = {
  /**
   * Register a new user
   * @param req - Express request object
   * @param res - Express response object
   * @param next - The Express next middleware function
   */
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, adminSecret } = req.body;
      const { user, tokens } = await AuthService.register(
        { email, password },
        adminSecret,
      );

      res.status(httpStatus.CREATED).json({
        status: "success",
        message:
          user.role === "superAdmin"
            ? "Super admin created successfully, please check your mail for verification!"
            : "User created successfully, please check your mail for verification!",
        data: {
          user,
          tokens,
        },
      });
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
  },

  /**
   * Login a user
   * @param req - Express request object
   * @param res - Express response object
   * @param next - The Express next middleware function
   */
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const { user, tokens } = await AuthService.login(email, password);
      res.status(httpStatus.OK).json({
        status: "success",
        message:
          user.twoFaEnabled === true
            ? "User logged in successfully, kindly input 2FA code!"
            : "User logged in successfully!",
        data: {
          user,
          tokens,
        },
      });
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
  },

  /**
   * Reset password
   * @param req - Express request object
   * @param res - Express response object
   * @param next - The Express next middleware function
   */
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await AuthService.resetPassword(email);
      res.status(httpStatus.OK).json({ status: "success", ...result });
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
  },

  /**
   * Update password
   * @param req - Express request object
   * @param res - Express response object
   * @param next - The Express next middleware function
   */
  updatePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, token, newPassword } = req.body;
      const result = await AuthService.updatePassword(
        email,
        token,
        newPassword,
      );

      res.status(httpStatus.OK).json({ status: "success", ...result });
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
  },

  /**
   * Verify email
   * @param req - Express request object
   * @param res - Express response object
   * @param next - The Express next middleware function
   */
  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      const result = await AuthService.verifyEmail(token);
      res.status(httpStatus.OK).json({ status: "success", ...result });
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
  },

  /**
   * Enable 2FA
   * @param req - Express request object
   * @param res - Express response object
   * @param next - The Express next middleware function
   */
  enableTwoFa: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, token } = req.body;
      const result = await AuthService.enableTwoFa(email, token);
      res.status(httpStatus.OK).json({ status: "success", ...result });
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
  },

  /**
   * Disable 2FA
   * @param req - Express request object
   * @param res - Express response object
   * @param next - The Express next middleware function
   */
  disableTwoFa: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, token } = req.body;
      const result = await AuthService.disableTwoFa(email, token);
      res.status(httpStatus.OK).json({ status: "success", ...result });
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
  },

  /**
   * Request an OTP for 2FA
   * @param req - Express request object
   * @param res - Express response object
   * @param next - The Express next middleware function
   */
  requestOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await AuthService.requestOtp(email);
      res.status(httpStatus.OK).json({ status: "success", ...result });
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
  },

  /**
   * Verify OTP for 2FA
   * @param req - Express request object
   * @param res - Express response object
   * @param next - The Express next middleware function
   */
  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, token } = req.body;
      const result = await AuthService.verifyOtp(email, token);
      res.status(httpStatus.OK).json({ status: "success", ...result });
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
  },
};

export default AuthController;
