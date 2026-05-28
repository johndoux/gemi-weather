import { ConditionKey, VerdictKey } from '@/constants/weather';
import { SpriteAnimation, SpriteConfig } from './sprite-animation';

type SpriteKey =
  | 'scorching' | 'warm' | 'mild' | 'cool' | 'cold' | 'frozen'
  | 'scorching-rain' | 'warm-rain' | 'mild-rain' | 'cool-rain' | 'cold-rain' | 'frozen-rain'
  | 'cold-snow' | 'frozen-snow';

const BASE_CONFIGS: Record<VerdictKey, SpriteConfig> = {
  scorching: { source: require('../assets/monsters/scorching-sprite.png'), sheetSize: 5376, frameSize: 768, cols: 7, totalFrames: 49, fps: 30 },
  warm:      { source: require('../assets/monsters/warm-sprite.png'),      sheetSize: 5376, frameSize: 768, cols: 7, totalFrames: 49, fps: 30 },
  mild:      { source: require('../assets/monsters/mild-sprite.png'),      sheetSize: 5376, frameSize: 768, cols: 7, totalFrames: 49, fps: 30 },
  cool:      { source: require('../assets/monsters/cool-sprite.png'),      sheetSize: 5376, frameSize: 672, cols: 8, totalFrames: 64, fps: 24 },
  cold:      { source: require('../assets/monsters/cold-sprite.png'),      sheetSize: 5376, frameSize: 768, cols: 7, totalFrames: 49, fps: 30 },
  frozen:    { source: require('../assets/monsters/frozen-sprite.png'),    sheetSize: 5376, frameSize: 768, cols: 7, totalFrames: 49, fps: 30 },
};

// Rain/drizzle/storm modifier sprites — 4096×4096 sheet, 512×512 frames, 8 cols, 64 frames.
const MODIFIER_CONFIGS: Partial<Record<SpriteKey, SpriteConfig>> = {
  'scorching-rain': { source: require('../assets/monsters/scorching-rain-sprite.png'), sheetSize: 4096, frameSize: 512, cols: 8, totalFrames: 64, fps: 24 },
  'warm-rain':      { source: require('../assets/monsters/warm-rain-sprite.png'),      sheetSize: 4096, frameSize: 512, cols: 8, totalFrames: 64, fps: 24 },
  'mild-rain':      { source: require('../assets/monsters/mild-rain-sprite.png'),      sheetSize: 4096, frameSize: 512, cols: 8, totalFrames: 64, fps: 24 },
  'cool-rain':      { source: require('../assets/monsters/cool-rain-sprite.png'),      sheetSize: 4096, frameSize: 512, cols: 8, totalFrames: 64, fps: 24 },
  'cold-rain':      { source: require('../assets/monsters/cold-rain-sprite.png'),      sheetSize: 4096, frameSize: 512, cols: 8, totalFrames: 64, fps: 24 },
  'frozen-rain':    { source: require('../assets/monsters/frozen-rain-sprite.png'),    sheetSize: 4096, frameSize: 512, cols: 8, totalFrames: 64, fps: 24 },
};

function getSpriteKey(verdict: VerdictKey, condition: ConditionKey): SpriteKey {
  if (condition === 'rain' || condition === 'drizzle' || condition === 'storm') {
    return `${verdict}-rain` as SpriteKey;
  }
  if (condition === 'snow' && (verdict === 'cold' || verdict === 'frozen')) {
    return `${verdict}-snow` as SpriteKey;
  }
  return verdict;
}

export function MonsterCharacter({ verdict, condition, onPress }: { verdict: VerdictKey; condition: ConditionKey; onPress?: () => void }) {
  const spriteKey = getSpriteKey(verdict, condition);
  const config = MODIFIER_CONFIGS[spriteKey] ?? BASE_CONFIGS[verdict];

  return <SpriteAnimation key={spriteKey} config={config} onPress={onPress} />;
}

export const SPRITE_CONFIGS = { ...BASE_CONFIGS, ...MODIFIER_CONFIGS };
