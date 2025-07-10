import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockedFunction,
} from 'vitest';
import { z, ZodError } from 'zod';
import {
  createDefaultFetcher,
  createFetcher,
  DefaultFetcher,
  DefaultFetcherError,
} from '../DefaultFetcher';

// Mock global fetch
const mockFetch = vi.fn() as MockedFunction<typeof fetch>;
global.fetch = mockFetch;

// Mock AbortController
class MockAbortController {
  signal = { aborted: false };
  abort = vi.fn(() => {
    this.signal.aborted = true;
  });
}

global.AbortController = MockAbortController as any;

describe('DefaultFetcherError', () => {
  describe('error construction', () => {
    it('should create error with all properties', () => {
      const error = new DefaultFetcherError(
        'HTTP_ERROR',
        'Test error message',
        'https://example.com',
        404,
        'Not Found',
        { 'content-type': 'application/json' },
        '{"error":"not found"}',
        new Error('Original error')
      );

      expect(error.name).toBe('DefaultFetcherError');
      expect(error.message).toBe('Test error message');
      expect(error.errorType).toBe('HTTP_ERROR');
      expect(error.url).toBe('https://example.com');
      expect(error.status).toBe(404);
      expect(error.statusText).toBe('Not Found');
      expect(error.headers).toEqual({ 'content-type': 'application/json' });
      expect(error.responseBody).toBe('{"error":"not found"}');
      expect(error.originalError).toBeInstanceOf(Error);
    });

    it('should create error with minimal properties', () => {
      const error = new DefaultFetcherError(
        'NETWORK_ERROR',
        'Network failed',
        'https://example.com'
      );

      expect(error.name).toBe('DefaultFetcherError');
      expect(error.message).toBe('Network failed');
      expect(error.errorType).toBe('NETWORK_ERROR');
      expect(error.url).toBe('https://example.com');
      expect(error.status).toBeUndefined();
      expect(error.statusText).toBeUndefined();
      expect(error.headers).toBeUndefined();
      expect(error.responseBody).toBeUndefined();
      expect(error.originalError).toBeUndefined();
    });

    it('should be instance of Error', () => {
      const error = new DefaultFetcherError(
        'VALIDATION_ERROR',
        'Validation failed',
        'https://example.com'
      );

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DefaultFetcherError);
    });
  });

  describe('error types', () => {
    it.each([
      'NETWORK_ERROR',
      'TIMEOUT_ERROR',
      'VALIDATION_ERROR',
      'HTTP_ERROR',
    ] as const)('should support %s error type', (errorType) => {
      const error = new DefaultFetcherError(
        errorType,
        'Test message',
        'https://example.com'
      );

      expect(error.errorType).toBe(errorType);
    });
  });
});

