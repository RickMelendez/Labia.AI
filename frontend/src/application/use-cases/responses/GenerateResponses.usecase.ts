import { ISuggestionRepository } from '../../../domain/repositories/ISuggestionRepository';
import { CulturalStyle } from '../../../domain/value-objects/CulturalStyle.vo';
import { ValidationService } from '../../../domain/services/ValidationService';
import { Suggestion } from '../../../domain/entities/Suggestion.entity';

export interface GenerateResponsesInput {
  receivedMessage: string;
  conversationContext?: string[];
  userInterests?: string[];
  culturalStyle: string;
  numSuggestions?: number;
  tone?: string;
}

export interface GenerateResponsesOutput {
  suggestions: Suggestion[];
  culturalStyle: string;
  isSafe: boolean;
}

/**
 * GenerateResponsesUseCase
 * Business logic for generating conversation responses
 */
export class GenerateResponsesUseCase {
  constructor(private suggestionRepository: ISuggestionRepository) {}

  async execute(input: GenerateResponsesInput): Promise<GenerateResponsesOutput> {
    // 1. Validate input (business rule)
    const validation = ValidationService.validateMessage(input.receivedMessage);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // 2. Create value objects
    const culturalStyle = CulturalStyle.create(input.culturalStyle);

    // 3. Check content safety (business rule)
    const isSafe = await this.suggestionRepository.checkContentSafety(
      input.receivedMessage,
      culturalStyle
    );

    if (!isSafe) {
      throw new Error('El mensaje contiene contenido inapropiado');
    }

    // 4. Call repository (data access abstraction)
    const suggestions = await this.suggestionRepository.generateResponses({
      receivedMessage: input.receivedMessage,
      conversationContext: input.conversationContext,
      userInterests: input.userInterests,
      culturalStyle,
      numSuggestions: input.numSuggestions || 3,
      tone: input.tone
    });

    // 5. Validate domain rules
    suggestions.forEach(suggestion => {
      if (!suggestion.isValid()) {
        throw new Error('Generated suggestion is invalid');
      }
    });

    // 6. Return domain entities
    return {
      suggestions,
      culturalStyle: culturalStyle.getValue(),
      isSafe
    };
  }
}





