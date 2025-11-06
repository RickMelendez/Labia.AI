import { CulturalStyle } from '../value-objects/CulturalStyle.vo';
import { Tone } from '../value-objects/Tone.vo';
import { Suggestion } from '../entities/Suggestion.entity';

export interface GenerateOpenersParams {
  bio: string;
  interests?: string[];
  culturalStyle: CulturalStyle;
  numSuggestions?: number;
  tone?: string;
}

export interface GenerateResponsesParams {
  receivedMessage: string;
  conversationContext?: string[];
  userInterests?: string[];
  culturalStyle: CulturalStyle;
  numSuggestions?: number;
  tone?: string;
}

export interface PreviewOpenerParams {
  bio: string;
  tone: Tone;
  culturalStyle: CulturalStyle;
}

/**
 * ISuggestionRepository
 * Repository interface for suggestion-related operations
 */
export interface ISuggestionRepository {
  /**
   * Generates conversation openers based on bio
   */
  generateOpeners(params: GenerateOpenersParams): Promise<Suggestion[]>;

  /**
   * Generates conversation responses based on received message
   */
  generateResponses(params: GenerateResponsesParams): Promise<Suggestion[]>;

  /**
   * Previews a single opener with specific tone
   */
  previewOpener(params: PreviewOpenerParams): Promise<Suggestion>;

  /**
   * Gets example openers for a cultural style
   */
  getOpenerExamples(culturalStyle: CulturalStyle): Promise<Suggestion[]>;

  /**
   * Gets example responses for a cultural style
   */
  getResponseExamples(culturalStyle: CulturalStyle): Promise<Suggestion[]>;

  /**
   * Checks if content is safe/appropriate
   */
  checkContentSafety(text: string, culturalStyle: CulturalStyle): Promise<boolean>;

  /**
   * Rewrites a message with a different tone
   */
  rewriteMessage(text: string, tone: Tone, culturalStyle: CulturalStyle): Promise<string>;
}

