import { Nonce, PresentationId } from '../domain';
import {
  InitTransaction,
  InitTransactionRequestJSON,
  InitTransactionResponse,
  initTransactionResponseSchema,
  JarMode,
  PresentationDefinitionMode,
  PresentationType,
  ResponseMode,
} from '../ports/input';
import {
  GenerateWalletRedirectUri,
  GenerateWalletResponseRedirectUriTemplate,
} from '../ports/out/cfg';
import { GenerateNonce } from '../ports/out/cfg/GenerateNonce';
import { PostRequest } from '../ports/out/http';
import { IsMobile } from '../ports/out/http/isMobile';
import type { Logger } from '../ports/out/logging';
import { GeneratePresentationDefinition } from '../ports/out/prex';
import { Session, SessionSchemas } from '../ports/out/session';

/**
 * Custom error class for InitTransaction service errors
 *
 * @public
 */
export class InitTransactionServiceError extends Error {
  constructor(
    public readonly errorType:
      | 'MISSING_USER_AGENT'
      | 'API_REQUEST_FAILED'
      | 'INVALID_RESPONSE'
      | 'SESSION_ERROR',
    public readonly details: string,
    public readonly originalError?: Error
  ) {
    super(`InitTransaction Service Error (${errorType}): ${details}`);
    this.name = 'InitTransactionServiceError';
  }
}

/**
 * Parameters required for generating an InitTransaction request
 *
 * @public
 */
export interface GenerateRequestParams {
  /** The public URL of the verifier application */
  publicUrl: string;

  /** The path for wallet response redirect */
  walletResponseRedirectPath: string;

  /** The query template for wallet response redirect */
  walletResponseRedirectQueryTemplate: string;

  /** Whether the request is from a mobile device */
  isMobile: boolean;

  /** The type of presentation requested */
  tokenType: PresentationType;

  /** The generated nonce for this transaction */
  nonce: Nonce;

  /** Function to generate presentation definition */
  generatePresentationDefinition: GeneratePresentationDefinition;

  /** Optional response mode */
  responseMode?: ResponseMode;

  /** Optional JAR mode */
  jarMode?: JarMode;

  /** Optional presentation definition mode */
  presentationDefinitionMode?: PresentationDefinitionMode;

  /** Function to generate wallet response redirect URI template */
  generateWalletResponseRedirectUriTemplate: GenerateWalletResponseRedirectUriTemplate;
}

/**
 * Generates an InitTransaction request object
 *
 * Creates a properly formatted InitTransactionRequestJSON object with all necessary
 * parameters for initializing an OID4VC verification transaction. This function
 * handles the conditional inclusion of wallet response redirect URI template
 * based on whether the request is from a mobile device.
 *
 * @param params - The parameters required for request generation
 * @returns The formatted InitTransactionRequestJSON object
 *
 * @example
 * ```typescript
 * const request = generateRequest({
 *   publicUrl: 'https://verifier.example.com',
 *   walletResponseRedirectPath: '/callback',
 *   walletResponseRedirectQueryTemplate: '{SESSION_ID}',
 *   isMobile: true,
 *   tokenType: 'vp_token',
 *   nonce: 'nonce_123456',
 *   generatePresentationDefinition: () => ({ definition: {} }),
 *   generateWalletResponseRedirectUriTemplate: (url, path, template) => url + path + '?session=' + template
 * });
 * ```
 *
 * @public
 */
export const generateRequest = ({
  publicUrl,
  walletResponseRedirectPath,
  walletResponseRedirectQueryTemplate,
  isMobile,
  tokenType,
  nonce,
  generatePresentationDefinition,
  responseMode,
  jarMode,
  presentationDefinitionMode,
  generateWalletResponseRedirectUriTemplate,
}: GenerateRequestParams): InitTransactionRequestJSON => {
  // Validate required parameters
  if (
    !publicUrl ||
    !walletResponseRedirectPath ||
    !walletResponseRedirectQueryTemplate
  ) {
    throw new InitTransactionServiceError(
      'INVALID_RESPONSE',
      'Required URL parameters are missing'
    );
  }

  return {
    type: tokenType,
    presentation_definition: generatePresentationDefinition(),
    nonce,
    response_mode: responseMode,
    jar_mode: jarMode,
    presentation_definition_mode: presentationDefinitionMode,
    wallet_response_redirect_uri_template: isMobile
      ? generateWalletResponseRedirectUriTemplate(
          publicUrl,
          walletResponseRedirectPath,
          walletResponseRedirectQueryTemplate
        )
      : undefined,
  };
};

