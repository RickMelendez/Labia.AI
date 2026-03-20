import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants';
import type { OnboardingStackParamList } from '../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingName'>;

const TOTAL_STEPS = 5;
const STEP = 1;

export default function OnboardingNameScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const canContinue = name.trim().length >= 2;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#05030E', '#0D0820']} style={StyleSheet.absoluteFillObject} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={22} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            {/* Progress bar */}
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={[COLORS.secondary, COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${(STEP / TOTAL_STEPS) * 100}%` }]}
              />
            </View>
            <Text style={styles.stepCount}>{STEP}/{TOTAL_STEPS}</Text>
          </View>

          {/* Content */}
          <Animated.View
            style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
          >
            <Text style={styles.question}>¿Cómo te llamas?</Text>
            <Text style={styles.hint}>Así te verán los demás</Text>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre..."
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={name}
                onChangeText={setName}
                autoFocus
                autoCapitalize="words"
                maxLength={40}
                returnKeyType="done"
                onSubmitEditing={() => canContinue && navigation.navigate('OnboardingBirthday')}
              />
              {name.length > 0 && (
                <TouchableOpacity onPress={() => setName('')} style={styles.clearBtn}>
                  <MaterialCommunityIcons name="close-circle" size={20} color="rgba(255,255,255,0.25)" />
                </TouchableOpacity>
              )}
            </View>

            {name.trim().length >= 2 && (
              <Text style={styles.preview}>Hola, <Text style={styles.previewName}>{name.trim()} 👋</Text></Text>
            )}
          </Animated.View>

          {/* CTA */}
          <View style={styles.bottom}>
            <TouchableOpacity
              style={[styles.cta, !canContinue && styles.ctaDisabled]}
              onPress={() => navigation.navigate('OnboardingBirthday')}
              disabled={!canContinue}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={canContinue ? [COLORS.secondary, COLORS.primary] : ['#2a2040', '#2a2040']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.ctaGrad}
              >
                <Text style={styles.ctaText}>Continuar</Text>
                <MaterialCommunityIcons name="arrow-right" size={18} color={canContinue ? '#fff' : 'rgba(255,255,255,0.3)'} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 12,
  },
  backBtn: { padding: 4 },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  stepCount: {
    fontSize: 11,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.25)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 48,
    gap: 12,
  },
  question: {
    fontSize: 32,
    fontFamily: 'Poppins_700Bold',
    color: '#FFFFFF',
    lineHeight: 40,
  },
  hint: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.35)',
    marginTop: -4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary + '60',
    paddingBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 28,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    padding: 0,
  },
  clearBtn: { padding: 4 },
  preview: {
    fontSize: 15,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.3)',
    marginTop: 12,
  },
  previewName: {
    color: COLORS.accent,
    fontFamily: 'Poppins_600SemiBold',
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  cta: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 10,
  },
  ctaDisabled: { shadowOpacity: 0 },
  ctaGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 17,
    borderRadius: 16,
  },
  ctaText: {
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
});
