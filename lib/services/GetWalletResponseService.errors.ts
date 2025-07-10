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
      | 'SESSION_ERROR'
      | 'MISSING_EPHEMERAL_ECDH_PRIVATE_JWK',
    public readonly details: string,
    public readonly originalError?: Error
  ) {
    super(`GetWalletResponse Service Error (${errorType}): ${details}`);
    this.name = 'GetWalletResponseServiceError';
  }
}
