import nodemailer from "nodemailer";
import config from "../config/config";

/**
 * Email service for sending various types of emails.
 */
const EmailService = {
  /**
   * Create a transport object for sending emails.
   * @returns The nodemailer transport object.
   */
  createTransport() {
    return nodemailer.createTransport({
      ...config.email.smtp,
      secure: config.email.smtp.port === 465,
      logger: config.env === "development",
      debug: config.env === "development",
    });
  },

  /**
   * Verify the connection to the email server.
   */
  verifyConnection: async () => {
    const transport = EmailService.createTransport();
    if (config.env !== "test") {
      try {
        await transport.verify();
        console.log("Email service connection verified");
      } catch (error) {
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
    const transport = EmailService.createTransport();
    const msg = { from: config.email.from, to, subject, text };
    await transport.sendMail(msg);
  },

  /**
   * Send a password reset email.
   * @param to - Recipient email address.
   * @param token - Token for resetting the password.
   * @returns A promise that resolves when the email is sent.
   */
  sendPasswordResetEmail: async (to: string, token: string): Promise<void> => {
    const subject = "Reset Password";
    const resetPasswordUrl = `http://link-to-app/reset-password?token=${token}`;
    const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, please ignore this email.`;
    await EmailService.sendEmail(to, subject, text);
  },

  /**
   * Send a verification email.
   * @param to - Recipient email address.
   * @param token - Token for verifying the email.
   * @returns A promise that resolves when the email is sent.
   */
  sendEmailVerification: async (to: string, token: string): Promise<void> => {
    const subject = "Email Verification";
    const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
    const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, please ignore this email.`;
    await EmailService.sendEmail(to, subject, text);
  },
};

export default EmailService;
