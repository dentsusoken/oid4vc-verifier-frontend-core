# OID4VC Verifier Frontend Core

## Overview

This project is a frontend core library for OpenID for Verifiable Credentials (OID4VC) verifiers. It adopts hexagonal architecture (ports and adapters pattern) and provides credential verification functionality based on the OID4VC protocol.

## Key Features

- **Transaction Initialization**: Start transactions for credential exchange with wallets
- **Wallet Response Processing**: Receive and verify credential presentations from wallets
- **JARM Verification**: Validation of JWT secured authorization response messages
- **MDOC Verification**: Validation of ISO/IEC 18013-5 mobile driver's license formats
- **Session Management**: Secure management of transaction states
- **Encryption Support**: Secure communication through ephemeral ECDH key pairs

## Architecture

This library is designed following hexagonal architecture and consists of the following main components:

### Core Modules (`/lib`)

#### 1. **Domain Layer** (`/domain`)

- `AuthorizationResponse`: Domain model for authorization response
- `EphemeralECDHPrivateJwk` / `EphemeralECDHPublicJwk`: Ephemeral ECDH key pairs
- `JarmOption`: JARM (JWT secured authorization response) options
- `Nonce`: Cryptographic nonce management
- `PresentationId`: Presentation identifier

#### 2. **Services Layer** (`/services`)

- `InitTransactionService`: Transaction initialization service
  - User agent validation
  - Nonce generation
  - Ephemeral ECDH key pair generation
  - API communication
  - Session storage
  - Wallet redirect URI generation

- `GetWalletResponseService`: Wallet response retrieval service
  - Session validation
  - API communication
  - JARM JWT verification
  - MDOC verification
  - Return verification results

#### 3. **Ports Layer** (`/ports`)

- **Input Ports** (`/input`): Application entry points
  - `InitTransaction`: Transaction initialization interface
  - `GetWalletResponse`: Wallet response retrieval interface

- **Output Ports** (`/out`): Interfaces to external systems
  - HTTP communication
  - Session management
  - Encryption processing
  - Configuration management

#### 4. **Dependency Injection** (`/di`)

- `PortsInput`: Application entry point contracts
- `PortsOut`: External system dependency contracts
- `Configuration`: Application configuration contracts
- `AbstractPortsOut`: Default implementation of output ports
- `AbstractConfiguration`: Default implementation of configuration

#### 5. **Adapters Layer** (`/adapters`)

- Concrete integration implementations with external systems

## Usage

### Basic Usage Example

```typescript
// 1. Create environment-specific configuration
class ProductionConfig extends AbstractConfiguration {
  apiBaseUrl() { return process.env.API_URL || 'https://api.prod.com'; }
  publicUrl() { return process.env.PUBLIC_URL || 'https://app.prod.com'; }
  walletUrl() { return process.env.WALLET_URL || 'https://wallet.prod.com'; }
  initTransactionApiPath() { return '/api/v1/init'; }
  walletResponseRedirectPath() { return '/callback'; }
}

// 2. Create port implementations
class ProductionPortsOut extends AbstractPortsOut {
  generatePresentationDefinition() {
    return createPresentationDefinitionService();
  }
  session() {
    return createRedisSession(this.config.redisUrl());
  }
}

// 3. Implement input ports
class DefaultPortsInput implements PortsInput {
  constructor(private portsOut: PortsOut) {}
  initTransaction() {
    return createInitTransactionService(this.portsOut);
  }
}

// 4. Wire everything together
const config = new ProductionConfig();
const portsOut = new ProductionPortsOut(config);
const portsInput = new DefaultPortsInput(portsOut);

// 5. Use in application
const app = createApp(portsInput);
```

## Dependencies

### Main Dependencies

- `cbor-x`: CBOR (Concise Binary Object Representation) encoding
- `qrcode`: QR code generation
- `ua-parser-js`: User agent parsing
- `uuid`: UUID generation
- `zod`: Schema validation

### Peer Dependencies

- `@vecrea/oid4vc-core`: OID4VC core functionality
- `@vecrea/oid4vc-prex`: Presentation exchange functionality

## Development

### Scripts

- `npm run build`: Run type checking and build
- `npm test`: Run tests
- `npm run test:coverage`: Run tests with coverage
- `npm run typecheck`: TypeScript type checking

### Testing

The project provides a comprehensive test suite using Vitest:

- Unit tests (for each module)
- Integration tests (interactions between services)
- Error handling tests

## Architecture Benefits

- **Testability**: Easy mocking and unit testing through interfaces
- **Flexibility**: Interchangeable implementations for different environments
- **Separation of Concerns**: Clear boundaries between business logic and infrastructure
- **Type Safety**: Full TypeScript support with compile-time validation
- **Configuration Management**: Centralized and type-safe configuration handling
