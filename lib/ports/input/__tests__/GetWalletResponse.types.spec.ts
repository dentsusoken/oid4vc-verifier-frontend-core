import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  GetWalletResponseResponse,
  GetWalletResponseResponseSchema,
  type GetWalletResponseResponseJSON,
  type GetWalletResponseResult,
} from '../GetWalletResponse.types';

/**
 * Test suite for GetWalletResponse.types
 */
describe('GetWalletResponse.types', () => {
  describe('GetWalletResponseResponseSchema', () => {
    it('should be defined', () => {
      expect(GetWalletResponseResponseSchema).toBeDefined();
    });

    it('should be a Zod object schema', () => {
      expect(GetWalletResponseResponseSchema).toBeInstanceOf(z.ZodObject);
    });

    describe('Valid schema validation', () => {
      it('should validate valid response data', () => {
        const validData = {
          state: 'test-state-123',
          response: 'test-response-data',
        };

        expect(() =>
          GetWalletResponseResponseSchema.parse(validData)
        ).not.toThrow();
        const result = GetWalletResponseResponseSchema.parse(validData);
        expect(result).toEqual(validData);
      });

      it('should validate with different string values', () => {
        const testCases = [
          { state: 'abc', response: 'xyz' },
          { state: '123', response: '456' },
          { state: 'state-with-dashes', response: 'response_with_underscores' },
          { state: '', response: '' }, // Empty strings should be valid
        ];

        testCases.forEach((testCase) => {
          expect(() =>
            GetWalletResponseResponseSchema.parse(testCase)
          ).not.toThrow();
        });
      });
    });

    describe('Invalid schema validation', () => {
      it('should reject missing state', () => {
        const invalidData = {
          response: 'test-response',
        };

        expect(() =>
          GetWalletResponseResponseSchema.parse(invalidData)
        ).toThrow(z.ZodError);
      });

      it('should reject missing response', () => {
        const invalidData = {
          state: 'test-state',
        };

        expect(() =>
          GetWalletResponseResponseSchema.parse(invalidData)
        ).toThrow(z.ZodError);
      });

      it('should reject non-string state', () => {
        const invalidData = {
          state: 123,
          response: 'test-response',
        };

        expect(() =>
          GetWalletResponseResponseSchema.parse(invalidData)
        ).toThrow(z.ZodError);
      });

      it('should reject non-string response', () => {
        const invalidData = {
          state: 'test-state',
          response: 123,
        };

        expect(() =>
          GetWalletResponseResponseSchema.parse(invalidData)
        ).toThrow(z.ZodError);
      });

      it('should reject null values', () => {
        const invalidCases = [
          { state: null, response: 'test' },
          { state: 'test', response: null },
          { state: null, response: null },
        ];

        invalidCases.forEach((testCase) => {
          expect(() => GetWalletResponseResponseSchema.parse(testCase)).toThrow(
            z.ZodError
          );
        });
      });

      it('should reject undefined values', () => {
        const invalidCases = [
          { state: undefined, response: 'test' },
          { state: 'test', response: undefined },
        ];

        invalidCases.forEach((testCase) => {
          expect(() => GetWalletResponseResponseSchema.parse(testCase)).toThrow(
            z.ZodError
          );
        });
      });

      it('should accept extra properties (strict mode not enabled)', () => {
        const dataWithExtra = {
          state: 'test-state',
          response: 'test-response',
          extraProperty: 'additional-property',
        };

        // Zod by default allows extra properties unless .strict() is used
        expect(() =>
          GetWalletResponseResponseSchema.parse(dataWithExtra)
        ).not.toThrow();
        const result = GetWalletResponseResponseSchema.parse(dataWithExtra);
        expect(result.state).toBe('test-state');
        expect(result.response).toBe('test-response');
      });
    });
  });

  describe('GetWalletResponseResponse class', () => {
    const validState = 'test-state-123';
    const validResponse = 'test-response-data';

    describe('Constructor', () => {
      it('should create instance with valid parameters', () => {
        const instance = new GetWalletResponseResponse(
          validState,
          validResponse
        );

        expect(instance).toBeInstanceOf(GetWalletResponseResponse);
        expect(instance.state).toBe(validState);
        expect(instance.response).toBe(validResponse);
      });

      it('should have immutable properties (readonly at compile time)', () => {
        const instance = new GetWalletResponseResponse(
          validState,
          validResponse
        );

        // Properties are readonly at compile time, we can verify they exist and are accessible
        expect(instance.state).toBe(validState);
        expect(instance.response).toBe(validResponse);

        // TypeScript readonly properties are compile-time only
        // We can verify the properties are present and have the correct values
        expect(instance).toHaveProperty('state', validState);
        expect(instance).toHaveProperty('response', validResponse);
      });

      it('should handle empty string values', () => {
        const instance = new GetWalletResponseResponse('', '');

        expect(instance.state).toBe('');
        expect(instance.response).toBe('');
      });
    });

    describe('fromJSON static method', () => {
      it('should create instance from valid JSON', () => {
        const json = {
          state: validState,
          response: validResponse,
        };

        const instance = GetWalletResponseResponse.fromJSON(json);

        expect(instance).toBeInstanceOf(GetWalletResponseResponse);
        expect(instance.state).toBe(validState);
        expect(instance.response).toBe(validResponse);
      });

      it('should throw error for invalid JSON', () => {
        const invalidJson = {
          state: validState,
          // missing response
        };

        expect(() => GetWalletResponseResponse.fromJSON(invalidJson)).toThrow(
          z.ZodError
        );
      });

      it('should handle string JSON input', () => {
        const jsonString = JSON.stringify({
          state: validState,
          response: validResponse,
        });

        // Parse the JSON string first, then pass to fromJSON
        const parsed = JSON.parse(jsonString);
        const instance = GetWalletResponseResponse.fromJSON(parsed);

        expect(instance.state).toBe(validState);
        expect(instance.response).toBe(validResponse);
      });

      it('should validate unknown input types', () => {
        const unknownInputs = [null, undefined, 'string', 123, [], true];

        unknownInputs.forEach((input) => {
          expect(() => GetWalletResponseResponse.fromJSON(input)).toThrow();
        });
      });
    });

    describe('toJSON method', () => {
      it('should convert instance to JSON object', () => {
        const instance = new GetWalletResponseResponse(
          validState,
          validResponse
        );
        const json = instance.toJSON();

        expect(json).toEqual({
          state: validState,
          response: validResponse,
        });
      });

      it('should return object with correct type', () => {
        const instance = new GetWalletResponseResponse(
          validState,
          validResponse
        );
        const json = instance.toJSON();

        // Type check - should satisfy GetWalletResponseResponseJSON type
        const typedJson: GetWalletResponseResponseJSON = json;
        expect(typedJson.state).toBe(validState);
        expect(typedJson.response).toBe(validResponse);
      });

      it('should create serializable object', () => {
        const instance = new GetWalletResponseResponse(
          validState,
          validResponse
        );
        const json = instance.toJSON();

        // Should be serializable to JSON string
        expect(() => JSON.stringify(json)).not.toThrow();
        const serialized = JSON.stringify(json);
        const deserialized = JSON.parse(serialized);

        expect(deserialized).toEqual(json);
      });
    });

    describe('Round-trip conversion', () => {
      it('should maintain data integrity through fromJSON -> toJSON', () => {
        const originalData = {
          state: 'original-state',
          response: 'original-response',
        };

        const instance = GetWalletResponseResponse.fromJSON(originalData);
        const convertedData = instance.toJSON();

        expect(convertedData).toEqual(originalData);
      });

      it('should maintain data integrity through constructor -> toJSON -> fromJSON', () => {
        const instance1 = new GetWalletResponseResponse(
          validState,
          validResponse
        );
        const json = instance1.toJSON();
        const instance2 = GetWalletResponseResponse.fromJSON(json);

        expect(instance2.state).toBe(instance1.state);
        expect(instance2.response).toBe(instance1.response);
        expect(instance2.toJSON()).toEqual(instance1.toJSON());
      });
    });
  });

  describe('Type Definitions', () => {
    describe('GetWalletResponseResponseJSON type', () => {
      it('should accept valid JSON structure', () => {
        const validJson: GetWalletResponseResponseJSON = {
          state: 'test-state',
          response: 'test-response',
        };

        expect(validJson.state).toBe('test-state');
        expect(validJson.response).toBe('test-response');
      });

      it('should be compatible with schema validation', () => {
        const jsonData: GetWalletResponseResponseJSON = {
          state: 'test-state',
          response: 'test-response',
        };

        expect(() =>
          GetWalletResponseResponseSchema.parse(jsonData)
        ).not.toThrow();
      });
    });

    describe('GetWalletResponseResult type', () => {
      it('should extend MdocVerifyResult with optional vpToken', () => {
        // This type extends MdocVerifyResult and adds optional vpToken
        // We can test its structure compatibility
        const result: Partial<GetWalletResponseResult> = {
          vpToken: 'test-vp-token',
        };

        expect(result.vpToken).toBe('test-vp-token');
      });

      it('should allow MdocVerifyResult properties', () => {
        // Since it extends MdocVerifyResult, it should accept those properties
        const result: Partial<GetWalletResponseResult> = {
          vpToken: 'test-token',
          // MdocVerifyResult properties would be available here
        };

        expect(typeof result).toBe('object');
      });
    });
  });

  describe('Integration Testing', () => {
    it('should work with real-world data structures', () => {
      const realWorldData = {
        state: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9',
        response:
          'eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9',
      };

      const instance = GetWalletResponseResponse.fromJSON(realWorldData);
      expect(instance.state).toBe(realWorldData.state);
      expect(instance.response).toBe(realWorldData.response);

      const serialized = instance.toJSON();
      expect(serialized).toEqual(realWorldData);
    });

    it('should handle edge cases gracefully', () => {
      const edgeCases = [
        { state: '0', response: '0' },
        { state: ' ', response: ' ' }, // Spaces
        { state: 'state with spaces', response: 'response with spaces' },
        { state: 'state\nwith\nnewlines', response: 'response\twith\ttabs' },
      ];

      edgeCases.forEach((testCase) => {
        expect(() => {
          const instance = GetWalletResponseResponse.fromJSON(testCase);
          const json = instance.toJSON();
          expect(json).toEqual(testCase);
        }).not.toThrow();
      });
    });
  });
});
