/**
 * Wallet response redirect URI template generator interface
 *
 * Generates URI templates for wallet response redirects by combining a base URL,
 * path, and placeholder. This interface is used to create templates that can be
 * later populated with actual values for redirecting wallet responses back to
 * the verifier application.
 *
 * The generated template typically includes placeholders that will be replaced
 * with actual values during the OID4VC verification flow.
 *
 * @example
 * ```typescript
 * const generateTemplate: GenerateWalletResponseRedirectUriTemplate = (baseUrl, path, placeholder) => {
 *   return `${baseUrl}${path}?session_id=${placeholder}`;
 * };
 *
 * // Usage
 * const template = generateTemplate(
 *   'https://verifier.example.com',
 *   '/wallet/callback',
 *   '{SESSION_ID}'
 * );
 * // Result: "https://verifier.example.com/wallet/callback?session_id={SESSION_ID}"
 *
 * // Later, replace placeholder with actual value
 * const actualUri = template.replace('{SESSION_ID}', 'session_abc123');
 * ```
 *
 * @public
 */
export interface GenerateWalletResponseRedirectUriTemplate {
  /**
   * Generates a wallet response redirect URI template
   *
   * @param baseUrl - The base URL of the verifier application
   * @param path - The path component for the callback endpoint
   * @param placeholder - The placeholder string to be replaced later with actual values
   * @returns The complete URI template string
   *
   * @throws {UrlGenerationException} When template generation fails due to invalid parameters
   *
   * @example
   * ```typescript
   * try {
   *   const template = generateTemplate(
   *     'https://verifier.example.com',
   *     '/callback/wallet-response',
   *     '{PRESENTATION_ID}'
   *   );
   *
   *   // Use template later
   *   const actualUrl = template.replace('{PRESENTATION_ID}', 'pres_123456');
   *   console.log('Callback URL:', actualUrl);
   * } catch (error) {
   *   if (error instanceof UrlGenerationException) {
   *     console.error('Template generation failed:', error.details);
   *   }
   * }
   * ```
   */
  (baseUrl: string, path: string, placeholder: string): string;
}
