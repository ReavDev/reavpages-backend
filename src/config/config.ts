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
  MONGODB_URL: Joi.string().required().description("MongoDB connection url"),
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
   * Application environment (e.g., production, development, test).
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
};

export default config;
