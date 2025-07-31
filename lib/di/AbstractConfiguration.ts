import { parseJarmOption } from '../adapters/out/jose';
import { JarmOption } from '../domain';
import {
  JarMode,
  PresentationDefinitionMode,
  PresentationType,
  ResponseMode,
} from '../ports/input';
import { HttpRequestOptions } from '../ports/out/http';
import { Configuration } from './Configuration';

/**
 * Abstract base implementation of the Configuration interface
 *
 * Provides sensible default implementations for most configuration methods
 * while requiring concrete implementations to specify environment-specific
 * values for critical settings. This class reduces boilerplate code and
 * ensures consistent behavior across different deployment environments.
 *
 * The class includes:
 * - **Default implementations** for optional protocol settings and view paths
 * - **Abstract methods** for URLs and API endpoints that must be environment-specific
 * - **Configurable defaults** that can be overridden in concrete implementations
 *
 * Concrete implementations only need to provide:
 * - `apiBaseUrl()` - Backend API endpoint
 * - `publicUrl()` - Frontend application URL
 * - `walletUrl()` - Wallet application URL
 * - `initTransactionApiPath()` - API path for transaction initialization
 * - `walletResponseRedirectPath()` - Callback path for wallet responses
 *
 * @example
 * ```typescript
 * // Environment-specific implementation
 * class DevelopmentConfiguration extends AbstractConfiguration {
 *   apiBaseUrl(): string {
 *     return 'http://localhost:3001';
 *   }
 *
 *   publicUrl(): string {
 *     return 'http://localhost:3000';
 *   }
 *
 *   walletUrl(): string {
 *     return 'http://localhost:3002';
 *   }
 *
 *   initTransactionApiPath(): string {
 *     return '/api/init-transaction';
 *   }
 *
 *   walletResponseRedirectPath(): string {
 *     return '/wallet-callback';
 *   }
 *
 *   // Optionally override defaults
 *   homeViewPath(): string {
 *     return '/dev-home'; // Override default '/home'
 *   }
 * }
 *
 * // Usage
 * const config = new DevelopmentConfiguration();
 * ```
 *
 * @public
 */
export abstract class AbstractConfiguration implements Configuration {
  // Abstract methods - must be implemented by concrete classes

  /**
   * Base URL of the API endpoint
   *
   * **Abstract method** - Must be implemented by concrete classes.
   * Should return the complete base URL for the backend API,
   * including protocol and any path prefixes.
   *
   * @returns Base URL string for API endpoints
   */
  abstract apiBaseUrl(): string;

  /**
   * InitTransaction API path
   *
   * **Abstract method** - Must be implemented by concrete classes.
   * Should return the relative path for the transaction initialization
   * endpoint that will be combined with `apiBaseUrl()`.
   *
   * @returns API path string for transaction initialization
   */
  abstract initTransactionApiPath(): string;

  /**
   * GetWalletResponse API path
   *
   * **Abstract method** - Must be implemented by concrete classes.
   * Should return the relative path for the wallet response endpoint that will be combined with `apiBaseUrl()`.
   *
   * @returns API path string for wallet response
   */
  abstract getWalletResponseApiPath(): string;

  /**
   * Public URL of the verifier application
   *
   * **Abstract method** - Must be implemented by concrete classes.
   * Should return the externally accessible URL where users can
   * access the verification application.
   *
   * @returns Public URL string for the verifier application
   */
  abstract publicUrl(): string;

  /**
   * URL of the wallet application
   *
   * **Abstract method** - Must be implemented by concrete classes.
   * Should return the base URL of the wallet application that will
   * handle credential presentation requests.
   *
   * @returns Wallet application URL string
   */
  abstract walletUrl(): string;

  /**
   * Path for wallet response redirect
   *
   * **Abstract method** - Must be implemented by concrete classes.
   * Should return the path where the wallet will redirect users
   * after completing credential presentation.
   *
   * @returns Wallet response redirect path string
   */
  abstract walletResponseRedirectPath(): string;

