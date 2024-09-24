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
   * Secret key used for administrative purposes.
   */
  ADMIN_SECRET: Joi.string()
    .required()
    .description("Secret key for administrative functions"),

  /**
   * Token secret key for signing tokens.
   */
  TOKEN_SECRET: Joi.string()
    .required()
    .description("The secret key used to sign tokens"),

  /**
   * Token access expiration time in minutes.
   */
  TOKEN_ACCESS_EXPIRATION_MINUTES: Joi.number()
    .default(30)
    .description("The number of minutes after which access tokens expire"),

  /**
   * Token refresh expiration time in days.
   */
  TOKEN_REFRESH_EXPIRATION_DAYS: Joi.number()
    .default(30)
    .description("The number of days after which refresh tokens expire"),

  /**
   * Token OTP expiration time in minutes.
   */
  TOKEN_OTP_EXPIRATION_MINUTES: Joi.number()
    .default(10)
    .description("The number of minutes after which OTP expires"),

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
  port: parseInt(process.env["PORT"] as string, 10),

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
   * Administrative secret key.
   */
  adminSecret: process.env["ADMIN_SECRET"] as string,

  /**
   * Token settings.
   */
  token: {
    /**
     * Token secret key for signing tokens.
     */
    secret: process.env["TOKEN_SECRET"] as string,

    /**
     * Token access expiration time in minutes.
     */
    accessExpirationMinutes: parseInt(
      process.env["TOKEN_ACCESS_EXPIRATION_MINUTES"] as string,
      10,
    ),

    /**
     * Token refresh expiration time in days.
     */
    refreshExpirationDays: parseInt(
      process.env["TOKEN_REFRESH_EXPIRATION_DAYS"] as string,
      10,
    ),

    /**
     * Token OTP expiration time in minutes.
     */
    otpExpirationMinutes: parseInt(
      process.env["TOKEN_OTP_EXPIRATION_MINUTES"] as string,
      10,
    ),
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
      port: parseInt(process.env["SMTP_PORT"] as string, 10),

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
