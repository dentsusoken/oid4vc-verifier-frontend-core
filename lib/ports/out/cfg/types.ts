/**
 * URL generation error types
 *
 * @public
 */
export type UrlGenerationError =
  | 'INVALID_BASE_URL'
  | 'INVALID_PATH'
  | 'MISSING_PLACEHOLDER'
  | 'INVALID_QUERY_PARAMS'
  | 'MALFORMED_URL';

/**
 * Custom error class for URL generation
 *
 * @public
 */
export class UrlGenerationException extends Error {
  constructor(
    public readonly errorType: UrlGenerationError,
    public readonly details: string,
    public readonly originalUrl?: string
  ) {
    super(`URL Generation Error (${errorType}): ${details}`);
    this.name = 'UrlGenerationException';
  }
}
