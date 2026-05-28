import { LocationInputScreen } from '@/components/location-input-screen';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useWeatherContext } from '@/contexts/weather-context';
import { color, duration, iconSize, radius, size, spacing, zIndex } from '@/constants/theme';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function LocationScreen() {
  const weather = useWeatherContext();
  const insets  = useSafeAreaInsets();

  const opacity   = useSharedValue(1);
  const fadeStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  function navigateBack() {
    opacity.value = withTiming(0, { duration: duration.fadeOut }, (done) => {
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
    <Animated.View style={[styles.container, fadeStyle]} entering={FadeIn.duration(duration.fadeIn)}>
      <LocationInputScreen
        onDismiss={navigateBack}
        setManualLocation={weather.setManualLocation}
        isResolving={isResolving}
        error={error}
        canAskAgain={weather.status === 'ok' ? weather.canUseGPS : true}
      />

      {weather.status === 'ok' && weather.canUseGPS && (
        <Pressable
          style={[styles.gpsBtn, { top: insets.top + spacing.xs, right: spacing.lg }]}
          onPress={weather.refreshGPSLocation}
          hitSlop={spacing.xs}
          disabled={isGPSRefreshing}
          accessibilityRole="button"
          accessibilityLabel="Use my current location"
          accessibilityState={{ disabled: isGPSRefreshing }}
        >
          {isGPSRefreshing
            ? <ActivityIndicator color={color.white} size="small" />
            : <IconSymbol name="location.fill" size={iconSize.md} color={color.white} />
          }
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gpsBtn: {
    position: 'absolute',
    width: size.iconBtn,
    height: size.iconBtn,
    borderRadius: radius.md,
    backgroundColor: color.brand,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: zIndex.cornerBtn,
  },
});
