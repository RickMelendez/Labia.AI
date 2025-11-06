import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { COLORS, CULTURAL_STYLES, TYPOGRAPHY } from '../../core/constants';
import { CulturalStyle } from '../../types';

interface CulturalStylePickerProps {
  selectedStyle: CulturalStyle;
  onSelect: (style: CulturalStyle) => void;
}

export default function CulturalStylePicker({ selectedStyle, onSelect }: CulturalStylePickerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Estilo Cultural</Text>
      <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {CULTURAL_STYLES.map((style) => {
          const isSelected = selectedStyle === style.value;
          return (
            <TouchableOpacity key={style.value} onPress={() => onSelect(style.value)}>
              <View
                style={[
                  styles.styleCard, 
                  isSelected && styles.styleCardSelected
                ]}
              >
                <Text style={styles.flag}>{style.flag}</Text>
                <Text style={[
                  styles.label,
                  isSelected && styles.labelSelected
                ]}>
                  {style.label}
                </Text>
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
    marginVertical: 16
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,        // Poppins Bold
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.strong,
    marginBottom: 12,
    paddingHorizontal: 16
  },
  scrollView: {
    paddingHorizontal: 16
  },
  styleCard: {
    minWidth: 110,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: COLORS.surface.light,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.border.light,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow.lavendar,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 3
  },
  styleCardSelected: {
    borderWidth: 3,
    borderColor: COLORS.brand,
    backgroundColor: COLORS.brand50,
  },
  flag: {
    fontSize: 28,
    marginBottom: 6
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,   // Poppins SemiBold
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text.strong,
    textAlign: 'center'
  },
  labelSelected: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,       // Poppins Bold
    color: COLORS.brand,
    fontWeight: '700',
  }
});
