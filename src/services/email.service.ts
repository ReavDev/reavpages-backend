import nodemailer from "nodemailer";
import config from "../config/config";
import ApiError from "../utils/apiErrorHandler.util";
import httpStatus from "http-status";

/**
 * Create a transport object for sending emails.
 * @returns The nodemailer transport object.
 */
const transport = nodemailer.createTransport({
  ...config.email.smtp,
  secure: config.email.smtp.port === 465,
  logger: config.env === "development",
  debug: config.env === "development",
});

/**
 * Email service for sending various types of emails.
 */
const EmailService = {
  /**
   * Verify the connection to the email server.
   */
  verifyConnection: async () => {
    if (config.env !== "test") {
      try {
        await transport.verify();
        console.log("Email service connection verified");
      } catch {
        console.error(
          "Unable to connect to email server. Ensure SMTP options are correctly configured in .env",
        );
      }
    }
  },

  /**
   * Send an email.
   * @param to - Recipient email address.
   * @param subject - Subject of the email.
   * @param text - Body of the email.
   * @returns A promise that resolves when the email is sent.
   */
  sendEmail: async (
    to: string,
    subject: string,
    text: string,
  ): Promise<void> => {
    try {
      await transport.sendMail({ from: config.email.from, to, subject, text });
    } catch {
      throw ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to send email. Please try again later.",
      );
    }
  },

  /**
   * Send a welcome email to a new user.
   * @param to - Recipient email address.
   * @returns A promise that resolves when the email is sent.
   */
  sendWelcomeEmail: async (to: string): Promise<void> => {
    const subject = "Welcome to Reavpages";
    const text = `Hello ${to},

Welcome to Reavpages! We're excited to have you on board.

Here are a few things you can do to get started:
1. Setup your profile
2. Explore our features
3. Connect with other users

If you have any questions or need assistance, don't hesitate to reach out to our support team.

Best regards,
Reavpages`;
    try {
      await EmailService.sendEmail(to, subject, text);
    } catch {
      throw ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to send welcome email.",
      );
    }
  },

  /**
   * Send a password reset email.
   * @param to - Recipient email address.
   * @param token - Token for resetting the password.
   * @returns A promise that resolves when the email is sent.
   */
  sendPasswordResetEmail: async (to: string, token: string): Promise<void> => {
    const subject = "Reset Password";
    const text = `Dear ${to},
To reset your password, kindly use the OTP: ${token}
If you did not request any password resets, please ignore this email.`;
    try {
      await EmailService.sendEmail(to, subject, text);
    } catch {
      throw ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to send password reset email.",
      );
    }
  },

  /**
   * Send a verification email.
   * @param to - Recipient email address.
   * @param token - Token for verifying the email.
   * @returns A promise that resolves when the email is sent.
   */
  sendEmailVerification: async (to: string, token: string): Promise<void> => {
    const subject = "Confirm your email address";
    const text = `Dear ${to},
To verify your email, kindly use the OTP: ${token}
If you did not create an account, please ignore this email.`;
    try {
      await EmailService.sendEmail(to, subject, text);
    } catch {
      throw ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to send verification email.",
      );
    }
  },
};

export default EmailService;
