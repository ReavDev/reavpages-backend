import mongoose, { Schema } from "mongoose";
import { IToken, ITokenModel } from "../types/token.types";

/**
 * Token schema definition.
 * @constant tokenSchema
 * @type {Schema<IToken>}
 */
const tokenSchema: Schema<IToken> = new Schema(
  {
    token: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["access", "refresh", "resetPassword", "verifyEmail"],
      required: true,
    },
    expires: {
      type: Date,
      required: true,
    },
    blacklisted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * The Token model based on the Token schema.
 * @constant Token
 * @type {ITokenModel}
 */
const Token: ITokenModel = mongoose.model<IToken, ITokenModel>(
  "Token",
  tokenSchema,
);

export default Token;
