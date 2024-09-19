import mongoose from "mongoose";
import config from "./config";

/**
 * Connects to the MongoDB database using the connection string specified in the environment variables.
 * The database name is set to "reavpages".
 *
 * This function will log a success message if the connection is established,
 * or an error message if the connection fails.
 *
 * @returns {Promise<void>} A promise that resolves when the connection is established,
 * or rejects if there is an error.
 */
export const initializeDatabase = async (): Promise<void> => {
  await mongoose
    .connect(`${config.mongoose.url}/reavpages`)
    .then(() => console.log("Database intialized successfully!"))
    .catch((err) => console.error("Database connection failed", err));
};
