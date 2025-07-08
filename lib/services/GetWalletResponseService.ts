import { PresentationId } from '../domain';
import { MdocVerifier } from '../ports';
import {
  GetWalletResponse,
  GetWalletResponseResponse,
  GetWalletResponseResponseSchema,
  GetWalletResponseResult,
} from '../ports/input';
import { GetRequest } from '../ports/out/http';
import type { Logger } from '../ports/out/logging';
import { Session, SessionSchemas } from '../ports/out/session';

/**
 * Custom error class for GetWalletResponse service errors
 *
 * @public
 */
export class GetWalletResponseServiceError extends Error {
  constructor(
    public readonly errorType:
      | 'MISSING_PRESENTATION_ID'
      | 'MISSING_VP_TOKEN'
      | 'API_REQUEST_FAILED'
      | 'INVALID_RESPONSE'
      | 'SESSION_ERROR',
    public readonly details: string,
    public readonly originalError?: Error
  ) {
    super(`GetWalletResponse Service Error (${errorType}): ${details}`);
    this.name = 'GetWalletResponseServiceError';
  }
}

/**
 * Configuration parameters for creating a GetWalletResponse service
 *
 * @public
 */
export interface CreateGetWalletResponseServiceConfig {
  /** Base URL of the API endpoint */
  apiBaseUrl: string;

  /** API path for GetWalletResponse endpoint */
  apiPath: string;

  /** HTTP GET request function */
  get: GetRequest;

  /** Session management interface */
  session: Session<SessionSchemas>;

  /** Logger instance for logging events */
  logger: Logger;

  /** MDOC verifier instance */
  mdocVerifier: MdocVerifier;
}

/**
 * Retrieves presentation ID from session
 *
 * @param session - The session interface
 * @param logger - Logger instance for logging events
 * @returns The presentation ID from session
 * @throws {GetWalletResponseServiceError} When presentation ID is missing
 *
 * @internal
 */
const getPresentationIdFromSession = async (
  session: Session<SessionSchemas>,
  logger: Logger
): Promise<PresentationId> => {
  logger.debug(
    'GetWalletResponseService',
    'Retrieving presentation ID from session'
  );

  const presentationId = await session.get('presentationId');

  if (!presentationId) {
    // Get session keys for debugging
    let sessionKeys: Array<keyof SessionSchemas> = [];
    try {
      sessionKeys = await session.keys();
    } catch (error) {
      logger.debug(
        'GetWalletResponseService',
        'Failed to retrieve session keys for debugging',
        {
          error: {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
          },
        }
      );
    }

    logger.logSecurity(
      'error',
      'GetWalletResponseService',
      'Presentation ID not found in session',
      {
        context: {
          sessionKeys: sessionKeys.map(String),
        },
      }
    );

    throw new GetWalletResponseServiceError(
      'MISSING_PRESENTATION_ID',
      'Presentation ID not found in session. The session may have expired or the transaction was not properly initialized.'
    );
  }

  logger.debug(
    'GetWalletResponseService',
    'Presentation ID retrieved successfully',
    {
      context: {
        presentationId: presentationId.toString(),
      },
    }
  );

  return presentationId;
};

/**
 * Creates a GetWalletResponse service function
 *
 * This factory function creates a configured GetWalletResponse service that handles
 * the complete flow of retrieving wallet response data from the OID4VC verification API
 * and verifying MDOC credentials. The service manages session validation, API communication,
 * MDOC verification, and returns the verification result.
 *
 * The created service function:
 * 1. Retrieves the presentation ID from the session
 * 2. Constructs the API request with optional response code
 * 3. Sends a GET request to the API endpoint
 * 4. Validates and parses the API response
 * 5. Verifies the VP token using the MDOC verifier
 * 6. Returns the MDOC verification result
 *
 * @param config - Configuration parameters for the service
 * @returns A configured GetWalletResponse function that returns MdocVerifyResult
 *
 * @throws {GetWalletResponseServiceError} When configuration validation fails
 *
 * @example
 * ```typescript
 * const getWalletResponse = createGetWalletResponseService({
 *   apiBaseUrl: 'https://api.verifier.com',
 *   apiPath: '/v1/transactions',
 *   get: async (baseUrl, path, query, schema) => ({
 *     data: schema.parse(responseData),
 *     metadata: { status: 200, statusText: 'OK', headers: {}, url: '', ok: true }
 *   }),
 *   session: sessionImplementation,
 *   logger: loggerImplementation,
 *   mdocVerifier: mdocVerifierImplementation
 * });
 *
 * // Use the service
 * const result = await getWalletResponse('response_code_123');
 * if (result.valid) {
 *   console.log('MDOC verification successful');
 *   console.log('Documents:', result.documents);
 * } else {
 *   console.log('MDOC verification failed');
 * }
 * ```
 *
 * @public
 */
