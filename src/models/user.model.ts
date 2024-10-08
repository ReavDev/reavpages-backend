import mongoose, { Schema, Query, UpdateQuery } from "mongoose";
import bcrypt from "bcryptjs";
import { IUser, IUserModel } from "../types/user.types";
import toJSON from "./plugins/toJSON.plugin";
import paginate from "./plugins/paginate.plugin";

/**
 * User schema definition.
 * @constant userSchema
 * @type {Schema<IUser>}
 */
const userSchema: Schema<IUser> = new Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      private: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: String,
      required: false,
    },
    twoFaEnabled: {
      type: Boolean,
      default: false,
    },
    twoFaType: {
      type: String,
      enum: ["phone", "thirdParty"],
      default: "phone",
    },
    role: {
      type: String,
      enum: ["user", "admin", "superAdmin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

// Apply the plugins to the user schema
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Checks if the provided email is already taken by another user.
 *
 * @param email - The email address to check.
 * @param excludeUserId - An optional user ID to exclude from the check (useful when updating a user).
 * @returns A promise that resolves to `true` if the email is taken, otherwise `false`.
 */
userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: mongoose.Types.ObjectId,
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Compares the provided password with the user's stored hashed password.
 *
 * @param password - The plain text password to compare.
 * @returns A promise that resolves to `true` if the password matches, otherwise `false`.
 */
userSchema.methods.isPasswordMatch = async function (
  password: string,
): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(password, user.password);
};

/**
 * Pre-save middleware to hash the password before saving the user document if the password field is modified.
 *
 * @param next - The callback function to pass control to the next middleware.
 */
userSchema.pre<IUser>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

/**
 * Pre-update middleware to hash the password before updating the user document if the password field is modified.
 *
 * @param next - The callback function to pass control to the next middleware.
 */
userSchema.pre<Query<IUser, IUser>>("updateOne", async function (next) {
  const update = (this.getUpdate() as UpdateQuery<IUser>) || {};

  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
  }

  this.setUpdate(update);
  next();
});

/**
 * Pre-update middleware to hash the password before updating the user document if the password field is modified.
 *
 * @param next - The callback function to pass control to the next middleware.
 */
userSchema.pre<Query<IUser, IUser>>("findOneAndUpdate", async function (next) {
  const update = (this.getUpdate() as UpdateQuery<IUser>) || {};

  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
  }

  this.setUpdate(update);
  next();
});

/**
 * The User model based on the User schema.
 * @constant User
 * @type {IUserModel}
 */
const User: IUserModel = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
