import { describe, expect, it } from 'vitest';
import type { WalletRedirectUriQuery } from '../../../../ports/out/cfg/GenerateWalletRedirectUri';
import { defaultGenerateWalletRedirectUri } from '../DefaultGenerateWalletRedirectUri';

describe('DefaultGenerateWalletRedirectUri', () => {
  describe('basic functionality', () => {
    it('should generate wallet redirect URI with basic query parameters', () => {
      const redirectUri = 'https://verifier.example.com/callback';
      const query: WalletRedirectUriQuery = {
        client_id: 'verifier123',
        request: 'eyJhbGciOiJSUzI1NiJ9...',
        request_uri: 'https://verifier.example.com/request/abc123',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toBe(
        'https://verifier.example.com/callback?client_id=verifier123&request=eyJhbGciOiJSUzI1NiJ9...&request_uri=https://verifier.example.com/request/abc123'
      );
    });

    it('should handle minimal query parameters with request', () => {
      const redirectUri = 'https://wallet.example.com/auth';
      const query: WalletRedirectUriQuery = {
        client_id: 'test_client',
        request: 'test_request_jwt',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toBe(
        'https://wallet.example.com/auth?client_id=test_client&request=test_request_jwt'
      );
    });

    it('should handle minimal query parameters with request_uri', () => {
      const redirectUri = 'https://wallet.example.com/auth';
      const query: WalletRedirectUriQuery = {
        client_id: 'test_client',
        request_uri: 'https://example.com/request/123',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toBe(
        'https://wallet.example.com/auth?client_id=test_client&request_uri=https://example.com/request/123'
      );
    });

    it('should replace existing query parameters', () => {
      const redirectUri = 'https://example.com/callback?old_param=old_value';
      const query: WalletRedirectUriQuery = {
        client_id: 'new_client',
        request: 'new_request_jwt',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toContain('client_id=new_client');
      expect(result).toContain('request=new_request_jwt');
      expect(result).not.toContain('old_param=old_value');
    });
  });

  describe('URL encoding and special characters', () => {
    it('should properly URL encode special characters in parameters', () => {
      const redirectUri = 'https://example.com/callback';
      const query: WalletRedirectUriQuery = {
        client_id: 'client with spaces',
        request: 'jwt.token&with=special+chars',
        request_uri: 'https://callback.example.com?param=value&other=data',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toContain('client_id=client+with+spaces');
      expect(result).toContain('request=jwt.token&with=special+chars');
      expect(result).toContain(
        'request_uri=https://callback.example.com?param=value&other=data'
      );
    });

    it('should handle empty client_id with valid request', () => {
      const redirectUri = 'https://example.com/callback';
      const query: WalletRedirectUriQuery = {
        client_id: '',
        request: 'valid_request_jwt',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toContain('client_id=');
      expect(result).toContain('request=valid_request_jwt');
    });
  });

  describe('request and request_uri handling', () => {
    it('should remove request parameter when undefined', () => {
      const redirectUri = 'https://example.com/callback';
      const query: WalletRedirectUriQuery = {
        client_id: 'client123',
        request: undefined,
        request_uri: 'https://example.com/request/123',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).not.toContain('request=');
      expect(result).toContain('client_id=client123');
      expect(result).toContain('request_uri=https://example.com/request/123');
    });

    it('should remove request_uri parameter when undefined', () => {
      const redirectUri = 'https://example.com/callback';
      const query: WalletRedirectUriQuery = {
        client_id: 'client123',
        request: 'eyJhbGciOiJSUzI1NiJ9...',
        request_uri: undefined,
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).not.toContain('request_uri=');
      expect(result).toContain('client_id=client123');
      expect(result).toContain('request=eyJhbGciOiJSUzI1NiJ9...');
    });

    it('should throw error when both request and request_uri are undefined', () => {
      const redirectUri = 'https://example.com/callback';
      const query: WalletRedirectUriQuery = {
        client_id: 'client123',
        request: undefined,
        request_uri: undefined,
      };

      expect(() =>
        defaultGenerateWalletRedirectUri(redirectUri, query)
      ).toThrow('request or request_uri is required');
    });

    it('should throw error when both request and request_uri are falsy', () => {
      const redirectUri = 'https://example.com/callback';
      const query: WalletRedirectUriQuery = {
        client_id: 'client123',
        request: '',
        request_uri: '',
      };

      expect(() =>
        defaultGenerateWalletRedirectUri(redirectUri, query)
      ).toThrow('request or request_uri is required');
    });

    it('should keep request parameter when it has a value', () => {
      const redirectUri = 'https://example.com/callback';
      const query: WalletRedirectUriQuery = {
        client_id: 'client123',
        request: 'valid_jwt_token',
        request_uri: undefined,
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toContain('request=valid_jwt_token');
      expect(result).not.toContain('request_uri=');
    });

    it('should keep request_uri parameter when it has a value', () => {
      const redirectUri = 'https://example.com/callback';
      const query: WalletRedirectUriQuery = {
        client_id: 'client123',
        request: undefined,
        request_uri: 'https://example.com/request/valid',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toContain('request_uri=https://example.com/request/valid');
      expect(result).not.toContain('request=');
    });
  });

  describe('different URL schemes and formats', () => {
    it('should handle HTTP URLs', () => {
      const redirectUri = 'http://localhost:3000/callback';
      const query: WalletRedirectUriQuery = {
        client_id: 'dev_client',
        request: 'dev_request',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toBe(
        'http://localhost:3000/callback?client_id=dev_client&request=dev_request'
      );
    });

    it('should handle HTTPS URLs with ports', () => {
      const redirectUri = 'https://example.com:8443/secure/callback';
      const query: WalletRedirectUriQuery = {
        client_id: 'secure_client',
        request_uri: 'https://secure.example.com/request/123',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toBe(
        'https://example.com:8443/secure/callback?client_id=secure_client&request_uri=https://secure.example.com/request/123'
      );
    });

    it('should handle custom scheme URLs for mobile wallets', () => {
      const redirectUri = 'walletapp://auth/callback';
      const query: WalletRedirectUriQuery = {
        client_id: 'mobile_client',
        request: 'mobile_request_token',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toBe(
        'walletapp://auth/callback?client_id=mobile_client&request=mobile_request_token'
      );
    });

    it('should handle URLs with existing paths', () => {
      const redirectUri = 'https://wallet.example.com/v1/openid_vc/authorize';
      const query: WalletRedirectUriQuery = {
        client_id: 'verifier_v1',
        request_uri: 'https://verifier.example.com/request/v1/123',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toBe(
        'https://wallet.example.com/v1/openid_vc/authorize?client_id=verifier_v1&request_uri=https://verifier.example.com/request/v1/123'
      );
    });

    it('should handle URLs with fragments', () => {
      const redirectUri = 'https://example.com/callback#section';
      const query: WalletRedirectUriQuery = {
        client_id: 'client_with_fragment',
        request: 'fragment_request',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toContain('client_id=client_with_fragment');
      expect(result).toContain('request=fragment_request');
      expect(result).toContain('#section');
    });
  });

  describe('complex parameter scenarios', () => {
    it('should handle long JWT tokens', () => {
      const redirectUri = 'https://example.com/callback';
      const longJwt =
        'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6InNpZ25pbmcta2V5LWlkIn0.' +
        'eyJpc3MiOiJodHRwczovL2V4YW1wbGUuY29tIiwiYXVkIjoiaHR0cHM6Ly93YWxsZXQuZXhhbXBsZS5jb20iLCJleHAiOjE2NzAwMDAwMDAsImlhdCI6MTY2OTk5OTAwMCwibm9uY2UiOiJhYmMxMjMifQ.' +
        'signature_part_that_is_very_long_and_contains_cryptographic_data';

      const query: WalletRedirectUriQuery = {
        client_id: 'client123',
        request: longJwt,
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toContain('client_id=client123');
      expect(result).toContain(`request=${longJwt}`);
      expect(result.length).toBeGreaterThan(300);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle malformed base URLs gracefully', () => {
      expect(() => {
        defaultGenerateWalletRedirectUri('not-a-url', {
          client_id: 'test',
          request: 'test_request',
        });
      }).toThrow();
    });

    it('should throw error when neither request nor request_uri is provided', () => {
      const redirectUri = 'https://example.com/callback';
      const query: WalletRedirectUriQuery = {
        client_id: 'test_client',
      };

      expect(() => {
        defaultGenerateWalletRedirectUri(redirectUri, query);
      }).toThrow('request or request_uri is required');
    });

    it('should handle very long URLs', () => {
      const redirectUri =
        'https://very-long-domain-name-that-exceeds-normal-limits.example.com/very/long/path/that/goes/on/and/on/callback';
      const query: WalletRedirectUriQuery = {
        client_id:
          'client_with_very_long_identifier_that_exceeds_normal_limits',
        request: 'a'.repeat(1000),
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result.length).toBeGreaterThan(1000);
      expect(result).toContain(redirectUri);
      expect(result).toContain(
        'client_id=client_with_very_long_identifier_that_exceeds_normal_limits'
      );
    });
  });

  describe('URL decoding behavior', () => {
    it('should return decoded URL components', () => {
      const redirectUri = 'https://example.com/callback with spaces';
      const query: WalletRedirectUriQuery = {
        client_id: 'client 123',
        request_uri: 'https://callback.example.com/path with spaces',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      // The result should be decoded
      expect(result).toContain('callback with spaces');
      expect(result).toContain('client_id=client+123');
      expect(result).toContain(
        'request_uri=https://callback.example.com/path+with+spaces'
      );
    });

    it('should handle pre-encoded URLs correctly', () => {
      const redirectUri = 'https://example.com/callback%20with%20spaces';
      const query: WalletRedirectUriQuery = {
        client_id: 'client%20123',
        request_uri: 'https://encoded.example.com/request%20uri',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      // Should handle both encoded input and produce properly formatted output
      expect(result).toContain('callback with spaces');
      expect(result).toContain('client_id=client%20123');
      expect(result).toContain(
        'request_uri=https://encoded.example.com/request%20uri'
      );
    });
  });

  describe('integration scenarios', () => {
    it('should work with real OID4VC wallet redirect scenarios', () => {
      const redirectUri = 'https://wallet.example.com/openid_vc';
      const query: WalletRedirectUriQuery = {
        client_id: 'verifier_12345',
        request_uri: 'https://verifier.example.com/request/presentation_123',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toBe(
        'https://wallet.example.com/openid_vc?client_id=verifier_12345&request_uri=https://verifier.example.com/request/presentation_123'
      );
    });

    it('should work with mobile wallet deep linking', () => {
      const redirectUri = 'oid4vp://authorize';
      const query: WalletRedirectUriQuery = {
        client_id: 'mobile_verifier',
        request: 'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toBe(
        'oid4vp://authorize?client_id=mobile_verifier&request=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9...'
      );
    });

    it('should work with cross-device flows', () => {
      const redirectUri = 'https://cross-device.wallet.example.com/scan';
      const query: WalletRedirectUriQuery = {
        client_id: 'cross_device_verifier',
        request_uri: 'https://verifier.example.com/request/qr_session_123',
      };

      const result = defaultGenerateWalletRedirectUri(redirectUri, query);

      expect(result).toContain('cross-device.wallet.example.com/scan');
      expect(result).toContain('client_id=cross_device_verifier');
      expect(result).toContain(
        'request_uri=https://verifier.example.com/request/qr_session_123'
      );
    });
  });
});
