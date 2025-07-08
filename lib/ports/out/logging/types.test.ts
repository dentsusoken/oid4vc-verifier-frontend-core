import { describe, expect, it } from 'vitest';
import type { LogLevel, LogType, LoggerConfig } from './Logger';
import {
  DEFAULT_LOGGER_CONFIG,
  DEVELOPMENT_LOGGER_CONFIG,
  LOG_LEVEL_PRIORITY,
  PRODUCTION_LOGGER_CONFIG,
  createLogTimestamp,
  isLogLevelEnabled,
  isLogTypeEnabled,
  isValidLogLevel,
  isValidLogType,
  sanitizeLogMessage,
} from './types';

describe('Logging Types and Utilities', () => {
  describe('LOG_LEVEL_PRIORITY', () => {
    it('正常系: 優先度順序が正しく定義されている', () => {
      expect(LOG_LEVEL_PRIORITY.debug).toBe(10);
      expect(LOG_LEVEL_PRIORITY.info).toBe(20);
      expect(LOG_LEVEL_PRIORITY.warn).toBe(30);
      expect(LOG_LEVEL_PRIORITY.error).toBe(40);
      expect(LOG_LEVEL_PRIORITY.fatal).toBe(50);
    });

    it('正常系: 優先度の順序が昇順になっている', () => {
      const levels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
      for (let i = 1; i < levels.length; i++) {
        expect(LOG_LEVEL_PRIORITY[levels[i]]).toBeGreaterThan(
          LOG_LEVEL_PRIORITY[levels[i - 1]]
        );
      }
    });
  });

  describe('Logger Configurations', () => {
    it('正常系: DEFAULT_LOGGER_CONFIGが適切に設定されている', () => {
      expect(DEFAULT_LOGGER_CONFIG).toEqual({
        processLogging: true,
        secretLogging: false,
        securityLogging: true,
        performanceLogging: true,
        auditLogging: true,
        minLevel: 'info',
        includeTimestamp: true,
        includeMetadata: true,
      });
    });

    it('正常系: PRODUCTION_LOGGER_CONFIGがセキュリティ重視設定になっている', () => {
      expect(PRODUCTION_LOGGER_CONFIG.secretLogging).toBe(false);
      expect(PRODUCTION_LOGGER_CONFIG.minLevel).toBe('warn');
      expect(PRODUCTION_LOGGER_CONFIG.includeMetadata).toBe(false);
      expect(PRODUCTION_LOGGER_CONFIG.securityLogging).toBe(true);
    });

    it('正常系: DEVELOPMENT_LOGGER_CONFIGが詳細ログ設定になっている', () => {
      expect(DEVELOPMENT_LOGGER_CONFIG.secretLogging).toBe(true);
      expect(DEVELOPMENT_LOGGER_CONFIG.minLevel).toBe('debug');
      expect(DEVELOPMENT_LOGGER_CONFIG.includeMetadata).toBe(true);
      expect(DEVELOPMENT_LOGGER_CONFIG.performanceLogging).toBe(true);
    });
  });

  describe('isLogLevelEnabled', () => {
    it.each([
      ['debug', 'debug', true],
      ['info', 'debug', true],
      ['warn', 'debug', true],
      ['error', 'debug', true],
      ['fatal', 'debug', true],
    ])(
      '正常系: レベル %s は最小レベル %s で %s になる',
      (level, minLevel, expected) => {
        expect(isLogLevelEnabled(level as LogLevel, minLevel as LogLevel)).toBe(
          expected
        );
      }
    );

    it.each([
      ['debug', 'info', false],
      ['debug', 'warn', false],
      ['debug', 'error', false],
      ['info', 'warn', false],
      ['info', 'error', false],
      ['warn', 'error', false],
    ])(
      '正常系: レベル %s は最小レベル %s で %s になる',
      (level, minLevel, expected) => {
        expect(isLogLevelEnabled(level as LogLevel, minLevel as LogLevel)).toBe(
          expected
        );
      }
    );

    it.each([
      ['info', 'info', true],
      ['warn', 'warn', true],
      ['error', 'error', true],
      ['fatal', 'fatal', true],
    ])(
      '正常系: 同じレベル %s と %s は有効になる',
      (level, minLevel, expected) => {
        expect(isLogLevelEnabled(level as LogLevel, minLevel as LogLevel)).toBe(
          expected
        );
      }
    );
  });

  describe('isLogTypeEnabled', () => {
    const testConfig: LoggerConfig = {
      processLogging: true,
      secretLogging: false,
      securityLogging: true,
      performanceLogging: false,
      auditLogging: true,
      minLevel: 'info',
      includeTimestamp: true,
      includeMetadata: true,
    };

    it.each([
      ['process', true],
      ['secret', false],
      ['security', true],
      ['performance', false],
      ['audit', true],
    ])('正常系: ログタイプ %s の有効性が %s になる', (type, expected) => {
      expect(isLogTypeEnabled(type as LogType, testConfig)).toBe(expected);
    });

    it('正常系: 未知のログタイプはデフォルトで有効になる', () => {
      expect(isLogTypeEnabled('unknown' as LogType, testConfig)).toBe(true);
    });
  });

  describe('isValidLogLevel', () => {
    it.each(['debug', 'info', 'warn', 'error', 'fatal'])(
      '正常系: 有効なログレベル "%s" が正しく判定される',
      (level) => {
        expect(isValidLogLevel(level)).toBe(true);
      }
    );

    it.each(['trace', 'verbose', 'critical', 'invalid', ''])(
      '異常系: 無効なログレベル "%s" が正しく判定される',
      (level) => {
        expect(isValidLogLevel(level)).toBe(false);
      }
    );

    it('異常系: 大文字小文字が正確に判定される', () => {
      expect(isValidLogLevel('INFO')).toBe(false);
      expect(isValidLogLevel('Debug')).toBe(false);
      expect(isValidLogLevel('ERROR')).toBe(false);
    });
  });

  describe('isValidLogType', () => {
    it.each(['process', 'secret', 'security', 'performance', 'audit'])(
      '正常系: 有効なログタイプ "%s" が正しく判定される',
      (type) => {
        expect(isValidLogType(type)).toBe(true);
      }
    );

    it.each(['system', 'application', 'invalid', ''])(
      '異常系: 無効なログタイプ "%s" が正しく判定される',
      (type) => {
        expect(isValidLogType(type)).toBe(false);
      }
    );
  });

  describe('sanitizeLogMessage', () => {
    describe('プレーンテキストのサニタイズ', () => {
      it('正常系: パスワードが適切にマスクされる', () => {
        const result = sanitizeLogMessage(
          'User login with password: secret123'
        );
        expect(result).toBe('User login with password: [REDACTED]');
      });

      it('正常系: トークンが適切にマスクされる', () => {
        const result = sanitizeLogMessage('Auth token: abc123xyz');
        expect(result).toBe('Auth token: [REDACTED]');
      });

      it('正常系: 複数の機密情報が適切にマスクされる', () => {
        const result = sanitizeLogMessage(
          'password: secret token: abc123 key: xyz789'
        );
        expect(result).toBe(
          'password: [REDACTED] token: [REDACTED] key: [REDACTED]'
        );
      });

      it('正常系: 機密情報がない場合は変更されない', () => {
        const message = 'Normal log message without sensitive data';
        const result = sanitizeLogMessage(message);
        expect(result).toBe(message);
      });

      it('正常系: 大文字小文字を区別せずにマスクされる', () => {
        const result = sanitizeLogMessage('PASSWORD: Secret123 TOKEN: AbC123');
        expect(result).toBe('PASSWORD: [REDACTED] TOKEN: [REDACTED]');
      });
    });

    describe('JSON構造のサニタイズ', () => {
      it('正常系: JSONオブジェクトの機密フィールドがマスクされる', () => {
        const jsonMessage =
          '{"username":"user123","password":"secret","email":"user@example.com"}';
        const result = sanitizeLogMessage(jsonMessage, true);
        const parsed = JSON.parse(result);

        expect(parsed.username).toBe('user123');
        expect(parsed.password).toBe('[REDACTED]');
        expect(parsed.email).toBe('user@example.com');
      });

      it('正常系: ネストしたオブジェクトの機密フィールドがマスクされる', () => {
        const jsonMessage =
          '{"user":{"name":"John","credentials":{"password":"secret","token":"abc123"}}}';
        const result = sanitizeLogMessage(jsonMessage, true);
        const parsed = JSON.parse(result);

        expect(parsed.user.name).toBe('John');
        expect(parsed.user.credentials).toBeDefined();
        expect(parsed.user.credentials.password).toBe('[REDACTED]');
        expect(parsed.user.credentials.token).toBe('[REDACTED]');
      });

      it('正常系: 配列内のオブジェクトがサニタイズされる', () => {
        const jsonMessage =
          '[{"id":1,"secret":"value1"},{"id":2,"secret":"value2"}]';
        const result = sanitizeLogMessage(jsonMessage, true);
        const parsed = JSON.parse(result);

        expect(parsed[0].id).toBe(1);
        expect(parsed[0].secret).toBe('[REDACTED]');
        expect(parsed[1].id).toBe(2);
        expect(parsed[1].secret).toBe('[REDACTED]');
      });

      it('正常系: 無効なJSONの場合はプレーンテキストとして処理される', () => {
        const invalidJson = 'password: secret {invalid json}';
        const result = sanitizeLogMessage(invalidJson, true);
        expect(result).toBe('password: [REDACTED] {invalid json}');
      });
    });

    describe('エッジケース', () => {
      it('正常系: 空文字列の場合', () => {
        const result = sanitizeLogMessage('');
        expect(result).toBe('');
      });

      it('正常系: null/undefinedを含むJSONの場合', () => {
        const jsonMessage =
          '{"password":null,"token":undefined,"secret":"value"}';
        const result = sanitizeLogMessage(jsonMessage, true);
        expect(result).toContain('[REDACTED]');
      });

      it('正常系: 複雑な機密キーの組み合わせ', () => {
        const jsonMessage =
          '{"userPassword":"secret","authToken":"abc","apiKey":"xyz","accessSecret":"def"}';
        const result = sanitizeLogMessage(jsonMessage, true);
        const parsed = JSON.parse(result);

        expect(parsed.userPassword).toBe('[REDACTED]');
        expect(parsed.authToken).toBe('[REDACTED]');
        expect(parsed.apiKey).toBe('[REDACTED]');
        expect(parsed.accessSecret).toBe('[REDACTED]');
      });
    });
  });

  describe('createLogTimestamp', () => {
    it('正常系: ISO 8601形式のタイムスタンプを生成する', () => {
      const timestamp = createLogTimestamp();
      // ISO 8601形式の正規表現チェック
      const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
      expect(timestamp).toMatch(iso8601Regex);
    });

    it('正常系: 指定した日付のタイムスタンプを生成する', () => {
      const specificDate = new Date('2023-12-07T10:30:45.123Z');
      const timestamp = createLogTimestamp(specificDate);
      expect(timestamp).toBe('2023-12-07T10:30:45.123Z');
    });

    it('正常系: 現在時刻に近いタイムスタンプを生成する', () => {
      const before = new Date().getTime();
      const timestamp = createLogTimestamp();
      const after = new Date().getTime();

      const timestampTime = new Date(timestamp).getTime();
      expect(timestampTime).toBeGreaterThanOrEqual(before);
      expect(timestampTime).toBeLessThanOrEqual(after);
    });
  });

  describe('統合テスト', () => {
    it('正常系: すべてのユーティリティ関数が連携して動作する', () => {
      const config = DEFAULT_LOGGER_CONFIG;

      // ログレベルチェック
      expect(isLogLevelEnabled('info', config.minLevel)).toBe(true);
      expect(isLogLevelEnabled('debug', config.minLevel)).toBe(false);

      // ログタイプチェック
      expect(isLogTypeEnabled('process', config)).toBe(true);
      expect(isLogTypeEnabled('secret', config)).toBe(false);

      // バリデーション
      expect(isValidLogLevel('info')).toBe(true);
      expect(isValidLogType('process')).toBe(true);

      // サニタイズ
      const sensitiveMessage = 'User auth with password: secret123';
      const sanitized = sanitizeLogMessage(sensitiveMessage);
      expect(sanitized).toBe('User auth with password: [REDACTED]');

      // タイムスタンプ
      const timestamp = createLogTimestamp();
      expect(timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });

    it('正常系: プロダクション設定でのセキュリティ動作', () => {
      const config = PRODUCTION_LOGGER_CONFIG;

      // セキュリティ重視の設定確認
      expect(config.secretLogging).toBe(false);
      expect(isLogTypeEnabled('secret', config)).toBe(false);
      expect(isLogLevelEnabled('debug', config.minLevel)).toBe(false);

      // 本番環境では機密情報はログに出力されない
      const sensitiveData = '{"password":"secret","user":"john"}';
      const sanitized = sanitizeLogMessage(sensitiveData, true);
      const parsed = JSON.parse(sanitized);
      expect(parsed.password).toBe('[REDACTED]');
      expect(parsed.user).toBe('john');
    });
  });
});
