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
 *   logger: loggerImplementation,
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
  logger,
  generateEphemeralECDHPrivateJwk,
}: CreateInitTransactionServiceConfig): InitTransaction => {
  // Validate configuration
  if (!apiBaseUrl || !apiPath || !publicUrl || !walletUrl) {
    logger.error('InitTransactionService', 'Invalid configuration provided', {
      context: {
        hasApiBaseUrl: !!apiBaseUrl,
        hasApiPath: !!apiPath,
        hasPublicUrl: !!publicUrl,
        hasWalletUrl: !!walletUrl,
      },
    });

    throw new InitTransactionServiceError(
      'INVALID_RESPONSE',
      'Required configuration parameters are missing'
    );
  }

  logger.info('InitTransactionService', 'Service created successfully', {
    context: {
      apiBaseUrl: apiBaseUrl.substring(0, 50), // Limit for privacy
      apiPath,
      hasWalletUrl: !!walletUrl,
    },
  });

  return async (request: Request) => {
    const startTime = performance.now();

    logger.info(
      'InitTransactionService',
      'Starting transaction initialization',
      {
        requestId: crypto.randomUUID(),
        context: {
          requestUrl: request.url,
          method: request.method,
        },
      }
    );

    try {
      // Validate user agent
      const userAgent = validateUserAgent(request, logger);

      // Generate nonce for this transaction
      const nonce = generateNonce();

      logger.debug(
        'InitTransactionService',
        'Generated nonce for transaction',
        {
          context: {
            hasNonce: !!nonce,
            userAgentType: isMobile(userAgent) ? 'mobile' : 'desktop',
          },
        }
      );

      const ephemeralECDHPrivateJwk = (await generateEphemeralECDHPrivateJwk())
        .value!;

      logger.debug(
        'InitTransactionService',
        'Generated ephemeral ECDH private JWK',
        {
          context: {
            hasEphemeralECDHPrivateJwk: !!ephemeralECDHPrivateJwk,
          },
        }
      );

      const publicJwk = JSON.parse(ephemeralECDHPrivateJwk.toJSON());
      delete publicJwk.d;

      const ephemeralECDHPublicJwk = new EphemeralECDHPublicJwk(
        JSON.stringify(publicJwk)
      );

      // Create InitTransaction request
      logger.debug(
        'InitTransactionService',
        'Creating InitTransaction request'
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

      // Send request to API
      logger.info(
        'InitTransactionService',
        'Sending request to InitTransaction API',
        {
          context: {
            apiBaseUrl: apiBaseUrl.substring(0, 50),
            apiPath,
            requestType: initTransactionRequest.type,
          },
        }
      );

      let apiResponse;
      try {
        apiResponse = await post(
          apiBaseUrl,
          apiPath,
          JSON.stringify(initTransactionRequest),
          initTransactionResponseSchema
        );

        logger.info(
          'InitTransactionService',
          'API request completed successfully',
          {
            context: {
              hasResponse: !!apiResponse,
              hasData: !!apiResponse?.data,
            },
          }
        );
      } catch (error) {
        logger.error('InitTransactionService', 'API request failed', {
          context: {
            apiBaseUrl: apiBaseUrl.substring(0, 50),
            apiPath,
          },
          error: {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        });

        throw new InitTransactionServiceError(
          'API_REQUEST_FAILED',
          'Failed to communicate with InitTransaction API',
          error instanceof Error ? error : new Error(String(error))
        );
      }

      // Parse API response
      logger.debug('InitTransactionService', 'Parsing API response');

      let initTransactionResponse;
      try {
        initTransactionResponse = InitTransactionResponse.fromJSON(
          apiResponse.data
        );

        logger.info(
          'InitTransactionService',
          'API response parsed successfully',
          {
            context: {
              presentationId: initTransactionResponse.presentationId.toString(),
            },
          }
        );
      } catch (error) {
        logger.error('InitTransactionService', 'Failed to parse API response', {
          context: {
            responseData: JSON.stringify(apiResponse.data).substring(0, 200),
          },
          error: {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        });

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
        ephemeralECDHPrivateJwk,
        logger
      );

      // Generate wallet redirect URI
      logger.debug('InitTransactionService', 'Generating wallet redirect URI', {
        context: {
          walletUrl: walletUrl.substring(0, 50),
          presentationId: initTransactionResponse.presentationId.toString(),
        },
      });

      let walletRedirectUri;
      try {
        walletRedirectUri = generateWalletRedirectUri(
          walletUrl,
          initTransactionResponse.toWalletRedirectParams()
        );

        logger.info(
          'InitTransactionService',
          'Wallet redirect URI generated successfully',
          {
            context: {
              hasRedirectUri: !!walletRedirectUri,
              uriLength: walletRedirectUri?.length || 0,
            },
          }
        );
      } catch (error) {
        logger.error(
          'InitTransactionService',
          'Failed to generate wallet redirect URI',
          {
            context: {
              walletUrl: walletUrl.substring(0, 50),
              presentationId: initTransactionResponse.presentationId.toString(),
            },
            error: {
              name: error instanceof Error ? error.name : 'Unknown',
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            },
          }
        );

        throw new InitTransactionServiceError(
          'INVALID_RESPONSE',
          'Failed to generate wallet redirect URI',
          error instanceof Error ? error : new Error(String(error))
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      logger.logPerformance(
        'InitTransactionService',
        'Transaction initialization completed',
        {
          performance: {
            duration: Math.round(duration),
          },
          context: {
            presentationId: initTransactionResponse.presentationId.toString(),
            success: true,
          },
        }
      );

      logger.logAudit('InitTransactionService', 'transaction.initialized', {
        context: {
          presentationId: initTransactionResponse.presentationId.toString(),
          userAgentType: isMobile(userAgent) ? 'mobile' : 'desktop',
          tokenType: initTransactionRequest.type,
        },
      });

      return {
        walletRedirectUri,
        isMobile: isMobile(userAgent),
      };
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log performance even for failed requests
      logger.logPerformance(
        'InitTransactionService',
        'Transaction initialization failed',
        {
          performance: {
            duration: Math.round(duration),
          },
          context: {
            success: false,
            errorType:
              error instanceof InitTransactionServiceError
                ? error.errorType
                : 'UNKNOWN',
          },
        }
      );

      // Re-throw InitTransactionServiceError as-is
      if (error instanceof InitTransactionServiceError) {
        logger.error(
          'InitTransactionService',
          'Transaction initialization failed with known error',
          {
            context: {
              errorType: error.errorType,
              details: error.details,
            },
            error: {
              name: error.name,
              message: error.message,
              stack: error.stack,
            },
          }
        );
        throw error;
      }

      // Wrap other errors
      logger.error(
        'InitTransactionService',
        'Transaction initialization failed with unexpected error',
        {
          error: {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        }
      );

      throw new InitTransactionServiceError(
        'API_REQUEST_FAILED',
        'Unexpected error during transaction initialization',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };
};
