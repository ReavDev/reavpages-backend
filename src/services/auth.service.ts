import { IUser } from "../types/user.types";
import TokenService from "../services/token.service";
import UserService from "../services/user.service";
import ApiError from "../utils/apiErrorHandler.utils";
import httpStatus from "http-status";
import EmailService from "../services/email.service";

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
    const tokens = await TokenService.generateAuthTokens(user);

    // Send welcome email
    await EmailService.sendWelcomeEmail(user.email, user.firstName);

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
    const tokens = await TokenService.generateAuthTokens(user);

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
    const resetPasswordToken =
      await TokenService.generateResetPasswordToken(email);

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
    const emailVerificationToken =
      await TokenService.generateEmailVerificationToken(user);

    // Send verification email
    await EmailService.sendEmailVerification(
      user.email,
      emailVerificationToken,
    );

    return { message: "Verification email sent successfully" };
  },

  /**
   * Verify user's email
   * @param token - Email verification token
   * @returns Confirmation message
   * @throws ApiError if token is invalid or expired
   */
  verifyEmail: async (token: string) => {
    try {
      // Verify the token
      const payload = await TokenService.verifyToken(token, "verifyEmail");

      // Find the user by email
      const user = await UserService.getUserByEmail(payload.userEmail);

      if (!user) {
        throw ApiError(httpStatus.NOT_FOUND, "User not found");
      }

      if (user.isEmailVerified) {
        throw ApiError(httpStatus.BAD_REQUEST, "Email already verified");
      }

      // Update the isEmailVerified field
      await UserService.updateUser(user.id, { isEmailVerified: true });

      // Cleanup: delete the token after successful verification
      await TokenService.deleteToken(token);

      return { message: "Email verified successfully" };
    } catch (error) {
      console.log(error);
      throw ApiError(httpStatus.UNAUTHORIZED, "Email verification failed");
    }
  },
};

export default AuthService;
