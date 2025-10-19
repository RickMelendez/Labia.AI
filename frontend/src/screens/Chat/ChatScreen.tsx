import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants';
import { useAppStore } from '../../store/appStore';
import { useChatStore } from '../../store/chatStore';
import { apiClient } from '../../services/api';
import SuggestionCard from '../../components/common/SuggestionCard';
import CulturalStylePicker from '../../components/common/CulturalStylePicker';
import ToneSelector from '../../components/common/ToneSelector';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import type { OpenerSuggestion, ResponseSuggestion } from '../../types';

type Mode = 'openers' | 'responses';

export default function ChatScreen() {
  const { culturalStyle, setCulturalStyle, defaultTone, setDefaultTone } = useAppStore();
  const { isGenerating, setIsGenerating, setError } = useChatStore();

  const [mode, setMode] = useState<Mode>('openers');
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<(OpenerSuggestion | ResponseSuggestion)[]>([]);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      Alert.alert('Atención', 'Por favor ingresa un texto para generar sugerencias');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuggestions([]);

    try {
      if (mode === 'openers') {
        const response = await apiClient.generateOpeners({
          bio: inputText,
          cultural_style: culturalStyle,
          num_suggestions: 3,
          include_follow_ups: true
        });
        setSuggestions(response.suggestions);
      } else {
        const response = await apiClient.generateResponses({
          message: inputText,
          cultural_style: culturalStyle,
          tone: defaultTone,
          relationship_stage: 'early'
        });
        setSuggestions(response.suggestions);
      }
    } catch (error: any) {
      console.error('Error generating suggestions:', error);
      setError(error.detail || 'Error al generar sugerencias');
      Alert.alert('Error', error.detail || 'No se pudo generar las sugerencias. Intenta nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    Alert.alert('Copiado', 'Texto copiado al portapapeles');
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <LinearGradient colors={COLORS.gradient.primary} style={styles.headerGradient}>
            <Text style={styles.headerTitle}>Labia.AI</Text>
            <Text style={styles.headerSubtitle}>Tu asistente de conversación</Text>
          </LinearGradient>
        </View>

        {/* Mode Selector */}
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'openers' && styles.modeButtonActive]}
            onPress={() => setMode('openers')}
          >
            <Text style={[styles.modeText, mode === 'openers' && styles.modeTextActive]}>
              Aperturas
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'responses' && styles.modeButtonActive]}
            onPress={() => setMode('responses')}
          >
            <Text style={[styles.modeText, mode === 'responses' && styles.modeTextActive]}>
              Respuestas
            </Text>
          </TouchableOpacity>
        </View>

        {/* Cultural Style Picker */}
        <CulturalStylePicker selectedStyle={culturalStyle} onSelect={setCulturalStyle} />

        {/* Tone Selector */}
        <ToneSelector selectedTone={defaultTone} onSelect={setDefaultTone} />

        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>
            {mode === 'openers'
              ? '¿Qué dice su bio o qué intereses tiene?'
              : '¿Qué mensaje recibiste?'}
          </Text>
          <TextInput
            style={styles.input}
            placeholder={
              mode === 'openers'
                ? 'Ej: Le gusta Bad Bunny, la playa, y los perritos...'
                : 'Ej: Hey! Qué tal? Vi que también te gusta el reggaetón...'
            }
            value={inputText}
            onChangeText={setInputText}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isGenerating}
          />

          <TouchableOpacity
            onPress={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
          >
            <LinearGradient
              colors={isGenerating || !inputText.trim() ? ['#D1D5DB', '#9CA3AF'] : COLORS.gradient.primary}
              style={styles.generateButton}
            >
              {isGenerating ? (
                <Text style={styles.generateButtonText}>Generando...</Text>
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>Generar Sugerencias</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Suggestions */}
        <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
          {isGenerating && <LoadingIndicator message="Generando sugerencias culturalmente adaptadas..." />}

          {suggestions.length > 0 && (
            <View style={styles.suggestionsContent}>
              <Text style={styles.suggestionsTitle}>
                {mode === 'openers' ? 'Aperturas Sugeridas' : 'Respuestas Sugeridas'}
              </Text>
              {suggestions.map((suggestion, index) => (
                <SuggestionCard
                  key={index}
                  text={suggestion.text}
                  tone={suggestion.tone}
                  explanation={suggestion.explanation}
                  onCopy={handleCopy}
                  onRegenerate={handleRegenerate}
                />
              ))}
            </View>
          )}

          {!isGenerating && suggestions.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>💬</Text>
              <Text style={styles.emptyTitle}>
                {mode === 'openers' ? 'Crea Aperturas Épicas' : 'Genera Respuestas Inteligentes'}
              </Text>
              <Text style={styles.emptyDescription}>
                {mode === 'openers'
                  ? 'Ingresa la bio o intereses de la persona y te ayudaré a crear mensajes iniciales irresistibles'
                  : 'Ingresa el mensaje que recibiste y te daré 3 opciones de respuesta con diferentes tonos'}
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light
  },
  keyboardView: {
    flex: 1
  },
  header: {
    overflow: 'hidden'
  },
  headerGradient: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    alignItems: 'center'
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
  modeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface.light,
    alignItems: 'center'
  },
  modeButtonActive: {
    backgroundColor: COLORS.primary
  },
  modeText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary
  },
  modeTextActive: {
    color: '#FFFFFF'
  },
  inputSection: {
    paddingHorizontal: 24,
    paddingVertical: 16
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 12
  },
  input: {
    backgroundColor: COLORS.surface.light,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    minHeight: 100,
    marginBottom: 16
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    gap: 8
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF'
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: 24
  },
  suggestionsContent: {
    paddingBottom: 24
  },
  suggestionsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 16
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20
  }
});
