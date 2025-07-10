import { describe, expect, it } from 'vitest';
import {
  createDefaultLogger,
  createDevelopmentLogger,
  createLogger,
  createProductionLogger,
  DefaultLogger,
} from '../DefaultLogger';
import * as loggingAdapters from '../index';

describe('logging adapters index', () => {
  describe('exports', () => {
    it('should export all logger functions and classes', () => {
      expect(loggingAdapters.createDefaultLogger).toBeDefined();
      expect(loggingAdapters.createDevelopmentLogger).toBeDefined();
      expect(loggingAdapters.createLogger).toBeDefined();
      expect(loggingAdapters.createProductionLogger).toBeDefined();
      expect(loggingAdapters.DefaultLogger).toBeDefined();
    });

    it('should export correct function and class references', () => {
      expect(loggingAdapters.createDefaultLogger).toBe(createDefaultLogger);
      expect(loggingAdapters.createDevelopmentLogger).toBe(
        createDevelopmentLogger
      );
      expect(loggingAdapters.createLogger).toBe(createLogger);
      expect(loggingAdapters.createProductionLogger).toBe(
        createProductionLogger
      );
      expect(loggingAdapters.DefaultLogger).toBe(DefaultLogger);
    });

    it('should export functions and classes with correct types', () => {
      expect(typeof loggingAdapters.createDefaultLogger).toBe('function');
      expect(typeof loggingAdapters.createDevelopmentLogger).toBe('function');
      expect(typeof loggingAdapters.createLogger).toBe('function');
      expect(typeof loggingAdapters.createProductionLogger).toBe('function');
      expect(typeof loggingAdapters.DefaultLogger).toBe('function'); // Constructor
    });
  });

  describe('module structure', () => {
    it('should have exactly five exports', () => {
      const exportKeys = Object.keys(loggingAdapters);
      expect(exportKeys).toHaveLength(5);
      expect(exportKeys).toContain('createDefaultLogger');
      expect(exportKeys).toContain('createDevelopmentLogger');
      expect(exportKeys).toContain('createLogger');
      expect(exportKeys).toContain('createProductionLogger');
      expect(exportKeys).toContain('DefaultLogger');
    });

    it('should not export any undefined values', () => {
      const exportValues = Object.values(loggingAdapters);
      for (const value of exportValues) {
        expect(value).toBeDefined();
        expect(value).not.toBeNull();
      }
    });

    it('should be a proper ES module', () => {
      expect(loggingAdapters).toBeDefined();
      expect(typeof loggingAdapters).toBe('object');
    });
  });

  describe('function accessibility', () => {
    it('should allow calling exported factory functions', () => {
      const config = {
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'info' as const,
        includeTimestamp: true,
        includeMetadata: true,
      };

      // Test factory functions
      expect(() => {
        loggingAdapters.createDefaultLogger(config);
      }).not.toThrow();

      expect(() => {
        loggingAdapters.createDevelopmentLogger();
      }).not.toThrow();

      expect(() => {
        loggingAdapters.createLogger();
      }).not.toThrow();

      expect(() => {
        loggingAdapters.createProductionLogger();
      }).not.toThrow();
    });

    it('should allow creating instances of exported classes', () => {
      const config = {
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'info' as const,
        includeTimestamp: true,
        includeMetadata: true,
      };

      // Test DefaultLogger instantiation
      expect(() => {
        new loggingAdapters.DefaultLogger(config);
      }).not.toThrow();
    });
  });

  describe('re-export integrity', () => {
    it('should maintain function identity through re-exports', () => {
      // Verify that re-exported functions maintain their original identity
      const directImportCreateLogger = createLogger;
      const reExportedCreateLogger = loggingAdapters.createLogger;

      expect(directImportCreateLogger === reExportedCreateLogger).toBe(true);
    });

    it('should maintain class identity through re-exports', () => {
      // Verify that re-exported classes maintain their original identity
      const directImportDefaultLogger = DefaultLogger;
      const reExportedDefaultLogger = loggingAdapters.DefaultLogger;

      expect(directImportDefaultLogger === reExportedDefaultLogger).toBe(true);
    });

    it('should preserve function names through re-exports', () => {
      expect(loggingAdapters.createDefaultLogger.name).toBe(
        'createDefaultLogger'
      );
      expect(loggingAdapters.createDevelopmentLogger.name).toBe(
        'createDevelopmentLogger'
      );
      expect(loggingAdapters.createLogger.name).toBe('createLogger');
      expect(loggingAdapters.createProductionLogger.name).toBe(
        'createProductionLogger'
      );
    });

    it('should preserve class names through re-exports', () => {
      expect(loggingAdapters.DefaultLogger.name).toBe('DefaultLogger');
    });
  });

  describe('integration scenarios', () => {
    it('should work together in typical usage patterns', () => {
      // Create different types of loggers
      const defaultLogger = loggingAdapters.createDefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'info',
        includeTimestamp: true,
        includeMetadata: true,
      });

      const productionLogger = loggingAdapters.createProductionLogger();
      const developmentLogger = loggingAdapters.createDevelopmentLogger();
      const genericLogger = loggingAdapters.createLogger();

      expect(defaultLogger).toBeInstanceOf(loggingAdapters.DefaultLogger);
      expect(productionLogger).toBeInstanceOf(loggingAdapters.DefaultLogger);
      expect(developmentLogger).toBeInstanceOf(loggingAdapters.DefaultLogger);
      expect(genericLogger).toBeInstanceOf(loggingAdapters.DefaultLogger);
    });

    it('should provide consistent interfaces across exports', () => {
      // All factory functions should return compatible instances
      const logger1 = loggingAdapters.createLogger();
      const logger2 = loggingAdapters.createProductionLogger();
      const logger3 = loggingAdapters.createDevelopmentLogger();

      expect(logger1.constructor).toBe(logger2.constructor);
      expect(logger2.constructor).toBe(logger3.constructor);
    });

    it('should support configuration variations', () => {
      // Test different configuration combinations
      const minimalLogger = loggingAdapters.createLogger({
        minLevel: 'error',
        processLogging: false,
      });

      const verboseLogger = loggingAdapters.createLogger({
        minLevel: 'debug',
        processLogging: true,
        secretLogging: true,
        includeTimestamp: true,
        includeMetadata: true,
      });

      expect(minimalLogger.config.minLevel).toBe('error');
      expect(minimalLogger.config.processLogging).toBe(false);
      expect(verboseLogger.config.minLevel).toBe('debug');
      expect(verboseLogger.config.secretLogging).toBe(true);
    });
  });

  describe('type compatibility', () => {
    it('should maintain TypeScript interface compatibility', () => {
      // Type checking test - ensures exports can be assigned to their types
      const defaultLoggerFunction: typeof createDefaultLogger =
        loggingAdapters.createDefaultLogger;
      const loggerClass: typeof DefaultLogger = loggingAdapters.DefaultLogger;

      expect(typeof defaultLoggerFunction).toBe('function');
      expect(typeof loggerClass).toBe('function');
    });

    it('should support logger interface implementation', () => {
      // Verify all loggers implement the Logger interface consistently
      const logger1 = loggingAdapters.createLogger();
      const logger2 = loggingAdapters.createProductionLogger();

      // Both should have the same interface methods
      expect(typeof logger1.debug).toBe('function');
      expect(typeof logger1.info).toBe('function');
      expect(typeof logger1.warn).toBe('function');
      expect(typeof logger1.error).toBe('function');
      expect(typeof logger1.fatal).toBe('function');
      expect(typeof logger1.log).toBe('function');
      expect(typeof logger1.logPerformance).toBe('function');
      expect(typeof logger1.logSecurity).toBe('function');
      expect(typeof logger1.logAudit).toBe('function');

      expect(typeof logger2.debug).toBe('function');
      expect(typeof logger2.info).toBe('function');
      expect(typeof logger2.warn).toBe('function');
      expect(typeof logger2.error).toBe('function');
      expect(typeof logger2.fatal).toBe('function');
      expect(typeof logger2.log).toBe('function');
      expect(typeof logger2.logPerformance).toBe('function');
      expect(typeof logger2.logSecurity).toBe('function');
      expect(typeof logger2.logAudit).toBe('function');
    });
  });
});
