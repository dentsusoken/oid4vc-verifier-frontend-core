import { z } from 'zod';
import { HttpRequestOptions, HttpResponse } from './types';

/**
 * HTTP GET request interface
 *
 * Provides type-safe GET request functionality with automatic response validation
 * using Zod schemas. Supports configurable options including headers, timeout,
 * and abort signals.
 *
 * @example
 * ```typescript
 * const userSchema = z.object({
 *   id: z.string(),
 *   name: z.string(),
 *   email: z.string().email()
 * });
 *
 * // Basic usage
 * const response = await get('/api/users/123', userSchema);
 * console.log(response.data.name); // Type-safe access
 *
 * // With options including logging
 * const response = await get('/api/users/123', userSchema, {
 *   headers: { 'Authorization': 'Bearer token' },
 *   timeout: 5000,
 *   enableLogging: process.env.NODE_ENV === 'development'
 * });
 * ```
 *
 * @public
 */
export interface GetRequest {
  /**
   * Performs an HTTP GET request with response validation
   *
   * @typeParam T - The expected response data type
   * @param url - The URL to request
   * @param schema - Zod schema for response validation
   * @param options - Optional request configuration
   * @returns Promise resolving to the validated response with metadata
   *
   * @throws {HttpError} When the request fails or response validation fails
   *
   * @example
   * ```typescript
   * const userSchema = z.object({ id: z.string(), name: z.string() });
   *
   * try {
   *   const response = await get('/api/users/123', userSchema, {
   *     enableLogging: true // Enable detailed request/response logging
   *   });
   *   console.log(`User: ${response.data.name}`);
   *   console.log(`Status: ${response.metadata.status}`);
   * } catch (error) {
   *   if (error.status === 404) {
   *     console.error('User not found');
   *   } else {
   *     console.error('Request failed:', error.message);
   *   }
   * }
   * ```
   */
  <T>(
    // TODO: TsDoc更新
    baseUrl: string,
    path: string,
    query: Record<string, string>,
    schema: z.ZodSchema<T>,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>>;
}
