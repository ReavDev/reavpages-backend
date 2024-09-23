import {
  Document,
  Schema,
  Model,
  PopulateOptions,
  FilterQuery,
} from "mongoose";

/**
 * Adds pagination capabilities to a Mongoose schema.
 *
 * @param schema - Mongoose schema to add the plugin to
 */
const paginate = <T extends Document>(schema: Schema<T>): void => {
  /**
   * Performs a paginated query on the model.
   *
   * @param filter - MongoDB filter query
   * @param options - Pagination options
   * @returns A promise that resolves to the paggit inated query result
   */
  schema.statics.paginate = async function (
    this: Model<T>,
    filter: FilterQuery<T> = {},
    options: PaginateOptions = {},
  ): Promise<QueryResult<T>> {
    const { sortBy, populate, limit = 10, page = 1 } = options;

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sortBy.split(",").forEach((sortOption) => {
        const [key, order] = sortOption.split(":");
        sort[key] = order === "desc" ? -1 : 1;
      });
    } else {
      sort.createdAt = -1;
    }

    const skip = (page - 1) * limit;

    const countPromise = this.countDocuments(filter).exec();
    let docsPromise = this.find(filter).sort(sort).skip(skip).limit(limit);

    if (populate) {
      const populateOptions: PopulateOptions[] = populate
        .split(",")
        .map((path) => {
          return path
            .split(".")
            .reverse()
            .reduce<PopulateOptions>(
              (a, b) => ({
                path: b,
                populate: a.path ? a : undefined,
              }),
              { path: "" },
            );
        });

      docsPromise = docsPromise.populate(populateOptions);
    }

    const [totalResults, results] = await Promise.all([
      countPromise,
      docsPromise,
    ]);
    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      page,
      limit,
      totalPages,
      totalResults,
    };
  };
};

export default paginate;
