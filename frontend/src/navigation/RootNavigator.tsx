import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useAppStore, initializeAppStore } from '../store/appStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

// Navigators
import MainNavigator from './MainNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import AuthNavigator from './AuthNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { isLoading, isAuthenticated } = useAppStore();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = React.useState<boolean | null>(null);

  const checkOnboardingStatus = React.useCallback(async () => {
    const onboardingCompleted = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    setHasCompletedOnboarding(onboardingCompleted === 'true');
  }, []);

  useEffect(() => {
    const initialize = async () => {
      await initializeAppStore();
      await checkOnboardingStatus();
    };

    initialize();

    // Listen for focus events to re-check onboarding status
    // This allows the app to update when returning from background
    const interval = setInterval(checkOnboardingStatus, 1000);
    return () => clearInterval(interval);
  }, [checkOnboardingStatus]);

  if (isLoading || hasCompletedOnboarding === null) {
    // Could show a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Auth Flow - Optional for now, users can skip */}
        {/* {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : */}

        {/* Onboarding or Main App */}
        {!hasCompletedOnboarding ? (
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
