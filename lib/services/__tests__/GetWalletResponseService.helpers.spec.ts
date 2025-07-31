import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MockPortsOut } from '../../di/McokPortsOut';
import { PresentationId } from '../../domain';
import { GetWalletResponseServiceError } from '../GetWalletResponseService.errors';
import { getPresentationIdFromSession } from '../GetWalletResponseService.helpers';

/**
 * Test suite for GetWalletResponseService.helpers
 */
describe('GetWalletResponseService.helpers', () => {
  let mockPortsOut: MockPortsOut;
  let mockSession: any;

  const mockPresentationId = 'test-presentation-id-123' as PresentationId;

  beforeEach(() => {
    mockPortsOut = new MockPortsOut();
    mockSession = mockPortsOut.session();

    // Reset mocks
    vi.clearAllMocks();
  });

  describe('getPresentationIdFromSession', () => {
    describe('Successful retrieval', () => {
      it('should retrieve presentation ID from session successfully', async () => {
        // Arrange
        vi.spyOn(mockSession, 'get').mockResolvedValue(mockPresentationId);

        // Act
        const result = await getPresentationIdFromSession(mockSession);

        // Assert
        expect(result).toBe(mockPresentationId);
        expect(mockSession.get).toHaveBeenCalledWith('presentationId');
      });

      it('should handle valid presentation ID types', async () => {
        // Arrange
        const validPresentationId = 'valid-id-456' as PresentationId;
        vi.spyOn(mockSession, 'get').mockResolvedValue(validPresentationId);

        // Act
        const result = await getPresentationIdFromSession(mockSession);

        // Assert
        expect(result).toBe(validPresentationId);
        expect(typeof result).toBe('string');
      });
    });

    describe('Error handling', () => {
      it('should throw error when presentation ID is null', async () => {
        // Arrange
        vi.spyOn(mockSession, 'get').mockResolvedValue(null);
        vi.spyOn(mockSession, 'keys').mockResolvedValue(['nonce', 'otherKey']);

        // Act & Assert
        await expect(getPresentationIdFromSession(mockSession)).rejects.toThrow(
          GetWalletResponseServiceError
        );
      });

      it('should throw error when presentation ID is undefined', async () => {
        // Arrange
        vi.spyOn(mockSession, 'get').mockResolvedValue(undefined);
        vi.spyOn(mockSession, 'keys').mockResolvedValue([]);

        // Act & Assert
        await expect(getPresentationIdFromSession(mockSession)).rejects.toThrow(
          GetWalletResponseServiceError
        );

        const thrownError = await getPresentationIdFromSession(
          mockSession
        ).catch((error) => error);

        expect(thrownError).toBeInstanceOf(GetWalletResponseServiceError);
        expect(thrownError.errorType).toBe('MISSING_PRESENTATION_ID');
        expect(thrownError.details).toContain(
          'Presentation ID not found in session'
        );
      });

      it('should handle session.keys() failure gracefully', async () => {
        // Arrange
        vi.spyOn(mockSession, 'get').mockResolvedValue(null);
        vi.spyOn(mockSession, 'keys').mockRejectedValue(
          new Error('Session keys failed')
        );

        // Act & Assert
        await expect(getPresentationIdFromSession(mockSession)).rejects.toThrow(
          GetWalletResponseServiceError
        );
      });

      it('should handle non-Error objects in session.keys() failure', async () => {
        // Arrange
        vi.spyOn(mockSession, 'get').mockResolvedValue(null);
        vi.spyOn(mockSession, 'keys').mockRejectedValue('String error');

        // Act & Assert
        await expect(getPresentationIdFromSession(mockSession)).rejects.toThrow(
          GetWalletResponseServiceError
        );
      });
    });

    describe('Session integration', () => {
      it('should work with MockPortsOut session', async () => {
        // Arrange
        const session = mockPortsOut.session();
        vi.spyOn(session, 'get').mockResolvedValue(mockPresentationId);

        // Act
        const result = await getPresentationIdFromSession(session);

        // Assert
        expect(result).toBe(mockPresentationId);
        expect(session.get).toHaveBeenCalledWith('presentationId');
      });

      it('should handle empty session gracefully', async () => {
        // Arrange
        const session = mockPortsOut.session();
        vi.spyOn(session, 'get').mockResolvedValue(undefined);
        vi.spyOn(session, 'keys').mockResolvedValue([]);

        // Act & Assert
        await expect(getPresentationIdFromSession(session)).rejects.toThrow(
          GetWalletResponseServiceError
        );
      });
    });

    describe('Error properties validation', () => {
      it('should throw error with correct properties', async () => {
        // Arrange
        vi.spyOn(mockSession, 'get').mockResolvedValue(null);
        vi.spyOn(mockSession, 'keys').mockResolvedValue([]);

        // Act & Assert
        let caughtError: GetWalletResponseServiceError | null = null;
        try {
          await getPresentationIdFromSession(mockSession);
        } catch (error) {
          caughtError = error as GetWalletResponseServiceError;
        }

        expect(caughtError).toBeInstanceOf(GetWalletResponseServiceError);
        expect(caughtError?.errorType).toBe('MISSING_PRESENTATION_ID');
        expect(caughtError?.details).toBe(
          'Presentation ID not found in session. The session may have expired or the transaction was not properly initialized.'
        );
        expect(caughtError?.name).toBe('GetWalletResponseServiceError');
      });
    });
  });
});
