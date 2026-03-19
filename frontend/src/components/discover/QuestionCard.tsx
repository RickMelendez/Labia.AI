import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import { COLORS } from '../../core/constants';
import type { MatchQuestion } from '../../types';

interface QuestionCardProps {
  question: MatchQuestion;
  step: number;
  total: number;
  value: string;
  onChange: (text: string) => void;
}

export default function QuestionCard({ question, step, total, value, onChange }: QuestionCardProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: theme.dark ? '#2a2040' : '#fff' }]}>
      {/* Step indicator */}
      <View style={styles.stepRow}>
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i < step ? COLORS.primary : i === step - 1 ? COLORS.secondary : '#e0e0e0' },
            ]}
          />
        ))}
      </View>

      <Text style={[styles.stepLabel, { color: theme.colors.onSurfaceVariant }]}>
        Pregunta {step} de {total}
      </Text>

      <Text style={[styles.question, { color: theme.colors.onBackground }]}>
        {question.text}
      </Text>

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.dark ? '#1e1a2e' : '#f8f5ff',
            color: theme.colors.onBackground,
            borderColor: value.length > 0 ? COLORS.primary : (theme.dark ? '#3a3060' : '#e0d8ff'),
          },
        ]}
        placeholder="Tu respuesta..."
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={value}
        onChangeText={onChange}
        multiline
        numberOfLines={4}
        maxLength={300}
        textAlignVertical="top"
      />

      <Text style={[styles.charCount, { color: theme.colors.onSurfaceVariant }]}>
        {value.length}/300
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 16,
    shadowColor: '#5e429c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  stepLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    marginBottom: 16,
  },
  question: {
    fontSize: 18,
    fontFamily: 'Poppins_600SemiBold',
    lineHeight: 26,
    marginBottom: 20,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    minHeight: 100,
  },
  charCount: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    textAlign: 'right',
    marginTop: 6,
  },
});
