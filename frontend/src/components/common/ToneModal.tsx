import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, TONES } from '../../constants';
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
            <Text style={styles.title}>Selecciona tu Tono Preferido</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text.primary} />
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
                    <MaterialCommunityIcons name="check-circle" size={24} color={COLORS.primary} />
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  container: {
    backgroundColor: COLORS.background.light,
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
    borderBottomColor: '#E5E7EB'
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary
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
    borderColor: 'transparent'
  },
  toneItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF1F7'
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
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4
  },
  toneLabelSelected: {
    color: COLORS.primary
  },
  toneDescription: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18
  }
});
