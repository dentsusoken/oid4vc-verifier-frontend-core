import { describe, expect, it } from 'vitest';
import { InitTransactionServiceError } from '../InitTransactionService.errors';

/**
 * Test suite for InitTransactionService.errors
 */
describe('InitTransactionServiceError', () => {
  describe('Constructor', () => {
    it('should create error with errorType and details', () => {
      const error = new InitTransactionServiceError(
        'INVALID_RESPONSE',
        'Test error message'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(InitTransactionServiceError);
      expect(error.errorType).toBe('INVALID_RESPONSE');
      expect(error.details).toBe('Test error message');
      expect(error.name).toBe('InitTransactionServiceError');
      expect(error.message).toContain('INVALID_RESPONSE');
      expect(error.message).toContain('Test error message');
    });

    it('should create error with errorType, details, and originalError', () => {
      const originalError = new Error('Original error');
      const error = new InitTransactionServiceError(
        'API_REQUEST_FAILED',
        'API request failed',
        originalError
      );

      expect(error.errorType).toBe('API_REQUEST_FAILED');
      expect(error.details).toBe('API request failed');
      expect(error.originalError).toBe(originalError);
    });

    it('should create error without originalError', () => {
      const error = new InitTransactionServiceError(
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
      const error = new InitTransactionServiceError(
        'INVALID_RESPONSE',
        'Invalid response received'
      );

      expect(error.errorType).toBe('INVALID_RESPONSE');
      expect(error.details).toBe('Invalid response received');
      expect(error.message).toContain('INVALID_RESPONSE');
    });

    it('should handle API_REQUEST_FAILED error type', () => {
      const error = new InitTransactionServiceError(
        'API_REQUEST_FAILED',
        'Failed to connect to API'
      );

      expect(error.errorType).toBe('API_REQUEST_FAILED');
      expect(error.details).toBe('Failed to connect to API');
    });

    it('should handle MISSING_USER_AGENT error type', () => {
      const error = new InitTransactionServiceError(
        'MISSING_USER_AGENT',
        'User agent is missing or invalid'
      );

      expect(error.errorType).toBe('MISSING_USER_AGENT');
      expect(error.details).toBe('User agent is missing or invalid');
    });

    it('should handle SESSION_ERROR error type', () => {
      const error = new InitTransactionServiceError(
        'SESSION_ERROR',
        'Failed to store in session'
      );

      expect(error.errorType).toBe('SESSION_ERROR');
      expect(error.details).toBe('Failed to store in session');
    });
  });

  describe('Error properties', () => {
    it('should have correct name property', () => {
      const error = new InitTransactionServiceError(
        'INVALID_RESPONSE',
        'Test error'
      );

      expect(error.name).toBe('InitTransactionServiceError');
    });

    it('should have stack trace', () => {
      const error = new InitTransactionServiceError(
        'INVALID_RESPONSE',
        'Test error'
      );

      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('InitTransactionServiceError');
    });

    it('should be instanceof Error', () => {
      const error = new InitTransactionServiceError(
        'INVALID_RESPONSE',
        'Test error'
      );

      expect(error instanceof Error).toBe(true);
      expect(error instanceof InitTransactionServiceError).toBe(true);
    });
  });

  describe('Error handling', () => {
    it('should be catchable in try-catch', () => {
      let caughtError: any;

      try {
        throw new InitTransactionServiceError('INVALID_RESPONSE', 'Test error');
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError).toBeInstanceOf(InitTransactionServiceError);
      expect(caughtError.errorType).toBe('INVALID_RESPONSE');
      expect(caughtError.details).toBe('Test error');
    });

    it('should work with instanceof checks', () => {
      const error = new InitTransactionServiceError(
        'INVALID_RESPONSE',
        'Test error'
      );

      expect(error instanceof InitTransactionServiceError).toBe(true);
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('Message formatting', () => {
    it('should format message correctly', () => {
      const error = new InitTransactionServiceError(
        'API_REQUEST_FAILED',
        'Network timeout'
      );

      expect(error.message).toBe(
        'InitTransaction Service Error (API_REQUEST_FAILED): Network timeout'
      );
    });

    it('should include errorType and details in message', () => {
      const error = new InitTransactionServiceError(
        'MISSING_USER_AGENT',
        'User agent header missing'
      );

      expect(error.message).toContain('MISSING_USER_AGENT');
      expect(error.message).toContain('User agent header missing');
      expect(error.message).toContain('InitTransaction Service Error');
    });
  });
});
