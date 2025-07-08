/**
 * Interface for mobile device detection functionality
 *
 * Defines the contract for analyzing User-Agent strings to determine
 * whether HTTP requests originate from mobile devices. This detection
 * is crucial for the OID4VC verification system to provide appropriate
 * user experiences and redirect behaviors for different device types.
 *
 * Mobile detection affects several aspects of the verification flow:
 * - **Redirect URI handling**: Mobile devices may require different callback mechanisms
 * - **Wallet integration**: Mobile wallets often use custom URL schemes or deep links
 * - **User interface**: Different layouts and interactions for mobile vs desktop
 * - **Security considerations**: Mobile-specific security features and limitations
 *
 * ## Detection Criteria
 *
 * Implementations typically identify mobile devices by checking for:
 * - **Mobile operating systems**: iOS, Android, Windows Phone
 * - **Mobile browsers**: Mobile Safari, Chrome Mobile, Firefox Mobile
 * - **Device form factors**: Smartphones, feature phones
 * - **Touch interfaces**: Devices with touch-primary input methods
 *
 * ## Implementation Considerations
 *
 * - **Accuracy vs Performance**: Balance detection accuracy with parsing speed
 * - **Library Support**: Consider using established libraries like UAParser.js
 * - **False Positives**: Handle edge cases like tablets, hybrid devices
 * - **User-Agent Spoofing**: Be aware that User-Agent strings can be modified
 * - **Maintenance**: Keep detection logic updated as new devices emerge
 *
 * @example
 * ```typescript
 * // Implementation using UAParser library
 * const isMobile: IsMobile = (userAgent: string): boolean => {
 *   const parser = new UAParser(userAgent);
 *   const deviceType = parser.getDevice().type;
 *   return deviceType === 'mobile';
 * };
 *
 * // Usage in request handling
 * const userAgent = request.headers.get('User-Agent') || '';
 * const mobile = isMobile(userAgent);
 *
 * if (mobile) {
 *   // Provide mobile-optimized wallet redirect
 *   return generateMobileWalletRedirect(walletUrl, params);
 * } else {
 *   // Provide desktop wallet redirect
 *   return generateDesktopWalletRedirect(walletUrl, params);
 * }
 * ```
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent} - User-Agent Header
 * @see {@link https://github.com/faisalman/ua-parser-js} - UAParser.js Library
 *
 * @public
 */
export interface IsMobile {
  /**
   * Determines if a User-Agent string indicates a mobile device
   *
   * Analyzes the provided User-Agent string to detect whether the request
   * originated from a mobile device such as a smartphone or feature phone.
   * The detection logic should be optimized for accuracy while maintaining
   * good performance for high-traffic scenarios.
   *
   * @param userAgent - The User-Agent string from an HTTP request header
   * @returns `true` if the User-Agent indicates a mobile device, `false` otherwise
   *
   * @example
   * ```typescript
   * // Mobile device examples
   * isMobile('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'); // true
   * isMobile('Mozilla/5.0 (Linux; Android 11; SM-G991B)'); // true
   *
   * // Desktop device examples
   * isMobile('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'); // false
   * isMobile('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'); // false
   *
   * // Edge cases
   * isMobile(''); // false (empty/unknown)
   * isMobile('Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X)'); // false (tablet)
   * ```
   *
   * @remarks
   * - Tablets are typically not considered mobile devices for UX purposes
   * - Empty or malformed User-Agent strings should return `false`
   * - Detection accuracy depends on the implementation's device database
   * - Consider caching results for identical User-Agent strings
   */
  (userAgent: string): boolean;
}
