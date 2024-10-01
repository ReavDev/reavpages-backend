import User from "../models/user.model";
import { IUser } from "../types/user.types";
import ApiError from "../utils/apiErrorHandler.util";
import httpStatus from "http-status";
import { FilterQuery } from "mongoose";

/**
 * UserService provides methods to interact with user data.
 */
const UserService = {
  /**
   * Query users based on filter query and pagination options.
   *
   * @param filter - MongoDB filter query for retrieving tokens
   * @param options - Pagination options (sort, page, limit, etc.)
   * @returns Paginated result of users
   */
  queryUsers: async (filter: FilterQuery<IUser>, options: PaginateOptions) => {
    try {
      const users = await User.paginate(filter, options);
      return users;
    } catch {
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Get a user by email
   * @param email - User's email address
   * @returns The user document if found
   * @throws ApiError if no user is found with the provided email
   */
  getUserByEmail: async (email: string): Promise<IUser> => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        throw new ApiError(
          httpStatus.NOT_FOUND,
          "No user found with this email",
        );
      }
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Get a user by user ID
   * @param userId - The ID of the user
   * @returns The user document if found
   * @throws ApiError if no user is found with the provided ID
   */
  getUserById: async (userId: string): Promise<IUser> => {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "No user found with this ID");
      }
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Create a new user
   * @param userData - User data for creation
   * @returns The created user document
   * @throws ApiError if the email is already in use
   */
  createUser: async (userData: Partial<IUser>): Promise<IUser> => {
    try {
      const isEmailTaken = await User.isEmailTaken(userData.email ?? "");
      if (isEmailTaken) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "An account with this email address already exists. Please log in or reset your password if you've forgotten it",
        );
      }

      const user = new User(userData);
      await user.save();
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
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
    try {
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      });
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "No user found with this ID");
      }
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },

  /**
   * Delete a user
   * @param userId - The ID of the user to delete
   * @returns The deleted user document
   * @throws ApiError if no user is found with the provided ID
   */
  deleteUser: async (userId: string): Promise<IUser> => {
    try {
      const user = await User.findByIdAndDelete(userId);
      if (!user) {
        throw new ApiError(httpStatus.NOT_FOUND, "No user found with this ID");
      }
      return user;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "An unexpected error occurred",
      );
    }
  },
};

export default UserService;