/**
 * Configuration parameters for creating an InitTransaction service
 *
 * @public
 */
export interface CreateInitTransactionServiceConfig {
  /** Base URL of the API endpoint */
  apiBaseUrl: string;

  /** API path for InitTransaction endpoint */
  apiPath: string;

  /** Public URL of the verifier application */
  publicUrl: string;

  /** URL of the wallet application */
  walletUrl: string;

  /** Path for wallet response redirect */
  walletResponseRedirectPath: string;

  /** Query template for wallet response redirect */
  walletResponseRedirectQueryTemplate: string;

  /** Function to detect mobile devices */
  isMobile: IsMobile;

  /** Type of presentation to request */
  tokenType: PresentationType;

  /** Function to generate nonces */
  generateNonce: GenerateNonce;

  /** Function to generate presentation definitions */
  generatePresentationDefinition: GeneratePresentationDefinition;

  /** Optional response mode */
  responseMode?: ResponseMode;

  /** Optional JAR mode */
  jarMode?: JarMode;

  /** Optional presentation definition mode */
  presentationDefinitionMode?: PresentationDefinitionMode;

  /** Function to generate wallet response redirect URI templates */
  generateWalletResponseRedirectUriTemplate: GenerateWalletResponseRedirectUriTemplate;

  /** HTTP POST request function */
  post: PostRequest;

  /** Session management interface */
  session: Session<SessionSchemas>;

  /** Function to generate wallet redirect URIs */
  generateWalletRedirectUri: GenerateWalletRedirectUri;

  /** Logger instance for logging events */
  logger: Logger;
}

/**
 * Validates the user agent from the request
 *
 * @param request - The incoming request
 * @param logger - Logger instance for logging events
 * @returns The user agent string
 * @throws {InitTransactionServiceError} When user agent is missing
 *
 * @internal
 */
const validateUserAgent = (request: Request, logger: Logger): string => {
  const userAgent = request.headers.get('user-agent');

  if (!userAgent) {
    logger.logSecurity(
      'error',
      'InitTransactionService',
      'Missing user agent in request',
      {
        context: {
          requestUrl: request.url,
          headers: Object.fromEntries(request.headers.entries()),
        },
      }
    );

    throw new InitTransactionServiceError(
      'MISSING_USER_AGENT',
      'User agent header is required to determine device type'
    );
  }

  logger.debug('InitTransactionService', 'User agent validated successfully', {
    context: { userAgent: userAgent.substring(0, 100) }, // Limit length for privacy
  });

  return userAgent;
};

/**
 * Stores transaction data in session
 *
 * @param session - The session interface
 * @param presentationId - The presentation ID to store
 * @param nonce - The nonce to store
 * @param logger - Logger instance for logging events
 * @throws {InitTransactionServiceError} When session operations fail
 *
 * @internal
 */
const storeTransactionInSession = (
  session: Session<SessionSchemas>,
  presentationId: PresentationId,
  nonce: Nonce,
  logger: Logger
): void => {
  try {
    logger.debug(
      'InitTransactionService',
      'Storing transaction data in session',
      {
        context: {
          presentationId: presentationId.toString(),
          hasNonce: !!nonce,
        },
      }
    );

    session.set('presentationId', presentationId);
    session.set('nonce', nonce);

    logger.info(
      'InitTransactionService',
      'Transaction data stored successfully',
      {
        context: { presentationId: presentationId.toString() },
      }
    );
  } catch (error) {
    logger.error('InitTransactionService', 'Failed to store transaction data', {
      context: {
        presentationId: presentationId.toString(),
      },
      error: {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    throw new InitTransactionServiceError(
      'SESSION_ERROR',
      'Failed to store transaction data in session',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};

/**
 * Creates an InitTransaction service function
 *
 * This factory function creates a configured InitTransaction service that handles
 * the complete flow of initializing an OID4VC verification transaction. The service
 * manages nonce generation, API communication, session storage, and wallet redirect
 * URI generation.
 *
 * The created service function:
 * 1. Extracts and validates the user agent from the request
 * 2. Generates a secure nonce for the transaction
 * 3. Creates and sends an InitTransaction request to the API
 * 4. Processes the API response and creates a response object
 * 5. Stores transaction data in the session
 * 6. Generates a wallet redirect URI for the user
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
 *   generateWalletRedirectUri: (walletUrl, query) => walletUrl + '?' + new URLSearchParams(query)
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
      storeTransactionInSession(
        session,
        initTransactionResponse.presentationId,
        nonce,
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
