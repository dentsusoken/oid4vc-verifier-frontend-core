import { MdocVerifyHandlerImpl } from 'mdoc-cbor-ts';
import { MdocVerifier } from './MdocVerifier';

/**
 * Mock implementation of mDoc verifier for testing purposes
 *
 * Provides a test-friendly implementation of the MdocVerifier interface
 * using the MdocVerifyHandlerImpl from the mdoc-cbor-ts library.
 * This allows for testing of mDoc verification functionality without
 * requiring complex setup or external dependencies.
 *
 * @example
 * ```typescript
 * import { mockMdocVerifier } from './MockMdocVerifier';
 *
 * // Use in tests or mock scenarios
 * const verificationResult = await mockMdocVerifier.verify(mdocData);
 * ```
 *
 * @public
 */
export const mockMdocVerifier: MdocVerifier = new MdocVerifyHandlerImpl();
