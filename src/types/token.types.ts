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
   * The user associated with this token.
   * @type {mongoose.Types.ObjectId}
   */
  user: mongoose.Types.ObjectId;

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
 * Interface representing a Token model in MongoDB.
 * @interface ITokenModel
 * @extends Model<IToken>
 */
export interface ITokenModel extends Model<IToken> {}
