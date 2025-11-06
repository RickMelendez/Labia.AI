import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import { useFonts } from 'expo-font';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
} from '@expo-google-fonts/poppins';
import RootNavigator from './src/navigation/RootNavigator';
import { lightTheme, darkTheme } from './src/theme';
import { useAppStore } from './src/store/appStore';
import AppBackground from './src/components/common/AppBackground';
import { apiClient } from './src/infrastructure/api/ApiClient';
import { API_BASE_URL } from './src/core/constants/api.constants';

export default function App() {
  // Load Poppins fonts
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
  });

  // Subscribe to dark mode state from store
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  // Update theme based on dark mode preference
  const theme = isDarkMode ? darkTheme : lightTheme;

  // On app start, log API base and ping /health
  // IMPORTANT: This must be before any conditional returns (Rules of Hooks)
  useEffect(() => {
    const ping = async () => {
      const base = API_BASE_URL;
      console.log('[API] Base URL:', base);
      try {
        const health = await apiClient.get<{ status: string; timestamp: string }>('/health');
        console.log('[API] Health:', health);
        if (__DEV__) {
          Toast.show({ type: 'success', text1: 'API OK', text2: base });
        }
      } catch (err: any) {
        console.warn('[API] Health check failed:', err);
        if (__DEV__) {
          const msg = err?.detail || err?.message || 'Network Error';
          Toast.show({ type: 'error', text1: 'API Error', text2: String(msg) });
        }
      }
    };
    ping();
  }, []);

  // Show loading indicator while fonts are loading
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fce8fb' }}>
        <ActivityIndicator size="large" color="#5e429c" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <AppBackground />
        <RootNavigator />
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <Toast />
      </PaperProvider>
    </SafeAreaProvider>
  );
}
