import mongoose, { Schema, Query, UpdateQuery } from "mongoose";
import { IToken, ITokenModel } from "../types/token.types";
import toJSON from "./plugins/toJSON.plugin";
import paginate from "./plugins/paginate.plugin";
import bcrypt from "bcryptjs";

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
    type: {
      type: String,
      enum: ["access", "refresh", "resetPassword", "verifyEmail"],
      required: true,
    },
    tokenType: {
      type: String,
      enum: ["jwt", "otp"],
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
    otpRequestCount: {
      type: Number,
    },
    otpCooldownPeriod: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

// Apply the plugins to the token schema
tokenSchema.plugin(toJSON);
tokenSchema.plugin(paginate);

/**
 * Pre-save middleware to hash the token before saving the token document if the token field is modified.
 *
 * @param next - The callback function to pass control to the next middleware.
 */
tokenSchema.pre<IToken>("save", async function (next) {
  if (this.isModified("token")) {
    this.token = await bcrypt.hash(this.token, 10);
  }
  next();
});

/**
 * Pre-update middleware to hash the token before updating the token document if the token field is modified.
 *
 * @param next - The callback function to pass control to the next middleware.
 */
tokenSchema.pre<Query<IToken, IToken>>(
  "findOneAndUpdate",
  async function (next) {
    const update = (this.getUpdate() as UpdateQuery<IToken>) || {};

    if (update.token) {
      update.token = await bcrypt.hash(update.token, 10);
    }

    this.setUpdate(update);
    next();
  },
);

/**
 * Pre-update middleware to hash the token before updating the token document if the token field is modified.
 *
 * @param next - The callback function to pass control to the next middleware.
 */
tokenSchema.pre<Query<IToken, IToken>>("updateOne", async function (next) {
  const update = (this.getUpdate() as UpdateQuery<IToken>) || {};

  if (update.token) {
    update.token = await bcrypt.hash(update.token, 10);
  }

  this.setUpdate(update);
  next();
});

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
