import { Schema, Document, ToObjectOptions, Types } from "mongoose";

/**
 * Recursively delete a property at a given path from an object.
 *
 * @param obj - The object from which to delete the property.
 * @param path - An array representing the path to the property.
 * @param index - The current index in the path.
 */
const deleteAtPath = (
  obj: Record<string, unknown>,
  path: string[],
  index: number,
): void => {
  if (!obj || !path[index]) return;

  if (index === path.length - 1) {
    delete obj[path[index]];
    return;
  }

  // Check if the next path segment is an object before proceeding
  if (typeof obj[path[index]] === "object" && obj[path[index]] !== null) {
    deleteAtPath(obj[path[index]] as Record<string, unknown>, path, index + 1);
  }
};

/**
 * A Mongoose schema plugin that modifies the `toJSON` transform call to:
 *  - Remove `__v`, `createdAt`, `updatedAt`, and any paths with `private: true`
 *  - Replace `_id` with `id`
 *
 * @param schema - The Mongoose schema to apply the plugin to.
 */
const toJSON = (schema: Schema): void => {
  const existingTransform = schema.get("toJSON")?.transform;

  schema.set("toJSON", {
    virtuals: true,
    transform(
      doc: Document & { _id: Types.ObjectId },
      ret: Record<string, unknown>,
      options: ToObjectOptions,
    ) {
      // Remove fields marked as private on the document
      Object.keys(schema.paths).forEach((path) => {
        if (schema.paths[path].options && schema.paths[path].options.private) {
          deleteAtPath(ret, path.split("."), 0);
        }
      });

      // Replace _id with id if _id exists and is a valid objectId
      if (typeof ret._id === "object" && ret._id !== null) {
        ret.id = (ret._id as Types.ObjectId).toString();
        delete ret._id;
      }

      // Remove unwanted fields
      delete ret.__v;
      delete ret.createdAt;
      delete ret.updatedAt;

      // Apply existing transform if it exists
      if (typeof existingTransform === "function") {
        return existingTransform(doc, ret, options);
      }

      return ret;
    },
  });
};

export default toJSON;
