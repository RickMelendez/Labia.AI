// Theme Colors — Premium Dark Elevated
// Visual direction: warm near-black background, violet→rose gradient accents,
// glassmorphism cards, photo-first discover screen (Matcha/Hinge/Modern Dating references)

export const COLORS = {
  // === BRAND: Electric Violet & Rose === //
  brand: '#A855F7',          // Electric violet (primary CTA, active tabs)
  brand600: '#9333EA',       // Violet darker
  brand700: '#7C3AED',       // Deep violet
  brand50: 'rgba(168,85,247,0.12)',  // Violet tint (chip backgrounds)

  rose: '#EC4899',           // Rose/pink (like button, secondary CTA)
  roseDark: '#DB2777',       // Rose darker

  // Primary / Secondary
  primary: '#A855F7',
  primaryLight: '#C084FC',
  primaryDark: '#7C3AED',

  secondary: '#EC4899',
  secondaryLight: '#F472B6',
  secondaryDark: '#DB2777',

  // Action colors (for discover screen buttons)
  like: '#EC4899',           // Heart / like
  pass: '#6B7280',           // X / pass (grey, not aggressive)
  superlike: '#A855F7',      // Superlike / message

  // Accent
  accent: '#A855F7',
  accentLight: '#C084FC',
  accentDark: '#7C3AED',

  // Semantic
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',

  // === TEXT === //
  text: {
    primary: '#FFFFFF',
    secondary: '#A1A1AA',    // zinc-400 — secondary labels
    muted: '#52525B',        // zinc-600 — placeholder, disabled
    disabled: '#3F3F46',     // zinc-700
    inverse: '#0D0B0A',      // dark text on light surfaces
    onBrand: '#FFFFFF',
    onDark: '#FFFFFF',
    onDarkMuted: '#A1A1AA',
    onPhoto: '#FFFFFF',      // always white when over photo backgrounds
    link: '#C084FC',         // lighter violet for links

    // Legacy aliases
    strong: '#FFFFFF',
    body: '#A1A1AA',
    onBrandDark: '#FFFFFF',
    accent: '#C084FC',
  },

  // === BACKGROUNDS === //
  background: {
    app: '#0D0B0A',          // warm near-black (brown undertone, cinematic)
    light: '#0D0B0A',
    lightSecondary: '#161311',
    dark: '#0D0B0A',
    darkSecondary: '#161311',
    card: 'rgba(255,255,255,0.06)',   // glassmorphism base
  },

  // === SURFACES === //
  surface: {
    light: 'rgba(255,255,255,0.06)',        // glass card — low elevation
    lightElevated: 'rgba(255,255,255,0.10)', // glass card — elevated
    tinted: 'rgba(168,85,247,0.08)',         // violet-tinted glass
    border: 'rgba(255,255,255,0.10)',        // glass card border
    photoOverlay: 'rgba(0,0,0,0.45)',        // overlay on top of photos
    inputBg: 'rgba(255,255,255,0.07)',       // text input background

    // Dark surfaces (keep aliases for existing code)
    dark: 'rgba(255,255,255,0.06)',
    dark2: 'rgba(255,255,255,0.10)',
    darkElevated: 'rgba(255,255,255,0.14)',
    lavendar: 'rgba(168,85,247,0.12)',
  },

  // === BORDERS === //
  border: {
    light: 'rgba(255,255,255,0.10)',
    medium: 'rgba(255,255,255,0.15)',
    dark: 'rgba(255,255,255,0.08)',
    focus: '#A855F7',
    brand: '#A855F7',
    lavendar: 'rgba(168,85,247,0.30)',
  },

  // === GRADIENTS === //
  gradient: {
    // Primary gradient — violet → rose (buttons, active badges, progress bars)
    primary: ['#A855F7', '#EC4899'] as const,
    button: ['#A855F7', '#EC4899'] as const,
    magicButton: ['#A855F7', '#EC4899'] as const,

    // Deeper gradients
    accent: ['#7C3AED', '#A855F7'] as const,
    deep: ['#4C1D95', '#7C3AED'] as const,

    // Photo scrim — transparent to dark, for text legibility over photos
    photoScrim: ['transparent', 'rgba(0,0,0,0.90)'] as const,
    photoScrimMid: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.92)'] as const,

    // Background glow (AppBackground)
    appBg: ['#1A0530', '#0D0B0A', '#0D0B0A'] as const,

    // Legacy aliases (keep for existing code that uses them)
    magic: ['#A855F7', '#9333EA', '#7C3AED'] as const,
    romantic: ['#EC4899', '#A855F7', '#7C3AED'] as const,
    dreamy: ['#A855F7', '#EC4899'] as const,
    night: ['#0D0B0A', '#161311'] as const,
    card: ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.03)'] as const,
    lavendar: ['#A855F7', '#C084FC'] as const,
    lavandarHero: ['#A855F7', '#EC4899'] as const,
    secondary: ['#EC4899', '#F472B6'] as const,
    neon: ['#A855F7', '#EC4899'] as const,
  },

  // === OVERLAYS === //
  overlay: {
    light: 'rgba(0,0,0,0.5)',
    dark: 'rgba(0,0,0,0.75)',
    gradient: 'rgba(168,85,247,0.08)',
    lavendar: 'rgba(168,85,247,0.15)',
  },

  // === SHADOWS === //
  shadow: {
    light: 'rgba(0,0,0,0.3)',
    medium: 'rgba(0,0,0,0.5)',
    heavy: 'rgba(0,0,0,0.7)',
    colored: 'rgba(168,85,247,0.4)',   // violet glow — use on primary buttons
    card: 'rgba(0,0,0,0.6)',           // deep card shadow
    photo: 'rgba(0,0,0,0.8)',          // under photo cards
    lavendar: 'rgba(168,85,247,0.35)',
  },

  // === STATES === //
  states: {
    hover: {
      brand: '#9333EA',
      surface: 'rgba(255,255,255,0.10)',
      lavendar: 'rgba(168,85,247,0.20)',
    },
    active: {
      brand: '#7C3AED',
      surface: 'rgba(255,255,255,0.14)',
      lavendar: 'rgba(168,85,247,0.25)',
    },
    disabled: {
      background: 'rgba(255,255,255,0.04)',
      text: '#3F3F46',
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
  opacity: 0.5,
  shadowOffset: { width: 0, height: 0 },
  shadowRadius: 8,
};

// Tone-based gradients — updated for dark theme
export const TONE_GRADIENTS: Record<string, readonly [string, string]> = {
  chill: ['#A855F7', '#9333EA'],
  elegant: ['#7C3AED', '#4C1D95'],
  intellectual: ['#64748B', '#94A3B8'],
  playero: ['#EC4899', '#DB2777'],
  minimalist: ['#52525B', '#71717A'],
} as const;
