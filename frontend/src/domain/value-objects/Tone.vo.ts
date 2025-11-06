/**
 * Tone Value Object
 * Represents a valid conversation tone with validation
 */
export type ToneType = 'chill' | 'elegant' | 'intellectual' | 'playero' | 'minimalist';

export class Tone {
  private static readonly VALID_TONES: ToneType[] = [
    'chill',
    'elegant',
    'intellectual',
    'playero',
    'minimalist'
  ];

  private constructor(private readonly value: ToneType) {}

  /**
   * Creates a Tone value object from a string
   * @throws Error if the tone is invalid
   */
  static create(value: string): Tone {
    if (!this.isValid(value)) {
      throw new Error(`Invalid tone: ${value}. Must be one of: ${this.VALID_TONES.join(', ')}`);
    }
    return new Tone(value as ToneType);
  }

  /**
   * Creates a Tone without validation (use only when value is guaranteed to be valid)
   */
  static fromTrustedSource(value: ToneType): Tone {
    return new Tone(value);
  }

  /**
   * Checks if a string is a valid tone
   */
  static isValid(value: string): boolean {
    return this.VALID_TONES.includes(value as ToneType);
  }

  /**
   * Gets the raw value
   */
  getValue(): ToneType {
    return this.value;
  }

  /**
   * Checks if two tones are equal
   */
  equals(other: Tone): boolean {
    return this.value === other.value;
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return this.value;
  }
}
