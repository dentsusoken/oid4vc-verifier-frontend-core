import { GenerateWalletResponseRedirectUriTemplate } from '../../../ports/out/cfg/GenerateWalletResponseRedirectUriTemplate';

/**
 * Default wallet response redirect URI template generation implementation
 *
 * Provides a standard implementation of the GenerateWalletResponseRedirectUriTemplate
 * interface that constructs redirect URI templates for wallet response handling.
 * This implementation creates a URI template with a placeholder for the response code
 * that can be later substituted with actual values during the authentication flow.
 *
 * This implementation:
 * - Combines base URL with a specified path
 * - Adds a response_code query parameter with a placeholder value
 * - Uses native URL API for robust URL construction
 * - Maintains proper URL encoding and structure
 * - Creates templates suitable for OAuth 2.0 and OpenID Connect flows
 *
 * The generated URI template is typically used for:
 * - Configuring wallet applications with callback URLs
 * - Setting up authorization code flow endpoints
 * - Creating dynamic redirect URIs for different verification sessions
 * - Enabling secure communication between verifier and wallet applications
 *
 * @param baseUrl - The base URL for the redirect URI (protocol, host, port)
 * @param path - The path component to append to the base URL
 * @param placeholder - The placeholder value for the response_code parameter
 * @returns A complete URI template with the response_code placeholder
 *
 * @example
 * ```typescript
 * // Basic URI template generation
 * const template = defaultGenerateWalletResponseRedirectUriTemplate(
 *   'https://verifier.example.com',
 *   '/wallet/callback',
 *   '{RESPONSE_CODE}'
 * );
 * console.log(template);
 * // "https://verifier.example.com/wallet/callback?response_code={RESPONSE_CODE}"
 *
 * // Production environment template
 * const prodTemplate = defaultGenerateWalletResponseRedirectUriTemplate(
 *   'https://api.verifier.com',
 *   '/auth/oid4vc/response',
 *   '{{code}}'
 * );
 * console.log(prodTemplate);
 * // "https://api.verifier.com/auth/oid4vc/response?response_code={{code}}"
 *
 * // Development environment with port
 * const devTemplate = defaultGenerateWalletResponseRedirectUriTemplate(
 *   'http://localhost:3000',
 *   '/api/auth/callback',
 *   '%RESPONSE_CODE%'
 * );
 * console.log(devTemplate);
 * // "http://localhost:3000/api/auth/callback?response_code=%RESPONSE_CODE%"
 *
 * // Usage in wallet configuration
 * const walletConfig = {
 *   redirectUri: template,
 *   // When actual response is received, replace placeholder:
 *   // template.replace('{RESPONSE_CODE}', actualResponseCode)
 * };
 * ```
 *
 * @public
 */
export const defaultGenerateWalletResponseRedirectUriTemplate: GenerateWalletResponseRedirectUriTemplate =
  (baseUrl, path, placeholder) => {
    const url = new URL(baseUrl);
    url.pathname = path;
    url.searchParams.set('response_code', placeholder);
    return url.toString();
  };
