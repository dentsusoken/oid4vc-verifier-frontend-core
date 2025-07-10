import { describe, expect, it } from 'vitest';
import { defaultGenerateNonce } from '../DefaultGenerateNonce';
import { defaultGenerateWalletRedirectUri } from '../DefaultGenerateWalletRedirectUri';
import { defaultGenerateWalletResponseRedirectUriTemplate } from '../DefaultGenerateWalletResponseRedirectUriTemplate';
import * as cfgAdapters from '../index';

describe('cfg adapters index', () => {
  describe('exports', () => {
    it('should export all adapter functions', () => {
      expect(cfgAdapters.defaultGenerateNonce).toBeDefined();
      expect(cfgAdapters.defaultGenerateWalletRedirectUri).toBeDefined();
      expect(
        cfgAdapters.defaultGenerateWalletResponseRedirectUriTemplate
      ).toBeDefined();
    });

    it('should export correct function references', () => {
      expect(cfgAdapters.defaultGenerateNonce).toBe(defaultGenerateNonce);
      expect(cfgAdapters.defaultGenerateWalletRedirectUri).toBe(
        defaultGenerateWalletRedirectUri
      );
      expect(cfgAdapters.defaultGenerateWalletResponseRedirectUriTemplate).toBe(
        defaultGenerateWalletResponseRedirectUriTemplate
      );
    });

    it('should export functions with correct types', () => {
      expect(typeof cfgAdapters.defaultGenerateNonce).toBe('function');
      expect(typeof cfgAdapters.defaultGenerateWalletRedirectUri).toBe(
        'function'
      );
      expect(
        typeof cfgAdapters.defaultGenerateWalletResponseRedirectUriTemplate
      ).toBe('function');
    });
  });

  describe('module structure', () => {
    it('should have exactly three exports', () => {
      const exportKeys = Object.keys(cfgAdapters);
      expect(exportKeys).toHaveLength(3);
      expect(exportKeys).toContain('defaultGenerateNonce');
      expect(exportKeys).toContain('defaultGenerateWalletRedirectUri');
      expect(exportKeys).toContain(
        'defaultGenerateWalletResponseRedirectUriTemplate'
      );
    });

    it('should not export any undefined values', () => {
      const exportValues = Object.values(cfgAdapters);
      for (const value of exportValues) {
        expect(value).toBeDefined();
        expect(value).not.toBeNull();
      }
    });

    it('should be a proper ES module', () => {
      expect(cfgAdapters).toBeDefined();
      expect(typeof cfgAdapters).toBe('object');
    });
  });

  describe('function accessibility', () => {
    it('should allow calling exported functions', () => {
      // Test wallet redirect URI function
      expect(() => {
        cfgAdapters.defaultGenerateWalletRedirectUri('https://example.com', {
          client_id: 'test',
          request: 'test_request_jwt',
        });
      }).not.toThrow();

      // Test wallet response redirect URI template function
      expect(() => {
        cfgAdapters.defaultGenerateWalletResponseRedirectUriTemplate(
          'https://example.com',
          '/path',
          '{CODE}'
        );
      }).not.toThrow();
    });
  });

  describe('re-export integrity', () => {
    it('should maintain function identity through re-exports', () => {
      // Verify that re-exported functions maintain their original identity
      const directImportNonce = defaultGenerateNonce;
      const reExportedNonce = cfgAdapters.defaultGenerateNonce;

      expect(directImportNonce === reExportedNonce).toBe(true);
    });

    it('should preserve function names through re-exports', () => {
      expect(cfgAdapters.defaultGenerateNonce.name).toBe(
        'defaultGenerateNonce'
      );
      expect(cfgAdapters.defaultGenerateWalletRedirectUri.name).toBe(
        'defaultGenerateWalletRedirectUri'
      );
      expect(
        cfgAdapters.defaultGenerateWalletResponseRedirectUriTemplate.name
      ).toBe('defaultGenerateWalletResponseRedirectUriTemplate');
    });
  });
});
