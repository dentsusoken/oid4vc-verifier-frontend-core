import { EphemeralECDHPrivateJwk, Nonce, PresentationId } from '../domain';
import { InitTransactionRequestJSON } from '../ports/input';
import type { Logger } from '../ports/out/logging';
import { Session, SessionSchemas } from '../ports/out/session';
import { InitTransactionServiceError } from './InitTransactionService.errors';
import { GenerateRequestParams } from './InitTransactionService.types';

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
 *   generateWalletResponseRedirectUriTemplate: (url, path, template) => url + path + '?session=' + template,
 *   ephemeralECDHPublicJwk: new EphemeralECDHPublicJwk('{"kty":"EC",...}')
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
  ephemeralECDHPublicJwk,
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
    ephemeral_ecdh_public_jwk: ephemeralECDHPublicJwk.toJSON(),
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
 * Validates the user agent from the request
 *
 * @param request - The incoming request
 * @param logger - Logger instance for logging events
 * @returns The user agent string
 * @throws {InitTransactionServiceError} When user agent is missing
 *
 * @internal
 */
export const validateUserAgent = (request: Request, logger: Logger): string => {
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
 * @param ephemeralECDHPrivateJwk - The ephemeral ECDH private JWK to store
 * @param logger - Logger instance for logging events
 * @throws {InitTransactionServiceError} When session operations fail
 *
 * @internal
 */
export const storeTransactionInSession = async (
  session: Session<SessionSchemas>,
  presentationId: PresentationId,
  nonce: Nonce,
  ephemeralECDHPrivateJwk: EphemeralECDHPrivateJwk,
  logger: Logger
): Promise<void> => {
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

    await session.set('presentationId', presentationId);
    await session.set('nonce', nonce);
    await session.set(
      'ephemeralECDHPrivateJwk',
      ephemeralECDHPrivateJwk.toJSON()
    );

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
