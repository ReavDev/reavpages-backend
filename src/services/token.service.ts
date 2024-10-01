import jwt, { JwtPayload } from "jsonwebtoken";
import moment from "moment";
import httpStatus from "http-status";
import config from "../config/config";
import userService from "./user.service";
import { IUser } from "../types/user.types";
import { IToken } from "../types/token.types";
import Token from "../models/token.model";
import ApiError from "../utils/apiErrorHandler.util";
import mongoose, { FilterQuery } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

/**
 * TokenService provides methods to manage authentication tokens (JWT and OTP).
 */
const TokenService = {
  /**
   * Generate token (JWT or OTP)
   * @param tokenData - The data needed to generate a token
   * @returns Generated JWT token or OTP string
   */
  generateToken: (tokenData: Partial<IToken>): string => {
    const { userId, expires, type, tokenType } = tokenData;

    if (!tokenData) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Token data not provided");
    }

    try {
      if (tokenType === "jwt") {
        const payload = {
          sub: userId?.toString(),
          iat: moment().unix(),
          exp: expires
            ? Math.floor(expires.getTime() / 1000)
            : moment().unix() + 3600,
          type: type ?? "",
        };

        return jwt.sign(payload, config.token.secret);
      } else {
        // Generate a 6-digit OTP
        return crypto.randomInt(100000, 999999).toString();
      }
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
   * Create a token (JWT or OTP)
   * @param tokenData - Token data for creation
   * @returns The created Token document
   */
  createToken: async (tokenData: Partial<IToken>): Promise<IToken> => {
    try {
      const token = new Token(tokenData);
      await token.save();
      return token;
    } catch {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Update token details
   * @param tokenId - The ID of the token to update
   * @param updateData - Data to update
   * @returns The updated user document
   * @throws ApiError if no token is found with the provided ID
   */
  updateToken: async (
    tokenId: string,
    updateData: Partial<IToken>,
  ): Promise<IToken> => {
    try {
      const token = await Token.findByIdAndUpdate(tokenId, updateData, {
        new: true,
      });
      if (!token) {
        throw new ApiError(httpStatus.NOT_FOUND, "No token found with this ID");
      }
      return token;
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
   * Retrieve a token by its ID
   * @param tokenId - The ID of the token to retrieve
   * @returns The token document if found
   * @throws ApiError if token is not found
   */
  getTokenById: async (tokenId: string): Promise<IToken> => {
    try {
      const token = await Token.findById(tokenId);
      if (!token) {
        throw new ApiError(httpStatus.NOT_FOUND, "Token not found");
      }
      return token;
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
   * Query tokens based on filter query and pagination options.
   *
   * @param filter - MongoDB filter query for retrieving tokens
   * @param options - Pagination options (sort, page, limit, etc.)
   * @returns Paginated result of tokens
   */
  queryTokens: async (
    filter: FilterQuery<IToken>,
    options: PaginateOptions,
  ) => {
    try {
      const tokens = await Token.paginate(filter, options);
      return tokens;
    } catch {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Delete a token
   * @param tokenId - The ID of the token to be deleted
   * @returns The result of the delete operation
   * @throws Error if token is not found
   */
  deleteToken: async (tokenId: string): Promise<void> => {
    try {
      const result = await Token.findByIdAndDelete(tokenId);
      if (!result) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "Token not found or already deleted",
        );
      }
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
   * Verify token and return the status or payload
   * @param id - User ID
   * @param token - Token string
   * @param type - Type of the token (access, refresh, otp, etc.)
   * @param tokenType - Type of the token (jwt or otp)
   * @returns  True for OTP token or JwtPayload for JWT token
   * @throws Error if token is not found or invalid
   */
  verifyToken: async (
    token: string,
    type: string,
    tokenType: "jwt" | "otp",
    id?: string,
  ): Promise<boolean | JwtPayload> => {
    try {
      if (tokenType === "jwt") {
        // JWT token verification
        const payload = jwt.verify(token, config.token.secret) as JwtPayload;

        // Check if token has expired
        if (payload.exp && moment().isAfter(payload.exp)) {
          throw new ApiError(httpStatus.UNAUTHORIZED, "Expired token");
        }

        // Extra validation for refresh token
        if (type === "refresh") {
          if (!id) {
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              "User ID is not provided",
            );
          }

          const tokenDoc = await Token.findOne({ userId: id, type, tokenType });
          if (!tokenDoc) {
            throw new ApiError(
              httpStatus.NOT_FOUND,
              "Token not found, kindly generate a valid token",
            );
          }

          if (moment().isAfter(Math.floor(tokenDoc.expires.getTime() / 1000))) {
            await Token.findByIdAndDelete(tokenDoc._id);
            throw new ApiError(httpStatus.UNAUTHORIZED, "Expired token");
          }
          if (!tokenDoc || !(await bcrypt.compare(token, tokenDoc.token))) {
            throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token");
          }
        }

        return payload;
      } else {
        // OTP token verification
        if (!id) {
          throw new ApiError(httpStatus.BAD_REQUEST, "User ID is not provided");
        }

        const tokenDoc = await Token.findOne({ userId: id, type, tokenType });
        if (!tokenDoc) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            "Token not found, kindly generate a valid token",
          );
        }

        // Check if token has expired
        if (moment().isAfter(Math.floor(tokenDoc.expires.getTime() / 1000))) {
          throw new ApiError(httpStatus.UNAUTHORIZED, "Token has expired");
        }

        const isValid = await bcrypt.compare(token, tokenDoc.token);
        if (!isValid) {
          throw new ApiError(
            httpStatus.UNAUTHORIZED,
            "Invalid or expired OTP token",
          );
        }

        const result = await Token.findByIdAndDelete(tokenDoc._id);
        if (!result) {
          throw new ApiError(
            httpStatus.NOT_FOUND,
            "Token not found or already deleted",
          );
        }
        return true;
      }
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
   * Generate authentication tokens (access and refresh)
   * @param id - User's ID
   * @returns Authentication tokens including access and refresh tokens
   */
  generateAuthTokens: async (
    user: Partial<IUser>,
  ): Promise<{
    access: { token: string; expires: Date };
    refresh: { token: string; expires: Date };
  }> => {
    try {
      if (!user._id) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User ID not provided");
      }

      const accessTokenExpires = moment().add(
        config.token.accessExpirationMinutes,
        "minutes",
      );

      const accessToken = TokenService.generateToken({
        userId: new mongoose.Types.ObjectId(user._id),
        expires: accessTokenExpires.toDate(),
        type: "access",
        tokenType: "jwt",
      });

      const refreshTokenExpires = moment().add(
        config.token.refreshExpirationDays,
        "days",
      );

      const refreshToken = TokenService.generateToken({
        userId: new mongoose.Types.ObjectId(user._id),
        expires: refreshTokenExpires.toDate(),
        type: "refresh",
        tokenType: "jwt",
      });

      await TokenService.createToken({
        token: refreshToken,
        userId: new mongoose.Types.ObjectId(user._id),
        expires: refreshTokenExpires.toDate(),
        type: "refresh",
        blacklisted: false,
        tokenType: "jwt",
      });

      return {
        access: {
          token: accessToken,
          expires: accessTokenExpires.toDate(),
        },
        refresh: {
          token: refreshToken,
          expires: refreshTokenExpires.toDate(),
        },
      };
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
   * Check if OTP generation is allowed based on rate limiting
   * @param userId - The ID of the user
   * @returns Promise resolving to true if allowed, false otherwise
   */
  canGenerateOtp: async (userId: string): Promise<boolean> => {
    const now = moment();

    // Find existing OTP for the user
    const otpTokenDoc = await Token.findOne({
      userId,
      type: "otp",
    });

    // No OTP doc found, allow OTP generation
    if (!otpTokenDoc) {
      return true;
    }

    // Calculate time since creation and last update
    const createdAt = moment(otpTokenDoc.createdAt);
    const updatedAt = moment(otpTokenDoc.updatedAt);
    const timeSinceCreation = now.diff(createdAt, "minutes");
    const timeSinceLastUpdate = now.diff(updatedAt, "minutes");

    // Check if the user is in cooldown (1 minute for recent update, 1 hour for extended rate-limiting)
    if (timeSinceLastUpdate <= otpTokenDoc.otpCooldownPeriod) {
      return false;
    }

    // User has requested >= 5 OTPs within 10 minutes, enforce 1 hour cooldown
    if (
      otpTokenDoc.otpRequestCount >= config.token.otpMaxRequests &&
      timeSinceCreation <= config.token.otpRequestsWindow
    ) {
      otpTokenDoc.otpCooldownPeriod = config.token.otpExtendedCooldownTime;
      await otpTokenDoc.save();
      return false;
    }

    // Reset the cooldown period to initial cooldown
    otpTokenDoc.otpCooldownPeriod = config.token.otpCooldownTime;
    await otpTokenDoc.save();
    return true;
  },

  /**
   * Generate OTP for email verification or password reset
   * @param id - User's id
   * @param type - OTP type (resetPassword, verifyEmail)
   * @returns Generated OTP
   */
  generateOTP: async (
    id: string,
    type: "resetPassword" | "verifyEmail" | "twoFa",
  ): Promise<string> => {
    try {
      const user = await userService.getUserById(id);

      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "User not found");
      }

      const canGenerate = await TokenService.canGenerateOtp(id);

      if (!canGenerate) {
        throw new ApiError(
          httpStatus.FORBIDDEN,
          "Too many OTP requests. Please try again later.",
        );
      }

      const otpExpires = moment().add(
        config.token.otpExpirationMinutes,
        "minutes",
      );

      const otpToken = TokenService.generateToken({
        userId: new mongoose.Types.ObjectId(user._id),
        expires: otpExpires.toDate(),
        type,
        tokenType: "otp",
      });

      // Find an existing OTP document
      const existingOtpDoc = await Token.findOne({
        userId: user._id,
        type: "otp",
      });

      if (existingOtpDoc) {
        existingOtpDoc.token = otpToken;
        existingOtpDoc.otpRequestCount += 1;

        await existingOtpDoc.save();
      } else {
        await TokenService.createToken({
          token: otpToken,
          userId: new mongoose.Types.ObjectId(user._id),
          tokenType: "otp",
          type,
          expires: otpExpires.toDate(),
          blacklisted: false,
          otpCooldownPeriod: config.token.otpCooldownTime,
          otpRequestCount: 1,
        });
      }

      return otpToken;
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

export default TokenService;
