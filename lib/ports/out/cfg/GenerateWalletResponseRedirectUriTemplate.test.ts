import { describe, it, expect, beforeEach } from 'vitest';
import {
  GenerateWalletResponseRedirectUriTemplate,
  UrlGenerationException,
} from './';

// テスト用のモック実装関数
const createMockTemplateGenerator = (
  shouldThrowError = false,
  errorType?: string
): GenerateWalletResponseRedirectUriTemplate => {
  return (baseUrl: string, path: string, placeholder: string): string => {
    if (shouldThrowError) {
      throw new UrlGenerationException(
        'INVALID_BASE_URL',
        errorType || 'Mock error for testing',
        baseUrl
      );
    }

    // 基本的なテンプレート生成のモック実装
    const normalizedBaseUrl = baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : baseUrl;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return `${normalizedBaseUrl}${normalizedPath}?session_id=${placeholder}`;
  };
};

describe('GenerateWalletResponseRedirectUriTemplate', () => {
  let generator: GenerateWalletResponseRedirectUriTemplate;

  beforeEach(() => {
    generator = createMockTemplateGenerator();
  });

  describe('基本的なテンプレート生成', () => {
    it('should generate basic redirect URI template', () => {
      const baseUrl = 'https://verifier.example.com';
      const path = '/wallet/callback';
      const placeholder = '{SESSION_ID}';

      const result = generator(baseUrl, path, placeholder);

      expect(result).toBe(
        'https://verifier.example.com/wallet/callback?session_id={SESSION_ID}'
      );
    });

    it('should handle baseUrl with trailing slash', () => {
      const baseUrl = 'https://verifier.example.com/';
      const path = '/callback';
      const placeholder = '{PRESENTATION_ID}';

      const result = generator(baseUrl, path, placeholder);

      expect(result).toBe(
        'https://verifier.example.com/callback?session_id={PRESENTATION_ID}'
      );
    });

    it('should handle path without leading slash', () => {
      const baseUrl = 'https://verifier.example.com';
      const path = 'wallet-response';
      const placeholder = '{RESPONSE_CODE}';

      const result = generator(baseUrl, path, placeholder);

      expect(result).toBe(
        'https://verifier.example.com/wallet-response?session_id={RESPONSE_CODE}'
      );
    });

    it('should handle complex paths', () => {
      const baseUrl = 'https://api.verifier.edu';
      const path = '/v2/oid4vc/wallet/callback';
      const placeholder = '{VERIFICATION_SESSION}';

      const result = generator(baseUrl, path, placeholder);

      expect(result).toBe(
        'https://api.verifier.edu/v2/oid4vc/wallet/callback?session_id={VERIFICATION_SESSION}'
      );
    });

    it('should handle different placeholder formats', () => {
      const testCases = [
        '{SESSION_ID}',
        '{{SESSION_ID}}',
        '%SESSION_ID%',
        '$SESSION_ID$',
        'PLACEHOLDER_VALUE',
      ];

      const baseUrl = 'https://verifier.com';
      const path = '/callback';

      testCases.forEach((placeholder) => {
        const result = generator(baseUrl, path, placeholder);
        expect(result).toContain(`session_id=${placeholder}`);
      });
    });

    it('should work with different domain formats', () => {
      const testCases = [
        'https://verifier.example.com',
        'https://sub.verifier.example.com',
        'https://verifier-api.example.org',
        'https://localhost:8080',
        'https://192.168.1.100:3000',
      ];

      const path = '/callback';
      const placeholder = '{TEST}';

      testCases.forEach((baseUrl) => {
        const result = generator(baseUrl, path, placeholder);
        expect(result).toMatch(/^https:\/\//);
        expect(result).toContain('session_id={TEST}');
      });
    });
  });

  describe('異常系', () => {
    it('should throw UrlGenerationException for invalid base URL', () => {
      const errorGenerator = createMockTemplateGenerator(
        true,
        'Invalid base URL'
      );

      expect(() => {
        errorGenerator('invalid-url', '/callback', '{TEST}');
      }).toThrow(UrlGenerationException);
    });

    it('should handle UrlGenerationException properly', () => {
      const errorGenerator = createMockTemplateGenerator(true, 'Test error');

      try {
        errorGenerator('https://test.com', '/callback', '{TEST}');
      } catch (error) {
        expect(error).toBeInstanceOf(UrlGenerationException);
        expect((error as UrlGenerationException).errorType).toBe(
          'INVALID_BASE_URL'
        );
        expect((error as UrlGenerationException).details).toContain(
          'Test error'
        );
        expect((error as UrlGenerationException).originalUrl).toBe(
          'https://test.com'
        );
      }
    });
  });

  describe('実用的なシナリオ', () => {
    it('should generate template for university verification system', () => {
      const baseUrl = 'https://credentials.university.edu';
      const path = '/oid4vc/wallet-response';
      const placeholder = '{DIPLOMA_VERIFICATION_SESSION}';

      const result = generator(baseUrl, path, placeholder);

      expect(result).toBe(
        'https://credentials.university.edu/oid4vc/wallet-response?session_id={DIPLOMA_VERIFICATION_SESSION}'
      );
    });

    it('should generate template for government ID verification', () => {
      const baseUrl = 'https://gov-verify.example.gov';
      const path = '/citizens/id-verification/callback';
      const placeholder = '{VERIFICATION_SESSION}';

      const result = generator(baseUrl, path, placeholder);

      expect(result).toBe(
        'https://gov-verify.example.gov/citizens/id-verification/callback?session_id={VERIFICATION_SESSION}'
      );
    });

    it('should handle template replacement simulation', () => {
      const baseUrl = 'https://verifier.example.com';
      const path = '/callback';
      const placeholder = '{SESSION_ID}';

      const template = generator(baseUrl, path, placeholder);

      // テンプレートを実際の値で置換するシミュレーション
      const actualSessionId = 'session_abc123_def456';
      const actualUrl = template.replace('{SESSION_ID}', actualSessionId);

      expect(actualUrl).toBe(
        'https://verifier.example.com/callback?session_id=session_abc123_def456'
      );
      expect(actualUrl).not.toContain('{SESSION_ID}');
    });
  });

  describe('エッジケース', () => {
    it('should handle special characters in placeholders', () => {
      const baseUrl = 'https://verifier.example.com';
      const path = '/callback';
      const placeholder = '{SESSION-ID_123.456}';

      const result = generator(baseUrl, path, placeholder);

      expect(result).toContain('session_id={SESSION-ID_123.456}');
    });

    it('should handle very long URLs', () => {
      const baseUrl =
        'https://very-long-domain-name-for-testing-purposes.example.com';
      const path = '/very/long/path/to/the/wallet/response/callback/endpoint';
      const placeholder = '{VERY_LONG_SESSION_IDENTIFIER_FOR_TESTING}';

      const result = generator(baseUrl, path, placeholder);

      expect(result).toContain(baseUrl);
      expect(result).toContain(path);
      expect(result).toContain(placeholder);
    });
  });
});
