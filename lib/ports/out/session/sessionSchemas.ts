// TODO　コードレビュー

import { z } from 'zod';
import { nonceSchema, presentationIdSchema } from '../../../domain';

/**
 * Zod schema for session data validation
 *
 * Defines the structure and validation rules for data stored in user sessions
 * during the OID4VC verification process. This schema ensures type safety and
 * data integrity for session management across the verification workflow.
 *
 * The session schema includes:
 * - **presentationId**: Unique identifier for the verification request
 * - **nonce**: Optional cryptographic nonce for security and replay protection
 *
 * ## Session Lifecycle
 *
 * Session data follows this typical lifecycle:
 * 1. **Initialization**: `presentationId` is stored when verification starts
 * 2. **Security Setup**: `nonce` is optionally added for enhanced security
 * 3. **Verification**: Data is retrieved during credential presentation processing
 * 4. **Cleanup**: Session is cleared after successful completion or timeout
 *
 * ## Data Security
 *
 * Session schemas help maintain security by:
 * - **Type validation**: Ensuring only valid data types are stored
 * - **Required fields**: Enforcing presence of critical identifiers
 * - **Optional fields**: Allowing flexible security enhancements
 * - **Immutable validation**: Using branded types to prevent tampering
 *
 * ## Storage Considerations
 *
 * The schema supports various session storage implementations:
 * - **In-memory**: Fast access for development and testing
 * - **Redis**: Distributed sessions for production scalability
 * - **Database**: Persistent sessions with complex queries
 * - **Encrypted storage**: Additional security for sensitive environments
 *
 * @example
 * ```typescript
 * // Valid session data
 * const sessionData = {
 *   presentationId: presentationIdSchema.parse('pres-123-abc'),
 *   nonce: nonceSchema.parse('550e8400-e29b-41d4-a716-446655440000')
 * };
 *
 * // Validate session data
 * const validatedSession = sessionSchemas.parse(sessionData);
 *
 * // Minimal session (nonce is optional)
 * const minimalSession = {
 *   presentationId: presentationIdSchema.parse('pres-456-def')
 * };
 * const validatedMinimal = sessionSchemas.parse(minimalSession); // OK
 *
 * // Invalid session data (will throw ZodError)
 * sessionSchemas.parse({
 *   presentationId: '', // Invalid: empty presentation ID
 *   nonce: 'invalid-nonce'
 * });
 * ```
 *
 * @see {@link presentationIdSchema} - Validation schema for presentation identifiers
 * @see {@link nonceSchema} - Validation schema for cryptographic nonces
 *
 * @public
 */
export const sessionSchemas = z.object({
  /**
   * Unique identifier for the verification presentation request
   *
   * A validated presentation ID that links the session to a specific
   * credential verification request. This field is required and must
   * be present in all session data.
   *
   * @see {@link presentationIdSchema} - Schema definition and validation rules
   */
  presentationId: presentationIdSchema,

  /**
   * Optional cryptographic nonce for enhanced security
   *
   * A validated nonce value used for replay attack prevention and
   * session binding. This field is optional and may be omitted
   * for simplified verification flows.
   *
   * @see {@link nonceSchema} - Schema definition and validation rules
   */
  nonce: nonceSchema.optional(),
});
