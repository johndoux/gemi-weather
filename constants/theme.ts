// Varela Round ships one weight (400 Regular) — all tokens resolve to the same
// face. Do NOT use fontWeight in StyleSheets; on Android a non-default weight
// triggers a variant lookup that doesn't exist for custom fonts and silently
// falls back to the system font.
export const fonts = {
  regular:  'VarelaRound_400Regular',
  medium:   'VarelaRound_400Regular',
  semibold: 'VarelaRound_400Regular',
  bold:     'VarelaRound_400Regular',
};

export { color, duration, fontSize, iconSize, lineHeight, radius, shadow, size, spacing, zIndex } from './tokens';
