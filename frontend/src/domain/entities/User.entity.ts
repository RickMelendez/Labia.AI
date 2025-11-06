import { CulturalStyle, CulturalStyleType } from '../value-objects/CulturalStyle.vo';
import { Tone, ToneType } from '../value-objects/Tone.vo';

export type UserPlan = 'free' | 'pro' | 'premium';

/**
 * User Entity
 * Represents a user of the application
 */
export class User {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name?: string,
    public readonly culturalStyle?: CulturalStyle,
    public readonly defaultTone?: Tone,
    public readonly interests?: string[],
    public readonly plan: UserPlan = 'free',
    public readonly dailyUsage: number = 0,
    public readonly createdAt?: Date
  ) {}

  /**
   * Creates a User entity
   */
  static create(data: {
    id: string;
    email: string;
    name?: string;
    culturalStyle?: CulturalStyleType;
    defaultTone?: ToneType;
    interests?: string[];
    plan?: UserPlan;
    dailyUsage?: number;
    createdAt?: Date | string;
  }): User {
    const culturalStyle = data.culturalStyle
      ? CulturalStyle.fromTrustedSource(data.culturalStyle)
      : undefined;

    const defaultTone = data.defaultTone
      ? Tone.fromTrustedSource(data.defaultTone)
      : undefined;

    const createdAt = data.createdAt
      ? typeof data.createdAt === 'string'
        ? new Date(data.createdAt)
        : data.createdAt
      : undefined;

    return new User(
      data.id,
      data.email,
      data.name,
      culturalStyle,
      defaultTone,
      data.interests,
      data.plan || 'free',
      data.dailyUsage || 0,
      createdAt
    );
  }

  /**
   * Checks if user has reached their daily limit
   */
  hasReachedDailyLimit(): boolean {
    switch (this.plan) {
      case 'free':
        return this.dailyUsage >= 10;
      case 'pro':
        return this.dailyUsage >= 100;
      case 'premium':
        return false; // unlimited
      default:
        return true;
    }
  }

  /**
   * Gets remaining suggestions for today
   */
  getRemainingDaily(): number {
    switch (this.plan) {
      case 'free':
        return Math.max(0, 10 - this.dailyUsage);
      case 'pro':
        return Math.max(0, 100 - this.dailyUsage);
      case 'premium':
        return -1; // unlimited
      default:
        return 0;
    }
  }

  /**
   * Creates a copy with updated usage
   */
  withIncrementedUsage(amount: number = 1): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.culturalStyle,
      this.defaultTone,
      this.interests,
      this.plan,
      this.dailyUsage + amount,
      this.createdAt
    );
  }

  /**
   * Creates a copy with updated cultural style
   */
  withCulturalStyle(culturalStyle: CulturalStyle): User {
    return new User(
      this.id,
      this.email,
      this.name,
      culturalStyle,
      this.defaultTone,
      this.interests,
      this.plan,
      this.dailyUsage,
      this.createdAt
    );
  }

  /**
   * Creates a copy with updated default tone
   */
  withDefaultTone(defaultTone: Tone): User {
    return new User(
      this.id,
      this.email,
      this.name,
      this.culturalStyle,
      defaultTone,
      this.interests,
      this.plan,
      this.dailyUsage,
      this.createdAt
    );
  }
}
