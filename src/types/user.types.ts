import mongoose, { Document, Model } from "mongoose";

/**
 * Interface representing a User document in MongoDB.
 */
export interface IUser extends Document {
  /**
   * The unique identifier of the user.
   * @example "60c72b2f9b1e8b001f8e4e67"
   */
  id: string;

  /**
   * The first name of the user.
   * @example "John"
   */
  firstName: string;

  /**
   * The last name of the user.
   * @example "Doe"
   */
  lastName: string;

  /**
   * The email address of the user.
   * Must be a valid email format.
   * @example "john.doe@example.com"
   */
  email: string;

  /**
   * The hashed password of the user.
   * @example "$2a$08$N0oR8LQqU3WmcXivzO9K2u0L2l5ZoT5q91/x1Pv5vv9EJhLOj4bE2"
   */
  password: string;

  /**
   * Indicates whether the user's email has been verified.
   * @example true
   */
  isEmailVerified: boolean;

  /**
   * Indicates whether two-factor authentication (2FA) is enabled for the user.
   * @example true
   */
  twoFAEnabled: boolean;

  /**
   * The type of two-factor authentication used by the user.
   * Possible values are "email" or "phone".
   * @example "email"
   */
  twoFAType: string;

  /**
   * The secret key used for two-factor authentication.
   * This is often a base32 encoded string.
   * @example "JBSWY3DPEHPK3PXP"
   */
  twoFASecret: string;

  /**
   * Checks if the provided password matches the user's hashed password.
   * @param {string} password - The plain text password to compare against the hashed password.
   * @returns {Promise<boolean>} - Returns true if the passwords match, otherwise false.
   * @throws {Error} - Throws an error if password comparison fails.
   */
  isPasswordMatch(password: string): Promise<boolean>;
}

/**
 * Interface representing static methods available on the User model.
 */
export interface IUserModel extends Model<IUser> {
  /**
   * Checks if the provided email is already taken by another user.
   * @param {string} email - The email to check.
   * @param {mongoose.Types.ObjectId} [excludeUserId] - The id of the user to exclude from the check. This is useful for update operations to exclude the current user's email from the check.
   * @returns {Promise<boolean>} - Returns true if the email is taken, otherwise false.
   * @throws {Error} - Throws an error if the email check operation fails.
   */
  isEmailTaken(
    email: string,
    excludeUserId?: mongoose.Types.ObjectId,
  ): Promise<boolean>;
}
