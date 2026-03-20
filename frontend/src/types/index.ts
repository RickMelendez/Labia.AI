// Core types for Labia.AI frontend

export type CulturalStyle = 'boricua' | 'mexicano' | 'colombiano' | 'argentino' | 'español';

export type Tone = 'chill' | 'elegant' | 'intellectual' | 'playero' | 'minimalist';

export type RelationshipStage = 'early' | 'building' | 'established';

export type UserPlan = 'free' | 'pro' | 'premium';

// API Request Types
export interface GenerateOpenersRequest {
  bio: string;
  interests?: string[];
  cultural_style?: CulturalStyle;
  num_suggestions?: number;
  include_follow_ups?: boolean;
}

export interface GenerateResponsesRequest {
  received_message: string;
  cultural_style?: CulturalStyle;
  conversation_context?: string[];
  shared_interests?: string[];
  relationship_stage?: RelationshipStage;
  num_suggestions?: number;
}

export interface SafetyCheckRequest {
  text: string;
  cultural_style?: CulturalStyle;
}

export interface RewriteMessageRequest {
  text: string;
  cultural_style?: CulturalStyle;
  tone?: Tone;
}

// API Response Types
export interface OpenerSuggestion {
  text: string;
  tone: Tone;
  follow_ups?: string[];
  explanation?: string;
}

export interface GenerateOpenersResponse {
  suggestions: OpenerSuggestion[];
  cultural_style: CulturalStyle;
  processing_time_ms: number;
}

export interface ResponseSuggestion {
  text: string;
  tone: Tone;
  explanation?: string;
}

export interface GenerateResponsesResponse {
  success: boolean;
  suggestions: ResponseSuggestion[];
  cultural_style: CulturalStyle;
  relationship_stage: RelationshipStage;
  suggestions_remaining?: number;
}

export interface SafetyCheckResponse {
  is_safe: boolean;
  reason?: string;
  suggestion?: string;
}

export interface RewriteMessageResponse {
  original: string;
  rewritten: string;
  changes_made: string[];
}

export interface ApiError {
  detail: string;
  error_code?: string;
  timestamp?: string;
}

// User Types
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  cultural_style: CulturalStyle;
  default_tone: Tone;
  plan: UserPlan;
  interests?: string[];
  age_range?: string;
  emoji_ratio?: number;
  daily_suggestions_used: number;
  daily_limit: number;
  created_at: string;
}

// Dating-app style profile (local, user-authored)
export interface DatingProfile {
  display_name: string;
  age?: number;
  gender?: 'male' | 'female' | 'nonbinary' | 'other';
  job_title?: string;
  company?: string;
  education?: string;
  height_cm?: number;
  bio?: string;
  interests?: string[];
  photos: string[]; // local URIs
}

// Conversation Types
export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  text: string;
  tone?: Tone;
  timestamp: string;
}

// Mission/Gamification Types
export interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  category: string;
}

export interface UserMission {
  id: string;
  mission_id: string;
  mission: Mission;
  status: 'available' | 'in_progress' | 'completed';
  score?: number;
  completed_at?: string;
}

// Dating Profile (backend-persisted version for discovery)
export interface DatingProfileRemote {
  user_id: number;
  display_name: string;
  age?: number;
  gender?: 'male' | 'female' | 'nonbinary' | 'other';
  bio?: string;
  job_title?: string;
  interests?: string[];
  photo_urls: string[];
  is_discoverable: boolean;
}

// Discover / Match Types
export interface DiscoverProfile {
  user_id: number;
  display_name: string;
  age?: number;
  bio?: string;
  interests?: string[];
  photo_urls: string[];
}

export interface LikeResponse {
  liked: boolean;
  is_mutual_match: boolean;
  match_id: number | null;
}

// Match Types
export type MatchStatus =
  | 'pending_questions'
  | 'questions_ready'
  | 'user1_answered'
  | 'user2_answered'
  | 'both_answered'
  | 'confirmed'
  | 'cancelled';

export type MatchDecision = 'accept' | 'cancel';

export interface MatchQuestion {
  id: string;
  text: string;
}

export interface MatchOtherUser {
  user_id: number;
  display_name: string;
  photo_urls: string[];
}

export interface MatchSummary {
  match_id: number;
  status: MatchStatus;
  other_user: MatchOtherUser;
  i_have_answered: boolean;
  partner_has_answered: boolean;
  created_at: string;
}

export interface MatchDetail extends MatchSummary {
  questions?: MatchQuestion[];
  my_decision?: MatchDecision | null;
}

export interface MatchReveal {
  match_id: number;
  questions: MatchQuestion[];
  my_answers: Record<string, string>;
  partner_answers: Record<string, string>;
  my_decision: MatchDecision | null;
  partner_decided: boolean;
}

// ==================== Lobby / Group Discovery Types ====================

export type ActivityType =
  | 'date_night'
  | 'road_trip'
  | 'brunch'
  | 'adventure'
  | 'beach'
  | 'concert'
  | 'hiking'
  | 'chill';

export type LobbyStatus = 'open' | 'full' | 'started' | 'expired';

export type EnergyLevel = 'empty' | 'warm' | 'buzzing' | 'full';

export interface LobbyMember {
  user_id: number;
  display_name: string;
  photo_url: string | null;
  joined_at: string;
}

export interface LobbyMessage {
  id: number;
  lobby_id?: number;
  user_id: number;
  sender_name: string;
  sender_photo: string | null;
  content: string;
  created_at: string;
}

export interface Lobby {
  id: number;
  creator_id: number;
  creator_name: string;
  creator_photo: string | null;
  name: string;
  activity_type: ActivityType;
  description: string;
  max_size: number;
  member_count: number;
  status: LobbyStatus;
  energy_level: EnergyLevel;
  spots_left: number;
  location_hint?: string | null;
  time_window_hint?: string | null;
  expires_at: string;
  created_at: string;
  is_member: boolean;
}

export interface LobbyDetail extends Lobby {
  members: LobbyMember[];
}

export interface CreateLobbyInput {
  name: string;
  activity_type: ActivityType;
  description: string;
  max_size: number;
  location_hint?: string;
  time_window_hint?: string;
}

// Navigation Types
export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type MainTabParamList = {
  Chat: undefined;
  History: undefined;
  Discover: undefined;
  Trainer: undefined;
  Profile: undefined;
};

export type DiscoverStackParamList = {
  DualDiscover: undefined;
  LobbyDetail: { lobby_id: number };
  CreateLobby: undefined;
  MatchOnboarding: { match_id: number };
  MatchAnswers: { match_id: number };
  MatchReveal: { match_id: number };
  MatchConfirmed: { match_id: number };
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  OnboardingName: undefined;
  OnboardingBirthday: undefined;
  OnboardingGender: undefined;
  OnboardingInterests: undefined;
  OnboardingPhotos: undefined;
  OnboardingReady: undefined;
};

// Store Types
export interface AppState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  culturalStyle: CulturalStyle;
  defaultTone: Tone;
  isDarkMode: boolean;
  setUser: (user: UserProfile | null) => void;
  setToken: (token: string) => Promise<void>;
  setCulturalStyle: (style: CulturalStyle) => void;
  setDefaultTone: (tone: Tone) => void;
  setDarkMode: (isDarkMode: boolean) => void;
  setOnboardingCompleted: () => Promise<void>;
  logout: () => void;
}

export interface ChatState {
  currentConversation: Conversation | null;
  messages: Message[];
  isGenerating: boolean;
  error: string | null;
  setCurrentConversation: (conversation: Conversation | null) => void;
  addMessage: (message: Message) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  clearMessages: () => void;
}
