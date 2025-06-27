import { describe, it, expect, vi } from 'vitest';
import { SessionInMemory, createLoadPresentationIdInvoker, createStorePresentationIdInvoker } from './PresentationIdInMemory';

describe('SessionInMemory', () => {
  const store = new SessionInMemory();

  describe('storePresentationId', () => {
    it('should store presentationId successfully', async () => {
      const sessionId = 'test-session-id';
      const presentationId = 'test-presentation-id';

      await store.storePresentationId(sessionId, presentationId);

      const result = await store.loadPresentationId(sessionId);
      expect(result).toBe(presentationId);
    });

    it('should handle errors during storing presentationId', async () => {
      const sessionId = 'test-session-id';
      const presentationId = 'test-presentation-id';

      const originalSet = store['sessions'].set;
      store['sessions'].set = vi.fn(() => { throw new Error('InMemory error'); });

      await expect(store.storePresentationId(sessionId, presentationId)).rejects.toThrow('InMemory error');

      store['sessions'].set = originalSet;
    });
  });

  describe('loadPresentationId', () => {
    it('should load presentationId successfully', async () => {
      const sessionId = 'test-session-id';
      const presentationId = 'test-presentation-id';
      store.storePresentationId(sessionId, presentationId);

      const result = await store.loadPresentationId(sessionId);

      expect(result).toBe(presentationId);
    });

    it('should return undefined if presentationId is not found', async () => {
      const sessionId = 'non-existent-session-id';

      const result = await store.loadPresentationId(sessionId);

      expect(result).toBeUndefined();
    });

    it('should handle errors during loading presentationId', async () => {
      const sessionId = 'test-session-id';

      const originalGet = store['sessions'].get;
      store['sessions'].get = vi.fn(() => { throw new Error('InMemory error'); });

      await expect(store.loadPresentationId(sessionId)).rejects.toThrow('InMemory error');

      store['sessions'].get = originalGet;
    });
  });
});

describe('createLoadPresentationIdInvoker', () => {
  it('should return loadPresentationId function', () => {
    const loadPresentationId = createLoadPresentationIdInvoker();
    expect(typeof loadPresentationId).toBe('function');
  });
});

describe('createStorePresentationIdInvoker', () => {
  it('should return storePresentationId function', () => {
    const storePresentationId = createStorePresentationIdInvoker();
    expect(typeof storePresentationId).toBe('function');
  });
});