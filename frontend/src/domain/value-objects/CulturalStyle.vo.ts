/**
 * CulturalStyle Value Object
 * Represents a valid cultural style with validation
 */
export type CulturalStyleType = 'boricua' | 'mexicano' | 'colombiano' | 'argentino' | 'español';

export class CulturalStyle {
  private static readonly VALID_STYLES: CulturalStyleType[] = [
    'boricua',
    'mexicano',
    'colombiano',
    'argentino',
    'español'
  ];

  private constructor(private readonly value: CulturalStyleType) {}

  /**
   * Creates a CulturalStyle value object from a string
   * @throws Error if the style is invalid
   */
  static create(value: string): CulturalStyle {
    if (!this.isValid(value)) {
      throw new Error(`Invalid cultural style: ${value}. Must be one of: ${this.VALID_STYLES.join(', ')}`);
    }
    return new CulturalStyle(value as CulturalStyleType);
  }

  /**
   * Creates a CulturalStyle without validation (use only when value is guaranteed to be valid)
   */
  static fromTrustedSource(value: CulturalStyleType): CulturalStyle {
    return new CulturalStyle(value);
  }

  /**
   * Checks if a string is a valid cultural style
   */
  static isValid(value: string): boolean {
    return this.VALID_STYLES.includes(value as CulturalStyleType);
  }

  /**
   * Gets the raw value
   */
  getValue(): CulturalStyleType {
    return this.value;
  }

  /**
   * Checks if two cultural styles are equal
   */
  equals(other: CulturalStyle): boolean {
    return this.value === other.value;
  }

  /**
   * Returns string representation
   */
  toString(): string {
    return this.value;
  }
}
