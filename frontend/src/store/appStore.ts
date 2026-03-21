import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, UserProfile, CulturalStyle, Tone, Language } from '../types';
import { STORAGE_KEYS, DEFAULTS } from '../core/constants';

export const useAppStore = create<AppState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  hasCompletedOnboarding: false,
  culturalStyle: DEFAULTS.culturalStyle,
  defaultTone: DEFAULTS.tone,
  isDarkMode: true,
  language: 'en' as Language,

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
    // Inject token into API client
    const { container } = await import('../infrastructure/di/Container');
    container.api.setAuthToken(token);
  },

  setCulturalStyle: (culturalStyle) => {
    set({ culturalStyle });
    AsyncStorage.setItem(STORAGE_KEYS.CULTURAL_STYLE, culturalStyle);
  },

  setDefaultTone: (defaultTone) => {
    set({ defaultTone });
    AsyncStorage.setItem(STORAGE_KEYS.DEFAULT_TONE, defaultTone);
  },

  setDarkMode: (isDarkMode) => {
    set({ isDarkMode });
    AsyncStorage.setItem(STORAGE_KEYS.THEME, isDarkMode ? 'dark' : 'light');
  },

  setLanguage: (language) => {
    set({ language });
    AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  },

  setOnboardingCompleted: async () => {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
    set({ hasCompletedOnboarding: true });
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
    // Clear token from API client
    import('../infrastructure/di/Container').then(({ container }) => {
      container.api.setAuthToken(null);
    });
  }
}));

// Initialize store from AsyncStorage
export const initializeAppStore = async () => {
  try {
    const [userJson, culturalStyle, defaultTone, theme, authToken, onboarding, language] = await AsyncStorage.multiGet([
      STORAGE_KEYS.USER_PROFILE,
      STORAGE_KEYS.CULTURAL_STYLE,
      STORAGE_KEYS.DEFAULT_TONE,
      STORAGE_KEYS.THEME,
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      STORAGE_KEYS.LANGUAGE,
    ]);

    const user = userJson[1] ? JSON.parse(userJson[1]) : null;
    const token = authToken[1];

    // Inject auth token into API client if it exists
    if (token) {
      const { container } = await import('../infrastructure/di/Container');
      container.api.setAuthToken(token);
    }

    useAppStore.setState({
      user,
      isAuthenticated: !!user,
      isLoading: false,
      hasCompletedOnboarding: onboarding[1] === 'true',
      culturalStyle: (culturalStyle[1] as CulturalStyle) || DEFAULTS.culturalStyle,
      defaultTone: (defaultTone[1] as Tone) || DEFAULTS.tone,
      isDarkMode: true,
      language: (language[1] as Language) || 'en',
    });
  } catch (error) {
    console.error('Failed to initialize app store:', error);
    useAppStore.setState({ isLoading: false });
  }
};
