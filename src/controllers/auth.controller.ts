import { Request, Response } from "express";
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
   */
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, adminSecret } = req.body;
      const { user, tokens } = await AuthService.register(
        { email, password },
        adminSecret,
      );

      res.status(httpStatus.CREATED).json({
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
      throw ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Login a user
   * @param req - Express request object
   * @param res - Express response object
   */
  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const { user, tokens } = await AuthService.login(email, password);
      res.status(httpStatus.OK).json({ user, tokens });
    } catch (error) {
      throw ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Reset password
   * @param req - Express request object
   * @param res - Express response object
   */
  passwordReset: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = await AuthService.passwordReset(email);
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      throw ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Verify email
   * @param req - Express request object
   * @param res - Express response object
   */
  verifyEmail: async (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      const result = await AuthService.verifyEmail(token);
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      throw ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Enable 2FA
   * @param req - Express request object
   * @param res - Express response object
   */
  enableTwoFa: async (req: Request, res: Response) => {
    try {
      const { email, token } = req.body;
      const result = await AuthService.enableTwoFa(email, token);
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      throw ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Disable 2FA
   * @param req - Express request object
   * @param res - Express response object
   */
  disableTwoFa: async (req: Request, res: Response) => {
    try {
      const { email, token } = req.body;
      const result = await AuthService.disableTwoFa(email, token);
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      throw ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Request an OTP for 2FA
   * @param req - Express request object
   * @param res - Express response object
   */
  requestOtp: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      const result = await AuthService.requestOtp(email);
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      throw ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Verify OTP for 2FA
   * @param req - Express request object
   * @param res - Express response object
   */
  verifyOtp: async (req: Request, res: Response) => {
    try {
      const { email, token } = req.body;
      const result = await AuthService.verifyOtp(email, token);
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      throw ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },
};

export default AuthController;
