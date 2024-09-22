import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import AuthService from "../services/auth.service";
import UserService from "../services/user.service";

/**
 * AuthController providing various authentication-related functionalities.
 */
const AuthController = {
  /**
   * Register a new user
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  register: async (req: Request, res: Response, next: NextFunction) => {
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
      next(error);
    }
  },

  /**
   * Login a user
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const { user, tokens } = await AuthService.login(email, password);
      res.status(httpStatus.OK).json({ user, tokens });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Reset password
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  passwordReset: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const result = await AuthService.passwordReset(email);
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Verify email
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token } = req.body;
      const result = await AuthService.verifyEmail(token);
      res.status(httpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Enable 2FA
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  enable2FA: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      await UserService.updateUser(userId, { twoFAEnabled: true });
      res.status(httpStatus.OK).json({ message: "2FA enabled successfully" });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Disable 2FA
   * @param req - Express request object
   * @param res - Express response object
   * @param next - Express next function
   */
  disable2FA: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.body;
      await UserService.updateUser(userId, { twoFAEnabled: false });
      res.status(httpStatus.OK).json({ message: "2FA disabled successfully" });
    } catch (error) {
      next(error);
    }
  },
};

export default AuthController;
