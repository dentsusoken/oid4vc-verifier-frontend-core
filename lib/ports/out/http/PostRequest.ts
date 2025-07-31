import { z } from 'zod';
import { HttpRequestBody, HttpRequestOptions, HttpResponse } from './types';

/**
 * HTTP POST request interface
 *
 * Provides type-safe POST request functionality with automatic response validation
 * using Zod schemas. Supports various body types and configurable options including
 * headers, timeout, abort signals.
 *
 * @example
 * ```typescript
 * const createUserSchema = z.object({
 *   id: z.string(),
 *   name: z.string(),
 *   email: z.string().email()
 * });
 *
 * // JSON body
 * const response = await post('/api/users',
 *   { name: 'Alice', email: 'alice@example.com' },
 *   createUserSchema
 * );
 *
 * ```
 *
 * @public
 */
export interface PostRequest {
  /**
   * Performs an HTTP POST request with response validation
   *
   * @typeParam T - The expected response data type
   * @param url - The URL to request
   * @param body - The request body data
   * @param schema - Zod schema for response validation
   * @param options - Optional request configuration
   * @returns Promise resolving to the validated response with metadata
   *
   * @throws {HttpError} When the request fails or response validation fails
   *
   * @example
   * ```typescript
   * const responseSchema = z.object({ success: z.boolean(), id: z.string() });
   *
   * try {
   *   const response = await post('/api/users',
   *     { name: 'John', email: 'john@example.com' },
   *     responseSchema,
   *     {
   *       timeout: 10000
   *     }
   *   );
   *
   *   if (response.data.success) {
   *     console.log(`Created user with ID: ${response.data.id}`);
   *   }
   *   console.log(`Response status: ${response.metadata.status}`);
   * } catch (error) {
   *   if (error.status === 400) {
   *     console.error('Bad request:', error.message);
   *   } else if (error.status === 409) {
   *     console.error('User already exists');
   *   } else {
   *     console.error('Request failed:', error.message);
   *   }
   * }
   */
  <T>(
    // TODO: TsDoc更新
    baseUrl: string,
    path: string,
    body: HttpRequestBody,
    schema: z.ZodSchema<T>,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>>;
}
