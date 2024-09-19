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
 * Generate token
 * @param userId - The ID of the user
 * @param expires - Expiration time of the token
 * @param type - Type of the token
 * @param secret - Secret key for signing the token
 * @returns Generated JWT token
 */
const generateToken = (
  userId: string,
  expires: moment.Moment,
  type: string,
  secret = config.jwt.secret,
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Save a token
 * @param token - Token string
 * @param userId - ID of the user
 * @param expires - Expiration time of the token
 * @param type - Type of the token
 * @param blacklisted - Whether the token is blacklisted
 * @returns The created Token document
 */
const saveToken = async (
  token: string,
  userId: string,
  expires: moment.Moment,
  type: string,
  blacklisted = false,
): Promise<IToken> => {
  const tokenDoc = await Token.create({
    token,
    user: userId,
    expires: expires.toDate(),
    type,
    blacklisted,
  });
  return tokenDoc;
};

/**
 * Verify token and return token document
 * @param token - Token string
 * @param type - Type of the token
 * @returns The verified Token document
 * @throws Error if token is not found or invalid
 */
const verifyToken = async (token: string, type: string): Promise<IToken> => {
  const payload = jwt.verify(token, config.jwt.secret) as jwt.JwtPayload;
  const tokenDoc = await Token.findOne({
    token,
    type,
    user: payload.sub,
    blacklisted: false,
  });
  if (!tokenDoc) {
    throw new Error("Token not found");
  }
  return tokenDoc;
};

/**
 * Generate authentication tokens
 * @param user - User document
 * @returns Authentication tokens including access and refresh tokens
 */
const generateAuthTokens = async (
  user: IUser,
): Promise<{
  access: { token: string; expires: Date };
  refresh: { token: string; expires: Date };
}> => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    "minutes",
  );
  const accessToken = generateToken(user.id, accessTokenExpires, "access");

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    "days",
  );
  const refreshToken = generateToken(user.id, refreshTokenExpires, "refresh");
  await saveToken(refreshToken, user.id, refreshTokenExpires, "refresh");

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
};

/**
 * Generate reset password token
 * @param email - User's email
 * @returns Reset password token
 * @throws ApiError if no user is found with the provided email
 */
const generateResetPasswordToken = async (email: string): Promise<string> => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw ApiError(httpStatus.NOT_FOUND, "No user found with this email");
  }
  const expires = moment().add(
    config.jwt.resetPasswordExpirationMinutes,
    "minutes",
  );
  const resetPasswordToken = generateToken(user.id, expires, "resetPassword");
  await saveToken(resetPasswordToken, user.id, expires, "resetPassword");
  return resetPasswordToken;
};

/**
 * Generate verify email token
 * @param user - User document
 * @returns Verify email token
 */
const generateVerifyEmailToken = async (user: IUser): Promise<string> => {
  const expires = moment().add(
    config.jwt.verifyEmailExpirationMinutes,
    "minutes",
  );
  const verifyEmailToken = generateToken(user.id, expires, "verifyEmail");
  await saveToken(verifyEmailToken, user.id, expires, "verifyEmail");
  return verifyEmailToken;
};

export {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
};
