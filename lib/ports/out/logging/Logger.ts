/**
 * Log level enumeration for structured logging
 *
 * Defines the severity levels for log messages in the OID4VC verification system.
 * Each level has a specific purpose and determines how the log should be processed
 * and displayed.
 *
 * @public
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * Log type classification for filtering and routing
 *
 * Categorizes log messages based on their content type to enable
 * appropriate filtering, masking, and routing of sensitive information.
 *
 * @public
 */
export type LogType =
  | 'process'
  | 'secret'
  | 'security'
  | 'performance'
  | 'audit';

/**
 * Metadata structure for enriched logging
 *
 * Contains additional contextual information that can be attached to log messages
 * for better debugging, monitoring, and audit trail capabilities.
 *
 * @public
 */
export interface LogMetadata {
  /** Unique identifier for request correlation */
  requestId?: string;

  /** User identifier for audit purposes */
  userId?: string;

  /** Session identifier for tracking user sessions */
  sessionId?: string;

  /** Timestamp when the log was created (ISO 8601 format) */
  timestamp?: string;

  /** Additional contextual data */
  context?: Record<string, unknown>;

  /** Performance metrics */
  performance?: {
    /** Duration in milliseconds */
    duration?: number;
    /** Memory usage in bytes */
    memoryUsage?: number;
  };

  /** Error details for error-level logs */
  error?: {
    /** Error name/type */
    name?: string;
    /** Error message */
    message?: string;
    /** Stack trace */
    stack?: string;
    /** Error code */
    code?: string;
  };
}

/**
 * Configuration for logger behavior
 *
 * Defines how the logger should behave regarding different types of logs,
 * output formats, and filtering rules.
 *
 * @public
 */
export interface LoggerConfig {
  /** Enable/disable process-related logging */
  processLogging: boolean;

  /** Enable/disable secret/sensitive data logging */
  secretLogging: boolean;

  /** Enable/disable security event logging */
  securityLogging: boolean;

  /** Enable/disable performance metrics logging */
  performanceLogging: boolean;

  /** Enable/disable audit trail logging */
  auditLogging: boolean;

  /** Minimum log level to output */
  minLevel: LogLevel;

  /** Whether to include timestamps in logs */
  includeTimestamp: boolean;

  /** Whether to include metadata in logs */
  includeMetadata: boolean;

  /** Custom formatting function for log output */
  formatter?: (
    level: LogLevel,
    service: string,
    message: string,
    metadata?: LogMetadata
  ) => string;
}

/**
 * Structured logging interface for the OID4VC verification system
 *
 * Provides a comprehensive logging interface that supports different log levels,
 * types, and contextual metadata. This interface enables structured logging
 * with proper categorization of sensitive data, performance metrics, and
 * audit trails.
 *
 * The logger supports:
 * - Multiple log levels (debug, info, warn, error, fatal)
 * - Type-based filtering (process, secret, security, performance, audit)
 * - Rich metadata for context and debugging
 * - Configurable behavior and formatting
 * - Security-aware handling of sensitive data
 *
 * @example
 * ```typescript
 * const logger: Logger = createLogger({
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
 * // Security logging
 * logger.logSecurity('warn', 'AuthService', 'Multiple failed login attempts', {
 *   userId: 'user-789',
 *   context: { attemptCount: 3 }
 * });
 * ```
 *
 * @public
 */
export interface Logger {
  /** Configuration for logger behavior */
  readonly config: LoggerConfig;

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
  ): void;

  /**
   * Log debug information for development and troubleshooting
   *
   * @param service - The service or component name
   * @param message - The debug message
   * @param metadata - Optional metadata for additional context
   */
  debug(service: string, message: string, metadata?: LogMetadata): void;

  /**
   * Log informational messages for normal operations
   *
   * @param service - The service or component name
   * @param message - The informational message
   * @param metadata - Optional metadata for additional context
   */
  info(service: string, message: string, metadata?: LogMetadata): void;

  /**
   * Log warning messages for potentially problematic situations
   *
   * @param service - The service or component name
   * @param message - The warning message
   * @param metadata - Optional metadata for additional context
   */
  warn(service: string, message: string, metadata?: LogMetadata): void;

  /**
   * Log error messages for error conditions
   *
   * @param service - The service or component name
   * @param message - The error message
   * @param metadata - Optional metadata including error details
   */
  error(service: string, message: string, metadata?: LogMetadata): void;

  /**
   * Log fatal error messages for critical system failures
   *
   * @param service - The service or component name
   * @param message - The fatal error message
   * @param metadata - Optional metadata including error details
   */
  fatal(service: string, message: string, metadata?: LogMetadata): void;

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
  logPerformance(service: string, message: string, metadata: LogMetadata): void;

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
  ): void;

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
  logAudit(service: string, action: string, metadata: LogMetadata): void;

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
  updateConfig(config: Partial<LoggerConfig>): void;

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
  isLevelEnabled(level: LogLevel): boolean;

  /**
   * Check if a given log type is enabled based on current configuration
   *
   * @param type - The log type to check
   * @returns True if the type would be logged, false otherwise
   */
  isTypeEnabled(type: LogType): boolean;
}
