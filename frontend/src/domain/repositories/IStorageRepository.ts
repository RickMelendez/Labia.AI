/**
 * IStorageRepository
 * Repository interface for local storage operations
 */
export interface IStorageRepository {
  /**
   * Gets a value from storage
   */
  get<T>(key: string): Promise<T | null>;

  /**
   * Sets a value in storage
   */
  set<T>(key: string, value: T): Promise<void>;

  /**
   * Removes a value from storage
   */
  remove(key: string): Promise<void>;

  /**
   * Gets multiple values from storage
   */
  multiGet(keys: string[]): Promise<Record<string, any>>;

  /**
   * Removes multiple values from storage
   */
  multiRemove(keys: string[]): Promise<void>;

  /**
   * Clears all storage
   */
  clear(): Promise<void>;
}
