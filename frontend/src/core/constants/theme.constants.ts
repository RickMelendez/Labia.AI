// Theme Colors — Warm Amber "Premium Dating"
// Visual direction: very dark brown-black, amber/gold primary, red-rose accent.
// No glassmorphism — solid surfaces only. Each screen has its own personality.

export const COLORS = {
  // === BRAND: Amber Gold + Red-Rose === //
  brand: '#F59E0B',          // Amber gold (primary CTA, active tabs, progress)
  brandDark: '#D97706',      // Amber darker (pressed states, badges)
  brandLight: '#FCD34D',     // Amber lighter (highlights)
  brand50: 'rgba(245,158,11,0.10)',   // Amber tint (chip backgrounds)
  brand12: 'rgba(245,158,11,0.12)',   // Subtle amber border tint

  rose: '#DC2626',           // Red-rose (likes, matches, passion)
  roseDark: '#B91C1C',       // Rose darker
  roseLight: '#EF4444',      // Rose lighter

  // Primary / Secondary (keep these aliases for backward compat)
  primary: '#F59E0B',
  primaryLight: '#FCD34D',
  primaryDark: '#D97706',

  secondary: '#DC2626',
  secondaryLight: '#EF4444',
  secondaryDark: '#B91C1C',

  // Accent (alias)
  accent: '#F59E0B',
  accentLight: '#FCD34D',
  accentDark: '#D97706',

  // Action colors (for discover screen)
  like: '#DC2626',           // Rose/red for heart/like
  pass: '#4B4B4B',           // Dark grey for pass/skip
  superlike: '#F59E0B',      // Amber for superlike/star

  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // === TEXT === //
  text: {
    primary: '#FAFAF9',          // Warm white
    secondary: '#C9B89A',        // Warm beige secondary
    muted: '#7C6C5A',            // Warm muted / placeholders
    disabled: '#4A3F34',         // Very muted
    inverse: '#0C0A08',          // Dark text on light surfaces
    onBrand: '#0C0A08',          // Dark text ON amber — better contrast
    onDark: '#FAFAF9',
    onDarkMuted: '#C9B89A',
    onPhoto: '#FFFFFF',          // Always white when over photo backgrounds
    link: '#FCD34D',             // Lighter amber for links

    // Legacy aliases
    strong: '#FAFAF9',
    body: '#C9B89A',
    onBrandDark: '#0C0A08',
    accent: '#FCD34D',
    tertiary: '#7C6C5A',
  },

  // === BACKGROUNDS === //
  background: {
    app: '#0C0A08',              // Very dark brown-black
    light: '#0C0A08',
    lightSecondary: '#0F0D0B',
    dark: '#0C0A08',
    darkSecondary: '#0F0D0B',
    card: '#161210',             // Solid dark card (NO transparency)
  },

  // === SURFACES (solid, no glassmorphism) === //
  surface: {
    light: '#161210',            // Surface level 1 — dark card
    lightElevated: '#1E1916',    // Surface level 2 — elevated card
    tinted: 'rgba(245,158,11,0.08)',  // Amber-tinted surface (selected states)
    border: 'rgba(245,158,11,0.12)', // Subtle amber border
    photoOverlay: 'rgba(0,0,0,0.50)',
    inputBg: '#1E1916',          // Input field background

    // Solid surfaces (no transparency)
    dark: '#161210',
    dark2: '#1E1916',
    dark3: '#261E1A',
    darkElevated: '#261E1A',
    lavendar: 'rgba(245,158,11,0.08)',  // repurposed as amber tint
  },

  // === BORDERS === //
  border: {
    light: 'rgba(255,255,255,0.06)',   // Neutral dark border
    medium: 'rgba(255,255,255,0.10)',
    dark: 'rgba(255,255,255,0.04)',
    focus: '#F59E0B',                  // Amber focus border
    brand: '#F59E0B',
    amber: 'rgba(245,158,11,0.20)',    // Amber border
    lavendar: 'rgba(245,158,11,0.15)', // Repurposed
  },

  // === GRADIENTS === //
  gradient: {
    // Primary gradient — amber progression (for XP bars, special accents only)
    primary: ['#F59E0B', '#D97706'] as const,
    button: ['#F59E0B', '#D97706'] as const,
    magicButton: ['#F59E0B', '#D97706'] as const,

    // Progress bar
    progress: ['#F59E0B', '#FCD34D'] as const,

    // Photo scrim — transparent to dark
    photoScrim: ['transparent', 'rgba(0,0,0,0.90)'] as const,
    photoScrimMid: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.92)'] as const,

    // Background (now just flat — gradient barely used)
    appBg: ['#0C0A08', '#0C0A08'] as const,

    // Legacy aliases
    magic: ['#F59E0B', '#D97706', '#B45309'] as const,
    romantic: ['#DC2626', '#F59E0B'] as const,
    dreamy: ['#F59E0B', '#DC2626'] as const,
    night: ['#0C0A08', '#161210'] as const,
    card: ['#161210', '#161210'] as const,
    lavendar: ['#F59E0B', '#FCD34D'] as const,
    lavandarHero: ['#F59E0B', '#DC2626'] as const,
    secondary: ['#DC2626', '#EF4444'] as const,
    neon: ['#F59E0B', '#D97706'] as const,
    accent: ['#D97706', '#F59E0B'] as const,
    deep: ['#B45309', '#D97706'] as const,
  },

  // === OVERLAYS === //
  overlay: {
    light: 'rgba(0,0,0,0.5)',
    dark: 'rgba(0,0,0,0.75)',
    gradient: 'rgba(245,158,11,0.06)',
    lavendar: 'rgba(245,158,11,0.10)',
  },

  // === SHADOWS (dark only, no colored glow on surfaces) === //
  shadow: {
    light: 'rgba(0,0,0,0.3)',
    medium: 'rgba(0,0,0,0.5)',
    heavy: 'rgba(0,0,0,0.7)',
    colored: 'rgba(245,158,11,0.25)',   // Amber glow — CTA buttons only
    card: 'rgba(0,0,0,0.5)',
    photo: 'rgba(0,0,0,0.7)',
    lavendar: 'rgba(245,158,11,0.20)',
  },

  // === STATES === //
  states: {
    hover: {
      brand: '#D97706',
      surface: '#1E1916',
      lavendar: 'rgba(245,158,11,0.15)',
    },
    active: {
      brand: '#B45309',
      surface: '#261E1A',
      lavendar: 'rgba(245,158,11,0.20)',
    },
    disabled: {
      background: '#1A1410',
      text: '#4A3F34',
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
  width: 2,
  opacity: 0.6,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 8,
};

// Tone-based gradients — amber theme
export const TONE_GRADIENTS: Record<string, readonly [string, string]> = {
  chill:        ['#F59E0B', '#D97706'],
  elegant:      ['#B45309', '#78350F'],
  intellectual: ['#6B7280', '#4B5563'],
  playero:      ['#DC2626', '#B91C1C'],
  minimalist:   ['#4B4B4B', '#2D2D2D'],
} as const;
