import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitTransactionService } from '../InitTransactionService';
import { InitTransactionServiceError } from '../InitTransactionService.errors';

describe('InitTransactionService', () => {
  let mockSession: any;
  let mockPost: any;
  let mockIsMobile: any;
  let mockGenerateNonce: any;
  let mockGeneratePresentationDefinition: any;
  let mockGenerateWalletResponseRedirectUriTemplate: any;
  let mockGenerateWalletRedirectUri: any;
  let mockGenerateEphemeralECDHPrivateJwk: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock functions
    mockSession = {
      get: vi.fn(),
      set: vi.fn(),
      keys: vi.fn(),
    };

    mockPost = vi.fn();
    mockIsMobile = vi.fn();
    mockGenerateNonce = vi.fn();
    mockGeneratePresentationDefinition = vi.fn();
    mockGenerateWalletResponseRedirectUriTemplate = vi.fn();
    mockGenerateWalletRedirectUri = vi.fn();
    mockGenerateEphemeralECDHPrivateJwk = vi.fn();
  });

  describe('createInitTransactionService', () => {
    describe('Configuration validation', () => {
      it('should create service successfully with valid configuration', () => {
        const service = createInitTransactionService({
          apiBaseUrl: 'https://api.example.com',
          apiPath: '/v1/transactions/init',
          publicUrl: 'https://verifier.example.com',
          walletUrl: 'https://wallet.example.com',
          walletResponseRedirectPath: '/callback',
          walletResponseRedirectQueryTemplate: '{SESSION_ID}',
          isMobile: mockIsMobile,
          tokenType: 'vp_token',
          generateNonce: mockGenerateNonce,
          generatePresentationDefinition: mockGeneratePresentationDefinition,
          responseMode: 'direct_post',
          jarMode: 'by_reference',
          presentationDefinitionMode: 'by_reference',
          generateWalletResponseRedirectUriTemplate:
            mockGenerateWalletResponseRedirectUriTemplate,
          post: mockPost,
          session: mockSession,
          generateWalletRedirectUri: mockGenerateWalletRedirectUri,
          generateEphemeralECDHPrivateJwk: mockGenerateEphemeralECDHPrivateJwk,
        });

        expect(typeof service).toBe('function');
      });

      it('should throw error when apiBaseUrl is missing', () => {
        expect(() =>
          createInitTransactionService({
            apiBaseUrl: '',
            apiPath: '/v1/transactions/init',
            publicUrl: 'https://verifier.example.com',
            walletUrl: 'https://wallet.example.com',
            walletResponseRedirectPath: '/callback',
            walletResponseRedirectQueryTemplate: '{SESSION_ID}',
            isMobile: mockIsMobile,
            tokenType: 'vp_token',
            generateNonce: mockGenerateNonce,
            generatePresentationDefinition: mockGeneratePresentationDefinition,
            responseMode: 'direct_post',
            jarMode: 'by_reference',
            presentationDefinitionMode: 'by_reference',
            generateWalletResponseRedirectUriTemplate:
              mockGenerateWalletResponseRedirectUriTemplate,
            post: mockPost,
            session: mockSession,
            generateWalletRedirectUri: mockGenerateWalletRedirectUri,
            generateEphemeralECDHPrivateJwk:
              mockGenerateEphemeralECDHPrivateJwk,
          })
        ).toThrow(InitTransactionServiceError);
      });

      it('should throw error when publicUrl is missing', () => {
        expect(() =>
          createInitTransactionService({
            apiBaseUrl: 'https://api.example.com',
            apiPath: '/v1/transactions/init',
            publicUrl: '',
            walletUrl: 'https://wallet.example.com',
            walletResponseRedirectPath: '/callback',
            walletResponseRedirectQueryTemplate: '{SESSION_ID}',
            isMobile: mockIsMobile,
            tokenType: 'vp_token',
            generateNonce: mockGenerateNonce,
            generatePresentationDefinition: mockGeneratePresentationDefinition,
            responseMode: 'direct_post',
            jarMode: 'by_reference',
            presentationDefinitionMode: 'by_reference',
            generateWalletResponseRedirectUriTemplate:
              mockGenerateWalletResponseRedirectUriTemplate,
            post: mockPost,
            session: mockSession,
            generateWalletRedirectUri: mockGenerateWalletRedirectUri,
            generateEphemeralECDHPrivateJwk:
              mockGenerateEphemeralECDHPrivateJwk,
          })
        ).toThrow(InitTransactionServiceError);
      });
    });

    describe('Service function execution', () => {
      let service: ReturnType<typeof createInitTransactionService>;
      let mockRequest: Request;

      beforeEach(() => {
        service = createInitTransactionService({
          apiBaseUrl: 'https://api.example.com',
          apiPath: '/v1/transactions/init',
          publicUrl: 'https://verifier.example.com',
          walletUrl: 'https://wallet.example.com',
          walletResponseRedirectPath: '/callback',
          walletResponseRedirectQueryTemplate: '{SESSION_ID}',
          isMobile: mockIsMobile,
          tokenType: 'vp_token',
          generateNonce: mockGenerateNonce,
          generatePresentationDefinition: mockGeneratePresentationDefinition,
          responseMode: 'direct_post',
          jarMode: 'by_reference',
          presentationDefinitionMode: 'by_reference',
          generateWalletResponseRedirectUriTemplate:
            mockGenerateWalletResponseRedirectUriTemplate,
          post: mockPost,
          session: mockSession,
          generateWalletRedirectUri: mockGenerateWalletRedirectUri,
          generateEphemeralECDHPrivateJwk: mockGenerateEphemeralECDHPrivateJwk,
        });

        // Setup mock request
        mockRequest = new Request('https://verifier.example.com/init', {
          method: 'POST',
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6)',
          },
        });
      });

      it('should execute service successfully for mobile device', async () => {
        // Setup mocks
        mockIsMobile.mockReturnValue(true);
        mockGenerateNonce.mockReturnValue('test-nonce-123');
        mockGeneratePresentationDefinition.mockReturnValue({
          definition: 'test-presentation-definition',
        });
        mockGenerateWalletResponseRedirectUriTemplate.mockReturnValue(
          'https://verifier.example.com/callback?session={SESSION_ID}'
        );

        const mockEphemeralKey = {
          value: {
            toJSON: () =>
              '{"kty":"EC","d":"test-private-key","x":"test-x","y":"test-y"}',
          },
        };
        mockGenerateEphemeralECDHPrivateJwk.mockResolvedValue(mockEphemeralKey);

        const mockApiResponse = {
          data: {
            presentation_id: 'test-presentation-id',
            client_id: 'test-client-id',
            request_uri: 'https://api.example.com/request/test-id',
          },
          metadata: {
            status: 200,
            statusText: 'OK',
            headers: {},
            url: '',
            ok: true,
          },
        };
        mockPost.mockResolvedValue(mockApiResponse);

        mockGenerateWalletRedirectUri.mockReturnValue(
          'https://wallet.example.com?request_uri=https%3A//api.example.com/request/test-id'
        );

        // Execute service
        const result = await service(mockRequest);

        // Verify result
        expect(result).toEqual({
          walletRedirectUri:
            'https://wallet.example.com?request_uri=https%3A//api.example.com/request/test-id',
          isMobile: true,
        });

        // Verify API call was made
        expect(mockPost).toHaveBeenCalledWith(
          'https://api.example.com',
          '/v1/transactions/init',
          expect.stringContaining('"type":"vp_token"'),
          expect.any(Object) // InitTransactionResponseSchema
        );

        // Verify session storage
        expect(mockSession.set).toHaveBeenCalledWith(
          'presentationId',
          'test-presentation-id'
        );
        expect(mockSession.set).toHaveBeenCalledWith('nonce', 'test-nonce-123');
        expect(mockSession.set).toHaveBeenCalledWith(
          'ephemeralECDHPrivateJwk',
          '{"kty":"EC","d":"test-private-key","x":"test-x","y":"test-y"}'
        );
      });

      it('should execute service successfully for desktop device', async () => {
        // Setup mocks for desktop
        mockIsMobile.mockReturnValue(false);
        mockGenerateNonce.mockReturnValue('test-nonce-456');
        mockGeneratePresentationDefinition.mockReturnValue({
          definition: 'test-presentation-definition',
        });

        const mockEphemeralKey = {
          value: {
            toJSON: () =>
              '{"kty":"EC","d":"test-private-key","x":"test-x","y":"test-y"}',
          },
        };
        mockGenerateEphemeralECDHPrivateJwk.mockResolvedValue(mockEphemeralKey);

        const mockApiResponse = {
          data: {
            presentation_id: 'test-presentation-id',
            client_id: 'test-client-id',
            request_uri: 'https://api.example.com/request/test-id',
          },
          metadata: {
            status: 200,
            statusText: 'OK',
            headers: {},
            url: '',
            ok: true,
          },
        };
        mockPost.mockResolvedValue(mockApiResponse);

        mockGenerateWalletRedirectUri.mockReturnValue(
          'https://wallet.example.com?request_uri=https%3A//api.example.com/request/test-id'
        );

        // Create desktop request
        const desktopRequest = new Request(
          'https://verifier.example.com/init',
          {
            method: 'POST',
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
          }
        );

        // Execute service
        const result = await service(desktopRequest);

        // Verify result
        expect(result).toEqual({
          walletRedirectUri:
            'https://wallet.example.com?request_uri=https%3A//api.example.com/request/test-id',
          isMobile: false,
        });
      });

      it('should throw error when user agent is missing', async () => {
        const requestWithoutUserAgent = new Request(
          'https://verifier.example.com/init',
          {
            method: 'POST',
          }
        );

        await expect(service(requestWithoutUserAgent)).rejects.toThrow(
          InitTransactionServiceError
        );
        await expect(service(requestWithoutUserAgent)).rejects.toThrow(
          'User agent header is required'
        );
      });

      it('should throw error when API request fails', async () => {
        // Setup mocks
        mockIsMobile.mockReturnValue(true);
        mockGenerateNonce.mockReturnValue('test-nonce-123');
        mockGeneratePresentationDefinition.mockReturnValue({
          definition: 'test-presentation-definition',
        });
        mockGenerateWalletResponseRedirectUriTemplate.mockReturnValue(
          'https://verifier.example.com/callback?session={SESSION_ID}'
        );

        const mockEphemeralKey = {
          value: {
            toJSON: () =>
              '{"kty":"EC","d":"test-private-key","x":"test-x","y":"test-y"}',
          },
        };
        mockGenerateEphemeralECDHPrivateJwk.mockResolvedValue(mockEphemeralKey);

        const apiError = new Error('Network error');
        mockPost.mockRejectedValue(apiError);

        await expect(service(mockRequest)).rejects.toThrow(
          InitTransactionServiceError
        );
        await expect(service(mockRequest)).rejects.toThrow(
          'Failed to communicate with InitTransaction API'
        );
      });

      it('should throw error when API response parsing fails', async () => {
        // Setup mocks
        mockIsMobile.mockReturnValue(true);
        mockGenerateNonce.mockReturnValue('test-nonce-123');
        mockGeneratePresentationDefinition.mockReturnValue({
          definition: 'test-presentation-definition',
        });
        mockGenerateWalletResponseRedirectUriTemplate.mockReturnValue(
          'https://verifier.example.com/callback?session={SESSION_ID}'
        );

        const mockEphemeralKey = {
          value: {
            toJSON: () =>
              '{"kty":"EC","d":"test-private-key","x":"test-x","y":"test-y"}',
          },
        };
        mockGenerateEphemeralECDHPrivateJwk.mockResolvedValue(mockEphemeralKey);

        // Invalid API response that will fail parsing
        const mockApiResponse = {
          data: {
            invalid_field: 'invalid-data',
          },
          metadata: {
            status: 200,
            statusText: 'OK',
            headers: {},
            url: '',
            ok: true,
          },
        };
        mockPost.mockResolvedValue(mockApiResponse);

        await expect(service(mockRequest)).rejects.toThrow(
          InitTransactionServiceError
        );
        await expect(service(mockRequest)).rejects.toThrow(
          'Failed to parse InitTransaction API response'
        );
      });

      it('should throw error when wallet redirect URI generation fails', async () => {
        // Setup mocks
        mockIsMobile.mockReturnValue(true);
        mockGenerateNonce.mockReturnValue('test-nonce-123');
        mockGeneratePresentationDefinition.mockReturnValue({
          definition: 'test-presentation-definition',
        });
        mockGenerateWalletResponseRedirectUriTemplate.mockReturnValue(
          'https://verifier.example.com/callback?session={SESSION_ID}'
        );

        const mockEphemeralKey = {
          value: {
            toJSON: () =>
              '{"kty":"EC","d":"test-private-key","x":"test-x","y":"test-y"}',
          },
        };
        mockGenerateEphemeralECDHPrivateJwk.mockResolvedValue(mockEphemeralKey);

        const mockApiResponse = {
          data: {
            presentation_id: 'test-presentation-id',
            client_id: 'test-client-id',
            request_uri: 'https://api.example.com/request/test-id',
          },
          metadata: {
            status: 200,
            statusText: 'OK',
            headers: {},
            url: '',
            ok: true,
          },
        };
        mockPost.mockResolvedValue(mockApiResponse);

        const redirectError = new Error('Invalid redirect URI');
        mockGenerateWalletRedirectUri.mockImplementation(() => {
          throw redirectError;
        });

        await expect(service(mockRequest)).rejects.toThrow(
          InitTransactionServiceError
        );
        await expect(service(mockRequest)).rejects.toThrow(
          'Failed to generate wallet redirect URI'
        );
      });

      it('should handle unexpected errors gracefully', async () => {
        // Setup mocks that will cause an unexpected error
        mockIsMobile.mockImplementation(() => {
          throw new Error('Unexpected error in isMobile');
        });

        await expect(service(mockRequest)).rejects.toThrow(
          InitTransactionServiceError
        );
        await expect(service(mockRequest)).rejects.toThrow(
          'Unexpected error during transaction initialization'
        );
      });
    });
  });
});
