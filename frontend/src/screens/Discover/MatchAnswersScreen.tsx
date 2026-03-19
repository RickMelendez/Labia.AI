import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AppBackground from '../../components/common/AppBackground';
import NeonButton from '../../components/common/NeonButton';
import QuestionCard from '../../components/discover/QuestionCard';
import { COLORS } from '../../core/constants';
import { useMatchStore } from '../../store/matchStore';
import type { DiscoverStackParamList, MatchQuestion } from '../../types';

type Props = NativeStackScreenProps<DiscoverStackParamList, 'MatchAnswers'>;

export default function MatchAnswersScreen({ route, navigation }: Props) {
  const { match_id } = route.params;
  const theme = useTheme();
  const { fetchMatchDetail, activeMatch, submitAnswers, startPolling, stopPolling } = useMatchStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    fetchMatchDetail(match_id);
    return () => stopPolling();
  }, [match_id]);

  const questions: MatchQuestion[] = activeMatch?.questions || [];
  const currentQuestion = questions[currentStep];
  const currentAnswer = currentQuestion ? (answers[currentQuestion.id] || '') : '';
  const isLastStep = currentStep === questions.length - 1;
  const canProceed = currentAnswer.trim().length > 0;

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(s => s + 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed) return;
    setSubmitting(true);
    try {
      const result = await submitAnswers(match_id, answers);
      setSubmitting(false);

      if (result?.status === 'both_answered') {
        navigation.replace('MatchReveal', { match_id });
      } else {
        // Start polling to wait for partner
        setWaiting(true);
        startPolling(match_id, () => {
          navigation.replace('MatchReveal', { match_id });
        });
      }
    } catch {
      setSubmitting(false);
    }
  };

  if (!activeMatch || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppBackground />
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={[styles.loadingText, { color: theme.colors.onSurfaceVariant }]}>
            Cargando preguntas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (waiting) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <AppBackground />
        <View style={styles.loading}>
          <ActivityIndicator color={COLORS.primary} size="large" />
          <Text style={[styles.title, { color: theme.colors.onBackground, marginTop: 20 }]}>
            Esperando a {activeMatch.other_user.display_name}...
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}>
            Te avisaremos cuando respondan. Puedes cerrar esta pantalla.
          </Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={{ color: COLORS.primary, fontFamily: 'Poppins_500Medium' }}>
              Volver al feed
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <AppBackground />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>

        {/* Back button */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
          <QuestionCard
            question={currentQuestion}
            step={currentStep + 1}
            total={questions.length}
            value={currentAnswer}
            onChange={text => setAnswers(prev => ({ ...prev, [currentQuestion.id]: text }))}
          />
        </ScrollView>

        {/* Bottom actions */}
        <View style={[styles.actions, { backgroundColor: theme.dark ? 'rgba(30,26,46,0.95)' : 'rgba(255,255,255,0.95)' }]}>
          {isLastStep ? (
            <NeonButton
              label={submitting ? 'Enviando...' : 'Enviar Respuestas'}
              onPress={handleSubmit}
              disabled={!canProceed || submitting}
            />
          ) : (
            <NeonButton
              label="Siguiente Pregunta"
              onPress={handleNext}
              disabled={!canProceed}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  loadingText: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    marginTop: 12,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Poppins_700Bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    alignSelf: 'flex-start',
  },
  actions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 32,
  },
});
