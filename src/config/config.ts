import Joi from "joi";

/**
 * Schema for validating environment variables.
 * @see https://joi.dev/api/?v=17.6.0
 */
const envVarsSchema = Joi.object({
  /**
   * Application environment (e.g., test, development, staging, production).
   */
  NODE_ENV: Joi.string()
    .valid("test", "development", "staging", "production")
    .required(),

  /**
   * Port number on which the server will run.
   */
  PORT: Joi.number().default(3000),

  /**
   * MongoDB connection URL.
   */
  MONGODB_URL: Joi.string()
    .required()
    .description("The URL used to connect to the MongoDB database"),

  /**
   * JWT secret key for signing tokens.
   */
  JWT_SECRET: Joi.string()
    .required()
    .description("The secret key used to sign JWT tokens"),

  /**
   * JWT access token expiration time in minutes.
   */
  JWT_ACCESS_EXPIRATION_MINUTES: Joi.number()
    .default(30)
    .description("The number of minutes after which access tokens expire"),

  /**
   * JWT refresh token expiration time in days.
   */
  JWT_REFRESH_EXPIRATION_DAYS: Joi.number()
    .default(30)
    .description("The number of days after which refresh tokens expire"),

  /**
   * JWT reset password token expiration time in minutes.
   */
  JWT_RESET_PASSWORD_EXPIRATION_MINUTES: Joi.number()
    .default(10)
    .description(
      "The number of minutes after which reset password tokens expire",
    ),

  /**
   * JWT email verification token expiration time in minutes.
   */
  JWT_VERIFY_EMAIL_EXPIRATION_MINUTES: Joi.number()
    .default(10)
    .description(
      "The number of minutes after which email verification tokens expire",
    ),

  /**
   * SMTP server host for sending emails.
   */
  SMTP_HOST: Joi.string().description(
    "The SMTP server host for sending emails",
  ),

  /**
   * SMTP server port.
   */
  SMTP_PORT: Joi.number().description(
    "The port number for connecting to the SMTP server",
  ),

  /**
   * SMTP username for authentication.
   */
  SMTP_USERNAME: Joi.string().description(
    "The username used for SMTP server authentication",
  ),

  /**
   * SMTP password for authentication.
   */
  SMTP_PASSWORD: Joi.string().description(
    "The password used for SMTP server authentication",
  ),

  /**
   * Email address from which emails will be sent.
   */
  EMAIL_FROM: Joi.string().description(
    "The 'from' email address for outgoing emails",
  ),
}).unknown();

/**
 * Validates environment variables against the defined schema.
 * Throws an error if validation fails.
 */
const { error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

/**
 * Configuration object containing environment-specific settings.
 */
const config = {
  /**
   * Application environment (e.g., test, development, staging, production).
   */
  env: process.env["NODE_ENV"] as string,

  /**
   * Port number on which the server will run.
   */
  port: process.env["PORT"] as unknown as number,

  /**
   * MongoDB connection settings.
   */
  mongoose: {
    /**
     * MongoDB connection URL.
     */
    url: process.env["MONGODB_URL"] as string,
  },

  /**
   * JWT settings.
   */
  jwt: {
    /**
     * JWT secret key for signing tokens.
     */
    secret: process.env["JWT_SECRET"] as string,

    /**
     * JWT access token expiration time in minutes.
     */
    accessExpirationMinutes: process.env[
      "JWT_ACCESS_EXPIRATION_MINUTES"
    ] as unknown as number,

    /**
     * JWT refresh token expiration time in days.
     */
    refreshExpirationDays: process.env[
      "JWT_REFRESH_EXPIRATION_DAYS"
    ] as unknown as number,

    /**
     * JWT reset password token expiration time in minutes.
     */
    resetPasswordExpirationMinutes: process.env[
      "JWT_RESET_PASSWORD_EXPIRATION_MINUTES"
    ] as unknown as number,

    /**
     * JWT email verification token expiration time in minutes.
     */
    verifyEmailExpirationMinutes: process.env[
      "JWT_VERIFY_EMAIL_EXPIRATION_MINUTES"
    ] as unknown as number,
  },

  /**
   * Email settings.
   */
  email: {
    /**
     * SMTP server configuration.
     */
    smtp: {
      /**
       * SMTP server host.
       */
      host: process.env["SMTP_HOST"] as string,

      /**
       * SMTP server port.
       */
      port: process.env["SMTP_PORT"] as unknown as number,

      /**
       * SMTP server authentication credentials.
       */
      auth: {
        /**
         * SMTP username.
         */
        user: process.env["SMTP_USERNAME"] as string,

        /**
         * SMTP password.
         */
        pass: process.env["SMTP_PASSWORD"] as string,
      },
    },

    /**
     * Email address used as the 'from' address in emails.
     */
    from: process.env["EMAIL_FROM"] as string,
  },
};

export default config;
