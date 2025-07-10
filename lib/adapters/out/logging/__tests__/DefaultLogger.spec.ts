import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  LoggerConfig,
  LogMetadata,
} from '../../../../ports/out/logging/Logger';
import {
  createDefaultLogger,
  createDevelopmentLogger,
  createLogger,
  createProductionLogger,
  DefaultLogger,
} from '../DefaultLogger';

describe('DefaultLogger', () => {
  let originalConsole: Console;
  let mockConsole: {
    debug: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    log: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    originalConsole = global.console;
    mockConsole = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      log: vi.fn(),
    };
    global.console = mockConsole as unknown as Console;
  });

  afterEach(() => {
    global.console = originalConsole;
    vi.clearAllMocks();
  });

  describe('constructor and properties', () => {
    it('should create instance with provided configuration', () => {
      const config: LoggerConfig = {
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'info',
        includeTimestamp: true,
        includeMetadata: true,
      };

      const logger = new DefaultLogger(config);

      expect(logger.config).toEqual(config);
      expect(logger.config).not.toBe(config); // Verify deep copy
    });

    it('should not be affected by changes to original configuration', () => {
      const config: LoggerConfig = {
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'info',
        includeTimestamp: true,
        includeMetadata: true,
      };

      const logger = new DefaultLogger(config);
      config.minLevel = 'error'; // Modify original config object

      expect(logger.config.minLevel).toBe('info'); // Logger config remains unchanged
    });
  });

  describe('basic log methods', () => {
    let logger: DefaultLogger;

    beforeEach(() => {
      logger = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'debug',
        includeTimestamp: false,
        includeMetadata: false,
      });
    });

    it('should call appropriate console method for debug()', () => {
      logger.debug('TestService', 'Debug message');

      expect(mockConsole.debug).toHaveBeenCalledOnce();
      expect(mockConsole.debug).toHaveBeenCalledWith(
        '[DEBUG] [TestService] Debug message'
      );
    });

    it('should call appropriate console method for info()', () => {
      logger.info('TestService', 'Info message');

      expect(mockConsole.info).toHaveBeenCalledOnce();
      expect(mockConsole.info).toHaveBeenCalledWith(
        '[INFO] [TestService] Info message'
      );
    });

    it('should call appropriate console method for warn()', () => {
      logger.warn('TestService', 'Warning message');

      expect(mockConsole.warn).toHaveBeenCalledOnce();
      expect(mockConsole.warn).toHaveBeenCalledWith(
        '[WARN] [TestService] Warning message'
      );
    });

    it('should call appropriate console method for error()', () => {
      logger.error('TestService', 'Error message');

      expect(mockConsole.error).toHaveBeenCalledOnce();
      expect(mockConsole.error).toHaveBeenCalledWith(
        '[ERROR] [TestService] Error message'
      );
    });

    it('should call appropriate console method for fatal()', () => {
      logger.fatal('TestService', 'Fatal message');

      expect(mockConsole.error).toHaveBeenCalledOnce();
      expect(mockConsole.error).toHaveBeenCalledWith(
        '[FATAL] [TestService] Fatal message'
      );
    });
  });

  describe('metadata logging', () => {
    let logger: DefaultLogger;

    beforeEach(() => {
      logger = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'debug',
        includeTimestamp: false,
        includeMetadata: true,
      });
    });

    it('should include metadata in JSON format', () => {
      const metadata: LogMetadata = {
        requestId: 'req-123',
        userId: 'user-456',
        context: { operation: 'test' },
      };

      logger.info('TestService', 'Test message', metadata);

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringContaining(
          '[INFO] [TestService] Test message | {"requestId":"req-123","userId":"user-456","context":{"operation":"test"}}'
        )
      );
    });

    it('should not display metadata section when metadata is empty', () => {
      logger.info('TestService', 'Test message', {});

      expect(mockConsole.info).toHaveBeenCalledWith(
        '[INFO] [TestService] Test message'
      );
    });

    it('should not display metadata section when metadata is disabled', () => {
      const loggerWithoutMetadata = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'debug',
        includeTimestamp: false,
        includeMetadata: false,
      });

      const metadata: LogMetadata = {
        requestId: 'req-123',
        userId: 'user-456',
      };

      loggerWithoutMetadata.info('TestService', 'Test message', metadata);

      expect(mockConsole.info).toHaveBeenCalledWith(
        '[INFO] [TestService] Test message'
      );
    });
  });

  describe('timestamp functionality', () => {
    it('should include timestamp when enabled', () => {
      const logger = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'debug',
        includeTimestamp: true,
        includeMetadata: false,
      });

      logger.info('TestService', 'Test message');

      expect(mockConsole.info).toHaveBeenCalledWith(
        expect.stringMatching(
          /^\[\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z\] \[INFO\] \[TestService\] Test message$/
        )
      );
    });

    it('should prioritize metadata timestamp over generated timestamp', () => {
      const logger = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'debug',
        includeTimestamp: true,
        includeMetadata: false,
      });

      const metadata: LogMetadata = {
        timestamp: '2023-01-01T12:00:00.000Z',
      };

      logger.info('TestService', 'Test message', metadata);

      expect(mockConsole.info).toHaveBeenCalledWith(
        '[2023-01-01T12:00:00.000Z] [INFO] [TestService] Test message'
      );
    });
  });

  describe('level filtering', () => {
    it('should not output logs below minimum level', () => {
      const logger = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'warn',
        includeTimestamp: false,
        includeMetadata: false,
      });

      logger.debug('TestService', 'Debug message');
      logger.info('TestService', 'Info message');
      logger.warn('TestService', 'Warning message');
      logger.error('TestService', 'Error message');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.info).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalledOnce();
      expect(mockConsole.error).toHaveBeenCalledOnce();
    });

    it('should correctly implement isLevelEnabled()', () => {
      const logger = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'warn',
        includeTimestamp: false,
        includeMetadata: false,
      });

      expect(logger.isLevelEnabled('debug')).toBe(false);
      expect(logger.isLevelEnabled('info')).toBe(false);
      expect(logger.isLevelEnabled('warn')).toBe(true);
      expect(logger.isLevelEnabled('error')).toBe(true);
      expect(logger.isLevelEnabled('fatal')).toBe(true);
    });
  });

  describe('type filtering', () => {
    it('should not output logs for disabled types', () => {
      const logger = new DefaultLogger({
        processLogging: false,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: false,
        auditLogging: true,
        minLevel: 'debug',
        includeTimestamp: false,
        includeMetadata: false,
      });

      logger.log('info', 'process', 'TestService', 'Process message');
      logger.log('info', 'security', 'TestService', 'Security message');
      logger.log('info', 'performance', 'TestService', 'Performance message');
      logger.log('info', 'audit', 'TestService', 'Audit message');

      expect(mockConsole.info).toHaveBeenCalledTimes(2); // Only security and audit
    });

    it('should correctly implement isTypeEnabled()', () => {
      const logger = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: false,
        auditLogging: true,
        minLevel: 'debug',
        includeTimestamp: false,
        includeMetadata: false,
      });

      expect(logger.isTypeEnabled('process')).toBe(true);
      expect(logger.isTypeEnabled('secret')).toBe(false);
      expect(logger.isTypeEnabled('security')).toBe(true);
      expect(logger.isTypeEnabled('performance')).toBe(false);
      expect(logger.isTypeEnabled('audit')).toBe(true);
    });
  });

  describe('sensitive data sanitization', () => {
    let logger: DefaultLogger;

    beforeEach(() => {
      logger = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'debug',
        includeTimestamp: false,
        includeMetadata: true,
      });
    });

    it('should not output secret type logs when disabled', () => {
      logger.log('info', 'secret', 'TestService', 'Secret password: test123');

      expect(mockConsole.info).not.toHaveBeenCalled();
    });

    it('should sanitize passwords in messages', () => {
      logger.logSecurity(
        'warn',
        'AuthService',
        'Login failed with password: secret123'
      );

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('password: [REDACTED]')
      );
    });

    it('should sanitize sensitive information in metadata', () => {
      const metadata: LogMetadata = {
        context: {
          password: 'secret123',
          token: 'abc456',
          publicData: 'safe data',
        },
      };

      logger.logSecurity('warn', 'AuthService', 'Security event', metadata);

      const call = mockConsole.warn.mock.calls[0][0];
      expect(call).toContain('"password":"[REDACTED]"');
      expect(call).toContain('"token":"[REDACTED]"');
      expect(call).toContain('"publicData":"safe data"');
    });
  });

  describe('specialized log methods', () => {
    let logger: DefaultLogger;

    beforeEach(() => {
      logger = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'debug',
        includeTimestamp: false,
        includeMetadata: false,
      });
    });

    it('should correctly implement logPerformance()', () => {
      const metadata: LogMetadata = {
        performance: { duration: 150 },
        context: { operation: 'database query' },
      };

      logger.logPerformance('DatabaseService', 'Query completed', metadata);

      expect(mockConsole.info).toHaveBeenCalledOnce();
    });

    it('should correctly implement logSecurity()', () => {
      const metadata: LogMetadata = {
        userId: 'user-123',
        context: { ipAddress: '192.168.1.1' },
      };

      logger.logSecurity(
        'warn',
        'AuthService',
        'Failed login attempt',
        metadata
      );

      expect(mockConsole.warn).toHaveBeenCalledOnce();
    });

    it('should correctly implement logAudit()', () => {
      const metadata: LogMetadata = {
        userId: 'user-123',
        requestId: 'req-456',
        context: { action: 'user.created' },
      };

      logger.logAudit('UserService', 'User account created', metadata);

      expect(mockConsole.info).toHaveBeenCalledOnce();
    });
  });

  describe('configuration updates', () => {
    it('should update configuration with updateConfig()', () => {
      const logger = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'debug',
        includeTimestamp: false,
        includeMetadata: false,
      });

      logger.updateConfig({ minLevel: 'error', secretLogging: true });

      expect(logger.config.minLevel).toBe('error');
      expect(logger.config.secretLogging).toBe(true);
      expect(logger.config.processLogging).toBe(true); // Other settings preserved
    });

    it('should apply filtering correctly after configuration update', () => {
      const logger = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'debug',
        includeTimestamp: false,
        includeMetadata: false,
      });

      logger.info('TestService', 'Before update');
      logger.updateConfig({ minLevel: 'error' });
      logger.info('TestService', 'After update');
      logger.error('TestService', 'Error after update');

      expect(mockConsole.info).toHaveBeenCalledTimes(1); // Only first info
      expect(mockConsole.error).toHaveBeenCalledTimes(1); // Error after update
    });
  });

  describe('custom formatter', () => {
    it('should use custom formatter when provided', () => {
      const customFormatter = vi
        .fn()
        .mockReturnValue('CUSTOM: formatted message');

      const logger = new DefaultLogger({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'debug',
        includeTimestamp: false,
        includeMetadata: false,
        formatter: customFormatter,
      });

      const metadata: LogMetadata = { requestId: 'req-123' };
      logger.info('TestService', 'Test message', metadata);

      expect(customFormatter).toHaveBeenCalledWith(
        'info',
        'TestService',
        'Test message',
        expect.objectContaining({ requestId: 'req-123' })
      );
      expect(mockConsole.info).toHaveBeenCalledWith(
        'CUSTOM: formatted message'
      );
    });
  });
});

