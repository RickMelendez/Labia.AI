import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AppState, AppStateStatus } from 'react-native';
import { RootStackParamList } from '../types';
import { useAppStore, initializeAppStore } from '../store/appStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../core/constants';

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

    // Listen for app state changes (when app comes back to foreground)
    const appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // Re-check onboarding status when app becomes active
        checkOnboardingStatus();
      }
    });

    // Cleanup listener on unmount
    return () => {
      appStateSubscription.remove();
    };
  }, [checkOnboardingStatus]);

  if (isLoading || hasCompletedOnboarding === null) {
    // Could show a splash screen here
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Protected Routes Flow: Auth → Onboarding → Main */}
        {!isAuthenticated ? (
          // Not authenticated - show auth screens
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : !hasCompletedOnboarding ? (
          // Authenticated but hasn't completed onboarding
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          // Authenticated and onboarded - show main app
          <Stack.Screen name="Main" component={MainNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
