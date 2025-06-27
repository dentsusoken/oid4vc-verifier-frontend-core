import { QueryBuilder } from './QueryBuilder';

describe('QueryBuilder', () => {
  describe('constructor', () => {
    it('should be able to create a QueryBuilder', () => {
      const queryBuilder = new QueryBuilder({
        page: 1,
        limit: 10,
        search: 'hello',
      });

      expect(queryBuilder).toBeInstanceOf(QueryBuilder);
      expect(queryBuilder.query).toEqual({
        page: 1,
        limit: 10,
        search: 'hello',
      });
    });
    it('should be able to create a QueryBuilder with an empty object', () => {
      const queryBuilder = new QueryBuilder();

      expect(queryBuilder).toBeInstanceOf(QueryBuilder);
      expect(queryBuilder.query).toEqual({});
    });
    it('should throw an error if query is not an object', () => {
      expect(() => new QueryBuilder(123 as any)).toThrow();
    });
  });
  describe('query', () => {
    it('should be able to get the query', () => {
      const queryBuilder = new QueryBuilder({
        page: 1,
        limit: 10,
        search: 'hello',
      });

      expect(queryBuilder.query).toEqual({
        page: 1,
        limit: 10,
        search: 'hello',
      });
    });
  });
  describe('build', () => {
    it('should be able to build the query', () => {
      const queryBuilder = new QueryBuilder({
        page: 1,
        limit: 10,
        search: 'hello',
        isActive: true,
        tags: ['tag1', 'tag2'],
      });

      expect(queryBuilder.build()).toEqual(
        `page=1&limit=10&search=hello&isActive=true&tags=${encodeURIComponent(
          '["tag1","tag2"]'
        )}`
      );
    });
  });
});
