import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { OnboardingStackParamList, Tone } from '../../types';
import { COLORS, TONES, STORAGE_KEYS } from '../../constants';
import { useAppStore } from '../../store/appStore';
import ToneSelector from '../../components/common/ToneSelector';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ProfileSetup'>;

export default function ProfileSetupScreen({ navigation }: Props) {
  const { defaultTone, setDefaultTone } = useAppStore();
  const [selectedTone, setSelectedTone] = useState<Tone>(defaultTone);
  const [interests, setInterests] = useState('');

  const handleComplete = async () => {
    setDefaultTone(selectedTone);
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');

    // Navigate to main app - need to use navigation.getParent() to access RootNavigator
    navigation.getParent()?.navigate('Main');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Personaliza tu experiencia</Text>
          <Text style={styles.subtitle}>
            Esto nos ayudará a generar mejores sugerencias para ti
          </Text>
        </View>

        {/* Tone Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>¿Cuál es tu estilo preferido?</Text>
          <ToneSelector selectedTone={selectedTone} onSelect={setSelectedTone} />
        </View>

        {/* Interests (Optional) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Intereses (opcional)
          </Text>
          <Text style={styles.sectionSubtitle}>
            Ej: música, deportes, viajes, comida, tecnología
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Escribe tus intereses separados por comas..."
            value={interests}
            onChangeText={setInterests}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Puedes cambiar estas preferencias en cualquier momento desde tu perfil
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleComplete}>
          <LinearGradient colors={COLORS.gradient.primary} style={styles.completeButton}>
            <Text style={styles.completeText}>Comenzar a usar Labia.AI</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.light
  },
  content: {
    flex: 1,
    paddingHorizontal: 24
  },
  header: {
    paddingTop: 20,
    paddingBottom: 24
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text.primary,
    marginBottom: 8
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
    lineHeight: 24
  },
  section: {
    marginBottom: 32
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 8
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
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
    minHeight: 100
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  completeButton: {
    paddingVertical: 16,
    borderRadius: 28,
    alignItems: 'center'
  },
  completeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF'
  }
});
