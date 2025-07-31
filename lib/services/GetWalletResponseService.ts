import { EphemeralECDHPrivateJwk } from '../domain';
import {
  GetWalletResponse,
  GetWalletResponseResponse,
  GetWalletResponseResponseSchema,
  GetWalletResponseResult,
} from '../ports/input';
import { GetWalletResponseServiceError } from './GetWalletResponseService.errors';
import { getPresentationIdFromSession } from './GetWalletResponseService.helpers';
import { CreateGetWalletResponseServiceConfig } from './GetWalletResponseService.types';

/**
 * Creates a GetWalletResponse service function
 *
 * This factory function creates a configured GetWalletResponse service that handles
 * the complete flow of retrieving wallet response data from the OID4VC verification API,
 * verifying JARM JWT, and verifying MDOC credentials. The service manages session validation,
 * API communication, JARM verification, MDOC verification, and returns the verification result.
 *
 * The created service function:
 * 1. Retrieves the presentation ID and ephemeral ECDH private JWK from the session
 * 2. Constructs the API request with optional response code
 * 3. Sends a GET request to the API endpoint
 * 4. Validates and parses the API response
 * 5. Verifies the JARM JWT using the ephemeral ECDH private JWK
 * 6. Verifies the VP token using the MDOC verifier
 * 7. Returns the MDOC verification result with VP token
 *
 * @param config - Configuration parameters for the service
 * @returns A configured GetWalletResponse function that returns GetWalletResponseResult
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
 *   mdocVerifier: mdocVerifierImplementation,
 *   verifyJarmJwt: jarmVerifierImplementation,
 *   jarmOption: jarmOptionInstance
 * });
 *
 * // Use the service
 * const result = await getWalletResponse('response_code_123');
 * if (result.valid) {
 *   console.log('MDOC verification successful');
 *   console.log('Documents:', result.documents);
 *   console.log('VP Token:', result.vpToken);
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
  mdocVerifier,
  verifyJarmJwt,
  jarmOption,
}: CreateGetWalletResponseServiceConfig): GetWalletResponse => {
  // Validate configuration
  if (
    !apiBaseUrl ||
    !apiPath ||
    !mdocVerifier ||
    !verifyJarmJwt ||
    !jarmOption
  ) {
    throw new GetWalletResponseServiceError(
      'INVALID_RESPONSE',
      'Required configuration parameters are missing'
    );
  }

  return async (request: Request): Promise<GetWalletResponseResult> => {
    try {
      // Retrieve presentation ID from session
      const presentationId = await getPresentationIdFromSession(session);
      const requestUrl = new URL(request.url);
      const responseCode = requestUrl.searchParams.get('response_code');
      // Prepare query parameters
      const queryParams: Record<string, string> = responseCode
        ? { response_code: responseCode }
        : {};

      // Construct API path with presentation ID
      const fullApiPath = `${apiPath}/${presentationId}`;

      // Send request to API
      let apiResponse;
      try {
        apiResponse = await get(
          apiBaseUrl,
          fullApiPath,
          queryParams,
          GetWalletResponseResponseSchema
        );
      } catch (error) {
        throw new GetWalletResponseServiceError(
          'API_REQUEST_FAILED',
          'Failed to communicate with GetWalletResponse API',
          error instanceof Error ? error : new Error(String(error))
        );
      }

      let walletResponse;
      try {
        console.log('apiResponse.data :>> ', apiResponse.data);
        walletResponse = GetWalletResponseResponse.fromJSON(apiResponse.data);
      } catch (error) {
        throw new GetWalletResponseServiceError(
          'INVALID_RESPONSE',
          'Failed to parse GetWalletResponse API response',
          error instanceof Error ? error : new Error(String(error))
        );
      }

      const ephemeralECDHPrivateJwk = await session.get(
        'ephemeralECDHPrivateJwk'
      );

      if (!ephemeralECDHPrivateJwk) {
        throw new GetWalletResponseServiceError(
          'MISSING_EPHEMERAL_ECDH_PRIVATE_JWK',
          'Ephemeral ECDH private JWK not found in session'
        );
      }

      const jarmJwt = await verifyJarmJwt(
        jarmOption,
        new EphemeralECDHPrivateJwk(ephemeralECDHPrivateJwk),
        walletResponse.response
      );

      if (jarmJwt.isFailure()) {
        throw new GetWalletResponseServiceError(
          'JARM_VERIFICATION_FAILED',
          'JARM verification failed'
        );
      }

      const authorizationResponse = jarmJwt.value;

      // Check if VP token is present - required for MDOC verification
      if (!authorizationResponse?.vpToken) {
        // TODO: Handle cases where VP token is not present
        // Currently treating this as an error, but in the future we may need to:
        // 1. Support ID token only flows
        // 2. Handle other credential formats
        // 3. Provide alternative verification methods

        throw new GetWalletResponseServiceError(
          'MISSING_VP_TOKEN',
          'VP token is required for MDOC verification but was not found in the wallet response'
        );
      }

      let mdocVerifyResult;
      try {
        mdocVerifyResult = await mdocVerifier.verify(
          authorizationResponse?.vpToken
        );
      } catch (error) {
        throw new GetWalletResponseServiceError(
          'INVALID_RESPONSE',
          'MDOC verification failed due to technical error',
          error instanceof Error ? error : new Error(String(error))
        );
      }

      // Return the MDOC verification result
      return {
        ...mdocVerifyResult,
        vpToken: authorizationResponse?.vpToken,
      };
    } catch (error) {
      // Re-throw GetWalletResponseServiceError as-is
      if (error instanceof GetWalletResponseServiceError) {
        throw error;
      }

      // Wrap other errors
      throw new GetWalletResponseServiceError(
        'API_REQUEST_FAILED',
        'Unexpected error during wallet response retrieval',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  };
};
