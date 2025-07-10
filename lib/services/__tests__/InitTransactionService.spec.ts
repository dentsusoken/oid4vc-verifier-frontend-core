import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createInitTransactionService } from '../InitTransactionService';
import { InitTransactionServiceError } from '../InitTransactionService.errors';

describe('InitTransactionService', () => {
  let mockLogger: any;
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
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      logSecurity: vi.fn(),
      logAudit: vi.fn(),
      logPerformance: vi.fn(),
    };

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
          logger: mockLogger,
          generateEphemeralECDHPrivateJwk: mockGenerateEphemeralECDHPrivateJwk,
        });

        expect(typeof service).toBe('function');
        expect(mockLogger.info).toHaveBeenCalledWith(
          'InitTransactionService',
          'Service created successfully',
          expect.objectContaining({
            context: expect.objectContaining({
              apiBaseUrl: 'https://api.example.com',
              apiPath: '/v1/transactions/init',
              hasWalletUrl: true,
            }),
          })
        );
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
            logger: mockLogger,
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
            logger: mockLogger,
            generateEphemeralECDHPrivateJwk:
              mockGenerateEphemeralECDHPrivateJwk,
          })
        ).toThrow(InitTransactionServiceError);
      });

      it('should log error when configuration is invalid', () => {
        try {
          createInitTransactionService({
            apiBaseUrl: '',
            apiPath: '',
            publicUrl: '',
            walletUrl: '',
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
            logger: mockLogger,
            generateEphemeralECDHPrivateJwk:
              mockGenerateEphemeralECDHPrivateJwk,
          });
        } catch {
          // Expected to throw
        }

        expect(mockLogger.error).toHaveBeenCalledWith(
          'InitTransactionService',
          'Invalid configuration provided',
          expect.objectContaining({
            context: expect.objectContaining({
              hasApiBaseUrl: false,
              hasApiPath: false,
              hasPublicUrl: false,
              hasWalletUrl: false,
            }),
          })
        );
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
          logger: mockLogger,
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

        expect(mockLogger.error).toHaveBeenCalledWith(
          'InitTransactionService',
          'API request failed',
          expect.objectContaining({
            error: expect.objectContaining({
              name: 'Error',
              message: 'Network error',
            }),
          })
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

        expect(mockLogger.error).toHaveBeenCalledWith(
          'InitTransactionService',
          'Failed to parse API response',
          expect.objectContaining({
            context: expect.objectContaining({
              responseData: expect.stringContaining('invalid_field'),
            }),
          })
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

        expect(mockLogger.error).toHaveBeenCalledWith(
          'InitTransactionService',
          'Failed to generate wallet redirect URI',
          expect.objectContaining({
            error: expect.objectContaining({
              name: 'Error',
              message: 'Invalid redirect URI',
            }),
          })
        );
      });

      it('should log performance metrics on success', async () => {
        // Setup successful execution
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

        await service(mockRequest);

        expect(mockLogger.logPerformance).toHaveBeenCalledWith(
          'InitTransactionService',
          'Transaction initialization completed',
          expect.objectContaining({
            performance: expect.objectContaining({
              duration: expect.any(Number),
            }),
            context: expect.objectContaining({
              presentationId: 'test-presentation-id',
              success: true,
            }),
          })
        );

        expect(mockLogger.logAudit).toHaveBeenCalledWith(
          'InitTransactionService',
          'transaction.initialized',
          expect.objectContaining({
            context: expect.objectContaining({
              presentationId: 'test-presentation-id',
              userAgentType: 'mobile',
              tokenType: 'vp_token',
            }),
          })
        );
      });

      it('should log performance metrics on failure', async () => {
        const requestWithoutUserAgent = new Request(
          'https://verifier.example.com/init',
          {
            method: 'POST',
          }
        );

        try {
          await service(requestWithoutUserAgent);
        } catch {
          // Expected to throw
        }

        expect(mockLogger.logPerformance).toHaveBeenCalledWith(
          'InitTransactionService',
          'Transaction initialization failed',
          expect.objectContaining({
            performance: expect.objectContaining({
              duration: expect.any(Number),
            }),
            context: expect.objectContaining({
              success: false,
              errorType: 'MISSING_USER_AGENT',
            }),
          })
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

        expect(mockLogger.error).toHaveBeenCalledWith(
          'InitTransactionService',
          'Transaction initialization failed with unexpected error',
          expect.objectContaining({
            error: expect.objectContaining({
              name: 'Error',
              message: 'Unexpected error in isMobile',
            }),
          })
        );
      });
    });
  });
});
