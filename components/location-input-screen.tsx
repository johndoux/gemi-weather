import { strings } from '@/constants/strings';
import { color, fontSize, fonts, iconSize, inputColors, radius, size, spacing } from '@/constants/theme';
import { ColorPalette, DEFAULT_PALETTE } from '@/constants/weather';
import { usePlaceSearch } from '@/hooks/use-place-search';
import { GeoResult, formatPlace } from '@/lib/geocoding';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { TriangleAlert } from 'lucide-react-native';
import React, { ComponentProps, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LocationInputScreenProps {
  palette?: ColorPalette;
  isDay?: boolean;
  onDismiss?: () => void;
  setManualLocation: (text: string) => void;
  selectPlace: (place: GeoResult) => void;
  isResolving: boolean;
  error?: string;
  canAskAgain: boolean;
}

const MIN_QUERY_LENGTH = 2;

export function LocationInputScreen({
  palette = DEFAULT_PALETTE,
  isDay = true,
  onDismiss,
  selectPlace,
  isResolving,
  error,
  canAskAgain,
}: LocationInputScreenProps) {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  const placeSearch = usePlaceSearch();

  const input        = isDay ? inputColors.day : inputColors.night;
  const trimmed      = text.trim();
  const isSearching  = placeSearch.status === 'loading';
  const canSubmit    = trimmed.length >= MIN_QUERY_LENGTH && !isSearching && !isResolving;

  function handleSubmit() {
    if (!canSubmit) return;
    placeSearch.search(trimmed);
  }

  function handleSelect(place: GeoResult) {
    selectPlace(place);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={palette.gradientColors}
        style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: palette.background }]}
      >
        {onDismiss && (
          <Pressable
            style={styles.back}
            onPress={onDismiss}
            hitSlop={spacing.xs}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="chevron-left" size={iconSize.xl} color={palette.textMuted} />
          </Pressable>
        )}

        <View style={styles.body}>
          <Text style={[styles.heading, { fontFamily: fonts.bold, color: palette.text }]}>
            {strings.location_heading}
          </Text>
          <Text style={[styles.subtext, { fontFamily: fonts.regular, color: palette.textMuted }]}>
            {strings.location_subtext}
          </Text>

          <GlassSurface
            isDay={isDay}
            fallbackBg={input.bg}
            style={[styles.inputWrap, isSearching && { opacity: 0.6 }]}
          >
            <TextInput
              style={[styles.input, { fontFamily: fonts.regular, color: input.text }]}
              placeholder={strings.location_placeholder}
              placeholderTextColor={input.placeholder}
              value={text}
              onChangeText={setText}
              returnKeyType="search"
              autoFocus
              editable={!isSearching && !isResolving}
              onSubmitEditing={handleSubmit}
              autoCorrect={false}
              accessibilityLabel={strings.location_placeholder}
            />
          </GlassSurface>

          <SubmitButton
            isDay={isDay}
            palette={palette}
            input={input}
            canSubmit={canSubmit}
            isSearching={isSearching}
            onPress={handleSubmit}
          />

          {error && (
            <View style={styles.errorRow} accessibilityRole="alert" accessibilityLabel={error}>
              <TriangleAlert size={iconSize.sm} color={color.error} accessibilityElementsHidden />
              <Text style={[styles.error, { fontFamily: fonts.regular }]} accessibilityElementsHidden>
                {error}
              </Text>
            </View>
          )}

          <ResultArea
            isDay={isDay}
            palette={palette}
            input={input}
            placeSearch={placeSearch}
            onSelect={handleSelect}
          />

          {!canAskAgain && (
            <Pressable
              onPress={() => { Linking.openSettings().catch(() => {}); }}
              accessibilityRole="link"
              accessibilityLabel={strings.location_settings_link}
            >
              <Text style={[styles.settingsLink, { fontFamily: fonts.regular, color: palette.textMuted }]}>
                {strings.location_settings_link}
              </Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

// ─── Glass surface ───────────────────────────────────────────────────────────
// Wraps content with a native iOS UIVisualEffectView (via BlurView) on iOS,
// or a solid fallback color on Android. Text inside stays readable because
// the day/night tints are picked to give WCAG-compliant contrast against
// the visible underlying gradient.

interface GlassSurfaceProps {
  isDay: boolean;
  fallbackBg: string;
  style?: StyleProp<ViewStyle>;
  accessibilityRole?: ComponentProps<typeof View>['accessibilityRole'];
  children?: React.ReactNode;
}

function GlassSurface({ isDay, fallbackBg, style, accessibilityRole, children }: GlassSurfaceProps) {
  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.glassWrap, style]} accessibilityRole={accessibilityRole}>
        <BlurView
          tint={isDay ? 'systemUltraThinMaterialLight' : 'systemUltraThinMaterialDark'}
          intensity={80}
          style={StyleSheet.absoluteFill}
        />
        {children}
      </View>
    );
  }
  return (
    <View
      style={[styles.glassWrap, { backgroundColor: fallbackBg }, style]}
      accessibilityRole={accessibilityRole}
    >
      {children}
    </View>
  );
}

// ─── Submit button ───────────────────────────────────────────────────────────

interface SubmitButtonProps {
  isDay: boolean;
  palette: ColorPalette;
  input: typeof inputColors.day | typeof inputColors.night;
  canSubmit: boolean;
  isSearching: boolean;
  onPress: () => void;
}

