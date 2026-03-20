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

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingInterests'>;

const TOTAL_STEPS = 5;
const STEP = 4;
const MIN_SELECTIONS = 3;

const INTERESTS = [
  { id: 'music',       label: 'Música',       icon: 'music'             },
  { id: 'travel',      label: 'Viajes',        icon: 'airplane'          },
  { id: 'food',        label: 'Comida',        icon: 'food-fork-drink'   },
  { id: 'fitness',     label: 'Fitness',       icon: 'dumbbell'          },
  { id: 'photography', label: 'Fotos',         icon: 'camera'            },
  { id: 'art',         label: 'Arte',          icon: 'palette'           },
  { id: 'coffee',      label: 'Café',          icon: 'coffee'            },
  { id: 'wine',        label: 'Vinos',         icon: 'glass-wine'        },
  { id: 'dancing',     label: 'Bailar',        icon: 'dance-ballroom'    },
  { id: 'hiking',      label: 'Senderismo',    icon: 'hiking'            },
  { id: 'beach',       label: 'Playa',         icon: 'umbrella-beach'    },
  { id: 'movies',      label: 'Cine',          icon: 'movie-play'        },
  { id: 'cooking',     label: 'Cocinar',       icon: 'chef-hat'          },
  { id: 'gaming',      label: 'Gaming',        icon: 'gamepad-variant'   },
  { id: 'books',       label: 'Libros',        icon: 'book-open-variant' },
  { id: 'yoga',        label: 'Yoga',          icon: 'meditation'        },
  { id: 'pets',        label: 'Mascotas',      icon: 'dog'               },
  { id: 'sports',      label: 'Deportes',      icon: 'soccer'            },
  { id: 'fashion',     label: 'Moda',          icon: 'tshirt-crew'       },
  { id: 'comedy',      label: 'Humor',         icon: 'emoticon-happy'    },
];

export default function OnboardingInterestsScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const fadeIn = useRef(new Animated.Value(0)).current;
  const countScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        Animated.sequence([
          Animated.spring(countScale, { toValue: 1.3, useNativeDriver: true }),
          Animated.spring(countScale, { toValue: 1, useNativeDriver: true }),
        ]).start();
      }
      return next;
    });
  };

  const canContinue = selected.size >= MIN_SELECTIONS;

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

        <Animated.View style={{ opacity: fadeIn, flex: 1 }}>
          <View style={styles.titleArea}>
            <Text style={styles.question}>¿Qué te apasiona?</Text>
            <View style={styles.countRow}>
              <Animated.Text style={[styles.countBig, { transform: [{ scale: countScale }], color: canContinue ? COLORS.accent : 'rgba(255,255,255,0.25)' }]}>
                {selected.size}
              </Animated.Text>
              <Text style={styles.countLabel}>/{MIN_SELECTIONS} mín</Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.grid}
          >
            {INTERESTS.map((item) => {
              const active = selected.has(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggle(item.id)}
                  activeOpacity={0.8}
                >
                  {active && (
                    <LinearGradient
                      colors={[COLORS.secondary + '25', COLORS.primary + '25']}
                      style={StyleSheet.absoluteFillObject}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                    />
                  )}
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={18}
                    color={active ? COLORS.accent : 'rgba(255,255,255,0.4)'}
                  />
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>

        {/* CTA */}
        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.cta, !canContinue && styles.ctaDisabled]}
            onPress={() => navigation.navigate('OnboardingPhotos')}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={canContinue ? [COLORS.secondary, COLORS.primary] : ['#2a2040', '#2a2040']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.ctaGrad}
            >
              <Text style={styles.ctaText}>
                {canContinue ? `Continuar con ${selected.size}` : `Elige ${MIN_SELECTIONS - selected.size} más`}
              </Text>
              {canContinue && <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />}
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
  titleArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 16,
  },
  question: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: '#FFFFFF', flex: 1 },
  countRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  countBig: { fontSize: 28, fontFamily: 'Poppins_700Bold' },
  countLabel: { fontSize: 13, fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.3)' },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
    paddingBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  chipActive: {
    borderColor: COLORS.accent + '50',
  },
  chipLabel: {
    fontSize: 13,
    fontFamily: 'Poppins_500Medium',
    color: 'rgba(255,255,255,0.4)',
  },
  chipLabelActive: {
    color: '#FFFFFF',
    fontFamily: 'Poppins_600SemiBold',
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
