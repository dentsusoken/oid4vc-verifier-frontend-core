import { QueryBuilder } from './QueryBuilder';
import { URLBuilder } from './URLBuilder';

describe('URLBuilder', () => {
  describe('constructor', () => {
    it('should be able to create a URLBuilder with all parameters', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
        path: '/path/to/resource',
        queryBuilder: new QueryBuilder({ page: 1, limit: 10, search: 'hello' }),
      });

      expect(urlBuilder).toBeInstanceOf(URLBuilder);
      expect(urlBuilder.baseUrl).toBe('https://example.com');
      expect(urlBuilder.path).toBe('/path/to/resource');
      expect(urlBuilder.queryBuilder.query).toEqual({
        page: 1,
        limit: 10,
        search: 'hello',
      });
    });
    it('should be able to create a URLBuilder with only baseUrl', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
      });

      expect(urlBuilder).toBeInstanceOf(URLBuilder);
      expect(urlBuilder.baseUrl).toBe('https://example.com');
      expect(urlBuilder.path).toBe('/');
      expect(urlBuilder.queryBuilder.query).toEqual({});
    });
    it('should be able to create a URLBuilder with only baseUrl and path', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
        path: '/path/to/resource',
      });

      expect(urlBuilder).toBeInstanceOf(URLBuilder);
      expect(urlBuilder.baseUrl).toBe('https://example.com');
      expect(urlBuilder.path).toBe('/path/to/resource');
      expect(urlBuilder.queryBuilder.query).toEqual({});
    });
    it('should be able to create a URLBuilder with only baseUrl and query', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
        queryBuilder: new QueryBuilder({ page: 1, limit: 10, search: 'hello' }),
      });

      expect(urlBuilder).toBeInstanceOf(URLBuilder);
      expect(urlBuilder.baseUrl).toBe('https://example.com');
      expect(urlBuilder.path).toBe('/');
      expect(urlBuilder.queryBuilder.query).toEqual({
        page: 1,
        limit: 10,
        search: 'hello',
      });
    });
    it('should throw an error if baseUrl is not a string', () => {
      expect(() => new URLBuilder({ baseUrl: 123 as any })).toThrow();
    });
    it('should throw an error if path is not a string', () => {
      expect(
        () =>
          new URLBuilder({ baseUrl: 'https://example.com', path: 123 as any })
      ).toThrow();
    });
    it('should throw an error if query is not an object', () => {
      expect(
        () =>
          new URLBuilder({
            baseUrl: 'https://example.com',
            queryBuilder: 123 as any,
          })
      ).toThrow();
    });
  });
  describe('baseUrl', () => {
    it('should be able to get baseUrl', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
      });
      expect(urlBuilder.baseUrl).toBe('https://example.com');
    });
  });
  describe('path', () => {
    it('should be able to get path', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
        path: '/path/to/resource',
      });
      expect(urlBuilder.path).toBe('/path/to/resource');
    });
  });
  describe('query', () => {
    it('should be able to get query', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
        queryBuilder: new QueryBuilder({ page: 1, limit: 10, search: 'hello' }),
      });
      expect(urlBuilder.queryBuilder.query).toEqual({
        page: 1,
        limit: 10,
        search: 'hello',
      });
    });
  });
  describe('build', () => {
    it('should be able to build a URL', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
        path: '/path/to/resource',
        queryBuilder: new QueryBuilder({ page: 1, limit: 10, search: 'hello' }),
      });
      expect(urlBuilder.build()).toBe(
        'https://example.com/path/to/resource?page=1&limit=10&search=hello'
      );
    });
    it('should be able to build a URL with only baseUrl', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
      });
      expect(urlBuilder.build()).toBe('https://example.com/');
    });
    it('should be able to build a URL with only baseUrl and path', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
        path: '/path/to/resource',
      });
      expect(urlBuilder.build()).toBe('https://example.com/path/to/resource');
    });
    it('should be able to build a URL with only baseUrl and query', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
        queryBuilder: new QueryBuilder({ page: 1, limit: 10, search: 'hello' }),
      });
      expect(urlBuilder.build()).toBe(
        'https://example.com/?page=1&limit=10&search=hello'
      );
    });
  });
  describe('replacePathParams', () => {
    it('should be able to replace path params', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
        path: '/path/:id',
      });
      urlBuilder.replacePathParams({ id: '123' });
      expect(urlBuilder.path).toBe('/path/123');
    });
    it('should throw an error if path param is missing', () => {
      const urlBuilder = new URLBuilder({
        baseUrl: 'https://example.com',
        path: '/path/:id',
      });
      expect(() => urlBuilder.replacePathParams({})).toThrow();
    });
  });
});
