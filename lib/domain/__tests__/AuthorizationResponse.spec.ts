import { describe, expect, it } from 'vitest';
import {
  AuthorizationResponse,
  AuthorizationResponseData,
  DirectPostJwtJSON,
  directPostJwtSchema,
  directPostSchema,
} from '../AuthorizationResponse';

describe('AuthorizationResponse', () => {
  describe('directPostSchema validation', () => {
    it('should validate minimal direct post response', () => {
      const validDirectPost = {
        response: {
          state: 'test-state',
          presentation_submission: {
            id: 'submission-id',
            definition_id: 'definition-id',
            descriptor_map: [],
          },
        },
      };

      expect(() => directPostSchema.parse(validDirectPost)).not.toThrow();
    });

    it('should reject missing required fields', () => {
      expect(() => directPostSchema.parse({})).toThrow();
      expect(() => directPostSchema.parse({ response: {} })).toThrow();
    });
  });

  describe('directPostJwtSchema validation', () => {
    it('should validate direct post JWT response', () => {
      const validDirectPostJwt = {
        state: 'test-state',
        response: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...',
      };

      expect(() => directPostJwtSchema.parse(validDirectPostJwt)).not.toThrow();
    });

    it('should reject invalid field types', () => {
      expect(() =>
        directPostJwtSchema.parse({
          state: 123,
          response: 'jwt-token',
        })
      ).toThrow();
    });
  });

  describe('AuthorizationResponse.DirectPost', () => {
    it('should create instance with correct type discriminator', () => {
      const responseData: AuthorizationResponseData = { state: 'test-state' };
      const directPost = new AuthorizationResponse.DirectPost(responseData);

      expect(directPost.__type).toBe('DirectPost');
      expect(directPost.response).toBe(responseData);
    });

    it('should handle error responses', () => {
      const errorData: AuthorizationResponseData = {
        error: 'invalid_request',
        errorDescription: 'Missing required parameter',
      };
      const errorDirectPost = new AuthorizationResponse.DirectPost(errorData);

      expect(errorDirectPost.response.error).toBe('invalid_request');
    });
  });

  describe('AuthorizationResponse.DirectPostJwt', () => {
    const testState = 'test-state';
    const testJwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...';

    it('should create instance with correct properties', () => {
      const directPostJwt = new AuthorizationResponse.DirectPostJwt(
        testState,
        testJwt
      );

      expect(directPostJwt.__type).toBe('DirectPostJwt');
      expect(directPostJwt.state).toBe(testState);
      expect(directPostJwt.jarm).toBe(testJwt);
    });

    it('should serialize to JSON correctly', () => {
      const directPostJwt = new AuthorizationResponse.DirectPostJwt(
        testState,
        testJwt
      );
      const json = directPostJwt.toJSON();

      expect(json).toEqual({
        state: testState,
        response: testJwt,
      });
    });

    it('should deserialize from JSON correctly', () => {
      const json: DirectPostJwtJSON = {
        state: testState,
        response: testJwt,
      };

      const deserialized = AuthorizationResponse.DirectPostJwt.fromJSON(json);

      expect(deserialized.state).toBe(testState);
      expect(deserialized.jarm).toBe(testJwt);
      expect(deserialized.__type).toBe('DirectPostJwt');
    });

    it('should maintain consistency between toJSON and fromJSON', () => {
      const original = new AuthorizationResponse.DirectPostJwt(
        testState,
        testJwt
      );
      const json = original.toJSON();
      const roundTrip = AuthorizationResponse.DirectPostJwt.fromJSON(json);

      expect(roundTrip.state).toBe(original.state);
      expect(roundTrip.jarm).toBe(original.jarm);
    });
  });

  describe('type discrimination', () => {
    it('should distinguish between DirectPost and DirectPostJwt', () => {
      const directPost = new AuthorizationResponse.DirectPost({});
      const directPostJwt = new AuthorizationResponse.DirectPostJwt(
        'state',
        'jwt'
      );

      expect(directPost.__type).toBe('DirectPost');
      expect(directPostJwt.__type).toBe('DirectPostJwt');
    });

    it('should work with type guards', () => {
      function isDirectPost(
        response: AuthorizationResponse
      ): response is AuthorizationResponse.DirectPost {
        return response.__type === 'DirectPost';
      }

      const directPost = new AuthorizationResponse.DirectPost({});
      const directPostJwt = new AuthorizationResponse.DirectPostJwt(
        'state',
        'jwt'
      );

      expect(isDirectPost(directPost)).toBe(true);
      expect(isDirectPost(directPostJwt)).toBe(false);
    });
  });
});
