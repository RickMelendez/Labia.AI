import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface OrbProps {
  size: number;
  x: number;
  y: number;
  color: string;
  delay?: number;
}

function FloatingOrb({ size, x, y, color, delay = 0 }: OrbProps) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: 1,  duration: 7000 + delay * 500, useNativeDriver: true }),
        Animated.timing(drift, { toValue: -1, duration: 7000 + delay * 500, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0,  duration: 5000,               useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = drift.interpolate({ inputRange: [-1, 0, 1], outputRange: [-20, 0, 20] });
  const translateX = drift.interpolate({ inputRange: [-1, 0, 1], outputRange: [-12, 0, 12] });

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width:  size,
          height: size,
          left:   x - size / 2,
          top:    y - size / 2,
          borderRadius: size / 2,
          transform: [{ translateY }, { translateX }],
        },
      ]}
    >
      <LinearGradient
        colors={[color, 'transparent']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.3, y: 0.3 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
}

export default function AppBackground() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {/* Warm dark base — deep purple at top, near-black below */}
      <LinearGradient
        colors={['#1A0530', '#0D0B0A', '#0D0B0A']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {/* Purple glow bloom at top-center */}
      <View style={styles.topGlow} />
      {/* Floating nebula orbs — violet & rose tones */}
      <FloatingOrb size={400} x={width * 0.5}  y={height * 0.08} color="rgba(168,85,247,0.14)"  delay={0} />
      <FloatingOrb size={300} x={width * 0.85} y={height * 0.28} color="rgba(168,85,247,0.08)"  delay={1} />
      <FloatingOrb size={260} x={width * 0.1}  y={height * 0.55} color="rgba(236,72,153,0.07)"  delay={2} />
      <FloatingOrb size={220} x={width * 0.7}  y={height * 0.72} color="rgba(168,85,247,0.06)"  delay={3} />
      {/* Subtle star field */}
      <View style={styles.starField}>
        {[...Array(24)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.star,
              {
                left:    ((i * 1619) % 97) / 100 * width,
                top:     ((i * 2333) % 93) / 100 * height,
                opacity: i % 3 === 0 ? 0.35 : 0.15,
                width:   i % 5 === 0 ? 2 : 1,
                height:  i % 5 === 0 ? 2 : 1,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    overflow: 'hidden',
  },
  topGlow: {
    position: 'absolute',
    top: -120,
    left: width * 0.5 - 160,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(168,85,247,0.18)',
  },
  starField: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
});
