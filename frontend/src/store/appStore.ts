import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, UserProfile, CulturalStyle, Tone } from '../types';
import { STORAGE_KEYS, DEFAULTS } from '../constants';

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  culturalStyle: DEFAULTS.culturalStyle,
  defaultTone: DEFAULTS.tone,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
    if (user) {
      AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
      set({
        culturalStyle: user.cultural_style,
        defaultTone: user.default_tone
      });
    } else {
      AsyncStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    }
  },

  setToken: async (token: string) => {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    set({ isAuthenticated: true });
  },

  setCulturalStyle: (culturalStyle) => {
    set({ culturalStyle });
    AsyncStorage.setItem(STORAGE_KEYS.CULTURAL_STYLE, culturalStyle);
  },

  setDefaultTone: (defaultTone) => {
    set({ defaultTone });
    AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_TONE, defaultTone);
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      culturalStyle: DEFAULTS.culturalStyle,
      defaultTone: DEFAULTS.tone
    });
    AsyncStorage.multiRemove([
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.CULTURAL_STYLE,
      STORAGE_KEYS.DEFAULT_TONE
    ]);
  }
}));

// Initialize store from AsyncStorage
export const initializeAppStore = async () => {
  try {
    const [userJson, culturalStyle, defaultTone] = await AsyncStorage.multiGet([
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.CULTURAL_STYLE,
      STORAGE_KEYS.DEFAULT_TONE
    ]);

    const user = userJson[1] ? JSON.parse(userJson[1]) : null;

    useAppStore.setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      culturalStyle: (culturalStyle[1] as CulturalStyle) || DEFAULTS.culturalStyle,
      defaultTone: (defaultTone[1] as Tone) || DEFAULTS.tone
    });
  } catch (error) {
    console.error('Failed to initialize app store:', error);
    useAppStore.setState({ isLoading: false });
  }
};
