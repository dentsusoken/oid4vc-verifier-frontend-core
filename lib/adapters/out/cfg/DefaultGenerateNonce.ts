import { nonceSchema } from '../../../domain';
import { GenerateNonce } from '../../../ports/out/cfg/GenerateNonce';

/**
 * Default nonce generation implementation using crypto.randomUUID()
 *
 * Provides a secure, production-ready implementation of the GenerateNonce interface
 * using the Web Crypto API's randomUUID() method. The generated UUID is validated
 * against the nonce schema to ensure it meets the required format and security
 * standards for the OID4VC verification system.
 *
 * This implementation:
 * - Uses cryptographically secure random number generation
 * - Generates RFC 4122 compliant UUIDs (version 4)
 * - Validates the output against the domain nonce schema
 * - Provides sufficient entropy for security-critical operations
 * - Is suitable for preventing replay attacks and ensuring request uniqueness
 *
 * The generated nonce is typically used in:
 * - OAuth 2.0 authorization requests
 * - OpenID Connect authentication flows
 * - Anti-CSRF protection mechanisms
 * - Request correlation and tracking
 *
 * @returns A validated nonce string conforming to the domain schema
 *
 * @throws {ZodError} When the generated UUID fails schema validation
 *
 * @example
 * ```typescript
 * // Generate a secure nonce
 * const nonce = defaultGenerateNonce();
 * console.log(nonce); // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *
 * // Use in authorization URL
 * const authUrl = `https://auth.example.com/authorize?nonce=${nonce}&...`;
 *
 * // Verify nonce in callback
 * if (receivedNonce === expectedNonce) {
 *   // Process authentication response
 * }
 * ```
 *
 * @public
 */
export const defaultGenerateNonce: GenerateNonce = () => {
  return nonceSchema.parse(crypto.randomUUID());
};