function SubmitButton({ isDay, palette, input, canSubmit, isSearching, onPress }: SubmitButtonProps) {
  const disabled = !canSubmit;
  const opacity  = disabled && !isSearching ? 0.4 : 1;

  const content = isSearching
    ? <ActivityIndicator color={Platform.OS === 'ios' ? input.text : palette.background} />
    : <Text
        style={[
          styles.buttonText,
          { fontFamily: fonts.semibold, color: Platform.OS === 'ios' ? input.text : palette.background },
        ]}
      >
        {strings.location_cta}
      </Text>;

  if (Platform.OS === 'ios') {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={strings.location_cta}
        accessibilityState={{ disabled }}
        style={{ opacity }}
      >
        <BlurView
          tint={isDay ? 'systemMaterialLight' : 'systemMaterialDark'}
          intensity={80}
          style={styles.button}
        >
          {content}
        </BlurView>
      </Pressable>
    );
  }

  return (
    <Pressable
      style={[styles.button, { backgroundColor: palette.text, opacity }]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={strings.location_cta}
      accessibilityState={{ disabled }}
    >
      {content}
    </Pressable>
  );
}

// ─── Result area (idle / ready / empty / error) ──────────────────────────────

interface ResultAreaProps {
  isDay: boolean;
  palette: ColorPalette;
  input: typeof inputColors.day | typeof inputColors.night;
  placeSearch: ReturnType<typeof usePlaceSearch>;
  onSelect: (place: GeoResult) => void;
}

function ResultArea({ isDay, palette, input, placeSearch, onSelect }: ResultAreaProps) {
  const { status, results, errorKey } = placeSearch;

  if (status === 'idle' || status === 'loading') return null;

  if (status === 'empty' || status === 'error') {
    const messageKey = status === 'empty' ? 'search_no_results' : (errorKey ?? 'search_generic_error');
    return (
      <GlassSurface
        isDay={isDay}
        fallbackBg={input.bg}
        style={styles.messageCard}
        accessibilityRole="alert"
      >
        <TriangleAlert size={iconSize.sm} color={color.error} accessibilityElementsHidden />
        <Text
          style={[styles.messageText, { fontFamily: fonts.regular, color: input.text }]}
        >
          {strings[messageKey]}
        </Text>
      </GlassSurface>
    );
  }

  return (
    <GlassSurface
      isDay={isDay}
      fallbackBg={input.bg}
      style={styles.resultsCard}
    >
      <FlatList
        data={results}
        keyExtractor={(r) => String(r.id)}
        keyboardShouldPersistTaps="handled"
        ItemSeparatorComponent={() => (
          <View style={[styles.hairline, { backgroundColor: palette.textMuted }]} />
        )}
        renderItem={({ item }) => (
          <ResultRow place={item} input={input} palette={palette} onSelect={onSelect} />
        )}
      />
    </GlassSurface>
  );
}

// ─── Result row ──────────────────────────────────────────────────────────────

interface ResultRowProps {
  place: GeoResult;
  palette: ColorPalette;
  input: typeof inputColors.day | typeof inputColors.night;
  onSelect: (place: GeoResult) => void;
}

function ResultRow({ place, palette, input, onSelect }: ResultRowProps) {
  const { primary, secondary } = formatPlace(place);
  return (
    <Pressable
      style={styles.rowInner}
      onPress={() => onSelect(place)}
      accessibilityRole="button"
      accessibilityLabel={[primary, secondary].filter(Boolean).join(', ')}
    >
      <Text style={[styles.rowPrimary, { fontFamily: fonts.bold, color: input.text }]} numberOfLines={1}>
        {primary}
      </Text>
      {secondary ? (
        <Text style={[styles.rowSecondary, { fontFamily: fonts.regular, color: palette.textMuted }]} numberOfLines={1}>
          {secondary}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  back: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    width: size.iconBtn,
    height: size.iconBtn,
    borderRadius: radius.md,
    backgroundColor: color.btnOverlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    // Leaves room for the absolutely-positioned menu/GPS corner buttons
    // (size.iconBtn = 40 + spacing.xs = 8) plus visual breathing room.
    paddingBottom: size.iconBtn + spacing.xs + spacing.md,
    gap: spacing.md,
  },
  heading: {
    fontSize: fontSize.h2,
    textAlign: 'center',
  },
  subtext: {
    fontSize: fontSize.lg,
    textAlign: 'center',
  },
  glassWrap: {
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  inputWrap: {
    width: '100%',
    borderRadius: radius.sm,
  },
  input: {
    padding: spacing.md,
    fontSize: fontSize.base,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  error: {
    color: color.error,
    fontSize: fontSize.md,
    textAlign: 'center',
    flexShrink: 1,
  },
  button: {
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    minWidth: size.minBtnWidth,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: fontSize.base,
  },
  messageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.row,
  },
  messageText: {
    fontSize: fontSize.md,
    flexShrink: 1,
  },
  resultsCard: {
    flex: 1,
    borderRadius: radius.row,
  },
  rowInner: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowPrimary: {
    fontSize: fontSize.base,
  },
  rowSecondary: {
    fontSize: fontSize.sm,
    marginTop: 2,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    opacity: 0.3,
    marginHorizontal: spacing.md,
  },
  settingsLink: {
    fontSize: fontSize.md,
    textDecorationLine: 'underline',
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
