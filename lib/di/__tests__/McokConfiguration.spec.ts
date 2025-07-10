import { beforeEach, describe, expect, it } from 'vitest';
import { AbstractConfiguration } from '../AbstractConfiguration';
import { MockConfiguration } from '../McokConfiguration';

/**
 * Test suite for MockConfiguration class
 */
describe('MockConfiguration', () => {
  let mockConfig: MockConfiguration;

  beforeEach(() => {
    mockConfig = new MockConfiguration();
  });

  describe('Class Structure', () => {
    it('should be an instance of MockConfiguration', () => {
      expect(mockConfig).toBeInstanceOf(MockConfiguration);
    });

    it('should extend AbstractConfiguration', () => {
      expect(mockConfig).toBeInstanceOf(AbstractConfiguration);
    });

    it('should implement all required abstract methods', () => {
      expect(typeof mockConfig.apiBaseUrl).toBe('function');
      expect(typeof mockConfig.initTransactionApiPath).toBe('function');
      expect(typeof mockConfig.getWalletResponseApiPath).toBe('function');
      expect(typeof mockConfig.publicUrl).toBe('function');
      expect(typeof mockConfig.walletUrl).toBe('function');
      expect(typeof mockConfig.walletResponseRedirectPath).toBe('function');
      expect(typeof mockConfig.loggerConfig).toBe('function');
    });
  });

  describe('API Configuration Methods', () => {
    it('should return correct API base URL', () => {
      expect(mockConfig.apiBaseUrl()).toBe('https://api.test.com');
    });

    it('should return correct init transaction API path', () => {
      expect(mockConfig.initTransactionApiPath()).toBe('/api/init');
    });

    it('should return correct wallet response API path', () => {
      expect(mockConfig.getWalletResponseApiPath()).toBe(
        '/api/wallet-response'
      );
    });

    it('should return consistent API configuration values', () => {
      const baseUrl = mockConfig.apiBaseUrl();
      const initPath = mockConfig.initTransactionApiPath();
      const walletPath = mockConfig.getWalletResponseApiPath();

      expect(baseUrl).toMatch(/^https:\/\//);
      expect(initPath).toMatch(/^\/api\//);
      expect(walletPath).toMatch(/^\/api\//);
    });
  });

  describe('Application URL Methods', () => {
    it('should return correct public URL', () => {
      expect(mockConfig.publicUrl()).toBe('https://test.com');
    });

    it('should return correct wallet URL', () => {
      expect(mockConfig.walletUrl()).toBe('https://wallet.test.com');
    });

    it('should return correct wallet response redirect path', () => {
      expect(mockConfig.walletResponseRedirectPath()).toBe('/callback');
    });

    it('should return valid URL formats', () => {
      const publicUrl = mockConfig.publicUrl();
      const walletUrl = mockConfig.walletUrl();
      const redirectPath = mockConfig.walletResponseRedirectPath();

      expect(publicUrl).toMatch(/^https:\/\//);
      expect(walletUrl).toMatch(/^https:\/\//);
      expect(redirectPath).toMatch(/^\//);
    });
  });

  describe('Logger Configuration', () => {
    it('should return valid logger configuration', () => {
      const loggerConfig = mockConfig.loggerConfig();

      expect(loggerConfig).toBeDefined();
      expect(typeof loggerConfig).toBe('object');
    });

    it('should have correct logger configuration structure', () => {
      const loggerConfig = mockConfig.loggerConfig();

      expect(loggerConfig).toHaveProperty('minLevel');
      expect(loggerConfig).toHaveProperty('processLogging');
      expect(loggerConfig).toHaveProperty('secretLogging');
      expect(loggerConfig).toHaveProperty('securityLogging');
      expect(loggerConfig).toHaveProperty('performanceLogging');
      expect(loggerConfig).toHaveProperty('auditLogging');
      expect(loggerConfig).toHaveProperty('includeTimestamp');
      expect(loggerConfig).toHaveProperty('includeMetadata');
    });

    it('should have correct logger configuration values', () => {
      const loggerConfig = mockConfig.loggerConfig();

      expect(loggerConfig.minLevel).toBe('info');
      expect(loggerConfig.processLogging).toBe(true);
      expect(loggerConfig.secretLogging).toBe(false);
      expect(loggerConfig.securityLogging).toBe(true);
      expect(loggerConfig.performanceLogging).toBe(false);
      expect(loggerConfig.auditLogging).toBe(true);
      expect(loggerConfig.includeTimestamp).toBe(true);
      expect(loggerConfig.includeMetadata).toBe(false);
    });

    it('should have appropriate security settings for testing', () => {
      const loggerConfig = mockConfig.loggerConfig();

      // Secret logging should be disabled for security
      expect(loggerConfig.secretLogging).toBe(false);
      // Security logging should be enabled for testing
      expect(loggerConfig.securityLogging).toBe(true);
      // Audit logging should be enabled for testing
      expect(loggerConfig.auditLogging).toBe(true);
    });
  });

  describe('Inherited Methods from AbstractConfiguration', () => {
    it('should have access to default view paths', () => {
      expect(typeof mockConfig.homeViewPath).toBe('function');
      expect(typeof mockConfig.initTransactionViewPath).toBe('function');
      expect(typeof mockConfig.resultViewPath).toBe('function');
    });

    it('should return default view paths', () => {
      expect(mockConfig.homeViewPath()).toBe('/home');
      expect(mockConfig.initTransactionViewPath()).toBe('/init');
      expect(mockConfig.resultViewPath()).toBe('/result');
    });

    it('should have access to default protocol settings', () => {
      expect(typeof mockConfig.tokenType).toBe('function');
      expect(typeof mockConfig.walletResponseRedirectQueryTemplate).toBe(
        'function'
      );
    });

    it('should return default protocol settings', () => {
      expect(mockConfig.tokenType()).toBe('vp_token');
      expect(mockConfig.walletResponseRedirectQueryTemplate()).toBe(
        '{RESPONSE_CODE}'
      );
    });

    it('should have access to authorization response configuration', () => {
      expect(typeof mockConfig.authorizationEncryptedResponseAlg).toBe(
        'function'
      );
      expect(typeof mockConfig.authorizationEncryptedResponseEnc).toBe(
        'function'
      );
      expect(typeof mockConfig.jarmOption).toBe('function');
    });
  });

  describe('Test Utility Validation', () => {
    it('should provide consistent values across multiple calls', () => {
      const apiUrl1 = mockConfig.apiBaseUrl();
      const apiUrl2 = mockConfig.apiBaseUrl();
      expect(apiUrl1).toBe(apiUrl2);

      const publicUrl1 = mockConfig.publicUrl();
      const publicUrl2 = mockConfig.publicUrl();
      expect(publicUrl1).toBe(publicUrl2);
    });

    it('should provide test-appropriate configuration values', () => {
      // All URLs should be test domains
      expect(mockConfig.apiBaseUrl()).toContain('test.com');
      expect(mockConfig.publicUrl()).toContain('test.com');
      expect(mockConfig.walletUrl()).toContain('test.com');

      // Paths should be realistic API endpoints
      expect(mockConfig.initTransactionApiPath()).toContain('init');
      expect(mockConfig.getWalletResponseApiPath()).toContain(
        'wallet-response'
      );
    });

    it('should be suitable for testing scenarios', () => {
      // Logger should be configured for testing visibility
      const loggerConfig = mockConfig.loggerConfig();
      expect(loggerConfig.minLevel).toBe('info'); // Visible for test debugging
      expect(loggerConfig.includeTimestamp).toBe(true); // Useful for test tracing
      expect(loggerConfig.secretLogging).toBe(false); // Secure for tests
    });
  });

  describe('Integration with Dependency Injection', () => {
    it('should work as a Configuration dependency', () => {
      // Mock configuration should satisfy Configuration interface
      expect(mockConfig.apiBaseUrl()).toBeDefined();
      expect(mockConfig.publicUrl()).toBeDefined();
      expect(mockConfig.loggerConfig()).toBeDefined();
    });

    it('should provide all required configuration methods for services', () => {
      // Verify all methods required by service classes are available
      const requiredMethods = [
        'apiBaseUrl',
        'initTransactionApiPath',
        'getWalletResponseApiPath',
        'publicUrl',
        'walletUrl',
        'walletResponseRedirectPath',
        'loggerConfig',
        'tokenType',
        'jarmOption',
      ];

      requiredMethods.forEach((method) => {
        expect(typeof (mockConfig as any)[method]).toBe('function');
        expect((mockConfig as any)[method]()).toBeDefined();
      });
    });
  });
});
