import { describe, it, expect } from 'vitest';
import { UrlGenerationError, UrlGenerationException } from './types';

describe('types', () => {
  describe('UrlGenerationError', () => {
    it('should include all expected error types', () => {
      const errorTypes: UrlGenerationError[] = [
        'INVALID_BASE_URL',
        'INVALID_PATH',
        'MISSING_PLACEHOLDER',
        'INVALID_QUERY_PARAMS',
        'MALFORMED_URL',
      ];

      errorTypes.forEach((errorType) => {
        // TypeScriptコンパイル時に型チェックされる
        const error: UrlGenerationError = errorType;
        expect(typeof error).toBe('string');
      });
    });

    it('should be assignable to string', () => {
      const error: UrlGenerationError = 'INVALID_BASE_URL';
      const str: string = error;

      expect(str).toBe('INVALID_BASE_URL');
    });
  });

  describe('UrlGenerationException', () => {
    it('should create exception with all parameters', () => {
      const exception = new UrlGenerationException(
        'INVALID_BASE_URL',
        'The provided URL is not valid',
        'invalid-url'
      );

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(UrlGenerationException);
      expect(exception.errorType).toBe('INVALID_BASE_URL');
      expect(exception.details).toBe('The provided URL is not valid');
      expect(exception.originalUrl).toBe('invalid-url');
      expect(exception.name).toBe('UrlGenerationException');
      expect(exception.message).toBe(
        'URL Generation Error (INVALID_BASE_URL): The provided URL is not valid'
      );
    });

    it('should create exception without originalUrl', () => {
      const exception = new UrlGenerationException(
        'MISSING_PLACEHOLDER',
        'Required placeholder is missing'
      );

      expect(exception.errorType).toBe('MISSING_PLACEHOLDER');
      expect(exception.details).toBe('Required placeholder is missing');
      expect(exception.originalUrl).toBeUndefined();
    });

    it('should handle different error types', () => {
      const errorCases: Array<[UrlGenerationError, string]> = [
        ['INVALID_BASE_URL', 'Base URL is not valid'],
        ['INVALID_PATH', 'Path contains invalid characters'],
        ['MISSING_PLACEHOLDER', 'Required placeholder not found'],
        ['INVALID_QUERY_PARAMS', 'Query parameters are malformed'],
        ['MALFORMED_URL', 'Generated URL is malformed'],
      ];

      errorCases.forEach(([errorType, details]) => {
        const exception = new UrlGenerationException(errorType, details);

        expect(exception.errorType).toBe(errorType);
        expect(exception.details).toBe(details);
        expect(exception.message).toContain(errorType);
        expect(exception.message).toContain(details);
      });
    });

    it('should be catchable as Error', () => {
      const throwException = () => {
        throw new UrlGenerationException('INVALID_BASE_URL', 'Test error');
      };

      expect(() => throwException()).toThrow(Error);
      expect(() => throwException()).toThrow(UrlGenerationException);

      try {
        throwException();
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(UrlGenerationException);
        expect((error as UrlGenerationException).errorType).toBe(
          'INVALID_BASE_URL'
        );
      }
    });

    it('should preserve error properties when thrown and caught', () => {
      const originalUrl = 'https://invalid.test.com';
      const errorType: UrlGenerationError = 'MALFORMED_URL';
      const details = 'URL structure is invalid';

      try {
        throw new UrlGenerationException(errorType, details, originalUrl);
      } catch (error) {
        const caughtError = error as UrlGenerationException;

        expect(caughtError.errorType).toBe(errorType);
        expect(caughtError.details).toBe(details);
        expect(caughtError.originalUrl).toBe(originalUrl);
        expect(caughtError.name).toBe('UrlGenerationException');
      }
    });

    it('should generate appropriate error messages', () => {
      const testCases = [
        {
          errorType: 'INVALID_BASE_URL' as UrlGenerationError,
          details: 'URL must start with https://',
          expectedMessage:
            'URL Generation Error (INVALID_BASE_URL): URL must start with https://',
        },
        {
          errorType: 'MISSING_PLACEHOLDER' as UrlGenerationError,
          details: 'SESSION_ID placeholder not found',
          expectedMessage:
            'URL Generation Error (MISSING_PLACEHOLDER): SESSION_ID placeholder not found',
        },
      ];

      testCases.forEach(({ errorType, details, expectedMessage }) => {
        const exception = new UrlGenerationException(errorType, details);
        expect(exception.message).toBe(expectedMessage);
      });
    });

    it('should handle special characters in details', () => {
      const details = 'Error with special chars: {}[]()&=?#';
      const exception = new UrlGenerationException('MALFORMED_URL', details);

      expect(exception.details).toBe(details);
      expect(exception.message).toContain(details);
    });

    it('should handle very long error messages', () => {
      const longDetails = 'A'.repeat(1000);
      const exception = new UrlGenerationException(
        'INVALID_QUERY_PARAMS',
        longDetails
      );

      expect(exception.details).toBe(longDetails);
      expect(exception.message.length).toBeGreaterThan(1000);
    });
  });
});
