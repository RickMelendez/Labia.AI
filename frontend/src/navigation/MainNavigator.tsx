import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';
import { COLORS } from '../core/constants';

// Screens
import ChatScreen from '../screens/Chat/ChatScreen';
import ConversationHistoryScreen from '../screens/History/ConversationHistoryScreen';
import TrainerScreen from '../screens/Trainer/TrainerScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof MaterialCommunityIcons.glyphMap;

          if (route.name === 'Chat') {
            // Heart-message icon for dating conversations
            iconName = focused ? 'heart-circle' : 'heart-circle-outline';
          } else if (route.name === 'History') {
            // History icon for conversation history
            iconName = focused ? 'message-text-clock' : 'message-text-clock-outline';
          } else if (route.name === 'Trainer') {
            // Diamond icon for trainer/missions
            iconName = focused ? 'diamond-stone' : 'diamond-outline';
          } else {
            // Account icon for profile
            iconName = focused ? 'account-heart' : 'account-heart-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: 8,
          backgroundColor: theme.dark ? 'rgba(30,26,46,0.9)' : 'rgba(255,255,255,0.9)',
          borderTopWidth: 0,
          borderRadius: 16,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          shadowColor: COLORS.shadow.colored,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 6,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600'
        },
        headerShown: false
      })}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="History"
        component={ConversationHistoryScreen}
        options={{ tabBarLabel: 'Historial' }}
      />
      <Tab.Screen
        name="Trainer"
        component={TrainerScreen}
        options={{ tabBarLabel: 'Entrenador' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil' }}
      />
    </Tab.Navigator>
  );
}

