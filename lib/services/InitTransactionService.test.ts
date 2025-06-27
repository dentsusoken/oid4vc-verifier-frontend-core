import { describe, expect, it, vi } from 'vitest';
import { createStorePresentationIdInvoker } from '../adapters/out/session';
import { presentationDefinition } from '../test/PresentationDefinition';
import { InitTransactionRequest } from '../ports/input';
import { Fetcher } from '../ports/out/http/Fetcher';
import { createInitTransactionServiceInvoker } from './InitTransactionService';

const apiBaseUrl = 'https://dev.verifier-backend.eudiw.dev';
const apiPath = '/ui/presentations';

vi.mock('../adapters/out/session', () => ({
  createStorePresentationIdInvoker: vi.fn(),
}));

describe('InitTransactionService', () => {
  it('should return a transaction object on success', async () => {
    const mockStorePresentationId = vi.fn().mockResolvedValue(undefined);
    const mockFetcher: Fetcher = {
      get: vi.fn(),
      post: vi.fn().mockResolvedValue({
        presentation_id: 'test_presentation_id',
        client_id: 'test_client_id',
      }),
    };

    const invoker = createInitTransactionServiceInvoker(
      apiBaseUrl,
      apiPath,
      mockStorePresentationId,
      mockFetcher
    );

    const request = InitTransactionRequest.fromJSON({
      type: 'vp_token',
      presentation_definition: presentationDefinition,
      nonce: '1234',
      response_mode: 'direct_post',
      jar_mode: 'by_value',
      presentation_definition_mode: 'by_value',
      wallet_response_redirect_uri_template:
        'http://localhost:8787/result?response_code={RESPONSE_CODE}',
    });

    const transaction = await invoker(request);

    expect(transaction).toBeDefined();
    expect(transaction.sessionId).toBeDefined();
    expect(transaction.response.presentationId).toBe('test_presentation_id');
    expect(mockStorePresentationId).toHaveBeenCalledWith(
      transaction.sessionId,
      'test_presentation_id'
    );
  });

  it('should throw an error on failure', async () => {
    const mockStorePresentationId = vi.fn().mockResolvedValue(undefined);
    const mockFetcher: Fetcher = {
      get: vi.fn(),
      post: vi
        .fn()
        .mockRejectedValue(new Error('Status: 400, Message: Bad Request')),
    };

    const invoker = createInitTransactionServiceInvoker(
      apiBaseUrl,
      apiPath,
      mockStorePresentationId,
      mockFetcher
    );

    const request = InitTransactionRequest.fromJSON({
      type: 'vp_token',
      presentation_definition: presentationDefinition,
      nonce: '1234',
      wallet_response_redirect_uri_template:
        'http://localhost:8787/result?response_code={RESPONSE_CODE}',
    });

    await expect(invoker(request)).rejects.toThrow(
      'Status: 400, Message: Bad Request'
    );
  });
});
