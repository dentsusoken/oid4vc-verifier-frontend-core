import { PresentationDefinition } from '@vecrea/oid4vc-prex';
import { describe, expect, it } from 'vitest';
import { PresentationId } from '../../domain';
import {
  InitTransactionRequest,
  InitTransactionRequestSchema,
  InitTransactionResponse,
  initTransactionResponseSchema,
  jarModeSchema,
  presentationDefinitionModeSchema,
  presentationTypeSchema,
  responseModeSchema,
} from './InitTransaction.types';

describe('InitTransaction.types', () => {
  describe('presentationTypeSchema', () => {
    it('should validate a valid presentation type', () => {
      const validPresentationType = 'vp_token';
      const { error } = presentationTypeSchema.safeParse(validPresentationType);

      expect(error).toBeUndefined();
    });
  });
  describe('responseModeSchema', () => {
    it('should validate a valid response mode', () => {
      const validResponseMode = 'direct_post';
      const { error } = responseModeSchema.safeParse(validResponseMode);

      expect(error).toBeUndefined();
    });
  });
  describe('jarModeSchema', () => {
    it('should validate a valid jar mode', () => {
      const validJarMode = 'by_value';
      const { error } = jarModeSchema.safeParse(validJarMode);

      expect(error).toBeUndefined();
    });
  });
  describe('presentationDefinitionModeSchema', () => {
    it('should validate a valid presentation definition mode', () => {
      const validPresentationDefinitionMode = 'by_value';
      const { error } = presentationDefinitionModeSchema.safeParse(
        validPresentationDefinitionMode
      );

      expect(error).toBeUndefined();
    });
  });
  describe('InitTransactionRequestSchema', () => {
    it('should validate a valid InitTransactionRequest', () => {
      const validInitTransactionRequest = {
        type: 'vp_token',
        presentation_definition: {
          id: '1234',
          fields: {
            path: ['$'],
          },
        },
      };
      const { error } = InitTransactionRequestSchema.safeParse(
        validInitTransactionRequest
      );
      expect(error).toBeUndefined();
    });
  });
  describe('InitTransactionRequest', () => {
    describe('constructor', () => {
      it('should create a new instance of InitTransactionRequest', () => {
        const pd = PresentationDefinition.fromJSON({
          id: '1234',
        });
        const request = new InitTransactionRequest('vp_token', pd);
        expect(request).toBeInstanceOf(InitTransactionRequest);
      });
    });
    describe('toJSON', () => {
      it('should return a JSON representation of the InitTransactionRequest', () => {
        const pd = PresentationDefinition.fromJSON({
          id: '1234',
        });
        const request = new InitTransactionRequest('vp_token', pd);
        const json = request.toJSON();
        expect(json).toEqual({
          type: 'vp_token',
          presentation_definition: {
            id: '1234',
          },
        });
      });
    });
    describe('fromJSON', () => {
      it('should create a new instance of InitTransactionRequest from JSON', () => {
        const json = {
          type: 'vp_token',
          presentation_definition: {
            id: '1234',
          },
        };
        const request = InitTransactionRequest.fromJSON(json);
        expect(request).toBeInstanceOf(InitTransactionRequest);
      });
    });
  });
  describe('initTransactionResponseSchema', () => {
    it('should validate a valid InitTransactionResponse', () => {
      const validInitTransactionResponse = {
        presentation_id: '1234',
        client_id: '1234',
      };
      const { error } = initTransactionResponseSchema.safeParse(
        validInitTransactionResponse
      );
      expect(error).toBeUndefined();
    });
  });
  describe('InitTransactionResponse', () => {
    describe('constructor', () => {
      it('should create a new instance of InitTransactionResponse', () => {
        const response = new InitTransactionResponse(
          '1234' as PresentationId,
          '1234'
        );
        expect(response).toBeInstanceOf(InitTransactionResponse);
      });
    });
    describe('toJSON', () => {
      it('should return a JSON representation of the InitTransactionResponse', () => {
        const response = new InitTransactionResponse(
          '1234' as PresentationId,
          '1234'
        );
        const json = response.toJSON();
        expect(json).toEqual({
          presentation_id: '1234',
          client_id: '1234',
        });
      });
    });
    describe('fromJSON', () => {
      it('should create a new instance of InitTransactionResponse from JSON', () => {
        const json = {
          presentation_id: '1234',
          client_id: '1234',
        };
        const response = InitTransactionResponse.fromJSON(json);
        expect(response).toBeInstanceOf(InitTransactionResponse);
      });
    });
    describe('toWalletRedirectParams', () => {
      it('should return WalletRedirectParams', () => {
        const response = new InitTransactionResponse(
          '1234' as PresentationId,
          '1234',
          'request',
          'requestUri'
        );
        const walletRedirectParams = response.toWalletRedirectParams();
        expect(walletRedirectParams).toEqual({
          client_id: '1234',
          request: 'request',
          request_uri: 'requestUri',
        });
      });
    });
  });
});
