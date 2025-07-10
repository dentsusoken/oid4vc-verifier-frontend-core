import { describe, expect, it } from 'vitest';
import { GetWalletResponseServiceError } from '../GetWalletResponseService.errors';

/**
 * Test suite for GetWalletResponseService.errors
 */
describe('GetWalletResponseServiceError', () => {
  describe('Constructor', () => {
    it('should create error with errorType and details', () => {
      const error = new GetWalletResponseServiceError(
        'INVALID_RESPONSE',
        'Test error message'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(GetWalletResponseServiceError);
      expect(error.errorType).toBe('INVALID_RESPONSE');
      expect(error.details).toBe('Test error message');
      expect(error.name).toBe('GetWalletResponseServiceError');
      expect(error.message).toContain('INVALID_RESPONSE');
      expect(error.message).toContain('Test error message');
    });

    it('should create error with errorType, details, and originalError', () => {
      const originalError = new Error('Original error');
      const error = new GetWalletResponseServiceError(
        'API_REQUEST_FAILED',
        'API request failed',
        originalError
      );

      expect(error.errorType).toBe('API_REQUEST_FAILED');
      expect(error.details).toBe('API request failed');
      expect(error.originalError).toBe(originalError);
    });

    it('should create error without originalError', () => {
      const error = new GetWalletResponseServiceError(
        'INVALID_RESPONSE',
        'Test error message'
      );

      expect(error.errorType).toBe('INVALID_RESPONSE');
      expect(error.details).toBe('Test error message');
      expect(error.originalError).toBeUndefined();
    });
  });

  describe('Error types', () => {
    it('should handle INVALID_RESPONSE error type', () => {
      const error = new GetWalletResponseServiceError(
        'INVALID_RESPONSE',
        'Invalid response received'
      );

      expect(error.errorType).toBe('INVALID_RESPONSE');
      expect(error.details).toBe('Invalid response received');
      expect(error.message).toContain('INVALID_RESPONSE');
    });

    it('should handle API_REQUEST_FAILED error type', () => {
      const error = new GetWalletResponseServiceError(
        'API_REQUEST_FAILED',
        'Failed to connect to API'
      );

      expect(error.errorType).toBe('API_REQUEST_FAILED');
      expect(error.details).toBe('Failed to connect to API');
    });

    it('should handle SESSION_ERROR error type', () => {
      const error = new GetWalletResponseServiceError(
        'SESSION_ERROR',
        'Session data not found'
      );

      expect(error.errorType).toBe('SESSION_ERROR');
      expect(error.details).toBe('Session data not found');
    });

    it('should handle MISSING_PRESENTATION_ID error type', () => {
      const error = new GetWalletResponseServiceError(
        'MISSING_PRESENTATION_ID',
        'Presentation ID missing'
      );

      expect(error.errorType).toBe('MISSING_PRESENTATION_ID');
      expect(error.details).toBe('Presentation ID missing');
    });

    it('should handle MISSING_VP_TOKEN error type', () => {
      const error = new GetWalletResponseServiceError(
        'MISSING_VP_TOKEN',
        'VP token missing'
      );

      expect(error.errorType).toBe('MISSING_VP_TOKEN');
      expect(error.details).toBe('VP token missing');
    });

    it('should handle MISSING_EPHEMERAL_ECDH_PRIVATE_JWK error type', () => {
      const error = new GetWalletResponseServiceError(
        'MISSING_EPHEMERAL_ECDH_PRIVATE_JWK',
        'Ephemeral key missing'
      );

      expect(error.errorType).toBe('MISSING_EPHEMERAL_ECDH_PRIVATE_JWK');
      expect(error.details).toBe('Ephemeral key missing');
    });
  });

  describe('Error properties', () => {
    it('should have correct name property', () => {
      const error = new GetWalletResponseServiceError(
        'INVALID_RESPONSE',
        'Test error'
      );

      expect(error.name).toBe('GetWalletResponseServiceError');
    });

    it('should have stack trace', () => {
      const error = new GetWalletResponseServiceError(
        'INVALID_RESPONSE',
        'Test error'
      );

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('GetWalletResponseServiceError');
    });

    it('should be instanceof Error', () => {
      const error = new GetWalletResponseServiceError(
        'INVALID_RESPONSE',
        'Test error'
      );

      expect(error instanceof Error).toBe(true);
      expect(error instanceof GetWalletResponseServiceError).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should be catchable in try-catch', () => {
      let caughtError: any;

      try {
        throw new GetWalletResponseServiceError(
          'INVALID_RESPONSE',
          'Test error'
        );
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError).toBeInstanceOf(GetWalletResponseServiceError);
      expect(caughtError.errorType).toBe('INVALID_RESPONSE');
      expect(caughtError.details).toBe('Test error');
    });

    it('should work with instanceof checks', () => {
      const error = new GetWalletResponseServiceError(
        'INVALID_RESPONSE',
        'Test error'
      );

      expect(error instanceof GetWalletResponseServiceError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('Message formatting', () => {
    it('should format message correctly', () => {
      const error = new GetWalletResponseServiceError(
        'API_REQUEST_FAILED',
        'Network timeout'
      );

      expect(error.message).toBe(
        'GetWalletResponse Service Error (API_REQUEST_FAILED): Network timeout'
      );
    });

    it('should include errorType and details in message', () => {
      const error = new GetWalletResponseServiceError(
        'SESSION_ERROR',
        'Session expired'
      );

      expect(error.message).toContain('SESSION_ERROR');
      expect(error.message).toContain('Session expired');
      expect(error.message).toContain('GetWalletResponse Service Error');
    });
  });
});
