import React from 'react';
import { Text, TouchableOpacity, StyleSheet, View, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../core/constants';

type NeonButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'primary' | 'danger' | 'ghost';
};

export default function NeonButton({
  label,
  onPress,
  disabled,
  loading,
  leftIcon,
  style,
  textStyle,
  variant = 'primary',
}: NeonButtonProps) {
  const isDisabled = disabled || loading;

  const bgColor = isDisabled
    ? '#2A2118'
    : variant === 'danger'
    ? COLORS.rose
    : variant === 'ghost'
    ? 'transparent'
    : COLORS.primary;

  const txtColor = isDisabled
    ? COLORS.text.muted
    : variant === 'ghost'
    ? COLORS.primary
    : variant === 'danger'
    ? '#FFFFFF'
    : COLORS.text.onBrand;   // dark text on amber

  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.8}
        style={[
          styles.button,
          { backgroundColor: bgColor },
          variant === 'ghost' && styles.ghostBorder,
          isDisabled && styles.disabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={txtColor} />
        ) : (
          <>
            {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
            <Text style={[styles.label, { color: txtColor }, textStyle]}>{label}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    shadowColor: COLORS.shadow.colored,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    shadowOpacity: 1,
    elevation: 6,
    borderRadius: 14,
  },
  button: {
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  ghostBorder: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  disabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  iconContainer: {
    marginRight: 2,
  },
  label: {
    fontFamily: TYPOGRAPHY.fontFamily.bold,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
