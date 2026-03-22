import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import type { OnboardingStackParamList } from '../../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'OnboardingInterests'>;

const TOTAL_STEPS = 5;
const STEP = 4;
const MIN_SELECTIONS = 3;

const INTERESTS = [
  { id: 'music',       label: 'Music',       icon: 'music'             },
  { id: 'travel',      label: 'Travel',       icon: 'airplane'          },
  { id: 'food',        label: 'Food',         icon: 'food-fork-drink'   },
  { id: 'fitness',     label: 'Fitness',      icon: 'dumbbell'          },
  { id: 'photography', label: 'Photography',  icon: 'camera'            },
  { id: 'art',         label: 'Art',          icon: 'palette'           },
  { id: 'coffee',      label: 'Coffee',       icon: 'coffee'            },
  { id: 'wine',        label: 'Wine',         icon: 'glass-wine'        },
  { id: 'dancing',     label: 'Dancing',      icon: 'dance-ballroom'    },
  { id: 'hiking',      label: 'Hiking',       icon: 'hiking'            },
  { id: 'beach',       label: 'Beach',        icon: 'umbrella-beach'    },
  { id: 'movies',      label: 'Movies',       icon: 'movie-play'        },
  { id: 'cooking',     label: 'Cooking',      icon: 'chef-hat'          },
  { id: 'gaming',      label: 'Gaming',       icon: 'gamepad-variant'   },
  { id: 'books',       label: 'Books',        icon: 'book-open-variant' },
  { id: 'yoga',        label: 'Yoga',         icon: 'meditation'        },
  { id: 'pets',        label: 'Pets',         icon: 'dog'               },
  { id: 'sports',      label: 'Sports',       icon: 'soccer'            },
  { id: 'fashion',     label: 'Fashion',      icon: 'tshirt-crew'       },
  { id: 'comedy',      label: 'Comedy',       icon: 'emoticon-happy'    },
];

export default function OnboardingInterestsScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const countScale = useRef(new Animated.Value(1)).current;

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

        <View style={{ flex: 1 }}>
          <View style={styles.titleArea}>
            <Text style={styles.question}>What are you into?</Text>
            <View style={styles.countRow}>
              <Animated.Text
                style={[
                  styles.countBig,
                  { transform: [{ scale: countScale }], color: canContinue ? COLORS.primary : COLORS.text.muted },
                ]}
              >
                {selected.size}
              </Animated.Text>
              <Text style={styles.countLabel}>/{MIN_SELECTIONS} min</Text>
            </View>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
            {INTERESTS.map((item) => {
              const active = selected.has(item.id);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => toggle(item.id)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={17}
                    color={active ? COLORS.primary : COLORS.text.muted}
                  />
                  <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.bottom}>
          <TouchableOpacity
            style={[styles.cta, !canContinue && styles.ctaDisabled]}
            onPress={() => navigation.navigate('OnboardingPhotos')}
            disabled={!canContinue}
            activeOpacity={0.85}
          >
            <Text style={[styles.ctaText, !canContinue && styles.ctaTextDisabled]}>
              {canContinue ? `Continue with ${selected.size}` : `Pick ${MIN_SELECTIONS - selected.size} more`}
            </Text>
            {canContinue && <MaterialCommunityIcons name="arrow-right" size={18} color={COLORS.text.onBrand} />}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0C0A08' },
  safe: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8, gap: 12,
  },
  backBtn: { padding: 4 },
  progressTrack: {
    flex: 1, height: 4, borderRadius: 2,
    backgroundColor: '#261E1A', overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2, backgroundColor: COLORS.primary },
  stepCount: { fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: 11, color: COLORS.text.muted },
  titleArea: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 24, paddingTop: 32, paddingBottom: 16,
  },
  question: {
    fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 28, fontWeight: '700',
    color: COLORS.text.primary, flex: 1,
  },
  countRow: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  countBig: { fontFamily: TYPOGRAPHY.fontFamily.bold, fontSize: 28, fontWeight: '700' },
  countLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.regular, fontSize: 13, color: COLORS.text.muted,
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 16, gap: 10, paddingBottom: 16,
  },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: '#161210',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.06)',
    borderRadius: 100, paddingHorizontal: 14, paddingVertical: 10,
  },
  chipActive: {
    borderColor: COLORS.primary,
    backgroundColor: 'rgba(245,158,11,0.08)',
  },
  chipLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.medium, fontSize: 13, color: COLORS.text.muted,
  },
  chipLabelActive: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold, color: COLORS.text.primary,
  },
  bottom: { paddingHorizontal: 24, paddingBottom: 24 },
  cta: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 17, borderRadius: 16,
    backgroundColor: COLORS.primary,
    shadowColor: 'rgba(245,158,11,0.35)',
    shadowOffset: { width: 0, height: 6 }, shadowOpacity: 1, shadowRadius: 14, elevation: 10,
  },
  ctaDisabled: { backgroundColor: '#2A1E14', shadowOpacity: 0, elevation: 0 },
  ctaText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold, fontSize: 16,
    fontWeight: '600', color: COLORS.text.onBrand,
  },
  ctaTextDisabled: { color: COLORS.text.muted },
});
