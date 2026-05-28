import { Image } from 'expo-image';
import { useRef, useState } from 'react';
import { ImageSourcePropType, LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useFrameCallback,
  useSharedValue,
} from 'react-native-reanimated';

export interface SpriteConfig {
  source: ImageSourcePropType;
  sheetSize: number;
  frameSize: number;
  cols: number;
  totalFrames: number;
  fps: number;
}

export function SpriteAnimation({ config, onPress }: { config: SpriteConfig; onPress?: () => void }) {
  const [displaySize, setDisplaySize] = useState(0);
  const hasLoadedRef = useRef(false);

  const frameIndex = useSharedValue(0);
  const isPlaying = useSharedValue(false);
  const playStart = useSharedValue(0);

  const { cols, frameSize, sheetSize, totalFrames, fps } = config;
  const frameDuration = 1000 / fps;
  const scale = displaySize / frameSize;

  useFrameCallback((info) => {
    'worklet';
    if (!isPlaying.value) return;
    if (playStart.value === 0) playStart.value = info.timestamp;
    const frame = Math.floor((info.timestamp - playStart.value) / frameDuration);
    if (frame >= totalFrames) {
      frameIndex.value = totalFrames - 1;
      isPlaying.value = false;
      playStart.value = 0;
      return;
    }
    frameIndex.value = frame;
  });

  function play() {
    frameIndex.value = 0;
    playStart.value = 0;
    isPlaying.value = true;
  }

  function handleLoad() {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    play();
  }

  function onLayout(e: LayoutChangeEvent) {
    const { width } = e.nativeEvent.layout;
    if (width > 0 && width !== displaySize) setDisplaySize(width);
  }

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
    const i = frameIndex.value;
    return {
      transform: [
        { translateX: -(i % cols) * frameSize * scale },
        { translateY: -Math.floor(i / cols) * frameSize * scale },
      ],
    };
  });

  function handlePress() {
    play();
    onPress?.();
  }

  return (
    <Pressable style={styles.container} onPress={handlePress} onLayout={onLayout}>
      {scale > 0 && (
        <View style={styles.clip}>
          <Animated.View
            style={[{ position: 'absolute', width: sheetSize * scale, height: sheetSize * scale }, animatedStyle]}
            renderToHardwareTextureAndroid
          >
            <Image
              source={config.source}
              style={StyleSheet.absoluteFill}
              contentFit="cover"
              onLoad={handleLoad}
            />
          </Animated.View>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1,
  },
  clip: {
    flex: 1,
    overflow: 'hidden',
  },
});
