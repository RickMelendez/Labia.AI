import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Text } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../../core/constants';

interface BouncingDotsLoaderProps {
  message?: string;
  size?: number;
  color?: string;
}

function Dot({ delay, size, color }: { delay: number; size: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(600 - delay),
      ])
    ).start();
  }, []);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] });
  const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    />
  );
}

export default function BouncingDotsLoader({
  message,
  size = 10,
  color = COLORS.primary,
}: BouncingDotsLoaderProps) {
  return (
    <View style={styles.container}>
      <View style={styles.dotsRow}>
        <Dot delay={0}   size={size} color={color} />
        <Dot delay={150} size={size} color={color} />
        <Dot delay={300} size={size} color={color} />
      </View>
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dot: {
    // sized dynamically
  },
  message: {
    fontFamily: TYPOGRAPHY.fontFamily.regular,
    fontSize: 13,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});
