import axios, { AxiosInstance, AxiosError } from 'axios';
import { API_BASE_URL, API_TIMEOUT } from '../constants';
import type {
  GenerateOpenersRequest,
  GenerateOpenersResponse,
  GenerateResponsesRequest,
  GenerateResponsesResponse,
  SafetyCheckRequest,
  SafetyCheckResponse,
  RewriteMessageRequest,
  RewriteMessageResponse,
  ApiError,
  UserProfile
} from '../types';

class ApiClient {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        if (this.authToken) {
          config.headers.Authorization = `Bearer ${this.authToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError<ApiError>) => {
        const apiError: ApiError = {
          detail: error.response?.data?.detail || error.message || 'Unknown error occurred',
          error_code: error.response?.data?.error_code,
          timestamp: error.response?.data?.timestamp
        };
        return Promise.reject(apiError);
      }
    );
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.client.get('/health');
    return response.data;
  }

  // Openers Endpoints
  async generateOpeners(request: GenerateOpenersRequest): Promise<GenerateOpenersResponse> {
    const response = await this.client.post('/openers', request);
    return response.data;
  }

  async previewOpener(request: GenerateOpenersRequest): Promise<{ suggestion: any }> {
    const response = await this.client.post('/openers/preview', request);
    return response.data;
  }

  async getOpenerExamples(culturalStyle: string): Promise<{ examples: any[] }> {
    const response = await this.client.get(`/openers/examples?cultural_style=${culturalStyle}`);
    return response.data;
  }

  // Responses Endpoints
  async generateResponses(request: GenerateResponsesRequest): Promise<GenerateResponsesResponse> {
    const response = await this.client.post('/responses', request);
    return response.data;
  }

  async checkContentSafety(request: SafetyCheckRequest): Promise<SafetyCheckResponse> {
    const response = await this.client.post('/responses/safety-check', request);
    return response.data;
  }

  async rewriteMessage(request: RewriteMessageRequest): Promise<RewriteMessageResponse> {
    const response = await this.client.post('/responses/rewrite', request);
    return response.data;
  }

  async getResponseExamples(culturalStyle: string): Promise<{ examples: any[] }> {
    const response = await this.client.get(`/responses/examples?cultural_style=${culturalStyle}`);
    return response.data;
  }

  // Auth Endpoints (for future implementation)
  async register(email: string, password: string, culturalStyle: string): Promise<{ user: UserProfile; token: string }> {
    const response = await this.client.post('/auth/register', { email, password, cultural_style: culturalStyle });
    return response.data;
  }

  async login(email: string, password: string): Promise<{ user: UserProfile; token: string }> {
    const response = await this.client.post('/auth/login', { email, password });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
  }

  // Profile Endpoints (for future implementation)
  async getProfile(): Promise<UserProfile> {
    const response = await this.client.get('/profile');
    return response.data;
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const response = await this.client.put('/profile', updates);
    return response.data;
  }

  async deleteProfile(): Promise<void> {
    await this.client.delete('/profile');
  }

  // Conversations Endpoints (for future implementation)
  async getConversations(): Promise<any[]> {
    const response = await this.client.get('/conversations');
    return response.data;
  }

  async createConversation(title: string): Promise<any> {
    const response = await this.client.post('/conversations', { title });
    return response.data;
  }

  async getConversation(id: string): Promise<any> {
    const response = await this.client.get(`/conversations/${id}`);
    return response.data;
  }

  async deleteConversation(id: string): Promise<void> {
    await this.client.delete(`/conversations/${id}`);
  }

  // Missions Endpoints (for future implementation)
  async getMissions(): Promise<any[]> {
    const response = await this.client.get('/missions');
    return response.data;
  }

  async getDailyMissions(): Promise<any[]> {
    const response = await this.client.get('/missions/daily');
    return response.data;
  }

  async completeMission(id: string, score: number): Promise<any> {
    const response = await this.client.post(`/missions/${id}/complete`, { score });
    return response.data;
  }

  async getMissionProgress(): Promise<any> {
    const response = await this.client.get('/missions/progress');
    return response.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export class for testing
export default ApiClient;
