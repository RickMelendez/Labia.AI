import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TONES, TYPOGRAPHY } from '../../core/constants';
import { Tone } from '../../types';

interface ToneSelectorProps {
  selectedTone: Tone;
  onSelect: (tone: Tone) => void;
}

export default function ToneSelector({ selectedTone, onSelect }: ToneSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tono de Conversación</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {TONES.map((tone) => {
          const isSelected = selectedTone === tone.value;
          
          if (isSelected) {
            return (
              <TouchableOpacity key={tone.value} onPress={() => onSelect(tone.value)}>
                <LinearGradient
                  colors={COLORS.gradient.magicButton as any}
                  style={[styles.toneChip, styles.toneChipSelected]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.iconSelected}>{tone.icon}</Text>
                  <Text style={styles.labelSelected}>{tone.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            );
          }
          
          return (
            <TouchableOpacity key={tone.value} onPress={() => onSelect(tone.value)}>
              <View style={styles.toneChip}>
                <Text style={styles.icon}>{tone.icon}</Text>
                <Text style={styles.label}>{tone.label}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,        // Poppins Bold
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text.strong,
    marginBottom: 12,
    paddingHorizontal: 16,
    letterSpacing: 0.3,
  },
  scrollView: {
    paddingHorizontal: 16
  },
  toneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginRight: 10,
    backgroundColor: COLORS.surface.light,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    shadowColor: COLORS.shadow.lavendar,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  toneChipSelected: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 6,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
    color: COLORS.text.body,
  },
  iconSelected: {
    fontSize: 18,
    marginRight: 8,
    color: COLORS.text.onBrand,
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,   // Poppins SemiBold
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.body,
    letterSpacing: 0.2,
  },
  labelSelected: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,       // Poppins Bold
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text.onBrand,
    letterSpacing: 0.3,
  }
});
