import { ApiClient } from '../ApiClient';
import { UserProfile, CulturalStyle, Tone } from '../../../types';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  country: string;
  cultural_style?: CulturalStyle;
}

interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

interface AuthUserResponse {
  id: number;
  email: string;
  name: string;
  country: string;
  plan: string;
  cultural_style: string;
  is_verified: boolean;
  created_at: string;
}

interface AuthResponse {
  user: AuthUserResponse;
  tokens: AuthTokens;
}

function mapToUserProfile(user: AuthUserResponse): UserProfile {
  return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    cultural_style: (user.cultural_style as CulturalStyle) || 'boricua',
    default_tone: 'chill' as Tone,
    plan: (user.plan as UserProfile['plan']) || 'free',
    daily_suggestions_used: 0,
    daily_limit: 10,
    created_at: user.created_at,
  };
}

export class AuthApi {
  constructor(private apiClient: ApiClient) {}

  async login(request: LoginRequest): Promise<{ user: UserProfile; token: string }> {
    const response = await this.apiClient.post<AuthResponse>('/auth/login', request);
    return {
      user: mapToUserProfile(response.user),
      token: response.tokens.access_token,
    };
  }

  async register(request: RegisterRequest): Promise<{ user: UserProfile; token: string }> {
    const response = await this.apiClient.post<AuthResponse>('/auth/register', request);
    return {
      user: mapToUserProfile(response.user),
      token: response.tokens.access_token,
    };
  }

  async getMe(): Promise<UserProfile> {
    const user = await this.apiClient.get<AuthUserResponse>('/auth/me');
    return mapToUserProfile(user);
  }
}
