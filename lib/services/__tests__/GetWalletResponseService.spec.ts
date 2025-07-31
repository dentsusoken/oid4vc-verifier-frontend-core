import { beforeEach, describe, expect, it, vi } from 'vitest';
import { JarmOption } from '../../domain';
import { createGetWalletResponseService } from '../GetWalletResponseService';
import { GetWalletResponseServiceError } from '../GetWalletResponseService.errors';

describe('GetWalletResponseService', () => {
  let mockSession: any;
  let mockGet: any;
  let mockMdocVerifier: any;
  let mockVerifyJarmJwt: any;

  beforeEach(() => {
    vi.clearAllMocks();

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
          mdocVerifier: mockMdocVerifier,
          verifyJarmJwt: mockVerifyJarmJwt,
          jarmOption: new JarmOption.Encrypted('ECDH-ES', 'A256GCM'),
        });

        expect(typeof service).toBe('function');
      });

      it('should throw error when apiBaseUrl is missing', () => {
        expect(() =>
          createGetWalletResponseService({
            apiBaseUrl: '',
            apiPath: '/v1/transactions',
            get: mockGet,
            session: mockSession,
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
            mdocVerifier: null as any,
            verifyJarmJwt: mockVerifyJarmJwt,
            jarmOption: new JarmOption.Encrypted('ECDH-ES', 'A256GCM'),
          })
        ).toThrow(GetWalletResponseServiceError);
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
      });
    });
  });
});
