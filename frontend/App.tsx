import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import Toast from 'react-native-toast-message';
import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  return (
    <PaperProvider>
      <RootNavigator />
      <StatusBar style="auto" />
      <Toast />
    </PaperProvider>
  );
}
