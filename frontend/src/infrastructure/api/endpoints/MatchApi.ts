import { ApiClient } from '../ApiClient';
import { DatingProfileRemote, DiscoverProfile, LikeResponse } from '../../../types';

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
}
