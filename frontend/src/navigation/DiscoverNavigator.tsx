import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DiscoverStackParamList } from '../types';

import DualDiscoverScreen    from '../screens/Discover/DualDiscoverScreen';
import LobbyDetailScreen     from '../screens/Discover/LobbyDetailScreen';
import CreateLobbyScreen     from '../screens/Discover/CreateLobbyScreen';
import MatchOnboardingScreen from '../screens/Discover/MatchOnboardingScreen';
import MatchAnswersScreen    from '../screens/Discover/MatchAnswersScreen';
import MatchRevealScreen     from '../screens/Discover/MatchRevealScreen';
import MatchConfirmedScreen  from '../screens/Discover/MatchConfirmedScreen';

const Stack = createNativeStackNavigator<DiscoverStackParamList>();

export default function DiscoverNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* New dual-stream root */}
      <Stack.Screen name="DualDiscover"    component={DualDiscoverScreen}    />
      <Stack.Screen name="LobbyDetail"     component={LobbyDetailScreen}     />
      <Stack.Screen name="CreateLobby"     component={CreateLobbyScreen}     />
      {/* Existing match flow — unchanged */}
      <Stack.Screen name="MatchOnboarding" component={MatchOnboardingScreen} />
      <Stack.Screen name="MatchAnswers"    component={MatchAnswersScreen}    />
      <Stack.Screen name="MatchReveal"     component={MatchRevealScreen}     />
      <Stack.Screen name="MatchConfirmed"  component={MatchConfirmedScreen}  />
    </Stack.Navigator>
  );
}
