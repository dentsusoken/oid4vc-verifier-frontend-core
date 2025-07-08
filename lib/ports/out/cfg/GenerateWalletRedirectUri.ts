import { WalletRedirectParams } from '../../input';

/**
 * Query parameters for wallet redirect URI
 *
 * Represents the parameters that will be appended to the wallet redirect URI
 * as query string parameters. These parameters are derived from the wallet
 * redirect params obtained during transaction initialization.
 *
 * @public
 */
export type WalletRedirectUriQuery = WalletRedirectParams;

/**
 * Wallet redirect URI generator interface
 *
 * Generates a properly formatted wallet redirect URI by combining a base wallet URL
 * with query parameters. This interface is used in the OID4VC verification flow
 * to redirect users to their wallet applications with the necessary parameters
 * for credential presentation.
 *
 * @example
 * ```typescript
 * const generateWalletRedirectUri: GenerateWalletRedirectUri = (walletUrl, query) => {
 *   // Implementation would combine walletUrl with query parameters
 *   return `${walletUrl}?client_id=${query.client_id}&request=${query.request}`;
 * };
 *
 * // Usage
 * const redirectUri = generateWalletRedirectUri(
 *   'https://wallet.example.com/openid_vc',
 *   {
 *     client_id: 'verifier123',
 *     request: 'eyJhbGciOiJSUzI1NiJ9...',
 *     request_uri: 'https://verifier.example.com/request/abc123'
 *   }
 * );
 * ```
 *
 * @public
 */
export interface GenerateWalletRedirectUri {
  /**
   * Generates a wallet redirect URI with the provided parameters
   *
   * @param walletUrl - The base URL of the wallet application
   * @param query - Query parameters to append to the wallet URL
   * @returns The complete wallet redirect URI
   *
   * @throws {UrlGenerationException} When URL generation fails due to invalid parameters
   *
   * @example
   * ```typescript
   * try {
   *   const uri = generateWalletRedirectUri(
   *     'https://wallet.example.com/credential',
   *     {
   *       client_id: 'verifier_123',
   *       request: 'jwt_token_here',
   *       request_uri: 'https://verifier.com/request/456'
   *     }
   *   );
   *   console.log('Redirect URI:', uri);
   * } catch (error) {
   *   if (error instanceof UrlGenerationException) {
   *     console.error('URL generation failed:', error.details);
   *   }
   * }
   * ```
   */
  (walletUrl: string, query: WalletRedirectUriQuery): string;
}
