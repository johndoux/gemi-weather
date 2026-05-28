import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { SPRITE_CONFIGS } from './monster-character';

const SPRITE_SOURCES = Object.values(SPRITE_CONFIGS).map(c => c.source);

export function SpritePreloader() {
  return (
    <View style={styles.container} pointerEvents="none">
      {SPRITE_SOURCES.map((source, i) => (
        <Image key={i} source={source} style={styles.image} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  image: {
    width: 1,
    height: 1,
  },
});
