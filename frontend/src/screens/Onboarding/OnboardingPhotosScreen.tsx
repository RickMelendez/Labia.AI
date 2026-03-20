import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants';
import type { OnboardingStackParamList } from '../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingPhotos'>;

const TOTAL_STEPS = 5;
const STEP = 5;
const SLOTS = 6;

export default function OnboardingPhotosScreen({ navigation }: Props) {
  const [photos] = useState<(string | null)[]>(Array(SLOTS).fill(null));
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const photoCount = photos.filter(Boolean).length;

  // Photo upload placeholder — tapping shows a "coming soon" feel
  const handlePhotoSlot = (index: number) => {
    // In production: use expo-image-picker here
    // For now we just show the slot as interactive
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#05030E', '#0D0820']} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
          <View style={styles.progressTrack}>
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.progressFill, { width: `${(STEP / TOTAL_STEPS) * 100}%` }]}
            />
          </View>
          <Text style={styles.stepCount}>{STEP}/{TOTAL_STEPS}</Text>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeIn }]}>
          <Text style={styles.question}>Muéstrate</Text>
          <Text style={styles.hint}>
            Los perfiles con fotos tienen 8× más matches
          </Text>

          {/* Photo grid */}
          <View style={styles.grid}>
            {Array.from({ length: SLOTS }).map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.slot, i === 0 && styles.slotPrimary]}
                onPress={() => handlePhotoSlot(i)}
                activeOpacity={0.7}
              >
                <LinearGradient
                  colors={['rgba(183,148,246,0.06)', 'rgba(94,66,156,0.06)']}
                  style={StyleSheet.absoluteFillObject}
                />
                <MaterialCommunityIcons
                  name={i === 0 ? 'camera-plus' : 'plus'}
                  size={i === 0 ? 32 : 22}
                  color={i === 0 ? 'rgba(183,148,246,0.6)' : 'rgba(255,255,255,0.15)'}
                />
                {i === 0 && (
                  <Text style={styles.slotPrimaryLabel}>Foto principal</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Privacy note */}
          <View style={styles.privacyRow}>
            <MaterialCommunityIcons name="shield-check-outline" size={14} color="rgba(255,255,255,0.25)" />
            <Text style={styles.privacyText}>
              Tus fotos solo las ven personas que hacen match contigo
            </Text>
          </View>
        </Animated.View>

        {/* CTA */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => navigation.navigate('OnboardingReady')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.ctaGrad}
            >
              <Text style={styles.ctaText}>
                {photoCount > 0 ? `Continuar con ${photoCount} foto${photoCount !== 1 ? 's' : ''}` : 'Continuar sin fotos'}
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          {photoCount === 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('OnboardingReady')} style={styles.skipBtn}>
              <Text style={styles.skipText}>Agregar fotos después</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 12,
  },
  backBtn: { padding: 4 },
  progressTrack: {
    flex: 1, height: 3, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  stepCount: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.25)' },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 36 },
  question: { fontSize: 32, fontFamily: 'Poppins_700Bold', color: '#FFFFFF' },
  hint: {
    fontSize: 14, fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.35)', marginTop: 6, marginBottom: 28,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slot: {
    width: '31%',
    aspectRatio: 0.78,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    gap: 6,
  },
  slotPrimary: {
    borderColor: 'rgba(183,148,246,0.3)',
    borderStyle: 'solid',
  },
  slotPrimaryLabel: {
    fontSize: 10,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(183,148,246,0.5)',
  },
  privacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingHorizontal: 4,
  },
  privacyText: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.22)',
    flex: 1,
    lineHeight: 16,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 24, gap: 10 },
  cta: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
  },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17, borderRadius: 16,
  },
  ctaText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
  skipBtn: { alignItems: 'center', paddingVertical: 6 },
  skipText: { fontSize: 13, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.25)' },
});
