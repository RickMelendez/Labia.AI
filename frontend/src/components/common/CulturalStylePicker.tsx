import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, CULTURAL_STYLES } from '../../constants';
import { CulturalStyle } from '../../types';

interface CulturalStylePickerProps {
  selectedStyle: CulturalStyle;
  onSelect: (style: CulturalStyle) => void;
}

export default function CulturalStylePicker({ selectedStyle, onSelect }: CulturalStylePickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estilo Cultural</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {CULTURAL_STYLES.map((style) => {
          const isSelected = selectedStyle === style.value;
          return (
            <TouchableOpacity
              key={style.value}
              style={[styles.styleCard, isSelected && styles.styleCardSelected]}
              onPress={() => onSelect(style.value)}
            >
              <Text style={styles.flag}>{style.flag}</Text>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>{style.label}</Text>
              <Text style={styles.description}>{style.description}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
    paddingHorizontal: 16
  },
  scrollView: {
    paddingHorizontal: 16
  },
  styleCard: {
    width: 160,
    padding: 16,
    marginRight: 12,
    backgroundColor: COLORS.background.light,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center'
  },
  styleCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF1F7'
  },
  flag: {
    fontSize: 32,
    marginBottom: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4
  },
  labelSelected: {
    color: COLORS.primary
  },
  description: {
    fontSize: 11,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 14
  }
});
