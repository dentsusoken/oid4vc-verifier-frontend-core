import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
  ContentType,
  DefaultHeaders,
  Fetcher,
  HttpError,
  HttpRequestOptions,
  HttpResponse,
} from './';

// テスト用のモック実装
class MockFetcher implements Fetcher {
  private mockResponses = new Map<string, any>();
  private mockErrors = new Map<string, HttpError>();

  setMockResponse(
    url: string,
    data: any,
    metadata = {
      status: 200,
      statusText: 'OK',
      headers: {},
      url,
      ok: true,
    }
  ) {
    this.mockResponses.set(url, { data, metadata });
  }

  setMockError(url: string, error: HttpError) {
    this.mockErrors.set(url, error);
  }

  async get<T>(
    url: string,
    schema: z.ZodSchema<T>,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>> {
    if (this.mockErrors.has(url)) {
      throw this.mockErrors.get(url);
    }

    const mockResponse = this.mockResponses.get(url);
    if (!mockResponse) {
      throw new Error(`No mock response set for ${url}`);
    }

    // Zodスキーマでバリデーション
    const validatedData = schema.parse(mockResponse.data);

    return {
      data: validatedData,
      metadata: mockResponse.metadata,
    };
  }

  async post<T>(
    url: string,
    body: any,
    schema: z.ZodSchema<T>,
    options?: HttpRequestOptions
  ): Promise<HttpResponse<T>> {
    if (this.mockErrors.has(url)) {
      throw this.mockErrors.get(url);
    }

    const mockResponse = this.mockResponses.get(url);
    if (!mockResponse) {
      throw new Error(`No mock response set for ${url}`);
    }

    // Zodスキーマでバリデーション
    const validatedData = schema.parse(mockResponse.data);

    return {
      data: validatedData,
      metadata: mockResponse.metadata,
    };
  }
}

describe('Fetcher Interface', () => {
  let fetcher: MockFetcher;

  beforeEach(() => {
    fetcher = new MockFetcher();
  });

  describe('GET requests', () => {
    const userSchema = z.object({
      id: z.string(),
      name: z.string(),
      email: z.string().email(),
    });

    describe('正常系', () => {
      it('should perform successful GET request', async () => {
        const mockUser = {
          id: '123',
          name: 'John Doe',
          email: 'john@example.com',
        };

        fetcher.setMockResponse('/api/users/123', mockUser);

        const response = await fetcher.get('/api/users/123', userSchema);

        expect(response.data).toEqual(mockUser);
        expect(response.metadata.status).toBe(200);
        expect(response.metadata.ok).toBe(true);
      });

      it('should handle GET request with options', async () => {
        const mockData = { id: '456', name: 'Jane', email: 'jane@example.com' };

        fetcher.setMockResponse('/api/users/456', mockData);

        const options: HttpRequestOptions = {
          headers: { Authorization: 'Bearer token' },
          timeout: 5000,
        };

        const response = await fetcher.get(
          '/api/users/456',
          userSchema,
          options
        );

        expect(response.data).toEqual(mockData);
      });

      it('should validate response with Zod schema', async () => {
        const validData = {
          id: '789',
          name: 'Alice',
          email: 'alice@example.com',
        };

        fetcher.setMockResponse('/api/users/789', validData);

        const response = await fetcher.get('/api/users/789', userSchema);

        expect(response.data.id).toBe('789');
        expect(response.data.name).toBe('Alice');
        expect(response.data.email).toBe('alice@example.com');
      });
    });

    describe('異常系', () => {
      it('should throw error for HTTP error status', async () => {
        const httpError: HttpError = {
          name: 'HttpError',
          message: 'User not found',
          status: 404,
          statusText: 'Not Found',
          url: '/api/users/999',
          headers: {},
        };

        fetcher.setMockError('/api/users/999', httpError);

        await expect(
          fetcher.get('/api/users/999', userSchema)
        ).rejects.toMatchObject({
          status: 404,
          message: 'User not found',
        });
      });

      it('should throw error for invalid response schema', async () => {
        const invalidData = {
          id: '123',
          name: 'John',
          email: 'invalid-email', // 無効なメールアドレス
        };

        fetcher.setMockResponse('/api/users/123', invalidData);

        await expect(
          fetcher.get('/api/users/123', userSchema)
        ).rejects.toThrow();
      });
    });
  });

  describe('POST requests', () => {
    const createUserSchema = z.object({
      success: z.boolean(),
      id: z.string(),
      message: z.string(),
    });

    describe('正常系', () => {
      it('should perform successful POST request with JSON body', async () => {
        const requestBody = {
          name: 'New User',
          email: 'newuser@example.com',
        };

        const mockResponse = {
          success: true,
          id: 'new-user-123',
          message: 'User created successfully',
        };

        fetcher.setMockResponse('/api/users', mockResponse);

        const response = await fetcher.post(
          '/api/users',
          requestBody,
          createUserSchema
        );

        expect(response.data).toEqual(mockResponse);
        expect(response.metadata.status).toBe(200);
      });

      it('should handle POST request with string body', async () => {
        const stringBody = JSON.stringify({
          name: 'Test',
          email: 'test@example.com',
        });
        const mockResponse = {
          success: true,
          id: 'string-user-456',
          message: 'User created from string',
        };

        fetcher.setMockResponse('/api/users/string', mockResponse);

        const response = await fetcher.post(
          '/api/users/string',
          stringBody,
          createUserSchema
        );

        expect(response.data.success).toBe(true);
        expect(response.data.id).toBe('string-user-456');
      });

      it('should handle POST request with options', async () => {
        const requestBody = { name: 'Auth User', email: 'auth@example.com' };
        const mockResponse = {
          success: true,
          id: 'auth-user-789',
          message: 'Authenticated user created',
        };

        fetcher.setMockResponse('/api/users/auth', mockResponse);

        const options: HttpRequestOptions = {
          headers: {
            Authorization: 'Bearer token',
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        };

        const response = await fetcher.post(
          '/api/users/auth',
          requestBody,
          createUserSchema,
          options
        );

        expect(response.data.success).toBe(true);
      });

      it('should handle POST request with logging enabled', async () => {
        const requestBody = { name: 'Log User', email: 'log@example.com' };
        const mockResponse = {
          success: true,
          id: 'log-user-999',
          message: 'User created with logging',
        };

        fetcher.setMockResponse('/api/users/logged', mockResponse);

        const options: HttpRequestOptions = {
          headers: { 'Content-Type': 'application/json' },
          timeout: 5000,
        };

        const response = await fetcher.post(
          '/api/users/logged',
          requestBody,
          createUserSchema,
          options
        );

        expect(response.data.success).toBe(true);
        expect(response.data.id).toBe('log-user-999');
      });
    });

    describe('異常系', () => {
      it('should throw error for POST request failure', async () => {
        const httpError: HttpError = {
          name: 'HttpError',
          message: 'Validation failed',
          status: 400,
          statusText: 'Bad Request',
          url: '/api/users/invalid',
          headers: {},
          responseBody: '{"error": "Invalid email format"}',
        };

        fetcher.setMockError('/api/users/invalid', httpError);

        await expect(
          fetcher.post('/api/users/invalid', {}, createUserSchema)
        ).rejects.toMatchObject({
          status: 400,
          message: 'Validation failed',
        });
      });

      it('should throw error for invalid POST response schema', async () => {
        const invalidResponse = {
          success: 'true', // should be boolean
          id: 123, // should be string
          message: 'Invalid response',
        };

        fetcher.setMockResponse('/api/users/invalid-response', invalidResponse);

        await expect(
          fetcher.post('/api/users/invalid-response', {}, createUserSchema)
        ).rejects.toThrow();
      });
    });
  });

  describe('型安全性', () => {
    it('should provide type-safe response data', async () => {
      const schema = z.object({
        count: z.number(),
        items: z.array(z.string()),
      });

      const mockData = {
        count: 3,
        items: ['item1', 'item2', 'item3'],
      };

      fetcher.setMockResponse('/api/data', mockData);

      const response = await fetcher.get('/api/data', schema);

      // TypeScriptの型推論により、これらは型安全
      const count: number = response.data.count;
      const items: string[] = response.data.items;

      expect(count).toBe(3);
      expect(items).toHaveLength(3);
    });

    it('should enforce schema validation', async () => {
      const strictSchema = z.object({
        required: z.string(),
        optional: z.string().optional(),
      });

      const validData = {
        required: 'present',
        optional: 'also present',
      };

      const invalidData = {
        optional: 'present but required is missing',
      };

      fetcher.setMockResponse('/api/valid', validData);
      fetcher.setMockResponse('/api/invalid', invalidData);

      // 有効なデータは成功
      const validResponse = await fetcher.get('/api/valid', strictSchema);
      expect(validResponse.data.required).toBe('present');

      // 無効なデータは失敗
      await expect(fetcher.get('/api/invalid', strictSchema)).rejects.toThrow();
    });
  });

  describe('メタデータ', () => {
    it('should return complete response metadata', async () => {
      const schema = z.object({ message: z.string() });
      const mockData = { message: 'success' };
      const mockMetadata = {
        status: 201,
        statusText: 'Created',
        headers: { 'content-type': 'application/json' },
        url: '/api/created',
        ok: true,
      };

      fetcher.setMockResponse('/api/created', mockData, mockMetadata);

      const response = await fetcher.get('/api/created', schema);

      expect(response.metadata.status).toBe(201);
      expect(response.metadata.statusText).toBe('Created');
      expect(response.metadata.headers).toEqual({
        'content-type': 'application/json',
      });
      expect(response.metadata.url).toBe('/api/created');
      expect(response.metadata.ok).toBe(true);
    });
  });
});

describe('HTTP Types', () => {
  describe('ContentType constants', () => {
    it('should provide correct content type values', () => {
      expect(ContentType.JSON).toBe('application/json');
      expect(ContentType.FORM).toBe('application/x-www-form-urlencoded');
      expect(ContentType.MULTIPART).toBe('multipart/form-data');
      expect(ContentType.TEXT).toBe('text/plain');
    });
  });

  describe('DefaultHeaders constants', () => {
    it('should provide correct default headers', () => {
      expect(DefaultHeaders.JSON).toEqual({
        'Content-Type': 'application/json',
      });
      expect(DefaultHeaders.FORM).toEqual({
        'Content-Type': 'application/x-www-form-urlencoded',
      });
      expect(DefaultHeaders.TEXT).toEqual({ 'Content-Type': 'text/plain' });
    });
  });

  describe('HttpRequestOptions', () => {
    it('should accept valid options', () => {
      const options: HttpRequestOptions = {
        headers: { Authorization: 'Bearer token' },
        timeout: 5000,
        signal: new AbortController().signal,
        fetchOptions: {
          cache: 'no-cache',
          credentials: 'include',
        },
      };

      expect(options.headers).toBeDefined();
      expect(options.timeout).toBe(5000);
      expect(options.signal).toBeInstanceOf(AbortSignal);
      expect(options.fetchOptions?.cache).toBe('no-cache');
    });
  });
});
