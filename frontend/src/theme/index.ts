import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { COLORS } from '../core/constants';

// Light Theme - Lavendar & Magic
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.brand,              // Magic purple
    primaryContainer: COLORS.brand50,
    secondary: COLORS.lavendar,         // Lavendar
    secondaryContainer: COLORS.lavandarPale,
    tertiary: COLORS.accent,
    tertiaryContainer: COLORS.accentLight,
    error: COLORS.error,
    errorContainer: '#FEE2E2',
    background: COLORS.background.app,   // Pale lavendar
    surface: COLORS.surface.light,
    surfaceVariant: COLORS.surface.lightElevated,
    onSurface: COLORS.text.body,
    onBackground: COLORS.text.body,
    onSurfaceVariant: COLORS.text.muted,
    onPrimary: COLORS.text.onBrand,      // White on Magic
    onSecondary: COLORS.text.strong,     // Dark on lavendar
    outline: COLORS.border.light,
    outlineVariant: COLORS.border.medium,
    shadow: COLORS.shadow.light,
    elevation: {
      level0: 'transparent',
      level1: COLORS.surface.light,
      level2: COLORS.surface.lightElevated,
      level3: '#fce8fb',
      level4: '#f7e0fa',
      level5: '#f3d8f9',
    },
  },
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.brand,
    primaryContainer: COLORS.primaryDark,
    secondary: COLORS.lavendar,
    secondaryContainer: COLORS.lavandarDark,
    tertiary: COLORS.accent,
    tertiaryContainer: COLORS.accentDark,
    error: COLORS.error,
    errorContainer: '#7F1D1D',
    background: COLORS.background.dark,
    surface: COLORS.surface.dark,
    surfaceVariant: COLORS.surface.darkElevated,
    onSurface: COLORS.text.inverse,
    onBackground: COLORS.text.inverse,
    onSurfaceVariant: COLORS.text.onDarkMuted,
    onPrimary: COLORS.text.onBrand,
    onSecondary: COLORS.text.strong,
    outline: COLORS.border.dark,
    outlineVariant: '#4B5563',
    shadow: COLORS.shadow.heavy,
    elevation: {
      level0: 'transparent',
      level1: COLORS.surface.dark,
      level2: COLORS.surface.darkElevated,
      level3: '#3d2a66',
      level4: '#4a3568',
      level5: '#57407a',
    },
  },
};

export type AppTheme = typeof lightTheme;

// Background Images/Patterns (updated with Lavendar/Magic colors)
export const BACKGROUND_IMAGES = {
  hearts: 'https://www.transparenttextures.com/patterns/hearts.png',
  subtle_dots: 'https://www.transparenttextures.com/patterns/subtle-dots.png',
  diagonal_stripes: 'https://www.transparenttextures.com/patterns/diagonal-stripes-light.png',
  geometric: 'https://www.transparenttextures.com/patterns/asfalt-light.png',
  textured: 'https://www.transparenttextures.com/patterns/white-plaster.png',
  hero_gradient: null,

  // Updated patterns with Lavendar/Magic
  romantic_pattern: `data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f492f0' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`,

  heart_pattern: `data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%235e429c' fill-opacity='0.03'%3E%3Cpath d='M40 60c-4.42 0-8-3.58-8-8 0-4.42 3.58-8 8-8s8 3.58 8 8c0 4.42-3.58 8-8 8zm0-20c-6.63 0-12-5.37-12-12s5.37-12 12-12 12 5.37 12 12-5.37 12-12 12z' transform='translate(0 0)'/%3E%3C/g%3E%3C/svg%3E`,
};

// Glassmorphism styles (updated)
export const GLASS_STYLES = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  dark: {
    backgroundColor: 'rgba(45, 27, 78, 0.7)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: COLORS.border.dark,
  },
};

// Card Shadow Styles (updated)
export const CARD_SHADOWS = {
  small: {
    shadowColor: COLORS.shadow.colored,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow.colored,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow.colored,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
};
