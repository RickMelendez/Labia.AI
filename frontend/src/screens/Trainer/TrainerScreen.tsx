import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import { useStrings } from '../../core/i18n/useStrings';
import { container } from '../../infrastructure/di/Container';

interface Mission {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xp: number;
  icon: string;
  completed: boolean;
}

const MISSIONS_STORAGE_KEY = '@labia_missions';
const STATS_STORAGE_KEY = '@labia_trainer_stats';

const AVAILABLE_MISSIONS: Mission[] = [
  {
    id: '1',
    title: 'First Connection',
    description: 'Generate your first personalized opener',
    difficulty: 'easy',
    xp: 10,
    icon: 'message-arrow-right',
    completed: false,
  },
  {
    id: '2',
    title: 'Cultural Master',
    description: 'Use 3 different cultural styles',
    difficulty: 'medium',
    xp: 25,
    icon: 'earth',
    completed: false,
  },
  {
    id: '3',
    title: 'Tone Polyglot',
    description: 'Try all available tones',
    difficulty: 'medium',
    xp: 30,
    icon: 'palette',
    completed: false,
  },
  {
    id: '4',
    title: 'Active Conversationalist',
    description: 'Generate 10 suggestions in one day',
    difficulty: 'hard',
    xp: 50,
    icon: 'fire',
    completed: false,
  },
  {
    id: '5',
    title: 'Consistent Practitioner',
    description: 'Use the app 5 days in a row',
    difficulty: 'hard',
    xp: 75,
    icon: 'calendar-star',
    completed: false,
  },
];

const DIFFICULTY_COLOR: Record<string, string> = {
  easy:   '#10B981',  // green
  medium: '#F59E0B',  // amber
  hard:   '#DC2626',  // red
};

