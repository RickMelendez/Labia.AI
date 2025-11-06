import { ISuggestionRepository } from '../../../domain/repositories/ISuggestionRepository';
import { CulturalStyle } from '../../../domain/value-objects/CulturalStyle.vo';
import { ValidationService } from '../../../domain/services/ValidationService';
import { Suggestion } from '../../../domain/entities/Suggestion.entity';

export interface GenerateOpenersInput {
  bio: string;
  interests?: string[];
  culturalStyle: string;
  numSuggestions?: number;
  tone?: string;
}

export interface GenerateOpenersOutput {
  suggestions: Suggestion[];
  culturalStyle: string;
}

/**
 * GenerateOpenersUseCase
 * Business logic for generating conversation openers
 */
export class GenerateOpenersUseCase {
  constructor(private suggestionRepository: ISuggestionRepository) {}

  async execute(input: GenerateOpenersInput): Promise<GenerateOpenersOutput> {
    // 1. Validate input (business rule)
    const validation = ValidationService.validateBio(input.bio);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // 2. Create value objects
    const culturalStyle = CulturalStyle.create(input.culturalStyle);

    // 3. Call repository (data access abstraction)
    const suggestions = await this.suggestionRepository.generateOpeners({
      bio: input.bio,
      interests: input.interests,
      culturalStyle,
      numSuggestions: input.numSuggestions || 3,
      tone: input.tone
    });

    // 4. Validate domain rules
    suggestions.forEach(suggestion => {
      if (!suggestion.isValid()) {
        throw new Error('Generated suggestion is invalid');
      }
    });

    // 5. Return domain entities
    return {
      suggestions,
      culturalStyle: culturalStyle.getValue()
    };
  }
}
