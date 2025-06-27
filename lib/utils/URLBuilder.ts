import { z } from 'zod';
import { QueryBuilder } from './QueryBuilder';

/**
 * Zod schema for base URL
 * This schema ensures that the base URL is valid
 *
 * @example
 * ```ts
 * const baseUrl = baseUrlSchema.parse('https://example.com');
 * console.log(baseUrl); // https://example.com
 * ```
 */
const baseUrlSchema = z.string().url();

/**
 * Zod schema for path
 * This schema ensures that the path is valid
 *
 * @example
 * ```ts
 * const path = pathSchema.parse('/path/to/resource');
 * console.log(path); // /path/to/resource
 * ```
 */
const pathSchema = z.string().regex(/^\/[a-zA-Z0-9\-\/:]*$/);

/**
 * Type for URLBuilder parameters
 *
 * @example
 * ```ts
 * const params: URLBuilderParams = {
 *   baseUrl: 'https://example.com',
 *   path: '/path/to/resource',
 *   queryBuilder: new QueryBuilder({ page: 1, limit: 10, search: 'hello' }),
 * };
 * ```
 */
export type URLBuilderParams = {
  baseUrl: string;
  path?: string;
  queryBuilder?: QueryBuilder;
};

/**
 * URLBuilder class
 * This class is used to build URLs with query parameters.
 *
 * @example
 * ```ts
 * const urlBuilder = new URLBuilder({
 *   baseUrl: 'https://example.com',
 *   path: '/path/to/resource',
 *   queryBuilder: new QueryBuilder({ page: 1, limit: 10, search: 'hello' }),
 * });
 * console.log(urlBuilder.build()); // https://example.com/path/to/resource?page=1&limit=10&search=hello
 * ```
 */
export class URLBuilder {
  /**
   * The base URL to build
   */
  #baseUrl: string;
  /**
   * The path to build
   */
  #path: string;
  /**
   * The query parameters
   */
  #queryBuilder: QueryBuilder;
  /**
   * Constructor for URLBuilder
   *
   * @param {URLBuilderParams} params - The parameters to build the URL
   *
   * @example
   * ```ts
   * const urlBuilder = new URLBuilder({
   *   baseUrl: 'https://example.com',
   *   path: '/path/to/resource',
   *   queryBuilder: new QueryBuilder({ page: 1, limit: 10, search: 'hello' }),
   * });
   * ```
   *
   * @throws {Error} If the baseUrl is invalid
   * @throws {Error} If the path is invalid
   * @throws {Error} If the query parameters are invalid
   */
  constructor({
    baseUrl,
    path = '/',
    queryBuilder = new QueryBuilder(),
  }: URLBuilderParams) {
    const { success: baseUrlSuccess, data: baseUrlData } =
      baseUrlSchema.safeParse(baseUrl);
    const { success: pathSuccess, data: pathData } = pathSchema.safeParse(path);

    if (!baseUrlSuccess) {
      this.handleError('Invalid baseUrl');
    }
    if (!pathSuccess) {
      this.handleError('Invalid path');
    }
    if (!(queryBuilder instanceof QueryBuilder)) {
      this.handleError('Invalid queryBuilder');
    }
    this.#baseUrl = baseUrlData;
    this.#path = pathData;
    this.#queryBuilder = queryBuilder;
  }

  /**
   * Getter for the base URL
   *
   * @returns {string} The base URL
   *
   * @example
   * ```ts
   * const urlBuilder = new URLBuilder({
   *   baseUrl: 'https://example.com',
   *   path: '/path/to/resource',
   *   query: { page: 1, limit: 10, search: 'hello' },
   * });
   * console.log(urlBuilder.baseUrl); // https://example.com
   * ```
   */
  get baseUrl(): string {
    return this.#baseUrl;
  }

  /**
   * Getter for the path
   *
   * @returns {string} The path
   *
   * @example
   * ```ts
   * const urlBuilder = new URLBuilder({
   *   baseUrl: 'https://example.com',
   *   path: '/path/to/resource',
   * });
   * console.log(urlBuilder.path); // /path/to/resource
   * ```
   */
  get path(): string {
    return this.#path;
  }

  /**
   * Getter for the query builder
   *
   * @returns {QueryBuilder} The query builder
   *
   * @example
   * ```ts
   * const urlBuilder = new URLBuilder({
   *   baseUrl: 'https://example.com',
   *   path: '/path/to/resource',
   *   queryBuilder: new QueryBuilder({ page: 1, limit: 10, search: 'hello' }),
   * });
   * console.log(urlBuilder.queryBuilder); // QueryBuilder { query: { page: 1, limit: 10, search: 'hello' } }
   * ```
   */
  get queryBuilder(): QueryBuilder {
    return this.#queryBuilder;
  }

  /**
   * Replace path parameters with the given parameters
   *
   * @param {Record<string, string>} params - The parameters to replace
   * @returns {URLBuilder} The URLBuilder instance
   *
   * @example
   * ```ts
   * const urlBuilder = new URLBuilder({
   *   baseUrl: 'https://example.com',
   *   path: '/path/:id',
   * });
   * console.log(urlBuilder.path); // /path/:id
   * urlBuilder.replacePathParams({ id: '123' });
   * console.log(urlBuilder.path); // /path/123
   * ```
   *
   * @throws {Error} If the path parameter is missing
   */
  replacePathParams(params: Record<string, string>): URLBuilder {
    this.#path = this.#path.replace(/:(\w+)/g, (_, p1) => {
      if (params[p1] === undefined) {
        this.handleError(`Missing value for path parameter: ${p1}`);
      }
      return params[p1];
    });
    return this;
  }

  /**
   * Builds the URL with query parameters
   *
   * @returns {string} The URL with query parameters
   *
   * @example
   * ```ts
   * const urlBuilder = new URLBuilder({
   *   baseUrl: 'https://example.com',
   *   path: '/path/to/resource',
   *   query: { page: 1, limit: 10, search: 'hello' },
   * });
   * console.log(urlBuilder.build()); // https://example.com/path/to/resource?page=1&limit=10&search=hello
   * ```
   */
  build(): string {
    const url = new URL(this.#baseUrl);
    url.pathname = this.#path;
    url.search = this.#queryBuilder.build();
    return url.toString();
  }

  private handleError(msg: string): never {
    console.error(msg);
    throw new Error(msg);
  }
}
