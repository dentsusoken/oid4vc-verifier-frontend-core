import { PresentationDefinition } from '@vecrea/oid4vc-prex';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { EphemeralECDHPublicJwk, PresentationId } from '../../../domain';
import {
  InitTransactionRequest,
  InitTransactionRequestSchema,
  InitTransactionResponse,
  initTransactionResponseSchema,
  jarModeSchema,
  presentationDefinitionModeSchema,
  presentationTypeSchema,
  responseModeSchema,
  type InitTransactionResult,
  type JarMode,
  type PresentationDefinitionMode,
  type PresentationType,
  type ResponseMode,
  type WalletRedirectParams,
} from '../InitTransaction.types';

/**
 * Test suite for InitTransaction.types
 */
describe('InitTransaction.types', () => {
  // Test data
  const mockPresentationDefinition = {
    id: 'test-pd-id',
    name: 'Test Presentation Definition',
    purpose: 'Testing purposes',
    input_descriptors: [
      {
        id: 'test-descriptor',
        name: 'Test Descriptor',
        purpose: 'Test purpose',
        constraints: {
          fields: [
            {
              path: ['$.credentialSubject.name'],
              filter: { type: 'string' },
            },
          ],
        },
      },
    ],
  };

  const mockEphemeralJwk = 'test-ephemeral-jwk-string';
  const mockPresentationId = 'test-presentation-id-123' as PresentationId;

  describe('Schema Validations', () => {
    describe('presentationTypeSchema', () => {
      it('should validate valid presentation types', () => {
        const validTypes = ['id_token', 'vp_token', 'id_token vp_token'];

        validTypes.forEach((type) => {
          expect(() => presentationTypeSchema.parse(type)).not.toThrow();
        });
      });

      it('should reject invalid presentation types', () => {
        const invalidTypes = [
          'invalid_token',
          'jwt_token',
          '',
          null,
          undefined,
          123,
        ];

        invalidTypes.forEach((type) => {
          expect(() => presentationTypeSchema.parse(type)).toThrow(z.ZodError);
        });
      });
    });

    describe('responseModeSchema', () => {
      it('should validate valid response modes', () => {
        const validModes = ['direct_post', 'direct_post.jwt'];

        validModes.forEach((mode) => {
          expect(() => responseModeSchema.parse(mode)).not.toThrow();
        });
      });

      it('should reject invalid response modes', () => {
        const invalidModes = ['query', 'fragment', '', null, undefined];

        invalidModes.forEach((mode) => {
          expect(() => responseModeSchema.parse(mode)).toThrow(z.ZodError);
        });
      });
    });

    describe('jarModeSchema', () => {
      it('should validate valid jar modes', () => {
        const validModes = ['by_value', 'by_reference'];

        validModes.forEach((mode) => {
          expect(() => jarModeSchema.parse(mode)).not.toThrow();
        });
      });

      it('should reject invalid jar modes', () => {
        const invalidModes = ['inline', 'external', '', null, undefined];

        invalidModes.forEach((mode) => {
          expect(() => jarModeSchema.parse(mode)).toThrow(z.ZodError);
        });
      });
    });

    describe('presentationDefinitionModeSchema', () => {
      it('should validate valid presentation definition modes', () => {
        const validModes = ['by_value', 'by_reference'];

        validModes.forEach((mode) => {
          expect(() =>
            presentationDefinitionModeSchema.parse(mode)
          ).not.toThrow();
        });
      });

      it('should reject invalid presentation definition modes', () => {
        const invalidModes = ['inline', 'external', '', null, undefined];

        invalidModes.forEach((mode) => {
          expect(() => presentationDefinitionModeSchema.parse(mode)).toThrow(
            z.ZodError
          );
        });
      });
    });

    describe('InitTransactionRequestSchema', () => {
      const validRequestData = {
        type: 'vp_token' as const,
        presentation_definition: mockPresentationDefinition,
        ephemeral_ecdh_public_jwk: mockEphemeralJwk,
        nonce: 'test-nonce',
        response_mode: 'direct_post' as const,
        jar_mode: 'by_value' as const,
        presentation_definition_mode: 'by_reference' as const,
        wallet_response_redirect_uri_template:
          'https://example.com/callback?response={RESPONSE_CODE}',
      };

      it('should validate valid request data', () => {
        expect(() =>
          InitTransactionRequestSchema.parse(validRequestData)
        ).not.toThrow();
      });

      it('should validate with only required fields', () => {
        const minimalData = {
          type: 'vp_token' as const,
          presentation_definition: mockPresentationDefinition,
          ephemeral_ecdh_public_jwk: mockEphemeralJwk,
        };

        expect(() =>
          InitTransactionRequestSchema.parse(minimalData)
        ).not.toThrow();
      });

      it('should reject missing required fields', () => {
        const missingType = { ...validRequestData };
        delete (missingType as any).type;
        expect(() => InitTransactionRequestSchema.parse(missingType)).toThrow(
          z.ZodError
        );

        const missingPd = { ...validRequestData };
        delete (missingPd as any).presentation_definition;
        expect(() => InitTransactionRequestSchema.parse(missingPd)).toThrow(
          z.ZodError
        );

        const missingJwk = { ...validRequestData };
        delete (missingJwk as any).ephemeral_ecdh_public_jwk;
        expect(() => InitTransactionRequestSchema.parse(missingJwk)).toThrow(
          z.ZodError
        );
      });
    });

    describe('initTransactionResponseSchema', () => {
      const validResponseData = {
        presentation_id: mockPresentationId,
        client_id: 'test-client-id',
        request: 'test-request-jwt',
        request_uri: 'https://example.com/request/123',
      };

      it('should validate valid response data', () => {
        expect(() =>
          initTransactionResponseSchema.parse(validResponseData)
        ).not.toThrow();
      });

      it('should validate with only required fields', () => {
        const minimalData = {
          presentation_id: mockPresentationId,
          client_id: 'test-client-id',
        };

        expect(() =>
          initTransactionResponseSchema.parse(minimalData)
        ).not.toThrow();
      });

      it('should reject invalid URL in request_uri', () => {
        const invalidUrl = {
          ...validResponseData,
          request_uri: 'not-a-valid-url',
        };

        expect(() => initTransactionResponseSchema.parse(invalidUrl)).toThrow(
          z.ZodError
        );
      });
    });
  });

  describe('InitTransactionRequest class', () => {
    const mockPd = PresentationDefinition.fromJSON(mockPresentationDefinition);
    const mockEphemeralECDHPublicJwk = new EphemeralECDHPublicJwk(
      mockEphemeralJwk
    );

    describe('Constructor', () => {
      it('should create instance with all parameters', () => {
        const request = new InitTransactionRequest(
          'vp_token',
          mockPd,
          mockEphemeralECDHPublicJwk,
          'test-nonce',
          'direct_post',
          'by_value',
          'by_reference',
          'https://example.com/callback'
        );

        expect(request.type).toBe('vp_token');
        expect(request.presentationDefinition).toBe(mockPd);
        expect(request.ephemeralECDHPublicJwk).toBe(mockEphemeralECDHPublicJwk);
        expect(request.nonce).toBe('test-nonce');
        expect(request.responseMode).toBe('direct_post');
        expect(request.jarMode).toBe('by_value');
        expect(request.presentationDefinitionMode).toBe('by_reference');
        expect(request.walletResponseRedirectUriTemplate).toBe(
          'https://example.com/callback'
        );
      });

      it('should create instance with required parameters only', () => {
        const request = new InitTransactionRequest(
          'vp_token',
          mockPd,
          mockEphemeralECDHPublicJwk
        );

        expect(request.type).toBe('vp_token');
        expect(request.presentationDefinition).toBe(mockPd);
        expect(request.ephemeralECDHPublicJwk).toBe(mockEphemeralECDHPublicJwk);
        expect(request.nonce).toBeUndefined();
        expect(request.responseMode).toBeUndefined();
        expect(request.jarMode).toBeUndefined();
        expect(request.presentationDefinitionMode).toBeUndefined();
        expect(request.walletResponseRedirectUriTemplate).toBeUndefined();
      });

      it('should have immutable properties (readonly at compile time)', () => {
        const request = new InitTransactionRequest(
          'vp_token',
          mockPd,
          mockEphemeralECDHPublicJwk
        );

        // TypeScript readonly properties are compile-time only
        // We can verify the properties are present and have the correct values
        expect(request.type).toBe('vp_token');
        expect(request.presentationDefinition).toBe(mockPd);
        expect(request.ephemeralECDHPublicJwk).toBe(mockEphemeralECDHPublicJwk);
        expect(request.nonce).toBeUndefined();
        expect(request.responseMode).toBeUndefined();
      });
    });

    describe('fromJSON static method', () => {
      it('should create instance from valid JSON', () => {
        const json = {
          type: 'vp_token' as const,
          presentation_definition: mockPresentationDefinition,
          ephemeral_ecdh_public_jwk: mockEphemeralJwk,
          nonce: 'test-nonce',
        };

        const request = InitTransactionRequest.fromJSON(json);
        expect(request.type).toBe('vp_token');
        expect(request.nonce).toBe('test-nonce');
      });

      it('should throw error for invalid JSON', () => {
        const invalidJson = {
          type: 'invalid_type',
          presentation_definition: mockPresentationDefinition,
          ephemeral_ecdh_public_jwk: mockEphemeralJwk,
        };

        expect(() => InitTransactionRequest.fromJSON(invalidJson)).toThrow();
      });
    });

    describe('toJSON method', () => {
      it('should convert instance to JSON object', () => {
        const request = new InitTransactionRequest(
          'vp_token',
          mockPd,
          mockEphemeralECDHPublicJwk,
          'test-nonce'
        );

        const json = request.toJSON();
        expect(json.type).toBe('vp_token');
        expect(json.nonce).toBe('test-nonce');
        expect(json.presentation_definition).toBeDefined();
        expect(json.ephemeral_ecdh_public_jwk).toBe(mockEphemeralJwk);
      });
    });
  });

  describe('InitTransactionResponse class', () => {
    describe('Constructor', () => {
      it('should create instance with all parameters', () => {
        const response = new InitTransactionResponse(
          mockPresentationId,
          'test-client-id',
          'test-request',
          'https://example.com/request'
        );

        expect(response.presentationId).toBe(mockPresentationId);
        expect(response.clientId).toBe('test-client-id');
        expect(response.request).toBe('test-request');
        expect(response.requestUri).toBe('https://example.com/request');
      });

      it('should create instance with required parameters only', () => {
        const response = new InitTransactionResponse(
          mockPresentationId,
          'test-client-id'
        );

        expect(response.presentationId).toBe(mockPresentationId);
        expect(response.clientId).toBe('test-client-id');
        expect(response.request).toBeUndefined();
        expect(response.requestUri).toBeUndefined();
      });
    });

    describe('fromJSON static method', () => {
      it('should create instance from valid JSON', () => {
        const json = {
          presentation_id: mockPresentationId,
          client_id: 'test-client-id',
          request: 'test-request',
          request_uri: 'https://example.com/request',
        };

        const response = InitTransactionResponse.fromJSON(json);
        expect(response.presentationId).toBe(mockPresentationId);
        expect(response.clientId).toBe('test-client-id');
        expect(response.request).toBe('test-request');
        expect(response.requestUri).toBe('https://example.com/request');
      });
    });

    describe('toJSON method', () => {
      it('should convert instance to JSON object', () => {
        const response = new InitTransactionResponse(
          mockPresentationId,
          'test-client-id',
          'test-request',
          'https://example.com/request'
        );

        const json = response.toJSON();
        expect(json).toEqual({
          presentation_id: mockPresentationId,
          client_id: 'test-client-id',
          request: 'test-request',
          request_uri: 'https://example.com/request',
        });
      });
    });

    describe('toWalletRedirectParams method', () => {
      it('should convert to wallet redirect params excluding presentation_id', () => {
        const response = new InitTransactionResponse(
          mockPresentationId,
          'test-client-id',
          'test-request',
          'https://example.com/request'
        );

        const params = response.toWalletRedirectParams();
        expect(params).toEqual({
          client_id: 'test-client-id',
          request: 'test-request',
          request_uri: 'https://example.com/request',
        });

        // Should not include presentation_id
        expect(params).not.toHaveProperty('presentation_id');
      });

      it('should handle optional fields correctly', () => {
        const response = new InitTransactionResponse(
          mockPresentationId,
          'test-client-id'
        );

        const params = response.toWalletRedirectParams();
        expect(params).toEqual({
          client_id: 'test-client-id',
          request: undefined,
          request_uri: undefined,
        });
      });
    });
  });

  describe('Type Definitions', () => {
    describe('Type aliases', () => {
      it('should have correct PresentationType values', () => {
        const validTypes: PresentationType[] = [
          'id_token',
          'vp_token',
          'id_token vp_token',
        ];
        validTypes.forEach((type) => {
          expect(typeof type).toBe('string');
        });
      });

      it('should have correct ResponseMode values', () => {
        const validModes: ResponseMode[] = ['direct_post', 'direct_post.jwt'];
        validModes.forEach((mode) => {
          expect(typeof mode).toBe('string');
        });
      });

      it('should have correct JarMode values', () => {
        const validModes: JarMode[] = ['by_value', 'by_reference'];
        validModes.forEach((mode) => {
          expect(typeof mode).toBe('string');
        });
      });

      it('should have correct PresentationDefinitionMode values', () => {
        const validModes: PresentationDefinitionMode[] = [
          'by_value',
          'by_reference',
        ];
        validModes.forEach((mode) => {
          expect(typeof mode).toBe('string');
        });
      });
    });

    describe('WalletRedirectParams type', () => {
      it('should exclude presentation_id from InitTransactionResponseJSON', () => {
        const walletParams: WalletRedirectParams = {
          client_id: 'test-client-id',
          request: 'test-request',
          request_uri: 'https://example.com/request',
        };

        expect(walletParams).toHaveProperty('client_id');
        expect(walletParams).toHaveProperty('request');
        expect(walletParams).toHaveProperty('request_uri');
        expect(walletParams).not.toHaveProperty('presentation_id');
      });
    });

    describe('InitTransactionResult interface', () => {
      it('should have correct structure', () => {
        const result: InitTransactionResult = {
          walletRedirectUri: 'https://wallet.example.com/request',
          isMobile: true,
        };

        expect(result.walletRedirectUri).toBe(
          'https://wallet.example.com/request'
        );
        expect(result.isMobile).toBe(true);
        expect(typeof result.walletRedirectUri).toBe('string');
        expect(typeof result.isMobile).toBe('boolean');
      });
    });
  });

  describe('Integration Testing', () => {
    it('should handle complete request-response cycle', () => {
      // Create request
      const requestData = {
        type: 'vp_token' as const,
        presentation_definition: mockPresentationDefinition,
        ephemeral_ecdh_public_jwk: mockEphemeralJwk,
        nonce: 'integration-test-nonce',
      };

      const request = InitTransactionRequest.fromJSON(requestData);
      expect(request.type).toBe('vp_token');

      // Create response
      const responseData = {
        presentation_id: mockPresentationId,
        client_id: 'integration-test-client',
        request_uri: 'https://example.com/request/123',
      };

      const response = InitTransactionResponse.fromJSON(responseData);
      expect(response.clientId).toBe('integration-test-client');

      // Convert to wallet params
      const walletParams = response.toWalletRedirectParams();
      expect(walletParams.client_id).toBe('integration-test-client');
      expect(walletParams).not.toHaveProperty('presentation_id');
    });

    it('should maintain data integrity through serialization cycles', () => {
      const requestData = {
        type: 'id_token vp_token' as const,
        presentation_definition: mockPresentationDefinition,
        ephemeral_ecdh_public_jwk: mockEphemeralJwk,
        nonce: 'cycle-test-nonce',
        response_mode: 'direct_post.jwt' as const,
      };

      // Round trip: JSON -> Object -> JSON
      const request = InitTransactionRequest.fromJSON(requestData);
      const serialized = request.toJSON();
      const deserialized = InitTransactionRequest.fromJSON(serialized);

      expect(deserialized.type).toBe(request.type);
      expect(deserialized.nonce).toBe(request.nonce);
      expect(deserialized.responseMode).toBe(request.responseMode);
    });
  });
});
