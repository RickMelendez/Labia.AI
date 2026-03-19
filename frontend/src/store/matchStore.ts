import { create } from 'zustand';
import { MatchSummary, MatchDetail, MatchReveal, MatchDecision, DiscoverProfile, LikeResponse } from '../types';

const POLL_INTERVAL_MS = 5000;

interface MatchState {
  // List of matches
  matches: MatchSummary[];
  matchesLoading: boolean;

  // Currently open match
  activeMatch: MatchDetail | null;
  activeMatchLoading: boolean;

  // Reveal data
  reveal: MatchReveal | null;
  revealLoading: boolean;

  // Discovery feed
  discoverProfiles: DiscoverProfile[];
  discoverOffset: number;
  discoverHasMore: boolean;
  discoverLoading: boolean;

  // Polling ref (stored as number for setInterval handle)
  _pollingInterval: ReturnType<typeof setInterval> | null;

  // Actions
  fetchMatches: () => Promise<void>;
  fetchMatchDetail: (matchId: number) => Promise<MatchDetail | null>;
  fetchReveal: (matchId: number) => Promise<void>;
  submitAnswers: (matchId: number, answers: Record<string, string>) => Promise<MatchDetail | null>;
  submitDecision: (matchId: number, decision: MatchDecision) => Promise<MatchDetail | null>;
  fetchDiscover: (reset?: boolean) => Promise<void>;
  likeUser: (userId: number) => Promise<LikeResponse>;
  startPolling: (matchId: number, onBothAnswered: () => void) => void;
  stopPolling: () => void;
  clearActiveMatch: () => void;
}

export const useMatchStore = create<MatchState>((set, get) => ({
  matches: [],
  matchesLoading: false,
  activeMatch: null,
  activeMatchLoading: false,
  reveal: null,
  revealLoading: false,
  discoverProfiles: [],
  discoverOffset: 0,
  discoverHasMore: true,
  discoverLoading: false,
  _pollingInterval: null,

  fetchMatches: async () => {
    set({ matchesLoading: true });
    try {
      const { container } = await import('../infrastructure/di/Container');
      const data = await container.matchApi.getMatches();
      set({ matches: data.matches, matchesLoading: false });
    } catch {
      set({ matchesLoading: false });
    }
  },

  fetchMatchDetail: async (matchId: number) => {
    set({ activeMatchLoading: true });
    try {
      const { container } = await import('../infrastructure/di/Container');
      const match = await container.matchApi.getMatchDetail(matchId);
      set({ activeMatch: match, activeMatchLoading: false });
      return match;
    } catch {
      set({ activeMatchLoading: false });
      return null;
    }
  },

  fetchReveal: async (matchId: number) => {
    set({ revealLoading: true });
    try {
      const { container } = await import('../infrastructure/di/Container');
      const reveal = await container.matchApi.getReveal(matchId);
      set({ reveal, revealLoading: false });
    } catch {
      set({ revealLoading: false });
    }
  },

  submitAnswers: async (matchId: number, answers: Record<string, string>) => {
    try {
      const { container } = await import('../infrastructure/di/Container');
      const match = await container.matchApi.submitAnswers(matchId, answers);
      set({ activeMatch: match });
      return match;
    } catch {
      return null;
    }
  },

  submitDecision: async (matchId: number, decision: MatchDecision) => {
    try {
      const { container } = await import('../infrastructure/di/Container');
      const match = await container.matchApi.submitDecision(matchId, decision);
      set({ activeMatch: match });
      return match;
    } catch {
      return null;
    }
  },

  fetchDiscover: async (reset = false) => {
    const state = get();
    if (state.discoverLoading || (!reset && !state.discoverHasMore)) return;

    const newOffset = reset ? 0 : state.discoverOffset;
    set({ discoverLoading: true, ...(reset ? { discoverProfiles: [], discoverOffset: 0, discoverHasMore: true } : {}) });

    try {
      const { container } = await import('../infrastructure/di/Container');
      const data = await container.matchApi.getDiscoverFeed(20, newOffset);
      set(s => ({
        discoverProfiles: reset ? data.profiles : [...s.discoverProfiles, ...data.profiles],
        discoverOffset: newOffset + data.profiles.length,
        discoverHasMore: data.has_more,
        discoverLoading: false,
      }));
    } catch {
      set({ discoverLoading: false });
    }
  },

  likeUser: async (userId: number) => {
    const { container } = await import('../infrastructure/di/Container');
    return container.matchApi.likeUser(userId);
  },

  startPolling: (matchId: number, onBothAnswered: () => void) => {
    get().stopPolling();
    const interval = setInterval(async () => {
      const match = await get().fetchMatchDetail(matchId);
      if (match?.status === 'both_answered') {
        get().stopPolling();
        onBothAnswered();
      }
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

  clearActiveMatch: () => {
    set({ activeMatch: null, reveal: null });
  },
}));
