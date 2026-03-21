import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
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
  onRegenerate
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
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
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
    container.toast.info('Got it', 'We\'ll work on generating better suggestions');
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.card}>
        <View style={styles.header}>
          <LinearGradient 
            colors={(TONE_GRADIENTS[tone] || TONE_GRADIENTS['chill']) as any} 
            style={styles.toneBadge}
          >
            <Text style={styles.toneIcon}>{toneInfo?.icon}</Text>
            <Text style={styles.toneLabel}>{toneInfo?.label}</Text>
          </LinearGradient>
        </View>

        <Text style={styles.mainText} selectable={true}>{text}</Text>

        {explanation && (
          <View style={styles.explanationContainer}>
            <Ionicons name="information-circle-outline" size={16} color={COLORS.text.muted} />
            <Text style={styles.explanationText}>{explanation}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleCopy}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="content-copy" size={18} color={COLORS.brand} />
            <Text style={[styles.actionText, { marginLeft: 6, color: COLORS.brand }]}>Copy</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity
            style={[styles.feedbackButton, liked === true && styles.feedbackButtonActive]}
            onPress={handleLike}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={liked === true ? "thumb-up" : "thumb-up-outline"}
              size={18}
              color={liked === true ? COLORS.success : COLORS.text.muted}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.feedbackButton, liked === false && styles.feedbackButtonActive]}
            onPress={handleDislike}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={liked === false ? "thumb-down" : "thumb-down-outline"}
              size={18}
              color={liked === false ? COLORS.error : COLORS.text.muted}
            />
          </TouchableOpacity>

          {onRegenerate && (
            <>
              <View style={styles.divider} />
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onRegenerate();
                }}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons name="refresh" size={18} color={COLORS.secondary} />
                <Text style={[styles.actionText, { marginLeft: 6, color: COLORS.secondary }]}>Retry</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  card: {
    backgroundColor: COLORS.surface.light,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
    shadowColor: COLORS.shadow.card,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 6,
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
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20
  },
  toneIcon: {
    fontSize: 16,
    marginRight: 6,
    color: COLORS.text.onBrand,
  },
  toneLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,   // Poppins SemiBold
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.onBrand,
  },
  mainText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,    // Poppins Regular
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text.primary,
    marginBottom: 12
  },
  explanationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.surface.tinted,
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  explanationText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,    // Poppins Regular
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.text.body,
    marginLeft: 8
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginRight: 12,
  },
  actionText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,   // Poppins SemiBold
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.muted
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.border.light,
    marginRight: 12,
  },
  feedbackButton: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'transparent'
  },
  feedbackButtonActive: {
    backgroundColor: COLORS.surface.tinted,
  }
});
