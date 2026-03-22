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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TYPOGRAPHY } from '../../core/constants';
import { useAppStore } from '../../store/appStore';
import { useChatStore } from '../../store/chatStore';
import { useStrings } from '../../core/i18n/useStrings';
import { container } from '../../infrastructure/di/Container';
import SuggestionCard from '../../components/common/SuggestionCard';
import CulturalStylePicker from '../../components/common/CulturalStylePicker';
import ToneSelector from '../../components/common/ToneSelector';
import BouncingDotsLoader from '../../components/common/BouncingDotsLoader';
import NeonButton from '../../components/common/NeonButton';
import type { OpenerSuggestion, ResponseSuggestion } from '../../types';

type Mode = 'openers' | 'responses';

export default function ChatScreen() {
  const s = useStrings();
  const { culturalStyle, setCulturalStyle, defaultTone, setDefaultTone } = useAppStore();
  const { isGenerating, setIsGenerating, setError } = useChatStore();

  const [mode, setMode] = useState<Mode>('openers');
  const [inputText, setInputText] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.headerTitle}>{s.chat.title}</Text>
            <View style={styles.amberDot} />
          </View>
          <Text style={styles.headerSubtitle}>{s.chat.subtitle}</Text>
        </View>

        {/* Mode Toggle — solid pill tabs */}
        <View style={styles.modeWrapper}>
          <View style={styles.modeContainer}>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'openers' && styles.modeTabActive]}
              onPress={() => setMode('openers')}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeTabText, mode === 'openers' && styles.modeTabTextActive]}>
                {s.chat.modeOpeners}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === 'responses' && styles.modeTabActive]}
              onPress={() => setMode('responses')}
              activeOpacity={0.8}
            >
              <Text style={[styles.modeTabText, mode === 'responses' && styles.modeTabTextActive]}>
                {s.chat.modeResponses}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cultural Style Picker */}
        <CulturalStylePicker selectedStyle={culturalStyle} onSelect={setCulturalStyle} />

        {/* Tone Selector */}
        <ToneSelector selectedTone={defaultTone} onSelect={setDefaultTone} />

        {/* Input + Button */}
        <View style={styles.inputSection}>
          <TextInput
            style={[styles.input, inputFocused && styles.inputFocused]}
            placeholder={mode === 'openers' ? s.chat.placeholderOpeners : s.chat.placeholderResponses}
            placeholderTextColor={COLORS.text.muted}
            value={inputText}
            onChangeText={setInputText}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            editable={!isGenerating}
          />

          <NeonButton
            label={isGenerating ? s.chat.generating : s.chat.generateBtn}
            onPress={handleGenerate}
            disabled={isGenerating || !inputText.trim()}
            loading={isGenerating}
            leftIcon={
              !isGenerating ? (
                <MaterialCommunityIcons name="magic-staff" size={18} color={COLORS.text.onBrand} />
              ) : undefined
            }
          />
        </View>

        {/* Suggestions */}
        <ScrollView style={styles.suggestionsContainer} showsVerticalScrollIndicator={false}>
          {isGenerating && (
            <BouncingDotsLoader message="Generating culturally-adapted suggestions..." />
          )}

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
                  onRegenerate={handleGenerate}
                />
              ))}
            </View>
          )}

          {!isGenerating && suggestions.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconWrapper}>
                <MaterialCommunityIcons
                  name={mode === 'openers' ? 'message-plus-outline' : 'message-reply-text-outline'}
                  size={40}
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text.primary,
    letterSpacing: -0.5,
  },
  amberDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 4,
  },
  headerSubtitle: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 3,
  },
  modeWrapper: {
    paddingHorizontal: 24,
    marginBottom: 8,
  },
  modeContainer: {
    flexDirection: 'row',
    backgroundColor: '#1E1916',
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTabActive: {
    backgroundColor: COLORS.primary,
  },
  modeTabText: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.muted,
  },
  modeTabTextActive: {
    color: COLORS.text.onBrand,
    fontWeight: '700',
  },
  inputSection: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  input: {
    backgroundColor: '#1E1916',
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.12)',
    borderRadius: 14,
    padding: 16,
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 15,
    color: COLORS.text.primary,
    minHeight: 96,
  },
  inputFocused: {
    borderColor: COLORS.primary,
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
    fontFamily: TYPOGRAPHY.fontFamily.bold,
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
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(245,158,11,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(245,158,11,0.20)',
  },
  emptyTitle: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  emptyDescription: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});
