import { beforeEach, describe, expect, it, vi, type Mock } from 'vitest';
import { Nonce } from '../domain';
import { InitTransactionResponse } from '../ports/input';
import {
  createInitTransactionService,
  generateRequest,
  InitTransactionServiceError,
  type CreateInitTransactionServiceConfig,
  type GenerateRequestParams,
} from './InitTransactionService';

// テスト用のモックデータ
const mockNonce: Nonce = 'test-nonce-123' as Nonce;
const mockPresentationDefinition = {
  id: 'test-definition',
  input_descriptors: [],
};
const mockWalletRedirectParams = {
  client_id: 'client-123',
  request: 'request-data',
  request_uri: 'https://example.com/request',
};

describe('InitTransactionService', () => {
  describe('generateRequest', () => {
    const baseParams: GenerateRequestParams = {
      publicUrl: 'https://verifier.example.com',
      walletResponseRedirectPath: '/callback',
      walletResponseRedirectQueryTemplate: '{SESSION_ID}',
      isMobile: false,
      tokenType: 'vp_token',
      nonce: mockNonce,
      generatePresentationDefinition: vi.fn(() => mockPresentationDefinition),
      generateWalletResponseRedirectUriTemplate: vi.fn(
        (url, path, template) => `${url}${path}?session=${template}`
      ),
    };

    it('正常系: モバイルでない場合、wallet_response_redirect_uri_templateはundefinedになる', () => {
      const result = generateRequest(baseParams);

      expect(result).toEqual({
        type: 'vp_token',
        presentation_definition: mockPresentationDefinition,
        nonce: mockNonce,
        response_mode: undefined,
        jar_mode: undefined,
        presentation_definition_mode: undefined,
        wallet_response_redirect_uri_template: undefined,
      });
    });

    it('正常系: モバイルの場合、wallet_response_redirect_uri_templateが設定される', () => {
      const params = { ...baseParams, isMobile: true };
      const result = generateRequest(params);

      expect(result.wallet_response_redirect_uri_template).toBe(
        'https://verifier.example.com/callback?session={SESSION_ID}'
      );
      expect(
        baseParams.generateWalletResponseRedirectUriTemplate
      ).toHaveBeenCalledWith(
        'https://verifier.example.com',
        '/callback',
        '{SESSION_ID}'
      );
    });

    it('正常系: オプションパラメータが正しく設定される', () => {
      const params: GenerateRequestParams = {
        ...baseParams,
        responseMode: 'direct_post',
        jarMode: 'by_reference',
        presentationDefinitionMode: 'by_reference',
      };

      const result = generateRequest(params);

      expect(result.response_mode).toBe('direct_post');
      expect(result.jar_mode).toBe('by_reference');
      expect(result.presentation_definition_mode).toBe('by_reference');
    });

    it('異常系: publicUrlが空の場合エラーが発生する', () => {
      const params = { ...baseParams, publicUrl: '' };

      expect(() => generateRequest(params)).toThrow(
        InitTransactionServiceError
      );
      expect(() => generateRequest(params)).toThrow(
        'Required URL parameters are missing'
      );
    });

    it('異常系: walletResponseRedirectPathが空の場合エラーが発生する', () => {
      const params = { ...baseParams, walletResponseRedirectPath: '' };

      expect(() => generateRequest(params)).toThrow(
        InitTransactionServiceError
      );
    });

    it('異常系: walletResponseRedirectQueryTemplateが空の場合エラーが発生する', () => {
      const params = { ...baseParams, walletResponseRedirectQueryTemplate: '' };

      expect(() => generateRequest(params)).toThrow(
        InitTransactionServiceError
      );
    });
  });

  describe('createInitTransactionService', () => {
    let mockConfig: CreateInitTransactionServiceConfig;
    let mockRequest: Request;
    let mockSession: any;
    let mockPost: Mock;
    let mockGenerateNonce: Mock;
    let mockGeneratePresentationDefinition: Mock;
    let mockGenerateWalletResponseRedirectUriTemplate: Mock;
    let mockGenerateWalletRedirectUri: Mock;
    let mockIsMobile: Mock;
    let mockLogger: any;

    beforeEach(() => {
      // Mock logger with all required methods
      mockLogger = {
        info: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
        fatal: vi.fn(),
        logPerformance: vi.fn(),
        logSecurity: vi.fn(),
        logAudit: vi.fn(),
        log: vi.fn(),
        updateConfig: vi.fn(),
        isLevelEnabled: vi.fn(() => true),
        isTypeEnabled: vi.fn(() => true),
        config: {
          processLogging: true,
          secretLogging: false,
          securityLogging: true,
          performanceLogging: true,
          auditLogging: true,
          minLevel: 'info',
          includeTimestamp: true,
          includeMetadata: true,
        },
      };
      mockPost = vi.fn();
      mockGenerateNonce = vi.fn(() => mockNonce);
      mockGeneratePresentationDefinition = vi.fn(
        () => mockPresentationDefinition
      );
      mockGenerateWalletResponseRedirectUriTemplate = vi.fn(
        (url, path, template) => `${url}${path}?session=${template}`
      );
      mockGenerateWalletRedirectUri = vi.fn(
        () => 'https://wallet.example.com?client_id=test'
      );
      mockIsMobile = vi.fn(() => false);
      mockSession = {
        set: vi.fn(),
      };

      mockConfig = {
        apiBaseUrl: 'https://api.verifier.com',
        apiPath: '/v1/transactions/init',
        publicUrl: 'https://verifier.example.com',
        walletUrl: 'https://wallet.example.com',
        walletResponseRedirectPath: '/callback',
        walletResponseRedirectQueryTemplate: '{SESSION_ID}',
        isMobile: mockIsMobile,
        tokenType: 'vp_token',
        generateNonce: mockGenerateNonce,
        generatePresentationDefinition: mockGeneratePresentationDefinition,
        generateWalletResponseRedirectUriTemplate:
          mockGenerateWalletResponseRedirectUriTemplate,
        post: mockPost,
        session: mockSession,
        generateWalletRedirectUri: mockGenerateWalletRedirectUri,
        logger: mockLogger,
      };

      mockRequest = new Request('https://example.com', {
        headers: {
          'user-agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });
    });

    it('正常系: トランザクション初期化が成功する', async () => {
      const mockApiResponse = {
        presentation_id: 'pres-123' as any,
        client_id: 'client-123',
        request: 'request-data',
        request_uri: 'https://example.com/request',
      };

      mockPost.mockResolvedValue({ data: mockApiResponse });

      const initTransaction = createInitTransactionService(mockConfig);
      const result = await initTransaction(mockRequest);

      expect(result).toEqual({
        walletRedirectUri: 'https://wallet.example.com?client_id=test',
        isMobile: false,
      });

      // ビジネスロジックの検証
      expect(mockGenerateNonce).toHaveBeenCalled();
      expect(mockIsMobile).toHaveBeenCalledWith(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      );
      expect(mockPost).toHaveBeenCalled();
      expect(mockSession.set).toHaveBeenCalledWith(
        'presentationId',
        'pres-123'
      );
      expect(mockSession.set).toHaveBeenCalledWith('nonce', mockNonce);
      expect(mockGenerateWalletRedirectUri).toHaveBeenCalledWith(
        'https://wallet.example.com',
        mockWalletRedirectParams
      );
    });

    it('正常系: モバイルデバイスからのリクエスト', async () => {
      mockIsMobile.mockReturnValue(true);
      const mockApiResponse = {
        presentation_id: 'pres-123' as any,
        client_id: 'client-123',
      };

      mockPost.mockResolvedValue({ data: mockApiResponse });

      const initTransaction = createInitTransactionService(mockConfig);
      await initTransaction(mockRequest);

      // モバイル用のリダイレクトURI生成が呼ばれることを確認
      expect(
        mockGenerateWalletResponseRedirectUriTemplate
      ).toHaveBeenCalledWith(
        'https://verifier.example.com',
        '/callback',
        '{SESSION_ID}'
      );
    });

    it('異常系: User-Agentヘッダーが存在しない場合', async () => {
      const requestWithoutUserAgent = new Request('https://example.com');
      const initTransaction = createInitTransactionService(mockConfig);

      await expect(initTransaction(requestWithoutUserAgent)).rejects.toThrow(
        InitTransactionServiceError
      );
      await expect(initTransaction(requestWithoutUserAgent)).rejects.toThrow(
        'User agent header is required'
      );
    });

    it('異常系: API呼び出しが失敗した場合', async () => {
      mockPost.mockRejectedValue(new Error('API Error'));
      const initTransaction = createInitTransactionService(mockConfig);

      await expect(initTransaction(mockRequest)).rejects.toThrow(
        InitTransactionServiceError
      );
      await expect(initTransaction(mockRequest)).rejects.toThrow(
        'Failed to communicate with InitTransaction API'
      );
    });

    it('異常系: APIレスポンスのパースに失敗した場合', async () => {
      mockPost.mockResolvedValue({ data: { invalid: 'data' } });
      const initTransaction = createInitTransactionService(mockConfig);

      await expect(initTransaction(mockRequest)).rejects.toThrow(
        InitTransactionServiceError
      );
      await expect(initTransaction(mockRequest)).rejects.toThrow(
        'Failed to parse InitTransaction API response'
      );
    });

    it('異常系: セッション保存に失敗した場合', async () => {
      const mockApiResponse = {
        presentation_id: 'pres-123' as any,
        client_id: 'client-123',
      };

      mockPost.mockResolvedValue({ data: mockApiResponse });
      mockSession.set.mockImplementation(() => {
        throw new Error('Session Error');
      });

      const initTransaction = createInitTransactionService(mockConfig);

      await expect(initTransaction(mockRequest)).rejects.toThrow(
        InitTransactionServiceError
      );
      await expect(initTransaction(mockRequest)).rejects.toThrow(
        'Failed to store transaction data in session'
      );
    });

    it('異常系: ウォレットリダイレクトURI生成に失敗した場合', async () => {
      const mockApiResponse = {
        presentation_id: 'pres-123' as any,
        client_id: 'client-123',
      };

      mockPost.mockResolvedValue({ data: mockApiResponse });
      mockGenerateWalletRedirectUri.mockImplementation(() => {
        throw new Error('URI Generation Error');
      });

      const initTransaction = createInitTransactionService(mockConfig);

      await expect(initTransaction(mockRequest)).rejects.toThrow(
        InitTransactionServiceError
      );
      await expect(initTransaction(mockRequest)).rejects.toThrow(
        'Failed to generate wallet redirect URI'
      );
    });

    it('異常系: 設定パラメータが不正な場合', () => {
      const invalidConfig = { ...mockConfig, apiBaseUrl: '' };

      expect(() => createInitTransactionService(invalidConfig)).toThrow(
        InitTransactionServiceError
      );
      expect(() => createInitTransactionService(invalidConfig)).toThrow(
        'Required configuration parameters are missing'
      );
    });

    it('異常系: 予期しないエラーが発生した場合', async () => {
      // InitTransactionResponse.fromJSONでスパイを設定
      const fromJSONSpy = vi.spyOn(InitTransactionResponse, 'fromJSON');
      fromJSONSpy.mockImplementation(() => {
        throw new Error('Unexpected Error');
      });

      const mockApiResponse = {
        presentation_id: 'pres-123' as any,
        client_id: 'client-123',
      };

      mockPost.mockResolvedValue({ data: mockApiResponse });
      const initTransaction = createInitTransactionService(mockConfig);

      await expect(initTransaction(mockRequest)).rejects.toThrow(
        InitTransactionServiceError
      );

      fromJSONSpy.mockRestore();
    });
  });

  describe('InitTransactionServiceError', () => {
    it('正常系: エラーが正しく作成される', () => {
      const originalError = new Error('Original error');
      const error = new InitTransactionServiceError(
        'API_REQUEST_FAILED',
        'Test error details',
        originalError
      );

      expect(error.name).toBe('InitTransactionServiceError');
      expect(error.errorType).toBe('API_REQUEST_FAILED');
      expect(error.details).toBe('Test error details');
      expect(error.originalError).toBe(originalError);
      expect(error.message).toBe(
        'InitTransaction Service Error (API_REQUEST_FAILED): Test error details'
      );
    });

    it('正常系: originalErrorが未定義の場合', () => {
      const error = new InitTransactionServiceError(
        'MISSING_USER_AGENT',
        'User agent missing'
      );

      expect(error.originalError).toBeUndefined();
    });
  });
});
