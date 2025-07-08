import { MdocVerifier } from '../ports';
import {
  GenerateWalletRedirectUri,
  GenerateWalletResponseRedirectUriTemplate,
} from '../ports/out/cfg';
import { GenerateNonce } from '../ports/out/cfg/GenerateNonce';
import { Fetcher } from '../ports/out/http';
import { IsMobile } from '../ports/out/http/isMobile';
import { Logger } from '../ports/out/logging';
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
 * - **logging**: Structured logging capabilities
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
 *   logger(): Logger {
 *     return createDefaultLogger(this.config.loggerConfig());
 *   }
 *   // ... other implementations
 * }
 *
 * // Usage in service layer
 * const portsOut: PortsOut = new DefaultPortsOut(config);
 * const logger = portsOut.logger();
 * const fetcher = portsOut.fetcher();
 * ```
 *
 * @public
 */
export interface PortsOut {
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

  // logging
  /**
   * Returns a configured logger instance
   *
   * Provides structured logging with different levels, types,
   * and security-aware data sanitization.
   *
   * @returns Logger instance configured for the current environment
   */
  logger(): Logger;

  // prex
  /**
   * Returns a presentation definition generation function
   *
   * Creates presentation definitions for credential verification
   * requests according to the DIF Presentation Exchange specification.
   *
   * @returns GeneratePresentationDefinition function
   */
  generatePresentationDefinition(): GeneratePresentationDefinition;

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
}
