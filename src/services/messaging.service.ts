import twilio from "twilio";
import httpStatus from "http-status";
import config from "../config/config";
import ApiError from "../utils/apiErrorHandler.util";

/**
 * Initialize Twilio client transport.
 */
const transport = twilio(config.messaging.sid, config.messaging.authToken);

/**
 * Messaging service for sending various types of messages.
 */
const MessagingService = {
  /**
   * Send a message.
   * @param to - Recipient phone number.
   * @param text - Body of the message.
   * @returns A promise that resolves when the message is sent or rejects on failure.
   */
  sendMessage: async (to: string, text: string): Promise<void> => {
    try {
      await transport.messages.create({
        body: text,
        from: config.messaging.from,
        to,
      });
    } catch {
      throw ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Something went wrong");
    }
  },

  /**
   * Send an OTP message.
   * @param to - Recipient phone number.
   * @param token - OTP verification token.
   * @returns A promise that resolves when the message is sent.
   */
  sendOtpMessage: async (to: string, token: string): Promise<void> => {
    try {
      const text = `Your verification code is: ${token}`;
      MessagingService.sendMessage(to, text);
    } catch {
      throw ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Something went wrong");
    }
  },
};

export default MessagingService;
