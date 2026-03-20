import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppBackground from '../../components/common/AppBackground';
import NeonButton from '../../components/common/NeonButton';
import AnswerRevealCard from '../../components/discover/AnswerRevealCard';
import { COLORS } from '../../core/constants';
import { useMatchStore } from '../../store/matchStore';
import type { DiscoverStackParamList } from '../../types';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'MatchReveal'>;

export default function MatchRevealScreen({ route, navigation }: Props) {
  const { match_id } = route.params;
  const theme = useTheme();
  const { fetchReveal, fetchMatchDetail, activeMatch, reveal, revealLoading, submitDecision } = useMatchStore();
  const [deciding, setDeciding] = useState(false);

  useEffect(() => {
    fetchMatchDetail(match_id);
    fetchReveal(match_id);
  }, [match_id]);

  const partnerName = activeMatch?.other_user?.display_name || 'tu match';
  const myDecision = reveal?.my_decision;

  const handleDecision = (decision: 'accept' | 'cancel') => {
    const label = decision === 'accept' ? 'Confirmar Match' : 'Cancelar Match';
    const msg = decision === 'accept'
      ? `¿Confirmar el match con ${partnerName}?`
      : `¿Estás seguro que quieres cancelar el match con ${partnerName}?`;

    Alert.alert(label, msg, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí',
        style: decision === 'cancel' ? 'destructive' : 'default',
        onPress: async () => {
          setDeciding(true);
          const result = await submitDecision(match_id, decision);
          setDeciding(false);
          if (result?.status === 'confirmed') {
            navigation.replace('MatchConfirmed', { match_id });
          } else {
            navigation.navigate('DualDiscover');
          }
        },
      },
    ]);
  };

  if (revealLoading || !reveal) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppBackground />
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Cargando respuestas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppBackground />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          ¡Reveal! 🎉
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
        Así respondieron tú y {partnerName}
      </Text>

      {/* Answer cards */}
      <ScrollView contentContainerStyle={{ paddingVertical: 12, paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {reveal.questions.map((q, i) => (
          <AnswerRevealCard
            key={q.id}
            question={q}
            myAnswer={reveal.my_answers[q.id] || ''}
            partnerAnswer={reveal.partner_answers[q.id] || ''}
            partnerName={partnerName}
            step={i + 1}
            total={reveal.questions.length}
          />
        ))}
      </ScrollView>

      {/* Decision area */}
      {!myDecision && (
        <View style={[styles.actions, { backgroundColor: theme.dark ? 'rgba(30,26,46,0.97)' : 'rgba(255,255,255,0.97)' }]}>
          <Text style={[styles.decisionPrompt, { color: theme.colors.onBackground }]}>
            ¿Quieres confirmar el match?
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: COLORS.error }]}
              onPress={() => handleDecision('cancel')}
              disabled={deciding}
            >
              <MaterialCommunityIcons name="close" size={20} color={COLORS.error} />
              <Text style={[styles.cancelText, { color: COLORS.error }]}>Cancelar</Text>
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <NeonButton
                label={deciding ? 'Confirmando...' : 'Confirmar Match 💜'}
                onPress={() => handleDecision('accept')}
                disabled={deciding}
              />
            </View>
          </View>
        </View>
      )}

      {myDecision && (
        <View style={[styles.actions, { backgroundColor: theme.dark ? 'rgba(30,26,46,0.97)' : 'rgba(255,255,255,0.97)' }]}>
          <Text style={[styles.waitingText, { color: theme.colors.onSurfaceVariant }]}>
            {myDecision === 'accept'
              ? `Confirmaste el match. Esperando la decisión de ${partnerName}...`
              : 'Cancelaste el match.'}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12,
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular', fontSize: 15, marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
  },
  subtitle: {
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    marginBottom: 8,
    paddingHorizontal: 24,
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
    gap: 10,
  },
  decisionPrompt: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  cancelText: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
  },
  waitingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    textAlign: 'center',
  },
});
