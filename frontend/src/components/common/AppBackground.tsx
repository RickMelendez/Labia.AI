import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/appStore';

const { width, height } = Dimensions.get('window');

// ---- Floating orb for dark mode atmosphere ----
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
        Animated.timing(drift, { toValue: 1,  duration: 6000 + delay * 400, useNativeDriver: true }),
        Animated.timing(drift, { toValue: -1, duration: 6000 + delay * 400, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0,  duration: 4000,               useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = drift.interpolate({ inputRange: [-1, 0, 1], outputRange: [-18, 0, 18] });
  const translateX = drift.interpolate({ inputRange: [-1, 0, 1], outputRange: [-10, 0, 10] });

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

// ---- Light mode particles ----
function FloatingParticle({ delay = 0, duration = 8000, size = 40, x = 0, color = '#f492f0' }: any) {
  const translateY = useRef(new Animated.Value(height + 100)).current;
  const opacity    = useRef(new Animated.Value(0)).current;
  const scale      = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(height + 100);
      opacity.setValue(0);
      scale.setValue(0.5);
      Animated.parallel([
        Animated.timing(translateY, { toValue: -100, duration, delay, useNativeDriver: true }),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0.7,              duration: 1000,            useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,                duration: duration - 2000, useNativeDriver: true }),
        ]),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      ]).start(() => animate());
    };
    animate();
  }, [delay, duration]);

  return (
    <Animated.View style={[styles.particle, { left: x, transform: [{ translateY }, { scale }], opacity }]}>
      <View style={[styles.particleInner, { width: size, height: size, backgroundColor: color }]} />
    </Animated.View>
  );
}

// ---- Main component ----

export default function AppBackground() {
  const isDark = useAppStore((s) => s.isDarkMode);

  if (isDark) {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        {/* Deep space base */}
        <LinearGradient
          colors={['#05030E', '#0D0820', '#090518']}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0.2, y: 0 }}
          end={{ x: 0.8, y: 1 }}
        />
        {/* Nebula orbs */}
        <FloatingOrb size={380} x={width * 0.85} y={height * 0.15} color="rgba(94,66,156,0.18)"  delay={0} />
        <FloatingOrb size={320} x={width * 0.1}  y={height * 0.55} color="rgba(183,148,246,0.10)" delay={1} />
        <FloatingOrb size={260} x={width * 0.7}  y={height * 0.75} color="rgba(244,146,240,0.08)" delay={2} />
        <FloatingOrb size={200} x={width * 0.35} y={height * 0.3}  color="rgba(122,93,184,0.12)"  delay={3} />
        {/* Subtle star shimmer overlay */}
        <View style={styles.starField}>
          {[...Array(20)].map((_, i) => (
            <View
              key={i}
              style={[
                styles.star,
                {
                  left:    ((i * 1619) % 97) / 100 * width,
                  top:     ((i * 2333) % 93) / 100 * height,
                  opacity: ((i % 3 === 0) ? 0.4 : 0.2),
                  width:   i % 4 === 0 ? 2 : 1,
                  height:  i % 4 === 0 ? 2 : 1,
                },
              ]}
            />
          ))}
        </View>
      </View>
    );
  }

  // ---- Light mode — dreamy lavender ----
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={['#fce8fb', '#f7b3f5', '#f492f0']}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <LinearGradient
        colors={['rgba(94,66,156,0.2)', 'transparent']}
        style={[styles.lightOrb, { top: -100, right: -100 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <LinearGradient
        colors={['rgba(244,146,240,0.3)', 'transparent']}
        style={[styles.lightOrb, { bottom: -80, left: -80 }]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      <FloatingParticle delay={0}    duration={12000} size={60} x={width * 0.1} color="#f492f0" />
      <FloatingParticle delay={2000} duration={15000} size={40} x={width * 0.3} color="#5e429c" />
      <FloatingParticle delay={4000} duration={10000} size={50} x={width * 0.6} color="#f492f0" />
      <FloatingParticle delay={6000} duration={13000} size={45} x={width * 0.8} color="#5e429c" />
    </View>
  );
}

const styles = StyleSheet.create({
  orb: {
    position: 'absolute',
    overflow: 'hidden',
  },
  starField: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  particle: {
    position: 'absolute',
  },
  particleInner: {
    borderRadius: 9999,
    opacity: 0.2,
  },
  lightOrb: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
  },
});
