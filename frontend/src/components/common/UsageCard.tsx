import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { COLORS } from '../../constants';
import { UserPlan } from '../../types';

interface UsageCardProps {
  used: number;
  limit: number;
  plan: UserPlan;
}

export default function UsageCard({ used, limit, plan }: UsageCardProps) {
  const theme = useTheme();
  const percentage = limit === -1 ? 0 : (used / limit) * 100;
  const remaining = limit === -1 ? Infinity : limit - used;

  const getLimitColor = () => {
    if (limit === -1) return COLORS.accent;
    if (percentage >= 90) return COLORS.error;
    if (percentage >= 70) return '#F59E0B';
    return COLORS.success;
  };

  const getStatusText = () => {
    if (limit === -1) return 'Ilimitado';
    if (remaining === 0) return 'Límite alcanzado';
    if (remaining === 1) return '1 sugerencia restante';
    return `${remaining} sugerencias restantes`;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <MaterialCommunityIcons name="chart-donut" size={24} color={COLORS.primary} />
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>Uso Diario</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getLimitColor() }]}>
            {limit === -1 ? '∞' : `${used}/${limit}`}
          </Text>
          <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>
            Sugerencias
          </Text>
        </View>

        {limit !== -1 && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(percentage, 100)}%`, backgroundColor: getLimitColor() }
                ]}
              />
            </View>
            <Text style={[styles.statusText, { color: getLimitColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        )}

        {limit === -1 && (
          <Text style={[styles.unlimitedText, { color: theme.colors.onSurfaceVariant }]}>
            ✨ Plan Premium: Sugerencias ilimitadas
          </Text>
        )}
      </View>

      {plan === 'free' && percentage >= 80 && (
        <View style={[styles.warningBanner, { backgroundColor: '#FEF2F2' }]}>
          <MaterialCommunityIcons name="alert-circle" size={16} color={COLORS.error} />
          <Text style={[styles.warningText, { color: COLORS.error }]}>
            Te estás quedando sin sugerencias. Mejora a Pro para más.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  stats: {
    gap: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  unlimitedText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  warningText: {
    fontSize: 12,
    flex: 1,
  },
});
