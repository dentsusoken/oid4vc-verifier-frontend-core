import { UAParser } from 'ua-parser-js';
import { IsMobile } from '../../../ports/out/http/isMobile';

/**
 * Default mobile device detection implementation using UAParser
 *
 * Provides a production-ready implementation of the IsMobile interface using
 * the ua-parser-js library for reliable User-Agent string parsing and device
 * type detection.
 *
 * This implementation specifically checks for mobile device types including:
 * - Smartphones
 * - Mobile phones
 * - Mobile devices with touch interfaces
 *
 * The detection is based on comprehensive User-Agent parsing that recognizes
 * patterns from major mobile device manufacturers and operating systems.
 *
 * @example
 * ```typescript
 * // Mobile device detection
 * const isMobileDevice = defaultIsMobile('Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)');
 * console.log(isMobileDevice); // true
 *
 * // Desktop browser detection
 * const isDesktop = defaultIsMobile('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
 * console.log(isDesktop); // false
 *
 * // Tablet detection (considered non-mobile by this implementation)
 * const isTablet = defaultIsMobile('Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)');
 * console.log(isTablet); // false (tablets are not classified as mobile)
 * ```
 *
 * @public
 */
export const defaultIsMobile: IsMobile = (userAgent) => {
  const ua = UAParser(userAgent);
  return ua.device.type === 'mobile';
};
