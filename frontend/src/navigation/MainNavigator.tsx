import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import { COLORS } from '../core/constants';
import { useStrings } from '../core/i18n/useStrings';

// Screens
import ChatScreen from '../screens/Chat/ChatScreen';
import ConversationHistoryScreen from '../screens/History/ConversationHistoryScreen';
import TrainerScreen from '../screens/Trainer/TrainerScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import DiscoverNavigator from './DiscoverNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const s = useStrings();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          if (route.name === 'Chat') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'message-text' : 'message-text-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Trainer') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else {
            iconName = focused ? 'account-circle' : 'account-circle-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.muted,
        tabBarStyle: {
          backgroundColor: '#0F0C0A',
          borderTopWidth: 1,
          borderTopColor: 'rgba(245,158,11,0.10)',
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: s.tabs.home }} />
      <Tab.Screen name="History" component={ConversationHistoryScreen} options={{ tabBarLabel: s.tabs.chats }} />
      <Tab.Screen name="Discover" component={DiscoverNavigator} options={{ tabBarLabel: s.tabs.explore }} />
      <Tab.Screen name="Trainer" component={TrainerScreen} options={{ tabBarLabel: s.tabs.train }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: s.tabs.me }} />
    </Tab.Navigator>
  );
}
