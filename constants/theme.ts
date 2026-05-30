// Weight is encoded in the font family name — do NOT use fontWeight in
// StyleSheets alongside these values. On Android, fontWeight >= 700 triggers
// a '-Bold' variant lookup that doesn't exist for custom fonts, causing a
// silent fallback to the system font.
export const fonts = {
  regular:  'Nunito_400Regular',
  medium:   'Nunito_500Medium',
  semibold: 'Nunito_600SemiBold',
  bold:     'Nunito_700Bold',
  black:    'Nunito_900Black',
};

export { color, duration, fontSize, iconSize, lineHeight, radius, shadow, size, spacing, zIndex } from './tokens';
