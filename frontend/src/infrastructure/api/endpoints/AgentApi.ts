import { ApiClient } from '../ApiClient';

export type AssistMode = 'coach' | 'ideas' | 'rewrite' | 'troubleshoot';

export interface AssistRequest {
  query: string;
  cultural_style: string;
  mode?: AssistMode;
  conversation_context?: string[];
  goal?: string;
  num_suggestions?: number;
}

export interface AssistResponse {
  success: boolean;
  suggestions: string[];
  cultural_style: string;
  mode: AssistMode;
}

export class AgentApi {
  constructor(private client: ApiClient) {}

  async assist(req: AssistRequest): Promise<AssistResponse> {
    return this.client.post<AssistResponse>('/agent/assist', req);
  }
}

