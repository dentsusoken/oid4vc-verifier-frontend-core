import { SessionSchemas, SessionBatch, SessionDeleteResult } from './types';

/**
 * Generic session storage interface
 *
 * Provides type-safe session storage operations for the OID4VC verification system.
 * All operations are asynchronous to support various storage backends (memory, localStorage,
 * database, etc.).
 *
 * @typeParam T - The session schema that defines the structure of stored data
 *
 * @example
 * ```typescript
 * const session: Session<SessionSchemas> = new MemorySession();
 *
 * // Type-safe operations
 * await session.set('presentationId', validPresentationId);
 * const id = await session.get('presentationId'); // Type: PresentationId | undefined
 *
 * // Batch operations
 * const values = await session.getBatch('presentationId');
 * await session.setBatch({ presentationId: newId });
 * ```
 *
 * @public
 */
export interface Session<T extends SessionSchemas> {
  /**
   * Retrieves a value from the session storage
   *
   * @param key - The key to retrieve
   * @returns Promise resolving to the stored value or undefined if not found
   *
   * @example
   * ```typescript
   * const presentationId = await session.get('presentationId');
   * if (presentationId) {
   *   console.log('Found presentation ID:', presentationId);
   * }
   * ```
   */
  get<K extends keyof T>(key: K): Promise<T[K] | undefined>;

  /**
   * Retrieves multiple values from the session storage in a single operation
   *
   * @param keys - Array of keys to retrieve
   * @returns Promise resolving to an object containing the requested key-value pairs
   *
   * @example
   * ```typescript
   * const data = await session.getBatch('presentationId');
   * console.log(data); // { presentationId: PresentationId | undefined }
   * ```
   */
  getBatch<K extends keyof T>(
    ...keys: K[]
  ): Promise<Partial<SessionBatch<T, K>>>;

  /**
   * Stores a value in the session storage
   *
   * @param key - The key to store the value under
   * @param value - The value to store
   * @returns Promise that resolves when the operation is complete
   *
   * @throws {Error} If the storage operation fails
   *
   * @example
   * ```typescript
   * await session.set('presentationId', validPresentationId);
   * ```
   */
  set<K extends keyof T>(key: K, value: T[K]): Promise<void>;

  /**
   * Stores multiple key-value pairs in the session storage in a single operation
   *
   * @param batch - Object containing key-value pairs to store
   * @returns Promise that resolves when the operation is complete
   *
   * @throws {Error} If any storage operation fails
   *
   * @example
   * ```typescript
   * await session.setBatch({
   *   presentationId: validPresentationId
   * });
   * ```
   */
  setBatch<K extends keyof T>(
    batch: Partial<SessionBatch<T, K>>
  ): Promise<void>;

  /**
   * Removes a value from the session storage
   *
   * @param key - The key to remove
   * @returns Promise resolving to the removed value or undefined if the key didn't exist
   *
   * @example
   * ```typescript
   * const removedValue = await session.delete('presentationId');
   * if (removedValue) {
   *   console.log('Removed presentation ID:', removedValue);
   * }
   * ```
   */
  delete<K extends keyof T>(key: K): Promise<T[K] | undefined>;

  /**
   * Removes multiple values from the session storage in a single operation
   *
   * @param keys - Array of keys to remove
   * @returns Promise resolving to an object containing the removed key-value pairs
   *
   * @example
   * ```typescript
   * const removed = await session.deleteBatch('presentationId');
   * console.log(removed); // { presentationId: PresentationId | undefined }
   * ```
   */
  deleteBatch<K extends keyof T>(
    ...keys: K[]
  ): Promise<SessionDeleteResult<T, K>>;

  /**
   * Removes all data from the session storage
   *
   * @returns Promise that resolves when the operation is complete
   *
   * @throws {Error} If the clear operation fails
   *
   * @example
   * ```typescript
   * await session.clear();
   * console.log('Session cleared');
   * ```
   */
  clear(): Promise<void>;

  /**
   * Checks if a key exists in the session storage
   *
   * @param key - The key to check
   * @returns Promise resolving to true if the key exists, false otherwise
   *
   * @example
   * ```typescript
   * const exists = await session.has('presentationId');
   * if (exists) {
   *   console.log('Presentation ID is stored');
   * }
   * ```
   */
  has<K extends keyof T>(key: K): Promise<boolean>;

  /**
   * Gets all keys currently stored in the session
   *
   * @returns Promise resolving to an array of all stored keys
   *
   * @example
   * ```typescript
   * const keys = await session.keys();
   * console.log('Stored keys:', keys); // ['presentationId']
   * ```
   */
  keys(): Promise<Array<keyof T>>;

  /**
   * Gets the number of items stored in the session
   *
   * @returns Promise resolving to the count of stored items
   *
   * @example
   * ```typescript
   * const count = await session.size();
   * console.log(`Session contains ${count} items`);
   * ```
   */
  size(): Promise<number>;
}
