import { expect } from 'vitest';
import { GetWalletResponseResult } from './GetWalletResponse.types';

describe('GetWalletResponseResult', () => {
  it('should create an instance from JSON', () => {
    const json = {
      id_token: 'test_id_token',
      vp_token: 'test_vp_token',
      presentation_submission: undefined,
      error: 'test_error',
      error_description: 'test_error_description',
    };

    const result = GetWalletResponseResult.fromJSON(json);

    expect(result.idToken).toBe(json.id_token);
    expect(result.vpToken).toBe(json.vp_token);
    expect(result.presentationSubmission).toBe(json.presentation_submission);
    expect(result.error).toBe(json.error);
    expect(result.error_description).toBe(json.error_description);
  });

  it('should convert an instance to JSON', () => {
    const instance = new GetWalletResponseResult(
      'test_id_token',
      'test_vp_token',
      undefined,
      'test_error',
      'test_error_description'
    );

    const json = instance.toJSON();

    expect(json.id_token).toBe(instance.idToken);
    expect(json.vp_token).toBe(instance.vpToken);
    expect(json.presentation_submission).toBe(instance.presentationSubmission);
    expect(json.error).toBe(instance.error);
    expect(json.error_description).toBe(instance.error_description);
  });
});
