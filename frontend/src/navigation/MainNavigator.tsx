import React from 'react';
import { View, Platform } from 'react-native';
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

          // Explore tab gets a glow indicator
          if (route.name === 'Discover' && focused) {
            return (
              <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                <View style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: COLORS.primary,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: COLORS.shadow.colored,
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 1,
                  shadowRadius: 12,
                  elevation: 8,
                }}>
                  <MaterialCommunityIcons name="compass" size={22} color="#FFF" />
                </View>
              </View>
            );
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.text.muted,
        tabBarStyle: {
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: Platform.OS === 'ios' ? 20 : 12,
          backgroundColor: 'rgba(13, 11, 10, 0.92)',
          borderTopWidth: 0,
          borderRadius: 28,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.08)',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.6,
          shadowRadius: 20,
          elevation: 20,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarLabel: s.tabs.home }}
      />
      <Tab.Screen
        name="History"
        component={ConversationHistoryScreen}
        options={{ tabBarLabel: s.tabs.chats }}
      />
      <Tab.Screen
        name="Discover"
        component={DiscoverNavigator}
        options={{ tabBarLabel: s.tabs.explore }}
      />
      <Tab.Screen
        name="Trainer"
        component={TrainerScreen}
        options={{ tabBarLabel: s.tabs.train }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: s.tabs.me }}
      />
    </Tab.Navigator>
  );
}
