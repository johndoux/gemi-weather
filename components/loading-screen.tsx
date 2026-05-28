import { strings } from '@/constants/strings';
import { color, duration, fontSize, fonts } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export function LoadingScreen() {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: duration.loadingPulse }),
        withTiming(1,   { duration: duration.loadingPulse }),
      ),
      -1,
      true,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={styles.container}>
      <Animated.View style={animStyle}>
        <Text style={[styles.mark, { fontFamily: fonts.bold }]}>{strings.loading_mark}</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.screenWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mark: {
    fontSize: fontSize.mark,
    color: color.inputPlaceholder,
  },
});
