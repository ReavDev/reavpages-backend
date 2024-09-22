import { Document } from "mongoose";

declare global {
  /**
   * Options for pagination query.
   */
  interface PaginateOptions {
    /** Sorting criteria in the format: sortField:(desc|asc) */
    sortBy?: string;
    /** Populate criteria, can include nested fields */
    populate?: string;
    /** Maximum number of results per page (default = 10) */
    limit?: number;
    /** Current page (default = 1) */
    page?: number;
  }

  /**
   * Represents the structure of a paginated query result.
   */
  interface QueryResult<T extends Document> {
    /** Array of documents returned by the query */
    results: T[];
    /** Current page number */
    page: number;
    /** Maximum number of results per page */
    limit: number;
    /** Total number of pages */
    totalPages: number;
    /** Total number of documents matching the query */
    totalResults: number;
  }
}

export {};
