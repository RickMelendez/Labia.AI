import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, CULTURAL_STYLES } from '../../core/constants';
import { CulturalStyle } from '../../types';

interface CulturalStyleModalProps {
  visible: boolean;
  selectedStyle: CulturalStyle;
  onSelect: (style: CulturalStyle) => void;
  onClose: () => void;
}

export default function CulturalStyleModal({
  visible,
  selectedStyle,
  onSelect,
  onClose
}: CulturalStyleModalProps) {
  const handleSelect = (style: CulturalStyle) => {
    onSelect(style);
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
            <Text style={styles.title}>Selecciona tu Estilo Cultural</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {CULTURAL_STYLES.map((style) => {
              const isSelected = selectedStyle === style.value;
              return (
                <TouchableOpacity
                  key={style.value}
                  style={[styles.styleItem, isSelected && styles.styleItemSelected]}
                  onPress={() => handleSelect(style.value)}
                >
                  <View style={styles.styleLeft}>
                    <Text style={styles.flag}>{style.flag}</Text>
                    <View style={styles.styleInfo}>
                      <Text style={[styles.styleLabel, isSelected && styles.styleLabelSelected]}>
                        {style.label}
                      </Text>
                      <Text style={styles.styleDescription}>{style.description}</Text>
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
    maxHeight: '80%',
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
  styleItem: {
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
  styleItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF1F7'
  },
  styleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  flag: {
    fontSize: 32,
    marginRight: 12
  },
  styleInfo: {
    flex: 1
  },
  styleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4
  },
  styleLabelSelected: {
    color: COLORS.primary
  },
  styleDescription: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18
  }
});
