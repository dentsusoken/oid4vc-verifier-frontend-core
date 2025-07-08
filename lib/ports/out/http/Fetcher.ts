import { GetRequest } from './GetRequest';
import { PostRequest } from './PostRequest';

/**
 * HTTP client interface for OID4VC verification system
 *
 * Provides type-safe HTTP operations with automatic response validation
 * using Zod schemas. Supports both GET and POST requests with comprehensive
 * error handling and configurable options.
 *
 * This interface abstracts the underlying HTTP implementation, allowing
 * for easy testing and different HTTP client implementations (fetch, axios, etc.).
 *
 * @example
 * ```typescript
 * // Implementation example
 * class MyHttpClient implements Fetcher {
 *   get: GetRequest = async (url, schema, options) => {
 *     // Implementation details...
 *   };
 *
 *   post: PostRequest = async (url, body, schema, options) => {
 *     // Implementation details...
 *   };
 * }
 *
 * // Usage example
 * const httpClient: Fetcher = new MyHttpClient();
 *
 * const userSchema = z.object({ id: z.string(), name: z.string() });
 * const user = await httpClient.get('/api/users/123', userSchema);
 *
 * const createResult = await httpClient.post('/api/users',
 *   { name: 'Alice', email: 'alice@example.com' },
 *   z.object({ success: z.boolean(), id: z.string() })
 * );
 * ```
 *
 * @public
 */
export interface Fetcher {
  /**
   * HTTP GET request method
   *
   * Performs type-safe GET requests with automatic response validation.
   * Supports query parameters, custom headers, timeout, and abort signals.
   *
   * @example
   * ```typescript
   * const response = await fetcher.get('/api/data', dataSchema, {
   *   headers: { 'Authorization': 'Bearer token' },
   *   timeout: 5000
   * });
   * ```
   */
  get: GetRequest;

  /**
   * HTTP POST request method
   *
   * Performs type-safe POST requests with automatic response validation.
   * Supports various body types (JSON objects, strings, FormData, etc.),
   * custom headers, timeout, and abort signals.
   *
   * @example
   * ```typescript
   * const response = await fetcher.post('/api/create',
   *   { name: 'example' },
   *   responseSchema,
   *   { headers: { 'Content-Type': 'application/json' } }
   * );
   * ```
   */
  post: PostRequest;
}
