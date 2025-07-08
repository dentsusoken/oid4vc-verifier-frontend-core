/**
 * HTTP request headers configuration
 *
 * @public
 */
export interface HttpHeaders {
  [key: string]: string;
}

/**
 * HTTP request configuration options
 *
 * @public
 */
export interface HttpRequestOptions {
  /** Request headers to be sent with the HTTP request */
  headers?: HttpHeaders;

  /** Request timeout in milliseconds */
  timeout?: number;

  /** Request abort signal for cancellation */
  signal?: AbortSignal;

  /** Additional fetch options */
  fetchOptions?: Omit<RequestInit, 'method' | 'body' | 'headers' | 'signal'>;
}

/**
 * HTTP response metadata
 *
 * @public
 */
export interface HttpResponseMetadata {
  /** HTTP status code */
  status: number;

  /** HTTP status text */
  statusText: string;

  /** Response headers */
  headers: HttpHeaders;

  /** Request URL */
  url: string;

  /** Whether the response was successful (status 200-299) */
  ok: boolean;
}

/**
 * Complete HTTP response including data and metadata
 *
 * @typeParam T - The type of the response data
 * @public
 */
export interface HttpResponse<T> {
  /** Parsed response data */
  data: T;

  /** Response metadata */
  metadata: HttpResponseMetadata;
}

/**
 * HTTP error information
 *
 * @public
 */
export interface HttpError extends Error {
  /** HTTP status code (if available) */
  status?: number;

  /** HTTP status text (if available) */
  statusText?: string;

  /** Response headers (if available) */
  headers?: HttpHeaders;

  /** Request URL */
  url: string;

  /** Raw response body (if available) */
  responseBody?: string;
}

/**
 * Request body types that can be sent with POST requests
 *
 * @public
 */
export type HttpRequestBody =
  | string
  | FormData
  | URLSearchParams
  | ArrayBuffer
  | Blob
  | ReadableStream
  | object; // Will be JSON.stringify'd

/**
 * Content type constants for common scenarios
 *
 * @public
 */
export const ContentType = {
  JSON: 'application/json',
  FORM: 'application/x-www-form-urlencoded',
  MULTIPART: 'multipart/form-data',
  TEXT: 'text/plain',
} as const;

/**
 * Default HTTP headers for common scenarios
 *
 * @public
 */
export const DefaultHeaders = {
  JSON: { 'Content-Type': ContentType.JSON },
  FORM: { 'Content-Type': ContentType.FORM },
  TEXT: { 'Content-Type': ContentType.TEXT },
} as const;
