import { describe, expect, it } from 'vitest';
import { defaultGenerateWalletResponseRedirectUriTemplate } from '../DefaultGenerateWalletResponseRedirectUriTemplate';

describe('DefaultGenerateWalletResponseRedirectUriTemplate', () => {
  describe('basic functionality', () => {
    it('should generate URI template with response_code parameter', () => {
      const baseUrl = 'https://verifier.example.com';
      const path = '/wallet/callback';
      const placeholder = '{RESPONSE_CODE}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe(
        'https://verifier.example.com/wallet/callback?response_code={RESPONSE_CODE}'
      );
    });

    it('should handle different placeholder formats', () => {
      const baseUrl = 'https://api.example.com';
      const path = '/auth/response';

      const testCases = [
        {
          placeholder: '{CODE}',
          expected:
            'https://api.example.com/auth/response?response_code={CODE}',
        },
        {
          placeholder: '{{code}}',
          expected:
            'https://api.example.com/auth/response?response_code={{code}}',
        },
        {
          placeholder: '%RESPONSE_CODE%',
          expected:
            'https://api.example.com/auth/response?response_code=%RESPONSE_CODE%',
        },
        {
          placeholder: '$CODE$',
          expected:
            'https://api.example.com/auth/response?response_code=$CODE$',
        },
        {
          placeholder: 'PLACEHOLDER',
          expected:
            'https://api.example.com/auth/response?response_code=PLACEHOLDER',
        },
      ];

      for (const testCase of testCases) {
        const result = defaultGenerateWalletResponseRedirectUriTemplate(
          baseUrl,
          path,
          testCase.placeholder
        );
        expect(result).toBe(testCase.expected);
      }
    });

    it('should handle empty placeholder', () => {
      const baseUrl = 'https://example.com';
      const path = '/callback';
      const placeholder = '';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe('https://example.com/callback?response_code=');
    });
  });

  describe('URL construction', () => {
    it('should properly combine base URL and path', () => {
      const testCases = [
        {
          baseUrl: 'https://example.com',
          path: '/callback',
          expected: 'https://example.com/callback',
        },
        {
          baseUrl: 'https://example.com/',
          path: '/callback',
          expected: 'https://example.com/callback',
        },
        {
          baseUrl: 'https://example.com',
          path: 'callback',
          expected: 'https://example.com/callback',
        },
        {
          baseUrl: 'https://example.com/api',
          path: '/v1/callback',
          expected: 'https://example.com/v1/callback',
        },
      ];

      for (const testCase of testCases) {
        const result = defaultGenerateWalletResponseRedirectUriTemplate(
          testCase.baseUrl,
          testCase.path,
          '{CODE}'
        );
        expect(result).toContain(testCase.expected);
      }
    });

    it('should handle different URL schemes', () => {
      const testCases = [
        'https://example.com',
        'http://localhost:3000',
        'http://example.com:8080',
        'https://secure.example.com:8443',
      ];

      for (const baseUrl of testCases) {
        const result = defaultGenerateWalletResponseRedirectUriTemplate(
          baseUrl,
          '/callback',
          '{CODE}'
        );
        expect(result).toMatch(
          new RegExp(`^${baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`)
        );
        expect(result).toContain('response_code={CODE}');
      }
    });

    it('should preserve port numbers', () => {
      const baseUrl = 'https://api.example.com:8443';
      const path = '/auth/callback';
      const placeholder = '{RESPONSE}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe(
        'https://api.example.com:8443/auth/callback?response_code={RESPONSE}'
      );
    });

    it('should handle subdomains correctly', () => {
      const baseUrl = 'https://api.verifier.example.com';
      const path = '/oid4vc/callback';
      const placeholder = '{SESSION_ID}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe(
        'https://api.verifier.example.com/oid4vc/callback?response_code={SESSION_ID}'
      );
    });
  });

  describe('path handling', () => {
    it('should handle various path formats', () => {
      const baseUrl = 'https://example.com';

      const testCases = [
        { path: '/', expected: 'https://example.com/?response_code={CODE}' },
        {
          path: '/callback',
          expected: 'https://example.com/callback?response_code={CODE}',
        },
        {
          path: '/api/v1/callback',
          expected: 'https://example.com/api/v1/callback?response_code={CODE}',
        },
        {
          path: '/auth/oid4vc/response',
          expected:
            'https://example.com/auth/oid4vc/response?response_code={CODE}',
        },
        {
          path: 'callback',
          expected: 'https://example.com/callback?response_code={CODE}',
        },
      ];

      for (const testCase of testCases) {
        const result = defaultGenerateWalletResponseRedirectUriTemplate(
          baseUrl,
          testCase.path,
          '{CODE}'
        );
        expect(result).toBe(testCase.expected);
      }
    });

    it('should handle paths with special characters', () => {
      const baseUrl = 'https://example.com';
      const path = '/callback-with-dashes/endpoint_with_underscores';
      const placeholder = '{CODE}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe(
        'https://example.com/callback-with-dashes/endpoint_with_underscores?response_code={CODE}'
      );
    });

    it('should handle empty path', () => {
      const baseUrl = 'https://example.com';
      const path = '';
      const placeholder = '{CODE}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe('https://example.com/?response_code={CODE}');
    });
  });

  describe('placeholder handling', () => {
    it('should handle complex placeholder values', () => {
      const baseUrl = 'https://example.com';
      const path = '/callback';

      const complexPlaceholders = [
        '{PRESENTATION_ID}',
        '{{session.responseCode}}',
        '%DYNAMIC_VALUE%',
        '${response.code}',
        'REPLACE_ME_123',
        '{RESPONSE_CODE_WITH_TIMESTAMP}',
        '[[RESPONSE]]',
      ];

      for (const placeholder of complexPlaceholders) {
        const result = defaultGenerateWalletResponseRedirectUriTemplate(
          baseUrl,
          path,
          placeholder
        );
        expect(result).toBe(
          `https://example.com/callback?response_code=${placeholder}`
        );
      }
    });

    it('should handle placeholder with special characters', () => {
      const baseUrl = 'https://example.com';
      const path = '/callback';
      const placeholder = '{RESPONSE-CODE_123!@#}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toContain('response_code={RESPONSE-CODE_123!@#}');
    });

    it('should handle URL-encoded placeholders', () => {
      const baseUrl = 'https://example.com';
      const path = '/callback';
      const placeholder = '{RESPONSE%20CODE}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toContain('response_code={RESPONSE%20CODE}');
    });

    it('should handle very long placeholders', () => {
      const baseUrl = 'https://example.com';
      const path = '/callback';
      const placeholder =
        '{VERY_LONG_PLACEHOLDER_NAME_THAT_EXCEEDS_NORMAL_LENGTH_LIMITS_123456789}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toContain(`response_code=${placeholder}`);
    });
  });

  describe('URL decoding behavior', () => {
    it('should return decoded URI template', () => {
      const baseUrl = 'https://example.com';
      const path = '/callback with spaces';
      const placeholder = '{CODE WITH SPACES}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      // Result should be decoded
      expect(result).toContain('callback with spaces');
      expect(result).toContain('response_code={CODE+WITH+SPACES}');
    });

    it('should handle pre-encoded input correctly', () => {
      const baseUrl = 'https://example.com';
      const path = '/callback%20with%20spaces';
      const placeholder = '{CODE%20WITH%20SPACES}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toContain('callback with spaces');
      expect(result).toContain('response_code={CODE%20WITH%20SPACES}');
    });

    it('should handle Unicode characters', () => {
      const baseUrl = 'https://example.com';
      const path = '/コールバック';
      const placeholder = '{レスポンス}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toContain('/コールバック');
      expect(result).toContain('response_code={レスポンス}');
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle malformed base URLs', () => {
      expect(() => {
        defaultGenerateWalletResponseRedirectUriTemplate(
          'not-a-url',
          '/callback',
          '{CODE}'
        );
      }).toThrow();
    });

    it('should handle null and undefined inputs', () => {
      const baseUrl = 'https://example.com';

      expect(() => {
        defaultGenerateWalletResponseRedirectUriTemplate(
          baseUrl,
          null as any,
          '{CODE}'
        );
      }).not.toThrow();

      expect(() => {
        defaultGenerateWalletResponseRedirectUriTemplate(
          baseUrl,
          '/callback',
          null as any
        );
      }).not.toThrow();
    });

    it('should handle very long URLs', () => {
      const baseUrl =
        'https://very-long-domain-name-that-exceeds-normal-limits.example.com';
      const path = '/very/long/path/that/goes/on/and/on/callback';
      const placeholder =
        '{VERY_LONG_PLACEHOLDER_NAME_THAT_EXCEEDS_NORMAL_LIMITS}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result.length).toBeGreaterThan(150);
      expect(result).toContain(baseUrl);
      expect(result).toContain(path);
      expect(result).toContain(`response_code=${placeholder}`);
    });

    it('should handle URLs with existing query parameters', () => {
      const baseUrl = 'https://example.com/base?existing=param';
      const path = '/callback';
      const placeholder = '{CODE}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      // The path should be combined with the base URL
      expect(result).toBe(
        'https://example.com/callback?existing=param&response_code={CODE}'
      );
      expect(result).toContain('existing=param');
    });

    it('should handle URLs with fragments', () => {
      const baseUrl = 'https://example.com#fragment';
      const path = '/callback';
      const placeholder = '{CODE}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe(
        'https://example.com/callback?response_code={CODE}#fragment'
      );
    });
  });

  describe('real-world scenarios', () => {
    it('should work with production verifier URLs', () => {
      const baseUrl = 'https://verifier.production.example.com';
      const path = '/api/v1/oid4vc/wallet-response';
      const placeholder = '{PRESENTATION_ID}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe(
        'https://verifier.production.example.com/api/v1/oid4vc/wallet-response?response_code={PRESENTATION_ID}'
      );
    });

    it('should work with development environment', () => {
      const baseUrl = 'http://localhost:3000';
      const path = '/dev/callback';
      const placeholder = '{DEV_SESSION_ID}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe(
        'http://localhost:3000/dev/callback?response_code={DEV_SESSION_ID}'
      );
    });

    it('should work with staging environment', () => {
      const baseUrl = 'https://staging-api.example.com:8443';
      const path = '/staging/wallet/response';
      const placeholder = '{STAGING_RESPONSE_CODE}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe(
        'https://staging-api.example.com:8443/staging/wallet/response?response_code={STAGING_RESPONSE_CODE}'
      );
    });

    it('should work with microservice architecture', () => {
      const baseUrl = 'https://wallet-service.internal.example.com';
      const path = '/oid4vc/v2/response-handler';
      const placeholder = '{SERVICE_RESPONSE_ID}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe(
        'https://wallet-service.internal.example.com/oid4vc/v2/response-handler?response_code={SERVICE_RESPONSE_ID}'
      );
    });
  });

  describe('template replacement scenarios', () => {
    it('should generate templates suitable for later replacement', () => {
      const baseUrl = 'https://example.com';
      const path = '/callback';
      const placeholder = '{RESPONSE_CODE}';

      const template = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      // Simulate later replacement
      const actualResponseCode = 'abc123xyz789';
      const finalUrl = template.replace('{RESPONSE_CODE}', actualResponseCode);

      expect(finalUrl).toBe(
        'https://example.com/callback?response_code=abc123xyz789'
      );
    });

    it('should work with multiple placeholder instances', () => {
      const baseUrl = 'https://example.com';
      const path = '/callback';
      const placeholder = '{CODE}';

      const template = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      // If the same placeholder appears multiple times (unlikely but possible)
      const modifiedTemplate = template + '&session={CODE}';
      const finalUrl = modifiedTemplate.replace(/{CODE}/g, 'actual_value');

      expect(finalUrl).toContain('response_code=actual_value');
      expect(finalUrl).toContain('session=actual_value');
    });

    it('should handle complex replacement patterns', () => {
      const baseUrl = 'https://example.com';
      const path = '/callback';
      const placeholder = '{{session.response.code}}';

      const template = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      // Template should contain the complex placeholder
      expect(template).toContain('response_code={{session.response.code}}');

      // Should be replaceable with actual values
      const finalUrl = template.replace(
        '{{session.response.code}}',
        'session_abc123'
      );
      expect(finalUrl).toContain('response_code=session_abc123');
    });
  });

  describe('integration with URL standards', () => {
    it('should follow RFC 3986 URL standards', () => {
      const baseUrl = 'https://example.com';
      const path = '/callback';
      const placeholder = '{CODE}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      // Should be a valid URL format
      expect(() => new URL(result.replace('{CODE}', 'test'))).not.toThrow();
    });

    it('should be compatible with OAuth 2.0 redirect URI requirements', () => {
      const baseUrl = 'https://oauth.example.com';
      const path = '/oauth2/callback';
      const placeholder = '{AUTHORIZATION_CODE}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe(
        'https://oauth.example.com/oauth2/callback?response_code={AUTHORIZATION_CODE}'
      );

      // Should work when placeholder is replaced with OAuth code
      const oauthCode = 'SplxlOBeZQQYbYS6WxSbIA';
      const finalUrl = result.replace('{AUTHORIZATION_CODE}', oauthCode);
      expect(finalUrl).toContain(`response_code=${oauthCode}`);
    });

    it('should be compatible with OpenID Connect flows', () => {
      const baseUrl = 'https://oidc.example.com';
      const path = '/oidc/callback';
      const placeholder = '{ID_TOKEN_RESPONSE}';

      const result = defaultGenerateWalletResponseRedirectUriTemplate(
        baseUrl,
        path,
        placeholder
      );

      expect(result).toBe(
        'https://oidc.example.com/oidc/callback?response_code={ID_TOKEN_RESPONSE}'
      );
    });
  });
});
