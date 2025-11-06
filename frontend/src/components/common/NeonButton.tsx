import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, TYPOGRAPHY } from '../../core/constants';

type NeonButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

export default function NeonButton({ label, onPress, disabled, leftIcon, style, textStyle }: NeonButtonProps) {
  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity 
        onPress={onPress} 
        disabled={disabled} 
        activeOpacity={0.8}
        style={styles.touchable}
      >
        <LinearGradient
          colors={disabled ? ['#9CA3AF', '#6B7280'] : COLORS.gradient.magicButton}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.button, disabled && styles.buttonDisabled]}
        >
          {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
          <Text style={[styles.label, textStyle]}>{label}</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    shadowColor: COLORS.brand,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    shadowOpacity: 0.5,
    elevation: 10,
    borderRadius: 24,
  },
  touchable: {
    borderRadius: 24,
  },
  button: {
    minHeight: 56,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    marginRight: 8,
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,       // Poppins Bold
    color: COLORS.text.onBrand,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
