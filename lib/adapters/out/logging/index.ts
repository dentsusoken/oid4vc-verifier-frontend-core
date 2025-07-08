/**
 * Logging adapters module
 *
 * Provides concrete implementations of the logging interfaces using
 * standard console APIs with production-ready features.
 *
 * @public
 */

export {
  createDefaultLogger,
  createDevelopmentLogger,
  createLogger,
  createProductionLogger,
  DefaultLogger,
} from './DefaultLogger';

export type {
  Logger,
  LoggerConfig,
  LogLevel,
  LogMetadata,
  LogType,
} from '../../../ports/out/logging/Logger';