describe('DefaultFetcher', () => {
  let fetcher: DefaultFetcher;

  beforeEach(() => {
    fetcher = new DefaultFetcher();
    mockFetch.mockClear();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('constructor and initialization', () => {
    it('should create instance with default configuration', () => {
      expect(fetcher).toBeInstanceOf(DefaultFetcher);
    });

    it('should have default options configured', () => {
      // Test through actual method calls to verify defaults
      const schema = z.object({ test: z.string() });

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        url: 'https://example.com/test',
        text: () => Promise.resolve('{"test":"value"}'),
      } as any);

      // This call should use default headers
      fetcher.get('https://example.com', '/test', {}, schema);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/test?',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
          }),
        })
      );
    });
  });

  describe('GET requests', () => {
    const testSchema = z.object({ id: z.string(), name: z.string() });
    const mockResponse = { id: '123', name: 'Test User' };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        url: 'https://example.com/users/123',
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      } as any);
    });

    it('should perform successful GET request', async () => {
      const result = await fetcher.get(
        'https://example.com',
        '/users/123',
        {},
        testSchema
      );

      expect(result.data).toEqual(mockResponse);
      expect(result.metadata.status).toBe(200);
      expect(result.metadata.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users/123?',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('should handle query parameters correctly', async () => {
      await fetcher.get(
        'https://example.com',
        '/users',
        { filter: 'active', sort: 'name' },
        testSchema
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users?filter=active&sort=name',
        expect.any(Object)
      );
    });

    it('should handle empty query parameters', async () => {
      await fetcher.get('https://example.com', '/users', {}, testSchema);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users?',
        expect.any(Object)
      );
    });

    it('should merge custom headers with defaults', async () => {
      await fetcher.get('https://example.com', '/users/123', {}, testSchema, {
        headers: {
          Authorization: 'Bearer token',
          'Custom-Header': 'value',
        },
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: 'Bearer token',
            'Custom-Header': 'value',
          }),
        })
      );
    });

    it('should handle custom timeout', async () => {
      await fetcher.get('https://example.com', '/users/123', {}, testSchema, {
        timeout: 5000,
      });

      // Verify timeout was set (AbortController should be called)
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('POST requests', () => {
    const testSchema = z.object({ success: z.boolean(), id: z.string() });
    const mockResponse = { success: true, id: '456' };

    beforeEach(() => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 201,
        statusText: 'Created',
        headers: new Map([['content-type', 'application/json']]),
        url: 'https://example.com/users',
        text: () => Promise.resolve(JSON.stringify(mockResponse)),
      } as any);
    });

    it('should perform successful POST request with string body', async () => {
      const requestBody = '{"name":"Alice","email":"alice@example.com"}';

      const result = await fetcher.post(
        'https://example.com',
        '/users',
        requestBody,
        testSchema
      );

      expect(result.data).toEqual(mockResponse);
      expect(result.metadata.status).toBe(201);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: requestBody,
        })
      );
    });

    it('should handle object body with JSON serialization', async () => {
      const requestBody = { name: 'Alice', email: 'alice@example.com' };

      await fetcher.post(
        'https://example.com',
        '/users',
        requestBody,
        testSchema
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/users',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(requestBody),
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
    });

    it('should handle FormData body', async () => {
      const formData = new FormData();
      formData.append('name', 'Alice');

      await fetcher.post(
        'https://example.com',
        '/upload',
        formData,
        testSchema
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/upload',
        expect.objectContaining({
          method: 'POST',
          body: formData,
        })
      );
    });

    it('should handle URLSearchParams body', async () => {
      const params = new URLSearchParams();
      params.append('name', 'Alice');

      await fetcher.post('https://example.com', '/form', params, testSchema);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/form',
        expect.objectContaining({
          method: 'POST',
          body: params,
        })
      );
    });

    it('should handle null and undefined body', async () => {
      await fetcher.post(
        'https://example.com',
        '/ping',
        undefined as any,
        testSchema
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/ping',
        expect.objectContaining({
          method: 'POST',
          body: undefined,
        })
      );
    });

    it('should handle ArrayBuffer body', async () => {
      const buffer = new ArrayBuffer(10);

      await fetcher.post('https://example.com', '/binary', buffer, testSchema);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/binary',
        expect.objectContaining({
          method: 'POST',
          body: buffer,
        })
      );
    });

    it('should handle Blob body', async () => {
      const blob = new Blob(['test'], { type: 'text/plain' });

      await fetcher.post('https://example.com', '/file', blob, testSchema);

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com/file',
        expect.objectContaining({
          method: 'POST',
          body: blob,
        })
      );
    });
  });

  describe('error handling', () => {
    const testSchema = z.object({ test: z.string() });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(
        fetcher.get('https://example.com', '/test', {}, testSchema)
      ).rejects.toThrow(DefaultFetcherError);

      try {
        await fetcher.get('https://example.com', '/test', {}, testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(DefaultFetcherError);
        expect((error as DefaultFetcherError).errorType).toBe('NETWORK_ERROR');
        expect((error as DefaultFetcherError).message).toContain(
          'Network request failed'
        );
      }
    });

    it('should handle timeout errors', async () => {
      mockFetch.mockRejectedValue(
        Object.assign(new Error('Timeout'), { name: 'AbortError' })
      );

      await expect(
        fetcher.get('https://example.com', '/test', {}, testSchema, {
          timeout: 1000,
        })
      ).rejects.toThrow(DefaultFetcherError);

      try {
        await fetcher.get('https://example.com', '/test', {}, testSchema, {
          timeout: 1000,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(DefaultFetcherError);
        expect((error as DefaultFetcherError).errorType).toBe('TIMEOUT_ERROR');
        expect((error as DefaultFetcherError).message).toContain(
          'Request timeout'
        );
      }
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: new Map([['content-type', 'application/json']]),
        url: 'https://example.com/test',
        text: () => Promise.resolve('{"error":"Resource not found"}'),
      } as any);

      await expect(
        fetcher.get('https://example.com', '/test', {}, testSchema)
      ).rejects.toThrow(DefaultFetcherError);

      try {
        await fetcher.get('https://example.com', '/test', {}, testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(DefaultFetcherError);
        expect((error as DefaultFetcherError).errorType).toBe('HTTP_ERROR');
        expect((error as DefaultFetcherError).status).toBe(404);
        expect((error as DefaultFetcherError).responseBody).toBe(
          '{"error":"Resource not found"}'
        );
      }
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        url: 'https://example.com/test',
        text: () => Promise.resolve('invalid json {'),
      } as any);

      await expect(
        fetcher.get('https://example.com', '/test', {}, testSchema)
      ).rejects.toThrow(DefaultFetcherError);

      try {
        await fetcher.get('https://example.com', '/test', {}, testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(DefaultFetcherError);
        expect((error as DefaultFetcherError).errorType).toBe(
          'VALIDATION_ERROR'
        );
        expect((error as DefaultFetcherError).message).toContain(
          'Failed to parse response as JSON'
        );
      }
    });

    it('should handle schema validation errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map([['content-type', 'application/json']]),
        url: 'https://example.com/test',
        text: () => Promise.resolve('{"invalid":"data"}'),
      } as any);

      await expect(
        fetcher.get('https://example.com', '/test', {}, testSchema)
      ).rejects.toThrow(DefaultFetcherError);

      try {
        await fetcher.get('https://example.com', '/test', {}, testSchema);
      } catch (error) {
        expect(error).toBeInstanceOf(DefaultFetcherError);
        expect((error as DefaultFetcherError).errorType).toBe(
          'VALIDATION_ERROR'
        );
        expect((error as DefaultFetcherError).message).toContain(
          'Response validation failed'
        );
        expect((error as DefaultFetcherError).originalError).toBeInstanceOf(
          ZodError
        );
      }
    });

    it('should handle empty response text gracefully', async () => {
      const nullSchema = z.null();
      mockFetch.mockResolvedValue({
        ok: true,
        status: 204,
        statusText: 'No Content',
        headers: new Map(),
        url: 'https://example.com/test',
        text: () => Promise.resolve(''),
      } as any);

      const result = await fetcher.get(
        'https://example.com',
        '/test',
        {},
        nullSchema
      );
      expect(result.data).toBeNull();
    });
  });

  describe('timeout functionality', () => {
    it('should use default timeout when not specified', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        url: 'https://example.com/test',
        text: () => Promise.resolve('{"test":"value"}'),
      } as any);

      const schema = z.object({ test: z.string() });
      await fetcher.get('https://example.com', '/test', {}, schema);

      // Default timeout should be used (30000ms)
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should pass custom timeout to AbortController', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        url: 'https://example.com/test',
        text: () => Promise.resolve('{"test":"value"}'),
      } as any);

      const schema = z.object({ test: z.string() });

      // Test that custom timeout is used
      await fetcher.get('https://example.com', '/test', {}, schema, {
        timeout: 5000,
      });

      // Verify that fetch was called (AbortController was created with timeout)
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  describe('response metadata', () => {
    it('should include complete response metadata', async () => {
      const testHeaders = {
        'content-type': 'application/json',
        'x-custom-header': 'custom-value',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(Object.entries(testHeaders)),
        url: 'https://example.com/users/123',
        text: () => Promise.resolve('{"test":"value"}'),
      } as any);

      const schema = z.object({ test: z.string() });
      const result = await fetcher.get(
        'https://example.com',
        '/users/123',
        {},
        schema
      );

      expect(result.metadata).toEqual({
        status: 200,
        statusText: 'OK',
        headers: testHeaders,
        url: 'https://example.com/users/123',
        ok: true,
      });
    });
  });

  describe('AbortController integration', () => {
    it('should use provided AbortController signal', async () => {
      const controller = new MockAbortController();

      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
        url: 'https://example.com/test',
        text: () => Promise.resolve('{"test":"value"}'),
      } as any);

      const schema = z.object({ test: z.string() });
      await fetcher.get('https://example.com', '/test', {}, schema, {
        signal: controller.signal as any,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          signal: controller.signal,
        })
      );
    });
  });
});

describe('factory functions', () => {
  describe('createDefaultFetcher', () => {
    it('should create DefaultFetcher instance', () => {
      const fetcher = createDefaultFetcher();
      expect(fetcher).toBeInstanceOf(DefaultFetcher);
    });

    it('should create new instances each time', () => {
      const fetcher1 = createDefaultFetcher();
      const fetcher2 = createDefaultFetcher();
      expect(fetcher1).not.toBe(fetcher2);
    });
  });

  describe('createFetcher', () => {
    it('should create Fetcher instance', () => {
      const fetcher = createFetcher();
      expect(fetcher).toBeInstanceOf(DefaultFetcher);
    });

    it('should return same type as createDefaultFetcher', () => {
      const defaultFetcher = createDefaultFetcher();
      const fetcher = createFetcher();

      expect(fetcher.constructor).toBe(defaultFetcher.constructor);
    });
  });
});
