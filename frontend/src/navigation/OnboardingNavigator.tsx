import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../types';

// Screens (will be implemented)
import SplashScreen from '../screens/Onboarding/SplashScreen';
import TutorialScreen from '../screens/Onboarding/TutorialScreen';
import CountrySelectionScreen from '../screens/Onboarding/CountrySelectionScreen';
import ProfileSetupScreen from '../screens/Onboarding/ProfileSetupScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Tutorial" component={TutorialScreen} />
      <Stack.Screen name="CountrySelection" component={CountrySelectionScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
    </Stack.Navigator>
  );
}
