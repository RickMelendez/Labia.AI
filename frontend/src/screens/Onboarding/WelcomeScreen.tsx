import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import type { OnboardingStackParamList } from '../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Static amber blur at center */}
      <View style={styles.amberGlow} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoLetter}>L</Text>
            </View>
            <View style={styles.logoRing} />
          </View>

          {/* Brand */}
          <Text style={styles.brand}>
            Labia<Text style={styles.brandAccent}>.AI</Text>
          </Text>

          {/* Tagline */}
          <Text style={styles.tagline}>
            Real connections.{'\n'}Conversations that matter.
          </Text>

          {/* Feature pills */}
          <View style={styles.pillsRow}>
            {['Smart Match', 'Group Lobbies', 'AI Coach'].map((t) => (
              <View key={t} style={styles.pill}>
                <Text style={styles.pillText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.replace('OnboardingName')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Get Started</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color={COLORS.text.onBrand} />
          </TouchableOpacity>
          <Text style={styles.legal}>
            By continuing, you agree to our{' '}
            <Text style={styles.legalLink}>Terms</Text> and{' '}
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  amberGlow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(249,112,96,0.06)',
    alignSelf: 'center',
    top: '25%',
  },
  safe: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 18,
  },
  logoWrap: {
    position: 'relative',
    marginBottom: 4,
  },
  logoCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: 'rgba(249,112,96,0.4)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 12,
  },
  logoLetter: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 44,
    fontWeight: '800',
    color: COLORS.text.onBrand,
  },
  logoRing: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: 'rgba(249,112,96,0.20)',
  },
  brand: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -1,
    lineHeight: 58,
  },
  brandAccent: {
    color: COLORS.primary,
  },
  tagline: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 17,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 26,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  pill: {
    backgroundColor: 'rgba(249,112,96,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(249,112,96,0.18)',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: 12,
    color: COLORS.primary,
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 14,
    alignItems: 'center',
  },
  ctaBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    shadowColor: 'rgba(249,112,96,0.35)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 12,
  },
  ctaText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text.onBrand,
    letterSpacing: 0.3,
  },
  legal: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 11,
    color: COLORS.text.muted,
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLink: {
    color: COLORS.text.secondary,
    textDecorationLine: 'underline',
  },
});
