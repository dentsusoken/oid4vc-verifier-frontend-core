import { EphemeralECDHPrivateJwk, Nonce, PresentationId } from '../domain';
import { InitTransactionRequestJSON } from '../ports/input';
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
 * @returns The user agent string
 * @throws {InitTransactionServiceError} When user agent is missing
 *
 * @internal
 */
export const validateUserAgent = (request: Request): string => {
  const userAgent = request.headers.get('user-agent');

  if (!userAgent) {
    throw new InitTransactionServiceError(
      'MISSING_USER_AGENT',
      'User agent header is required to determine device type'
    );
  }

  return userAgent;
};

/**
 * Stores transaction data in session
 *
 * @param session - The session interface
 * @param presentationId - The presentation ID to store
 * @param nonce - The nonce to store
 * @param ephemeralECDHPrivateJwk - The ephemeral ECDH private JWK to store
 * @throws {InitTransactionServiceError} When session operations fail
 *
 * @internal
 */
export const storeTransactionInSession = async (
  session: Session<SessionSchemas>,
  presentationId: PresentationId,
  nonce: Nonce,
  ephemeralECDHPrivateJwk: EphemeralECDHPrivateJwk
): Promise<void> => {
  try {
    await session.set('presentationId', presentationId);
    await session.set('nonce', nonce);
    await session.set(
      'ephemeralECDHPrivateJwk',
      ephemeralECDHPrivateJwk.toJSON()
    );
  } catch (error) {
    throw new InitTransactionServiceError(
      'SESSION_ERROR',
      'Failed to store transaction data in session',
      error instanceof Error ? error : new Error(String(error))
    );
  }
};
