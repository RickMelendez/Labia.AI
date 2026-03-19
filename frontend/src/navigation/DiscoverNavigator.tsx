import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from '../types';

import DiscoverFeedScreen from '../screens/Discover/DiscoverFeedScreen';

// These screens are implemented in subsequent branches.
// Placeholder until then.
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
      <Stack.Screen name="MatchOnboarding" component={ComingSoonScreen} />
      <Stack.Screen name="MatchAnswers" component={ComingSoonScreen} />
      <Stack.Screen name="MatchReveal" component={ComingSoonScreen} />
      <Stack.Screen name="MatchConfirmed" component={ComingSoonScreen} />
    </Stack.Navigator>
  );
}
