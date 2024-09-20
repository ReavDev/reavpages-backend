import mongoose, { Schema } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import { IUser, IUserModel } from "../types/user.types";

/**
 * User schema definition.
 * @constant userSchema
 * @type {Schema<IUser>}
 */
const userSchema: Schema<IUser> = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email");
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      validate(value: string) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number",
          );
        }
      },
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    twoFAEnabled: {
      type: Boolean,
      default: false,
    },
    twoFAType: {
      type: String,
      enum: ["email", "phone"],
      default: "email",
    },
  },
  {
    timestamps: true,
  },
);

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
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

/**
 * The User model based on the User schema.
 * @constant User
 * @type {IUserModel}
 */
const User: IUserModel = mongoose.model<IUser, IUserModel>("User", userSchema);

export default User;
