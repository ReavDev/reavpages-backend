import mongoose, { Document, Model } from "mongoose";

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
   * The user email associated with this token.
   * @type {string}
   */
  userEmail: string;

  /**
   * The type of token (e.g., access, refresh, reset password, verify email).
   * @type {string}
   */
  type: string;

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
}

/**
 * Type representing a Token model in MongoDB.
 */
export type ITokenModel = Model<IToken>;
