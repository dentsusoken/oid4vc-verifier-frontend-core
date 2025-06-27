import { describe, expect, it, vi } from 'vitest';
import { createGetWalletResponseServiceInvoker } from './GetWalletResponseService';
import { createLoadPresentationIdInvoker } from '../adapters/out/session';
import { Fetcher } from '../ports/out/http/Fetcher';

const apiBaseUrl = 'https://dev.verifier-backend.eudiw.dev';
const apiPath = '/ui/wallet-response';

describe('createGetWalletResponseServiceInvoker', () => {
  it('should return a wallet response object on success', async () => {
    const mockLoadPresentationId = vi
      .fn()
      .mockResolvedValue('test_presentation_id');
    const mockFetcher: Fetcher = {
      get: vi.fn().mockResolvedValue({
        id_token: 'test_id_token',
        vp_token: 'test_vp_token',
        presentation_submission: undefined,
        error: 'test_error',
        error_description: 'test_error_description',
      }),
      post: vi.fn(),
    };

    const invoker = createGetWalletResponseServiceInvoker(
      apiBaseUrl,
      apiPath,
      mockLoadPresentationId,
      mockFetcher
    );

    const response = await invoker('test_session_id', 'test_response_code');

    expect(response).toBeDefined();
    expect(response.idToken).toBe('test_id_token');
    expect(response.vpToken).toBe('test_vp_token');
    expect(response.presentationSubmission).toBeUndefined();
    expect(response.error).toBe('test_error');
    expect(response.error_description).toBe('test_error_description');
    expect(mockLoadPresentationId).toHaveBeenCalledWith('test_session_id');
  });

  it('should throw an error on failure', async () => {
    const mockLoadPresentationId = vi
      .fn()
      .mockResolvedValue('test_presentation_id');
    const mockFetcher: Fetcher = {
      get: vi
        .fn()
        .mockRejectedValue(new Error('Status: 400, Message: Bad Request')),
      post: vi.fn(),
    };

    const invoker = createGetWalletResponseServiceInvoker(
      apiBaseUrl,
      apiPath,
      mockLoadPresentationId,
      mockFetcher
    );

    await expect(
      invoker('test_session_id', 'test_response_code')
    ).rejects.toThrow('Status: 400, Message: Bad Request');
  });
});
