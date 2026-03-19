import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from '../types';

import DiscoverFeedScreen from '../screens/Discover/DiscoverFeedScreen';
import MatchOnboardingScreen from '../screens/Discover/MatchOnboardingScreen';
import MatchAnswersScreen from '../screens/Discover/MatchAnswersScreen';

// Implemented in Branch 4 — placeholder until then
function ComingSoonScreen() {
  const { View, Text } = require('react-native');
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 18, color: '#5e429c' }}>Próximamente...</Text>
    </View>
  );
}

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="DiscoverFeed" component={DiscoverFeedScreen} />
      <Stack.Screen name="MatchOnboarding" component={MatchOnboardingScreen} />
      <Stack.Screen name="MatchAnswers" component={MatchAnswersScreen} />
      <Stack.Screen name="MatchReveal" component={ComingSoonScreen} />
      <Stack.Screen name="MatchConfirmed" component={ComingSoonScreen} />
    </Stack.Navigator>
  );
}
