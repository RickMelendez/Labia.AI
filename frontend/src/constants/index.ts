import { CulturalStyle, Tone } from '../types';

// API Configuration
export const API_BASE_URL = __DEV__
  ? 'http://localhost:8000/api/v1'
  : 'https://api.labia.ai/api/v1';

export const API_TIMEOUT = 30000; // 30 seconds

// Cultural Styles
export const CULTURAL_STYLES: { value: CulturalStyle; label: string; flag: string; description: string }[] = [
  {
    value: 'boricua',
    label: 'Puerto Rico',
    flag: '🇵🇷',
    description: 'Warm, expressive, playful - wepa, chévere, brutal'
  },
  {
    value: 'mexicano',
    label: 'México',
    flag: '🇲🇽',
    description: 'Friendly, humorous - wey, chido, neta'
  },
  {
    value: 'colombiano',
    label: 'Colombia',
    flag: '🇨🇴',
    description: 'Very warm, enthusiastic - parce, bacano, chimba'
  },
  {
    value: 'argentino',
    label: 'Argentina',
    flag: '🇦🇷',
    description: 'Direct with voseo - che, boludo, copado'
  },
  {
    value: 'español',
    label: 'España',
    flag: '🇪🇸',
    description: 'Uses vosotros - tío, mola, guay'
  }
];

// Tones
export const TONES: { value: Tone; label: string; icon: string; description: string }[] = [
  {
    value: 'chill',
    label: 'Chill',
    icon: '😎',
    description: 'Relaxed, friendly, casual'
  },
  {
    value: 'elegant',
    label: 'Elegante',
    icon: '✨',
    description: 'Sophisticated, polished, refined'
  },
  {
    value: 'intellectual',
    label: 'Intelectual',
    icon: '🤓',
    description: 'Thoughtful, insightful, cultured'
  },
  {
    value: 'playero',
    label: 'Playero',
    icon: '🏖️',
    description: 'Beachy, laid-back, sun & fun'
  },
  {
    value: 'minimalist',
    label: 'Minimalista',
    icon: '⚡',
    description: 'Direct, concise, no fluff'
  }
];

// Relationship Stages
export const RELATIONSHIP_STAGES = [
  {
    value: 'early',
    label: 'Inicio',
    description: 'Primeros mensajes, conociéndose'
  },
  {
    value: 'building',
    label: 'Construyendo',
    description: 'Ya hay química, conversación fluida'
  },
  {
    value: 'established',
    label: 'Establecida',
    description: 'Relación consolidada, confianza mutua'
  }
];

// User Plans
export const USER_PLANS = {
  free: {
    name: 'Free',
    daily_limit: 10,
    features: ['10 sugerencias/día', 'Estilos culturales básicos', 'Aperturas y respuestas']
  },
  pro: {
    name: 'Pro',
    daily_limit: 100,
    features: ['100 sugerencias/día', 'Todos los estilos', 'Entrenador de Labia', 'Sin anuncios']
  },
  premium: {
    name: 'Premium',
    daily_limit: -1, // unlimited
    features: ['Sugerencias ilimitadas', 'Voice Mode', 'Misiones premium', 'Soporte prioritario']
  }
};

// Theme Colors (Latino vibrant gradients)
export const COLORS = {
  primary: '#FF6B9D', // Pink/coral
  secondary: '#C06CFE', // Purple
  accent: '#FEC84B', // Yellow/gold
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',

  background: {
    light: '#FFFFFF',
    dark: '#1A1A2E'
  },

  surface: {
    light: '#F9FAFB',
    dark: '#16213E'
  },

  text: {
    primary: '#1F2937',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    inverse: '#FFFFFF'
  },

  gradient: {
    primary: ['#FF6B9D', '#C06CFE'],
    secondary: ['#FEC84B', '#FF6B9D'],
    accent: ['#C06CFE', '#6366F1']
  }
};

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_PROFILE: '@labia_user_profile',
  CULTURAL_STYLE: '@labia_cultural_style',
  DEFAULT_TONE: '@labia_default_tone',
  AUTH_TOKEN: '@labia_auth_token',
  ONBOARDING_COMPLETED: '@labia_onboarding_completed',
  THEME: '@labia_theme'
};

// Default Values
export const DEFAULTS = {
  culturalStyle: 'boricua' as CulturalStyle,
  tone: 'chill' as Tone,
  relationshipStage: 'early' as const,
  numSuggestions: 3
};
