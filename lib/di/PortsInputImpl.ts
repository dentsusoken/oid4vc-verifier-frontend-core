import { Configuration, PortsInput, PortsOut } from '.';
import { GeneratePresentationDefinition } from '../ports';
import {
  createGetWalletResponseService,
  createInitTransactionService,
} from '../services';

/**
 * Default implementation of PortsInput interface
 *
 * Provides the concrete implementation of input ports for the OID4VC verification
 * system. This class serves as the main entry point for creating and configuring
 * application services by combining configuration and output port dependencies.
 *
 * The implementation follows the dependency injection pattern by:
 * - **Configuration injection** - Receives system configuration settings
 * - **Port composition** - Combines output ports to create input services
 * - **Service factory** - Creates configured service instances on demand
 * - **Type safety** - Maintains type constraints through generics
 *
 * This class acts as a bridge between the external interface (input ports) and
 * internal implementation details (services, configuration, output ports).
 *
 * @example
 * ```typescript
 * // Setup dependencies
 * const config = new ProductionConfiguration();
 * const portsOut = new ProductionPortsOut(config);
 *
 * // Create input ports implementation
 * const portsInput = new PortsInputImpl(config, portsOut);
 *
 * // Use the services
 * const initService = portsInput.initTransaction('credentialType');
 * const result = await initService.execute(request);
 * ```
 *
 * @typeParam T - Record type mapping presentation definition keys to their implementations
 * @public
 */
export class PortsInputImpl<
  T extends Record<string, GeneratePresentationDefinition>
> implements PortsInput<T>
{
  readonly #config: Configuration;
  readonly #portsOut: PortsOut<T>;

  /**
   * Creates a new PortsInputImpl instance
   *
   * @param config - Configuration object containing system settings
   * @param portsOut - Output ports implementation providing external dependencies
   */
  constructor(config: Configuration, portsOut: PortsOut<T>) {
    this.#config = config;
    this.#portsOut = portsOut;
  }

  /**
   * Creates and returns an InitTransaction use case service
   *
   * This method provides access to the transaction initialization functionality,
   * which handles the start of the OID4VC verification process including:
   * - Nonce generation for security
   * - Presentation request creation based on the specified key
   * - Wallet redirect URI construction
   * - Session management and state tracking
   * - ECDH key generation for secure communication
   *
   * The service is configured with all necessary dependencies from both
   * configuration and output ports to ensure proper operation.
   *
   * @param key - The key to select the appropriate presentation definition for credential verification
   * @returns InitTransaction service instance configured with all required dependencies
   *
   * @example
   * ```typescript
   * const initService = portsInput.initTransaction('drivingLicense');
   * const result = await initService.execute({
   *   presentationDefinitionMode: PresentationDefinitionMode.BY_REFERENCE,
   *   responseMode: ResponseMode.DIRECT_POST_JWT
   * });
   * ```
   */
  initTransaction(key: keyof T) {
    return createInitTransactionService({
      apiBaseUrl: this.#config.apiBaseUrl(),
      apiPath: this.#config.initTransactionApiPath(),
      publicUrl: this.#config.publicUrl(),
      walletUrl: this.#config.walletUrl(),
      walletResponseRedirectPath: this.#config.resultViewPath(),
      generatePresentationDefinition:
        this.#portsOut.generatePresentationDefinition(key),
      session: this.#portsOut.session(),
      walletResponseRedirectQueryTemplate:
        this.#config.walletResponseRedirectQueryTemplate(),
      isMobile: this.#portsOut.isMobile(),
      tokenType: this.#config.tokenType(),
      generateNonce: this.#portsOut.generateNonce(),
      generateWalletResponseRedirectUriTemplate:
        this.#portsOut.generateWalletResponseRedirectUriTemplate(),
      post: this.#portsOut.fetcher().post,
      generateWalletRedirectUri: this.#portsOut.generateWalletRedirectUri(),
      generateEphemeralECDHPrivateJwk:
        this.#portsOut.generateEphemeralECDHPrivateJwk(),
    });
  }

  /**
   * Creates and returns a GetWalletResponse use case service
   *
   * This method provides access to the wallet response processing functionality,
   * which handles the completion of the OID4VC verification process including:
   * - Wallet response retrieval and validation
   * - MDOC (Mobile Document) verification
   * - JARM (JWT-secured Authorization Response Mode) processing
   * - Session state management and cleanup
   *
   * The service is configured with all necessary dependencies for secure
   * credential verification and response processing.
   *
   * @returns GetWalletResponse service instance configured with verification and session dependencies
   *
   * @example
   * ```typescript
   * const responseService = portsInput.getWalletResponse();
   * const result = await responseService.execute({
   *   transactionId: 'tx-123',
   *   presentationId: 'pres-456'
   * });
   * ```
   */
  getWalletResponse() {
    return createGetWalletResponseService({
      apiBaseUrl: this.#config.apiBaseUrl(),
      apiPath: this.#config.getWalletResponseApiPath(),
      session: this.#portsOut.session(),
      get: this.#portsOut.fetcher().get,
      mdocVerifier: this.#portsOut.mdocVerifier(),
      verifyJarmJwt: this.#portsOut.verifyJarmJwt(),
      jarmOption: this.#config.jarmOption(),
    });
  }
}
