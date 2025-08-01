import {
  GeneratePresentationDefinition,
  mcokGeneratePresentationDefinition,
  mockMdocVerifier,
  Session,
  SessionSchemas,
} from '../ports';
import { McokSession } from '../ports/out/session/McokSession';
import { AbstractPortsOut } from './AbstractPortsOut';

/**
 * Mock implementation of PortsOut interface for testing purposes
 *
 * Provides test-specific implementations of all output ports required by the
 * dependency injection system. This class extends AbstractPortsOut and implements
 * the abstract methods with mock implementations suitable for unit testing.
 *
 * @example
 * ```typescript
 * const mockPortsOut = new MockPortsOut(mockConfiguration);
 * const session = mockPortsOut.session();
 * const mdocVerifier = mockPortsOut.mdocVerifier();
 * ```
 *
 * @public
 */
export class MockPortsOut<
  T extends Record<string, GeneratePresentationDefinition>
> extends AbstractPortsOut<T> {
  /**
   * Returns a mock implementation of presentation definition generator
   *
   * Provides a test-friendly implementation that can be used to generate
   * presentation definitions without external dependencies.
   *
   * @param key - The key to use for the presentation definition
   *
   * @returns Mock presentation definition generator function
   */
  generatePresentationDefinition(_: keyof T): GeneratePresentationDefinition {
    return mcokGeneratePresentationDefinition;
  }

  /**
   * Returns a mock implementation of mDoc verifier
   *
   * Provides a test implementation of the mDoc verification functionality
   * using the mdoc-cbor-ts library's implementation.
   *
   * @returns Mock mDoc verifier instance
   */
  mdocVerifier() {
    return mockMdocVerifier;
  }

  /**
   * Returns a mock session implementation
   *
   * Creates a new instance of McokSession which provides an in-memory
   * session storage implementation suitable for testing scenarios.
   *
   * @returns New mock session instance
   */
  session(): Session<SessionSchemas> {
    return new McokSession();
  }
}
