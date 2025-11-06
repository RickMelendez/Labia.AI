import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import NeonButton from '../../components/common/NeonButton';
import { COLORS } from '../../core/constants';
import { useAssistant } from '../../presentation/hooks/useAssistant';
import { useAppStore } from '../../store/appStore';

export default function AssistantScreen() {
  const { culturalStyle } = useAppStore();
  const { suggestions, isLoading, assist, clear } = useAssistant();
  const [query, setQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={[COLORS.background.light, '#FFF7FB']} style={styles.background} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
      <View style={styles.header}>
        <Text style={styles.title}>Asistente</Text>
        <Text style={styles.subtitle}>Consejos, ideas y reescrituras adaptadas a tu estilo</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.label}>¿En qué te ayudo?</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Quiero responderle con algo genuino y coqueto sobre su foto en la playa"
          placeholderTextColor={COLORS.text.tertiary}
          value={query}
          onChangeText={setQuery}
          multiline
        />

        <NeonButton
          label={isLoading ? 'Pensando…' : 'Pedir Ayuda'}
          onPress={() => assist(query, culturalStyle, 'coach')}
          disabled={isLoading || !query.trim()}
          leftIcon={<MaterialCommunityIcons name={isLoading ? 'robot' : 'lightbulb-on'} size={22} color="#FFF" />}
        />

        {suggestions.length > 0 && (
          <View style={styles.results}>
            <Text style={styles.resultsTitle}>Sugerencias</Text>
            {suggestions.map((s, i) => (
              <View key={i} style={styles.resultCard}>
                <Text style={styles.resultText}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  background: { ...StyleSheet.absoluteFillObject as any, zIndex: -1 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '800', color: COLORS.text.primary },
  subtitle: { fontSize: 14, color: COLORS.text.secondary },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 16 },
  label: { fontSize: 14, fontWeight: '600', color: COLORS.text.primary },
  input: {
    backgroundColor: COLORS.surface.light,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.text.primary,
    minHeight: 100,
  },
  results: { marginTop: 16 },
  resultsTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text.primary, marginBottom: 8 },
  resultCard: {
    backgroundColor: COLORS.surface.light,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.shadow.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  resultText: { fontSize: 15, color: COLORS.text.primary, lineHeight: 22 },
});

