import React, { useEffect, useRef } from 'react';
import { View, Animated, Text, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../core/constants';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'large';
}

export default function LoadingIndicator({ message }: LoadingIndicatorProps) {
  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const mk = (v: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(v, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(v, { toValue: 0, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    mk(a1, 0); mk(a2, 150); mk(a3, 300);
  }, [a1, a2, a3]);

  const dot = (anim: Animated.Value) => (
    <Animated.View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.primary,
        marginHorizontal: 5,
        transform: [{ scale: anim.interpolate({ inputRange: [0,1], outputRange: [0.8, 1.3] }) }],
        opacity: anim.interpolate({ inputRange: [0,1], outputRange: [0.6, 1] }),
        shadowColor: COLORS.accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 6,
      }}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>{dot(a1)}{dot(a2)}{dot(a3)}</View>
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
    fontFamily: TYPOGRAPHY.fontFamily.medium,      // Poppins Medium
    marginTop: 12,
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center'
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }
});
