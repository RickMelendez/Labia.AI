import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';
import { useAppStore } from './src/store/appStore';
import { lightTheme, darkTheme } from './src/theme';

export default function App() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);

  return (
    <PaperProvider theme={isDarkMode ? darkTheme : lightTheme}>
      <RootNavigator />
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <Toast />
    </PaperProvider>
  );
}
