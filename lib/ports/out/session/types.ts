import { sessionSchemas } from './sessionSchemas';
import { z } from 'zod';

/**
 * Session storage schema definition
 *
 * Defines the structure and types of data that can be stored in the session.
 * Each key corresponds to a specific data type, ensuring type safety across
 * the session management system.
 *
 * @example
 * ```typescript
 * // The session will enforce these types:
 * session.set('presentationId', validPresentationId); // ✓ Valid
 * session.set('presentationId', 'invalid-string');    // ✗ Type error
 * ```
 *
 * @public
 */
export type SessionSchemas = z.infer<typeof sessionSchemas>;

/**
 * Type utility to extract session value types
 *
 * @typeParam T - The session schema interface
 * @public
 */
export type SessionValue<T extends SessionSchemas> = T[keyof T];

/**
 * Type utility for batch operations
 *
 * @typeParam T - The session schema interface
 * @typeParam K - The keys of the schema
 * @public
 */
export type SessionBatch<T extends SessionSchemas, K extends keyof T> = {
  [Key in K]: T[Key];
};

/**
 * Result type for batch delete operations
 *
 * @typeParam T - The session schema interface
 * @typeParam K - The keys of the schema
 * @public
 */
export type SessionDeleteResult<T extends SessionSchemas, K extends keyof T> = {
  [Key in K]: T[Key] | undefined;
};
