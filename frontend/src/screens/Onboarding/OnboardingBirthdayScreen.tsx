import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import type { OnboardingStackParamList } from '../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingBirthday'>;

const TOTAL_STEPS = 5;
const STEP = 2;

const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEAR_NOW = new Date().getFullYear();
const YEARS  = Array.from({ length: 82 }, (_, i) => YEAR_NOW - 18 - i);

function PickerColumn({
  items, selected, onSelect, format,
}: {
  items: number[] | string[];
  selected: number | string;
  onSelect: (v: any) => void;
  format?: (v: any) => string;
}) {
  return (
    <ScrollView
      style={styles.pickerCol}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingVertical: 64 }}
    >
      {(items as any[]).map((item) => {
        const isActive = item === selected;
        return (
          <TouchableOpacity
            key={item}
            style={[styles.pickerItem, isActive && styles.pickerItemActive]}
            onPress={() => onSelect(item)}
          >
            <Text style={[styles.pickerText, isActive && styles.pickerTextActive]}>
              {format ? format(item) : String(item)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

export default function OnboardingBirthdayScreen({ navigation }: Props) {
  const [day, setDay]     = useState(1);
  const [month, setMonth] = useState('Jan');
  const [year, setYear]   = useState(YEAR_NOW - 25);
  const age = YEAR_NOW - year;

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
          <Text style={styles.question}>When were you born?</Text>
          <Text style={styles.hint}>Only your age is shown, not your birthday</Text>

          <View style={styles.pickerWrap}>
            <View style={styles.pickerHighlight} pointerEvents="none" />
            <PickerColumn items={DAYS}   selected={day}   onSelect={setDay}   />
            <PickerColumn items={MONTHS} selected={month} onSelect={setMonth} />
            <PickerColumn items={YEARS}  selected={year}  onSelect={setYear}  />
          </View>

          <View style={styles.agePreview}>
            <MaterialCommunityIcons name="cake-variant-outline" size={15} color={COLORS.primary} />
            <Text style={styles.ageText}>{age} years old</Text>
          </View>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => navigation.navigate('OnboardingGender')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Continue</Text>
            <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.text.onBrand} />
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
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
  question: {
    fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 32, fontWeight: '700',
    color: COLORS.text.primary, lineHeight: 40,
  },
  hint: {
    fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 14,
    color: COLORS.text.muted, marginTop: 6,
  },
  pickerWrap: {
    flexDirection: 'row', marginTop: 32, height: 220, position: 'relative',
  },
  pickerHighlight: {
    position: 'absolute', left: 0, right: 0,
    top: '50%', marginTop: -24, height: 48,
    borderRadius: 12, backgroundColor: 'rgba(249,112,96,0.06)',
    borderWidth: 1, borderColor: 'rgba(249,112,96,0.12)',
  },
  pickerCol: { flex: 1 },
  pickerItem: { height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  pickerItemActive: {},
  pickerText: {
    fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 17, color: COLORS.text.muted,
  },
  pickerTextActive: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold, fontSize: 20, color: COLORS.text.primary,
  },
  agePreview: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginTop: 24, alignSelf: 'center',
    backgroundColor: 'rgba(249,112,96,0.08)',
    borderWidth: 1, borderColor: 'rgba(249,112,96,0.18)',
    borderRadius: 100, paddingHorizontal: 16, paddingVertical: 8,
  },
  ageText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold, fontSize: 14, color: COLORS.primary,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 24 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17, borderRadius: 16,
    backgroundColor: COLORS.primary,
    shadowColor: 'rgba(249,112,96,0.35)',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 10,
  },
  ctaText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold, fontSize: 16,
    fontWeight: '600', color: COLORS.text.onBrand,
  },
});
