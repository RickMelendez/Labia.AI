import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, TONES } from '../../constants';
import { Tone } from '../../types';

interface ToneSelectorProps {
  selectedTone: Tone;
  onSelect: (tone: Tone) => void;
}

export default function ToneSelector({ selectedTone, onSelect }: ToneSelectorProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tono</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {TONES.map((tone) => {
          const isSelected = selectedTone === tone.value;
          return (
            <TouchableOpacity
              key={tone.value}
              style={[styles.toneChip, isSelected && styles.toneChipSelected]}
              onPress={() => onSelect(tone.value)}
            >
              <Text style={styles.icon}>{tone.icon}</Text>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>{tone.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 8,
    paddingHorizontal: 16
  },
  scrollView: {
    paddingHorizontal: 16
  },
  toneChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'transparent'
  },
  toneChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  icon: {
    fontSize: 18,
    marginRight: 6
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary
  },
  labelSelected: {
    color: '#FFFFFF'
  }
});
