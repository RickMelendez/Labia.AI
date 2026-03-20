import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants';
import { useAppStore } from '../../store/appStore';
import type { OnboardingStackParamList } from '../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingReady'>;

const FEATURES = [
  { icon: 'heart-search',   label: 'Descubre perfiles que conectan contigo'  },
  { icon: 'account-group',  label: 'Únete a grupos y planea aventuras'        },
  { icon: 'robot-love',     label: 'IA que te ayuda a romper el hielo'        },
];

export default function OnboardingReadyScreen({ navigation }: Props) {
  const { setDarkMode, setOnboardingCompleted } = useAppStore();

  const ringScale  = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const ctaOpacity = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance sequence
    Animated.sequence([
      Animated.spring(ringScale, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true }),
      Animated.timing(iconOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(contentOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(ctaOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    // Pulse loop on ring
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    }, 800);
  }, []);

  const handleStart = async () => {
    setDarkMode(true);
    await setOnboardingCompleted();
    // RootNavigator subscribes to hasCompletedOnboarding — setting it triggers re-render to Main
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#05030E', '#0D0820', '#120930']} style={StyleSheet.absoluteFillObject}
        start={{ x: 0.3, y: 0 }} end={{ x: 0.7, y: 1 }}
      />
      {/* Bg glow */}
      <View style={styles.bgGlow}>
        <LinearGradient
          colors={['rgba(94,66,156,0.25)', 'transparent']}
          style={StyleSheet.absoluteFillObject}
        />
      </View>

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.center}>
          {/* Animated icon ring */}
          <Animated.View style={[styles.ringOuter, { transform: [{ scale: ringScale }, { scale: pulseAnim }] }]}>
            <LinearGradient
              colors={[COLORS.secondary + '30', COLORS.primary + '30']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.ringInner}>
              <LinearGradient
                colors={[COLORS.secondary, COLORS.primary]}
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={styles.iconGrad}
              >
                <Animated.View style={{ opacity: iconOpacity }}>
                  <MaterialCommunityIcons name="heart-flash" size={44} color="#FFFFFF" />
                </Animated.View>
              </LinearGradient>
            </View>
          </Animated.View>

          <Animated.View style={[styles.textArea, { opacity: contentOpacity }]}>
            <Text style={styles.title}>¡Todo listo! 🎉</Text>
            <Text style={styles.subtitle}>
              Tu perfil está configurado.{'\n'}Es hora de conectar.
            </Text>

            {/* Feature list */}
            <View style={styles.featureList}>
              {FEATURES.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <MaterialCommunityIcons name={f.icon as any} size={18} color={COLORS.accent} />
                  </View>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>

        {/* CTA */}
        <Animated.View style={[styles.bottom, { opacity: ctaOpacity }]}>
          <TouchableOpacity
            style={styles.cta}
            onPress={handleStart}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.ctaGrad}
            >
              <MaterialCommunityIcons name="heart-search" size={20} color="#fff" />
              <Text style={styles.ctaText}>Explorar Labia.AI</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  bgGlow: {
    position: 'absolute',
    width: 500,
    height: 500,
    borderRadius: 250,
    top: -100,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 28,
  },
  ringOuter: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(183,148,246,0.2)',
  },
  ringInner: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  iconGrad: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 36,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    lineHeight: 24,
  },
  featureList: {
    gap: 12,
    marginTop: 8,
    width: '100%',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(183,148,246,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 32 },
  cta: {
    borderRadius: 18, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 12,
  },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 10, paddingVertical: 18, borderRadius: 18,
  },
  ctaText: { fontSize: 17, fontFamily: 'Poppins_700Bold', color: '#FFFFFF', letterSpacing: 0.3 },
});
