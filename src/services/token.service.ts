import jwt from "jsonwebtoken";
import moment from "moment";
import httpStatus from "http-status";
import config from "../config/config";
import userService from "./user.service";
import { IToken } from "../types/token.types";
import Token from "../models/token.model";
import ApiError from "../utils/apiErrorHandler.utils";
import { IUser } from "../types/user.types";

/**
 * TokenService provides methods to manage authentication tokens.
 */
const TokenService = {
  /**
   * Generate token
   * @param userEmail - The email of the user
   * @param expires - Expiration time of the token
   * @param type - Type of the token
   * @param secret - Secret key for signing the token
   * @returns Generated JWT token
   */
  generateToken: (
    userEmail: string,
    expires: moment.Moment,
    type: string,
    secret = config.jwt.secret,
  ): string => {
    const payload = {
      sub: userEmail,
      iat: moment().unix(),
      exp: expires.unix(),
      type,
    };
    return jwt.sign(payload, secret);
  },

  /**
   * Save a token
   * @param token - Token string
   * @param userId - ID of the user
   * @param userEmail - Email of the user
   * @param expires - Expiration time of the token
   * @param type - Type of the token
   * @param blacklisted - Whether the token is blacklisted
   * @returns The created Token document
   */
  saveToken: async (
    token: string,
    userId: string,
    userEmail: string,
    expires: moment.Moment,
    type: string,
    blacklisted = false,
  ): Promise<IToken> => {
    const tokenDoc = await Token.create({
      token,
      userId,
      userEmail,
      expires: expires.toDate(),
      type,
      blacklisted,
    });
    return tokenDoc;
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
      throw new Error("Token not found or already deleted");
    }
  },

  /**
   * Verify token and return token document
   * @param token - Token string
   * @param type - Type of the token
   * @returns The verified Token document
   * @throws Error if token is not found or invalid
   */
  verifyToken: async (token: string, type: string): Promise<IToken> => {
    const payload = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;
    console.log(payload);

    const tokenDoc = await Token.findOne({
      token,
      type,
      userEmail: payload.sub,
      blacklisted: false,
    });
    if (!tokenDoc) {
      throw new Error("Token not found");
    }
    return tokenDoc;
  },

  /**
   * Generate authentication tokens
   * @param user - User document
   * @returns Authentication tokens including access and refresh tokens
   */
  generateAuthTokens: async (
    user: IUser,
  ): Promise<{
    access: { token: string; expires: Date };
    refresh: { token: string; expires: Date };
  }> => {
    const accessTokenExpires = moment().add(
      config.jwt.accessExpirationMinutes,
      "minutes",
    );
    const accessToken = TokenService.generateToken(
      user.email,
      accessTokenExpires,
      "access",
    );

    const refreshTokenExpires = moment().add(
      config.jwt.refreshExpirationDays,
      "days",
    );
    const refreshToken = TokenService.generateToken(
      user.email,
      refreshTokenExpires,
      "refresh",
    );
    await TokenService.saveToken(
      refreshToken,
      user.id,
      user.email,
      refreshTokenExpires,
      "refresh",
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
   * Generate reset password token
   * @param email - User's email
   * @returns Reset password token
   * @throws ApiError if no user is found with the provided email
   */
  generateResetPasswordToken: async (email: string): Promise<string> => {
    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw ApiError(httpStatus.NOT_FOUND, "No user found with this email");
    }
    const expires = moment().add(
      config.jwt.resetPasswordExpirationMinutes,
      "minutes",
    );
    const resetPasswordToken = TokenService.generateToken(
      user.email,
      expires,
      "resetPassword",
    );
    await TokenService.saveToken(
      resetPasswordToken,
      user.id,
      user.email,
      expires,
      "resetPassword",
    );
    return resetPasswordToken;
  },

  /**
   * Generate email verification token
   * @param user - User document
   * @returns Email verification token
   */
  generateEmailVerificationToken: async (user: IUser): Promise<string> => {
    const expires = moment().add(
      config.jwt.verifyEmailExpirationMinutes,
      "minutes",
    );
    const emailVerificationToken = await TokenService.generateToken(
      user.email,
      expires,
      "verifyEmail",
    );
    await TokenService.saveToken(
      emailVerificationToken,
      user.id,
      user.email,
      expires,
      "verifyEmail",
    );
    return emailVerificationToken;
  },
};

export default TokenService;
