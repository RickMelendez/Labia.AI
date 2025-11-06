/**
 * DTOs for Generate Responses API
 */

// Request DTO (sent to API)
export class GenerateResponsesRequestDto {
  received_message: string;
  conversation_context?: string[];
  user_interests?: string[];
  cultural_style: string;
  num_suggestions?: number;
  target_tone?: string;

  constructor(data: {
    receivedMessage: string;
    conversationContext?: string[];
    userInterests?: string[];
    culturalStyle: string;
    numSuggestions?: number;
    tone?: string;
  }) {
    this.received_message = data.receivedMessage;
    this.conversation_context = data.conversationContext;
    this.user_interests = data.userInterests;
    this.cultural_style = data.culturalStyle;
    this.num_suggestions = data.numSuggestions;
    this.target_tone = data.tone;
  }
}

// Response DTO (received from API)
export interface GenerateResponsesResponseDto {
  suggestions: Array<{
    text: string;
    tone: string;
    explanation?: string;
  }>;
  cultural_style: string;
  is_safe: boolean;
  processing_time_ms?: number;
}

