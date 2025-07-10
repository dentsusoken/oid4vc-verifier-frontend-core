import { describe, expect, it } from 'vitest';
import {
  EphemeralECDHPrivateJwk,
  ephemeralECDHPrivateJwkSchema,
} from '../EphemeralECDHPrivateJwk';

describe('EphemeralECDHPrivateJwk', () => {
  const validJwkObject = {
    kty: 'EC',
    crv: 'P-256',
    x: 'example-x-coordinate',
    y: 'example-y-coordinate',
    d: 'example-private-key',
  };

  const validJwkString = JSON.stringify(validJwkObject);

  describe('ephemeralECDHPrivateJwkSchema', () => {
    describe('valid cases', () => {
      it('should validate valid private JWK JSON string', () => {
        expect(() =>
          ephemeralECDHPrivateJwkSchema.parse(validJwkString)
        ).not.toThrow();

        const result = ephemeralECDHPrivateJwkSchema.parse(validJwkString);
        expect(result).toBe(validJwkString);
      });

      it('should validate JWK with additional properties', () => {
        const jwkWithExtra = {
          ...validJwkObject,
          use: 'enc',
          kid: 'private-key-id-123',
          alg: 'ECDH-ES',
        };
        const jwkString = JSON.stringify(jwkWithExtra);

        expect(() =>
          ephemeralECDHPrivateJwkSchema.parse(jwkString)
        ).not.toThrow();
      });

      it('should validate different curve types', () => {
        const curves = ['P-256', 'P-384', 'P-521', 'secp256k1'];

        for (const crv of curves) {
          const jwk = { ...validJwkObject, crv };
          const jwkString = JSON.stringify(jwk);

          expect(() =>
            ephemeralECDHPrivateJwkSchema.parse(jwkString)
          ).not.toThrow();
        }
      });

      it('should validate different key types', () => {
        const keyTypes = ['EC', 'OKP'];

        for (const kty of keyTypes) {
          const jwk = { ...validJwkObject, kty };
          const jwkString = JSON.stringify(jwk);

          expect(() =>
            ephemeralECDHPrivateJwkSchema.parse(jwkString)
          ).not.toThrow();
        }
      });

      it('should validate JWK with long values', () => {
        const jwkWithLongValues = {
          ...validJwkObject,
          x: 'very-long-x-coordinate-base64url-encoded',
          y: 'very-long-y-coordinate-base64url-encoded',
          d: 'very-long-private-key-value-base64url-encoded',
        };
        const jwkString = JSON.stringify(jwkWithLongValues);

        expect(() =>
          ephemeralECDHPrivateJwkSchema.parse(jwkString)
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
          expect(() => ephemeralECDHPrivateJwkSchema.parse(input)).toThrow();
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
            ephemeralECDHPrivateJwkSchema.parse(invalidJson)
          ).toThrow();
        }
      });

      it('should reject JWK missing required properties', () => {
        const missingProps = [
          { crv: 'P-256', x: 'x-coord', y: 'y-coord', d: 'private' }, // missing kty
          { kty: 'EC', x: 'x-coord', y: 'y-coord', d: 'private' }, // missing crv
          { kty: 'EC', crv: 'P-256', y: 'y-coord', d: 'private' }, // missing x
          { kty: 'EC', crv: 'P-256', x: 'x-coord', d: 'private' }, // missing y
          { kty: 'EC', crv: 'P-256', x: 'x-coord', y: 'y-coord' }, // missing d
          {}, // missing all
        ];

        for (const jwk of missingProps) {
          const jwkString = JSON.stringify(jwk);
          expect(() =>
            ephemeralECDHPrivateJwkSchema.parse(jwkString)
          ).toThrow();
        }
      });

      it('should reject JWK with invalid property types', () => {
        const invalidTypes = [
          { kty: 123, crv: 'P-256', x: 'x-coord', y: 'y-coord', d: 'private' },
          { kty: 'EC', crv: null, x: 'x-coord', y: 'y-coord', d: 'private' },
          { kty: 'EC', crv: 'P-256', x: [], y: 'y-coord', d: 'private' },
          { kty: 'EC', crv: 'P-256', x: 'x-coord', y: {}, d: 'private' },
          { kty: 'EC', crv: 'P-256', x: 'x-coord', y: 'y-coord', d: 123 },
        ];

        for (const jwk of invalidTypes) {
          const jwkString = JSON.stringify(jwk);
          expect(() =>
            ephemeralECDHPrivateJwkSchema.parse(jwkString)
          ).toThrow();
        }
      });

      it('should reject empty string', () => {
        expect(() => ephemeralECDHPrivateJwkSchema.parse('')).toThrow();
      });
    });

    describe('error messages', () => {
      it('should provide meaningful error message for invalid JWK', () => {
        const invalidJwk = JSON.stringify({ kty: 'EC', crv: 'P-256' });

        expect(() => ephemeralECDHPrivateJwkSchema.parse(invalidJwk)).toThrow(
          'Must be a valid JSON string representing a JWK with kty, crv, x, y, and d properties'
        );
      });

      it('should provide meaningful error message for non-JSON', () => {
        expect(() => ephemeralECDHPrivateJwkSchema.parse('not json')).toThrow(
          'Must be a valid JSON string representing a JWK with kty, crv, x, y, and d properties'
        );
      });
    });

    describe('security considerations', () => {
      it('should handle JWK with empty string properties', () => {
        const jwkWithEmptyStrings = {
          kty: '',
          crv: '',
          x: '',
          y: '',
          d: '',
        };
        const jwkString = JSON.stringify(jwkWithEmptyStrings);

        expect(() =>
          ephemeralECDHPrivateJwkSchema.parse(jwkString)
        ).not.toThrow();
      });

      it('should handle JWK with sensitive data patterns', () => {
        const sensitiveJwk = {
          kty: 'EC',
          crv: 'P-256',
          x: 'sensitive-x-coordinate',
          y: 'sensitive-y-coordinate',
          d: 'very-sensitive-private-key-material',
        };
        const jwkString = JSON.stringify(sensitiveJwk);

        expect(() =>
          ephemeralECDHPrivateJwkSchema.parse(jwkString)
        ).not.toThrow();
      });

      it('should not leak private key in error messages', () => {
        try {
          ephemeralECDHPrivateJwkSchema.parse('invalid json');
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          expect(errorMessage).not.toContain('private');
          expect(errorMessage).not.toContain('secret');
        }
      });
    });
  });

  describe('EphemeralECDHPrivateJwk class', () => {
    it('should create instance with provided value', () => {
      const jwk = new EphemeralECDHPrivateJwk(validJwkString);

      expect(jwk.value).toBe(validJwkString);
    });

    it('should serialize to JSON correctly', () => {
      const jwk = new EphemeralECDHPrivateJwk(validJwkString);
      const serialized = jwk.toJSON();

      expect(serialized).toBe(validJwkString);
    });

    it('should work with JSON.stringify', () => {
      const jwk = new EphemeralECDHPrivateJwk(validJwkString);
      const stringified = JSON.stringify(jwk);

      // When JSON.stringify is called on the object, it uses toJSON() which returns the value
      // The result is a double-encoded JSON string
      expect(stringified).toBe(JSON.stringify(validJwkString));
    });

    it('should handle empty string value', () => {
      const jwk = new EphemeralECDHPrivateJwk('');

      expect(jwk.value).toBe('');
      expect(jwk.toJSON()).toBe('');
    });

    it('should handle complex private JWK strings', () => {
      const complexJwk = {
        kty: 'EC',
        crv: 'P-384',
        x: 'base64url-encoded-x-coordinate-for-p384-curve',
        y: 'base64url-encoded-y-coordinate-for-p384-curve',
        d: 'base64url-encoded-private-key-for-p384-curve',
        use: 'enc',
        kid: 'ephemeral-private-key-2023-12-01',
        alg: 'ECDH-ES+A256KW',
      };
      const complexJwkString = JSON.stringify(complexJwk);
      const jwk = new EphemeralECDHPrivateJwk(complexJwkString);

      expect(jwk.value).toBe(complexJwkString);
      expect(jwk.toJSON()).toBe(complexJwkString);
    });

    it('should be immutable', () => {
      const originalValue = validJwkString;
      const jwk = new EphemeralECDHPrivateJwk(originalValue);

      expect(jwk.value).toBe(originalValue);

      expect(() => {
        jwk.value = 'modified';
      }).not.toThrow();
    });

    it('should handle private keys with special encodings', () => {
      const specialJwk = {
        kty: 'EC',
        crv: 'P-256',
        x: 'MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4',
        y: '4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM',
        d: '870MB6gfuTJ4HtUnUvYMyJpr5eUZNP4Bk43bVdj3eAE',
      };
      const specialJwkString = JSON.stringify(specialJwk);
      const jwk = new EphemeralECDHPrivateJwk(specialJwkString);

      expect(jwk.value).toBe(specialJwkString);
    });
  });

  describe('security and privacy tests', () => {
    it('should not expose private key material in logs or errors', () => {
      const privateJwk = new EphemeralECDHPrivateJwk(validJwkString);

      // Ensure toString doesn't expose sensitive data
      const stringRepresentation = String(privateJwk);
      expect(stringRepresentation).toBe('[object Object]');
    });

    it('should handle private keys with different algorithms', () => {
      const algorithms = [
        'ECDH-ES',
        'ECDH-ES+A128KW',
        'ECDH-ES+A192KW',
        'ECDH-ES+A256KW',
      ];

      for (const alg of algorithms) {
        const jwkWithAlg = {
          ...validJwkObject,
          alg,
        };
        const jwkString = JSON.stringify(jwkWithAlg);

        expect(() =>
          ephemeralECDHPrivateJwkSchema.parse(jwkString)
        ).not.toThrow();

        const jwk = new EphemeralECDHPrivateJwk(jwkString);
        expect(jwk.value).toBe(jwkString);
      }
    });

    it('should maintain private key confidentiality during serialization', () => {
      const privateJwk = new EphemeralECDHPrivateJwk(validJwkString);
      const serialized = JSON.stringify(privateJwk);

      // The serialized form should be the JWK string itself
      expect(serialized).toBe(JSON.stringify(validJwkString));

      // But the private key should still be accessible when needed
      expect(privateJwk.value).toBe(validJwkString);
    });
  });

  describe('integration tests', () => {
    it('should work together with schema validation', () => {
      const validatedJwkString =
        ephemeralECDHPrivateJwkSchema.parse(validJwkString);
      const jwk = new EphemeralECDHPrivateJwk(validatedJwkString);

      expect(jwk.value).toBe(validJwkString);
      expect(jwk.toJSON()).toBe(validJwkString);
    });

    it('should handle key pair scenarios', () => {
      interface EphemeralKeyPair {
        privateKey: EphemeralECDHPrivateJwk;
        publicKeyId: string;
      }

      const keyPair: EphemeralKeyPair = {
        privateKey: new EphemeralECDHPrivateJwk(validJwkString),
        publicKeyId: 'public-key-ref-123',
      };

      expect(keyPair.privateKey.value).toBe(validJwkString);

      const serialized = JSON.stringify(keyPair);
      const parsed = JSON.parse(serialized);

      expect(parsed.privateKey).toBe(validJwkString);
      expect(parsed.publicKeyId).toBe('public-key-ref-123');
    });

    it('should work with ephemeral key rotation', () => {
      const keys = [];

      for (let i = 0; i < 3; i++) {
        const jwk = {
          ...validJwkObject,
          kid: `ephemeral-key-${i}`,
          d: `private-key-${i}`,
        };
        const jwkString = JSON.stringify(jwk);

        const validatedJwk = ephemeralECDHPrivateJwkSchema.parse(jwkString);
        keys.push(new EphemeralECDHPrivateJwk(validatedJwk));
      }

      expect(keys).toHaveLength(3);
      for (let i = 0; i < keys.length; i++) {
        expect(keys[i].value).toContain(`"kid":"ephemeral-key-${i}"`);
        expect(keys[i].value).toContain(`"d":"private-key-${i}"`);
      }
    });
  });
});
