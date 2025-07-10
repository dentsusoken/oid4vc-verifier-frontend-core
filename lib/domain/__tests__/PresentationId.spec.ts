import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { PresentationId, presentationIdSchema } from '../PresentationId';

describe('PresentationId', () => {
  describe('presentationIdSchema', () => {
    describe('valid cases', () => {
      it.each([
        ['pres_123456', 'typical presentation ID with prefix'],
        ['12345', 'numeric string'],
        ['presentation-id-with-dashes', 'hyphenated format'],
        ['presentation_id_with_underscores', 'underscore format'],
        ['a', 'single character'],
        ['   spaces   ', 'string with surrounding spaces'],
        ['special!@#$%^&*()characters', 'special characters'],
        [
          'very-long-presentation-id-with-many-characters-that-should-still-be-valid',
          'long string',
        ],
        ['UUID-like-f47ac10b-58cc-4372-a567-0e02b2c3d479', 'UUID-like format'],
      ])('should validate %s (%s)', (validId, description) => {
        expect(() => presentationIdSchema.parse(validId)).not.toThrow();

        const result = presentationIdSchema.parse(validId);
        expect(result).toBe(validId);
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
        [Symbol('test'), 'symbol'],
        [new Date(), 'date object'],
      ])('should reject %s (%s)', (invalidInput, description) => {
        expect(() => presentationIdSchema.parse(invalidInput)).toThrow(
          z.ZodError
        );
      });
    });

    describe('error messages', () => {
      it('should provide meaningful error message for empty string', () => {
        expect(() => presentationIdSchema.parse('')).toThrow(
          'Presentation ID must not be empty'
        );
      });

      it('should provide meaningful error message for non-string types', () => {
        expect(() => presentationIdSchema.parse(123)).toThrow();
        expect(() => presentationIdSchema.parse(null)).toThrow();
      });
    });

    describe('branded type behavior', () => {
      it('should create branded type that is distinct from regular string', () => {
        const id = presentationIdSchema.parse('test-id');
        const regularString: string = 'test-id';

        // Both should have the same runtime value
        expect(id).toBe(regularString);

        // But the branded type should be assignable to PresentationId
        const brandedId: PresentationId = id;
        expect(brandedId).toBe('test-id');
      });

      it('should maintain type safety in function parameters', () => {
        // This is a compile-time test - the function signature ensures type safety
        function processPresentationId(id: PresentationId): string {
          return `Processing: ${id}`;
        }

        const validId = presentationIdSchema.parse('pres_123');
        const result = processPresentationId(validId);

        expect(result).toBe('Processing: pres_123');
      });
    });

    describe('edge cases', () => {
      it('should handle whitespace-only strings', () => {
        const whitespaceString = '   ';
        expect(() =>
          presentationIdSchema.parse(whitespaceString)
        ).not.toThrow();

        const result = presentationIdSchema.parse(whitespaceString);
        expect(result).toBe(whitespaceString);
      });

      it('should handle strings with newlines and tabs', () => {
        const stringWithWhitespace = 'test\n\tid';
        expect(() =>
          presentationIdSchema.parse(stringWithWhitespace)
        ).not.toThrow();

        const result = presentationIdSchema.parse(stringWithWhitespace);
        expect(result).toBe(stringWithWhitespace);
      });

      it('should handle Unicode characters', () => {
        const unicodeString = 'pres_123_🔐_ñ_中文';
        expect(() => presentationIdSchema.parse(unicodeString)).not.toThrow();

        const result = presentationIdSchema.parse(unicodeString);
        expect(result).toBe(unicodeString);
      });
    });
  });

  describe('type inference', () => {
    it('should correctly infer PresentationId type', () => {
      const id = presentationIdSchema.parse('test-id');

      // Type assertion to verify the inferred type
      const _typeCheck: PresentationId = id;
      expect(_typeCheck).toBe('test-id');
    });
  });

  describe('integration with zod features', () => {
    it('should work with zod transform', () => {
      const transformedSchema = presentationIdSchema.transform((id) =>
        id.toUpperCase()
      );

      const result = transformedSchema.parse('lowercase-id');
      expect(result).toBe('LOWERCASE-ID');
    });

    it('should work with zod optional', () => {
      const optionalSchema = presentationIdSchema.optional();

      expect(optionalSchema.parse(undefined)).toBeUndefined();
      expect(optionalSchema.parse('valid-id')).toBe('valid-id');
    });

    it('should work with zod default', () => {
      const defaultSchema = presentationIdSchema.default(
        'default-presentation-id'
      );

      expect(defaultSchema.parse(undefined)).toBe('default-presentation-id');
      expect(defaultSchema.parse('custom-id')).toBe('custom-id');
    });
  });
});
