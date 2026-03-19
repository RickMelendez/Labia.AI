import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import AppBackground from '../../components/common/AppBackground';
import NeonButton from '../../components/common/NeonButton';
import { COLORS } from '../../core/constants';
import { useMatchStore } from '../../store/matchStore';
import type { DiscoverStackParamList } from '../../types';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'MatchOnboarding'>;

export default function MatchOnboardingScreen({ route, navigation }: Props) {
  const { match_id } = route.params;
  const theme = useTheme();
  const { fetchMatchDetail, activeMatch, activeMatchLoading } = useMatchStore();

  useEffect(() => {
    fetchMatchDetail(match_id);
  }, [match_id]);

  const otherName = activeMatch?.other_user?.display_name || 'tu match';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBackground />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.iconRow}>
          <MaterialCommunityIcons name="heart" size={40} color={COLORS.primary} />
          <MaterialCommunityIcons name="heart-multiple" size={56} color={COLORS.secondary} />
          <MaterialCommunityIcons name="heart" size={40} color={COLORS.primary} />
        </View>

        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          ¡Double Match! 💜
        </Text>

        <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
          Tú y {otherName} se gustaron mutuamente.
          {'\n'}Antes de confirmar el match, respondan 4 preguntas rápidas para ver si son compatibles.
        </Text>

        {/* Question cards preview */}
        <View style={styles.cardsPreview}>
          {['🍕', '✈️', '🎯', '💛'].map((emoji, i) => (
            <View
              key={i}
              style={[
                styles.previewCard,
                { backgroundColor: theme.dark ? '#2a2040' : '#fff', transform: [{ rotate: `${(i - 1.5) * 4}deg` }] },
              ]}
            >
              <Text style={styles.previewEmoji}>{emoji}</Text>
            </View>
          ))}
        </View>

        {activeMatchLoading && (
          <ActivityIndicator color={COLORS.primary} style={{ marginVertical: 12 }} />
        )}

        <Text style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          Cada uno responde por separado. Luego verán las respuestas del otro.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <NeonButton
          label="Responder Preguntas"
          onPress={() => navigation.navigate('MatchAnswers', { match_id })}
          disabled={activeMatchLoading || activeMatch?.status === 'pending_questions'}
        />
        <TouchableOpacity style={styles.laterBtn} onPress={() => navigation.goBack()}>
          <Text style={[styles.laterText, { color: theme.colors.onSurfaceVariant }]}>
            Responder más tarde
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  cardsPreview: {
    width: 200,
    height: 160,
    position: 'relative',
    marginBottom: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewCard: {
    position: 'absolute',
    width: 80,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#5e429c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  previewEmoji: {
    fontSize: 32,
  },
  hint: {
    fontSize: 13,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginTop: 8,
  },
  actions: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 12,
  },
  laterBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  laterText: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
  },
});
