// Theme Colors - Lavendar & Magic Dating App Palette
export const COLORS = {
  // === BRAND: Lavendar & Magic === //
  brand: '#5e429c',        // Magic purple (buttons)
  brand600: '#4d3680',     // Magic darker
  brand700: '#3d2a66',     // Magic darkest
  brand50: '#f3e8ff',      // Magic very light tint
  
  lavendar: '#f492f0',     // Lavendar main (backgrounds)
  lavandarLight: '#f7b3f5', // Lavendar light
  lavandarDark: '#e071db',  // Lavendar dark
  lavandarPale: '#fce8fb',  // Lavendar very pale

  // Primary Colors (Magic for interactive elements)
  primary: '#5e429c',
  primaryLight: '#7a5db8',
  primaryDark: '#3d2a66',

  // Secondary Colors (Lavendar variations)
  secondary: '#f492f0',
  secondaryLight: '#f7b3f5',
  secondaryDark: '#e071db',

  // Accent Colors
  accent: '#b794f6',       // Purple accent
  accentLight: '#d4bbff',
  accentDark: '#9370db',

  // Semantic Colors
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // === TEXT COLORS === //
  text: {
    strong: '#2d1b4e',       // Dark purple for text
    body: '#4a3568',         // Medium purple
    muted: '#8b7ba8',        // Light purple
    disabled: '#D1D5DB',
    inverse: '#FFFFFF',      // White text
    onBrand: '#FFFFFF',      // White on Magic purple
    onDark: '#E5EAF0',       // Light text on dark
    onDarkMuted: '#B8C1CC',
    link: '#5e429c',         // Magic for links
    accent: '#7a5db8',
    
    // Legacy aliases
    primary: '#2d1b4e',
    secondary: '#8b7ba8',
    tertiary: '#9CA3AF',
  },

  // === BACKGROUND & SURFACE === //
  background: {
    app: '#fce8fb',          // Very pale lavendar
    light: '#fce8fb',
    lightSecondary: '#f7b3f5',
    dark: '#0B0F17',
    darkSecondary: '#111827',
  },

  surface: {
    light: '#FFFFFF',        // White cards
    lightElevated: '#fce8fb', // Pale lavendar elevated
    tinted: '#f3e8ff',       // Magic tinted (very light purple)
    lavendar: '#f492f0',     // Lavendar surface
    
    // Dark surfaces
    dark: '#2d1b4e',
    dark2: '#3d2a66',
    darkElevated: '#4a3568',
  },

  // === BORDERS === //
  border: {
    light: '#e9d5f5',        // Light purple border
    medium: '#d4bbff',
    dark: 'rgba(255, 255, 255, 0.12)',
    focus: '#5e429c',        // Magic for focus
    brand: '#5e429c',
    lavendar: '#f492f0',     // Lavendar border
  },

  // === GRADIENTS === //
  gradient: {
    // Magic purple gradients
    magic: ['#5e429c', '#4d3680', '#3d2a66'] as const,
    magicButton: ['#5e429c', '#4d3680'] as const,
    
    // Lavendar gradients
    lavendar: ['#f492f0', '#f7b3f5', '#fce8fb'] as const,
    lavandarHero: ['#f492f0', '#e071db'] as const,
    
    // Combined gradients
    romantic: ['#f492f0', '#b794f6', '#5e429c'] as const,
    dreamy: ['#fce8fb', '#f7b3f5', '#f492f0'] as const,
    
    // Legacy (updated to new colors)
    primary: ['#5e429c', '#4d3680'] as const,
    secondary: ['#f492f0', '#f7b3f5'] as const,
    accent: ['#b794f6', '#9370db'] as const,
    night: ['#0B0F17', '#111827'] as const,
    card: ['#FFFFFF', '#fce8fb'] as const,
    button: ['#5e429c', '#4d3680'] as const,
    neon: ['#5e429c', '#4d3680'] as const,
  },

  // === OVERLAY === //
  overlay: {
    light: 'rgba(0, 0, 0, 0.5)',
    dark: 'rgba(0, 0, 0, 0.7)',
    gradient: 'rgba(244, 146, 240, 0.1)', // Lavendar overlay
    lavendar: 'rgba(244, 146, 240, 0.2)',
  },

  // === SHADOWS === //
  shadow: {
    light: 'rgba(0, 0, 0, 0.1)',
    medium: 'rgba(0, 0, 0, 0.15)',
    heavy: 'rgba(0, 0, 0, 0.25)',
    colored: 'rgba(94, 66, 156, 0.3)',    // Magic shadow
    lavendar: 'rgba(244, 146, 240, 0.4)', // Lavendar shadow
    card: 'rgba(94, 66, 156, 0.08)',      // Subtle Magic shadow for cards
  },

  // === ESTADOS === //
  states: {
    hover: {
      brand: '#4d3680',      // Magic darker
      surface: '#f7b3f5',    // Lavendar light
      lavendar: '#e071db',   // Lavendar dark
    },
    active: {
      brand: '#3d2a66',      // Magic darkest
      surface: '#f492f0',    // Lavendar
      lavendar: '#d65fcc',   // Lavendar darker
    },
    disabled: {
      background: '#F3F4F6',
      text: '#D1D5DB',
    },
  },
};

// Animation Durations
export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Focus Ring Style
export const FOCUS_RING = {
  color: COLORS.brand,
  width: 3,
  opacity: 0.35,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 6,
};

// Tone-based gradients for badges/cards
export const TONE_GRADIENTS: Record<string, readonly [string, string]> = {
  chill: ['#b794f6', '#9370db'],
  elegant: ['#5e429c', '#4d3680'],
  intellectual: ['#64748B', '#94A3B8'],
  playero: ['#f492f0', '#e071db'],
  minimalist: ['#8b7ba8', '#a89cc5'],
} as const;
