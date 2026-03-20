import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../core/constants';
import type { OnboardingStackParamList } from '../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingBirthday'>;

const TOTAL_STEPS = 5;
const STEP = 2;

const DAYS   = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const YEAR_NOW = new Date().getFullYear();
const YEARS  = Array.from({ length: 82 }, (_, i) => YEAR_NOW - 18 - i); // 18–100

function PickerColumn({
  items,
  selected,
  onSelect,
  format,
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
  const [month, setMonth] = useState('Ene');
  const [year, setYear]   = useState(YEAR_NOW - 25);
  const fadeIn = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const age = YEAR_NOW - year;

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
          <Text style={styles.question}>¿Cuándo naciste?</Text>
          <Text style={styles.hint}>Solo se muestra tu edad, no tu cumpleaños</Text>

          {/* Picker */}
          <View style={styles.pickerWrap}>
            {/* Selection highlight */}
            <View style={styles.pickerHighlight} pointerEvents="none" />

            <PickerColumn items={DAYS}   selected={day}   onSelect={setDay}   />
            <PickerColumn items={MONTHS} selected={month} onSelect={setMonth} />
            <PickerColumn items={YEARS}  selected={year}  onSelect={setYear}  />
          </View>

          {/* Age preview */}
          <View style={styles.agePreview}>
            <MaterialCommunityIcons name="cake-variant-outline" size={16} color={COLORS.accent} />
            <Text style={styles.ageText}>{age} años</Text>
          </View>
        </Animated.View>

        {/* CTA */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={styles.cta}
            onPress={() => navigation.navigate('OnboardingGender')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[COLORS.secondary, COLORS.primary]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.ctaGrad}
            >
              <Text style={styles.ctaText}>Continuar</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
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
    flex: 1, height: 3, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  stepCount: { fontSize: 11, fontFamily: 'Poppins_500Medium', color: 'rgba(255,255,255,0.25)' },
  content: { flex: 1, paddingHorizontal: 28, paddingTop: 40 },
  question: { fontSize: 32, fontFamily: 'Poppins_700Bold', color: '#FFFFFF', lineHeight: 40 },
  hint: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.35)', marginTop: 6 },
  pickerWrap: {
    flexDirection: 'row',
    marginTop: 32,
    height: 220,
    position: 'relative',
  },
  pickerHighlight: {
    position: 'absolute',
    left: 0, right: 0,
    top: '50%',
    marginTop: -24,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pickerCol: { flex: 1 },
  pickerItem: {
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  pickerItemActive: {},
  pickerText: {
    fontSize: 17,
    fontFamily: 'Poppins_400Regular',
    color: 'rgba(255,255,255,0.2)',
  },
  pickerTextActive: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  agePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(183,148,246,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(183,148,246,0.2)',
    borderRadius: 100,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  ageText: { fontSize: 14, fontFamily: 'Poppins_600SemiBold', color: COLORS.accent },
  bottom: { paddingHorizontal: 24, paddingBottom: 24 },
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
});
