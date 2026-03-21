import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../core/constants';
import { useAppStore } from '../../store/appStore';
import { useChatStore } from '../../store/chatStore';
import { useStrings } from '../../core/i18n/useStrings';
import { container } from '../../infrastructure/di/Container';
import SuggestionCard from '../../components/common/SuggestionCard';
import CulturalStylePicker from '../../components/common/CulturalStylePicker';
import ToneSelector from '../../components/common/ToneSelector';
import LoadingIndicator from '../../components/common/LoadingIndicator';
import type { OpenerSuggestion, ResponseSuggestion } from '../../types';

type Mode = 'openers' | 'responses';

export default function ChatScreen() {
  const s = useStrings();
  const { culturalStyle, setCulturalStyle, defaultTone, setDefaultTone } = useAppStore();
  const { isGenerating, setIsGenerating, setError } = useChatStore();

  const [mode, setMode] = useState<Mode>('openers');
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState<(OpenerSuggestion | ResponseSuggestion)[]>([]);

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      container.toast.error('Heads up', 'Enter some text to generate suggestions');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuggestions([]);

    try {
      if (mode === 'openers') {
        const response = await container.openerApi.generateOpeners({
          bio: inputText,
          cultural_style: culturalStyle,
          num_suggestions: 3,
        });
        setSuggestions(response.suggestions as any);
        container.toast.success('Done!', `${response.suggestions.length} ${s.chat.successOpeners}`);
      } else {
        const response = await container.responseApi.generateResponses({
          received_message: inputText,
          cultural_style: culturalStyle,
        });
        setSuggestions(response.suggestions as any);
        container.toast.success('Done!', `${response.suggestions.length} ${s.chat.successResponses}`);
      }
    } catch (error: any) {
      console.error('Error generating suggestions:', error);
      setError(error.detail || s.chat.errorGenerate);
      container.toast.error('Error', error.detail || s.chat.errorGenerate);
    } finally {
      setIsGenerating(false);
    }
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
          <Text style={styles.headerTitle}>{s.chat.title}</Text>
          <Text style={styles.headerSubtitle}>{s.chat.subtitle}</Text>
        </View>

        {/* Mode Selector — dark pill tabs */}
        <View style={styles.modeSelectorWrapper}>
          <View style={styles.modeSelector}>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'openers' && styles.modeButtonActive]}
              onPress={() => setMode('openers')}
              activeOpacity={0.8}
            >
              {mode === 'openers' ? (
                <LinearGradient
                  colors={COLORS.gradient.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modeButtonGradient}
                >
                  <Text style={styles.modeTextActive}>{s.chat.modeOpeners}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.modeText}>{s.chat.modeOpeners}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeButton, mode === 'responses' && styles.modeButtonActive]}
              onPress={() => setMode('responses')}
              activeOpacity={0.8}
            >
              {mode === 'responses' ? (
                <LinearGradient
                  colors={COLORS.gradient.primary}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.modeButtonGradient}
                >
                  <Text style={styles.modeTextActive}>{s.chat.modeResponses}</Text>
                </LinearGradient>
              ) : (
                <Text style={styles.modeText}>{s.chat.modeResponses}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Cultural Style Picker */}
        <CulturalStylePicker selectedStyle={culturalStyle} onSelect={setCulturalStyle} />

        {/* Tone Selector */}
        <ToneSelector selectedTone={defaultTone} onSelect={setDefaultTone} />

        {/* Input Section */}
        <View style={styles.inputSection}>
          <TextInput
            style={styles.input}
            placeholder={mode === 'openers' ? s.chat.placeholderOpeners : s.chat.placeholderResponses}
            placeholderTextColor={COLORS.text.muted}
            value={inputText}
            onChangeText={setInputText}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isGenerating}
          />

          <TouchableOpacity
            onPress={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={isGenerating || !inputText.trim()
                ? ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.05)']
                : COLORS.gradient.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.generateButton}
            >
              <MaterialCommunityIcons
                name={isGenerating ? 'loading' : 'magic-staff'}
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.generateButtonText}>
                {isGenerating ? s.chat.generating : s.chat.generateBtn}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Suggestions */}
        <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
          {isGenerating && <LoadingIndicator message="Generating culturally-adapted suggestions..." />}

          {suggestions.length > 0 && (
            <View style={styles.suggestionsContent}>
              <Text style={styles.suggestionsTitle}>
                {mode === 'openers' ? 'Suggested Openers' : 'Suggested Responses'}
              </Text>
              {suggestions.map((suggestion, index) => (
                <SuggestionCard
                  key={index}
                  text={suggestion.text}
                  tone={suggestion.tone}
                  explanation={suggestion.explanation}
                  onCopy={() => {}}
                  onRegenerate={handleRegenerate}
                />
              ))}
            </View>
          )}

          {!isGenerating && suggestions.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <MaterialCommunityIcons
                  name={mode === 'openers' ? 'message-plus-outline' : 'message-reply-text-outline'}
                  size={48}
                  color={COLORS.primary}
                />
              </View>
              <Text style={styles.emptyTitle}>
                {mode === 'openers' ? 'Craft the perfect opener' : 'Find the right response'}
              </Text>
              <Text style={styles.emptyDescription}>
                {mode === 'openers'
                  ? 'Describe their profile or interests and get culturally-tuned openers'
                  : 'Paste the message they sent and get 3 response options with different vibes'}
              </Text>
            </View>
          )}
          {/* Bottom padding for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  modeSelectorWrapper: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface.dark,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  modeButtonActive: {},
  modeButtonGradient: {
    ...StyleSheet.absoluteFillObject as any,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.secondary,
  },
  modeTextActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  inputSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  input: {
    backgroundColor: COLORS.surface.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: 14,
    padding: 16,
    fontSize: 15,
    color: COLORS.text.primary,
    minHeight: 96,
    marginBottom: 12,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 28,
    gap: 8,
    shadowColor: COLORS.shadow.colored,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 8,
  },
  generateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  suggestionsContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  suggestionsContent: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface.tinted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border.lavendar,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyDescription: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