describe('factory functions', () => {
  let originalConsole: Console;
  let mockConsole: {
    debug: ReturnType<typeof vi.fn>;
    info: ReturnType<typeof vi.fn>;
    warn: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    log: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    originalConsole = global.console;
    mockConsole = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      log: vi.fn(),
    };
    global.console = mockConsole as unknown as Console;
  });

  afterEach(() => {
    global.console = originalConsole;
    vi.clearAllMocks();
  });

  describe('createDefaultLogger', () => {
    it('should create DefaultLogger with specified configuration', () => {
      const config: LoggerConfig = {
        processLogging: true,
        secretLogging: true,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'warn',
        includeTimestamp: true,
        includeMetadata: true,
      };

      const logger = createDefaultLogger(config);

      expect(logger).toBeInstanceOf(DefaultLogger);
      expect(logger.config).toEqual(config);
    });
  });

  describe('createProductionLogger', () => {
    it('should create logger with production configuration', () => {
      const logger = createProductionLogger();

      expect(logger).toBeInstanceOf(DefaultLogger);
      expect(logger.config.secretLogging).toBe(false);
      expect(logger.config.minLevel).toBe('warn');
      expect(logger.config.securityLogging).toBe(true);
    });
  });

  describe('createDevelopmentLogger', () => {
    it('should create logger with development configuration', () => {
      const logger = createDevelopmentLogger();

      expect(logger).toBeInstanceOf(DefaultLogger);
      expect(logger.config.secretLogging).toBe(true);
      expect(logger.config.minLevel).toBe('debug');
      expect(logger.config.performanceLogging).toBe(true);
    });
  });

  describe('createLogger', () => {
    it('should create logger with default configuration', () => {
      const logger = createLogger();

      expect(logger).toBeInstanceOf(DefaultLogger);
      expect(logger.config.minLevel).toBe('info');
      expect(logger.config.secretLogging).toBe(false);
    });

    it('should create logger with custom configuration', () => {
      const logger = createLogger({
        minLevel: 'error',
        secretLogging: true,
      });

      expect(logger).toBeInstanceOf(DefaultLogger);
      expect(logger.config.minLevel).toBe('error');
      expect(logger.config.secretLogging).toBe(true);
      expect(logger.config.processLogging).toBe(true); // Default value preserved
    });
  });
});
