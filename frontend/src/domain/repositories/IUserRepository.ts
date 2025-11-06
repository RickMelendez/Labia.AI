import { User } from '../entities/User.entity';

/**
 * IUserRepository
 * Repository interface for user-related operations
 */
export interface IUserRepository {
  /**
   * Gets the current authenticated user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Updates user profile
   */
  updateProfile(userId: string, updates: Partial<{
    name: string;
    culturalStyle: string;
    defaultTone: string;
    interests: string[];
  }>): Promise<User>;

  /**
   * Increments daily usage count
   */
  incrementDailyUsage(userId: string, amount?: number): Promise<User>;

  /**
   * Resets daily usage (called daily)
   */
  resetDailyUsage(userId: string): Promise<User>;
}
