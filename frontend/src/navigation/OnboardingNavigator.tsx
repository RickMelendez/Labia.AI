import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from '../types';

import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import OnboardingNameScreen from '../screens/Onboarding/OnboardingNameScreen';
import OnboardingBirthdayScreen from '../screens/Onboarding/OnboardingBirthdayScreen';
import OnboardingGenderScreen from '../screens/Onboarding/OnboardingGenderScreen';
import OnboardingInterestsScreen from '../screens/Onboarding/OnboardingInterestsScreen';
import OnboardingPhotosScreen from '../screens/Onboarding/OnboardingPhotosScreen';
import OnboardingReadyScreen from '../screens/Onboarding/OnboardingReadyScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="OnboardingName" component={OnboardingNameScreen} />
      <Stack.Screen name="OnboardingBirthday" component={OnboardingBirthdayScreen} />
      <Stack.Screen name="OnboardingGender" component={OnboardingGenderScreen} />
      <Stack.Screen name="OnboardingInterests" component={OnboardingInterestsScreen} />
      <Stack.Screen name="OnboardingPhotos" component={OnboardingPhotosScreen} />
      <Stack.Screen name="OnboardingReady" component={OnboardingReadyScreen} />
    </Stack.Navigator>
  );
}
