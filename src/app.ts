import express, { Request, Response } from "express";
import { initializeDatabase } from "./config/database.config";
import config from "./config/config";
import EmailService from "./services/email.service";
import authRoutes from "./routes/auth.routes";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Route handler for the root path.
 * @param req - The Express request object.
 * @param res - The Express response object.
 */
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to ReavPages Backend server");
});

// Register auth routes
app.use("/api/auth", authRoutes);

/**
 * Initialize the database, verify email service connection, and start the server.
 */
const startServer = async () => {
  try {
    // Initialize the database
    await initializeDatabase();

    // Verify email service connection
    await EmailService.verifyConnection();

    // Start the server
    app.listen(config.port, () => {
      console.log(`Server is running at http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("Error initializing server:", error);
    process.exit(1);
  }
};

startServer();

/**
 * Handles unexpected errors.
 * @param error - The error object to handle.
 */
const unexpectedErrorHandler = (error: unknown) => {
  if (error instanceof Error) {
    console.error("Error:", error.message);
  } else {
    console.error("Unknown Error:", error);
  }
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
