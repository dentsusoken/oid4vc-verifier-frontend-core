import { UAParser } from 'ua-parser-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultIsMobile } from '../DefaultIsMobile';

// Mock UAParser
vi.mock('ua-parser-js');

describe('DefaultIsMobile', () => {
  describe('mobile device detection', () => {
    it('should return true for mobile devices', () => {
      const mockUAParser = vi.mocked(UAParser);
      mockUAParser.mockReturnValue({
        device: { type: 'mobile' },
      } as any);

      const userAgent =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15';
      const result = defaultIsMobile(userAgent);

      expect(result).toBe(true);
      expect(mockUAParser).toHaveBeenCalledWith(userAgent);
    });

    it('should return false for desktop devices', () => {
      const mockUAParser = vi.mocked(UAParser);
      mockUAParser.mockReturnValue({
        device: { type: undefined },
      } as any);

      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
      const result = defaultIsMobile(userAgent);

      expect(result).toBe(false);
      expect(mockUAParser).toHaveBeenCalledWith(userAgent);
    });

    it('should return false for tablet devices', () => {
      const mockUAParser = vi.mocked(UAParser);
      mockUAParser.mockReturnValue({
        device: { type: 'tablet' },
      } as any);

      const userAgent =
        'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X) AppleWebKit/605.1.15';
      const result = defaultIsMobile(userAgent);

      expect(result).toBe(false);
      expect(mockUAParser).toHaveBeenCalledWith(userAgent);
    });
  });

  describe('real user agent strings', () => {
    beforeEach(async () => {
      // Reset mock to use real UAParser for these tests
      vi.doUnmock('ua-parser-js');
      const { UAParser: RealUAParser } = await import('ua-parser-js');
      vi.mocked(UAParser).mockImplementation(RealUAParser);
    });

    it('should correctly identify iPhone user agents', () => {
      const iPhoneUA =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1';
      const result = defaultIsMobile(iPhoneUA);
      expect(result).toBe(true);
    });

    it('should correctly identify Android phone user agents', () => {
      const androidUA =
        'Mozilla/5.0 (Linux; Android 11; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36';
      const result = defaultIsMobile(androidUA);
      expect(result).toBe(true);
    });

    it('should correctly identify desktop Chrome user agents', () => {
      const desktopUA =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      const result = defaultIsMobile(desktopUA);
      expect(result).toBe(false);
    });

    it('should correctly identify desktop Firefox user agents', () => {
      const firefoxUA =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0';
      const result = defaultIsMobile(firefoxUA);
      expect(result).toBe(false);
    });

    it('should correctly identify iPad user agents as non-mobile', () => {
      const iPadUA =
        'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1';
      const result = defaultIsMobile(iPadUA);
      expect(result).toBe(false);
    });

    it('should correctly identify Android tablet user agents as non-mobile', () => {
      const androidTabletUA =
        'Mozilla/5.0 (Linux; Android 11; SM-T870) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Safari/537.36';
      const result = defaultIsMobile(androidTabletUA);
      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    beforeEach(() => {
      const mockUAParser = vi.mocked(UAParser);
      mockUAParser.mockClear();
    });

    it('should handle empty user agent strings', () => {
      const mockUAParser = vi.mocked(UAParser);
      mockUAParser.mockReturnValue({
        device: { type: undefined },
      } as any);

      const result = defaultIsMobile('');

      expect(result).toBe(false);
      expect(mockUAParser).toHaveBeenCalledWith('');
    });

    it('should handle malformed user agent strings', () => {
      const mockUAParser = vi.mocked(UAParser);
      mockUAParser.mockReturnValue({
        device: { type: undefined },
      } as any);

      const result = defaultIsMobile('invalid-user-agent');

      expect(result).toBe(false);
      expect(mockUAParser).toHaveBeenCalledWith('invalid-user-agent');
    });

    it('should handle user agent with missing device type', () => {
      const mockUAParser = vi.mocked(UAParser);
      mockUAParser.mockReturnValue({
        device: {},
      } as any);

      const result = defaultIsMobile('Mozilla/5.0 (Unknown Device)');

      expect(result).toBe(false);
    });

    it('should handle UAParser throwing an error', () => {
      const mockUAParser = vi.mocked(UAParser);
      mockUAParser.mockImplementation(() => {
        throw new Error('UAParser error');
      });

      expect(() => {
        defaultIsMobile('test-user-agent');
      }).toThrow('UAParser error');
    });
  });

  describe('performance and reliability', () => {
    beforeEach(() => {
      const mockUAParser = vi.mocked(UAParser);
      mockUAParser.mockClear();
    });

    it('should handle multiple calls efficiently', () => {
      const mockUAParser = vi.mocked(UAParser);
      mockUAParser.mockReturnValue({
        device: { type: 'mobile' },
      } as any);

      const userAgent = 'test-user-agent';

      // Call multiple times
      for (let i = 0; i < 5; i++) {
        defaultIsMobile(userAgent);
      }

      expect(mockUAParser).toHaveBeenCalledTimes(5);
    });

    it('should handle very long user agent strings', () => {
      const mockUAParser = vi.mocked(UAParser);
      mockUAParser.mockReturnValue({
        device: { type: 'mobile' },
      } as any);

      const longUserAgent = 'a'.repeat(2000); // Very long string
      const result = defaultIsMobile(longUserAgent);

      expect(result).toBe(true);
      expect(mockUAParser).toHaveBeenCalledWith(longUserAgent);
    });
  });

  describe('integration with IsMobile interface', () => {
    it('should conform to IsMobile interface', () => {
      const mockUAParser = vi.mocked(UAParser);
      mockUAParser.mockReturnValue({
        device: { type: 'mobile' },
      } as any);

      // Function should accept string and return boolean
      const userAgent: string = 'test-user-agent';
      const result: boolean = defaultIsMobile(userAgent);

      expect(typeof result).toBe('boolean');
    });

    it('should be usable as IsMobile type', () => {
      // Type checking test - ensures defaultIsMobile can be assigned to IsMobile
      const isMobileFunction: typeof defaultIsMobile = defaultIsMobile;
      expect(typeof isMobileFunction).toBe('function');
    });
  });
});
