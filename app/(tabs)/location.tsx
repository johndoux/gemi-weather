import { LocationInputScreen } from '@/components/location-input-screen';
import { MenuModal } from '@/components/menu-modal';
import { CornerButtonBg } from '@/components/ui/corner-button-bg';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useWeatherContext } from '@/contexts/weather-context';
import { iconSize, spacing, zIndex, duration } from '@/constants/theme';
import { DEFAULT_PALETTE, getWeatherVerdict } from '@/constants/weather';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  ReduceMotion,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LocationScreen() {
  const weather = useWeatherContext();
  const insets  = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = useState(false);

  const palette = weather.status === 'ok'
    ? getWeatherVerdict(weather.apparentTempF, weather.weatherCode, weather.isDay).palette
    : DEFAULT_PALETTE;
  const isDay = weather.status === 'ok' ? weather.isDay : true;

  const opacity   = useSharedValue(0);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  useEffect(() => {
    opacity.value = withTiming(1, { duration: duration.fadeIn, reduceMotion: ReduceMotion.System });
  }, []);

  function navigateBack() {
    opacity.value = withTiming(0, { duration: duration.fadeOut, reduceMotion: ReduceMotion.System }, (done) => {
      if (done) runOnJS(router.back)();
    });
  }

  const isResolving     = weather.status === 'ok' ? weather.isResolvingManual : false;
  const error           = weather.status === 'ok' ? weather.manualLocationError : undefined;
  const isGPSRefreshing = weather.status === 'ok' ? weather.isGPSRefreshing : false;

  const wasResolvingRef   = useRef(false);
  const wasGPSRefreshRef  = useRef(false);

  useEffect(() => {
    if (wasResolvingRef.current && !isResolving && !error) navigateBack();
    wasResolvingRef.current = isResolving;
  }, [isResolving, error]);

  useEffect(() => {
    if (wasGPSRefreshRef.current && !isGPSRefreshing) navigateBack();
    wasGPSRefreshRef.current = isGPSRefreshing;
  }, [isGPSRefreshing]);

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Animated.View style={[styles.container, fadeStyle]}>
        <LocationInputScreen
          palette={palette}
          isDay={isDay}
          onDismiss={navigateBack}
          setManualLocation={weather.setManualLocation}
          isResolving={isResolving}
          error={error}
          canAskAgain={weather.status === 'ok' ? weather.canUseGPS : true}
        />
      </Animated.View>

      {weather.status === 'ok' && weather.canUseGPS && (
        <Pressable
          style={[styles.cornerBtnPos, { top: insets.top + spacing.xs, right: spacing.lg }]}
          onPress={weather.refreshGPSLocation}
          hitSlop={spacing.xs}
          disabled={isGPSRefreshing}
          accessibilityRole="button"
          accessibilityLabel="Use my current location"
          accessibilityState={{ disabled: isGPSRefreshing }}
        >
          <CornerButtonBg isDay={isDay}>
            {isGPSRefreshing
              ? <ActivityIndicator color={palette.textMuted} size="small" />
              : <IconSymbol name="location.fill" size={iconSize.md} color={palette.textMuted} />
            }
          </CornerButtonBg>
        </Pressable>
      )}

      <Pressable
        style={[styles.cornerBtnPos, { bottom: insets.bottom + spacing.xs, right: spacing.lg }]}
        onPress={() => setMenuVisible(true)}
        hitSlop={spacing.xs}
        accessibilityRole="button"
        accessibilityLabel="Open settings menu"
      >
        <CornerButtonBg isDay={isDay}>
          <IconSymbol name="ellipsis" size={iconSize.md} color={palette.textMuted} />
        </CornerButtonBg>
      </Pressable>

      <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cornerBtnPos: {
    position: 'absolute',
    zIndex: zIndex.cornerBtn,
  },
});
