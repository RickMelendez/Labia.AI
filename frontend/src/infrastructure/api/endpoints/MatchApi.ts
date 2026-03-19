import { ApiClient } from '../ApiClient';
import { DatingProfileRemote, DiscoverProfile, LikeResponse, MatchSummary, MatchDetail, MatchReveal, MatchDecision } from '../../../types';

export class MatchApi {
  constructor(private client: ApiClient) {}

  async upsertDatingProfile(profile: Partial<DatingProfileRemote>): Promise<DatingProfileRemote> {
    return this.client.put<DatingProfileRemote>('/dating-profile', profile);
  }

  async getMyDatingProfile(): Promise<DatingProfileRemote> {
    return this.client.get<DatingProfileRemote>('/dating-profile/me');
  }

  async getDiscoverFeed(limit: number, offset: number): Promise<{ profiles: DiscoverProfile[]; has_more: boolean }> {
    return this.client.get(`/discover?limit=${limit}&offset=${offset}`);
  }

  async likeUser(userId: number): Promise<LikeResponse> {
    return this.client.post<LikeResponse>(`/discover/like/${userId}`);
  }

  async getMatches(): Promise<{ matches: MatchSummary[] }> {
    return this.client.get('/matches');
  }

  async getMatchDetail(matchId: number): Promise<MatchDetail> {
    return this.client.get(`/matches/${matchId}`);
  }

  async submitAnswers(matchId: number, answers: Record<string, string>): Promise<MatchDetail> {
    return this.client.post(`/matches/${matchId}/answers`, { answers });
  }

  async getReveal(matchId: number): Promise<MatchReveal> {
    return this.client.get(`/matches/${matchId}/reveal`);
  }

  async submitDecision(matchId: number, decision: MatchDecision): Promise<MatchDetail> {
    return this.client.post(`/matches/${matchId}/decision`, { decision });
  }
}
