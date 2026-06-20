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
  sm:      13,
  md:      14,
  base:    16,
  lg:      18,
  xxl:     22,
  h2:      28,
  temp:    68,
  mark:    120,
  caption: 12,  // section headers, footer
} as const;

// ─── Icon sizes ───────────────────────────────────────────────────────────────
export const iconSize = {
  sm:   20,
  md:   22,
  xl:   28,
  huge: 44,
} as const;

// ─── Border radius ────────────────────────────────────────────────────────────
export const radius = {
  sm:    14,
  md:    20,
  xl:    32,
  pill:  999,
  row:   16,  // individual menu row corner radius
} as const;

// ─── Sizing ───────────────────────────────────────────────────────────────────
export const size = {
  iconBtn:     40,
  minBtnWidth: 200,
} as const;

// ─── Colors ───────────────────────────────────────────────────────────────────
export const color = {
  // Brand
  brand:          '#3A2E2E',

  // Neutrals
  white:          '#FFFFFF',
  ink:            '#1C1C1E',

  // Surface
  screenWarm:     '#FFF8E7',
  surfaceSheet:   '#e3e3e3',
  surfaceCard:    '#f8f8f8',

  // Text
  textMutedWarm:  '#5A4A3A',

  // Input
  inputPlaceholder: '#B0A090',

  // States
  error:          '#D32F2F',

  // Overlays
  scrim:          'rgba(0,0,0,0.45)',
  btnOverlay:     'rgba(0,0,0,0.06)',

  // Divider
  divider:        '#D0D0D0',
} as const;

// ─── Input field (WCAG 2.1 AA compliant) ──────────────────────────────────────
// Text ≥4.5:1 contrast, placeholder ≥4.5:1 contrast against the input background.
export const inputColors = {
  day: {
    bg:          '#FFFFFF',
    text:        '#1C1C1E',  // ~18:1 on white
    placeholder: '#6E6E73',  // ~5.7:1 on white
  },
  night: {
    bg:          '#1C1C1E',
    text:        '#FFFFFF',  // ~18:1 on dark
    placeholder: '#98989F',  // ~5.5:1 on dark
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
  loadingPulse:  800,
} as const;