  // Default implementations - can be overridden if needed

  /**
   * Query template for wallet response redirect
   *
   * Returns a default template with response code placeholder.
   * Can be overridden to support more complex query parameter structures.
   *
   * @returns Default query template string with response code placeholder
   */
  walletResponseRedirectQueryTemplate(): string {
    return '{RESPONSE_CODE}';
  }

  /**
   * Type of presentation to request
   *
   * Returns the default presentation type for credential requests.
   * Override to support different credential formats or presentation types.
   *
   * @returns Default presentation type ('vp_token')
   */
  tokenType(): PresentationType {
    return 'vp_token';
  }

  /**
   * Home view path
   *
   * Returns the default path for the application's home page.
   * Override to customize application routing.
   *
   * @returns Default home view path ('/home')
   */
  homeViewPath(): string {
    return '/home';
  }

  /**
   * InitTransaction view path
   *
   * Returns the default path for the transaction initialization page.
   * Override to customize application routing.
   * @param additionalPath - Additional path to append to the default path
   *
   * @returns Init transaction view path ('/init' or '/init/additionalPath')
   */
  initTransactionViewPath(additionalPath?: string): string {
    return `/init${additionalPath ? `/${additionalPath}` : ''}`;
  }

  /**
   * Result view path
   *
   * Returns the default path for displaying verification results.
   * Override to customize application routing.
   * @param additionalPath - Additional path to append to the default path
   *
   * @returns Result view path ('/result' or '/result/additionalPath')
   */
  resultViewPath(additionalPath?: string): string {
    return `/result${additionalPath ? `/${additionalPath}` : ''}`;
  }

  /**
   * Optional response mode
   *
   * Returns undefined by default, indicating standard response handling.
   * Override to enable specific response modes for enhanced security
   * or integration requirements.
   *
   * @returns undefined (no specific response mode)
   */
  responseMode(): ResponseMode | undefined {
    return;
  }

  /**
   * Optional JAR (JWT-Secured Authorization Request) mode
   *
   * Returns undefined by default, disabling JAR functionality.
   * Override to enable JWT-secured authorization requests for
   * enhanced security in credential exchanges.
   *
   * @returns undefined (JAR disabled)
   */
  jarMode(): JarMode | undefined {
    return;
  }

  /**
   * Request options for HTTP requests
   *
   * Returns undefined by default, using system defaults for HTTP requests.
   * Override to set custom timeouts, retry policies, or other
   * request-level configuration.
   *
   * @returns undefined (use default HTTP options)
   */
  requestOptions(): Omit<HttpRequestOptions, 'headers'> | undefined {
    return;
  }

  /**
   * Optional presentation definition mode
   *
   * Returns undefined by default, using standard presentation definition handling.
   * Override to enable specific modes for credential schema validation
   * or presentation requirement processing.
   *
   * @returns undefined (standard presentation definition handling)
   */
  presentationDefinitionMode(): PresentationDefinitionMode | undefined {
    return;
  }

  /**
   * Function to get the signed response algorithm for the authorization
   * @type {() => string | undefined}
   */
  authorizationSignedResponseAlg = (): string | undefined => undefined;

  /**
   * Function to get the encrypted response algorithm for the authorization
   * @type {() => string | undefined}
   */
  authorizationEncryptedResponseAlg = (): string | undefined =>
    'ECDH-ES+A256KW';

  /**
   * Function to get the encrypted response encryption for the authorization
   * @type {() => string | undefined}
   */
  authorizationEncryptedResponseEnc = (): string | undefined => 'A256GCM';

  /**
   * Function to get the JARM option
   * @type {() => JarmOption}
   */
  jarmOption = (): JarmOption =>
    parseJarmOption(
      this.authorizationSignedResponseAlg(),
      this.authorizationEncryptedResponseAlg(),
      this.authorizationEncryptedResponseEnc()
    )!;
}
