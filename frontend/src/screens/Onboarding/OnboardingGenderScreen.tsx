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

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingGender'>;

const TOTAL_STEPS = 5;
const STEP = 3;

const GENDERS = [
  { id: 'man',        label: 'Hombre',        icon: 'gender-male'      },
  { id: 'woman',      label: 'Mujer',          icon: 'gender-female'    },
  { id: 'nonbinary',  label: 'No binario',     icon: 'gender-non-binary'},
  { id: 'trans_man',  label: 'Hombre trans',   icon: 'gender-transgender'},
  { id: 'trans_woman',label: 'Mujer trans',    icon: 'gender-transgender'},
  { id: 'other',      label: 'Otro',           icon: 'account-heart'    },
];

export default function OnboardingGenderScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn,  { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

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

        <Animated.View style={[styles.content, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}>
          <Text style={styles.question}>¿Cómo te identificas?</Text>
          <Text style={styles.hint}>Puedes actualizarlo cuando quieras</Text>

          <View style={styles.grid}>
            {GENDERS.map((g, i) => {
              const active = selected === g.id;
              return (
                <TouchableOpacity
                  key={g.id}
                  style={[styles.tile, active && styles.tileActive]}
                  onPress={() => setSelected(g.id)}
                  activeOpacity={0.8}
                >
                  {active && (
                    <LinearGradient
                      colors={[COLORS.secondary + '30', COLORS.primary + '30']}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    />
                  )}
                  <MaterialCommunityIcons
                    name={g.icon as any}
                    size={26}
                    color={active ? COLORS.accent : 'rgba(255,255,255,0.35)'}
                  />
                  <Text style={[styles.tileLabel, active && styles.tileLabelActive]}>
                    {g.label}
                  </Text>
                  {active && (
                    <View style={styles.checkMark}>
                      <MaterialCommunityIcons name="check" size={12} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* CTA */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.cta, !selected && styles.ctaDisabled]}
            onPress={() => navigation.navigate('OnboardingInterests')}
            disabled={!selected}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={selected ? [COLORS.secondary, COLORS.primary] : ['#2a2040', '#2a2040']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.ctaGrad}
            >
              <Text style={styles.ctaText}>Continuar</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color={selected ? '#fff' : 'rgba(255,255,255,0.3)'} />
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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40, gap: 12 },
  question: { fontSize: 32, fontFamily: 'Poppins_700Bold', color: '#FFFFFF', lineHeight: 40 },
  hint: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.35)', marginTop: 4 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 28,
  },
  tile: {
    width: '47%',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    paddingVertical: 20,
    paddingHorizontal: 16,
    gap: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  tileActive: {
    borderColor: COLORS.accent + '60',
  },
  tileLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.45)',
  },
  tileLabelActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
  },
  checkMark: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 24 },
  cta: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 14, elevation: 10,
  },
  ctaDisabled: { shadowOpacity: 0 },
  ctaGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17, borderRadius: 16,
  },
  ctaText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#FFFFFF' },
});
