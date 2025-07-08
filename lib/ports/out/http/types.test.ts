import { describe, it, expect } from 'vitest';
import {
  HttpHeaders,
  HttpRequestOptions,
  HttpResponseMetadata,
  HttpResponse,
  HttpError,
  HttpRequestBody,
  ContentType,
  DefaultHeaders,
} from './types';

describe('HTTP Types', () => {
  describe('HttpHeaders', () => {
    it('should accept string key-value pairs', () => {
      const headers: HttpHeaders = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
        'X-Custom-Header': 'custom-value',
      };

      expect(headers['Content-Type']).toBe('application/json');
      expect(headers['Authorization']).toBe('Bearer token');
      expect(headers['X-Custom-Header']).toBe('custom-value');
    });

    it('should allow empty headers object', () => {
      const headers: HttpHeaders = {};
      expect(Object.keys(headers)).toHaveLength(0);
    });
  });

  describe('HttpRequestOptions', () => {
    it('should accept all optional properties', () => {
      const controller = new AbortController();

      const options: HttpRequestOptions = {
        headers: { Authorization: 'Bearer token' },
        timeout: 5000,
        signal: controller.signal,
        enableLogging: true,
        fetchOptions: {
          cache: 'no-cache',
          credentials: 'include',
        },
      };

      expect(options.headers).toBeDefined();
      expect(options.timeout).toBe(5000);
      expect(options.signal).toBe(controller.signal);
      expect(options.enableLogging).toBe(true);
      expect(options.fetchOptions?.cache).toBe('no-cache');
    });

    it('should work with empty options', () => {
      const options: HttpRequestOptions = {};
      expect(options).toEqual({});
    });

    it('should work with partial options', () => {
      const options: HttpRequestOptions = {
        timeout: 3000,
      };

      expect(options.timeout).toBe(3000);
      expect(options.headers).toBeUndefined();
    });

    it('should handle enableLogging option', () => {
      const developmentOptions: HttpRequestOptions = {
        enableLogging: true,
      };

      const productionOptions: HttpRequestOptions = {
        enableLogging: false,
      };

      const defaultOptions: HttpRequestOptions = {};

      expect(developmentOptions.enableLogging).toBe(true);
      expect(productionOptions.enableLogging).toBe(false);
      expect(defaultOptions.enableLogging).toBeUndefined();
    });

    it('should work with environment-based logging', () => {
      // 実際の使用例のシミュレーション
      const isDevelopment = process.env.NODE_ENV === 'development';

      const options: HttpRequestOptions = {
        headers: { Authorization: 'Bearer token' },
        enableLogging: isDevelopment,
        timeout: 5000,
      };

      expect(options.enableLogging).toBe(isDevelopment);
      expect(typeof options.enableLogging).toBe('boolean');
    });
  });

  describe('HttpResponseMetadata', () => {
    it('should contain all required response metadata', () => {
      const metadata: HttpResponseMetadata = {
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'application/json' },
        url: 'https://api.example.com/data',
        ok: true,
      };

      expect(metadata.status).toBe(200);
      expect(metadata.statusText).toBe('OK');
      expect(metadata.headers).toEqual({ 'content-type': 'application/json' });
      expect(metadata.url).toBe('https://api.example.com/data');
      expect(metadata.ok).toBe(true);
    });

    it('should handle error status metadata', () => {
      const metadata: HttpResponseMetadata = {
        status: 404,
        statusText: 'Not Found',
        headers: {},
        url: 'https://api.example.com/missing',
        ok: false,
      };

      expect(metadata.status).toBe(404);
      expect(metadata.ok).toBe(false);
    });
  });

  describe('HttpResponse', () => {
    it('should combine data and metadata', () => {
      interface UserData {
        id: string;
        name: string;
      }

      const userData: UserData = {
        id: '123',
        name: 'John Doe',
      };

      const response: HttpResponse<UserData> = {
        data: userData,
        metadata: {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          url: 'https://api.example.com/users/123',
          ok: true,
        },
      };

      expect(response.data.id).toBe('123');
      expect(response.data.name).toBe('John Doe');
      expect(response.metadata.status).toBe(200);
    });

    it('should work with different data types', () => {
      const stringResponse: HttpResponse<string> = {
        data: 'Hello World',
        metadata: {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'text/plain' },
          url: 'https://api.example.com/text',
          ok: true,
        },
      };

      const numberResponse: HttpResponse<number> = {
        data: 42,
        metadata: {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
          url: 'https://api.example.com/number',
          ok: true,
        },
      };

      expect(typeof stringResponse.data).toBe('string');
      expect(typeof numberResponse.data).toBe('number');
    });
  });

  describe('HttpError', () => {
    it('should extend Error with HTTP-specific properties', () => {
      const httpError: HttpError = {
        name: 'HttpError',
        message: 'Request failed',
        status: 500,
        statusText: 'Internal Server Error',
        headers: { 'content-type': 'application/json' },
        url: 'https://api.example.com/error',
        responseBody: '{"error": "Server error"}',
      };

      expect(httpError.name).toBe('HttpError');
      expect(httpError.message).toBe('Request failed');
      expect(httpError.status).toBe(500);
      expect(httpError.statusText).toBe('Internal Server Error');
      expect(httpError.url).toBe('https://api.example.com/error');
      expect(httpError.responseBody).toBe('{"error": "Server error"}');
    });

    it('should work with minimal error information', () => {
      const minimalError: HttpError = {
        name: 'HttpError',
        message: 'Network error',
        url: 'https://api.example.com/timeout',
      };

      expect(minimalError.message).toBe('Network error');
      expect(minimalError.url).toBe('https://api.example.com/timeout');
      expect(minimalError.status).toBeUndefined();
    });
  });

  describe('HttpRequestBody', () => {
    it('should accept string body', () => {
      const body: HttpRequestBody = 'raw string data';
      expect(typeof body).toBe('string');
    });

    it('should accept object body', () => {
      const body: HttpRequestBody = {
        name: 'John',
        email: 'john@example.com',
      };
      expect(typeof body).toBe('object');
    });

    it('should accept FormData body', () => {
      const formData = new FormData();
      formData.append('field', 'value');

      const body: HttpRequestBody = formData;
      expect(body).toBeInstanceOf(FormData);
    });

    it('should accept URLSearchParams body', () => {
      const params = new URLSearchParams();
      params.append('key', 'value');

      const body: HttpRequestBody = params;
      expect(body).toBeInstanceOf(URLSearchParams);
    });

    it('should accept ArrayBuffer body', () => {
      const buffer = new ArrayBuffer(8);
      const body: HttpRequestBody = buffer;
      expect(body).toBeInstanceOf(ArrayBuffer);
    });

    it('should accept Blob body', () => {
      const blob = new Blob(['test'], { type: 'text/plain' });
      const body: HttpRequestBody = blob;
      expect(body).toBeInstanceOf(Blob);
    });
  });

  describe('ContentType constants', () => {
    it('should provide correct MIME types', () => {
      expect(ContentType.JSON).toBe('application/json');
      expect(ContentType.FORM).toBe('application/x-www-form-urlencoded');
      expect(ContentType.MULTIPART).toBe('multipart/form-data');
      expect(ContentType.TEXT).toBe('text/plain');
    });

    it('should be immutable constants', () => {
      // TypeScriptのas constにより、これらは読み取り専用
      const json: 'application/json' = ContentType.JSON;
      const form: 'application/x-www-form-urlencoded' = ContentType.FORM;

      expect(json).toBe('application/json');
      expect(form).toBe('application/x-www-form-urlencoded');
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

      expect(DefaultHeaders.TEXT).toEqual({
        'Content-Type': 'text/plain',
      });
    });

    it('should be usable in request options', () => {
      const options: HttpRequestOptions = {
        headers: {
          ...DefaultHeaders.JSON,
          Authorization: 'Bearer token',
        },
      };

      expect(options.headers).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      });
    });
  });

  describe('型の組み合わせ', () => {
    it('should work together in realistic scenarios', () => {
      // リクエストオプションの設定
      const requestOptions: HttpRequestOptions = {
        headers: {
          ...DefaultHeaders.JSON,
          Authorization: 'Bearer token',
        },
        timeout: 5000,
      };

      // レスポンスの定義
      interface ApiResponse {
        success: boolean;
        data: any;
      }

      const response: HttpResponse<ApiResponse> = {
        data: {
          success: true,
          data: { id: '123', name: 'Test' },
        },
        metadata: {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': ContentType.JSON },
          url: 'https://api.example.com/test',
          ok: true,
        },
      };

      expect(requestOptions.headers?.['Content-Type']).toBe('application/json');
      expect(response.data.success).toBe(true);
      expect(response.metadata.status).toBe(200);
    });

    it('should handle error scenarios', () => {
      const errorResponse: HttpError = {
        name: 'HttpError',
        message: 'Validation failed',
        status: 400,
        statusText: 'Bad Request',
        url: 'https://api.example.com/validate',
        headers: { 'content-type': ContentType.JSON },
        responseBody: JSON.stringify({
          error: 'Invalid input',
          details: ['Email is required'],
        }),
      };

      expect(errorResponse.status).toBe(400);
      expect(errorResponse.headers?.['content-type']).toBe('application/json');

      const parsedBody = JSON.parse(errorResponse.responseBody || '{}');
      expect(parsedBody.error).toBe('Invalid input');
    });
  });
});
