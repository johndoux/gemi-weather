import { LocationInputScreen } from '@/components/location-input-screen';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useWeatherContext } from '@/contexts/weather-context';
import { DEFAULT_PALETTE, getWeatherVerdict } from '@/constants/weather';
import { color, duration, iconSize, radius, size, spacing, zIndex } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet } from 'react-native';
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
    <>
      {Platform.OS === 'ios' && (
        <>
          <Stack.Screen options={{ headerShown: true, headerTransparent: true }} />
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Button
              icon="chevron.left"
              onPress={navigateBack}
              accessibilityLabel="Go back"
            />
          </Stack.Toolbar>
          {weather.status === 'ok' && weather.canUseGPS && (
            <Stack.Toolbar placement="right">
              <Stack.Toolbar.Button
                icon="location.fill"
                onPress={weather.refreshGPSLocation}
                disabled={isGPSRefreshing}
                accessibilityLabel="Use my current location"
              />
            </Stack.Toolbar>
          )}
        </>
      )}

      <Animated.View style={[styles.container, fadeStyle]}>
        <LinearGradient colors={palette.gradientColors} style={styles.gradient}>
          <StatusBar style={isDay ? 'dark' : 'light'} />

          <LocationInputScreen
            onDismiss={navigateBack}
            setManualLocation={weather.setManualLocation}
            isResolving={isResolving}
            error={error}
            canAskAgain={weather.status === 'ok' ? weather.canUseGPS : true}
            palette={palette}
          />

          {Platform.OS !== 'ios' && weather.status === 'ok' && weather.canUseGPS && (
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
        </LinearGradient>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
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
