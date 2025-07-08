import {
  defaultGenerateNonce,
  defaultGenerateWalletRedirectUri,
  defaultGenerateWalletResponseRedirectUriTemplate,
} from '../adapters/out/cfg';
import { createDefaultFetcher } from '../adapters/out/http';
import { defaultIsMobile } from '../adapters/out/http/DefaultIsMobile';
import { createDefaultLogger } from '../adapters/out/logging';
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
import { Configuration } from './Configuration';
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
 * - **Default implementations** for configuration, HTTP, and logging ports
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
 * class ProductionPortsOut extends AbstractPortsOut {
 *   generatePresentationDefinition(): GeneratePresentationDefinition {
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
 * const logger = portsOut.logger(); // Uses default implementation
 * ```
 *
 * @public
 */
export abstract class AbstractPortsOut implements PortsOut {
  /**
   * Configuration instance injected during construction
   * @private
   */
  #config: Configuration;

  /**
   * Creates a new AbstractPortsOut instance
   *
   * @param config - Configuration instance providing environment-specific settings
   */
  constructor(config: Configuration) {
    this.#config = config;
  }

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

  // logging
  /**
   * Returns a configured logger instance
   *
   * Creates a logger with environment-specific configuration,
   * including log levels, security settings, and output formatting.
   * Uses the configuration's logger settings for production vs development.
   *
   * @returns Logger instance configured for current environment
   */
  logger(): Logger {
    return createDefaultLogger(this.#config.loggerConfig());
  }

  // prex
  /**
   * Returns a presentation definition generation function
   *
   * **Abstract method** - Must be implemented by concrete classes.
   * Should provide functionality for creating presentation definitions
   * according to the DIF Presentation Exchange specification.
   *
   * @returns GeneratePresentationDefinition implementation
   */
  abstract generatePresentationDefinition(): GeneratePresentationDefinition;

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
}
