import { CulturalStyle, Tone } from '../../types';

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

// Default Values
export const DEFAULTS = {
  culturalStyle: 'boricua' as CulturalStyle,
  tone: 'chill' as Tone,
  relationshipStage: 'early' as const,
  numSuggestions: 3
};
