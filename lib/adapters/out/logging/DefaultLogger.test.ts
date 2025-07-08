import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  LoggerConfig,
  LogMetadata,
} from '../../../ports/out/logging/Logger';
import {
  createDefaultLogger,
  createDevelopmentLogger,
  createLogger,
  createProductionLogger,
  DefaultLogger,
} from './DefaultLogger';

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

  describe('コンストラクタとプロパティ', () => {
    it('正常系: 設定を受け取りインスタンスを作成する', () => {
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
      expect(logger.config).not.toBe(config); // 深いコピーされているか確認
    });

    it('正常系: 設定の変更によってインスタンスは影響を受けない', () => {
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
      config.minLevel = 'error'; // 元の設定オブジェクトを変更

      expect(logger.config.minLevel).toBe('info'); // ロガーの設定は変更されない
    });
  });

  describe('基本的なログメソッド', () => {
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

    it('正常系: debug() が適切なコンソールメソッドを呼び出す', () => {
      logger.debug('TestService', 'Debug message');

      expect(mockConsole.debug).toHaveBeenCalledOnce();
      expect(mockConsole.debug).toHaveBeenCalledWith(
        '[DEBUG] [TestService] Debug message'
      );
    });

    it('正常系: info() が適切なコンソールメソッドを呼び出す', () => {
      logger.info('TestService', 'Info message');

      expect(mockConsole.info).toHaveBeenCalledOnce();
      expect(mockConsole.info).toHaveBeenCalledWith(
        '[INFO] [TestService] Info message'
      );
    });

    it('正常系: warn() が適切なコンソールメソッドを呼び出す', () => {
      logger.warn('TestService', 'Warning message');

      expect(mockConsole.warn).toHaveBeenCalledOnce();
      expect(mockConsole.warn).toHaveBeenCalledWith(
        '[WARN] [TestService] Warning message'
      );
    });

    it('正常系: error() が適切なコンソールメソッドを呼び出す', () => {
      logger.error('TestService', 'Error message');

      expect(mockConsole.error).toHaveBeenCalledOnce();
      expect(mockConsole.error).toHaveBeenCalledWith(
        '[ERROR] [TestService] Error message'
      );
    });

    it('正常系: fatal() が適切なコンソールメソッドを呼び出す', () => {
      logger.fatal('TestService', 'Fatal message');

      expect(mockConsole.error).toHaveBeenCalledOnce();
      expect(mockConsole.error).toHaveBeenCalledWith(
        '[FATAL] [TestService] Fatal message'
      );
    });
  });

  describe('メタデータ付きログ', () => {
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

    it('正常系: メタデータがJSON形式で含まれる', () => {
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

    it('正常系: 空のメタデータの場合はメタデータ部分が表示されない', () => {
      logger.info('TestService', 'Test message', {});

      expect(mockConsole.info).toHaveBeenCalledWith(
        '[INFO] [TestService] Test message'
      );
    });

    it('正常系: メタデータが無効の場合はメタデータ部分が表示されない', () => {
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

  describe('タイムスタンプ機能', () => {
    it('正常系: タイムスタンプが有効な場合は含まれる', () => {
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

    it('正常系: メタデータのタイムスタンプが優先される', () => {
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

  describe('レベルフィルタリング', () => {
    it('正常系: 最小レベル以下のログは出力されない', () => {
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

    it('正常系: isLevelEnabled() が正しく動作する', () => {
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

  describe('タイプフィルタリング', () => {
    it('正常系: 無効にされたタイプのログは出力されない', () => {
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

      expect(mockConsole.info).toHaveBeenCalledTimes(2); // security と audit のみ
    });

    it('正常系: isTypeEnabled() が正しく動作する', () => {
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

  describe('機密情報のサニタイズ', () => {
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

    it('正常系: secretタイプのログは無効時に出力されない', () => {
      logger.log('info', 'secret', 'TestService', 'Secret password: test123');

      expect(mockConsole.info).not.toHaveBeenCalled();
    });

    it('正常系: メッセージ内のパスワードがサニタイズされる', () => {
      logger.logSecurity(
        'warn',
        'AuthService',
        'Login failed with password: secret123'
      );

      expect(mockConsole.warn).toHaveBeenCalledWith(
        expect.stringContaining('password: [REDACTED]')
      );
    });

    it('正常系: メタデータ内の機密情報がサニタイズされる', () => {
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

  describe('特殊ログメソッド', () => {
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

    it('正常系: logPerformance() が適切に動作する', () => {
      const metadata: LogMetadata = {
        performance: { duration: 150 },
        context: { operation: 'database query' },
      };

      logger.logPerformance('DatabaseService', 'Query completed', metadata);

      expect(mockConsole.info).toHaveBeenCalledOnce();
    });

    it('正常系: logSecurity() が適切に動作する', () => {
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

    it('正常系: logAudit() が適切に動作する', () => {
      const metadata: LogMetadata = {
        userId: 'user-123',
        requestId: 'req-456',
        context: { action: 'user.created' },
      };

      logger.logAudit('UserService', 'User account created', metadata);

      expect(mockConsole.info).toHaveBeenCalledOnce();
    });
  });

  describe('設定の更新', () => {
    it('正常系: updateConfig() で設定を更新できる', () => {
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
      expect(logger.config.processLogging).toBe(true); // 他の設定は保持
    });

    it('正常系: 設定更新後のフィルタリングが正しく動作する', () => {
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

      expect(mockConsole.info).toHaveBeenCalledTimes(1); // 最初のinfoのみ
      expect(mockConsole.error).toHaveBeenCalledTimes(1); // 更新後のerror
    });
  });

  describe('カスタムフォーマッター', () => {
    it('正常系: カスタムフォーマッターが使用される', () => {
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

describe('ファクトリー関数', () => {
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
    it('正常系: 指定した設定でDefaultLoggerを作成する', () => {
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
    it('正常系: プロダクション用設定でロガーを作成する', () => {
      const logger = createProductionLogger();

      expect(logger).toBeInstanceOf(DefaultLogger);
      expect(logger.config.secretLogging).toBe(false);
      expect(logger.config.minLevel).toBe('warn');
      expect(logger.config.securityLogging).toBe(true);
    });
  });

  describe('createDevelopmentLogger', () => {
    it('正常系: 開発用設定でロガーを作成する', () => {
      const logger = createDevelopmentLogger();

      expect(logger).toBeInstanceOf(DefaultLogger);
      expect(logger.config.secretLogging).toBe(true);
      expect(logger.config.minLevel).toBe('debug');
      expect(logger.config.performanceLogging).toBe(true);
    });
  });

  describe('createLogger', () => {
    it('正常系: デフォルト設定でロガーを作成する', () => {
      const logger = createLogger();

      expect(logger).toBeInstanceOf(DefaultLogger);
      expect(logger.config.minLevel).toBe('info');
      expect(logger.config.secretLogging).toBe(false);
    });

    it('正常系: カスタム設定でロガーを作成する', () => {
      const logger = createLogger({
        minLevel: 'error',
        secretLogging: true,
      });

      expect(logger).toBeInstanceOf(DefaultLogger);
      expect(logger.config.minLevel).toBe('error');
      expect(logger.config.secretLogging).toBe(true);
      expect(logger.config.processLogging).toBe(true); // デフォルト値が保持される
    });
  });
});
