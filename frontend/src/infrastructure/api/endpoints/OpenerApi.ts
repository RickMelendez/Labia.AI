import { ApiClient } from '../ApiClient';
import { GenerateOpenersRequestDto, GenerateOpenersResponseDto } from '../../../application/dto/GenerateOpenersDto';

/**
 * OpenerApi
 * API endpoints for opener-related operations
 */
export class OpenerApi {
  constructor(private apiClient: ApiClient) {}

  async generateOpeners(request: GenerateOpenersRequestDto): Promise<GenerateOpenersResponseDto> {
    return this.apiClient.post('/openers', request);
  }

  async previewOpener(request: GenerateOpenersRequestDto): Promise<{ suggestion: any }> {
    return this.apiClient.post('/openers/preview', request);
  }

  async getExamples(culturalStyle: string): Promise<{ examples: any[] }> {
    return this.apiClient.get(`/openers/examples?cultural_style=${culturalStyle}`);
  }
}
