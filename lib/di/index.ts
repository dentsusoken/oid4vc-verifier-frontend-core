/**
 * Dependency Injection (DI) module for the OID4VC verification system
 *
 * This module provides the core dependency injection infrastructure following
 * the hexagonal architecture pattern. It exports interfaces and abstract base
 * classes that define contracts for input and output ports, as well as
 * configuration management.
 *
 * ## Architecture Overview
 *
 * The module implements the Ports and Adapters (Hexagonal) architecture:
 * - **Input Ports**: Entry points to application use cases (e.g., REST APIs)
 * - **Output Ports**: Interfaces to external systems (HTTP clients, databases, etc.)
 * - **Configuration**: Environment-specific settings and operational parameters
 *
 * ## Key Components
 *
 * ### Interfaces
 * - `PortsInput` - Contract for application entry points
 * - `PortsOut` - Contract for external system dependencies
 * - `Configuration` - Contract for application configuration
 *
 * ### Abstract Base Classes
 * - `AbstractPortsOut` - Default implementations for most output ports
 * - `AbstractConfiguration` - Default implementations for configuration values
 *
 * ## Usage Pattern
 *
 * ```typescript
 * // 1. Create environment-specific configuration
 * class ProductionConfig extends AbstractConfiguration {
 *   apiBaseUrl() { return process.env.API_URL || 'https://api.prod.com'; }
 *   publicUrl() { return process.env.PUBLIC_URL || 'https://app.prod.com'; }
 *   walletUrl() { return process.env.WALLET_URL || 'https://wallet.prod.com'; }
 *   initTransactionApiPath() { return '/api/v1/init'; }
 *   walletResponseRedirectPath() { return '/callback'; }
 * }
 *
 * // 2. Create ports implementation
 * class ProductionPortsOut extends AbstractPortsOut {
 *   generatePresentationDefinition() {
 *     return createPresentationDefinitionService();
 *   }
 *   session() {
 *     return createRedisSession(this.config.redisUrl());
 *   }
 * }
 *
 * // 3. Implement input ports
 * class DefaultPortsInput implements PortsInput {
 *   constructor(private portsOut: PortsOut) {}
 *   initTransaction() {
 *     return createInitTransactionService(this.portsOut);
 *   }
 * }
 *
 * // 4. Wire everything together
 * const config = new ProductionConfig();
 * const portsOut = new ProductionPortsOut(config);
 * const portsInput = new DefaultPortsInput(portsOut);
 *
 * // 5. Use in application
 * const app = createApp(portsInput);
 * ```
 *
 * ## Benefits
 *
 * - **Testability**: Easy mocking and unit testing through interfaces
 * - **Flexibility**: Swap implementations for different environments
 * - **Separation of Concerns**: Clear boundaries between business logic and infrastructure
 * - **Type Safety**: Full TypeScript support with compile-time validation
 * - **Configuration Management**: Centralized, type-safe configuration handling
 *
 * @see {@link PortsInput} - Application entry point interface
 * @see {@link PortsOut} - External dependency interface
 * @see {@link Configuration} - Application configuration interface
 * @see {@link AbstractPortsOut} - Base implementation for output ports
 * @see {@link AbstractConfiguration} - Base implementation for configuration
 * @see {@link createInitTransactionService} - Service to initialize a transaction
 * @see {@link PortsInputImpl} - Implementation of the input ports
 *
 * @module DependencyInjection
 * @public
 */

export * from './AbstractConfiguration';
export * from './AbstractPortsOut';
export * from './Configuration';
export * from './PortsInput';
export * from './PortsInputImpl';
export * from './PortsOut';
