import { Tone, ToneType } from '../value-objects/Tone.vo';

/**
 * Suggestion Entity
 * Represents a conversation suggestion (opener or response)
 */
export class Suggestion {
  private static readonly MAX_LENGTH = 500;
  private static readonly MIN_LENGTH = 1;

  private constructor(
    public readonly text: string,
    public readonly tone: Tone,
    public readonly explanation?: string,
    public readonly followUps?: string[],
    public readonly id?: string
  ) {}

  /**
   * Creates an opener suggestion
   */
  static createOpener(data: {
    text: string;
    tone: Tone | ToneType;
    explanation?: string;
    followUps?: string[];
    id?: string;
  }): Suggestion {
    const tone = typeof data.tone === 'string' ? Tone.fromTrustedSource(data.tone) : data.tone;

    return new Suggestion(
      data.text,
      tone,
      data.explanation,
      data.followUps,
      data.id
    );
  }

  /**
   * Creates a response suggestion
   */
  static createResponse(data: {
    text: string;
    tone: Tone | ToneType;
    explanation?: string;
    id?: string;
  }): Suggestion {
    const tone = typeof data.tone === 'string' ? Tone.fromTrustedSource(data.tone) : data.tone;

    return new Suggestion(
      data.text,
      tone,
      data.explanation,
      undefined,
      data.id
    );
  }

  /**
   * Validates the suggestion follows business rules
   */
  isValid(): boolean {
    return (
      this.text.length >= Suggestion.MIN_LENGTH &&
      this.text.length <= Suggestion.MAX_LENGTH &&
      this.text.trim().length > 0
    );
  }

  /**
   * Checks if this is an opener (has follow-ups)
   */
  isOpener(): boolean {
    return this.followUps !== undefined && this.followUps.length > 0;
  }

  /**
   * Checks if this is a response (no follow-ups)
   */
  isResponse(): boolean {
    return !this.isOpener();
  }

  /**
   * Gets the tone value as string
   */
  getToneValue(): ToneType {
    return this.tone.getValue();
  }
}