export const createGetWalletResponseService = ({
  apiBaseUrl,
  apiPath,
  get,
  session,
  logger,
  mdocVerifier,
}: CreateGetWalletResponseServiceConfig): GetWalletResponse => {
  // Validate configuration
  if (!apiBaseUrl || !apiPath || !mdocVerifier) {
    logger.error('GetWalletResponseService', 'Invalid configuration provided', {
      context: {
        hasApiBaseUrl: !!apiBaseUrl,
        hasApiPath: !!apiPath,
        hasMdocVerifier: !!mdocVerifier,
      },
    });

    throw new GetWalletResponseServiceError(
      'INVALID_RESPONSE',
      'Required configuration parameters are missing'
    );
  }

  logger.info('GetWalletResponseService', 'Service created successfully', {
    context: {
      apiBaseUrl: apiBaseUrl.substring(0, 50), // Limit for privacy
      apiPath,
      hasMdocVerifier: !!mdocVerifier,
    },
  });

  return async (responseCode?: string): Promise<GetWalletResponseResult> => {
    const startTime = performance.now();

    logger.info(
      'GetWalletResponseService',
      'Starting wallet response retrieval',
      {
        requestId: crypto.randomUUID(),
        context: {
          hasResponseCode: !!responseCode,
          responseCodeLength: responseCode?.length || 0,
        },
      }
    );

    try {
      // Retrieve presentation ID from session
      const presentationId = await getPresentationIdFromSession(
        session,
        logger
      );

      // Prepare query parameters
      const queryParams: Record<string, string> = responseCode
        ? { response_code: responseCode }
        : {};

      // Construct API path with presentation ID
      const fullApiPath = `${apiPath}/${presentationId}`;

      logger.info(
        'GetWalletResponseService',
        'Sending request to GetWalletResponse API',
        {
          context: {
            apiBaseUrl: apiBaseUrl.substring(0, 50),
            fullApiPath,
            queryParamsCount: Object.keys(queryParams).length,
            presentationId: presentationId.toString(),
          },
        }
      );

      // Send request to API
      let apiResponse;
      try {
        apiResponse = await get(
          apiBaseUrl,
          fullApiPath,
          queryParams,
          GetWalletResponseResponseSchema
        );

        logger.info(
          'GetWalletResponseService',
          'API request completed successfully',
          {
            context: {
              hasResponse: !!apiResponse,
              hasData: !!apiResponse?.data,
              statusCode: apiResponse?.metadata?.status,
            },
          }
        );
      } catch (error) {
        logger.error('GetWalletResponseService', 'API request failed', {
          context: {
            apiBaseUrl: apiBaseUrl.substring(0, 50),
            fullApiPath,
            presentationId: presentationId.toString(),
          },
          error: {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        });

        throw new GetWalletResponseServiceError(
          'API_REQUEST_FAILED',
          'Failed to communicate with GetWalletResponse API',
          error instanceof Error ? error : new Error(String(error))
        );
      }

      // Parse API response
      logger.debug('GetWalletResponseService', 'Parsing API response');

      let walletResponse;
      try {
        walletResponse = GetWalletResponseResponse.fromJSON(apiResponse.data);

        logger.info(
          'GetWalletResponseService',
          'API response parsed successfully',
          {
            context: {
              presentationId: presentationId.toString(),
              hasVpToken: !!walletResponse.vpToken,
              hasIdToken: !!walletResponse.idToken,
              hasPresentationSubmission:
                !!walletResponse.presentationSubmission,
              hasError: !!walletResponse.error,
            },
          }
        );
      } catch (error) {
        logger.error(
          'GetWalletResponseService',
          'Failed to parse API response',
          {
            context: {
              responseData: JSON.stringify(apiResponse.data).substring(0, 200),
              presentationId: presentationId.toString(),
            },
            error: {
              name: error instanceof Error ? error.name : 'Unknown',
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
            },
          }
        );

        throw new GetWalletResponseServiceError(
          'INVALID_RESPONSE',
          'Failed to parse GetWalletResponse API response',
          error instanceof Error ? error : new Error(String(error))
        );
      }

      // Check if VP token is present - required for MDOC verification
      if (!walletResponse.vpToken) {
        // TODO: Handle cases where VP token is not present
        // Currently treating this as an error, but in the future we may need to:
        // 1. Support ID token only flows
        // 2. Handle other credential formats
        // 3. Provide alternative verification methods
        logger.logSecurity(
          'error',
          'GetWalletResponseService',
          'VP token not found in wallet response',
          {
            context: {
              presentationId: presentationId.toString(),
              hasIdToken: !!walletResponse.idToken,
              hasError: !!walletResponse.error,
              errorType: walletResponse.error || null,
            },
          }
        );

        logger.logAudit(
          'GetWalletResponseService',
          'wallet.response.missing_vp_token',
          {
            context: {
              presentationId: presentationId.toString(),
              hasIdToken: !!walletResponse.idToken,
              walletError: walletResponse.error || null,
            },
          }
        );

        throw new GetWalletResponseServiceError(
          'MISSING_VP_TOKEN',
          'VP token is required for MDOC verification but was not found in the wallet response'
        );
      }

      // Verify VP token using MDOC verifier
      logger.info(
        'GetWalletResponseService',
        'VP token found, starting MDOC verification',
        {
          context: {
            presentationId: presentationId.toString(),
            vpTokenLength: walletResponse.vpToken.length,
          },
        }
      );

      let mdocVerifyResult;
      try {
        mdocVerifyResult = await mdocVerifier.verify(walletResponse.vpToken);

        if (mdocVerifyResult.valid) {
          logger.info(
            'GetWalletResponseService',
            'MDOC verification successful',
            {
              context: {
                presentationId: presentationId.toString(),
                documentsCount: mdocVerifyResult.documents.length,
              },
            }
          );

          logger.logAudit(
            'GetWalletResponseService',
            'mdoc.verification.success',
            {
              context: {
                presentationId: presentationId.toString(),
                documentsCount: mdocVerifyResult.documents.length,
                documentTypes: mdocVerifyResult.documents
                  .map((doc) => Object.keys(doc))
                  .flat(),
              },
            }
          );
        } else {
          logger.logSecurity(
            'error',
            'GetWalletResponseService',
            'MDOC verification failed',
            {
              context: {
                presentationId: presentationId.toString(),
                vpTokenLength: walletResponse.vpToken.length,
              },
            }
          );

          logger.logAudit(
            'GetWalletResponseService',
            'mdoc.verification.failed',
            {
              context: {
                presentationId: presentationId.toString(),
                reason: 'Invalid MDOC signature or structure',
              },
            }
          );
        }
      } catch (error) {
        logger.error('GetWalletResponseService', 'MDOC verification error', {
          context: {
            presentationId: presentationId.toString(),
            vpTokenLength: walletResponse.vpToken.length,
          },
          error: {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        });

        logger.logAudit('GetWalletResponseService', 'mdoc.verification.error', {
          context: {
            presentationId: presentationId.toString(),
            errorType: error instanceof Error ? error.name : 'Unknown',
            errorMessage:
              error instanceof Error ? error.message : String(error),
          },
        });

        throw new GetWalletResponseServiceError(
          'INVALID_RESPONSE',
          'MDOC verification failed due to technical error',
          error instanceof Error ? error : new Error(String(error))
        );
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      logger.logPerformance(
        'GetWalletResponseService',
        'Wallet response retrieval and verification completed',
        {
          performance: {
            duration: Math.round(duration),
          },
          context: {
            presentationId: presentationId.toString(),
            success: true,
            verificationResult: mdocVerifyResult.valid,
          },
        }
      );

      // Return the MDOC verification result
      return {
        ...mdocVerifyResult,
        vpToken: walletResponse.vpToken,
      };
    } catch (error) {
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Log performance even for failed requests
      logger.logPerformance(
        'GetWalletResponseService',
        'Wallet response retrieval failed',
        {
          performance: {
            duration: Math.round(duration),
          },
          context: {
            success: false,
            errorType:
              error instanceof GetWalletResponseServiceError
                ? error.errorType
                : 'UNKNOWN',
          },
        }
      );

      // Re-throw GetWalletResponseServiceError as-is
      if (error instanceof GetWalletResponseServiceError) {
        logger.error(
          'GetWalletResponseService',
          'Wallet response retrieval failed with known error',
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
        'GetWalletResponseService',
        'Wallet response retrieval failed with unexpected error',
        {
          error: {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          },
        }
      );

      throw new GetWalletResponseServiceError(
        'API_REQUEST_FAILED',
        'Unexpected error during wallet response retrieval',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };
};
