import { create } from 'zustand';
import { Lobby, LobbyDetail, LobbyMessage, CreateLobbyInput, ActivityType } from '../types';

const POLL_INTERVAL_MS = 5000;

interface LobbyState {
  // Feed of open lobbies
  lobbies: Lobby[];
  lobbiesLoading: boolean;

  // Active lobby being viewed
  activeLobby: LobbyDetail | null;
  activeLobbyLoading: boolean;

  // Group chat messages for the active lobby
  messages: LobbyMessage[];
  messagesLoading: boolean;

  // Polling for new messages
  _pollingInterval: ReturnType<typeof setInterval> | null;

  // Actions
  fetchLobbies: (activityType?: ActivityType, reset?: boolean) => Promise<void>;
  fetchLobbyDetail: (lobbyId: number) => Promise<LobbyDetail | null>;
  joinLobby: (lobbyId: number) => Promise<LobbyDetail | null>;
  leaveLobby: (lobbyId: number) => Promise<void>;
  createLobby: (data: CreateLobbyInput) => Promise<LobbyDetail | null>;
  fetchMessages: (lobbyId: number) => Promise<void>;
  sendMessage: (lobbyId: number, content: string) => Promise<void>;
  startPolling: (lobbyId: number) => void;
  stopPolling: () => void;
  clearActiveLobby: () => void;
}

export const useLobbyStore = create<LobbyState>((set, get) => ({
  lobbies: [],
  lobbiesLoading: false,
  activeLobby: null,
  activeLobbyLoading: false,
  messages: [],
  messagesLoading: false,
  _pollingInterval: null,

  fetchLobbies: async (activityType?: ActivityType, reset = false) => {
    set({ lobbiesLoading: true, ...(reset ? { lobbies: [] } : {}) });
    try {
      const { container } = await import('../infrastructure/di/Container');
      const data = await container.lobbyApi.listLobbies(activityType);
      set({ lobbies: data.lobbies, lobbiesLoading: false });
    } catch {
      set({ lobbiesLoading: false });
    }
  },

  fetchLobbyDetail: async (lobbyId: number) => {
    set({ activeLobbyLoading: true });
    try {
      const { container } = await import('../infrastructure/di/Container');
      const lobby = await container.lobbyApi.getLobby(lobbyId);
      set({ activeLobby: lobby, activeLobbyLoading: false });
      return lobby;
    } catch {
      set({ activeLobbyLoading: false });
      return null;
    }
  },

  joinLobby: async (lobbyId: number) => {
    try {
      const { container } = await import('../infrastructure/di/Container');
      const lobby = await container.lobbyApi.joinLobby(lobbyId);
      set({ activeLobby: lobby });
      // Refresh the lobbies list so is_member and counts update
      get().fetchLobbies();
      return lobby;
    } catch {
      return null;
    }
  },

  leaveLobby: async (lobbyId: number) => {
    try {
      const { container } = await import('../infrastructure/di/Container');
      await container.lobbyApi.leaveLobby(lobbyId);
      set({ activeLobby: null, messages: [] });
      get().fetchLobbies();
    } catch {
      // swallow — screen can handle the error display
    }
  },

  createLobby: async (data: CreateLobbyInput) => {
    try {
      const { container } = await import('../infrastructure/di/Container');
      const lobby = await container.lobbyApi.createLobby(data);
      set({ activeLobby: lobby });
      get().fetchLobbies();
      return lobby;
    } catch {
      return null;
    }
  },

  fetchMessages: async (lobbyId: number) => {
    set({ messagesLoading: true });
    try {
      const { container } = await import('../infrastructure/di/Container');
      const data = await container.lobbyApi.getMessages(lobbyId);
      set({ messages: data.messages, messagesLoading: false });
    } catch {
      set({ messagesLoading: false });
    }
  },

  sendMessage: async (lobbyId: number, content: string) => {
    try {
      const { container } = await import('../infrastructure/di/Container');
      const msg = await container.lobbyApi.sendMessage(lobbyId, content);
      set(s => ({ messages: [...s.messages, msg] }));
    } catch {
      // let the screen handle toast
    }
  },

  startPolling: (lobbyId: number) => {
    get().stopPolling();
    const interval = setInterval(async () => {
      const { container } = await import('../infrastructure/di/Container');
      const data = await container.lobbyApi.getMessages(lobbyId);
      set({ messages: data.messages });
    }, POLL_INTERVAL_MS);
    set({ _pollingInterval: interval });
  },

  stopPolling: () => {
    const { _pollingInterval } = get();
    if (_pollingInterval) {
      clearInterval(_pollingInterval);
      set({ _pollingInterval: null });
    }
  },

  clearActiveLobby: () => {
    get().stopPolling();
    set({ activeLobby: null, messages: [] });
  },
}));
