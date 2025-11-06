import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import NeonButton from '../../components/common/NeonButton';
import AppBackground from '../../components/common/AppBackground';
import { OnboardingStackParamList } from '../../types';
import { COLORS } from '../../core/constants';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Tutorial'>;

const { width } = Dimensions.get('window');

const TUTORIAL_SLIDES = [
  {
    id: '1',
    icon: '✨',
    title: 'Genera Aperturas Épicas',
    description: 'Crea mensajes iniciales irresistibles adaptados a cada perfil y cultura.'
  },
  {
    id: '2',
    icon: '💬',
    title: 'Respuestas Inteligentes',
    description: 'Mantén conversaciones fluidas con sugerencias personalizadas y culturalmente apropiadas.'
  },
  {
    id: '3',
    icon: '🇵🇷🇲🇽🇨🇴',
    title: '5 Estilos Culturales',
    description: 'Puerto Rico, México, Colombia, Argentina, España - habla con autenticidad.'
  }
];

export default function TutorialScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleNext = () => {
    if (currentIndex < TUTORIAL_SLIDES.length - 1) {
      const nextIndex = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex });
      setCurrentIndex(nextIndex);
    } else {
      navigation.replace('CountrySelection');
    }
  };

  const handleSkip = () => {
    navigation.replace('CountrySelection');
  };

  const renderSlide = ({ item }: { item: typeof TUTORIAL_SLIDES[0] }) => (
    <View style={styles.slide}>
      <Text style={styles.icon}>{item.icon}</Text>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppBackground />
      <FlatList
        ref={flatListRef}
        data={TUTORIAL_SLIDES}
        renderItem={renderSlide}
        horizontal={true}
        pagingEnabled={true}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        keyExtractor={(item) => item.id}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {TUTORIAL_SLIDES.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === currentIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleSkip}>
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>

        <NeonButton
          onPress={handleNext}
          label={currentIndex === TUTORIAL_SLIDES.length - 1 ? 'Comenzar' : 'Siguiente'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  background: { ...StyleSheet.absoluteFillObject as any, zIndex: -1 },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  icon: {
    fontSize: 100,
    marginBottom: 32
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 16
  },
  slideDescription: {
    fontSize: 16,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4
  },
  dotActive: {
    width: 24,
    backgroundColor: COLORS.primary
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40
  },
  skipText: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '600'
  },
  
});
