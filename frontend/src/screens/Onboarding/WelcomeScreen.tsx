import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants';
import type { OnboardingStackParamList } from '../../types';

const { width, height } = Dimensions.get('window');

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Welcome'>;

export default function WelcomeScreen({ navigation }: Props) {
  const logoScale  = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity  = useRef(new Animated.Value(0)).current;
  const orbAnim    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Orb drift
    Animated.loop(
      Animated.sequence([
        Animated.timing(orbAnim, { toValue: 1, duration: 5000, useNativeDriver: true }),
        Animated.timing(orbAnim, { toValue: 0, duration: 5000, useNativeDriver: true }),
      ])
    ).start();

    // Staggered entrance
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.timing(titleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(subtitleOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(ctaOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const orbY = orbAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -24] });

  return (
    <View style={styles.container}>
      {/* Deep space background */}
      <LinearGradient
        colors={['#05030E', '#0D0820', '#120930']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.7, y: 1 }}
      />

      {/* Nebula orbs */}
      <Animated.View style={[styles.orb, styles.orb1, { transform: [{ translateY: orbY }] }]}>
        <LinearGradient colors={['rgba(94,66,156,0.35)', 'transparent']} style={StyleSheet.absoluteFillObject} />
      </Animated.View>
      <Animated.View style={[styles.orb, styles.orb2]}>
        <LinearGradient colors={['rgba(244,146,240,0.2)', 'transparent']} style={StyleSheet.absoluteFillObject} />
      </Animated.View>
      <Animated.View style={[styles.orb, styles.orb3]}>
        <LinearGradient colors={['rgba(183,148,246,0.15)', 'transparent']} style={StyleSheet.absoluteFillObject} />
      </Animated.View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {/* Center content */}
        <View style={styles.center}>
          {/* Logo mark */}
          <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }], opacity: logoOpacity }]}>
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoGrad}
            >
              <MaterialCommunityIcons name="heart-flash" size={42} color="#FFFFFF" />
            </LinearGradient>
            {/* Glow ring */}
            <View style={styles.logoGlow} />
          </Animated.View>

          {/* Brand name */}
          <Animated.Text style={[styles.brand, { opacity: titleOpacity }]}>
            Labia
            <Text style={styles.brandAccent}>.AI</Text>
          </Animated.Text>

          {/* Tagline */}
          <Animated.Text style={[styles.tagline, { opacity: subtitleOpacity }]}>
            Conexiones reales.{'\n'}Conversaciones que importan.
          </Animated.Text>

          {/* Feature pills */}
          <Animated.View style={[styles.pillsRow, { opacity: subtitleOpacity }]}>
            {['Match inteligente', 'Chat grupal', 'IA que entiende'].map((t) => (
              <View key={t} style={styles.pill}>
                <Text style={styles.pillText}>{t}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Bottom CTA */}
        <Animated.View style={[styles.bottom, { opacity: ctaOpacity }]}>
          <TouchableOpacity
            style={styles.ctaBtn}
            onPress={() => navigation.replace('OnboardingName')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGrad}
            >
              <Text style={styles.ctaText}>Comenzar</Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.legal}>
            Al continuar, aceptas nuestros{' '}
            <Text style={styles.legalLink}>Términos</Text> y{' '}
            <Text style={styles.legalLink}>Privacidad</Text>
          </Text>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
    overflow: 'hidden',
  },
  orb1: { width: 420, height: 420, top: -100, right: -80 },
  orb2: { width: 320, height: 320, bottom: 80,  left: -100 },
  orb3: { width: 240, height: 240, top: height * 0.45, right: -60 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  logoWrap: {
    position: 'relative',
    marginBottom: 8,
  },
  logoGrad: {
    width: 96,
    height: 96,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: 'rgba(183,148,246,0.25)',
  },
  brand: {
    fontSize: 52,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    letterSpacing: -1,
    lineHeight: 56,
  },
  brandAccent: {
    color: COLORS.secondary,
  },
  tagline: {
    fontSize: 17,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'center',
    lineHeight: 26,
    marginTop: -4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.5)',
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 14,
    alignItems: 'center',
  },
  ctaBtn: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 12,
  },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    borderRadius: 18,
  },
  ctaText: {
    fontSize: 17,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  legal: {
    fontSize: 11,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.25)',
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLink: {
    color: 'rgba(255,255,255,0.45)',
    textDecorationLine: 'underline',
  },
});
