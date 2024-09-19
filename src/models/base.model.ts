import { Schema, Document } from "mongoose";

/**
 * Interface representing a base model schema with common fields including automatic timestamps for document creation and updates.
 *
 * Extends from Mongoose's `Document` to include document-specific properties and methods.
 *
 * @interface BaseModel
 * @extends Document
 */
export interface BaseModel extends Document {
  /**
   * The timestamp when the document was created.
   *
   * @type {Date}
   * @optional
   */
  createdAt?: Date;

  /**
   * The timestamp when the document was last updated.
   *
   * @type {Date}
   * @optional
   */
  updatedAt?: Date;
}

/**
 * Base schema with automatic timestamps for document creation and updates.
 *
 * The schema includes:
 * - `created_at`: Timestamp for when the document was created.
 * - `updated_at`: Timestamp for when the document was last updated.
 *
 * This schema can be extended by other schemas to inherit these timestamp fields.
 *
 * @constant {Schema} BaseSchema
 */
export const BaseSchema = new Schema(
  {},
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);
