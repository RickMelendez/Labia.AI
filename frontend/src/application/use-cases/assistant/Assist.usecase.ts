import { AgentApi, AssistMode } from '../../../infrastructure/api/endpoints/AgentApi';

export interface AssistInput {
  query: string;
  culturalStyle: string;
  mode?: AssistMode;
  conversationContext?: string[];
  goal?: string;
  numSuggestions?: number;
}

export class AssistUseCase {
  constructor(private api: AgentApi) {}

  async execute(input: AssistInput): Promise<{ suggestions: string[] }> {
    const res = await this.api.assist({
      query: input.query,
      cultural_style: input.culturalStyle,
      mode: input.mode || 'coach',
      conversation_context: input.conversationContext,
      goal: input.goal,
      num_suggestions: input.numSuggestions ?? 3,
    });
    return { suggestions: res.suggestions };
  }
}

