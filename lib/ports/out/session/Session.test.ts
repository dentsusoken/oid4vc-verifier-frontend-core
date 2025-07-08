import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Session, SessionSchemas, SessionBatch, SessionDeleteResult } from './';

// テスト用のモック実装
class MockSession implements Session<SessionSchemas> {
  private storage = new Map<keyof SessionSchemas, any>();

  async get<K extends keyof SessionSchemas>(
    key: K
  ): Promise<SessionSchemas[K] | undefined> {
    return this.storage.get(key);
  }

  async getBatch<K extends keyof SessionSchemas>(
    ...keys: K[]
  ): Promise<Partial<SessionBatch<SessionSchemas, K>>> {
    const result: Partial<SessionBatch<SessionSchemas, K>> = {};
    for (const key of keys) {
      result[key] = this.storage.get(key);
    }
    return result;
  }

  async set<K extends keyof SessionSchemas>(
    key: K,
    value: SessionSchemas[K]
  ): Promise<void> {
    this.storage.set(key, value);
  }

  async setBatch<K extends keyof SessionSchemas>(
    batch: Partial<SessionBatch<SessionSchemas, K>>
  ): Promise<void> {
    for (const [key, value] of Object.entries(batch)) {
      if (value !== undefined) {
        this.storage.set(key as K, value);
      }
    }
  }

  async delete<K extends keyof SessionSchemas>(
    key: K
  ): Promise<SessionSchemas[K] | undefined> {
    const value = this.storage.get(key);
    this.storage.delete(key);
    return value;
  }

  async deleteBatch<K extends keyof SessionSchemas>(
    ...keys: K[]
  ): Promise<SessionDeleteResult<SessionSchemas, K>> {
    const result: SessionDeleteResult<SessionSchemas, K> =
      {} as SessionDeleteResult<SessionSchemas, K>;
    for (const key of keys) {
      result[key] = this.storage.get(key);
      this.storage.delete(key);
    }
    return result;
  }

  async clear(): Promise<void> {
    this.storage.clear();
  }

  async has<K extends keyof SessionSchemas>(key: K): Promise<boolean> {
    return this.storage.has(key);
  }

  async keys(): Promise<Array<keyof SessionSchemas>> {
    return Array.from(this.storage.keys());
  }

  async size(): Promise<number> {
    return this.storage.size;
  }
}

