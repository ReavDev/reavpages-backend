import { IUser } from "../types/user.types";
import {
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
} from "../services/token.service";
import UserService from "../services/user.service";
import ApiError from "../utils/apiErrorHandler.utils";
import httpStatus from "http-status";
import EmailService from "..//services/email.service";

/**
 * Auth service that provides various authentication-related functionalities.
 */
const AuthService = {
  /**
   * Register a new user
   * @param userData - User data for creation
   * @returns The created user and JWT tokens
   * @throws ApiError if email is already in use
   */
  register: async (userData: Partial<IUser>) => {
    // Create a new user
    const user = await UserService.createUser(userData);

    // Generate JWT tokens
    const tokens = await generateAuthTokens(user);

    // Send verification email
    await AuthService.sendEmailVerification(user);

    return { user, tokens };
  },

  /**
   * Login a user
   * @param email - User's email address
   * @param password - User's password
   * @returns JWT tokens
   * @throws ApiError if email or password is incorrect
   */
  login: async (email: string, password: string) => {
    // Find user by email
    const user = await UserService.getUserByEmail(email);

    // Check password
    if (!(await user.isPasswordMatch(password))) {
      throw ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
    }

    // Generate JWT tokens
    const tokens = await generateAuthTokens(user);

    return { user, tokens };
  },

  /**
   * Generate and send password reset token
   * @param email - User's email address
   * @returns Confirmation message
   * @throws ApiError if no user is found with the provided email
   */
  passwordReset: async (email: string) => {
    // Check if email exists
    await UserService.getUserByEmail(email);

    // Generate and store reset password token
    const resetPasswordToken = await generateResetPasswordToken(email);

    // Send password reset email
    await EmailService.sendPasswordResetEmail(email, resetPasswordToken);

    return { message: "Password reset email sent successfully" };
  },

  /**
   * Generate and send email verification token
   * @param user - User object
   * @returns Confirmation message
   */
  sendEmailVerification: async (user: IUser) => {
    // Generate email verification token
    const verifyEmailToken = await generateVerifyEmailToken(user);

    // Send verification email
    await EmailService.sendEmailVerification(user.email, verifyEmailToken);

    return { message: "Verification email sent successfully" };
  },
};

export default AuthService;
