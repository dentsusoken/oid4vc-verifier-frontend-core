import {
  defaultGenerateNonce,
  defaultGenerateWalletRedirectUri,
  defaultGenerateWalletResponseRedirectUriTemplate,
} from '../adapters/out/cfg';
import { createDefaultFetcher } from '../adapters/out/http';
import { defaultIsMobile } from '../adapters/out/http/DefaultIsMobile';
import {
  createGenerateEphemeralECDHPrivateJwkJoseInvoker,
  createVerifyJarmJwtJoseInvoker,
} from '../adapters/out/jose';
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
import { PortsOut } from './PortsOut';

/**
 * Abstract base implementation of PortsOut interface
 *
 * Provides default implementations for most output ports while allowing
 * specific implementations to override abstract methods. This class serves
 * as a convenient base for creating concrete PortsOut implementations by
 * providing sensible defaults and reducing boilerplate code.
 *
 * The class includes:
 * - **Default implementations** for configuration and HTTP ports
 * - **Abstract methods** for presentation exchange and session management
 * - **Configuration injection** for environment-specific settings
 * - **Type safety** through TypeScript's type system
 *
 * Concrete implementations only need to provide the abstract methods:
 * - `generatePresentationDefinition()` - Credential verification logic
 * - `session()` - Session storage implementation
 *
 * @example
 * ```typescript
 * // Concrete implementation
 * class ProductionPortsOut<T extends Record<string, GeneratePresentationDefinition>> extends AbstractPortsOut<T> {
 *   generatePresentationDefinition(key: keyof T): GeneratePresentationDefinition {
 *     return createMyPresentationDefinitionService();
 *   }
 *
 *   session(): Session<SessionSchemas> {
 *     return createRedisSession(this.config.redisUrl());
 *   }
 * }
 *
 * // Usage
 * const config = new ProductionConfiguration();
 * const portsOut = new ProductionPortsOut(config);
 * ```
 *
 * @public
 */
export abstract class AbstractPortsOut<
  T extends Record<string, GeneratePresentationDefinition>
> implements PortsOut<T>
{
  // cfg
  /**
   * Returns the default nonce generation function
   *
   * Uses Web Crypto API to generate cryptographically secure UUIDs
   * for preventing replay attacks in OAuth flows.
   *
   * @returns Default nonce generator implementation
   */
  generateNonce(): GenerateNonce {
    return defaultGenerateNonce;
  }

  /**
   * Returns the default wallet redirect URI generation function
   *
   * Constructs wallet redirect URIs by combining base URIs with
   * query parameters using standard URL APIs.
   *
   * @returns Default wallet redirect URI generator implementation
   */
  generateWalletRedirectUri(): GenerateWalletRedirectUri {
    return defaultGenerateWalletRedirectUri;
  }

  /**
   * Returns the default wallet response redirect URI template generation function
   *
   * Creates URI templates with response code placeholders for
   * dynamic wallet configuration.
   *
   * @returns Default wallet response redirect URI template generator implementation
   */
  generateWalletResponseRedirectUriTemplate(): GenerateWalletResponseRedirectUriTemplate {
    return defaultGenerateWalletResponseRedirectUriTemplate;
  }

  // http
  /**
   * Returns the default HTTP client implementation
   *
   * Creates a Fetch API-based HTTP client with automatic response
   * validation, error handling, and timeout support.
   *
   * @returns Default Fetcher implementation
   */
  fetcher(): Fetcher {
    return createDefaultFetcher();
  }

  /**
   * Returns the default mobile device detection function
   *
   * Uses UAParser library to analyze User-Agent strings and
   * determine if requests originate from mobile devices.
   *
   * @returns Default mobile detection implementation
   */
  isMobile(): IsMobile {
    return defaultIsMobile;
  }

  // prex
  /**
   * Returns a presentation definition generation function
   *
   * **Abstract method** - Must be implemented by concrete classes.
   * Should provide functionality for creating presentation definitions
   * according to the DIF Presentation Exchange specification.
   *
   * @param key - The key to use for the presentation definition
   *
   * @returns GeneratePresentationDefinition implementation
   */
  abstract generatePresentationDefinition(
    key: keyof T
  ): GeneratePresentationDefinition;

  // mdoc
  /**
   * Returns a MDOC verifier instance
   *
   * @returns MdocVerifier instance
   */
  abstract mdocVerifier(): MdocVerifier;

  // session
  /**
   * Returns a session management service
   *
   * **Abstract method** - Must be implemented by concrete classes.
   * Should provide session storage, retrieval, and lifecycle management
   * appropriate for the deployment environment (memory, Redis, database, etc.).
   *
   * @returns Session service implementation with schema validation
   */
  abstract session(): Session<SessionSchemas>;

  // jose
  /**
   * Returns a function to generate an ephemeral ECDH private key
   *
   * @returns GenerateEphemeralECDHPrivateJwk function
   */
  generateEphemeralECDHPrivateJwk(): GenerateEphemeralECDHPrivateJwk {
    return createGenerateEphemeralECDHPrivateJwkJoseInvoker();
  }

  /**
   * Returns a function to verify a JARM JWT
   *
   * @returns VerifyJarmJwt function
   */
  verifyJarmJwt(): VerifyJarmJwt {
    return createVerifyJarmJwtJoseInvoker();
  }
}
