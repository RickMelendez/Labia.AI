import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppStore } from '../../store/appStore';
import { COLORS } from '../../core/constants';

const { width, height } = Dimensions.get('window');

function FloatingParticle({ delay = 0, duration = 8000, size = 40, x = 0, color = 'lavendar' }: any) {
  const translateY = useRef(new Animated.Value(height + 100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const animate = () => {
      translateY.setValue(height + 100);
      opacity.setValue(0);
      scale.setValue(0.5);

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: duration,
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration - 2000,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start(() => animate());
    };

    animate();
  }, [delay, duration]);

  const particleColor = color === 'magic' ? COLORS.brand : COLORS.lavendar;

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          left: x,
          transform: [{ translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <View style={[styles.particleInner, { width: size, height: size, backgroundColor: particleColor }]} />
    </Animated.View>
  );
}

export default function AppBackground() {
  const isDark = useAppStore((s) => s.isDarkMode);

  if (isDark) {
    return (
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={COLORS.gradient.night as any}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>
    );
  }

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <LinearGradient
        colors={COLORS.gradient.dreamy as any}
        style={styles.dreamyBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />
      
      <View style={styles.orbContainer}>
        <LinearGradient
          colors={['rgba(244, 146, 240, 0.3)', 'transparent']}
          style={[styles.orb, styles.orb1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(94, 66, 156, 0.2)', 'transparent']}
          style={[styles.orb, styles.orb2]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
        <LinearGradient
          colors={['rgba(183, 148, 246, 0.25)', 'transparent']}
          style={[styles.orb, styles.orb3]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </View>

      <FloatingParticle delay={0} duration={12000} size={60} x={width * 0.1} color="lavendar" />
      <FloatingParticle delay={2000} duration={15000} size={40} x={width * 0.3} color="magic" />
      <FloatingParticle delay={4000} duration={10000} size={50} x={width * 0.6} color="lavendar" />
      <FloatingParticle delay={6000} duration={13000} size={45} x={width * 0.8} color="magic" />
      <FloatingParticle delay={1000} duration={14000} size={35} x={width * 0.5} color="lavendar" />
      <FloatingParticle delay={3000} duration={11000} size={55} x={width * 0.2} color="magic" />

      <LinearGradient
        colors={['rgba(244, 146, 240, 0.15)', 'transparent']}
        style={styles.topGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <LinearGradient
        colors={['transparent', 'rgba(94, 66, 156, 0.12)']}
        style={styles.bottomGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <View style={styles.heartsPattern}>
        {[...Array(15)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.heart,
              {
                left: (i * 17 + 5) % 95 + '%',
                top: (i * 23 + 10) % 90 + '%',
                opacity: (i % 2 === 0) ? 0.03 : 0.05,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dreamyBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  orbContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  orb: {
    position: 'absolute',
    borderRadius: 9999,
  },
  orb1: {
    width: 400,
    height: 400,
    top: -100,
    right: -100,
  },
  orb2: {
    width: 350,
    height: 350,
    bottom: -80,
    left: -80,
  },
  orb3: {
    width: 300,
    height: 300,
    top: height * 0.4,
    right: -50,
  },
  particle: {
    position: 'absolute',
  },
  particleInner: {
    borderRadius: 9999,
    opacity: 0.2,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  heartsPattern: {
    ...StyleSheet.absoluteFillObject,
  },
  heart: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: COLORS.lavendar,
    transform: [{ rotate: '45deg' }],
    borderRadius: 3,
  },
});
