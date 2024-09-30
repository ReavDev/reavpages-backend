import mongoose, { Document, Model, FilterQuery } from "mongoose";

/**
 * Interface representing a Token document in MongoDB.
 * @interface IToken
 * @extends Document
 */
export interface IToken extends Document {
  /**
   * The actual token string.
   * @type {string}
   */
  token: string;

  /**
   * The user ID associated with this token.
   * @type {mongoose.Types.ObjectId}
   */
  userId: mongoose.Types.ObjectId;

  /**
   * The type of token (e.g., access, refresh, reset password, verify email, twoFa).
   * @type {string}
   */
  type: string;

  /**
   * The type of token to be stored (JWT or OTP).
   * @type {string}
   * @example "jwt"
   */
  tokenType: "jwt" | "otp";

  /**
   * The expiry date of the token.
   * @type {Date}
   */
  expires: Date;

  /**
   * Indicates whether the token has been blacklisted.
   * @type {boolean}
   */
  blacklisted: boolean;

  /**
   * Number of OTP requests made by the user
   * @type {number}
   */
  otpRequestCount: number;

  /**
   * Time period (in minutes) to wait before generating another OTP
   * @type {number}
   */
  otpCooldownPeriod: number;
}

/**
 * Interface representing static methods available on the Token model.
 */
export interface ITokenModel extends Model<IToken> {
  /**
   * Performs a paginated query on the model.
   *
   * @param filter - MongoDB filter query
   * @param options - Pagination options
   * @returns A promise that resolves to the paginated query result
   */
  paginate(
    filter: FilterQuery<IToken>,
    options: PaginateOptions,
  ): Promise<QueryResult<IToken>>;
}
