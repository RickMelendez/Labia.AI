import { create } from 'zustand';
import { ChatState, Conversation, Message } from '../types';

export const useChatStore = create<ChatState>((set) => ({
  currentConversation: null,
  messages: [],
  isGenerating: false,
  error: null,

  setCurrentConversation: (conversation) => {
    set({ currentConversation: conversation, messages: [] });
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }));
  },

  setIsGenerating: (isGenerating) => {
    set({ isGenerating });
  },

  setError: (error) => {
    set({ error });
  },

  clearMessages: () => {
    set({ messages: [] });
  }
}));
