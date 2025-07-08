import { z } from 'zod';

/**
 * Presentation identifier validation schema
 *
 * Defines the validation rules for presentation identifiers used in the
 * OID4VC verification process. Ensures that presentation IDs are non-empty
 * strings with proper branding for type safety.
 *
 * @public
 */
export const presentationIdSchema = z
  .string()
  .min(1, 'Presentation ID must not be empty')
  .brand('PresentationId');

/**
 * Type-safe presentation identifier
 *
 * A branded string type that represents a unique identifier for presentations
 * in the OID4VC verification workflow. This type ensures compile-time safety
 * and prevents mixing with regular strings.
 *
 * @example
 * ```typescript
 * const presentationId = createPresentationId('pres_123456');
 * if (isPresentationId(userInput)) {
 *   // userInput is now typed as PresentationId
 *   processPresentationId(userInput);
 * }
 * ```
 *
 * @public
 */
export type PresentationId = z.infer<typeof presentationIdSchema>;
