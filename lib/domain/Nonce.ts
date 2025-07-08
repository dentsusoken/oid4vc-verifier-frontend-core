// TODO　コードレビュー

import { z } from 'zod';

/**
 * Zod schema for validating nonce values
 *
 * A nonce (number used once) is a cryptographically secure random value
 * used to prevent replay attacks in authentication and presentation flows.
 *
 * The schema includes:
 * - **Non-empty validation**: Ensures the nonce has meaningful content
 * - **Brand type**: Creates a distinct TypeScript type for type safety
 * - **String base**: Compatible with standard nonce generation libraries
 *
 * @example
 * ```typescript
 * // Valid nonce values
 * const validNonce1 = nonceSchema.parse("abc123def456");
 * const validNonce2 = nonceSchema.parse("550e8400-e29b-41d4-a716-446655440000");
 *
 * // Invalid nonce values (will throw ZodError)
 * nonceSchema.parse(""); // Empty string
 * nonceSchema.parse(null); // Non-string value
 * ```
 *
 *
 * @public
 */
export const nonceSchema = z
  .string()
  .min(1, 'Nonce must not be empty')
  .brand('Nonce');

/**
 * Type representing a validated nonce value
 *
 * A branded string type that ensures nonce values have been validated
 * through the `nonceSchema`. This provides compile-time type safety
 * and prevents accidental use of unvalidated strings as nonces.
 *
 * Nonces are used throughout the OID4VC verification system for:
 * - **Replay attack prevention**: Ensuring requests cannot be replayed
 * - **Session binding**: Linking requests to specific user sessions
 * - **State management**: Maintaining security context across redirects
 *
 * @example
 * ```typescript
 * // Creating a validated nonce
 * const rawNonce = crypto.randomUUID();
 * const validatedNonce: Nonce = nonceSchema.parse(rawNonce);
 *
 * // Using in function signatures for type safety
 * function storeNonce(nonce: Nonce, sessionId: string): Promise<void> {
 *   // nonce is guaranteed to be validated
 *   return sessionStore.set(`nonce:${sessionId}`, nonce);
 * }
 *
 * // Type error - cannot pass unvalidated string
 * storeNonce("some-string", "session-123"); // TypeScript error
 * storeNonce(validatedNonce, "session-123"); // OK
 * ```
 *
 * @public
 */
export type Nonce = z.infer<typeof nonceSchema>;
