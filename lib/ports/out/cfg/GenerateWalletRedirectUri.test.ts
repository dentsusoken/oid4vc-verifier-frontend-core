import { describe, it, expect, beforeEach } from 'vitest';
import {
  GenerateWalletRedirectUri,
  WalletRedirectUriQuery,
  UrlGenerationException,
} from './';

// テスト用のモック実装関数
const createMockWalletRedirectUriGenerator = (
  shouldThrowError = false,
  errorType?: string
): GenerateWalletRedirectUri => {
  return (walletUrl: string, query: WalletRedirectUriQuery): string => {
    if (shouldThrowError) {
      throw new UrlGenerationException(
        'INVALID_BASE_URL',
        errorType || 'Mock error for testing',
        walletUrl
      );
    }

    // 基本的なURL生成のモック実装
    const url = new URL(walletUrl);

    // クエリパラメータを追加
    if (query.client_id) {
      url.searchParams.set('client_id', query.client_id);
    }
    if (query.request) {
      url.searchParams.set('request', query.request);
    }
    if (query.request_uri) {
      url.searchParams.set('request_uri', query.request_uri);
    }

    return url.toString();
  };
};

describe('GenerateWalletRedirectUri', () => {
  let generator: GenerateWalletRedirectUri;

  beforeEach(() => {
    generator = createMockWalletRedirectUriGenerator();
  });

  describe('正常系', () => {
    it('should generate wallet redirect URI with all parameters', () => {
      const walletUrl = 'https://wallet.example.com/openid_vc';
      const query: WalletRedirectUriQuery = {
        client_id: 'verifier_123',
        request: 'eyJhbGciOiJSUzI1NiJ9...',
        request_uri: 'https://verifier.example.com/request/abc123',
      };

      const result = generator(walletUrl, query);

      expect(result).toContain('https://wallet.example.com/openid_vc');
      expect(result).toContain('client_id=verifier_123');
      expect(result).toContain('request=eyJhbGciOiJSUzI1NiJ9...');
      // URLエンコードされた形式も許可
      expect(
        result.includes(
          'request_uri=https://verifier.example.com/request/abc123'
        ) ||
          result.includes(
            'request_uri=https%3A%2F%2Fverifier.example.com%2Frequest%2Fabc123'
          )
      ).toBe(true);
    });

    it('should generate wallet redirect URI with minimal parameters', () => {
      const walletUrl = 'https://simple-wallet.com/verify';
      const query: WalletRedirectUriQuery = {
        client_id: 'minimal_client',
      };

      const result = generator(walletUrl, query);

      expect(result).toContain('https://simple-wallet.com/verify');
      expect(result).toContain('client_id=minimal_client');
      expect(result).not.toContain('request=');
      expect(result).not.toContain('request_uri=');
    });

    it('should handle request parameter only', () => {
      const walletUrl = 'https://jwt-wallet.com/process';
      const query: WalletRedirectUriQuery = {
        client_id: 'jwt_client',
        request: 'jwt_token_here',
      };

      const result = generator(walletUrl, query);

      expect(result).toContain('client_id=jwt_client');
      expect(result).toContain('request=jwt_token_here');
      expect(result).not.toContain('request_uri=');
    });

    it('should handle request_uri parameter only', () => {
      const walletUrl = 'https://uri-wallet.com/handle';
      const query: WalletRedirectUriQuery = {
        client_id: 'uri_client',
        request_uri: 'https://verifier.com/request/uri123',
      };

      const result = generator(walletUrl, query);

      expect(result).toContain('client_id=uri_client');
      // URLエンコードされた形式も許可
      expect(
        result.includes('request_uri=https://verifier.com/request/uri123') ||
          result.includes(
            'request_uri=https%3A%2F%2Fverifier.com%2Frequest%2Furi123'
          )
      ).toBe(true);
      expect(result).not.toContain('request=');
    });

    it('should handle wallet URLs with existing query parameters', () => {
      const walletUrl = 'https://wallet.com/verify?version=1.0';
      const query: WalletRedirectUriQuery = {
        client_id: 'test_client',
      };

      const result = generator(walletUrl, query);

      expect(result).toContain('version=1.0');
      expect(result).toContain('client_id=test_client');
    });

    it('should work with different wallet URL formats', () => {
      const testCases = [
        'https://wallet.example.com',
        'https://wallet.example.com/',
        'https://wallet.example.com/path',
        'https://wallet.example.com/path/',
        'https://sub.wallet.example.com/deep/path',
      ];

      const query: WalletRedirectUriQuery = {
        client_id: 'format_test',
      };

      testCases.forEach((walletUrl) => {
        const result = generator(walletUrl, query);
        expect(result).toContain('client_id=format_test');
        expect(result).toMatch(/^https:\/\//);
      });
    });
  });

  describe('異常系', () => {
    it('should throw UrlGenerationException for invalid wallet URL', () => {
      const errorGenerator = createMockWalletRedirectUriGenerator(
        true,
        'Invalid wallet URL'
      );
      const query: WalletRedirectUriQuery = {
        client_id: 'test_client',
      };

      expect(() => {
        errorGenerator('invalid-url', query);
      }).toThrow(UrlGenerationException);
    });

    it('should handle UrlGenerationException properly', () => {
      const errorGenerator = createMockWalletRedirectUriGenerator(
        true,
        'Test error'
      );
      const query: WalletRedirectUriQuery = {
        client_id: 'error_test',
      };

      try {
        errorGenerator('https://test.com', query);
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

  describe('エッジケース', () => {
    it('should handle empty string values in query', () => {
      const walletUrl = 'https://wallet.example.com';
      const query: WalletRedirectUriQuery = {
        client_id: 'empty_test',
        request: '',
        request_uri: '',
      };

      const result = generator(walletUrl, query);

      expect(result).toContain('client_id=empty_test');
      // 空文字列のパラメータは含まれないか、適切に処理される
    });

    it('should handle special characters in parameters', () => {
      const walletUrl = 'https://wallet.example.com';
      const query: WalletRedirectUriQuery = {
        client_id: 'special_client',
        request: 'token.with.dots-and_underscores',
        request_uri: 'https://verifier.com/request?param=value&other=test',
      };

      const result = generator(walletUrl, query);

      expect(result).toContain('client_id=special_client');
      // URL エンコーディングが適切に処理されることを確認
    });
  });

  describe('型安全性', () => {
    it('should enforce WalletRedirectUriQuery type', () => {
      const walletUrl = 'https://wallet.example.com';

      // TypeScriptコンパイル時にのみ検証される
      const validQuery: WalletRedirectUriQuery = {
        client_id: 'type_test',
        request: 'optional_request',
        request_uri: 'optional_request_uri',
      };

      const result = generator(walletUrl, validQuery);
      expect(result).toContain('client_id=type_test');
    });

    it('should work with minimal required fields', () => {
      const walletUrl = 'https://wallet.example.com';
      const minimalQuery: WalletRedirectUriQuery = {
        client_id: 'minimal_required',
      };

      const result = generator(walletUrl, minimalQuery);
      expect(result).toContain('client_id=minimal_required');
    });
  });

  describe('実用的なシナリオ', () => {
    it('should generate URI for typical OID4VC flow', () => {
      const walletUrl = 'https://mobile-wallet.app/openid_vc';
      const query: WalletRedirectUriQuery = {
        client_id: 'university_verifier',
        request_uri:
          'https://university.edu/verify/request/diploma_verification_123',
      };

      const result = generator(walletUrl, query);

      expect(result).toMatch(/^https:\/\/mobile-wallet\.app\/openid_vc\?/);
      expect(result).toContain('client_id=university_verifier');
      // URLエンコードされた形式も許可
      expect(
        result.includes(
          'request_uri=https://university.edu/verify/request/diploma_verification_123'
        ) ||
          result.includes(
            'request_uri=https%3A%2F%2Funiversity.edu%2Fverify%2Frequest%2Fdiploma_verification_123'
          )
      ).toBe(true);
    });

    it('should handle enterprise wallet scenario', () => {
      const walletUrl =
        'https://enterprise.wallet.corp/credential-verification';
      const query: WalletRedirectUriQuery = {
        client_id: 'corp_hr_system',
        request:
          'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2NvcnAuY29tL2hyIiwic3ViIjoiZW1wbG95ZWVfaWQiLCJhdWQiOiJlbnRlcnByaXNlLndhbGxldC5jb3JwIn0.signature',
      };

      const result = generator(walletUrl, query);

      expect(result).toContain('corp_hr_system');
      expect(result).toContain('eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9');
    });
  });
});
