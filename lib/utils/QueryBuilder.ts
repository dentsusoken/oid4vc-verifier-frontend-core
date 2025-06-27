import { z } from 'zod';

/**
 * Zod schema for query parameters
 * This schema ensures that the query parameters are valid
 *
 * @example
 * ```ts
 * const query = querySchema.parse({
 *   page: 1,
 *   limit: 10,
 *   search: 'hello',
 * });
 *
 * console.log(query); // { page: 1, limit: 10, search: 'hello' }
 * ```
 */
export const querySchema = z.record(z.string(), z.unknown());

/**
 * Type for query parameters
 *
 * @example
 * ```ts
 * const query: Query = {
 *   page: 1,
 *   limit: 10,
 *   search: 'hello',
 * };
 * ```
 */
export type Query = z.infer<typeof querySchema>;

/**
 * QueryBuilder class
 * This class is used to build query strings.
 *
 * @example
 * ```ts
 * const queryBuilder = new QueryBuilder({ page: 1, limit: 10, search: 'hello' });
 * console.log(queryBuilder.query); // { page: 1, limit: 10, search: 'hello' }
 * ```
 */
export class QueryBuilder {
  #query: Query;

  /**
   * Constructor for the QueryBuilder
   *
   * @param {Query} query - The query parameters
   * @throws {Error} If the query parameters are invalid
   *
   * @example
   * ```ts
   * const queryBuilder = new QueryBuilder({ page: 1, limit: 10, search: 'hello' });
   * console.log(queryBuilder.query); // { page: 1, limit: 10, search: 'hello' }
   * ```
   */
  constructor(query: Query = {}) {
    const { success: querySuccess, data: queryData } =
      querySchema.safeParse(query);
    if (!querySuccess) {
      const message = 'Invalid query parameters';
      console.error(message);
      throw new Error(message);
    }
    this.#query = queryData;
  }

  /**
   * Getter for the query parameters
   *
   * @returns {Query} The query parameters
   *
   * @example
   * ```ts
   * const queryBuilder = new QueryBuilder({ page: 1, limit: 10, search: 'hello' });
   * console.log(queryBuilder.query); // { page: 1, limit: 10, search: 'hello' }
   * ```
   */
  get query(): Query {
    return this.#query;
  }

  /**
   * Builds the query string
   *
   * @returns {string} The query string
   *
   * @example
   * ```ts
   * const queryBuilder = new QueryBuilder({ page: 1, limit: 10, search: 'hello' });
   * console.log(queryBuilder.build()); // 'page=1&limit=10&search=hello'
   * ```
   */
  build(): string {
    const searchParams = new URLSearchParams();
    Object.entries(this.#query).forEach(([key, value]) => {
      if (value) {
        switch (typeof value) {
          case 'string':
            searchParams.append(key, value);
            break;
          case 'object':
            searchParams.append(key, JSON.stringify(value));
            break;
          default:
            searchParams.append(key, value.toString());
            break;
        }
      }
    });
    return searchParams.toString();
  }
}
