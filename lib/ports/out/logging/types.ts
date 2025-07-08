import type { LogLevel, LogType, LoggerConfig } from './Logger';

/**
 * Log level priority mapping for level comparison
 *
 * Used to determine if a log level meets the minimum threshold.
 * Higher numbers indicate higher priority/severity.
 *
 * @internal
 */
export const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
} as const;

/**
 * Default logger configuration
 *
 * Provides sensible defaults for logger behavior that can be overridden
 * based on environment or specific requirements.
 *
 * @public
 */
export const DEFAULT_LOGGER_CONFIG: LoggerConfig = {
  processLogging: true,
  secretLogging: false,
  securityLogging: true,
  performanceLogging: true,
  auditLogging: true,
  minLevel: 'info',
  includeTimestamp: true,
  includeMetadata: true,
} as const;

/**
 * Production-safe logger configuration
 *
 * Configuration optimized for production environments with security
 * and performance considerations.
 *
 * @public
 */
export const PRODUCTION_LOGGER_CONFIG: LoggerConfig = {
  processLogging: true,
  secretLogging: false,
  securityLogging: true,
  performanceLogging: false,
  auditLogging: true,
  minLevel: 'warn',
  includeTimestamp: true,
  includeMetadata: false,
} as const;

/**
 * Development logger configuration
 *
 * Configuration optimized for development environments with verbose
 * logging for debugging purposes.
 *
 * @public
 */
export const DEVELOPMENT_LOGGER_CONFIG: LoggerConfig = {
  processLogging: true,
  secretLogging: true,
  securityLogging: true,
  performanceLogging: true,
  auditLogging: true,
  minLevel: 'debug',
  includeTimestamp: true,
  includeMetadata: true,
} as const;

/**
 * Utility function to check if a log level meets the minimum threshold
 *
 * @param level - The log level to check
 * @param minLevel - The minimum required level
 * @returns True if the level meets or exceeds the minimum threshold
 *
 * @example
 * ```typescript
 * if (isLogLevelEnabled('debug', 'info')) {
 *   // This would return false, so debug logging is disabled
 * }
 *
 * if (isLogLevelEnabled('error', 'info')) {
 *   // This would return true, so error logging is enabled
 * }
 * ```
 *
 * @public
 */
export function isLogLevelEnabled(
  level: LogLevel,
  minLevel: LogLevel
): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel];
}

/**
 * Utility function to determine if a log type should be processed
 *
 * @param type - The log type to check
 * @param config - The logger configuration
 * @returns True if the log type is enabled in the configuration
 *
 * @example
 * ```typescript
 * const config: LoggerConfig = { secretLogging: false, ... };
 *
 * if (isLogTypeEnabled('secret', config)) {
 *   // This would return false, so secret logging is disabled
 * }
 * ```
 *
 * @public
 */
export function isLogTypeEnabled(type: LogType, config: LoggerConfig): boolean {
  switch (type) {
    case 'process':
      return config.processLogging;
    case 'secret':
      return config.secretLogging;
    case 'security':
      return config.securityLogging;
    case 'performance':
      return config.performanceLogging;
    case 'audit':
      return config.auditLogging;
    default:
      return true; // Default to enabled for unknown types
  }
}

/**
 * Type guard to check if a string is a valid LogLevel
 *
 * @param value - The value to check
 * @returns True if the value is a valid LogLevel
 *
 * @example
 * ```typescript
 * if (isValidLogLevel(userInput)) {
 *   logger.log(userInput, 'process', 'Service', 'Message');
 * }
 * ```
 *
 * @public
 */
export function isValidLogLevel(value: string): value is LogLevel {
  return ['debug', 'info', 'warn', 'error', 'fatal'].includes(value);
}

/**
 * Type guard to check if a string is a valid LogType
 *
 * @param value - The value to check
 * @returns True if the value is a valid LogType
 *
 * @example
 * ```typescript
 * if (isValidLogType(userInput)) {
 *   logger.log('info', userInput, 'Service', 'Message');
 * }
 * ```
 *
 * @public
 */
export function isValidLogType(value: string): value is LogType {
  return ['process', 'secret', 'security', 'performance', 'audit'].includes(
    value
  );
}

/**
 * Sanitizes log messages to remove potentially sensitive information
 *
 * @param message - The log message to sanitize
 * @param preserveStructure - Whether to preserve the structure of masked data
 * @returns The sanitized message
 *
 * @example
 * ```typescript
 * const sanitized = sanitizeLogMessage('Password: secret123');
 * // Returns: 'Password: [REDACTED]'
 *
 * const structuredSanitized = sanitizeLogMessage('{"password":"secret","token":"abc123"}', true);
 * // Returns: '{"password":"[REDACTED]","token":"[REDACTED]"}'
 * ```
 *
 * @public
 */
export function sanitizeLogMessage(
  message: string,
  preserveStructure = false
): string {
  if (!preserveStructure) {
    // Simple redaction patterns - preserve original case for the keyword
    return message
      .replace(
        /(password)[:\s]*[^\s\n\r]+/gi,
        (_, keyword) => `${keyword}: [REDACTED]`
      )
      .replace(
        /(token)[:\s]*[^\s\n\r]+/gi,
        (_, keyword) => `${keyword}: [REDACTED]`
      )
      .replace(
        /(secret)[:\s]*[^\s\n\r]+/gi,
        (_, keyword) => `${keyword}: [REDACTED]`
      )
      .replace(
        /(key)[:\s]*[^\s\n\r]+/gi,
        (_, keyword) => `${keyword}: [REDACTED]`
      )
      .replace(
        /(authorization)[:\s]*[^\s\n\r]+/gi,
        (_, keyword) => `${keyword}: [REDACTED]`
      );
  }

  try {
    // Try to parse as JSON and redact structured data
    const parsed = JSON.parse(message);
    const sanitized = sanitizeObject(parsed);
    return JSON.stringify(sanitized);
  } catch {
    // Fall back to simple redaction if not valid JSON
    return sanitizeLogMessage(message, false);
  }
}

/**
 * Recursively sanitizes an object to remove sensitive fields
 *
 * @param obj - The object to sanitize
 * @returns The sanitized object
 *
 * @internal
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === 'object') {
    const sanitized: any = {};
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
    ];

    for (const [key, value] of Object.entries(obj)) {
      // 機密キーとの完全一致または明確な包含をチェック
      const isSensitive = sensitiveKeys.some((sensitive) => {
        const lowerKey = key.toLowerCase();
        return (
          lowerKey === sensitive ||
          lowerKey.endsWith(sensitive) ||
          lowerKey.startsWith(sensitive) ||
          (sensitive === 'key' &&
            (lowerKey.endsWith('key') || lowerKey.includes('apikey'))) ||
          (sensitive === 'secret' && lowerKey.includes('secret')) ||
          (sensitive === 'password' && lowerKey.includes('password')) ||
          (sensitive === 'token' && lowerKey.includes('token')) ||
          (sensitive === 'authorization' && lowerKey.includes('authorization'))
        );
      });

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeObject(value);
      }
    }
    return sanitized;
  }

  return obj;
}

/**
 * Creates a formatted timestamp string for logging
 *
 * @param date - The date to format (defaults to current date)
 * @returns ISO 8601 formatted timestamp string
 *
 * @example
 * ```typescript
 * const timestamp = createLogTimestamp();
 * // Returns: '2023-12-07T10:30:45.123Z'
 * ```
 *
 * @public
 */
export function createLogTimestamp(date = new Date()): string {
  return date.toISOString();
}
