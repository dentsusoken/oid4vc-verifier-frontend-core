import { beforeEach, describe, expect, it } from 'vitest';
import { GeneratePresentationDefinition } from '../../ports';
import { AbstractPortsOut } from '../AbstractPortsOut';
import { MockPortsOut } from '../McokPortsOut';

/**
 * Test suite for MockPortsOut class
 */
describe('MockPortsOut', () => {
  let mockPortsOut: MockPortsOut<
    Record<string, GeneratePresentationDefinition>
  >;

  beforeEach(() => {
    mockPortsOut = new MockPortsOut<
      Record<string, GeneratePresentationDefinition>
    >();
  });

  describe('Class Structure', () => {
    it('should be an instance of MockPortsOut', () => {
      expect(mockPortsOut).toBeInstanceOf(MockPortsOut);
    });

    it('should extend AbstractPortsOut', () => {
      expect(mockPortsOut).toBeInstanceOf(AbstractPortsOut);
    });

    it('should implement all required abstract methods', () => {
      expect(typeof mockPortsOut.generatePresentationDefinition).toBe(
        'function'
      );
      expect(typeof mockPortsOut.mdocVerifier).toBe('function');
      expect(typeof mockPortsOut.session).toBe('function');
    });
  });

  describe('Abstract Method Implementations', () => {
    it('should implement generatePresentationDefinition method', () => {
      const generator = mockPortsOut.generatePresentationDefinition('test');

      expect(generator).toBeDefined();
      expect(typeof generator).toBe('function');
    });

    it('should implement mdocVerifier method', () => {
      const verifier = mockPortsOut.mdocVerifier();

      expect(verifier).toBeDefined();
      expect(typeof verifier).toBe('object');
      expect(typeof verifier.verify).toBe('function');
    });

    it('should implement session method', () => {
      const session = mockPortsOut.session();

      expect(session).toBeDefined();
      expect(typeof session).toBe('object');
      expect(typeof session.get).toBe('function');
      expect(typeof session.set).toBe('function');
      expect(typeof session.delete).toBe('function');
    });
  });

  describe('Presentation Definition Generator', () => {
    it('should return a valid presentation definition generator', () => {
      const generator = mockPortsOut.generatePresentationDefinition('test');
      const presentationDef = generator();

      expect(presentationDef).toBeDefined();
      expect(presentationDef).toHaveProperty('id');
      expect(presentationDef).toHaveProperty('name');
      expect(presentationDef).toHaveProperty('purpose');
      expect(presentationDef).toHaveProperty('input_descriptors');
    });

    it('should generate consistent presentation definitions', () => {
      const generator = mockPortsOut.generatePresentationDefinition('test');
      const def1 = generator();
      const def2 = generator();

      expect(def1).toEqual(def2);
      expect(def1.id).toBe('123');
      expect(def1.name).toBe('Test Presentation');
    });

    it('should return presentation definition with valid structure', () => {
      const generator = mockPortsOut.generatePresentationDefinition('test');
      const presentationDef = generator();

      expect(Array.isArray(presentationDef.input_descriptors)).toBe(true);
      expect(presentationDef.input_descriptors?.length).toBeGreaterThan(0);

      const descriptor = presentationDef.input_descriptors?.[0];
      expect(descriptor).toHaveProperty('id');
      expect(descriptor).toHaveProperty('constraints');
      expect(descriptor?.constraints).toHaveProperty('fields');
    });
  });

  describe('mDoc Verifier', () => {
    it('should return a valid mDoc verifier instance', () => {
      const verifier = mockPortsOut.mdocVerifier();

      expect(verifier).toBeDefined();
      expect(typeof verifier.verify).toBe('function');
    });

    it('should return the same verifier instance on multiple calls', () => {
      const verifier1 = mockPortsOut.mdocVerifier();
      const verifier2 = mockPortsOut.mdocVerifier();

      expect(verifier1).toBe(verifier2);
    });
  });

  describe('Session Management', () => {
    it('should return a new session instance', () => {
      const session = mockPortsOut.session();

      expect(session).toBeDefined();
      expect(typeof session.get).toBe('function');
      expect(typeof session.set).toBe('function');
      expect(typeof session.delete).toBe('function');
      expect(typeof session.clear).toBe('function');
      expect(typeof session.has).toBe('function');
      expect(typeof session.keys).toBe('function');
      expect(typeof session.size).toBe('function');
    });

    it('should return different session instances on multiple calls', () => {
      const session1 = mockPortsOut.session();
      const session2 = mockPortsOut.session();

      expect(session1).not.toBe(session2);
      expect(session1.constructor).toBe(session2.constructor);
    });

    it('should return session with async methods', async () => {
      const session = mockPortsOut.session();

      // Test basic session operations
      await expect(
        session.set('presentationId', 'test-id' as any)
      ).resolves.toBeUndefined();
      await expect(session.get('presentationId')).resolves.toBe('test-id');
      await expect(session.has('presentationId')).resolves.toBe(true);
      await expect(session.delete('presentationId')).resolves.toBe('test-id');
      await expect(session.has('presentationId')).resolves.toBe(false);
    });
  });

  describe('Inherited Methods from AbstractPortsOut', () => {
    it('should have access to default implementations', () => {
      expect(typeof mockPortsOut.generateNonce).toBe('function');
      expect(typeof mockPortsOut.generateWalletRedirectUri).toBe('function');
      expect(
        typeof mockPortsOut.generateWalletResponseRedirectUriTemplate
      ).toBe('function');
      expect(typeof mockPortsOut.fetcher).toBe('function');
      expect(typeof mockPortsOut.isMobile).toBe('function');
      expect(typeof mockPortsOut.generateEphemeralECDHPrivateJwk).toBe(
        'function'
      );
      expect(typeof mockPortsOut.verifyJarmJwt).toBe('function');
    });

    it('should return valid implementations from inherited methods', () => {
      const nonce = mockPortsOut.generateNonce();
      const fetcher = mockPortsOut.fetcher();

      expect(typeof nonce).toBe('function');
      expect(typeof fetcher).toBe('object');
    });
  });

  describe('Test Utility Validation', () => {
    it('should provide consistent behavior across multiple instantiations', () => {
      const mockPortsOut2 = new MockPortsOut();

      const generator1 = mockPortsOut.generatePresentationDefinition('test');
      const generator2 = mockPortsOut2.generatePresentationDefinition('test');

      const def1 = generator1();
      const def2 = generator2();

      expect(def1).toEqual(def2);
    });

    it('should be suitable for dependency injection', () => {
      // MockPortsOut should satisfy PortsOut interface requirements
      expect(mockPortsOut.generatePresentationDefinition('test')).toBeDefined();
      expect(mockPortsOut.mdocVerifier()).toBeDefined();
      expect(mockPortsOut.session()).toBeDefined();
    });

    it('should provide all methods required by services', () => {
      const requiredMethods = [
        'generateNonce',
        'generateWalletRedirectUri',
        'generateWalletResponseRedirectUriTemplate',
        'fetcher',
        'isMobile',
        'generatePresentationDefinition',
        'mdocVerifier',
        'session',
        'generateEphemeralECDHPrivateJwk',
        'verifyJarmJwt',
      ];

      requiredMethods.forEach((method) => {
        expect(typeof (mockPortsOut as any)[method]).toBe('function');
        expect((mockPortsOut as any)[method]()).toBeDefined();
      });
    });
  });
});
