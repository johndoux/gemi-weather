// ─── Spacing ─────────────────────────────────────────────────────────────────
// 4-point base grid. All spacing values are multiples of 4.
export const spacing = {
  xxs:  4,
  xs:   8,
  sm:   12,
  md:   16,
  lg:   20,
  xl:   24,
  xxl:  32,
  xxxl: 40,
  huge: 64,
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const fontSize = {
  xs:    11,
  sm:    13,
  md:    14,
  base:  16,
  lg:    18,
  xl:    20,
  xxl:   22,
  xxxl:  24,
  h2:    28,
  temp:  96,
  mark:  120,
} as const;

export const lineHeight = {
  temp: 104,
} as const;

// ─── Icon sizes ───────────────────────────────────────────────────────────────
export const iconSize = {
  sm:   20,
  md:   22,
  lg:   24,
  xl:   28,
  huge: 64,
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────
export const radius = {
  sm:   14,
  md:   20,
  lg:   24,
  xl:   32,
  pill: 999,
} as const;

// ─── Sizing ───────────────────────────────────────────────────────────────────
export const size = {
  iconBtn:     40,
  tipBtnWidth: '80%' as const, // percentage string — valid in RN StyleSheet
  minBtnWidth: 200,
} as const;

// ─── Colors ───────────────────────────────────────────────────────────────────
export const color = {
  // Brand
  brand:          '#3A2E2E',
  brandSuccess:   '#3A7A3A',

  // Neutrals
  white:          '#FFFFFF',
  black:          '#000000',
  ink:            '#1C1C1E',

  // Surface
  screenWarm:     '#FFF8E7',
  surfaceSheet:   '#e3e3e3',
  surfaceCard:    '#f8f8f8',

  // Text
  textWarm:       '#3A2E2E',
  textMutedWarm:  '#5A4A3A',
  textSubtle:     '#8A7A6A',
  textLink:       '#5A7A9A',
  textSuccess:    '#3A7A3A',
  textMuted:      '#888888',
  textFaint:      '#AAA',

  // Input
  inputPlaceholder: '#B0A090',

  // States
  error:          '#D32F2F',

  // Overlays
  scrim:          'rgba(0,0,0,0.45)',
  btnOverlay:     'rgba(0,0,0,0.06)',

  // Divider
  divider:        '#D0D0D0',

  // Icon back button
  iconBack:       'rgba(255,255,255,0.8)',
} as const;

// ─── Elevation / Shadow ───────────────────────────────────────────────────────
export const shadow = {
  outer: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 20 },
    shadowOpacity: 0.10,
    shadowRadius:  25,
    elevation:     8,
  },
  inner: {
    shadowColor:   '#000',
    shadowOffset:  { width: 0, height: 8 },
    shadowOpacity: 0.10,
    shadowRadius:  10,
  },
  input: {
    shadowColor:   '#000',
    shadowOpacity: 0.06,
    shadowRadius:  8,
    shadowOffset:  { width: 0, height: 2 },
  },
} as const;

// ─── Z-index ──────────────────────────────────────────────────────────────────
export const zIndex = {
  cornerBtn: 10,
  backdrop:  100,
  sheet:     101,
} as const;

// ─── Animation durations (ms) ─────────────────────────────────────────────────
export const duration = {
  fadeIn:        220,
  fadeOut:       180,
  backdropIn:    250,
  backdropOut:   300,
  phaseAnim:     380,
  loadingPulse:  800,
} as const;
