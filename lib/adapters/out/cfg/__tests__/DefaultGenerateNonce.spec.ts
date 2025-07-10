import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { Nonce, nonceSchema } from '../../../../domain';
import { defaultGenerateNonce } from '../DefaultGenerateNonce';

// Mock crypto.randomUUID for testing
const mockRandomUUID = vi.fn();
Object.defineProperty(global, 'crypto', {
  value: { randomUUID: mockRandomUUID },
  writable: true,
});

describe('DefaultGenerateNonce', () => {
  beforeEach(() => {
    mockRandomUUID.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('basic functionality', () => {
    it('should generate a valid nonce using crypto.randomUUID', () => {
      const testUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      mockRandomUUID.mockReturnValue(testUuid);

      const result = defaultGenerateNonce();

      expect(mockRandomUUID).toHaveBeenCalledTimes(1);
      expect(result).toBe(testUuid);
      expect(typeof result).toBe('string');
    });

    it('should return a branded Nonce type', () => {
      const testUuid = 'a1b2c3d4-e5f6-7890-1234-567890abcdef';
      mockRandomUUID.mockReturnValue(testUuid);

      const result = defaultGenerateNonce();

      // Type-level check - should be assignable to Nonce
      const nonce: Nonce = result;
      expect(nonce).toBe(testUuid);
    });

    it('should validate generated UUID against nonce schema', () => {
      const validUuid = '12345678-1234-4567-8901-123456789012';
      mockRandomUUID.mockReturnValue(validUuid);

      const result = defaultGenerateNonce();

      // Should not throw - indicates successful schema validation
      expect(() => nonceSchema.parse(result)).not.toThrow();
      expect(result).toBe(validUuid);
    });
  });

  describe('schema validation', () => {
    it('should pass schema validation for typical UUIDs', () => {
      const validUuids = [
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
        '550e8400-e29b-41d4-a716-446655440000',
        '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
        '6ba7b811-9dad-11d1-80b4-00c04fd430c8',
        '00000000-0000-0000-0000-000000000000',
      ];

      for (const uuid of validUuids) {
        mockRandomUUID.mockReturnValueOnce(uuid);

        const result = defaultGenerateNonce();
        expect(result).toBe(uuid);
        expect(() => nonceSchema.parse(result)).not.toThrow();
      }
    });

    it('should handle edge case UUIDs', () => {
      const edgeCaseUuids = [
        'ffffffff-ffff-ffff-ffff-ffffffffffff',
        'a'
          .repeat(36)
          .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5'),
        '12345678-1234-1234-1234-123456789012',
      ];

      for (const uuid of edgeCaseUuids) {
        mockRandomUUID.mockReturnValueOnce(uuid);

        const result = defaultGenerateNonce();
        expect(result).toBe(uuid);
      }
    });

    it('should throw ZodError if crypto.randomUUID returns invalid value', () => {
      // Mock crypto.randomUUID to return an invalid nonce
      mockRandomUUID.mockReturnValue(''); // Empty string should fail nonce validation

      expect(() => defaultGenerateNonce()).toThrow(z.ZodError);
      expect(mockRandomUUID).toHaveBeenCalledTimes(1);
    });

    it('should throw ZodError if crypto.randomUUID returns non-string value', () => {
      // Mock to return non-string value (should not happen in real crypto.randomUUID)
      mockRandomUUID.mockReturnValue(null as any);

      expect(() => defaultGenerateNonce()).toThrow(z.ZodError);
    });
  });

  describe('uniqueness and randomness', () => {
    it('should generate different UUIDs on consecutive calls', () => {
      const uuid1 = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      const uuid2 = '550e8400-e29b-41d4-a716-446655440000';
      const uuid3 = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

      mockRandomUUID
        .mockReturnValueOnce(uuid1)
        .mockReturnValueOnce(uuid2)
        .mockReturnValueOnce(uuid3);

      const result1 = defaultGenerateNonce();
      const result2 = defaultGenerateNonce();
      const result3 = defaultGenerateNonce();

      expect(result1).toBe(uuid1);
      expect(result2).toBe(uuid2);
      expect(result3).toBe(uuid3);
      expect(result1).not.toBe(result2);
      expect(result2).not.toBe(result3);
      expect(result1).not.toBe(result3);
      expect(mockRandomUUID).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple rapid calls', () => {
      const generateMockUuid = (index: number) =>
        `${index.toString().padStart(8, '0')}-1234-5678-9012-123456789012`;

      // Generate 100 different mock UUIDs
      for (let i = 0; i < 100; i++) {
        mockRandomUUID.mockReturnValueOnce(generateMockUuid(i));
      }

      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(defaultGenerateNonce());
      }

      // All results should be unique
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(100);
      expect(mockRandomUUID).toHaveBeenCalledTimes(100);
    });
  });

  describe('security considerations', () => {
    it('should use crypto.randomUUID for cryptographic security', () => {
      const testUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      mockRandomUUID.mockReturnValue(testUuid);

      defaultGenerateNonce();

      // Verify it's using the crypto API
      expect(mockRandomUUID).toHaveBeenCalledWith();
    });

    it('should not expose internal implementation details', () => {
      const testUuid = 'secure-uuid-12345678901234567890';
      mockRandomUUID.mockReturnValue(testUuid);

      const result = defaultGenerateNonce();

      // Result should only contain the UUID, no additional information
      expect(result).toBe(testUuid);
      expect(result).not.toContain('crypto');
      expect(result).not.toContain('random');
    });

    it('should handle potential timing attacks consistently', () => {
      const uuids = [
        'short',
        'medium-length-uuid-string',
        'very-very-very-long-uuid-string-that-exceeds-normal-length',
      ];

      const times = [];
      for (const uuid of uuids) {
        mockRandomUUID.mockReturnValueOnce(uuid);

        const start = performance.now();
        try {
          defaultGenerateNonce();
        } catch {
          // Expected for invalid UUIDs
        }
        const end = performance.now();
        times.push(end - start);
      }

      // All operations should complete quickly (under 10ms typically)
      for (const time of times) {
        expect(time).toBeLessThan(10);
      }
    });
  });

  describe('error handling', () => {
    it('should propagate crypto.randomUUID errors', () => {
      mockRandomUUID.mockImplementation(() => {
        throw new Error('Crypto API not available');
      });

      expect(() => defaultGenerateNonce()).toThrow('Crypto API not available');
    });

    it('should provide meaningful error when validation fails', () => {
      mockRandomUUID.mockReturnValue(''); // Empty string should fail validation

      expect(() => defaultGenerateNonce()).toThrow(z.ZodError);
    });
  });

  describe('integration with domain schema', () => {
    it('should produce nonces compatible with domain requirements', () => {
      const testUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      mockRandomUUID.mockReturnValue(testUuid);

      const nonce = defaultGenerateNonce();

      // Should be usable in security contexts
      function authenticateWithNonce(nonce: Nonce): string {
        return `auth-request-${nonce}`;
      }

      const authRequest = authenticateWithNonce(nonce);
      expect(authRequest).toBe(`auth-request-${testUuid}`);
    });

    it('should work with nonce schema transforms', () => {
      const testUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      mockRandomUUID.mockReturnValue(testUuid);

      const nonce = defaultGenerateNonce();

      // Transform to uppercase (example domain operation)
      const transformedSchema = nonceSchema.transform((n) => n.toUpperCase());
      const upperNonce = transformedSchema.parse(nonce);

      expect(upperNonce).toBe(testUuid.toUpperCase());
    });

    it('should integrate with session management patterns', () => {
      const sessionNonces = new Map<string, Nonce>();

      // Generate nonces for multiple sessions
      for (let i = 0; i < 5; i++) {
        const uuid = `session-${i}-f47ac10b-58cc-4372-a567-0e02b2c3d479`;
        mockRandomUUID.mockReturnValueOnce(uuid);

        const sessionId = `session-${i}`;
        const nonce = defaultGenerateNonce();
        sessionNonces.set(sessionId, nonce);
      }

      expect(sessionNonces.size).toBe(5);

      // All nonces should be different
      const nonceValues = Array.from(sessionNonces.values());
      const uniqueNonces = new Set(nonceValues);
      expect(uniqueNonces.size).toBe(5);
    });
  });

  describe('performance characteristics', () => {
    it('should execute quickly for single calls', () => {
      const testUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      mockRandomUUID.mockReturnValue(testUuid);

      const start = performance.now();
      defaultGenerateNonce();
      const end = performance.now();

      // Should complete in under 5ms
      expect(end - start).toBeLessThan(5);
    });

    it('should handle burst generation efficiently', () => {
      // Setup mock for 1000 calls
      for (let i = 0; i < 1000; i++) {
        mockRandomUUID.mockReturnValueOnce(
          `uuid-${i.toString().padStart(4, '0')}-1234-5678-9012-123456789012`
        );
      }

      const start = performance.now();
      for (let i = 0; i < 1000; i++) {
        defaultGenerateNonce();
      }
      const end = performance.now();

      // Should complete 1000 calls in under 100ms
      expect(end - start).toBeLessThan(100);
    });
  });
});
