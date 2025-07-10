import { describe, expect, it } from 'vitest';
import {
  EphemeralECDHPublicJwk,
  ephemeralECDHPublicJwkSchema,
} from '../EphemeralECDHPublicJwk';

describe('EphemeralECDHPublicJwk', () => {
  const validJwkObject = {
    kty: 'EC',
    crv: 'P-256',
    x: 'example-x-coordinate',
    y: 'example-y-coordinate',
  };

  const validJwkString = JSON.stringify(validJwkObject);

  describe('ephemeralECDHPublicJwkSchema', () => {
    describe('valid cases', () => {
      it('should validate valid JWK JSON string', () => {
        expect(() =>
          ephemeralECDHPublicJwkSchema.parse(validJwkString)
        ).not.toThrow();

        const result = ephemeralECDHPublicJwkSchema.parse(validJwkString);
        expect(result).toBe(validJwkString);
      });

      it('should validate JWK with additional properties', () => {
        const jwkWithExtra = {
          ...validJwkObject,
          use: 'enc',
          kid: 'key-id-123',
          alg: 'ECDH-ES',
        };
        const jwkString = JSON.stringify(jwkWithExtra);

        expect(() =>
          ephemeralECDHPublicJwkSchema.parse(jwkString)
        ).not.toThrow();
      });

      it('should validate different curve types', () => {
        const curves = ['P-256', 'P-384', 'P-521', 'secp256k1'];

        for (const crv of curves) {
          const jwk = { ...validJwkObject, crv };
          const jwkString = JSON.stringify(jwk);

          expect(() =>
            ephemeralECDHPublicJwkSchema.parse(jwkString)
          ).not.toThrow();
        }
      });

      it('should validate different key types', () => {
        const keyTypes = ['EC', 'OKP'];

        for (const kty of keyTypes) {
          const jwk = { ...validJwkObject, kty };
          const jwkString = JSON.stringify(jwk);

          expect(() =>
            ephemeralECDHPublicJwkSchema.parse(jwkString)
          ).not.toThrow();
        }
      });

      it('should validate JWK with long coordinate values', () => {
        const jwkWithLongCoords = {
          ...validJwkObject,
          x: 'very-long-x-coordinate-value-that-represents-elliptic-curve-point',
          y: 'very-long-y-coordinate-value-that-represents-elliptic-curve-point',
        };
        const jwkString = JSON.stringify(jwkWithLongCoords);

        expect(() =>
          ephemeralECDHPublicJwkSchema.parse(jwkString)
        ).not.toThrow();
      });
    });

    describe('invalid cases', () => {
      it('should reject non-string input', () => {
        const invalidInputs = [
          null,
          undefined,
          123,
          [],
          {},
          true,
          false,
          Symbol('jwk'),
        ];

        for (const input of invalidInputs) {
          expect(() => ephemeralECDHPublicJwkSchema.parse(input)).toThrow();
        }
      });

      it('should reject invalid JSON strings', () => {
        const invalidJsonStrings = [
          'not json',
          '{invalid json}',
          '{"missing": "quote}',
          '{trailing comma,}',
          'null',
          'true',
          '123',
          '[]',
        ];

        for (const invalidJson of invalidJsonStrings) {
          expect(() =>
            ephemeralECDHPublicJwkSchema.parse(invalidJson)
          ).toThrow();
        }
      });

      it('should reject JWK missing required properties', () => {
        const missingProps = [
          { crv: 'P-256', x: 'x-coord', y: 'y-coord' }, // missing kty
          { kty: 'EC', x: 'x-coord', y: 'y-coord' }, // missing crv
          { kty: 'EC', crv: 'P-256', y: 'y-coord' }, // missing x
          { kty: 'EC', crv: 'P-256', x: 'x-coord' }, // missing y
          {}, // missing all
        ];

        for (const jwk of missingProps) {
          const jwkString = JSON.stringify(jwk);
          expect(() => ephemeralECDHPublicJwkSchema.parse(jwkString)).toThrow();
        }
      });

      it('should reject JWK with invalid property types', () => {
        const invalidTypes = [
          { kty: 123, crv: 'P-256', x: 'x-coord', y: 'y-coord' },
          { kty: 'EC', crv: null, x: 'x-coord', y: 'y-coord' },
          { kty: 'EC', crv: 'P-256', x: [], y: 'y-coord' },
          { kty: 'EC', crv: 'P-256', x: 'x-coord', y: {} },
        ];

        for (const jwk of invalidTypes) {
          const jwkString = JSON.stringify(jwk);
          expect(() => ephemeralECDHPublicJwkSchema.parse(jwkString)).toThrow();
        }
      });

      it('should reject empty string', () => {
        expect(() => ephemeralECDHPublicJwkSchema.parse('')).toThrow();
      });
    });

    describe('error messages', () => {
      it('should provide meaningful error message for invalid JWK', () => {
        const invalidJwk = JSON.stringify({ kty: 'EC' });

        expect(() => ephemeralECDHPublicJwkSchema.parse(invalidJwk)).toThrow(
          'Must be a valid JSON string representing a JWK with kty, crv, x, and y properties'
        );
      });

      it('should provide meaningful error message for non-JSON', () => {
        expect(() => ephemeralECDHPublicJwkSchema.parse('not json')).toThrow(
          'Must be a valid JSON string representing a JWK with kty, crv, x, and y properties'
        );
      });
    });

    describe('edge cases', () => {
      it('should handle JWK with empty string properties', () => {
        const jwkWithEmptyStrings = {
          kty: '',
          crv: '',
          x: '',
          y: '',
        };
        const jwkString = JSON.stringify(jwkWithEmptyStrings);

        expect(() =>
          ephemeralECDHPublicJwkSchema.parse(jwkString)
        ).not.toThrow();
      });

      it('should handle JWK with whitespace in properties', () => {
        const jwkWithWhitespace = {
          kty: '  EC  ',
          crv: '\tP-256\n',
          x: ' x-coordinate ',
          y: '\ny-coordinate\t',
        };
        const jwkString = JSON.stringify(jwkWithWhitespace);

        expect(() =>
          ephemeralECDHPublicJwkSchema.parse(jwkString)
        ).not.toThrow();
      });

      it('should handle JWK with Unicode characters', () => {
        const jwkWithUnicode = {
          kty: 'EC',
          crv: 'P-256',
          x: 'x-coordinate-🔐',
          y: 'y-coordinate-中文',
        };
        const jwkString = JSON.stringify(jwkWithUnicode);

        expect(() =>
          ephemeralECDHPublicJwkSchema.parse(jwkString)
        ).not.toThrow();
      });

      it('should handle formatted JSON strings', () => {
        const formattedJwk = JSON.stringify(validJwkObject, null, 2);
        expect(() =>
          ephemeralECDHPublicJwkSchema.parse(formattedJwk)
        ).not.toThrow();
      });
    });
  });

  describe('EphemeralECDHPublicJwk class', () => {
    it('should create instance with provided value', () => {
      const jwk = new EphemeralECDHPublicJwk(validJwkString);

      expect(jwk.value).toBe(validJwkString);
    });

    it('should serialize to JSON correctly', () => {
      const jwk = new EphemeralECDHPublicJwk(validJwkString);
      const serialized = jwk.toJSON();

      expect(serialized).toBe(validJwkString);
    });

    it('should work with JSON.stringify', () => {
      const jwk = new EphemeralECDHPublicJwk(validJwkString);
      const stringified = JSON.stringify(jwk);

      // When JSON.stringify is called on the object, it uses toJSON() which returns the value
      // The result is a double-encoded JSON string
      expect(stringified).toBe(JSON.stringify(validJwkString));
    });

    it('should handle empty string value', () => {
      const jwk = new EphemeralECDHPublicJwk('');

      expect(jwk.value).toBe('');
      expect(jwk.toJSON()).toBe('');
    });

    it('should handle complex JWK strings', () => {
      const complexJwk = {
        kty: 'EC',
        crv: 'P-384',
        x: 'base64url-encoded-x-coordinate-for-p384-curve',
        y: 'base64url-encoded-y-coordinate-for-p384-curve',
        use: 'enc',
        kid: 'ephemeral-key-2023-12-01',
        alg: 'ECDH-ES+A256KW',
      };
      const complexJwkString = JSON.stringify(complexJwk);
      const jwk = new EphemeralECDHPublicJwk(complexJwkString);

      expect(jwk.value).toBe(complexJwkString);
      expect(jwk.toJSON()).toBe(complexJwkString);
    });

    it('should be immutable', () => {
      const originalValue = validJwkString;
      const jwk = new EphemeralECDHPublicJwk(originalValue);

      // Value should not change after creation
      expect(jwk.value).toBe(originalValue);

      // Should not be able to modify the value (readonly)
      expect(() => {
        jwk.value = 'modified';
      }).not.toThrow();
    });

    it('should handle special characters in JWK values', () => {
      const specialJwk = {
        kty: 'EC',
        crv: 'P-256',
        x: 'special!@#$%^&*()characters',
        y: 'unicode-ñ-中文-🔐',
      };
      const specialJwkString = JSON.stringify(specialJwk);
      const jwk = new EphemeralECDHPublicJwk(specialJwkString);

      expect(jwk.value).toBe(specialJwkString);
    });
  });

  describe('integration tests', () => {
    it('should work together with schema validation', () => {
      // Validate first, then create instance
      const validatedJwkString =
        ephemeralECDHPublicJwkSchema.parse(validJwkString);
      const jwk = new EphemeralECDHPublicJwk(validatedJwkString);

      expect(jwk.value).toBe(validJwkString);
      expect(jwk.toJSON()).toBe(validJwkString);
    });

    it('should handle round-trip serialization', () => {
      const originalJwk = new EphemeralECDHPublicJwk(validJwkString);
      const serialized = JSON.stringify(originalJwk);
      const parsed = JSON.parse(serialized);
      const reconstructed = new EphemeralECDHPublicJwk(parsed);

      expect(reconstructed.value).toBe(originalJwk.value);
    });

    it('should work in object contexts', () => {
      interface KeyExchange {
        publicKey: EphemeralECDHPublicJwk;
        algorithm: string;
      }

      const keyExchange: KeyExchange = {
        publicKey: new EphemeralECDHPublicJwk(validJwkString),
        algorithm: 'ECDH-ES',
      };

      expect(keyExchange.publicKey.value).toBe(validJwkString);

      const serialized = JSON.stringify(keyExchange);
      const parsed = JSON.parse(serialized);

      expect(parsed.publicKey).toBe(validJwkString);
    });
  });
});
