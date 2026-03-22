import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import type { OnboardingStackParamList } from '../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingPhotos'>;

const TOTAL_STEPS = 5;
const STEP = 5;
const SLOTS = 6;

export default function OnboardingPhotosScreen({ navigation }: Props) {
  const [photos] = useState<(string | null)[]>(Array(SLOTS).fill(null));
  const photoCount = photos.filter(Boolean).length;

  const handlePhotoSlot = (_index: number) => {
    // Production: use expo-image-picker
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.text.muted} />
          </TouchableOpacity>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(STEP / TOTAL_STEPS) * 100}%` }]} />
          </View>
          <Text style={styles.stepCount}>{STEP}/{TOTAL_STEPS}</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.question}>Show yourself</Text>
          <Text style={styles.hint}>Profiles with photos get 8× more matches</Text>

          <View style={styles.grid}>
            {Array.from({ length: SLOTS }).map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.slot, i === 0 && styles.slotPrimary]}
                onPress={() => handlePhotoSlot(i)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name={i === 0 ? 'camera-plus' : 'plus'}
                  size={i === 0 ? 30 : 20}
                  color={i === 0 ? COLORS.primary : COLORS.text.muted}
                />
                {i === 0 && (
                  <Text style={styles.slotPrimaryLabel}>Main photo</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.privacyRow}>
            <MaterialCommunityIcons name="shield-check-outline" size={13} color={COLORS.text.muted} />
            <Text style={styles.privacyText}>
              Your photos are only visible to people who match with you
            </Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => navigation.navigate('OnboardingReady')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>
              {photoCount > 0 ? `Continue with ${photoCount} photo${photoCount !== 1 ? 's' : ''}` : 'Continue without photos'}
            </Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.text.onBrand} />
          </TouchableOpacity>
          {photoCount === 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('OnboardingReady')} style={styles.skipBtn}>
              <Text style={styles.skipText}>Add photos later</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C0A08' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 12,
  },
  backBtn: { padding: 4 },
  progressTrack: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: '#261E1A', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: COLORS.primary },
  stepCount: { fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: 11, color: COLORS.text.muted },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 36 },
  question: {
    fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 32, fontWeight: '700',
    color: COLORS.text.primary,
  },
  hint: {
    fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 14,
    color: COLORS.text.muted, marginTop: 6, marginBottom: 28,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: {
    width: '31%', aspectRatio: 0.78,
    borderRadius: 14, borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    backgroundColor: '#161210',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  slotPrimary: {
    borderColor: 'rgba(245,158,11,0.30)',
    borderStyle: 'solid',
    backgroundColor: 'rgba(245,158,11,0.04)',
  },
  slotPrimaryLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: 10, color: COLORS.primary,
  },
  privacyRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 6, marginTop: 20, paddingHorizontal: 4,
  },
  privacyText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 11,
    color: COLORS.text.muted, flex: 1, lineHeight: 16,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 24, gap: 10 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17, borderRadius: 16,
    backgroundColor: COLORS.primary,
    shadowColor: 'rgba(245,158,11,0.35)',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 10,
  },
  ctaText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold, fontSize: 16,
    fontWeight: '600', color: COLORS.text.onBrand,
  },
  skipBtn: { alignItems: 'center', paddingVertical: 6 },
  skipText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: 13, color: COLORS.text.muted,
  },
});
