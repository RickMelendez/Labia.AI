import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import type { OnboardingStackParamList } from '../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingName'>;

const TOTAL_STEPS = 5;
const STEP = 1;

export default function OnboardingNameScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const canContinue = name.trim().length >= 2;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Progress header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={20} color={COLORS.text.muted} />
            </TouchableOpacity>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(STEP / TOTAL_STEPS) * 100}%` }]} />
            </View>
            <Text style={styles.stepCount}>{STEP}/{TOTAL_STEPS}</Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.question}>What's your name?</Text>
            <Text style={styles.hint}>This is how others will see you</Text>

            <View style={styles.inputWrap}>
              <TextInput
                style={styles.input}
                placeholder="Your name..."
                placeholderTextColor={COLORS.text.muted}
                value={name}
                onChangeText={setName}
                autoFocus
                autoCapitalize="words"
                maxLength={40}
                returnKeyType="done"
                onSubmitEditing={() => canContinue && navigation.navigate('OnboardingBirthday')}
              />
              {name.length > 0 && (
                <TouchableOpacity onPress={() => setName('')}>
                  <MaterialCommunityIcons name="close-circle" size={20} color={COLORS.text.muted} />
                </TouchableOpacity>
              )}
            </View>

            {canContinue && (
              <Text style={styles.preview}>
                Hi, <Text style={styles.previewName}>{name.trim()} 👋</Text>
              </Text>
            )}
          </View>

          {/* CTA */}
          <View style={styles.bottom}>
            <TouchableOpacity
              style={[styles.cta, !canContinue && styles.ctaDisabled]}
              onPress={() => navigation.navigate('OnboardingBirthday')}
              disabled={!canContinue}
              activeOpacity={0.85}
            >
              <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>Continue</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={18}
                color={canContinue ? COLORS.text.onBrand : COLORS.text.muted}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5' },
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
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: '#E0D5CF', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: COLORS.primary },
  stepCount: {
    fontFamily: TYPOGRAPHY.fontFamily.medium,
    fontSize: 11,
    color: COLORS.text.muted,
  },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 48, gap: 12 },
  question: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.text.primary,
    lineHeight: 40,
  },
  hint: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 15,
    color: COLORS.text.muted,
    marginTop: -4,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(249,112,96,0.35)',
    paddingBottom: 10,
  },
  input: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    flex: 1,
    fontSize: 28,
    color: COLORS.text.primary,
    letterSpacing: -0.5,
    padding: 0,
  },
  preview: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 15,
    color: COLORS.text.muted,
    marginTop: 12,
  },
  previewName: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    color: COLORS.primary,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 24 },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 17,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    shadowColor: 'rgba(249,112,96,0.35)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 10,
  },
  ctaDisabled: {
    backgroundColor: '#F5D0CB',
    shadowOpacity: 0,
    elevation: 0,
  },
  ctaText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.onBrand,
  },
  ctaTextDisabled: { color: COLORS.text.muted },
});
