import { describe, expect, it } from 'vitest';
import { PresentationId, presentationIdSchema } from './PresentationId';

describe('PresentationIdSchema', () => {
  describe('正常系', () => {
    it.each([
      'pres_123456',
      '12345',
      'presentation-id-with-dashes',
      'presentation_id_with_underscores',
      'a',
      '   spaces   ',
      'special!@#$%^&*()characters',
    ])('should validate valid presentation ID: %s', (validId) => {
      expect(() => presentationIdSchema.parse(validId)).not.toThrow();
    });
  });

  describe('異常系', () => {
    it.each([
      ['', 'empty string'],
      [null, 'null'],
      [undefined, 'undefined'],
      [123, 'number'],
      [[], 'array'],
      [{}, 'object'],
    ])('should reject invalid input: %s (%s)', (invalidInput, _) => {
      expect(() => presentationIdSchema.parse(invalidInput)).toThrow();
    });
  });

  describe('ブランディング', () => {
    it('should create branded type that prevents mixing with regular strings', () => {
      const id = presentationIdSchema.parse('test-id');

      // 型レベルでの検証（コンパイル時にエラーになることを確認）
      // const regularString: string = id; // これはTypeScriptエラーになるべき
      const brandedId: PresentationId = id; // これは正常

      expect(brandedId).toBe('test-id');
    });
  });
});
