import { strings } from '@/constants/strings';
import { color, fontSize, fonts, iconSize, inputColors, radius, shadow, size, spacing } from '@/constants/theme';
import { ColorPalette, DEFAULT_PALETTE } from '@/constants/weather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { TriangleAlert } from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LocationInputScreenProps {
  palette?: ColorPalette;
  isDay?: boolean;
  onDismiss?: () => void;
  setManualLocation: (text: string) => void;
  isResolving: boolean;
  error?: string;
  canAskAgain: boolean;
}

export function LocationInputScreen({
  palette = DEFAULT_PALETTE,
  isDay = true,
  onDismiss,
  setManualLocation,
  isResolving,
  error,
  canAskAgain,
}: LocationInputScreenProps) {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();

  const input = isDay ? inputColors.day : inputColors.night;

  function handleSubmit() {
    if (!isResolving && text.trim()) setManualLocation(text);
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.heading, { fontFamily: fonts.bold, color: palette.text }]}>{strings.location_heading}</Text>
          <Text style={[styles.subtext, { fontFamily: fonts.regular, color: palette.textMuted }]}>{strings.location_subtext}</Text>

          <TextInput
            style={[styles.input, { fontFamily: fonts.regular, color: input.text, backgroundColor: input.bg }]}
            placeholder={strings.location_placeholder}
            placeholderTextColor={input.placeholder}
            value={text}
            onChangeText={setText}
            returnKeyType="search"
            autoFocus
            onSubmitEditing={handleSubmit}
            autoCorrect={false}
            accessibilityLabel={strings.location_placeholder}
          />

          {error && (
            <View style={styles.errorRow} accessibilityRole="alert" accessibilityLabel={error}>
              <TriangleAlert size={iconSize.sm} color={color.error} accessibilityElementsHidden />
              <Text style={[styles.error, { fontFamily: fonts.regular }]} accessibilityElementsHidden>
                {error}
              </Text>
            </View>
          )}

          {Platform.OS === 'ios' ? (
            <Pressable
              onPress={handleSubmit}
              disabled={isResolving}
              accessibilityRole="button"
              accessibilityLabel={strings.location_cta}
              accessibilityState={{ disabled: isResolving }}
            >
              <BlurView
                tint={isDay ? 'systemMaterialLight' : 'systemMaterialDark'}
                intensity={80}
                style={styles.button}
              >
                {isResolving
                  ? <ActivityIndicator color={input.text} />
                  : <Text style={[styles.buttonText, { fontFamily: fonts.semibold, color: input.text }]}>
                      {strings.location_cta}
                    </Text>
                }
              </BlurView>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.button, { backgroundColor: palette.text }]}
              onPress={handleSubmit}
              disabled={isResolving}
              accessibilityRole="button"
              accessibilityLabel={strings.location_cta}
              accessibilityState={{ disabled: isResolving }}
            >
              {isResolving
                ? <ActivityIndicator color={palette.background} />
                : <Text style={[styles.buttonText, { fontFamily: fonts.semibold, color: palette.background }]}>
                    {strings.location_cta}
                  </Text>
              }
            </Pressable>
          )}

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
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
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
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
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
  input: {
    width: '100%',
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: fontSize.base,
    ...shadow.input,
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
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buttonText: {
    fontSize: fontSize.base,
  },
  settingsLink: {
    fontSize: fontSize.md,
    textDecorationLine: 'underline',
    marginTop: spacing.xs,
  },
});
