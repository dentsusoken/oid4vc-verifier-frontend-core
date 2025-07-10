import { describe, expect, it } from 'vitest';
import {
  DefaultFetcher,
  DefaultFetcherError,
  createDefaultFetcher,
  createFetcher,
} from '../DefaultFetcher';
import { defaultIsMobile } from '../DefaultIsMobile';
import * as httpAdapters from '../index';

describe('http adapters index', () => {
  describe('exports', () => {
    it('should export all adapter functions and classes', () => {
      expect(httpAdapters.defaultIsMobile).toBeDefined();
      expect(httpAdapters.DefaultFetcher).toBeDefined();
      expect(httpAdapters.DefaultFetcherError).toBeDefined();
      expect(httpAdapters.createDefaultFetcher).toBeDefined();
      expect(httpAdapters.createFetcher).toBeDefined();
    });

    it('should export correct function and class references', () => {
      expect(httpAdapters.defaultIsMobile).toBe(defaultIsMobile);
      expect(httpAdapters.DefaultFetcher).toBe(DefaultFetcher);
      expect(httpAdapters.DefaultFetcherError).toBe(DefaultFetcherError);
      expect(httpAdapters.createDefaultFetcher).toBe(createDefaultFetcher);
      expect(httpAdapters.createFetcher).toBe(createFetcher);
    });

    it('should export functions and classes with correct types', () => {
      expect(typeof httpAdapters.defaultIsMobile).toBe('function');
      expect(typeof httpAdapters.DefaultFetcher).toBe('function'); // Constructor
      expect(typeof httpAdapters.DefaultFetcherError).toBe('function'); // Constructor
      expect(typeof httpAdapters.createDefaultFetcher).toBe('function');
      expect(typeof httpAdapters.createFetcher).toBe('function');
    });
  });

  describe('module structure', () => {
    it('should have exactly five exports', () => {
      const exportKeys = Object.keys(httpAdapters);
      expect(exportKeys).toHaveLength(5);
      expect(exportKeys).toContain('defaultIsMobile');
      expect(exportKeys).toContain('DefaultFetcher');
      expect(exportKeys).toContain('DefaultFetcherError');
      expect(exportKeys).toContain('createDefaultFetcher');
      expect(exportKeys).toContain('createFetcher');
    });

    it('should not export any undefined values', () => {
      const exportValues = Object.values(httpAdapters);
      for (const value of exportValues) {
        expect(value).toBeDefined();
        expect(value).not.toBeNull();
      }
    });

    it('should be a proper ES module', () => {
      expect(httpAdapters).toBeDefined();
      expect(typeof httpAdapters).toBe('object');
    });
  });

  describe('function accessibility', () => {
    it('should allow calling exported functions', () => {
      // Test mobile detection function
      expect(() => {
        httpAdapters.defaultIsMobile(
          'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
        );
      }).not.toThrow();

      // Test fetcher factory functions
      expect(() => {
        httpAdapters.createDefaultFetcher();
      }).not.toThrow();

      expect(() => {
        httpAdapters.createFetcher();
      }).not.toThrow();
    });

    it('should allow creating instances of exported classes', () => {
      // Test DefaultFetcher instantiation
      expect(() => {
        new httpAdapters.DefaultFetcher();
      }).not.toThrow();

      // Test DefaultFetcherError instantiation
      expect(() => {
        new httpAdapters.DefaultFetcherError(
          'NETWORK_ERROR',
          'Test error',
          'https://example.com'
        );
      }).not.toThrow();
    });
  });

  describe('re-export integrity', () => {
    it('should maintain function identity through re-exports', () => {
      // Verify that re-exported functions maintain their original identity
      const directImportIsMobile = defaultIsMobile;
      const reExportedIsMobile = httpAdapters.defaultIsMobile;

      expect(directImportIsMobile === reExportedIsMobile).toBe(true);
    });

    it('should maintain class identity through re-exports', () => {
      // Verify that re-exported classes maintain their original identity
      const directImportFetcher = DefaultFetcher;
      const reExportedFetcher = httpAdapters.DefaultFetcher;

      expect(directImportFetcher === reExportedFetcher).toBe(true);
    });

    it('should preserve function names through re-exports', () => {
      expect(httpAdapters.defaultIsMobile.name).toBe('defaultIsMobile');
      expect(httpAdapters.createDefaultFetcher.name).toBe(
        'createDefaultFetcher'
      );
      expect(httpAdapters.createFetcher.name).toBe('createFetcher');
    });

    it('should preserve class names through re-exports', () => {
      expect(httpAdapters.DefaultFetcher.name).toBe('DefaultFetcher');
      expect(httpAdapters.DefaultFetcherError.name).toBe('DefaultFetcherError');
    });
  });

  describe('integration scenarios', () => {
    it('should work together in typical usage patterns', () => {
      // Create a fetcher instance
      const fetcher = httpAdapters.createFetcher();
      expect(fetcher).toBeInstanceOf(httpAdapters.DefaultFetcher);

      // Check mobile detection
      const userAgent =
        'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)';
      const isMobile = httpAdapters.defaultIsMobile(userAgent);
      expect(typeof isMobile).toBe('boolean');

      // Verify error class can be used for error handling
      const error = new httpAdapters.DefaultFetcherError(
        'VALIDATION_ERROR',
        'Response validation failed',
        'https://api.example.com/test'
      );
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(httpAdapters.DefaultFetcherError);
    });

    it('should provide consistent interfaces across exports', () => {
      // All factory functions should return compatible instances
      const fetcher1 = httpAdapters.createFetcher();
      const fetcher2 = httpAdapters.createDefaultFetcher();
      const fetcher3 = new httpAdapters.DefaultFetcher();

      expect(fetcher1.constructor).toBe(fetcher2.constructor);
      expect(fetcher2.constructor).toBe(fetcher3.constructor);
    });
  });

  describe('type compatibility', () => {
    it('should maintain TypeScript interface compatibility', () => {
      // Type checking test - ensures exports can be assigned to their types
      const isMobileFunction: typeof defaultIsMobile =
        httpAdapters.defaultIsMobile;
      const fetcherClass: typeof DefaultFetcher = httpAdapters.DefaultFetcher;
      const errorClass: typeof DefaultFetcherError =
        httpAdapters.DefaultFetcherError;

      expect(typeof isMobileFunction).toBe('function');
      expect(typeof fetcherClass).toBe('function');
      expect(typeof errorClass).toBe('function');
    });
  });
});