export default function TrainerScreen() {
  const s = useStrings();
  const [missions, setMissions] = useState<Mission[]>(AVAILABLE_MISSIONS);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const [missionsData, statsData] = await AsyncStorage.multiGet([MISSIONS_STORAGE_KEY, STATS_STORAGE_KEY]);
      if (missionsData[1]) setMissions(JSON.parse(missionsData[1]));
      if (statsData[1]) {
        const stats = JSON.parse(statsData[1]);
        setTotalXP(stats.totalXP || 0);
        setLevel(stats.level || 1);
      }
    } catch (error) {
      console.error('Failed to load trainer progress:', error);
    }
  };

  const saveProgress = async (updatedMissions: Mission[], xp: number, lvl: number) => {
    try {
      await AsyncStorage.multiSet([
        [MISSIONS_STORAGE_KEY, JSON.stringify(updatedMissions)],
        [STATS_STORAGE_KEY, JSON.stringify({ totalXP: xp, level: lvl })],
      ]);
    } catch (error) {
      console.error('Failed to save trainer progress:', error);
    }
  };

  const completeMission = (missionId: string) => {
    const mission = missions.find(m => m.id === missionId);
    if (!mission || mission.completed) return;

    const updatedMissions = missions.map(m =>
      m.id === missionId ? { ...m, completed: true } : m
    );
    const newXP = totalXP + mission.xp;
    const newLevel = Math.floor(newXP / 100) + 1;

    setMissions(updatedMissions);
    setTotalXP(newXP);
    setLevel(newLevel);
    saveProgress(updatedMissions, newXP, newLevel);

    container.toast.success('Mission Complete!', `+${mission.xp} XP earned`);
  };

  const completedMissions = missions.filter(m => m.completed).length;
  const xpInLevel = totalXP % 100;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{s.trainer.title}</Text>
          <Text style={styles.headerSubtitle}>{s.trainer.subtitle}</Text>
        </View>

        {/* Stats card */}
        <View style={styles.statsCard}>
          <View style={styles.statsTopRow}>
            {/* Level badge — solid amber */}
            <View style={styles.levelBadge}>
              <MaterialCommunityIcons name="trophy" size={15} color={COLORS.text.onBrand} />
              <Text style={styles.levelText}>{s.trainer.level} {level}</Text>
            </View>

            {/* XP total */}
            <View>
              <Text style={styles.xpTotal}>
                <Text style={styles.xpTotalNumber}>{totalXP}</Text>
                <Text style={styles.xpTotalLabel}> {s.trainer.xp}</Text>
              </Text>
            </View>
          </View>

          {/* XP Progress bar — solid amber */}
          <View style={styles.progressRow}>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${xpInLevel}%` }]} />
            </View>
            <Text style={styles.progressLabel}>
              {xpInLevel}/100 XP {s.trainer.toNextLevel}
            </Text>
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{completedMissions}/{missions.length}</Text>
              <Text style={styles.statLabel}>{s.trainer.missionsCompleted}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                {missions.length > 0 ? Math.floor((completedMissions / missions.length) * 100) : 0}%
              </Text>
              <Text style={styles.statLabel}>{s.trainer.progress}</Text>
            </View>
          </View>
        </View>

        {/* Missions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{s.trainer.missions}</Text>

          {missions.map(mission => (
            <TouchableOpacity
              key={mission.id}
              style={[styles.missionCard, mission.completed && styles.missionCardDone]}
              onPress={() => !mission.completed && completeMission(mission.id)}
              disabled={mission.completed}
              activeOpacity={0.75}
            >
              {/* Left accent strip — difficulty color */}
              <View style={[styles.missionAccent, { backgroundColor: DIFFICULTY_COLOR[mission.difficulty] }]} />

              {/* Icon */}
              <View style={styles.missionIconWrap}>
                <MaterialCommunityIcons
                  name={mission.completed ? 'check-circle' : (mission.icon as any)}
                  size={22}
                  color={mission.completed ? COLORS.success : COLORS.primary}
                />
              </View>

              {/* Body */}
              <View style={styles.missionBody}>
                <Text style={[styles.missionTitle, mission.completed && styles.missionTitleDone]}>
                  {mission.title}
                </Text>
                <Text style={styles.missionDesc}>{mission.description}</Text>
                <View style={styles.missionFooter}>
                  <View style={[styles.difficultyChip, { backgroundColor: DIFFICULTY_COLOR[mission.difficulty] + '22' }]}>
                    <Text style={[styles.difficultyLabel, { color: DIFFICULTY_COLOR[mission.difficulty] }]}>
                      {s.trainer.difficulty[mission.difficulty]}
                    </Text>
                  </View>
                  <Text style={styles.xpChip}>+{mission.xp} {s.trainer.xpReward}</Text>
                </View>
              </View>

              {mission.completed && (
                <MaterialCommunityIcons name="check" size={18} color={COLORS.success} style={styles.doneCheck} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 24,
    backgroundColor: '#161210',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.12)',
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  statsTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
    backgroundColor: COLORS.primary,
  },
  levelText: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.onBrand,
  },
  xpTotal: {},
  xpTotalNumber: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  xpTotalLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  progressRow: {
    marginBottom: 20,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#261E1A',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    minWidth: 8,
  },
  progressLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 12,
    color: COLORS.text.secondary,
    textAlign: 'right',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 12,
    color: COLORS.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(245,158,11,0.12)',
    marginHorizontal: 16,
  },
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  missionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161210',
    borderRadius: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 4,
  },
  missionCardDone: {
    opacity: 0.5,
  },
  missionAccent: {
    width: 3,
    alignSelf: 'stretch',
  },
  missionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(245,158,11,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginRight: 12,
    marginVertical: 16,
  },
  missionBody: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 12,
  },
  missionTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 3,
  },
  missionTitleDone: {
    textDecorationLine: 'line-through',
    color: COLORS.text.muted,
  },
  missionDesc: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 13,
    color: COLORS.text.secondary,
    marginBottom: 8,
    lineHeight: 18,
  },
  missionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  difficultyChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 11,
    fontWeight: '700',
  },
  xpChip: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  doneCheck: {
    marginRight: 14,
  },
});
