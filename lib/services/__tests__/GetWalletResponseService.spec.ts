import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JarmOption } from '../../domain';
import { createGetWalletResponseService } from '../GetWalletResponseService';
import { GetWalletResponseServiceError } from '../GetWalletResponseService.errors';

describe('GetWalletResponseService', () => {
  let mockLogger: any;
  let mockSession: any;
  let mockGet: any;
  let mockMdocVerifier: any;
  let mockVerifyJarmJwt: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock logger
    mockLogger = {
      info: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
      warn: vi.fn(),
      logSecurity: vi.fn(),
      logAudit: vi.fn(),
      logPerformance: vi.fn(),
    };

    // Create mock session
    mockSession = {
      get: vi.fn(),
      set: vi.fn(),
      keys: vi.fn(),
    };

    // Create mock GET function
    mockGet = vi.fn();

    // Create mock MDOC verifier
    mockMdocVerifier = {
      verify: vi.fn(),
    };

    // Create mock JARM JWT verifier
    mockVerifyJarmJwt = vi.fn();
  });

  describe('createGetWalletResponseService', () => {
    describe('Configuration validation', () => {
      it('should create service successfully with valid configuration', () => {
        const service = createGetWalletResponseService({
          apiBaseUrl: 'https://api.example.com',
          apiPath: '/v1/transactions',
          get: mockGet,
          session: mockSession,
          logger: mockLogger,
          mdocVerifier: mockMdocVerifier,
          verifyJarmJwt: mockVerifyJarmJwt,
          jarmOption: new JarmOption.Encrypted('ECDH-ES', 'A256GCM'),
        });

        expect(typeof service).toBe('function');
        expect(mockLogger.info).toHaveBeenCalledWith(
          'GetWalletResponseService',
          'Service created successfully',
          expect.objectContaining({
            context: expect.objectContaining({
              apiBaseUrl: 'https://api.example.com',
              apiPath: '/v1/transactions',
              hasMdocVerifier: true,
              hasVerifyJarmJwt: true,
              hasJarmOption: true,
            }),
          })
        );
      });

      it('should throw error when apiBaseUrl is missing', () => {
        expect(() =>
          createGetWalletResponseService({
            apiBaseUrl: '',
            apiPath: '/v1/transactions',
            get: mockGet,
            session: mockSession,
            logger: mockLogger,
            mdocVerifier: mockMdocVerifier,
            verifyJarmJwt: mockVerifyJarmJwt,
            jarmOption: new JarmOption.Encrypted('ECDH-ES', 'A256GCM'),
          })
        ).toThrow(GetWalletResponseServiceError);
      });

      it('should throw error when apiPath is missing', () => {
        expect(() =>
          createGetWalletResponseService({
            apiBaseUrl: 'https://api.example.com',
            apiPath: '',
            get: mockGet,
            session: mockSession,
            logger: mockLogger,
            mdocVerifier: mockMdocVerifier,
            verifyJarmJwt: mockVerifyJarmJwt,
            jarmOption: new JarmOption.Encrypted('ECDH-ES', 'A256GCM'),
          })
        ).toThrow(GetWalletResponseServiceError);
      });

      it('should throw error when mdocVerifier is missing', () => {
        expect(() =>
          createGetWalletResponseService({
            apiBaseUrl: 'https://api.example.com',
            apiPath: '/v1/transactions',
            get: mockGet,
            session: mockSession,
            logger: mockLogger,
            mdocVerifier: null as any,
            verifyJarmJwt: mockVerifyJarmJwt,
            jarmOption: new JarmOption.Encrypted('ECDH-ES', 'A256GCM'),
          })
        ).toThrow(GetWalletResponseServiceError);
      });

      it('should log error when configuration is invalid', () => {
        try {
          createGetWalletResponseService({
            apiBaseUrl: '',
            apiPath: '',
            get: mockGet,
            session: mockSession,
            logger: mockLogger,
            mdocVerifier: null as any,
            verifyJarmJwt: null as any,
            jarmOption: null as any,
          });
        } catch {
          // Expected to throw
        }

        expect(mockLogger.error).toHaveBeenCalledWith(
          'GetWalletResponseService',
          'Invalid configuration provided',
          expect.objectContaining({
            context: expect.objectContaining({
              hasApiBaseUrl: false,
              hasApiPath: false,
              hasMdocVerifier: false,
              hasVerifyJarmJwt: false,
              hasJarmOption: false,
            }),
          })
        );
      });
    });

    describe('Service function execution', () => {
      let service: ReturnType<typeof createGetWalletResponseService>;

      beforeEach(() => {
        service = createGetWalletResponseService({
          apiBaseUrl: 'https://api.example.com',
          apiPath: '/v1/transactions',
          get: mockGet,
          session: mockSession,
          logger: mockLogger,
          mdocVerifier: mockMdocVerifier,
          verifyJarmJwt: mockVerifyJarmJwt,
          jarmOption: new JarmOption.Encrypted('ECDH-ES', 'A256GCM'),
        });

        // Setup session with presentation ID and ephemeral key
        mockSession.keys.mockResolvedValue([
          'presentationId',
          'ephemeralECDHPrivateJwk',
        ]);
        mockSession.get.mockImplementation((key: string) => {
          if (key === 'presentationId') {
            return Promise.resolve('test-presentation-id');
          }
          if (key === 'ephemeralECDHPrivateJwk') {
            return Promise.resolve('{"kty":"EC","d":"test-private-key"}');
          }
          return Promise.resolve(null);
        });
      });

      it('should execute service successfully without response code', async () => {
        // Setup mocks
        const mockApiResponse = {
          data: {
            state: 'test-state',
            response: 'encrypted-jarm-response',
          },
          metadata: {
            status: 200,
            statusText: 'OK',
            headers: {},
            url: '',
            ok: true,
          },
        };
        mockGet.mockResolvedValue(mockApiResponse);

        const mockAuthResponse = {
          vpToken: 'test-vp-token',
          idToken: null,
          error: null,
        };
        mockVerifyJarmJwt.mockResolvedValue({
          isFailure: () => false,
          value: mockAuthResponse,
        });

        const mockMdocResult = {
          valid: true,
          documents: [{ credential: 'test-credential' }],
        };
        mockMdocVerifier.verify.mockResolvedValue(mockMdocResult);

        // Execute service
        const result = await service();

        // Verify API call
        expect(mockGet).toHaveBeenCalledWith(
          'https://api.example.com',
          '/v1/transactions/test-presentation-id',
          {},
          expect.any(Object) // GetWalletResponseResponseSchema
        );

        // Verify result
        expect(result).toEqual({
          valid: true,
          documents: [{ credential: 'test-credential' }],
          vpToken: 'test-vp-token',
        });
      });

      it('should execute service successfully with response code', async () => {
        // Setup mocks
        const mockApiResponse = {
          data: {
            state: 'test-state',
            response: 'encrypted-jarm-response',
          },
          metadata: {
            status: 200,
            statusText: 'OK',
            headers: {},
            url: '',
            ok: true,
          },
        };
        mockGet.mockResolvedValue(mockApiResponse);

        const mockAuthResponse = {
          vpToken: 'test-vp-token',
          idToken: null,
          error: null,
        };
        mockVerifyJarmJwt.mockResolvedValue({
          isFailure: () => false,
          value: mockAuthResponse,
        });

        const mockMdocResult = {
          valid: true,
          documents: [{ credential: 'test-credential' }],
        };
        mockMdocVerifier.verify.mockResolvedValue(mockMdocResult);

        // Execute service with response code
        const result = await service('test-response-code');

        // Verify API call with query parameters
        expect(mockGet).toHaveBeenCalledWith(
          'https://api.example.com',
          '/v1/transactions/test-presentation-id',
          { response_code: 'test-response-code' },
          expect.any(Object)
        );

        // Verify result
        expect(result).toEqual({
          valid: true,
          documents: [{ credential: 'test-credential' }],
          vpToken: 'test-vp-token',
        });
      });

      it('should throw error when API request fails', async () => {
        const apiError = new Error('Network error');
        mockGet.mockRejectedValue(apiError);

        await expect(service()).rejects.toThrow(GetWalletResponseServiceError);
        await expect(service()).rejects.toThrow(
          'Failed to communicate with GetWalletResponse API'
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          'GetWalletResponseService',
          'API request failed',
          expect.objectContaining({
            error: expect.objectContaining({
              name: 'Error',
              message: 'Network error',
            }),
          })
        );
      });

      it('should throw error when VP token is missing', async () => {
        // Setup mocks
        const mockApiResponse = {
          data: { state: 'test-state', response: 'encrypted-jarm-response' },
          metadata: {
            status: 200,
            statusText: 'OK',
            headers: {},
            url: '',
            ok: true,
          },
        };
        mockGet.mockResolvedValue(mockApiResponse);

        const mockAuthResponse = {
          vpToken: null, // Missing VP token
          idToken: 'test-id-token',
          error: null,
        };
        mockVerifyJarmJwt.mockResolvedValue({
          isFailure: () => false,
          value: mockAuthResponse,
        });

        await expect(service()).rejects.toThrow(GetWalletResponseServiceError);
        await expect(service()).rejects.toThrow(
          'VP token is required for MDOC verification'
        );

        expect(mockLogger.logSecurity).toHaveBeenCalledWith(
          'error',
          'GetWalletResponseService',
          'VP token not found in wallet response',
          expect.any(Object)
        );
      });

      it('should throw error when ephemeral ECDH private JWK is missing from session', async () => {
        // Setup session without ephemeral key
        mockSession.get.mockImplementation((key: string) => {
          if (key === 'presentationId') {
            return Promise.resolve('test-presentation-id');
          }
          if (key === 'ephemeralECDHPrivateJwk') {
            return Promise.resolve(null); // Missing ephemeral key
          }
          return Promise.resolve(null);
        });

        const mockApiResponse = {
          data: { state: 'test-state', response: 'encrypted-jarm-response' },
          metadata: {
            status: 200,
            statusText: 'OK',
            headers: {},
            url: '',
            ok: true,
          },
        };
        mockGet.mockResolvedValue(mockApiResponse);

        await expect(service()).rejects.toThrow(GetWalletResponseServiceError);
        await expect(service()).rejects.toThrow(
          'Ephemeral ECDH private JWK not found in session'
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          'GetWalletResponseService',
          'Ephemeral ECDH private JWK not found in session',
          expect.any(Object)
        );
      });

      it('should handle MDOC verification failure', async () => {
        // Setup mocks
        const mockApiResponse = {
          data: { state: 'test-state', response: 'encrypted-jarm-response' },
          metadata: {
            status: 200,
            statusText: 'OK',
            headers: {},
            url: '',
            ok: true,
          },
        };
        mockGet.mockResolvedValue(mockApiResponse);

        const mockAuthResponse = {
          vpToken: 'test-vp-token',
          idToken: null,
          error: null,
        };
        mockVerifyJarmJwt.mockResolvedValue({
          isFailure: () => false,
          value: mockAuthResponse,
        });

        const mockMdocResult = {
          valid: false, // Verification failed
          documents: [],
        };
        mockMdocVerifier.verify.mockResolvedValue(mockMdocResult);

        // Execute service
        const result = await service();

        // Should return the failed result
        expect(result).toEqual({
          valid: false,
          documents: [],
          vpToken: 'test-vp-token',
        });

        expect(mockLogger.logSecurity).toHaveBeenCalledWith(
          'error',
          'GetWalletResponseService',
          'MDOC verification failed',
          expect.any(Object)
        );
      });

      it('should throw error when MDOC verification throws', async () => {
        // Setup mocks
        const mockApiResponse = {
          data: { state: 'test-state', response: 'encrypted-jarm-response' },
          metadata: {
            status: 200,
            statusText: 'OK',
            headers: {},
            url: '',
            ok: true,
          },
        };
        mockGet.mockResolvedValue(mockApiResponse);

        const mockAuthResponse = {
          vpToken: 'test-vp-token',
          idToken: null,
          error: null,
        };
        mockVerifyJarmJwt.mockResolvedValue({
          isFailure: () => false,
          value: mockAuthResponse,
        });

        const verificationError = new Error('MDOC verification error');
        mockMdocVerifier.verify.mockRejectedValue(verificationError);

        await expect(service()).rejects.toThrow(GetWalletResponseServiceError);
        await expect(service()).rejects.toThrow(
          'MDOC verification failed due to technical error'
        );

        expect(mockLogger.error).toHaveBeenCalledWith(
          'GetWalletResponseService',
          'MDOC verification error',
          expect.objectContaining({
            error: expect.objectContaining({
              name: 'Error',
              message: 'MDOC verification error',
            }),
          })
        );
      });

      it('should log performance metrics on success', async () => {
        // Setup successful execution
        const mockApiResponse = {
          data: { state: 'test-state', response: 'encrypted-jarm-response' },
          metadata: {
            status: 200,
            statusText: 'OK',
            headers: {},
            url: '',
            ok: true,
          },
        };
        mockGet.mockResolvedValue(mockApiResponse);

        const mockAuthResponse = {
          vpToken: 'test-vp-token',
          idToken: null,
          error: null,
        };
        mockVerifyJarmJwt.mockResolvedValue({
          isFailure: () => false,
          value: mockAuthResponse,
        });

        const mockMdocResult = {
          valid: true,
          documents: [{ credential: 'test-credential' }],
        };
        mockMdocVerifier.verify.mockResolvedValue(mockMdocResult);

        await service();

        expect(mockLogger.logPerformance).toHaveBeenCalledWith(
          'GetWalletResponseService',
          'Wallet response retrieval and verification completed',
          expect.objectContaining({
            performance: expect.objectContaining({
              duration: expect.any(Number),
            }),
            context: expect.objectContaining({
              presentationId: 'test-presentation-id',
              success: true,
              verificationResult: true,
            }),
          })
        );
      });

      it('should log performance metrics on failure', async () => {
        const apiError = new Error('Network error');
        mockGet.mockRejectedValue(apiError);

        try {
          await service();
        } catch {
          // Expected to throw
        }

        expect(mockLogger.logPerformance).toHaveBeenCalledWith(
          'GetWalletResponseService',
          'Wallet response retrieval failed',
          expect.objectContaining({
            performance: expect.objectContaining({
              duration: expect.any(Number),
            }),
            context: expect.objectContaining({
              success: false,
              errorType: 'API_REQUEST_FAILED',
            }),
          })
        );
      });
    });
  });
});
