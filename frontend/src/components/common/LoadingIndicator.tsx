import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'large';
}

export default function LoadingIndicator({ message, size = 'large' }: LoadingIndicatorProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={COLORS.primary} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center'
  }
});
