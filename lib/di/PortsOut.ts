import { MdocVerifier } from '../ports';
import {
  GenerateWalletRedirectUri,
  GenerateWalletResponseRedirectUriTemplate,
} from '../ports/out/cfg';
import { GenerateNonce } from '../ports/out/cfg/GenerateNonce';
import { Fetcher } from '../ports/out/http';
import { IsMobile } from '../ports/out/http/isMobile';
import {
  GenerateEphemeralECDHPrivateJwk,
  VerifyJarmJwt,
} from '../ports/out/jose';
import { GeneratePresentationDefinition } from '../ports/out/prex';
import { Session, SessionSchemas } from '../ports/out/session';

/**
 * Output ports interface for dependency injection
 *
 * Defines the contract for output port dependencies in the OID4VC verification system.
 * This interface follows the hexagonal architecture pattern, providing access to
 * external services, databases, APIs, and other infrastructure components from
 * the application's core business logic.
 *
 * Output ports represent the application's dependencies on external systems,
 * allowing for easy testing through mocking and enabling different implementations
 * for different environments (development, testing, production).
 *
 * The interface is organized by functional areas:
 * - **cfg**: Configuration and utility functions
 * - **http**: HTTP communication and device detection
 * - **prex**: Presentation exchange (credential) handling
 * - **session**: Session and state management
 *
 * @example
 * ```typescript
 * // Implementation example
 * class DefaultPortsOut implements PortsOut {
 *   generateNonce(): GenerateNonce {
 *     return defaultGenerateNonce;
 *   }
 *
 *   fetcher(): Fetcher {
 *     return createDefaultFetcher();
 *   }
 *
 *   // ... other implementations
 * }
 *
 * // Usage in service layer
 * const portsOut: PortsOut = new DefaultPortsOut(config);
 * const fetcher = portsOut.fetcher();
 * ```
 *
 * @public
 */
export interface PortsOut<
  T extends Record<string, GeneratePresentationDefinition>
> {
  // cfg
  /**
   * Returns a nonce generation function
   *
   * Provides cryptographically secure nonce generation for preventing
   * replay attacks and ensuring request uniqueness in OAuth flows.
   *
   * @returns GenerateNonce function that creates secure random nonces
   */
  generateNonce(): GenerateNonce;

  /**
   * Returns a wallet redirect URI generation function
   *
   * Constructs redirect URIs for wallet applications by combining
   * base URIs with query parameters.
   *
   * @returns GenerateWalletRedirectUri function for URI construction
   */
  generateWalletRedirectUri(): GenerateWalletRedirectUri;

  /**
   * Returns a wallet response redirect URI template generation function
   *
   * Creates URI templates with placeholders for response codes that
   * can be used in wallet configuration and dynamic redirects.
   *
   * @returns GenerateWalletResponseRedirectUriTemplate function
   */
  generateWalletResponseRedirectUriTemplate(): GenerateWalletResponseRedirectUriTemplate;

  // http
  /**
   * Returns an HTTP client for making API requests
   *
   * Provides type-safe HTTP communication with automatic response
   * validation using Zod schemas.
   *
   * @returns Fetcher instance for HTTP operations
   */
  fetcher(): Fetcher;

  /**
   * Returns a mobile device detection function
   *
   * Analyzes User-Agent strings to determine if the request
   * originated from a mobile device.
   *
   * @returns IsMobile function for device type detection
   */
  isMobile(): IsMobile;

  // prex
  /**
   * Returns a presentation definition generation function
   *
   * Creates presentation definitions for credential verification
   * requests according to the DIF Presentation Exchange specification.
   *
   * @param key - The key to use for the presentation definition
   *
   * @returns GeneratePresentationDefinition function
   */
  generatePresentationDefinition(key: keyof T): GeneratePresentationDefinition;

  // mdoc
  /**
   * Returns a MDOC verifier instance
   *
   * @returns MdocVerifier instance
   */
  mdocVerifier(): MdocVerifier;

  // session
  /**
   * Returns a session management service
   *
   * Handles session storage, retrieval, and lifecycle management
   * for maintaining state across the verification process.
   *
   * @returns Session service instance with schema validation
   */
  session(): Session<SessionSchemas>;

  // jose
  /**
   * Returns a function to generate an ephemeral ECDH private key
   *
   * @returns GenerateEphemeralECDHPrivateJwk function
   */
  generateEphemeralECDHPrivateJwk(): GenerateEphemeralECDHPrivateJwk;

  // jose
  /**
   * Returns a function to verify a JARM JWT
   *
   * @returns VerifyJarmJwt function
   */
  verifyJarmJwt(): VerifyJarmJwt;
}
