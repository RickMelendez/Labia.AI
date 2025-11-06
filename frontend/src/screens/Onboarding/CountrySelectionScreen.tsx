import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import NeonButton from '../../components/common/NeonButton';
import AppBackground from '../../components/common/AppBackground';
import { OnboardingStackParamList, CulturalStyle } from '../../types';
import { COLORS, CULTURAL_STYLES } from '../../core/constants';
import { useAppStore } from '../../store/appStore';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'CountrySelection'>;

export default function CountrySelectionScreen({ navigation }: Props) {
  const { culturalStyle, setCulturalStyle } = useAppStore();
  const [selectedStyle, setSelectedStyle] = useState<CulturalStyle>(culturalStyle);

  const handleContinue = () => {
    setCulturalStyle(selectedStyle);
    navigation.navigate('ProfileSetup');
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppBackground />
      <View style={styles.header}>
        <Text style={styles.title}>¿De dónde eres?</Text>
        <Text style={styles.subtitle}>
          Selecciona tu país para adaptar el estilo de conversación
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {CULTURAL_STYLES.map((style) => {
          const isSelected = selectedStyle === style.value;
          return (
            <TouchableOpacity
              key={style.value}
              style={[styles.styleCard, isSelected && styles.styleCardSelected]}
              onPress={() => setSelectedStyle(style.value)}
            >
              <View style={styles.styleContent}>
                <Text style={styles.flag}>{style.flag}</Text>
                <View style={styles.styleInfo}>
                  <Text style={[styles.label, isSelected && styles.labelSelected]}>
                    {style.label}
                  </Text>
                  <Text style={styles.description}>{style.description}</Text>
                </View>
              </View>
              {isSelected && (
                <View style={styles.checkmark}>
                  <Text style={styles.checkmarkIcon}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <NeonButton onPress={handleContinue} disabled={!selectedStyle} label="Continuar" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  background: { ...StyleSheet.absoluteFillObject as any, zIndex: -1 },
  header: {
    paddingHorizontal: 24,
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
  content: {
    flex: 1,
    paddingHorizontal: 24
  },
  styleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    backgroundColor: COLORS.background.light,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB'
  },
  styleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF1F7'
  },
  styleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  flag: {
    fontSize: 40,
    marginRight: 16
  },
  styleInfo: {
    flex: 1
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 4
  },
  labelSelected: {
    color: COLORS.primary
  },
  description: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18
  },
  checkmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkmarkIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700'
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  
});
