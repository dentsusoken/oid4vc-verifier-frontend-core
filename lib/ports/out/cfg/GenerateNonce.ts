import { Nonce } from '../../../domain';

/**
 * Interface for nonce generation functionality
 *
 * Defines the contract for generating cryptographically secure nonces
 * (numbers used once) that are used throughout the OID4VC verification
 * system to prevent replay attacks and maintain security in authentication flows.
 *
 * A nonce generator should produce unique, unpredictable values that cannot
 * be easily guessed or reproduced by attackers. The generated nonces are
 * typically used in:
 * - OAuth 2.0 authorization requests
 * - OpenID Connect authentication flows
 * - Session state management
 * - CSRF protection mechanisms
 *
 * ## Security Requirements
 *
 * Implementations must ensure:
 * - **Cryptographic randomness**: Use secure random number generators
 * - **Uniqueness**: Each call should produce a different value
 * - **Unpredictability**: Values should not follow detectable patterns
 * - **Sufficient entropy**: Adequate length and complexity for security
 *
 * ## Implementation Considerations
 *
 * - Use Web Crypto API (`crypto.randomUUID()`) in browser environments
 * - Use Node.js `crypto` module in server environments
 * - Consider UUID v4 format for standardized, globally unique values
 * - Ensure thread-safety in concurrent environments
 *
 * @example
 * ```typescript
 * // Implementation using Web Crypto API
 * const generateNonce: GenerateNonce = (): Nonce => {
 *   const rawNonce = crypto.randomUUID();
 *   return nonceSchema.parse(rawNonce);
 * };
 *
 * // Usage in authentication flow
 * const authNonce = generateNonce();
 * const authUrl = `https://auth.example.com/oauth?nonce=${authNonce}`;
 *
 * // Store nonce for later validation
 * sessionStore.set('auth-nonce', authNonce);
 * ```
 *
 * @see {@link https://tools.ietf.org/html/rfc6749#section-10.10} - OAuth 2.0 Security Considerations
 * @see {@link https://openid.net/specs/openid-connect-core-1_0.html#NonceNotes} - OpenID Connect Nonce Usage
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Crypto/randomUUID} - Web Crypto API
 *
 * @public
 */
export interface GenerateNonce {
  /**
   * Generates a new cryptographically secure nonce
   *
   * Creates a unique, unpredictable value suitable for use in security-critical
   * contexts such as OAuth flows, session management, and replay attack prevention.
   *
   * @returns A validated Nonce value that meets security requirements
   *
   * @throws {Error} If the underlying random number generator fails
   * @throws {ZodError} If the generated value fails nonce validation (should not happen with proper implementation)
   *
   * @example
   * ```typescript
   * const nonce = generateNonce();
   * // nonce is guaranteed to be a valid, secure Nonce type
   *
   * // Use in OAuth request
   * const params = new URLSearchParams({
   *   nonce: nonce,
   *   state: sessionState,
   *   client_id: clientId
   * });
   * ```
   */
  (): Nonce;
}
