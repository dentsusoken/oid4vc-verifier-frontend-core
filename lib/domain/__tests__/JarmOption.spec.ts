import { beforeEach, describe, expect, it } from 'vitest';
import { JarmOption } from '../JarmOption';

describe('JarmOption', () => {
  describe('JarmOption.Signed', () => {
    const testAlgorithm = 'RS256';
    let signed: JarmOption.Signed;

    beforeEach(() => {
      signed = new JarmOption.Signed(testAlgorithm);
    });

    it('should create instance with correct type discriminator', () => {
      expect(signed.__type).toBe('Signed');
    });

    it('should store algorithm correctly', () => {
      expect(signed.algorithm).toBe(testAlgorithm);
    });

    it('should return algorithm for jwsAlg()', () => {
      expect(signed.jwsAlg()).toBe(testAlgorithm);
    });

    it('should return undefined for jweAlg()', () => {
      expect(signed.jweAlg()).toBeUndefined();
    });

    it('should return undefined for jweEnc()', () => {
      expect(signed.jweEnc()).toBeUndefined();
    });

    it('should handle different signing algorithms', () => {
      const algorithms = ['RS256', 'ES256', 'PS256', 'HS256'];

      for (const alg of algorithms) {
        const signedInstance = new JarmOption.Signed(alg);
        expect(signedInstance.algorithm).toBe(alg);
        expect(signedInstance.jwsAlg()).toBe(alg);
      }
    });
  });

  describe('JarmOption.Encrypted', () => {
    const testAlgorithm = 'RSA-OAEP';
    const testEncMethod = 'A256GCM';
    let encrypted: JarmOption.Encrypted;

    beforeEach(() => {
      encrypted = new JarmOption.Encrypted(testAlgorithm, testEncMethod);
    });

    it('should create instance with correct type discriminator', () => {
      expect(encrypted.__type).toBe('Encrypted');
    });

    it('should store algorithm and encryption method correctly', () => {
      expect(encrypted.algorithm).toBe(testAlgorithm);
      expect(encrypted.encMethod).toBe(testEncMethod);
    });

    it('should return undefined for jwsAlg()', () => {
      expect(encrypted.jwsAlg()).toBeUndefined();
    });

    it('should return algorithm for jweAlg()', () => {
      expect(encrypted.jweAlg()).toBe(testAlgorithm);
    });

    it('should return encryption method for jweEnc()', () => {
      expect(encrypted.jweEnc()).toBe(testEncMethod);
    });

    it('should handle different encryption configurations', () => {
      const configs = [
        { alg: 'RSA-OAEP', enc: 'A256GCM' },
        { alg: 'RSA-OAEP-256', enc: 'A192GCM' },
        { alg: 'ECDH-ES', enc: 'A128GCM' },
        { alg: 'dir', enc: 'A256CBC-HS512' },
      ];

      for (const config of configs) {
        const encryptedInstance = new JarmOption.Encrypted(
          config.alg,
          config.enc
        );
        expect(encryptedInstance.algorithm).toBe(config.alg);
        expect(encryptedInstance.encMethod).toBe(config.enc);
        expect(encryptedInstance.jweAlg()).toBe(config.alg);
        expect(encryptedInstance.jweEnc()).toBe(config.enc);
      }
    });
  });

  describe('JarmOption.SignedAndEncrypted', () => {
    const signedAlg = 'RS256';
    const encryptionAlg = 'RSA-OAEP';
    const encryptionMethod = 'A256GCM';

    let signed: JarmOption.Signed;
    let encrypted: JarmOption.Encrypted;
    let signedAndEncrypted: JarmOption.SignedAndEncrypted;

    beforeEach(() => {
      signed = new JarmOption.Signed(signedAlg);
      encrypted = new JarmOption.Encrypted(encryptionAlg, encryptionMethod);
      signedAndEncrypted = new JarmOption.SignedAndEncrypted(signed, encrypted);
    });

    it('should create instance with correct type discriminator', () => {
      expect(signedAndEncrypted.__type).toBe('SignedAndEncrypted');
    });

    it('should store signed and encrypted options correctly', () => {
      expect(signedAndEncrypted.signed).toBe(signed);
      expect(signedAndEncrypted.encrypted).toBe(encrypted);
    });

    it('should return signing algorithm for jwsAlg()', () => {
      expect(signedAndEncrypted.jwsAlg()).toBe(signedAlg);
    });

    it('should return encryption algorithm for jweAlg()', () => {
      expect(signedAndEncrypted.jweAlg()).toBe(encryptionAlg);
    });

    it('should return encryption method for jweEnc()', () => {
      expect(signedAndEncrypted.jweEnc()).toBe(encryptionMethod);
    });

    it('should delegate to nested objects correctly', () => {
      expect(signedAndEncrypted.jwsAlg()).toBe(signed.jwsAlg());
      expect(signedAndEncrypted.jweAlg()).toBe(encrypted.jweAlg());
      expect(signedAndEncrypted.jweEnc()).toBe(encrypted.jweEnc());
    });

    it('should handle complex nested configurations', () => {
      const complexSigned = new JarmOption.Signed('ES256');
      const complexEncrypted = new JarmOption.Encrypted(
        'ECDH-ES+A256KW',
        'A128CBC-HS256'
      );
      const complex = new JarmOption.SignedAndEncrypted(
        complexSigned,
        complexEncrypted
      );

      expect(complex.jwsAlg()).toBe('ES256');
      expect(complex.jweAlg()).toBe('ECDH-ES+A256KW');
      expect(complex.jweEnc()).toBe('A128CBC-HS256');
    });
  });

  describe('type discrimination and polymorphism', () => {
    it('should distinguish between different JarmOption types', () => {
      const signed = new JarmOption.Signed('RS256');
      const encrypted = new JarmOption.Encrypted('RSA-OAEP', 'A256GCM');
      const signedAndEncrypted = new JarmOption.SignedAndEncrypted(
        signed,
        encrypted
      );

      expect(signed.__type).toBe('Signed');
      expect(encrypted.__type).toBe('Encrypted');
      expect(signedAndEncrypted.__type).toBe('SignedAndEncrypted');
    });

    it('should work with type guards', () => {
      function isSigned(option: JarmOption): option is JarmOption.Signed {
        return option.__type === 'Signed';
      }

      function isEncrypted(option: JarmOption): option is JarmOption.Encrypted {
        return option.__type === 'Encrypted';
      }

      function isSignedAndEncrypted(
        option: JarmOption
      ): option is JarmOption.SignedAndEncrypted {
        return option.__type === 'SignedAndEncrypted';
      }

      const signed = new JarmOption.Signed('RS256');
      const encrypted = new JarmOption.Encrypted('RSA-OAEP', 'A256GCM');
      const both = new JarmOption.SignedAndEncrypted(signed, encrypted);

      expect(isSigned(signed)).toBe(true);
      expect(isSigned(encrypted)).toBe(false);
      expect(isSigned(both)).toBe(false);

      expect(isEncrypted(signed)).toBe(false);
      expect(isEncrypted(encrypted)).toBe(true);
      expect(isEncrypted(both)).toBe(false);

      expect(isSignedAndEncrypted(signed)).toBe(false);
      expect(isSignedAndEncrypted(encrypted)).toBe(false);
      expect(isSignedAndEncrypted(both)).toBe(true);
    });

    it('should work with switch statements', () => {
      function getDescription(option: JarmOption): string {
        switch (option.__type) {
          case 'Signed':
            return `Signed with ${option.jwsAlg()}`;
          case 'Encrypted':
            return `Encrypted with ${option.jweAlg()}/${option.jweEnc()}`;
          case 'SignedAndEncrypted':
            return `Signed with ${option.jwsAlg()} and encrypted with ${option.jweAlg()}/${option.jweEnc()}`;
          default:
            // @ts-expect-error - This should never happen
            throw new Error(`Unknown JARM option type: ${option.__type}`);
        }
      }

      const signed = new JarmOption.Signed('RS256');
      const encrypted = new JarmOption.Encrypted('RSA-OAEP', 'A256GCM');
      const both = new JarmOption.SignedAndEncrypted(signed, encrypted);

      expect(getDescription(signed)).toBe('Signed with RS256');
      expect(getDescription(encrypted)).toBe('Encrypted with RSA-OAEP/A256GCM');
      expect(getDescription(both)).toBe(
        'Signed with RS256 and encrypted with RSA-OAEP/A256GCM'
      );
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle empty algorithm strings', () => {
      const signedEmpty = new JarmOption.Signed('');
      const encryptedEmpty = new JarmOption.Encrypted('', '');

      expect(signedEmpty.jwsAlg()).toBe('');
      expect(encryptedEmpty.jweAlg()).toBe('');
      expect(encryptedEmpty.jweEnc()).toBe('');
    });

    it('should handle whitespace in algorithms', () => {
      const signedWithSpaces = new JarmOption.Signed('  RS256  ');
      expect(signedWithSpaces.jwsAlg()).toBe('  RS256  ');
    });

    it('should handle special characters in algorithms', () => {
      const specialAlg = 'ECDH-ES+A256KW';
      const specialEnc = 'A128CBC-HS256';
      const encrypted = new JarmOption.Encrypted(specialAlg, specialEnc);

      expect(encrypted.jweAlg()).toBe(specialAlg);
      expect(encrypted.jweEnc()).toBe(specialEnc);
    });
  });
});
