import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Clipboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TONES } from '../../constants';
import { Tone } from '../../types';

interface SuggestionCardProps {
  text: string;
  tone: Tone;
  explanation?: string;
  onCopy?: () => void;
  onRegenerate?: () => void;
}

export default function SuggestionCard({
  text,
  tone,
  explanation,
  onCopy,
  onRegenerate
}: SuggestionCardProps) {
  const toneInfo = TONES.find((t) => t.value === tone);

  const handleCopy = () => {
    Clipboard.setString(text);
    onCopy?.();
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFFFFF', '#F9FAFB']} style={styles.card}>
        {/* Tone Badge */}
        <View style={styles.header}>
          <View style={styles.toneBadge}>
            <Text style={styles.toneIcon}>{toneInfo?.icon}</Text>
            <Text style={styles.toneLabel}>{toneInfo?.label}</Text>
          </View>
        </View>

        {/* Main Text */}
        <Text style={styles.mainText}>{text}</Text>

        {/* Explanation */}
        {explanation && (
          <View style={styles.explanationContainer}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.explanationText}>{explanation}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCopy}>
            <Ionicons name="copy-outline" size={20} color={COLORS.primary} />
            <Text style={styles.actionText}>Copiar</Text>
          </TouchableOpacity>

          {onRegenerate && (
            <TouchableOpacity style={styles.actionButton} onPress={onRegenerate}>
              <Ionicons name="refresh-outline" size={20} color={COLORS.secondary} />
              <Text style={styles.actionText}>Regenerar</Text>
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  toneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20
  },
  toneIcon: {
    fontSize: 16,
    marginRight: 6
  },
  toneLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.primary
  },
  mainText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text.primary,
    marginBottom: 12
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  explanationText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.text.secondary,
    marginLeft: 8
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary
  }
});
