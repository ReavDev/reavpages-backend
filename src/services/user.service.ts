import User from "../models/user.model";
import { IUser } from "../types/user.types";
import ApiError from "../utils/apiErrorHandler.utils";
import httpStatus from "http-status";

/**
 * UserService provides methods to interact with user data.
 */
const UserService = {
  /**
   * Get a user by email
   * @param email - User's email address
   * @returns The user document if found
   * @throws ApiError if no user is found with the provided email
   */
  getUserByEmail: async (email: string): Promise<IUser> => {
    const user = await User.findOne({ email });
    if (!user) {
      throw ApiError(httpStatus.NOT_FOUND, "No user found with this email");
    }
    return user.toJSON();
  },

  /**
   * Get a user by user ID
   * @param userId - The ID of the user
   * @returns The user document if found
   * @throws ApiError if no user is found with the provided ID
   */
  getUserById: async (userId: string): Promise<IUser> => {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError(httpStatus.NOT_FOUND, "No user found with this ID");
    }
    return user.toJSON();
  },

  /**
   * Create a new user
   * @param userData - User data for creation
   * @returns The created user document
   * @throws ApiError if the email is already in use
   */
  createUser: async (userData: Partial<IUser>): Promise<IUser> => {
    const isEmailTaken = await User.isEmailTaken(userData.email ?? "");
    if (isEmailTaken) {
      throw ApiError(httpStatus.BAD_REQUEST, "Email already in use");
    }

    const user = new User(userData);
    await user.save();
    return user.toJSON();
  },

  /**
   * Update user details
   * @param userId - The ID of the user to update
   * @param updateData - Data to update
   * @returns The updated user document
   * @throws ApiError if no user is found with the provided ID
   */
  updateUser: async (
    userId: string,
    updateData: Partial<IUser>,
  ): Promise<IUser> => {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    if (!user) {
      throw ApiError(httpStatus.NOT_FOUND, "No user found with this ID");
    }
    return user.toJSON();
  },

  /**
   * Delete a user
   * @param userId - The ID of the user to delete
   * @returns The deleted user document
   * @throws ApiError if no user is found with the provided ID
   */
  deleteUser: async (userId: string): Promise<IUser> => {
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      throw ApiError(httpStatus.NOT_FOUND, "No user found with this ID");
    }
    return user.toJSON();
  },
};

export default UserService;
