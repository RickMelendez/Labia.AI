import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../core/constants';
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
    title: 'Primera Conexión',
    description: 'Genera tu primer opener personalizado',
    difficulty: 'easy',
    xp: 10,
    icon: 'message-arrow-right',
    completed: false,
  },
  {
    id: '2',
    title: 'Maestro Cultural',
    description: 'Usa 3 estilos culturales diferentes',
    difficulty: 'medium',
    xp: 25,
    icon: 'earth',
    completed: false,
  },
  {
    id: '3',
    title: 'Políglota del Flow',
    description: 'Prueba todos los tonos disponibles',
    difficulty: 'medium',
    xp: 30,
    icon: 'palette',
    completed: false,
  },
  {
    id: '4',
    title: 'Conversador Activo',
    description: 'Genera 10 sugerencias en un día',
    difficulty: 'hard',
    xp: 50,
    icon: 'fire',
    completed: false,
  },
  {
    id: '5',
    title: 'Practicante Constante',
    description: 'Usa la app 5 días consecutivos',
    difficulty: 'hard',
    xp: 75,
    icon: 'calendar-star',
    completed: false,
  },
];

export default function TrainerScreen() {
  const theme = useTheme();
  const [missions, setMissions] = useState<Mission[]>(AVAILABLE_MISSIONS);
  const [totalXP, setTotalXP] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const [missionsData, statsData] = await AsyncStorage.multiGet([MISSIONS_STORAGE_KEY, STATS_STORAGE_KEY]);

      if (missionsData[1]) {
        setMissions(JSON.parse(missionsData[1]));
      }

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

    container.toast.success('¡Misión Completada!', `+${mission.xp} XP ganados`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return COLORS.success;
      case 'medium': return '#F59E0B';
      case 'hard': return COLORS.error;
      default: return COLORS.text.secondary;
    }
  };

  const completedMissions = missions.filter(m => m.completed).length;
  const progressPercentage = (totalXP % 100) / 100;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
      <LinearGradient colors={COLORS.gradient.accent} style={styles.header}>
        <Text style={styles.headerIcon}>🏆</Text>
        <Text style={styles.headerTitle}>Entrenador de Labia</Text>
        <Text style={styles.headerSubtitle}>Mejora tus habilidades de conversación</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Card */}
        <View style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.statsHeader}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Nivel {level}</Text>
            </View>
            <Text style={[styles.xpText, { color: theme.colors.onSurfaceVariant }]}>
              {totalXP} XP
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View style={[styles.progressFill, { width: `${progressPercentage * 100}%` }]} />
            </View>
            <Text style={[styles.progressText, { color: theme.colors.onSurfaceVariant }]}>
              {totalXP % 100}/100 XP al siguiente nivel
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.colors.primary }]}>
                {completedMissions}/{missions.length}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Misiones
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.success }]}>
                {Math.floor((completedMissions / missions.length) * 100)}%
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
                Progreso
              </Text>
            </View>
          </View>
        </View>

        {/* Missions Section */}
        <Text style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
          Misiones Disponibles
        </Text>

        {missions.map(mission => (
          <MissionCard
            key={mission.id}
            mission={mission}
            onComplete={completeMission}
            getDifficultyColor={getDifficultyColor}
            theme={theme}
          />
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

interface MissionCardProps {
  mission: Mission;
  onComplete: (id: string) => void;
  getDifficultyColor: (difficulty: string) => string;
  theme: any;
}

function MissionCard({ mission, onComplete, getDifficultyColor, theme }: MissionCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.missionCard,
        { backgroundColor: theme.colors.surface },
        mission.completed && styles.missionCardCompleted,
      ]}
      onPress={() => !mission.completed && onComplete(mission.id)}
      disabled={mission.completed}
    >
      <View style={styles.missionLeft}>
        <View style={[styles.missionIcon, mission.completed && styles.missionIconCompleted]}>
          <MaterialCommunityIcons
            name={mission.completed ? 'check' : (mission.icon as any)}
            size={24}
            color={mission.completed ? COLORS.success : COLORS.primary}
          />
        </View>
        <View style={styles.missionInfo}>
          <Text style={[styles.missionTitle, { color: theme.colors.onSurface }, mission.completed && styles.missionTitleCompleted]}>
            {mission.title}
          </Text>
          <Text style={[styles.missionDescription, { color: theme.colors.onSurfaceVariant }]}>
            {mission.description}
          </Text>
          <View style={styles.missionMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(mission.difficulty) + '20' }]}>
              <Text style={[styles.difficultyText, { color: getDifficultyColor(mission.difficulty) }]}>
                {mission.difficulty === 'easy' ? 'Fácil' : mission.difficulty === 'medium' ? 'Media' : 'Difícil'}
              </Text>
            </View>
            <Text style={[styles.xpBadge, { color: COLORS.accent }]}>
              +{mission.xp} XP
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  statsCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  levelBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  xpText: {
    fontSize: 18,
    fontWeight: '700',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  missionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  missionCardCompleted: {
    opacity: 0.6,
  },
  missionLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  missionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  missionIconCompleted: {
    backgroundColor: COLORS.success + '20',
  },
  missionInfo: {
    flex: 1,
  },
  missionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  missionTitleCompleted: {
    textDecorationLine: 'line-through',
  },
  missionDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  missionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 11,
    fontWeight: '600',
  },
  xpBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
});
