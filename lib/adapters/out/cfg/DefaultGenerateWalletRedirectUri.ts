import { GenerateWalletRedirectUri } from '../../../ports/out/cfg/GenerateWalletRedirectUri';

/**
 * Default wallet redirect URI generation implementation
 *
 * Provides a standard implementation of the GenerateWalletRedirectUri interface
 * that constructs redirect URIs by combining a base redirect URI with query
 * parameters. This implementation uses the native URL and URLSearchParams APIs
 * for robust and standards-compliant URL construction.
 *
 * This implementation:
 * - Preserves the original redirect URI structure (protocol, host, port, pathname)
 * - Safely handles URL encoding of query parameters
 * - Overwrites any existing query parameters with the provided ones
 * - Maintains URL validity and proper encoding standards
 * - Supports complex parameter values including special characters
 *
 * The generated redirect URI is typically used for:
 * - Wallet authentication flows in OID4VC
 * - OAuth 2.0 authorization code flows
 * - Deep linking to mobile wallet applications
 * - Redirecting users back to the verification application
 *
 * @param redirectUri - The base redirect URI to extend with query parameters
 * @param query - Record of query parameters to append to the redirect URI
 * @returns A complete redirect URI with encoded query parameters
 *
 * @example
 * ```typescript
 * // Basic wallet redirect URI generation
 * const redirectUri = defaultGenerateWalletRedirectUri(
 *   'https://verifier.example.com/callback',
 *   {
 *     state: 'abc123',
 *     nonce: 'xyz789',
 *     response_type: 'code'
 *   }
 * );
 * console.log(redirectUri);
 * // "https://verifier.example.com/callback?state=abc123&nonce=xyz789&response_type=code"
 *
 * // Handling special characters in parameters
 * const complexRedirectUri = defaultGenerateWalletRedirectUri(
 *   'https://app.example.com/auth',
 *   {
 *     redirect_uri: 'https://wallet.example.com/callback?param=value',
 *     scope: 'openid profile email'
 *   }
 * );
 * // Properly URL-encoded output with special characters handled
 *
 * // Mobile wallet deep linking
 * const walletUri = defaultGenerateWalletRedirectUri(
 *   'walletapp://auth',
 *   {
 *     request: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
 *     client_id: 'verifier123'
 *   }
 * );
 * ```
 *
 * @public
 */
export const defaultGenerateWalletRedirectUri: GenerateWalletRedirectUri = (
  redirectUri,
  query
) => {
  const url = new URL(redirectUri);
  const queryString = new URLSearchParams(query).toString();
  url.search = queryString;
  return url.toString();
};
