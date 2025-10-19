import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants';

export default function TrainerScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={COLORS.gradient.accent} style={styles.header}>
        <Text style={styles.headerIcon}>🏆</Text>
        <Text style={styles.headerTitle}>Entrenador de Labia</Text>
        <Text style={styles.headerSubtitle}>Mejora tus habilidades de conversación</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.comingSoonContainer}>
          <Text style={styles.comingSoonIcon}>🚧</Text>
          <Text style={styles.comingSoonTitle}>Próximamente</Text>
          <Text style={styles.comingSoonDescription}>
            El módulo de entrenamiento estará disponible pronto con:
          </Text>

          <View style={styles.featuresList}>
            <FeatureItem icon="✨" text="Misiones diarias interactivas" />
            <FeatureItem icon="🎯" text="Ejercicios con situaciones reales" />
            <FeatureItem icon="📊" text="Sistema de puntos y logros" />
            <FeatureItem icon="🏅" text="Niveles: Rookie → Pro → Master" />
            <FeatureItem icon="🤖" text="Feedback personalizado de IA" />
            <FeatureItem icon="📈" text="Tracking de progreso" />
          </View>

          <Text style={styles.stayTuned}>
            ¡Mantente atento para convertirte en un maestro del flow!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 32,
    alignItems: 'center'
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: 8
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9
  },
  content: {
    flex: 1,
    paddingHorizontal: 24
  },
  comingSoonContainer: {
    alignItems: 'center',
    paddingVertical: 40
  },
  comingSoonIcon: {
    fontSize: 80,
    marginBottom: 16
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8
  },
  comingSoonDescription: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24
  },
  featuresList: {
    width: '100%',
    marginBottom: 24
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.surface.light,
    borderRadius: 12,
    marginBottom: 8
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 12
  },
  featureText: {
    fontSize: 16,
    color: COLORS.text.primary,
    flex: 1
  },
  stayTuned: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic'
  }
});
