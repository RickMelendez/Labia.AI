import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppBackground from '../../components/common/AppBackground';
import NeonButton from '../../components/common/NeonButton';
import { COLORS } from '../../core/constants';
import { useMatchStore } from '../../store/matchStore';
import type { DiscoverStackParamList } from '../../types';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'MatchConfirmed'>;

export default function MatchConfirmedScreen({ route, navigation }: Props) {
  const { match_id } = route.params;
  const theme = useTheme();
  const { activeMatch } = useMatchStore();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const heartAnim = useRef(new Animated.Value(0)).current;

  const partnerName = activeMatch?.other_user?.display_name || 'tu match';

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(heartAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(heartAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
        ]),
        { iterations: -1 }
      ),
    ]).start();
  }, []);

  const heartScale = heartAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.3] });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBackground />

      <View style={styles.content}>
        {/* Animated heart */}
        <Animated.View style={{ transform: [{ scale: heartScale }], marginBottom: 24 }}>
          <MaterialCommunityIcons name="heart" size={80} color={COLORS.secondary} />
        </Animated.View>

        {/* Title */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Text style={[styles.title, { color: theme.colors.onBackground }]}>
            ¡Double Match! 💜
          </Text>
        </Animated.View>

        {/* Subtitle */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Tú y {partnerName} confirmaron el match.{'\n'}
            ¡Ahora pueden chatear!
          </Text>
        </Animated.View>

        {/* Decorative hearts */}
        <Animated.View style={[styles.decorRow, { opacity: fadeAnim }]}>
          {['heart-outline', 'heart', 'heart-outline'].map((icon, i) => (
            <MaterialCommunityIcons
              key={i}
              name={icon as any}
              size={i === 1 ? 32 : 20}
              color={i === 1 ? COLORS.primary : COLORS.secondary}
            />
          ))}
        </Animated.View>

        {/* Match info card */}
        <Animated.View
          style={[
            styles.card,
            { backgroundColor: theme.dark ? '#2a2040' : '#fff', opacity: fadeAnim },
          ]}
        >
          <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
          <Text style={[styles.cardText, { color: theme.colors.onBackground }]}>
            Match #{match_id} confirmado
          </Text>
        </Animated.View>
      </View>

      {/* Actions */}
      <Animated.View style={[styles.actions, { opacity: fadeAnim }]}>
        <NeonButton
          label="Ir a Chat 💬"
          onPress={() => navigation.navigate('DualDiscover')}
        />
        <TouchableOpacity
          style={styles.discoverBtn}
          onPress={() => navigation.navigate('DualDiscover')}
        >
          <Text style={[styles.discoverText, { color: theme.colors.onSurfaceVariant }]}>
            Seguir explorando
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  decorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#5e429c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
  },
  cardText: {
    fontFamily: 'Poppins_500Medium',
    fontSize: 14,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  discoverBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  discoverText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
});
