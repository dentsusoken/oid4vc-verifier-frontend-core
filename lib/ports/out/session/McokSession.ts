import { Session } from './Session';
import { SessionBatch, SessionDeleteResult, SessionSchemas } from './types';

/**
 * Mock implementation of Session interface for testing purposes
 *
 * Provides an in-memory session storage implementation that can be used
 * for testing without requiring external session storage dependencies.
 * All operations are synchronous and data is stored in a Map structure.
 *
 * @template T - Session schema type extending SessionSchemas
 *
 * @example
 * ```typescript
 * const session = new McokSession();
 * await session.set('presentationId', 'test-id');
 * const id = await session.get('presentationId');
 * ```
 *
 * @public
 */
export class McokSession implements Session<SessionSchemas> {
  /**
   * Internal storage for session data using Map
   * @private
   */
  #session: Map<keyof SessionSchemas, SessionSchemas[keyof SessionSchemas]> =
    new Map();

  /**
   * Retrieves a value from the session by key
   *
   * @param key - The session key to retrieve
   * @returns Promise resolving to the stored value or undefined if not found
   *
   * @template K - Key type extending keyof SessionSchemas
   */
  get<K extends keyof SessionSchemas>(
    key: K
  ): Promise<SessionSchemas[K] | undefined> {
    return Promise.resolve(
      this.#session.get(key) as SessionSchemas[K] | undefined
    );
  }

  /**
   * Retrieves multiple values from the session by keys
   *
   * @param keys - Array of session keys to retrieve
   * @returns Promise resolving to partial batch object with requested values
   *
   * @template K - Key type extending keyof SessionSchemas
   */
  getBatch<K extends keyof SessionSchemas>(
    ...keys: K[]
  ): Promise<Partial<SessionBatch<SessionSchemas, K>>> {
    return Promise.resolve(
      keys.reduce((acc, key) => {
        acc[key] = this.#session.get(key) as SessionSchemas[K];
        return acc;
      }, {} as Partial<SessionBatch<SessionSchemas, K>>)
    );
  }

  /**
   * Stores a value in the session
   *
   * @param key - The session key to store under
   * @param value - The value to store
   * @returns Promise resolving when the value is stored
   *
   * @template K - Key type extending keyof SessionSchemas
   */
  set<K extends keyof SessionSchemas>(
    key: K,
    value: SessionSchemas[K]
  ): Promise<void> {
    this.#session.set(key, value);
    return Promise.resolve();
  }

  /**
   * Stores multiple values in the session
   *
   * @param batch - Object containing key-value pairs to store
   * @returns Promise resolving when all values are stored
   *
   * @template K - Key type extending keyof SessionSchemas
   */
  setBatch<K extends keyof SessionSchemas>(
    batch: Partial<SessionBatch<SessionSchemas, K>>
  ): Promise<void> {
    Object.entries(batch).forEach(([key, value]) => {
      this.#session.set(
        key as keyof SessionSchemas,
        value as SessionSchemas[keyof SessionSchemas]
      );
    });
    return Promise.resolve();
  }

  /**
   * Removes a value from the session and returns it
   *
   * @param key - The session key to delete
   * @returns Promise resolving to the deleted value or undefined if not found
   *
   * @template K - Key type extending keyof SessionSchemas
   */
  delete<K extends keyof SessionSchemas>(
    key: K
  ): Promise<SessionSchemas[K] | undefined> {
    const value = this.#session.get(key);
    this.#session.delete(key);
    return Promise.resolve(value as SessionSchemas[K] | undefined);
  }

  /**
   * Removes multiple values from the session and returns them
   *
   * @param keys - Array of session keys to delete
   * @returns Promise resolving to object containing deleted values
   *
   * @template K - Key type extending keyof SessionSchemas
   */
  deleteBatch<K extends keyof SessionSchemas>(
    ...keys: K[]
  ): Promise<SessionDeleteResult<SessionSchemas, K>> {
    return Promise.resolve(
      keys.reduce((acc, key) => {
        acc[key] = this.#session.get(key) as SessionSchemas[K];
        return acc;
      }, {} as SessionDeleteResult<SessionSchemas, K>)
    );
  }

  /**
   * Clears all values from the session
   *
   * @returns Promise resolving when the session is cleared
   */
  clear(): Promise<void> {
    return Promise.resolve();
  }

  /**
   * Checks if a key exists in the session
   *
   * @param key - The session key to check
   * @returns Promise resolving to true if the key exists, false otherwise
   *
   * @template K - Key type extending keyof SessionSchemas
   */
  has<K extends keyof SessionSchemas>(key: K): Promise<boolean> {
    return Promise.resolve(this.#session.has(key));
  }

  /**
   * Returns all keys currently stored in the session
   *
   * @returns Promise resolving to array of all session keys
   */
  keys(): Promise<Array<keyof SessionSchemas>> {
    return Promise.resolve(Array.from(this.#session.keys()));
  }

  /**
   * Returns the number of items in the session
   *
   * Note: This mock implementation always returns 0 for testing purposes
   *
   * @returns Promise resolving to session size (always 0 in mock)
   */
  size(): Promise<number> {
    return Promise.resolve(0);
  }
}
