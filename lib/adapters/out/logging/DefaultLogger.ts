import type {
  Logger,
  LoggerConfig,
  LogLevel,
  LogMetadata,
  LogType,
} from '../../../ports/out/logging/Logger';
import {
  createLogTimestamp,
  LOG_LEVEL_PRIORITY,
  sanitizeLogMessage,
} from '../../../ports/out/logging/types';

/**
 * Default logger implementation using the native console API
 *
 * Provides a production-ready implementation of the Logger interface using
 * the standard console API. Includes comprehensive filtering, formatting,
 * security-aware data sanitization, and configurable behavior.
 *
 * Features:
 * - Console-based output with appropriate log levels
 * - Configurable filtering by log level and type
 * - Automatic sanitization of sensitive data
 * - Rich metadata support with JSON formatting
 * - Timestamp generation and formatting
 * - Runtime configuration updates
 * - Performance-optimized level/type checking
 *
 * @example
 * ```typescript
 * const logger = new DefaultLogger({
 *   processLogging: true,
 *   secretLogging: false,
 *   minLevel: 'info',
 *   includeTimestamp: true
 * });
 *
 * // Basic logging
 * logger.info('AuthService', 'User authentication started');
 *
 * // Logging with metadata
 * logger.log('info', 'process', 'TransactionService', 'Transaction initialized', {
 *   requestId: 'req-123',
 *   userId: 'user-456',
 *   performance: { duration: 150 }
 * });
 *
 * // Security logging with automatic sanitization
 * logger.logSecurity('warn', 'AuthService', 'Login attempt with token: secret123', {
 *   userId: 'user-789',
 *   context: { password: 'secret456' } // Will be sanitized
 * });
 * ```
 *
 * @public
 */
export class DefaultLogger implements Logger {
  private _config: LoggerConfig;

  /**
   * Creates a new DefaultLogger instance
   *
   * @param config - Initial logger configuration
   *
   * @example
   * ```typescript
   * const logger = new DefaultLogger({
   *   processLogging: true,
   *   secretLogging: false,
   *   securityLogging: true,
   *   performanceLogging: true,
   *   auditLogging: true,
   *   minLevel: 'info',
   *   includeTimestamp: true,
   *   includeMetadata: true
   * });
   * ```
   */
  constructor(config: LoggerConfig) {
    this._config = { ...config };
  }

  /**
   * Get the current logger configuration
   *
   * @returns Current logger configuration (read-only)
   */
  get config(): LoggerConfig {
    return { ...this._config };
  }

