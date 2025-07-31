import { AbstractConfiguration } from './AbstractConfiguration';

/**
 * Mock implementation of Configuration interface for testing purposes
 *
 * Provides test-specific configuration values that can be used in unit tests
 * and integration tests. This class extends AbstractConfiguration and implements
 * all required abstract methods with predefined test values.
 *
 * @example
 * ```typescript
 * const mockConfig = new MockConfiguration();
 * const apiUrl = mockConfig.apiBaseUrl(); // Returns 'https://api.test.com'
 * ```
 *
 * @public
 */
export class MockConfiguration extends AbstractConfiguration {
  /**
   * Returns the base URL for API endpoints
   *
   * @returns The test API base URL
   */
  apiBaseUrl(): string {
    return 'https://api.test.com';
  }

  /**
   * Returns the API path for transaction initialization
   *
   * @returns The init transaction API endpoint path
   */
  initTransactionApiPath(): string {
    return '/api/init';
  }

  /**
   * Returns the API path for wallet response handling
   *
   * @returns The wallet response API endpoint path
   */
  getWalletResponseApiPath(): string {
    return '/api/wallet-response';
  }

  /**
   * Returns the public URL of the application
   *
   * @returns The test public URL
   */
  publicUrl(): string {
    return 'https://test.com';
  }

  /**
   * Returns the wallet application URL
   *
   * @returns The test wallet URL
   */
  walletUrl(): string {
    return 'https://wallet.test.com';
  }

  /**
   * Returns the redirect path for wallet responses
   *
   * @returns The callback path for wallet redirects
   */
  walletResponseRedirectPath(): string {
    return '/callback';
  }
}
