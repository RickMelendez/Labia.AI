import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TONES, TYPOGRAPHY } from '../../core/constants';
import { TONE_GRADIENTS } from '../../core/constants/theme.constants';
import { Tone } from '../../types';
import { container } from '../../infrastructure/di/Container';

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
  onRegenerate,
}: SuggestionCardProps) {
  const toneInfo = TONES.find((t) => t.value === tone);
  const [liked, setLiked] = useState<boolean | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    container.toast.success('Copied!', 'Text copied to clipboard');
    onCopy?.();
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleLike = () => {
    setLiked(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    container.toast.success('Thanks!', 'Glad you liked this suggestion');
  };

  const handleDislike = () => {
    setLiked(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    container.toast.info('Got it', "We'll work on better suggestions");
  };

  // Tone badge color from gradient
  const [toneColor] = TONE_GRADIENTS[tone] || TONE_GRADIENTS['chill'];

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.card}>
        {/* Amber left accent strip */}
        <View style={styles.accentStrip} />

        <View style={styles.inner}>
          {/* Tone badge */}
          <View style={styles.header}>
            <View style={[styles.toneBadge, { backgroundColor: toneColor + '22', borderColor: toneColor + '40' }]}>
              <Text style={styles.toneIcon}>{toneInfo?.icon}</Text>
              <Text style={[styles.toneLabel, { color: toneColor }]}>{toneInfo?.label}</Text>
            </View>
          </View>

          {/* Main text */}
          <Text style={styles.mainText} selectable={true}>{text}</Text>

          {/* Explanation */}
          {explanation && (
            <View style={styles.explanationContainer}>
              <Ionicons name="information-circle-outline" size={15} color={COLORS.text.muted} />
              <Text style={styles.explanationText}>{explanation}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionBtn} onPress={handleCopy} activeOpacity={0.7}>
              <MaterialCommunityIcons name="content-copy" size={17} color={COLORS.primary} />
              <Text style={[styles.actionText, { color: COLORS.primary }]}>Copy</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={[styles.feedbackBtn, liked === true && styles.feedbackActive]}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={liked === true ? 'thumb-up' : 'thumb-up-outline'}
                size={17}
                color={liked === true ? COLORS.success : COLORS.text.muted}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.feedbackBtn, liked === false && styles.feedbackActive]}
              onPress={handleDislike}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name={liked === false ? 'thumb-down' : 'thumb-down-outline'}
                size={17}
                color={liked === false ? COLORS.error : COLORS.text.muted}
              />
            </TouchableOpacity>

            {onRegenerate && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity
                  style={styles.actionBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onRegenerate();
                  }}
                  activeOpacity={0.7}
                >
                  <MaterialCommunityIcons name="refresh" size={17} color={COLORS.text.secondary} />
                  <Text style={styles.actionText}>Retry</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.surface.dark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: COLORS.shadow.card,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 4,
  },
  accentStrip: {
    width: 3,
    backgroundColor: COLORS.primary,
  },
  inner: {
    flex: 1,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  toneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    gap: 5,
  },
  toneIcon: {
    fontSize: 14,
  },
  toneLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 12,
    fontWeight: '600',
  },
  mainText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 15,
    lineHeight: 23,
    color: COLORS.text.primary,
    marginBottom: 10,
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E8E2DC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    gap: 6,
  },
  explanationText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 3,
  },
  actionText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.muted,
  },
  divider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(0,0,0,0.08)',
    marginHorizontal: 2,
  },
  feedbackBtn: {
    padding: 5,
    borderRadius: 6,
  },
  feedbackActive: {
    backgroundColor: 'rgba(249,112,96,0.10)',
  },
});
