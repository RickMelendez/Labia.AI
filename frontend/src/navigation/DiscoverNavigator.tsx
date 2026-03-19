import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from '../types';

import DiscoverFeedScreen from '../screens/Discover/DiscoverFeedScreen';
import MatchOnboardingScreen from '../screens/Discover/MatchOnboardingScreen';
import MatchAnswersScreen from '../screens/Discover/MatchAnswersScreen';
import MatchRevealScreen from '../screens/Discover/MatchRevealScreen';
import MatchConfirmedScreen from '../screens/Discover/MatchConfirmedScreen';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverFeed" component={DiscoverFeedScreen} />
      <Stack.Screen name="MatchOnboarding" component={MatchOnboardingScreen} />
      <Stack.Screen name="MatchAnswers" component={MatchAnswersScreen} />
      <Stack.Screen name="MatchReveal" component={MatchRevealScreen} />
      <Stack.Screen name="MatchConfirmed" component={MatchConfirmedScreen} />
    </Stack.Navigator>
  );
}
