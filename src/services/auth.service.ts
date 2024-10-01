import { IUser } from "../types/user.types";
import TokenService from "../services/token.service";
import UserService from "../services/user.service";
import ApiError from "../utils/apiErrorHandler.util";
import httpStatus from "http-status";
import EmailService from "../services/email.service";
import config from "../config/config";
import User from "../models/user.model";
import validator from "validator";
import MessagingService from "./messaging.service";
import mongoose from "mongoose";

/**
 * Auth service that provides various authentication-related functionalities.
 */
const AuthService = {
  /**
   * Register a new user
   * @param userData - User data for creation
   * @param adminSecret - (optional) Admin secret for assigning the super admin role
   * @returns The created user and JWT tokens
   * @throws ApiError if email is already in use or invalid admin secret
   */
  register: async (userData: Partial<IUser>, adminSecret?: string) => {
    try {
      let role: "user" | "admin" | "superAdmin" | undefined = undefined;

      if (!userData || !userData.email) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User Data not provided");
      }

      // Validate email
      if (!validator.isEmail(userData.email || "")) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid email format");
      }

      // Validate password
      if (!userData.password || userData.password.length < 6) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Password must be at least 6 characters long",
        );
      }
      if (
        !userData.password.match(/\d/) ||
        !userData.password.match(/[a-zA-Z]/)
      ) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Password must contain at least one letter and one number",
        );
      }

      // Check if email is already taken
      if (await User.isEmailTaken(userData.email)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "An account with this email address already exists. Please log in or reset your password if you've forgotten it",
        );
      }

      // If the adminSecret is provided and correct, assign the super-admin role
      if (adminSecret && adminSecret === config.adminSecret) {
        role = "superAdmin";

        // Check if a super admin already exists
        const user = await User.findOne({ role: "superAdmin" });
        if (user) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "A super admin already exists",
          );
        }
      }

      // Create a new user
      const user = await UserService.createUser({ ...userData, role });

      // Generate JWT tokens
      const tokens = await TokenService.generateAuthTokens({ _id: user._id });

      // Send welcome email
      await EmailService.sendWelcomeEmail(user.email);

      // Send verification email
      await AuthService.sendEmailVerification(user.email);

      return { user, tokens };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Login a user
   * @param email - User's email address
   * @param password - User's password
   * @param otp - (optional) The 2FA verification token
   * @returns JWT tokens
   * @throws ApiError if email or password is incorrect, or if 2FA verification fails
   */
  login: async (email: string, password: string, otp?: string) => {
    try {
      const user = await UserService.getUserByEmail(email);

      // Check password
      if (!(await user.isPasswordMatch(password))) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Incorrect email or password",
        );
      }

      // Check email verification
      if (!user.isEmailVerified) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Email not verified");
      }

      if (user.twoFaEnabled) {
        if (!otp) {
          throw new ApiError(httpStatus.UNAUTHORIZED, "2FA token is required");
        }

        await AuthService.verifyOtp(email, otp);
      }

      const tokens = await TokenService.generateAuthTokens({ _id: user._id });
      return { user, tokens };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Generate and send password reset token
   * @param email - User's email address
   * @returns Confirmation message
   * @throws ApiError if no user is found with the provided email
   */
  resetPassword: async (email: string) => {
    try {
      // Check if email exists
      const user = await UserService.getUserByEmail(email);

      // Generate and store reset password token
      const resetPasswordToken = await TokenService.generateOTP({
        userId: new mongoose.Types.ObjectId(user._id),
        type: "resetPassword",
      });

      // Send password reset email
      await EmailService.sendPasswordResetEmail(email, resetPasswordToken);

      return { message: "Password reset email sent successfully" };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Verify OTP and update the user's password
   * @param email - User's email address
   * @param token - The OTP sent to the user for verification
   * @param newPassword - The new password to be set for the user
   * @returns Success message
   * @throws ApiError if the OTP is invalid or if the new password doesn't meet the criteria
   */
  updatePassword: async (email: string, token: string, newPassword: string) => {
    try {
      // Validate new password
      if (!newPassword || newPassword.length < 6) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Password must be at least 6 characters long",
        );
      }
      if (!newPassword.match(/\d/) || !newPassword.match(/[a-zA-Z]/)) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Password must contain at least one letter and one number",
        );
      }

      // Fetch user by email
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
      }

      // Verify the OTP
      await TokenService.verifyToken(token, "resetPassword", "otp");

      // Update the password
      await UserService.updateUser(user._id, {
        password: newPassword,
      });

      return { message: "Password updated successfully" };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Generate and send email verification token
   * @param user - User object
   * @returns Confirmation message
   */
  sendEmailVerification: async (email: string) => {
    try {
      // Check if email exists
      const user = await UserService.getUserByEmail(email);

      // Generate email verification token
      const emailVerificationToken = TokenService.generateToken({
        userId: new mongoose.Types.ObjectId(user._id),
        type: "verifyEmail",
        tokenType: "jwt",
      });

      // Send verification email
      await EmailService.sendEmailVerification(email, emailVerificationToken);

      return { message: "Verification email sent successfully" };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Verify user's email
   * @param token - Email verification token
   * @returns Confirmation message
   * @throws ApiError if token is invalid or expired
   */
  verifyEmail: async (token: string) => {
    try {
      // Check if token is provided
      if (!token) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Email verification token not provided",
        );
      }

      // Verify the token
      const payload = await TokenService.verifyToken(
        token,
        "verifyEmail",
        "otp",
      );

      if (typeof payload === "boolean") {
        if (!payload) {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Email verification failed",
          );
        }
        throw new ApiError(httpStatus.BAD_REQUEST, "Invalid token type");
      }

      if (!payload || !payload.sub) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email verification failed");
      }

      // Find the user by id
      const user = await UserService.getUserById(payload.sub);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
      }

      if (user.isEmailVerified) {
        throw new ApiError(httpStatus.BAD_REQUEST, "Email already verified");
      }

      // Update the isEmailVerified field
      await UserService.updateUser(user._id, { isEmailVerified: true });

      return { message: "Email verified successfully" };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Enable 2FA for a user
   * @param email - User's email address
   * @param token - The 2FA verification token
   * @returns Confirmation message
   * @throws ApiError if user is not found or 2FA is already enabled
   */
  enableTwoFa: async (email: string, token: string) => {
    try {
      // Verify the 2FA token to confirm enabling
      await AuthService.verifyOtp(email, token);

      // Enable 2FA by updating the status
      const user = await UserService.getUserByEmail(email);
      await UserService.updateUser(user._id, {
        twoFaEnabled: true,
      });

      return { message: "2FA enabled successfully" };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Disable 2FA for a user
   * @param email - User's email address
   * @param token - The 2FA verification token
   * @returns Success message
   * @throws ApiError if token is invalid or 2FA is not enabled
   */
  disableTwoFa: async (email: string, token: string) => {
    try {
      // Verify the 2FA token to confirm disabling
      await AuthService.verifyOtp(email, token);

      // Disable 2FA by updating the status
      const user = await UserService.getUserByEmail(email);
      await UserService.updateUser(user._id, {
        twoFaEnabled: false,
      });

      return { message: "2FA disabled successfully" };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Verify the OTP token
   * @param email - User's email address
   * @param token - The 2FA verification token
   * @returns Success message
   * @throws ApiError if token is invalid
   */
  verifyOtp: async (email: string, token: string) => {
    try {
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
      }

      // Verify the provided 2FA token
      await TokenService.verifyToken(token, "twoFa", "otp");

      return { message: "2FA verified successfully" };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Request a one-time password (OTP) for 2FA
   * @param email - User's email address
   * @returns Confirmation message
   * @throws ApiError if no user is found with the provided email or if 2FA is not enabled
   */
  requestOtp: async (email: string) => {
    try {
      const user = await UserService.getUserByEmail(email);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
      }

      if (!user.twoFaEnabled) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "2FA is not enabled for this user",
        );
      }

      // Generate and send OTP
      const otp = await TokenService.generateOTP({
        userId: new mongoose.Types.ObjectId(user._id),
        type: "twoFa",
      });
      await MessagingService.sendOtpMessage(user.phone, otp);

      return { message: "OTP sent successfully" };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },
};

export default AuthService;
