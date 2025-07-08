/**
 * Logging module for the OID4VC verification system
 *
 * This module provides a comprehensive logging interface with support for:
 * - Structured logging with multiple levels and types
 * - Security-aware handling of sensitive data
 * - Performance and audit logging capabilities
 * - Configurable behavior for different environments
 * - Rich metadata and contextual information
 *
 * @example
 * ```typescript
 * import { Logger, DEFAULT_LOGGER_CONFIG, sanitizeLogMessage } from '../ports/out/logging';
 *
 * const logger: Logger = createLogger(DEFAULT_LOGGER_CONFIG);
 *
 * logger.info('UserService', 'User login successful', {
 *   requestId: 'req-123',
 *   userId: 'user-456'
 * });
 *
 * logger.logSecurity('warn', 'AuthService', 'Multiple failed attempts', {
 *   context: { attemptCount: 3, ipAddress: '192.168.1.100' }
 * });
 * ```
 *
 * @public
 */

// Core interfaces and types
export type {
  Logger,
  LoggerConfig,
  LogLevel,
  LogMetadata,
  LogType,
} from './Logger';

// Utility types and functions
export {
  createLogTimestamp,
  DEFAULT_LOGGER_CONFIG,
  DEVELOPMENT_LOGGER_CONFIG,
  isLogLevelEnabled,
  isLogTypeEnabled,
  isValidLogLevel,
  isValidLogType,
  LOG_LEVEL_PRIORITY,
  PRODUCTION_LOGGER_CONFIG,
  sanitizeLogMessage,
} from './types';
