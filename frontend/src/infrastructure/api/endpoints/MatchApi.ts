import { ApiClient } from '../ApiClient';
import { DatingProfileRemote } from '../../../types';

export class MatchApi {
  constructor(private client: ApiClient) {}

  async upsertDatingProfile(profile: Partial<DatingProfileRemote>): Promise<DatingProfileRemote> {
    return this.client.put<DatingProfileRemote>('/dating-profile', profile);
  }

  async getMyDatingProfile(): Promise<DatingProfileRemote> {
    return this.client.get<DatingProfileRemote>('/dating-profile/me');
  }
}
