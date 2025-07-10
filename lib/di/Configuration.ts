import { JarmOption } from '../domain';
import {
  JarMode,
  PresentationDefinitionMode,
  PresentationType,
  ResponseMode,
} from '../ports/input';
import { HttpRequestOptions } from '../ports/out/http';
import { LoggerConfig } from '../ports/out/logging';

/**
 * Configuration interface for the OID4VC verification system
 *
 * Defines the contract for all configuration values required by the verification
 * application. This interface provides a clean abstraction over environment
 * variables, configuration files, and other configuration sources.
 *
 * The configuration is organized into several categories:
 * - **API Configuration**: Base URLs, endpoints, and HTTP settings
 * - **Application URLs**: Public URLs and view paths for the frontend
 * - **Wallet Integration**: Wallet URLs, redirect paths, and response handling
 * - **Protocol Settings**: OAuth/OpenID Connect protocol configuration
 * - **System Configuration**: Logging, request options, and operational settings
 *
 * Implementations should provide environment-specific values while maintaining
 * type safety and validation. The interface supports both required settings
 * and optional advanced configurations.
 *
 * @example
 * ```typescript
 * // Environment-specific implementation
 * class ProductionConfiguration implements Configuration {
 *   apiBaseUrl(): string {
 *     return process.env.API_BASE_URL || 'https://api.verifier.example.com';
 *   }
 *
 *   publicUrl(): string {
 *     return process.env.PUBLIC_URL || 'https://verifier.example.com';
 *   }
 *
 *   walletUrl(): string {
 *     return process.env.WALLET_URL || 'https://wallet.example.com';
 *   }
 *
 *   // ... other implementations
 * }
 *
 * // Usage in application
 * const config: Configuration = new ProductionConfiguration();
 * const apiUrl = config.apiBaseUrl();
 * const logger = createLogger(config.loggerConfig());
 * ```
 *
 * @public
 */
export interface Configuration {
  /**
   * Base URL of the API endpoint
   *
   * The root URL for all API calls made by the verification system.
   * Should include the protocol (https://) and may include a path prefix.
   *
   * @returns Base URL string (e.g., 'https://api.verifier.example.com')
   */
  apiBaseUrl(): string;

  /**
   * InitTransaction API path
   *
   * The relative path for the transaction initialization endpoint.
   * Combined with `apiBaseUrl()` to form the complete endpoint URL.
   *
   * @returns API path string (e.g., '/api/v1/init-transaction')
   */
  initTransactionApiPath(): string;

  /**
   * GetWalletResponse API path
   *
   * The relative path for the wallet response endpoint.
   * Combined with `apiBaseUrl()` to form the complete endpoint URL.
   *
   * @returns API path string (e.g., '/api/v1/get-wallet-response')
   */
  getWalletResponseApiPath(): string;

  /**
   * Public URL of the verifier application
   *
   * The externally accessible URL where the verification application
   * is hosted. Used for constructing redirect URIs and callback URLs.
   *
   * @returns Public URL string (e.g., 'https://verifier.example.com')
   */
  publicUrl(): string;

  /**
   * Home view path
   *
   * The path for the application's home/landing page.
   * Used for navigation and initial page routing.
   *
   * @returns View path string (e.g., '/home', '/')
   */
  homeViewPath(): string;

  /**
   * InitTransaction view path
   *
   * The path for the transaction initialization page where
   * verification requests are started.
   *
   * @returns View path string (e.g., '/init', '/start-verification')
   */
  initTransactionViewPath(additionalPath?: string): string;

  /**
   * Result view path
   *
   * The path for displaying verification results after
   * the credential presentation process completes.
   *
   * @returns View path string (e.g., '/result', '/verification-result')
   */
  resultViewPath(): string;

  /**
   * URL of the wallet application
   *
   * The base URL of the wallet application that will receive
   * credential presentation requests. Used for constructing
   * wallet-specific redirect URIs.
   *
   * @returns Wallet URL string (e.g., 'https://wallet.example.com')
   */
  walletUrl(): string;

  /**
   * Path for wallet response redirect
   *
   * The path on the verifier application where the wallet
   * will redirect after completing the credential presentation.
   *
   * @returns Redirect path string (e.g., '/wallet-response', '/callback')
   */
  walletResponseRedirectPath(): string;

  /**
   * Query template for wallet response redirect
   *
   * Template string with placeholders that will be replaced with
   * actual response codes when constructing wallet redirect URIs.
   * Typically contains placeholders like '{RESPONSE_CODE}' or '{STATE}'.
   *
   * @returns Query template string (e.g., '{RESPONSE_CODE}', 'code={CODE}&state={STATE}')
   */
  walletResponseRedirectQueryTemplate(): string;

  /**
   * Type of presentation to request
   *
   * Specifies the format of credential presentation expected
   * from the wallet. Determines the structure of the presentation
   * request and response.
   *
   * @returns Presentation type ('vp_token' for Verifiable Presentation tokens)
   */
  tokenType(): PresentationType;

  /**
   * Optional response mode
   *
   * Specifies how the wallet should return the credential presentation.
   * Different modes support various integration patterns and security
   * requirements.
   *
   * @returns Response mode or undefined for default behavior
   */
  responseMode(): ResponseMode | undefined;

  /**
   * Optional JAR (JWT-Secured Authorization Request) mode
   *
   * Determines whether and how to use JWT-Secured Authorization Requests
   * for enhanced security in the credential presentation flow.
   *
   * @returns JAR mode configuration or undefined to disable JAR
   */
  jarMode(): JarMode | undefined;

  /**
   * Optional presentation definition mode
   *
   * Controls how presentation definitions are handled in the verification
   * request. Different modes support various credential schema formats
   * and verification requirements.
   *
   * @returns Presentation definition mode or undefined for default handling
   */
  presentationDefinitionMode(): PresentationDefinitionMode | undefined;

  /**
   * Request options for HTTP requests
   *
   * Default HTTP options applied to all API requests made by the system.
   * Excludes headers as they are typically set per-request, but includes
   * timeouts, retry policies, and other request-level configuration.
   *
   * @returns HTTP request options without headers, or undefined for defaults
   */
  requestOptions(): Omit<HttpRequestOptions, 'headers'> | undefined;

  /**
   * Logger configuration
   *
   * Configuration object specifying logging behavior including log levels,
   * output formats, security settings, and environment-specific options.
   * Used to initialize the application's logging system.
   *
   * @returns Logger configuration object with level, security, and format settings
   */
  loggerConfig(): LoggerConfig;

  /**
   * Function to get the signed response algorithm for the authorization
   * @type {() => string | undefined}
   */
  authorizationSignedResponseAlg(): string | undefined;

  /**
   * Function to get the encrypted response algorithm for the authorization
   * @type {() => string | undefined}
   */
  authorizationEncryptedResponseAlg(): string | undefined;

  /**
   * Function to get the encrypted response encryption for the authorization
   * @type {() => string | undefined}
   */
  authorizationEncryptedResponseEnc(): string | undefined;

  /**
   * Function to get the JARM option
   * @type {() => JarmOption}
   */
  jarmOption(): JarmOption;
}
