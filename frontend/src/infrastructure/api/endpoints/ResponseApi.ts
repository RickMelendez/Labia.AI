import { ApiClient } from '../ApiClient';
import { GenerateResponsesRequestDto, GenerateResponsesResponseDto } from '../../../application/dto/GenerateResponsesDto';

/**
 * ResponseApi
 * API endpoints for response-related operations
 */
export class ResponseApi {
  constructor(private apiClient: ApiClient) {}

  async generateResponses(request: GenerateResponsesRequestDto): Promise<GenerateResponsesResponseDto> {
    return this.apiClient.post('/responses', request);
  }

  async checkContentSafety(text: string, culturalStyle: string): Promise<{ is_safe: boolean; issues?: string[] }> {
    return this.apiClient.post('/responses/safety-check', {
      text,
      cultural_style: culturalStyle
    });
  }

  async rewriteMessage(text: string, tone: string, culturalStyle: string): Promise<{ rewritten_text: string }> {
    return this.apiClient.post('/responses/rewrite', {
      text,
      tone,
      cultural_style: culturalStyle
    });
  }

  async getExamples(culturalStyle: string): Promise<{ examples: any[] }> {
    return this.apiClient.get(`/responses/examples?cultural_style=${culturalStyle}`);
  }
}
