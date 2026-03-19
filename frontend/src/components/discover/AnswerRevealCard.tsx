import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants';
import type { MatchQuestion } from '../../types';

interface AnswerRevealCardProps {
  question: MatchQuestion;
  myAnswer: string;
  partnerAnswer: string;
  partnerName: string;
  step: number;
  total: number;
}

export default function AnswerRevealCard({
  question, myAnswer, partnerAnswer, partnerName, step, total
}: AnswerRevealCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.dark ? '#2a2040' : '#fff' }]}>
      {/* Step */}
      <Text style={[styles.stepLabel, { color: theme.colors.onSurfaceVariant }]}>
        {step} / {total}
      </Text>

      {/* Question */}
      <Text style={[styles.question, { color: theme.colors.onBackground }]}>
        {question.text}
      </Text>

      {/* My answer */}
      <View style={[styles.answerBox, { backgroundColor: theme.dark ? '#1e1a2e' : '#f3e8ff' }]}>
        <View style={styles.answerHeader}>
          <MaterialCommunityIcons name="account" size={16} color={COLORS.primary} />
          <Text style={[styles.answerLabel, { color: COLORS.primary }]}>Tú</Text>
        </View>
        <Text style={[styles.answerText, { color: theme.colors.onBackground }]}>
          {myAnswer || '—'}
        </Text>
      </View>

      {/* Partner answer */}
      <View style={[styles.answerBox, { backgroundColor: theme.dark ? '#1e1a2e' : '#fce8fb' }]}>
        <View style={styles.answerHeader}>
          <MaterialCommunityIcons name="heart" size={16} color={COLORS.secondary} />
          <Text style={[styles.answerLabel, { color: COLORS.secondary }]}>{partnerName}</Text>
        </View>
        <Text style={[styles.answerText, { color: theme.colors.onBackground }]}>
          {partnerAnswer || '—'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#5e429c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  stepLabel: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 8,
  },
  question: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 22,
    marginBottom: 14,
  },
  answerBox: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  answerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  answerLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  answerText: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    lineHeight: 20,
  },
});
