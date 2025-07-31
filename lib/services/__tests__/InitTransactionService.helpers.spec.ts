import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockPortsOut } from '../../di/McokPortsOut';
import {
  EphemeralECDHPrivateJwk,
  EphemeralECDHPublicJwk,
  Nonce,
  PresentationId,
} from '../../domain';
import { InitTransactionServiceError } from '../InitTransactionService.errors';
import {
  generateRequest,
  storeTransactionInSession,
  validateUserAgent,
} from '../InitTransactionService.helpers';

/**
 * Test suite for InitTransactionService.helpers
 */
describe('InitTransactionService.helpers', () => {
  let mockPortsOut: MockPortsOut;

  const mockPresentationId = 'test-presentation-id-123' as PresentationId;
  const mockNonce = 'test-nonce-456' as Nonce;
  const mockEphemeralPrivateJwk = new EphemeralECDHPrivateJwk(
    JSON.stringify({
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y',
      d: 'test-d',
    })
  );
  const mockEphemeralPublicJwk = new EphemeralECDHPublicJwk(
    JSON.stringify({
      kty: 'EC',
      crv: 'P-256',
      x: 'test-x',
      y: 'test-y',
    })
  );

  beforeEach(() => {
    mockPortsOut = new MockPortsOut();

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('generateRequest', () => {
    const mockGeneratePresentationDefinition = vi.fn().mockReturnValue({
      id: 'test-pd',
      input_descriptors: [],
    });

    const mockGenerateWalletResponseRedirectUriTemplate = vi
      .fn()
      .mockReturnValue('https://test.com/callback?session={SESSION_ID}');

    const baseParams = {
      publicUrl: 'https://test.com',
      walletResponseRedirectPath: '/callback',
      walletResponseRedirectQueryTemplate: '{SESSION_ID}',
      tokenType: 'vp_token' as const,
      nonce: mockNonce,
      generatePresentationDefinition: mockGeneratePresentationDefinition,
      responseMode: 'direct_post' as const,
      jarMode: 'by_value' as const,
      presentationDefinitionMode: 'by_reference' as const,
      generateWalletResponseRedirectUriTemplate:
        mockGenerateWalletResponseRedirectUriTemplate,
      ephemeralECDHPublicJwk: mockEphemeralPublicJwk,
    };

    describe('Successful request generation', () => {
      it('should generate request for mobile device', () => {
        // Arrange
        const params = { ...baseParams, isMobile: true };

        // Act
        const result = generateRequest(params);

        // Assert
        expect(result).toEqual({
          type: 'vp_token',
          presentation_definition: { id: 'test-pd', input_descriptors: [] },
          ephemeral_ecdh_public_jwk: mockEphemeralPublicJwk.toJSON(),
          nonce: mockNonce,
          response_mode: 'direct_post',
          jar_mode: 'by_value',
          presentation_definition_mode: 'by_reference',
          wallet_response_redirect_uri_template:
            'https://test.com/callback?session={SESSION_ID}',
        });

        expect(
          mockGenerateWalletResponseRedirectUriTemplate
        ).toHaveBeenCalledWith('https://test.com', '/callback', '{SESSION_ID}');
      });

      it('should generate request for desktop device', () => {
        // Arrange
        const params = { ...baseParams, isMobile: false };

        // Act
        const result = generateRequest(params);

        // Assert
        expect(result).toEqual({
          type: 'vp_token',
          presentation_definition: { id: 'test-pd', input_descriptors: [] },
          ephemeral_ecdh_public_jwk: mockEphemeralPublicJwk.toJSON(),
          nonce: mockNonce,
          response_mode: 'direct_post',
          jar_mode: 'by_value',
          presentation_definition_mode: 'by_reference',
          wallet_response_redirect_uri_template: undefined,
        });

        expect(
          mockGenerateWalletResponseRedirectUriTemplate
        ).not.toHaveBeenCalled();
      });

      it('should work with MockPortsOut generatePresentationDefinition', () => {
        // Arrange
        const generatePD = mockPortsOut.generatePresentationDefinition();
        const params = {
          ...baseParams,
          isMobile: false,
          generatePresentationDefinition: generatePD,
        };

        // Act
        const result = generateRequest(params);

        // Assert
        expect(result.presentation_definition).toBeDefined();
        expect(typeof result.presentation_definition).toBe('object');
      });
    });

    describe('Error handling', () => {
      it('should throw error when publicUrl is missing', () => {
        // Arrange
        const params = { ...baseParams, publicUrl: '', isMobile: true };

        // Act & Assert
        expect(() => generateRequest(params)).toThrow(
          InitTransactionServiceError
        );

        const error = (() => {
          try {
            generateRequest(params);
          } catch (e) {
            return e as InitTransactionServiceError;
          }
        })();

        expect(error?.errorType).toBe('INVALID_RESPONSE');
        expect(error?.details).toBe('Required URL parameters are missing');
      });

      it('should throw error when walletResponseRedirectPath is missing', () => {
        // Arrange
        const params = {
          ...baseParams,
          walletResponseRedirectPath: '',
          isMobile: true,
        };

        // Act & Assert
        expect(() => generateRequest(params)).toThrow(
          InitTransactionServiceError
        );
      });

      it('should throw error when walletResponseRedirectQueryTemplate is missing', () => {
        // Arrange
        const params = {
          ...baseParams,
          walletResponseRedirectQueryTemplate: '',
          isMobile: true,
        };

        // Act & Assert
        expect(() => generateRequest(params)).toThrow(
          InitTransactionServiceError
        );
      });
    });

    describe('Parameter validation', () => {
      it('should handle different token types', () => {
        // Arrange
        const params = {
          ...baseParams,
          tokenType: 'id_token' as const,
          isMobile: false,
        };

        // Act
        const result = generateRequest(params);

        // Assert
        expect(result.type).toBe('id_token');
      });

      it('should handle different response modes', () => {
        // Arrange
        const params = {
          ...baseParams,
          responseMode: 'direct_post' as const,
          isMobile: false,
        };

        // Act
        const result = generateRequest(params);

        // Assert
        expect(result.response_mode).toBe('direct_post');
      });

      it('should handle different jar modes', () => {
        // Arrange
        const params = {
          ...baseParams,
          jarMode: 'by_reference' as const,
          isMobile: false,
        };

        // Act
        const result = generateRequest(params);

        // Assert
        expect(result.jar_mode).toBe('by_reference');
      });
    });
  });

  describe('validateUserAgent', () => {
    describe('Successful validation', () => {
      it('should validate valid user agent', () => {
        // Arrange
        const request = new Request('https://test.com', {
          headers: {
            'user-agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        // Act
        const result = validateUserAgent(request);

        // Assert
        expect(result).toBe(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        );
      });

      it('should truncate long user agent strings in logs', () => {
        // Arrange
        const longUserAgent = 'A'.repeat(200);
        const request = new Request('https://test.com', {
          headers: { 'user-agent': longUserAgent },
        });

        // Act
        const result = validateUserAgent(request);

        // Assert
        expect(result).toBe(longUserAgent);
      });
    });

    describe('Error handling', () => {
      it('should throw error when user agent is missing', () => {
        // Arrange
        const request = new Request('https://test.com');

        // Act & Assert
        expect(() => validateUserAgent(request)).toThrow(
          InitTransactionServiceError
        );

        const error = (() => {
          try {
            validateUserAgent(request);
          } catch (e) {
            return e as InitTransactionServiceError;
          }
        })();

        expect(error?.errorType).toBe('MISSING_USER_AGENT');
        expect(error?.details).toBe(
          'User agent header is required to determine device type'
        );
      });

      it('should log security error when user agent is missing', () => {
        // Arrange
        const request = new Request('https://test.com/test-path');

        // Act & Assert
        expect(() => validateUserAgent(request)).toThrow();
      });
    });
  });

  describe('storeTransactionInSession', () => {
    let mockSession: any;

    beforeEach(() => {
      mockSession = mockPortsOut.session();
      vi.spyOn(mockSession, 'set').mockResolvedValue(undefined);
    });

    describe('Successful storage', () => {
      it('should store transaction data successfully', async () => {
        // Act
        await storeTransactionInSession(
          mockSession,
          mockPresentationId,
          mockNonce,
          mockEphemeralPrivateJwk
        );

        // Assert
        expect(mockSession.set).toHaveBeenCalledTimes(3);
        expect(mockSession.set).toHaveBeenCalledWith(
          'presentationId',
          mockPresentationId
        );
        expect(mockSession.set).toHaveBeenCalledWith('nonce', mockNonce);
        expect(mockSession.set).toHaveBeenCalledWith(
          'ephemeralECDHPrivateJwk',
          mockEphemeralPrivateJwk.toJSON()
        );
      });

      it('should work with MockPortsOut session', async () => {
        // Arrange
        const session = mockPortsOut.session();
        vi.spyOn(session, 'set').mockResolvedValue(undefined);

        // Act
        await storeTransactionInSession(
          session,
          mockPresentationId,
          mockNonce,
          mockEphemeralPrivateJwk
        );

        // Assert
        expect(session.set).toHaveBeenCalledTimes(3);
      });
    });

    describe('Error handling', () => {
      it('should handle session storage failure', async () => {
        // Arrange
        const sessionError = new Error('Session storage failed');
        vi.spyOn(mockSession, 'set').mockRejectedValue(sessionError);

        // Act & Assert
        await expect(
          storeTransactionInSession(
            mockSession,
            mockPresentationId,
            mockNonce,
            mockEphemeralPrivateJwk
          )
        ).rejects.toThrow(InitTransactionServiceError);

        const error = await storeTransactionInSession(
          mockSession,
          mockPresentationId,
          mockNonce,
          mockEphemeralPrivateJwk
        ).catch((e) => e as InitTransactionServiceError);

        expect(error?.errorType).toBe('SESSION_ERROR');
        expect(error?.details).toBe(
          'Failed to store transaction data in session'
        );
        expect(error?.originalError).toBe(sessionError);
      });
    });
  });
});
