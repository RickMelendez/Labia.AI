import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { COLORS } from '../constants';

// Light Theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    tertiary: COLORS.accent,
    error: COLORS.error,
    background: COLORS.background.light,
    surface: COLORS.surface.light,
    onSurface: COLORS.text.primary,
    onBackground: COLORS.text.primary,
  },
};

// Dark Theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    tertiary: COLORS.accent,
    error: COLORS.error,
    background: COLORS.background.dark,
    surface: COLORS.surface.dark,
    onSurface: '#FFFFFF',
    onBackground: '#FFFFFF',
  },
};

export type AppTheme = typeof lightTheme;
