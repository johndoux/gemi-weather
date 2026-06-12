import { ErrorScreen } from '@/components/error-screen';
import { LoadingScreen } from '@/components/loading-screen';
import { LocationInputScreen } from '@/components/location-input-screen';
import { MenuModal } from '@/components/menu-modal';
import { MonsterCharacter } from '@/components/monster-character';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useWeatherContext } from '@/contexts/weather-context';
import { color, fonts, fontSize, iconSize, radius, size, spacing, zIndex } from '@/constants/theme';
import { getWeatherVerdict, WEATHER_ICONS } from '@/constants/weather';
import { strings } from '@/constants/strings';
import { MapPin } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, Stack, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as StoreReview from 'expo-store-review';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


export default function HomeScreen() {
  const weather = useWeatherContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const insets = useSafeAreaInsets();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const buttonClearance = spacing.xs + size.iconBtn + spacing.xl;
  const cardMaxHeight = windowHeight - insets.top - insets.bottom - buttonClearance * 2;

  const isFirstFocusRef = useRef(true);
  useFocusEffect(useCallback(() => {
    if (isFirstFocusRef.current) {
      isFirstFocusRef.current = false;
      return;
    }
    setAnimKey(k => k + 1);
  }, []));

  if (weather.status === 'loading') return <LoadingScreen />;
  if (weather.status === 'error')   return <ErrorScreen message={weather.message} onRetry={weather.refresh} />;

  if (weather.status === 'needs-location') {
    return (
      <LocationInputScreen
        setManualLocation={weather.setManualLocation}
        isResolving={weather.isResolving}
        error={weather.locationError}
        canAskAgain={weather.canAskAgain}
      />
    );
  }

  const verdict     = getWeatherVerdict(weather.apparentTempF, weather.weatherCode, weather.isDay);
  const { palette, condition } = verdict;
  const WeatherIcon = WEATHER_ICONS[condition];
  const topOffset = insets.top + spacing.xs;

  async function handleReview() {
    try {
      if (await StoreReview.isAvailableAsync()) {
        await StoreReview.requestReview();
      } else {
        const url = await StoreReview.storeUrl();
        if (url) await Linking.openURL(url);
      }
    } catch {}
  }

  return (
    <>
      {Platform.OS === 'ios' && (
        <>
          <Stack.Screen options={{ headerShown: true, headerTransparent: true }} />
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Button
              icon="mappin.and.ellipse"
              onPress={() => router.push('/location')}
              accessibilityLabel="Change location"
            />
          </Stack.Toolbar>
          {weather.canUseGPS && (
            <Stack.Toolbar placement="right">
              <Stack.Toolbar.Button
                icon="location.fill"
                onPress={weather.refreshGPSLocation}
                disabled={weather.isGPSRefreshing}
                accessibilityLabel="Use my current location"
              />
            </Stack.Toolbar>
          )}
          <Stack.Toolbar placement="bottom">
            <Stack.Toolbar.Spacer />
            <Stack.Toolbar.Menu icon="ellipsis" accessibilityLabel="Open settings menu">
              <Stack.Toolbar.MenuAction
                icon="books.vertical"
                onPress={() => router.push('/acknowledgements')}
              >
                {strings.menu_acknowledgements}
              </Stack.Toolbar.MenuAction>
              <Stack.Toolbar.MenuAction
                icon="location"
                onPress={() => Linking.openSettings()}
              >
                {strings.menu_location_permissions}
              </Stack.Toolbar.MenuAction>
              <Stack.Toolbar.MenuAction
                icon="heart"
                onPress={() => router.push('/tip-jar')}
              >
                {strings.menu_support}
              </Stack.Toolbar.MenuAction>
              <Stack.Toolbar.MenuAction
                icon="star"
                onPress={handleReview}
              >
                {strings.menu_write_review}
              </Stack.Toolbar.MenuAction>
            </Stack.Toolbar.Menu>
          </Stack.Toolbar>
        </>
      )}

      <LinearGradient colors={palette.gradientColors} style={[styles.screen, { backgroundColor: palette.background }]}>
        <StatusBar style={weather.isDay ? 'dark' : 'light'} />

        {Platform.OS !== 'ios' && (
          <Pressable
            style={[styles.cornerBtn, { top: topOffset, left: spacing.lg }]}
            onPress={() => router.push('/location')}
            hitSlop={spacing.xs}
            accessibilityRole="button"
            accessibilityLabel="Change location"
          >
            <IconSymbol name="mappin.and.ellipse" size={iconSize.md} color={palette.textMuted} />
          </Pressable>
        )}

        {Platform.OS !== 'ios' && weather.canUseGPS && (
          <Pressable
            style={[styles.cornerBtn, { top: topOffset, right: spacing.lg }]}
            onPress={weather.refreshGPSLocation}
            hitSlop={spacing.xs}
            disabled={weather.isGPSRefreshing}
            accessibilityRole="button"
            accessibilityLabel="Use my current location"
            accessibilityState={{ disabled: weather.isGPSRefreshing }}
          >
            {weather.isGPSRefreshing
              ? <ActivityIndicator color={palette.textMuted} size="small" />
              : <IconSymbol name="location.fill" size={iconSize.md} color={palette.textMuted} />
            }
          </Pressable>
        )}

        <Pressable
          style={[styles.cardWrapper, { paddingTop: insets.top + spacing.xs + size.iconBtn + spacing.xl, paddingBottom: insets.bottom + spacing.xs + size.iconBtn + spacing.xl }]}
          onPress={weather.refresh}
          accessibilityRole="button"
          accessibilityLabel={`${Math.round(weather.apparentTempF)} degrees, ${verdict.conditionText}, ${verdict.clothingText}, in ${weather.cityName}`}
          accessibilityHint="Refreshes the weather"
        >
          <View style={[styles.content, { height: cardMaxHeight }]}>
                <View style={styles.cityRow} accessible={false}>
                  <MapPin size={iconSize.sm} color={palette.textMuted} accessible={false} />
                  <Text
                    style={[styles.cityText, { color: palette.textMuted, fontFamily: fonts.semibold }]}
                    accessibilityLabel={`Location: ${weather.cityName}`}
                  >
                    {weather.cityName}
                  </Text>
                </View>

                <View style={styles.tempRow} accessible={false}>
                  <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
                    <WeatherIcon size={iconSize.huge} color={palette.iconColor} />
                  </View>
                  <Text
                    style={[styles.temperature, { color: palette.text, fontFamily: fonts.black }]}
                    accessibilityLabel={`${Math.round(weather.apparentTempF)} degrees`}
                  >
                    {Math.round(weather.apparentTempF)}°
                  </Text>
                </View>

                <Text style={[styles.conditionText, { color: palette.textMuted, fontFamily: fonts.bold }]}>
                  {verdict.conditionText}
                </Text>
                <Text style={[styles.clothingText, { color: palette.text, fontFamily: fonts.black }]}>
                  {verdict.clothingText}
                </Text>

                <View style={[styles.monsterContainer, { maxHeight: windowWidth - spacing.md * 2 }]}>
                  <MonsterCharacter
                    key={animKey}
                    verdict={verdict.verdict}
                    condition={condition}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                  />
                </View>
          </View>
        </Pressable>

        {Platform.OS !== 'ios' && (
          <Pressable
            style={[styles.cornerBtn, { bottom: insets.bottom + spacing.xs, right: spacing.lg }]}
            onPress={() => setMenuVisible(true)}
            hitSlop={spacing.xs}
            accessibilityRole="button"
            accessibilityLabel="Open settings menu"
          >
            <IconSymbol name="ellipsis" size={iconSize.md} color={palette.textMuted} />
          </Pressable>
        )}

        {Platform.OS !== 'ios' && (
          <MenuModal visible={menuVisible} onClose={() => setMenuVisible(false)} />
        )}
      </LinearGradient>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  cornerBtn: {
    position: 'absolute',
    width: size.iconBtn,
    height: size.iconBtn,
    borderRadius: radius.md,
    backgroundColor: color.btnOverlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: zIndex.cornerBtn,
  },
  cardWrapper: {
    flex: 1,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  content: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.huge,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xl,
  },
  cityText: {
    fontSize: fontSize.lg,
  },
  tempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  temperature: {
    fontSize: fontSize.temp,
  },
  conditionText: {
    fontSize: fontSize.lg,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  clothingText: {
    fontSize: fontSize.h2,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xl,
  },
  monsterContainer: {
    flex: 1,
  },
});
