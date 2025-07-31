import { EphemeralECDHPublicJwk } from '../domain';
import {
  InitTransaction,
  InitTransactionResponse,
  initTransactionResponseSchema,
} from '../ports/input';
import { InitTransactionServiceError } from './InitTransactionService.errors';
import {
  generateRequest,
  storeTransactionInSession,
  validateUserAgent,
} from './InitTransactionService.helpers';
import { CreateInitTransactionServiceConfig } from './InitTransactionService.types';

/**
 * Creates an InitTransaction service function
 *
 * This factory function creates a configured InitTransaction service that handles
 * the complete flow of initializing an OID4VC verification transaction. The service
 * manages ephemeral key generation, nonce generation, API communication, session storage,
 * and wallet redirect URI generation.
 *
 * The created service function:
 * 1. Extracts and validates the user agent from the request
 * 2. Generates a secure nonce for the transaction
 * 3. Generates ephemeral ECDH private/public key pair for encrypted communication
 * 4. Creates and sends an InitTransaction request to the API
 * 5. Processes the API response and creates a response object
 * 6. Stores transaction data (including ephemeral private key) in the session
 * 7. Generates a wallet redirect URI for the user
 *
 * @param config - Configuration parameters for the service
 * @returns A configured InitTransaction function
 *
 * @throws {InitTransactionServiceError} When configuration validation fails
 *
 * @example
 * ```typescript
 * const initTransaction = createInitTransactionService({
 *   apiBaseUrl: 'https://api.verifier.com',
 *   apiPath: '/v1/transactions/init',
 *   publicUrl: 'https://verifier.com',
 *   walletUrl: 'https://wallet.example.com',
 *   walletResponseRedirectPath: '/callback',
 *   walletResponseRedirectQueryTemplate: '{SESSION_ID}',
 *   isMobile: (userAgent) => userAgent.includes('Mobile'),
 *   tokenType: 'vp_token',
 *   generateNonce: () => 'nonce_' + Math.random(),
 *   generatePresentationDefinition: () => ({ definition: {} }),
 *   generateWalletResponseRedirectUriTemplate: (url, path, template) => url + path + '?session=' + template,
 *   post: async (url, path, body, schema) => ({ data: schema.parse(JSON.parse(body)) }),
 *   session: sessionImplementation,
 *   generateWalletRedirectUri: (walletUrl, query) => walletUrl + '?' + new URLSearchParams(query),
 *   generateEphemeralECDHPrivateJwk: ephemeralKeyGeneratorImplementation
 * });
 *
 * // Use the service
 * const result = await initTransaction(request);
 * console.log('Wallet redirect URI:', result.walletRedirectUri);
 * ```
 *
 * @public
 */
export const createInitTransactionService = ({
  apiBaseUrl,
  apiPath,
  walletResponseRedirectPath,
  publicUrl,
  walletResponseRedirectQueryTemplate,
  isMobile,
  tokenType,
  generateNonce,
  generatePresentationDefinition,
  responseMode,
  jarMode,
  presentationDefinitionMode,
  generateWalletResponseRedirectUriTemplate,
  post,
  session,
  generateWalletRedirectUri,
  walletUrl,
  generateEphemeralECDHPrivateJwk,
}: CreateInitTransactionServiceConfig): InitTransaction => {
  // Validate configuration
  if (!apiBaseUrl || !apiPath || !publicUrl || !walletUrl) {
    throw new InitTransactionServiceError(
      'INVALID_RESPONSE',
      'Required configuration parameters are missing'
    );
  }

  return async (request: Request) => {
    try {
      // Validate user agent
      const userAgent = validateUserAgent(request);

      // Generate nonce for this transaction
      const nonce = generateNonce();

      const ephemeralECDHPrivateJwk = (await generateEphemeralECDHPrivateJwk())
        .value!;

      const publicJwk = JSON.parse(ephemeralECDHPrivateJwk.toJSON());
      delete publicJwk.d;

      const ephemeralECDHPublicJwk = new EphemeralECDHPublicJwk(
        JSON.stringify(publicJwk)
      );

      const initTransactionRequest = generateRequest({
        generatePresentationDefinition,
        generateWalletResponseRedirectUriTemplate,
        isMobile: isMobile(userAgent),
        jarMode,
        nonce,
        presentationDefinitionMode,
        publicUrl,
        responseMode,
        tokenType,
        walletResponseRedirectPath,
        walletResponseRedirectQueryTemplate,
        ephemeralECDHPublicJwk,
      });

      let apiResponse;
      try {
        apiResponse = await post(
          apiBaseUrl,
          apiPath,
          JSON.stringify(initTransactionRequest),
          initTransactionResponseSchema
        );
      } catch (error) {
        throw new InitTransactionServiceError(
          'API_REQUEST_FAILED',
          'Failed to communicate with InitTransaction API',
          error instanceof Error ? error : new Error(String(error))
        );
      }

      let initTransactionResponse;
      try {
        initTransactionResponse = InitTransactionResponse.fromJSON(
          apiResponse.data
        );
      } catch (error) {
        throw new InitTransactionServiceError(
          'INVALID_RESPONSE',
          'Failed to parse InitTransaction API response',
          error instanceof Error ? error : new Error(String(error))
        );
      }

      // Store transaction data in session
      await storeTransactionInSession(
        session,
        initTransactionResponse.presentationId,
        nonce,
        ephemeralECDHPrivateJwk
      );

      // Generate wallet redirect URI

      let walletRedirectUri;
      try {
        walletRedirectUri = generateWalletRedirectUri(
          walletUrl,
          initTransactionResponse.toWalletRedirectParams()
        );
      } catch (error) {
        throw new InitTransactionServiceError(
          'INVALID_RESPONSE',
          'Failed to generate wallet redirect URI',
          error instanceof Error ? error : new Error(String(error))
        );
      }

      return {
        walletRedirectUri,
        isMobile: isMobile(userAgent),
      };
    } catch (error) {
      if (error instanceof InitTransactionServiceError) {
        throw error;
      }

      // Wrap other errors
      throw new InitTransactionServiceError(
        'API_REQUEST_FAILED',
        'Unexpected error during transaction initialization',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };
};
