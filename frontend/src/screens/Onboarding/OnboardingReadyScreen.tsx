import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import { useAppStore } from '../../store/appStore';
import type { OnboardingStackParamList } from '../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingReady'>;

const FEATURES = [
  { icon: 'heart-search',  label: 'Discover profiles that connect with you'  },
  { icon: 'account-group', label: 'Join groups and plan adventures'           },
  { icon: 'robot-love',    label: 'AI that helps you break the ice'           },
];

export default function OnboardingReadyScreen({ navigation }: Props) {
  const { setDarkMode, setOnboardingCompleted } = useAppStore();

  const ringScale      = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity     = useRef(new Animated.Value(0)).current;
  const pulseAnim      = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(ringScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(ctaOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1300, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 1300, useNativeDriver: true }),
        ])
      ).start();
    }, 800);
  }, []);

  const handleStart = async () => {
    setDarkMode(true);
    await setOnboardingCompleted();
  };

  return (
    <View style={styles.container}>
      {/* Subtle amber glow at top */}
      <View style={styles.bgGlow} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          {/* Animated amber icon ring */}
          <Animated.View
            style={[styles.ringOuter, { transform: [{ scale: ringScale }, { scale: pulseAnim }] }]}
          >
            <View style={styles.ringInner}>
              <MaterialCommunityIcons name="heart-flash" size={44} color={COLORS.text.onBrand} />
            </View>
          </Animated.View>

          <Animated.View style={[styles.textArea, { opacity: contentOpacity }]}>
            <Text style={styles.title}>All set! 🎉</Text>
            <Text style={styles.subtitle}>
              Your profile is ready.{'\n'}Time to connect.
            </Text>

            <View style={styles.featureList}>
              {FEATURES.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <MaterialCommunityIcons name={f.icon as any} size={18} color={COLORS.primary} />
                  </View>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>

        <Animated.View style={[styles.bottom, { opacity: ctaOpacity }]}>
          <TouchableOpacity
            style={styles.cta}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="heart-search" size={20} color={COLORS.text.onBrand} />
            <Text style={styles.ctaText}>Explore Labia.AI</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5' },
  bgGlow: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(249,112,96,0.05)',
    top: -100,
    alignSelf: 'center',
  },
  safe: { flex: 1 },
  center: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28, gap: 28,
  },
  ringOuter: {
    width: 148,
    height: 148,
    borderRadius: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(249,112,96,0.20)',
    backgroundColor: 'rgba(249,112,96,0.06)',
  },
  ringInner: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(249,112,96,0.40)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  textArea: { alignItems: 'center', gap: 10 },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 36, fontWeight: '700',
    color: COLORS.text.primary, textAlign: 'center',
  },
  subtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 16,
    color: COLORS.text.secondary, textAlign: 'center', lineHeight: 24,
  },
  featureList: { gap: 12, marginTop: 8, width: '100%' },
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#F0EDE8',
    borderWidth: 1, borderColor: 'rgba(249,112,96,0.08)',
    borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12,
  },
  featureIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(249,112,96,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  featureLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: 13,
    color: COLORS.text.secondary, flex: 1,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 32 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 18, borderRadius: 18,
    backgroundColor: COLORS.primary,
    shadowColor: 'rgba(249,112,96,0.40)',
    shadowOffset: { width: 0, height: 8 }, shadowOpacity: 1, shadowRadius: 20, elevation: 12,
  },
  ctaText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 17, fontWeight: '700',
    color: COLORS.text.onBrand, letterSpacing: 0.3,
  },
});
