import jwt from "jsonwebtoken";
import moment from "moment";
import httpStatus from "http-status";
import config from "../config/config";
import userService from "./user.service";
import { IToken } from "../types/token.types";
import Token from "../models/token.model";
import ApiError from "../utils/apiErrorHandler.util";
import { FilterQuery } from "mongoose";
import crypto from "crypto";

/**
 * TokenService provides methods to manage authentication tokens (JWT and OTP).
 */
const TokenService = {
  /**
   * Generate token (JWT or OTP)
   * @param userEmail - The email of the user
   * @param expires - Expiration time of the token
   * @param type - Type of the token (access, refresh, otp)
   * @param tokenType - Type of the token to be generated (jwt or otp)
   * @param secret - Secret key for signing the token (used for JWT)
   * @returns Generated JWT token or OTP string
   */
  generateToken: (
    userEmail: string,
    expires: moment.Moment,
    type: string,
    tokenType: "jwt" | "otp" = "jwt",
    secret = config.token.secret,
  ): string => {
    if (tokenType === "jwt") {
      const payload = {
        sub: userEmail,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
      };
      return jwt.sign(payload, secret);
    } else {
      // Generate a 6-digit OTP
      return crypto.randomInt(100000, 999999).toString();
    }
  },

  /**
   * Save a token (JWT or OTP)
   * @param token - Token string (JWT or OTP)
   * @param userId - ID of the user
   * @param userEmail - Email of the user
   * @param expires - Expiration time of the token
   * @param type - Type of the token (access, refresh, otp, etc.)
   * @param blacklisted - Whether the token is blacklisted
   * @param tokenType - Type of the token to be stored (jwt or otp)
   * @returns The created Token document
   */
  saveToken: async (
    token: string,
    userId: string,
    userEmail: string,
    expires: moment.Moment,
    type: string,
    blacklisted = false,
    tokenType: "jwt" | "otp" = "jwt",
  ): Promise<IToken> => {
    const tokenDoc = await Token.create({
      token,
      userId,
      userEmail,
      expires: expires.toDate(),
      type,
      blacklisted,
      tokenType,
    });
    return tokenDoc;
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
    const tokens = await Token.paginate(filter, options);
    return tokens;
  },

  /**
   * Delete a token
   * @param token - Token string to be deleted
   * @returns The result of the delete operation
   * @throws Error if token is not found
   */
  deleteToken: async (token: string): Promise<void> => {
    const result = await Token.deleteOne({ token });
    if (result.deletedCount === 0) {
      throw ApiError(
        httpStatus.NOT_FOUND,
        "Token not found or already deleted",
      );
    }
  },

  /**
   * Verify token and return token document (JWT or OTP)
   * @param token - Token string
   * @param type - Type of the token (access, refresh, otp, etc.)
   * @param tokenType - Type of the token (jwt or otp)
   * @returns The verified Token document
   * @throws Error if token is not found or invalid
   */
  verifyToken: async (
    token: string,
    type: string,
    tokenType: "jwt" | "otp",
  ): Promise<IToken> => {
    if (tokenType === "jwt") {
      const payload = jwt.verify(token, config.token.secret) as jwt.JwtPayload;
      const tokenDoc = await Token.findOne({
        token,
        type,
        userEmail: payload.sub,
        blacklisted: false,
      });
      if (!tokenDoc) {
        throw ApiError(httpStatus.NOT_FOUND, "Token not found");
      }
      return tokenDoc;
    } else {
      const tokenDoc = await Token.findOne({ token, type, blacklisted: false });
      if (!tokenDoc) {
        throw ApiError(httpStatus.NOT_FOUND, "OTP not found");
      }
      return tokenDoc;
    }
  },

  /**
   * Generate authentication tokens (access and refresh)
   * @param userEmail - User's email
   * @returns Authentication tokens including access and refresh tokens
   */
  generateAuthTokens: async (
    userEmail: string,
  ): Promise<{
    access: { token: string; expires: Date };
    refresh: { token: string; expires: Date };
  }> => {
    const accessTokenExpires = moment().add(
      config.token.accessExpirationMinutes,
      "minutes",
    );
    const accessToken = TokenService.generateToken(
      userEmail,
      accessTokenExpires,
      "access",
      "jwt",
    );

    const refreshTokenExpires = moment().add(
      config.token.refreshExpirationDays,
      "days",
    );
    const refreshToken = TokenService.generateToken(
      userEmail,
      refreshTokenExpires,
      "refresh",
      "jwt",
    );
    const user = await userService.getUserByEmail(userEmail);
    await TokenService.saveToken(
      refreshToken,
      user.id,
      userEmail,
      refreshTokenExpires,
      "refresh",
      false,
      "jwt",
    );

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
  },

  /**
   * Generate OTP for email verification or password reset
   * @param userEmail - User's email
   * @param type - OTP type (resetPassword, verifyEmail)
   * @returns Generated OTP
   */
  generateOTP: async (
    userEmail: string,
    type: "resetPassword" | "verifyEmail",
  ): Promise<string> => {
    const user = await userService.getUserByEmail(userEmail);

    if (!user) {
      throw ApiError(httpStatus.NOT_FOUND, "No user found with this email");
    }

    const expires = moment().add(config.token.otpExpirationMinutes, "minutes");
    const otpToken = TokenService.generateToken(
      userEmail,
      expires,
      type,
      "otp",
    );
    await TokenService.saveToken(
      otpToken,
      user.id,
      userEmail,
      expires,
      type,
      false,
      "otp",
    );
    return otpToken;
  },
};

export default TokenService;