  /**
   * Maps log levels to appropriate console methods
   *
   * @param level - The log level
   * @returns Console method for the given level
   *
   * @internal
   */
  private getConsoleMethod(level: LogLevel): (...args: unknown[]) => void {
    switch (level) {
      case 'debug':
        return console.debug;
      case 'info':
        return console.info;
      case 'warn':
        return console.warn;
      case 'error':
      case 'fatal':
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Formats a log message with metadata
   *
   * @param level - Log level
   * @param service - Service name
   * @param message - Log message
   * @param metadata - Optional metadata
   * @returns Formatted log message
   *
   * @internal
   */
  private formatMessage(
    level: LogLevel,
    service: string,
    message: string,
    metadata?: LogMetadata
  ): string {
    // Use custom formatter if provided
    if (this._config.formatter) {
      return this._config.formatter(level, service, message, metadata);
    }

    // Default formatting
    let formattedMessage = '';

    // Add timestamp if enabled
    if (this._config.includeTimestamp) {
      const timestamp = metadata?.timestamp || createLogTimestamp();
      formattedMessage += `[${timestamp}] `;
    }

    // Add log level
    formattedMessage += `[${level.toUpperCase()}] `;

    // Add service name
    formattedMessage += `[${service}] `;

    // Add message
    formattedMessage += message;

    // Add metadata if enabled and present
    if (this._config.includeMetadata && metadata) {
      const metadataClone = { ...metadata };
      delete metadataClone.timestamp; // Remove timestamp to avoid duplication

      if (Object.keys(metadataClone).length > 0) {
        formattedMessage += ` | ${JSON.stringify(metadataClone)}`;
      }
    }

    return formattedMessage;
  }

  /**
   * Sanitizes log data based on log type and configuration
   *
   * @param type - Log type
   * @param message - Message to sanitize
   * @param metadata - Metadata to sanitize
   * @returns Sanitized message and metadata
   *
   * @internal
   */
  private sanitizeLogData(
    type: LogType,
    message: string,
    metadata?: LogMetadata
  ): { message: string; metadata?: LogMetadata } {
    // Don't sanitize secret logs if secret logging is disabled
    if (type === 'secret' && !this._config.secretLogging) {
      return {
        message: '[REDACTED - Secret logging disabled]',
        metadata: undefined,
      };
    }

    // Sanitize message
    const sanitizedMessage = sanitizeLogMessage(message);

    // Sanitize metadata if present
    let sanitizedMetadata = metadata;
    if (metadata && (type === 'secret' || type === 'security')) {
      sanitizedMetadata = JSON.parse(JSON.stringify(metadata)); // Deep clone

      // Sanitize sensitive fields in metadata
      if (sanitizedMetadata && sanitizedMetadata.context) {
        sanitizedMetadata.context = this.sanitizeObject(
          sanitizedMetadata.context
        );
      }
    }

    return {
      message: sanitizedMessage,
      metadata: sanitizedMetadata,
    };
  }

  /**
   * Recursively sanitizes an object for sensitive data
   *
   * @param obj - Object to sanitize
   * @returns Sanitized object
   *
   * @internal
   */
  private sanitizeObject(
    obj: Record<string, unknown>
  ): Record<string, unknown> {
    const sensitiveKeys = [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'credential',
      'api_key',
      'apikey',
      'authorization',
      'session',
      'cookie',
    ];

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
      const keyLower = key.toLowerCase();
      const isSensitive = sensitiveKeys.some((sensitiveKey) =>
        keyLower.includes(sensitiveKey)
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        sanitized[key] = this.sanitizeObject(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Core logging method with full control over level, type, and metadata
   *
   * @param level - The severity level of the log message
   * @param type - The type/category of the log for filtering purposes
   * @param service - The service or component name generating the log
   * @param message - The log message content
   * @param metadata - Optional metadata for additional context
   *
   * @example
   * ```typescript
   * logger.log('info', 'process', 'UserService', 'User created successfully', {
   *   requestId: 'req-123',
   *   userId: 'user-456'
   * });
   * ```
   */
  log(
    level: LogLevel,
    type: LogType,
    service: string,
    message: string,
    metadata?: LogMetadata
  ): void {
    // Check if level is enabled
    if (!this.isLevelEnabled(level)) {
      return;
    }

    // Check if type is enabled
    if (!this.isTypeEnabled(type)) {
      return;
    }

    // Sanitize log data
    const { message: sanitizedMessage, metadata: sanitizedMetadata } =
      this.sanitizeLogData(type, message, metadata);

    // Add timestamp to metadata if not present
    const enrichedMetadata: LogMetadata = {
      ...sanitizedMetadata,
      timestamp: sanitizedMetadata?.timestamp || createLogTimestamp(),
    };

    // Format the message
    const formattedMessage = this.formatMessage(
      level,
      service,
      sanitizedMessage,
      enrichedMetadata
    );

    // Output to console
    const consoleMethod = this.getConsoleMethod(level);
    consoleMethod(formattedMessage);
  }

  /**
   * Log debug information for development and troubleshooting
   *
   * @param service - The service or component name
   * @param message - The debug message
   * @param metadata - Optional metadata for additional context
   */
  debug(service: string, message: string, metadata?: LogMetadata): void {
    this.log('debug', 'process', service, message, metadata);
  }

  /**
   * Log informational messages for normal operations
   *
   * @param service - The service or component name
   * @param message - The informational message
   * @param metadata - Optional metadata for additional context
   */
  info(service: string, message: string, metadata?: LogMetadata): void {
    this.log('info', 'process', service, message, metadata);
  }

  /**
   * Log warning messages for potentially problematic situations
   *
   * @param service - The service or component name
   * @param message - The warning message
   * @param metadata - Optional metadata for additional context
   */
  warn(service: string, message: string, metadata?: LogMetadata): void {
    this.log('warn', 'process', service, message, metadata);
  }

  /**
   * Log error messages for error conditions
   *
   * @param service - The service or component name
   * @param message - The error message
   * @param metadata - Optional metadata including error details
   */
  error(service: string, message: string, metadata?: LogMetadata): void {
    this.log('error', 'process', service, message, metadata);
  }

  /**
   * Log fatal error messages for critical system failures
   *
   * @param service - The service or component name
   * @param message - The fatal error message
   * @param metadata - Optional metadata including error details
   */
  fatal(service: string, message: string, metadata?: LogMetadata): void {
    this.log('fatal', 'process', service, message, metadata);
  }

  /**
   * Log performance metrics and timing information
   *
   * @param service - The service or component name
   * @param message - The performance message
   * @param metadata - Metadata including performance metrics
   *
   * @example
   * ```typescript
   * logger.logPerformance('DatabaseService', 'Query executed', {
   *   performance: { duration: 250 },
   *   context: { queryType: 'SELECT', recordCount: 150 }
   * });
   * ```
   */
  logPerformance(
    service: string,
    message: string,
    metadata: LogMetadata
  ): void {
    this.log('info', 'performance', service, message, metadata);
  }

  /**
   * Log security-related events with appropriate handling
   *
   * @param level - The severity level of the security event
   * @param service - The service or component name
   * @param message - The security event message
   * @param metadata - Metadata with security context
   *
   * @example
   * ```typescript
   * logger.logSecurity('warn', 'AuthService', 'Suspicious login attempt', {
   *   userId: 'user-123',
   *   context: { ipAddress: '192.168.1.100', userAgent: 'suspicious-bot' }
   * });
   * ```
   */
  logSecurity(
    level: LogLevel,
    service: string,
    message: string,
    metadata?: LogMetadata
  ): void {
    this.log(level, 'security', service, message, metadata);
  }

  /**
   * Log audit trail events for compliance and tracking
   *
   * @param service - The service or component name
   * @param action - The action being audited
   * @param metadata - Metadata with audit context
   *
   * @example
   * ```typescript
   * logger.logAudit('UserService', 'user.created', {
   *   userId: 'user-123',
   *   requestId: 'req-456',
   *   context: { adminId: 'admin-789' }
   * });
   * ```
   */
  logAudit(service: string, action: string, metadata: LogMetadata): void {
    this.log('info', 'audit', service, action, metadata);
  }

  /**
   * Update logger configuration at runtime
   *
   * @param config - New configuration to apply
   *
   * @example
   * ```typescript
   * logger.updateConfig({
   *   ...logger.config,
   *   secretLogging: false,
   *   minLevel: 'warn'
   * });
   * ```
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Check if a given log level would be output based on current configuration
   *
   * @param level - The log level to check
   * @returns True if the level would be logged, false otherwise
   *
   * @example
   * ```typescript
   * if (logger.isLevelEnabled('debug')) {
   *   const expensiveDebugData = computeExpensiveDebugInfo();
   *   logger.debug('Service', 'Debug info', { context: expensiveDebugData });
   * }
   * ```
   */
  isLevelEnabled(level: LogLevel): boolean {
    const currentPriority = LOG_LEVEL_PRIORITY[this._config.minLevel];
    const levelPriority = LOG_LEVEL_PRIORITY[level];
    return levelPriority >= currentPriority;
  }

  /**
   * Check if a given log type is enabled based on current configuration
   *
   * @param type - The log type to check
   * @returns True if the type would be logged, false otherwise
   */
  isTypeEnabled(type: LogType): boolean {
    switch (type) {
      case 'process':
        return this._config.processLogging;
      case 'secret':
        return this._config.secretLogging;
      case 'security':
        return this._config.securityLogging;
      case 'performance':
        return this._config.performanceLogging;
      case 'audit':
        return this._config.auditLogging;
      default:
        return true; // Default to enabled for unknown types
    }
  }
}

/**
 * Factory function to create a DefaultLogger instance
 *
 * Provides a convenient way to create a DefaultLogger instance with
 * the given configuration.
 *
 * @param config - Logger configuration
 * @returns DefaultLogger instance
 *
 * @example
 * ```typescript
 * const logger = createDefaultLogger({
 *   processLogging: true,
 *   secretLogging: false,
 *   minLevel: 'info',
 *   includeTimestamp: true
 * });
 * ```
 *
 * @public
 */
export function createDefaultLogger(config: LoggerConfig): DefaultLogger {
  return new DefaultLogger(config);
}

/**
 * Convenience function to create a Logger instance with production settings
 *
 * @returns Logger instance configured for production use
 *
 * @example
 * ```typescript
 * const logger = createProductionLogger();
 * logger.info('Application', 'Service started');
 * ```
 *
 * @public
 */
export function createProductionLogger(): Logger {
  return createDefaultLogger({
    processLogging: true,
    secretLogging: false,
    securityLogging: true,
    performanceLogging: true,
    auditLogging: true,
    minLevel: 'warn',
    includeTimestamp: true,
    includeMetadata: true,
  });
}

/**
 * Convenience function to create a Logger instance with development settings
 *
 * @returns Logger instance configured for development use
 *
 * @example
 * ```typescript
 * const logger = createDevelopmentLogger();
 * logger.debug('Component', 'Debug information');
 * ```
 *
 * @public
 */
export function createDevelopmentLogger(): Logger {
  return createDefaultLogger({
    processLogging: true,
    secretLogging: true,
    securityLogging: true,
    performanceLogging: true,
    auditLogging: true,
    minLevel: 'debug',
    includeTimestamp: true,
    includeMetadata: true,
  });
}

/**
 * Convenience function to create a configured Logger instance
 *
 * @param config - Optional configuration overrides
 * @returns Logger instance ready for use
 *
 * @example
 * ```typescript
 * const logger = createLogger({
 *   minLevel: 'info',
 *   secretLogging: false
 * });
 * logger.info('Service', 'Operation completed');
 * ```
 *
 * @public
 */
export function createLogger(config?: Partial<LoggerConfig>): Logger {
  const defaultConfig: LoggerConfig = {
    processLogging: true,
    secretLogging: false,
    securityLogging: true,
    performanceLogging: true,
    auditLogging: true,
    minLevel: 'info',
    includeTimestamp: true,
    includeMetadata: true,
  };

  return createDefaultLogger({ ...defaultConfig, ...config });
}
