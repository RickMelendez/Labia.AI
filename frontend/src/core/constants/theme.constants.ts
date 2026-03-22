// Theme Colors — Soft Warm Neutral + Coral
// Visual direction: warm off-white backgrounds, earthy surfaces, coral primary accent.
// Light mode. No glassmorphism — solid surfaces only.

export const COLORS = {
  // === BRAND: Coral + Warm Red === //
  brand: '#F97060',          // Warm coral (primary CTA, active tabs, progress)
  brandDark: '#E85D4A',      // Coral darker (pressed states, badges)
  brandLight: '#FFAB9F',     // Coral lighter (highlights)
  brand50: 'rgba(249,112,96,0.10)',   // Coral tint (chip backgrounds)
  brand12: 'rgba(249,112,96,0.12)',   // Subtle coral border tint

  rose: '#E8554E',           // Warm red (likes, matches, hearts)
  roseDark: '#C73F38',       // Rose darker
  roseLight: '#EF7A74',      // Rose lighter

  // Primary / Secondary (keep these aliases for backward compat)
  primary: '#F97060',
  primaryLight: '#FFAB9F',
  primaryDark: '#E85D4A',

  secondary: '#E8554E',
  secondaryLight: '#EF7A74',
  secondaryDark: '#C73F38',

  // Accent (alias)
  accent: '#F97060',
  accentLight: '#FFAB9F',
  accentDark: '#E85D4A',

  // Action colors (for discover screen)
  like: '#E8554E',           // Warm red for heart/like
  pass: '#A89088',           // Muted warm for pass/skip
  superlike: '#F97060',      // Coral for superlike/star

  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F97060',
  info: '#3B82F6',

  // === TEXT === //
  text: {
    primary: '#1C1917',          // Near-black warm
    secondary: '#78645A',        // Warm muted brown
    muted: '#A89088',            // Lighter muted / placeholders
    disabled: '#C4B4AE',         // Very muted
    inverse: '#FFFFFF',          // White text on dark/colored surfaces
    onBrand: '#FFFFFF',          // White text ON coral — best contrast
    onDark: '#1C1917',
    onDarkMuted: '#78645A',
    onPhoto: '#FFFFFF',          // Always white when over photo backgrounds
    link: '#F97060',             // Coral for links

    // Legacy aliases
    strong: '#1C1917',
    body: '#78645A',
    onBrandDark: '#FFFFFF',
    accent: '#E85D4A',
    tertiary: '#A89088',
  },

  // === BACKGROUNDS === //
  background: {
    app: '#FAF8F5',              // Warm off-white
    light: '#FAF8F5',
    lightSecondary: '#F5F2EE',
    dark: '#FAF8F5',
    darkSecondary: '#F5F2EE',
    card: '#F0EDE8',             // Solid warm card
  },

  // === SURFACES (solid, no glassmorphism) === //
  surface: {
    light: '#F0EDE8',            // Surface level 1 — warm card
    lightElevated: '#E8E2DC',    // Surface level 2 — elevated card
    tinted: 'rgba(249,112,96,0.08)',  // Coral-tinted surface (selected states)
    border: 'rgba(249,112,96,0.20)', // Coral border
    photoOverlay: 'rgba(0,0,0,0.50)',
    inputBg: '#E8E2DC',          // Input field background

    // Solid surfaces
    dark: '#F0EDE8',
    dark2: '#E8E2DC',
    dark3: '#DED6CE',
    darkElevated: '#DED6CE',
    lavendar: 'rgba(249,112,96,0.08)',  // Coral tint
  },

  // === BORDERS === //
  border: {
    light: 'rgba(0,0,0,0.06)',         // Subtle dark border
    medium: 'rgba(0,0,0,0.10)',
    dark: 'rgba(0,0,0,0.04)',
    focus: '#F97060',                   // Coral focus border
    brand: '#F97060',
    amber: 'rgba(249,112,96,0.25)',     // Coral border
    lavendar: 'rgba(249,112,96,0.15)', // Coral border light
  },

  // === GRADIENTS === //
  gradient: {
    primary: ['#F97060', '#E85D4A'] as const,
    button: ['#F97060', '#E85D4A'] as const,
    magicButton: ['#F97060', '#E85D4A'] as const,

    progress: ['#F97060', '#FFAB9F'] as const,

    photoScrim: ['transparent', 'rgba(0,0,0,0.90)'] as const,
    photoScrimMid: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.92)'] as const,

    appBg: ['#FAF8F5', '#FAF8F5'] as const,

    // Legacy aliases
    magic: ['#F97060', '#E85D4A', '#C73F38'] as const,
    romantic: ['#E8554E', '#F97060'] as const,
    dreamy: ['#F97060', '#E8554E'] as const,
    night: ['#FAF8F5', '#F0EDE8'] as const,
    card: ['#F0EDE8', '#F0EDE8'] as const,
    lavendar: ['#F97060', '#FFAB9F'] as const,
    lavandarHero: ['#F97060', '#E8554E'] as const,
    secondary: ['#E8554E', '#EF7A74'] as const,
    neon: ['#F97060', '#E85D4A'] as const,
    accent: ['#E85D4A', '#F97060'] as const,
    deep: ['#C73F38', '#E85D4A'] as const,
  },

  // === OVERLAYS === //
  overlay: {
    light: 'rgba(0,0,0,0.3)',
    dark: 'rgba(0,0,0,0.55)',
    gradient: 'rgba(249,112,96,0.06)',
    lavendar: 'rgba(249,112,96,0.10)',
  },

  // === SHADOWS === //
  shadow: {
    light: 'rgba(0,0,0,0.06)',
    medium: 'rgba(0,0,0,0.10)',
    heavy: 'rgba(0,0,0,0.18)',
    colored: 'rgba(249,112,96,0.30)',   // Coral glow — CTA buttons only
    card: 'rgba(0,0,0,0.08)',
    photo: 'rgba(0,0,0,0.7)',
    lavendar: 'rgba(249,112,96,0.20)',
  },

  // === STATES === //
  states: {
    hover: {
      brand: '#E85D4A',
      surface: '#E8E2DC',
      lavendar: 'rgba(249,112,96,0.15)',
    },
    active: {
      brand: '#C73F38',
      surface: '#DED6CE',
      lavendar: 'rgba(249,112,96,0.20)',
    },
    disabled: {
      background: '#F5D0CB',
      text: '#C4B4AE',
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

// Tone-based gradients — coral theme
export const TONE_GRADIENTS: Record<string, readonly [string, string]> = {
  chill:        ['#F97060', '#E85D4A'],
  elegant:      ['#C73F38', '#A83330'],
  intellectual: ['#6B7280', '#4B5563'],
  playero:      ['#E8554E', '#C73F38'],
  minimalist:   ['#A89088', '#78645A'],
} as const;
