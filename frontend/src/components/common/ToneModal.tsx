import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TONES, TYPOGRAPHY } from '../../core/constants';
import { Tone } from '../../types';

interface ToneModalProps {
  visible: boolean;
  selectedTone: Tone;
  onSelect: (tone: Tone) => void;
  onClose: () => void;
}

export default function ToneModal({
  visible,
  selectedTone,
  onSelect,
  onClose
}: ToneModalProps) {
  const handleSelect = (tone: Tone) => {
    onSelect(tone);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Selecciona Tu Tono Preferido</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text.strong} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {TONES.map((tone) => {
              const isSelected = selectedTone === tone.value;
              return (
                <TouchableOpacity
                  key={tone.value}
                  style={[styles.toneItem, isSelected && styles.toneItemSelected]}
                  onPress={() => handleSelect(tone.value)}
                >
                  <View style={styles.toneLeft}>
                    <Text style={styles.icon}>{tone.icon}</Text>
                    <View style={styles.toneInfo}>
                      <Text style={[styles.toneLabel, isSelected && styles.toneLabelSelected]}>
                        {tone.label}
                      </Text>
                      <Text style={styles.toneDescription}>{tone.description}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.brand} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 27, 78, 0.6)',
    justifyContent: 'flex-end'
  },
  container: {
    backgroundColor: COLORS.surface.light,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  title: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,        // Poppins Bold
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.strong,
  },
  closeButton: {
    padding: 4
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16
  },
  toneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.surface.light,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: COLORS.border.light,
  },
  toneItemSelected: {
    borderColor: COLORS.brand,
    backgroundColor: COLORS.brand50,
  },
  toneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  icon: {
    fontSize: 32,
    marginRight: 12
  },
  toneInfo: {
    flex: 1
  },
  toneLabel: {
    fontFamily: TYPOGRAPHY.fontFamily.semibold,   // Poppins SemiBold
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.strong,
    marginBottom: 4
  },
  toneLabelSelected: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,       // Poppins Bold
    color: COLORS.brand,
    fontWeight: '700',
  },
  toneDescription: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,    // Poppins Regular
    fontSize: 13,
    color: COLORS.text.muted,
    lineHeight: 18
  }
});