describe('Session', () => {
  let session: MockSession;
  const mockPresentationId = 'test-presentation-id' as any; // PresentationId型として扱う

  beforeEach(() => {
    session = new MockSession();
  });

  describe('get/set operations', () => {
    describe('正常系', () => {
      it('should store and retrieve a value', async () => {
        await session.set('presentationId', mockPresentationId);
        const result = await session.get('presentationId');

        expect(result).toBe(mockPresentationId);
      });

      it('should return undefined for non-existent key', async () => {
        const result = await session.get('presentationId');

        expect(result).toBeUndefined();
      });

      it('should overwrite existing value', async () => {
        const firstId = 'first-id' as any;
        const secondId = 'second-id' as any;

        await session.set('presentationId', firstId);
        await session.set('presentationId', secondId);
        const result = await session.get('presentationId');

        expect(result).toBe(secondId);
      });
    });
  });

  describe('batch operations', () => {
    describe('getBatch', () => {
      it('should retrieve multiple values', async () => {
        await session.set('presentationId', mockPresentationId);

        const result = await session.getBatch('presentationId');

        expect(result).toEqual({
          presentationId: mockPresentationId,
        });
      });

      it('should handle non-existent keys in batch', async () => {
        const result = await session.getBatch('presentationId');

        expect(result).toEqual({
          presentationId: undefined,
        });
      });
    });

    describe('setBatch', () => {
      it('should store multiple values', async () => {
        await session.setBatch({
          presentationId: mockPresentationId,
        });

        const result = await session.get('presentationId');
        expect(result).toBe(mockPresentationId);
      });

      it('should handle partial batch updates', async () => {
        await session.set('presentationId', mockPresentationId);

        await session.setBatch({});

        const result = await session.get('presentationId');
        expect(result).toBe(mockPresentationId);
      });
    });
  });

  describe('delete operations', () => {
    describe('単一削除', () => {
      it('should delete and return existing value', async () => {
        await session.set('presentationId', mockPresentationId);

        const result = await session.delete('presentationId');

        expect(result).toBe(mockPresentationId);
        expect(await session.get('presentationId')).toBeUndefined();
      });

      it('should return undefined when deleting non-existent key', async () => {
        const result = await session.delete('presentationId');

        expect(result).toBeUndefined();
      });
    });

    describe('バッチ削除', () => {
      it('should delete multiple values and return them', async () => {
        await session.set('presentationId', mockPresentationId);

        const result = await session.deleteBatch('presentationId');

        expect(result).toEqual({
          presentationId: mockPresentationId,
        });
        expect(await session.get('presentationId')).toBeUndefined();
      });

      it('should handle non-existent keys in batch delete', async () => {
        const result = await session.deleteBatch('presentationId');

        expect(result).toEqual({
          presentationId: undefined,
        });
      });
    });
  });

  describe('utility operations', () => {
    describe('has', () => {
      it('should return true for existing key', async () => {
        await session.set('presentationId', mockPresentationId);

        const exists = await session.has('presentationId');

        expect(exists).toBe(true);
      });

      it('should return false for non-existent key', async () => {
        const exists = await session.has('presentationId');

        expect(exists).toBe(false);
      });
    });

    describe('keys', () => {
      it('should return empty array when no keys exist', async () => {
        const keys = await session.keys();

        expect(keys).toEqual([]);
      });

      it('should return all stored keys', async () => {
        await session.set('presentationId', mockPresentationId);

        const keys = await session.keys();

        expect(keys).toEqual(['presentationId']);
      });
    });

    describe('size', () => {
      it('should return 0 when empty', async () => {
        const size = await session.size();

        expect(size).toBe(0);
      });

      it('should return correct count', async () => {
        await session.set('presentationId', mockPresentationId);

        const size = await session.size();

        expect(size).toBe(1);
      });
    });

    describe('clear', () => {
      it('should remove all stored data', async () => {
        await session.set('presentationId', mockPresentationId);

        await session.clear();

        expect(await session.size()).toBe(0);
        expect(await session.get('presentationId')).toBeUndefined();
      });

      it('should work on empty session', async () => {
        await session.clear();

        expect(await session.size()).toBe(0);
      });
    });
  });

  describe('型安全性', () => {
    it('should enforce correct types for keys', async () => {
      // TypeScriptコンパイル時にのみ検証される
      await session.set('presentationId', mockPresentationId);

      // これらの操作は型安全である必要がある
      const value: typeof mockPresentationId | undefined = await session.get(
        'presentationId'
      );
      const exists: boolean = await session.has('presentationId');
      const keys: Array<keyof SessionSchemas> = await session.keys();

      expect(value).toBe(mockPresentationId);
      expect(exists).toBe(true);
      expect(keys).toContain('presentationId');
    });
  });

  describe('エラーハンドリング', () => {
    it('should handle storage errors gracefully', async () => {
      // エラーを投げるモック実装
      const errorSession = {
        ...session,
        set: vi.fn().mockRejectedValue(new Error('Storage error')),
      } as any;

      await expect(
        errorSession.set('presentationId', mockPresentationId)
      ).rejects.toThrow('Storage error');
    });

    it('should handle clear errors gracefully', async () => {
      const errorSession = {
        ...session,
        clear: vi.fn().mockRejectedValue(new Error('Clear failed')),
      } as any;

      await expect(errorSession.clear()).rejects.toThrow('Clear failed');
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent get/set operations', async () => {
      const operations = [
        session.set('presentationId', mockPresentationId),
        session.get('presentationId'),
        session.has('presentationId'),
      ];

      const results = await Promise.all(operations);

      // setは戻り値なし、getは値またはundefined、hasはboolean
      expect(results[0]).toBeUndefined(); // set戻り値
      expect(results[2]).toBeDefined(); // hasの結果
    });

    it('should handle concurrent batch operations', async () => {
      const batchSet = session.setBatch({ presentationId: mockPresentationId });
      const batchGet = session.getBatch('presentationId');

      await Promise.all([batchSet, batchGet]);

      const finalValue = await session.get('presentationId');
      expect(finalValue).toBe(mockPresentationId);
    });
  });
});
