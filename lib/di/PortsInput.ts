import { GetWalletResponse, InitTransaction } from '../ports/input';

/**
 * Input ports interface for dependency injection
 *
 * Defines the contract for input port dependencies in the OID4VC verification system.
 * This interface follows the hexagonal architecture pattern, providing access to
 * application use cases and business logic from the outside world.
 *
 * Input ports represent the entry points to the application's core functionality,
 * typically exposed as REST APIs, GraphQL endpoints, or other external interfaces.
 * This abstraction allows for easy testing, mocking, and swapping of different
 * input implementations.
 *
 * @example
 * ```typescript
 * // Implementation example
 * class DefaultPortsInput implements PortsInput {
 *   initTransaction(): InitTransaction {
 *     return createInitTransactionService(this.portsOut);
 *   }
 * }
 *
 * // Usage in dependency injection container
 * const portsInput: PortsInput = new DefaultPortsInput();
 * const initTxService = portsInput.initTransaction();
 * ```
 *
 * @public
 */
export interface PortsInput {
  /**
   * Creates and returns an InitTransaction use case service
   *
   * This method provides access to the transaction initialization functionality,
   * which handles the start of the OID4VC verification process including:
   * - Nonce generation
   * - Presentation request creation
   * - Wallet redirect URI construction
   * - Session management
   *
   * @returns InitTransaction service instance configured with necessary dependencies
   *
   * @example
   * ```typescript
   * const initTx = portsInput.initTransaction();
   * const result = await initTx({
   *   userAgent: 'Mozilla/5.0...',
   *   requestUrl: 'https://verifier.example.com/init',
   *   presentationId: 'pres-123'
   * });
   * ```
   */
  initTransaction(): InitTransaction;

  /**
   * Creates and returns a GetWalletResponse use case service
   *
   * This method provides access to the wallet response functionality,
   * which handles the retrieval of a wallet response from the backend.
   *
   * @returns GetWalletResponse service instance configured with necessary dependencies
   *
   * @example
   * ```typescript
   * const getWalletResponse = portsInput.getWalletResponse();
   * const result = await getWalletResponse();
   * ```
   */
  getWalletResponse(): GetWalletResponse;
}
