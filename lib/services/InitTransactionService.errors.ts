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
