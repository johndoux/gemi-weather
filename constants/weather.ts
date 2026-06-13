import { Cloud, CloudDrizzle, CloudRain, Haze, Moon, Snowflake, Sun, Zap } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { strings } from './strings';

export type VerdictKey = 'scorching' | 'warm' | 'mild' | 'cool' | 'cold' | 'frozen';
export type ConditionKey = 'clear' | 'night' | 'cloudy' | 'foggy' | 'drizzle' | 'rain' | 'snow' | 'storm';

export const WEATHER_ICONS: Record<ConditionKey, LucideIcon> = {
  clear:   Sun,
  night:   Moon,
  cloudy:  Cloud,
  foggy:   Haze,
  drizzle: CloudDrizzle,
  rain:    CloudRain,
  snow:    Snowflake,
  storm:   Zap,
};

export interface ColorPalette {
  background: string;
  gradientColors: readonly [string, string, string];
  text: string;
  textMuted: string;
  iconColor: string;
  cardBorder: string;
}

export interface WeatherVerdict {
  verdict: VerdictKey;
  condition: ConditionKey;
  palette: ColorPalette;
  conditionText: string;
  clothingText: string;
}

const DAY_PALETTES: Record<VerdictKey, ColorPalette> = {
  scorching: { background: '#fef2f2', gradientColors: ['rgba(255,255,255,0.95)', 'rgba(254,226,226,0.50)', 'rgba(254,215,170,0.50)'], text: '#7f1d1d', textMuted: '#dc2626', iconColor: '#ef4444', cardBorder: 'rgba(255,255,255,0.40)' },
  warm:      { background: '#fff7ed', gradientColors: ['rgba(255,255,255,0.95)', 'rgba(255,237,213,0.50)', 'rgba(254,215,170,0.50)'], text: '#7c2d12', textMuted: '#ea580c', iconColor: '#fbbf24', cardBorder: 'rgba(255,255,255,0.40)' },
  mild:      { background: '#f0fdf4', gradientColors: ['rgba(255,255,255,0.95)', 'rgba(220,252,231,0.50)', 'rgba(209,250,229,0.50)'], text: '#14532d', textMuted: '#15803d', iconColor: '#22c55e', cardBorder: 'rgba(255,255,255,0.40)' },
  cool:      { background: '#e0f2fe', gradientColors: ['rgba(255,255,255,0.95)', 'rgba(224,242,254,0.50)', 'rgba(191,219,254,0.50)'], text: '#0c4a6e', textMuted: '#0369a1', iconColor: '#38bdf8', cardBorder: 'rgba(255,255,255,0.40)' },
  cold:      { background: '#eef2ff', gradientColors: ['rgba(255,255,255,0.95)', 'rgba(224,231,255,0.50)', 'rgba(233,213,255,0.50)'], text: '#312e81', textMuted: '#4f46e5', iconColor: '#818cf8', cardBorder: 'rgba(255,255,255,0.40)' },
  frozen:    { background: '#f1f5f9', gradientColors: ['rgba(255,255,255,0.95)', 'rgba(226,232,240,0.50)', 'rgba(224,242,254,0.50)'], text: '#1e293b', textMuted: '#475569', iconColor: '#7dd3fc', cardBorder: 'rgba(255,255,255,0.40)' },
};

const NIGHT_PALETTES: Record<VerdictKey, ColorPalette> = {
  scorching: { background: '#1e1b4b', gradientColors: ['rgba(74,29,150,0.80)',  'rgba(74,29,150,0.60)',  'rgba(30,27,75,0.60)'],  text: '#ffe4e6', textMuted: '#fda4af', iconColor: '#fb7185', cardBorder: 'rgba(55,48,163,0.50)'  },
  warm:      { background: '#0f172a', gradientColors: ['rgba(49,46,129,0.80)',  'rgba(49,46,129,0.60)',  'rgba(15,23,42,0.60)'],  text: '#e0e7ff', textMuted: '#a5b4fc', iconColor: '#818cf8', cardBorder: 'rgba(51,65,85,0.50)'   },
  mild:      { background: '#020617', gradientColors: ['rgba(19,78,74,0.80)',   'rgba(19,78,74,0.40)',   'rgba(15,23,42,0.50)'],  text: '#ecfdf5', textMuted: 'rgba(167,243,208,0.70)', iconColor: '#34d399', cardBorder: 'rgba(30,41,59,0.60)'   },
  cool:      { background: '#111827', gradientColors: ['rgba(12,74,110,0.80)',  'rgba(12,74,110,0.40)',  'rgba(17,24,39,0.50)'],  text: '#f0f9ff', textMuted: 'rgba(186,230,253,0.70)', iconColor: '#38bdf8', cardBorder: 'rgba(55,65,81,0.50)'   },
  cold:      { background: '#020617', gradientColors: ['rgba(30,27,75,0.80)',   'rgba(30,27,75,0.60)',   'rgba(2,6,23,0.80)'],    text: '#eef2ff', textMuted: 'rgba(199,210,254,0.70)', iconColor: '#818cf8', cardBorder: 'rgba(30,41,59,0.50)'   },
  frozen:    { background: '#09090b', gradientColors: ['rgba(12,74,110,0.80)',  'rgba(12,74,110,0.30)',  'rgba(9,9,11,0.80)'],    text: '#fafafa', textMuted: 'rgba(212,212,216,0.70)', iconColor: '#7dd3fc', cardBorder: 'rgba(39,39,42,0.50)'   },
};

const CONDITION_TEXT: Record<ConditionKey, string> = {
  clear:   strings.condition_clear,
  night:   strings.condition_night,
  cloudy:  strings.condition_cloudy,
  foggy:   strings.condition_foggy,
  drizzle: strings.condition_drizzle,
  rain:    strings.condition_rain,
  snow:    strings.condition_snow,
  storm:   strings.condition_storm,
};

const CLOTHING_TEXT: Record<VerdictKey, string> = {
  scorching: strings.clothing_scorching,
  warm:      strings.clothing_warm,
  mild:      strings.clothing_mild,
  cool:      strings.clothing_cool,
  cold:      strings.clothing_cold,
  frozen:    strings.clothing_frozen,
};

export function getConditionFromCode(code: number, isDay: boolean): ConditionKey {
  if (code === 0)                                           return isDay ? 'clear' : 'night';
  if (code <= 3)                                            return 'cloudy';
  if (code === 45 || code === 48)                           return 'foggy';
  if (code >= 51 && code <= 57)                             return 'drizzle';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'rain';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86)  return 'snow';
  if (code === 95 || code === 96 || code === 99)            return 'storm';
  return 'cloudy';
}

function tempToVerdict(temp: number): VerdictKey {
  if (temp >= 92) return 'scorching';
  if (temp >= 70) return 'warm';
  if (temp >= 60) return 'mild';
  if (temp >= 50) return 'cool';
  if (temp >= 40) return 'cold';
  return 'frozen';
}

export function getWeatherVerdict(apparentTempF: number, weatherCode: number, isDay: boolean): WeatherVerdict {
  const verdict = tempToVerdict(Math.round(apparentTempF));
  const condition = getConditionFromCode(weatherCode, isDay);
  const palette = isDay ? DAY_PALETTES[verdict] : NIGHT_PALETTES[verdict];
  return { verdict, condition, palette, conditionText: CONDITION_TEXT[condition], clothingText: CLOTHING_TEXT[verdict] };
}
