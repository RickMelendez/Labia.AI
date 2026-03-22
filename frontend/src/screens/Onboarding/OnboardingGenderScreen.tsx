import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import type { OnboardingStackParamList } from '../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingGender'>;

const TOTAL_STEPS = 5;
const STEP = 3;

const GENDERS = [
  { id: 'man',         label: 'Man',            icon: 'gender-male'       },
  { id: 'woman',       label: 'Woman',           icon: 'gender-female'     },
  { id: 'nonbinary',   label: 'Non-binary',      icon: 'gender-non-binary' },
  { id: 'trans_man',   label: 'Trans man',        icon: 'gender-transgender'},
  { id: 'trans_woman', label: 'Trans woman',      icon: 'gender-transgender'},
  { id: 'other',       label: 'Other',            icon: 'account-heart'    },
];

export default function OnboardingGenderScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

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
          <Text style={styles.question}>How do you identify?</Text>
          <Text style={styles.hint}>You can update this any time</Text>

          <View style={styles.grid}>
            {GENDERS.map((g) => {
              const active = selected === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.tile, active && styles.tileActive]}
                  onPress={() => setSelected(g.id)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={g.icon as any}
                    size={26}
                    color={active ? COLORS.primary : COLORS.text.muted}
                  />
                  <Text style={[styles.tileLabel, active && styles.tileLabelActive]}>
                    {g.label}
                  </Text>
                  {active && (
                    <View style={styles.checkMark}>
                      <MaterialCommunityIcons name="check" size={11} color={COLORS.text.onBrand} />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.cta, !selected && styles.ctaDisabled]}
            onPress={() => navigation.navigate('OnboardingInterests')}
            disabled={!selected}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaText, !selected && styles.ctaTextDisabled]}>Continue</Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={18}
              color={selected ? COLORS.text.onBrand : COLORS.text.muted}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF8F5' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 12,
  },
  backBtn: { padding: 4 },
  progressTrack: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: '#E0D5CF', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: COLORS.primary },
  stepCount: { fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: 11, color: COLORS.text.muted },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40, gap: 12 },
  question: {
    fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 32, fontWeight: '700',
    color: COLORS.text.primary, lineHeight: 40,
  },
  hint: {
    fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 14,
    color: COLORS.text.muted, marginTop: 4,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 28 },
  tile: {
    width: '47%',
    backgroundColor: '#F0EDE8',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
    position: 'relative',
  },
  tileActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(249,112,96,0.08)',
  },
  tileLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: 14, color: COLORS.text.muted,
  },
  tileLabelActive: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold, color: COLORS.text.primary,
  },
  checkMark: {
    position: 'absolute', top: 10, right: 10,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 24 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17, borderRadius: 16,
    backgroundColor: COLORS.primary,
    shadowColor: 'rgba(249,112,96,0.35)',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 10,
  },
  ctaDisabled: { backgroundColor: '#F5D0CB', shadowOpacity: 0, elevation: 0 },
  ctaText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold, fontSize: 16,
    fontWeight: '600', color: COLORS.text.onBrand,
  },
  ctaTextDisabled: { color: COLORS.text.muted },
});
