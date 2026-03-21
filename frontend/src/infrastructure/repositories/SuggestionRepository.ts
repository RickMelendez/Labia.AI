import {
  ISuggestionRepository,
  GenerateOpenersParams,
  GenerateResponsesParams,
  PreviewOpenerParams
} from '../../domain/repositories/ISuggestionRepository';
import { Suggestion } from '../../domain/entities/Suggestion.entity';
import { Tone, ToneType } from '../../domain/value-objects/Tone.vo';
import { CulturalStyle } from '../../domain/value-objects/CulturalStyle.vo';
import { OpenerApi } from '../api/endpoints/OpenerApi';
import { ResponseApi } from '../api/endpoints/ResponseApi';
import { GenerateOpenersRequestDto } from '../../application/dto/GenerateOpenersDto';
import { GenerateResponsesRequestDto } from '../../application/dto/GenerateResponsesDto';

/**
 * SuggestionRepository
 * Implementation of ISuggestionRepository using API
 */
export class SuggestionRepository implements ISuggestionRepository {
  constructor(
    private openerApi: OpenerApi,
    private responseApi: ResponseApi
  ) {}

  async generateOpeners(params: GenerateOpenersParams): Promise<Suggestion[]> {
    const dto = new GenerateOpenersRequestDto({
      bio: params.bio,
      interests: params.interests,
      culturalStyle: params.culturalStyle.getValue(),
      numSuggestions: params.numSuggestions,
      tone: params.tone,
    });

    const response = await this.openerApi.generateOpeners(dto);

    // Map API response to domain entities
    return response.suggestions.map((s) =>
      Suggestion.createOpener({
        text: s.text,
        tone: s.tone as ToneType,
        explanation: s.explanation,
        followUps: s.follow_ups
      })
    );
  }

  async generateResponses(params: GenerateResponsesParams): Promise<Suggestion[]> {
    const dto = new GenerateResponsesRequestDto({
      receivedMessage: params.receivedMessage,
      conversationContext: params.conversationContext,
      userInterests: params.userInterests,
      culturalStyle: params.culturalStyle.getValue(),
      numSuggestions: params.numSuggestions,
      tone: params.tone,
    });

    const response = await this.responseApi.generateResponses(dto);

    // Map API response to domain entities
    return response.suggestions.map((s) =>
      Suggestion.createResponse({
        text: s.text,
        tone: s.tone as ToneType,
        explanation: s.explanation
      })
    );
  }

  async previewOpener(params: PreviewOpenerParams): Promise<Suggestion> {
    const dto = new GenerateOpenersRequestDto({
      bio: params.bio,
      culturalStyle: params.culturalStyle.getValue(),
      numSuggestions: 1
    });

    const response = await this.openerApi.previewOpener(dto);

    return Suggestion.createOpener({
      text: response.suggestion.text,
      tone: params.tone.getValue(),
      explanation: response.suggestion.explanation,
      followUps: response.suggestion.follow_ups
    });
  }

  async getOpenerExamples(culturalStyle: CulturalStyle): Promise<Suggestion[]> {
    const response = await this.openerApi.getExamples(culturalStyle.getValue());

    return response.examples.map((s) =>
      Suggestion.createOpener({
        text: s.text,
        tone: s.tone,
        explanation: s.explanation,
        followUps: s.follow_ups
      })
    );
  }

  async getResponseExamples(culturalStyle: CulturalStyle): Promise<Suggestion[]> {
    const response = await this.responseApi.getExamples(culturalStyle.getValue());

    return response.examples.map((s) =>
      Suggestion.createResponse({
        text: s.text,
        tone: s.tone,
        explanation: s.explanation
      })
    );
  }

  async checkContentSafety(text: string, culturalStyle: CulturalStyle): Promise<boolean> {
    const response = await this.responseApi.checkContentSafety(text, culturalStyle.getValue());
    return response.is_safe;
  }

  async rewriteMessage(text: string, tone: Tone, culturalStyle: CulturalStyle): Promise<string> {
    const response = await this.responseApi.rewriteMessage(
      text,
      tone.getValue(),
      culturalStyle.getValue()
    );
    return response.rewritten_text;
  }
}

