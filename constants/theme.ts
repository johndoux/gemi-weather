// Single font for both platforms. Weight is encoded in the font family name —
// do NOT use fontWeight in StyleSheets alongside these values. On Android,
// fontWeight >= 700 triggers a '-Bold' variant lookup that doesn't exist for
// custom fonts, causing a silent fallback to the system font.
export const fonts = {
  regular:  'Comfortaa_400Regular',
  medium:   'Comfortaa_500Medium',
  semibold: 'Comfortaa_600SemiBold',
  bold:     'Comfortaa_700Bold',
  black:    'Comfortaa_700Bold', // Comfortaa's heaviest weight is 700
};

export { color, duration, fontSize, iconSize, lineHeight, radius, shadow, size, spacing, zIndex } from './tokens';
