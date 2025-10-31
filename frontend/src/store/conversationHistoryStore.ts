import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Conversation, Message } from '../types';

const STORAGE_KEY = '@labia_conversation_history';
const MAX_CONVERSATIONS = 50;

interface ConversationHistoryState {
  conversations: Conversation[];
  isLoading: boolean;

  // Actions
  loadHistory: () => Promise<void>;
  saveConversation: (conversation: Conversation, messages: Message[]) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  getConversation: (conversationId: string) => Conversation | undefined;
}

export const useConversationHistoryStore = create<ConversationHistoryState>((set, get) => ({
  conversations: [],
  isLoading: false,

  loadHistory: async () => {
    set({ isLoading: true });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        set({ conversations: parsed, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      set({ isLoading: false });
    }
  },

  saveConversation: async (conversation: Conversation, messages: Message[]) => {
    try {
      const currentConversations = get().conversations;

      // Check if conversation already exists
      const existingIndex = currentConversations.findIndex(c => c.id === conversation.id);

      let updatedConversations;
      if (existingIndex >= 0) {
        // Update existing conversation
        updatedConversations = [...currentConversations];
        updatedConversations[existingIndex] = {
          ...conversation,
          updated_at: new Date().toISOString(),
          message_count: messages.length,
        };
      } else {
        // Add new conversation
        updatedConversations = [
          {
            ...conversation,
            message_count: messages.length,
          },
          ...currentConversations,
        ].slice(0, MAX_CONVERSATIONS); // Keep only last N conversations
      }

      // Sort by updated_at
      updatedConversations.sort((a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      set({ conversations: updatedConversations });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations));

      // Also save messages separately
      await AsyncStorage.setItem(`${STORAGE_KEY}_${conversation.id}`, JSON.stringify(messages));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  },

  deleteConversation: async (conversationId: string) => {
    try {
      const currentConversations = get().conversations;
      const updatedConversations = currentConversations.filter(c => c.id !== conversationId);

      set({ conversations: updatedConversations });
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations));
      await AsyncStorage.removeItem(`${STORAGE_KEY}_${conversationId}`);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  },

  clearHistory: async () => {
    try {
      const currentConversations = get().conversations;

      // Remove all conversation messages
      await Promise.all(
        currentConversations.map(c => AsyncStorage.removeItem(`${STORAGE_KEY}_${c.id}`))
      );

      set({ conversations: [] });
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  },

  getConversation: (conversationId: string) => {
    return get().conversations.find(c => c.id === conversationId);
  },
}));

// Helper to load messages for a specific conversation
export const loadConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const stored = await AsyncStorage.getItem(`${STORAGE_KEY}_${conversationId}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load conversation messages:', error);
    return [];
  }
};
