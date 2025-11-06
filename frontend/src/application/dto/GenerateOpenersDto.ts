/**
 * DTOs for Generate Openers API
 */

// Request DTO (sent to API)
export class GenerateOpenersRequestDto {
  bio: string;
  interests?: string[];
  cultural_style: string;
  num_suggestions?: number;
  target_tone?: string;

  constructor(data: {
    bio: string;
    interests?: string[];
    culturalStyle: string;
    numSuggestions?: number;
    tone?: string;
  }) {
    this.bio = data.bio;
    this.interests = data.interests;
    this.cultural_style = data.culturalStyle;
    this.num_suggestions = data.numSuggestions;
    this.target_tone = data.tone;
  }
}

// Response DTO (received from API)
export interface GenerateOpenersResponseDto {
  suggestions: Array<{
    text: string;
    tone: string;
    explanation?: string;
    follow_ups?: string[];
  }>;
  cultural_style: string;
  processing_time_ms?: number;
}

