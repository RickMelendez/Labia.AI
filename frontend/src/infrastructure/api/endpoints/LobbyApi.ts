import { ApiClient } from '../ApiClient';
import {
  Lobby, LobbyDetail, LobbyMessage, CreateLobbyInput, ActivityType,
} from '../../../types';

export class LobbyApi {
  constructor(private client: ApiClient) {}

  async listLobbies(
    activity_type?: ActivityType,
    limit = 20,
    offset = 0,
  ): Promise<{ lobbies: Lobby[]; total: number }> {
    const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
    if (activity_type) params.append('activity_type', activity_type);
    return this.client.get(`/lobbies?${params.toString()}`);
  }

  async createLobby(data: CreateLobbyInput): Promise<LobbyDetail> {
    return this.client.post('/lobbies', data);
  }

  async getLobby(lobbyId: number): Promise<LobbyDetail> {
    return this.client.get(`/lobbies/${lobbyId}`);
  }

  async joinLobby(lobbyId: number): Promise<LobbyDetail> {
    return this.client.post(`/lobbies/${lobbyId}/join`);
  }

  async leaveLobby(lobbyId: number): Promise<void> {
    return this.client.delete(`/lobbies/${lobbyId}/leave`);
  }

  async getMessages(
    lobbyId: number,
    limit = 50,
    offset = 0,
  ): Promise<{ messages: LobbyMessage[]; total: number }> {
    return this.client.get(`/lobbies/${lobbyId}/messages?limit=${limit}&offset=${offset}`);
  }

  async sendMessage(lobbyId: number, content: string): Promise<LobbyMessage> {
    return this.client.post(`/lobbies/${lobbyId}/messages`, { content });
  }
}
