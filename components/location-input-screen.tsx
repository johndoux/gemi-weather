import { strings } from '@/constants/strings';
import { color, fontSize, fonts, iconSize, radius, shadow, size, spacing } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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
  onDismiss?: () => void;
  setManualLocation: (text: string) => void;
  isResolving: boolean;
  error?: string;
  canAskAgain: boolean;
}

export function LocationInputScreen({
  onDismiss,
  setManualLocation,
  isResolving,
  error,
  canAskAgain,
}: LocationInputScreenProps) {
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();

  function handleSubmit() {
    if (!isResolving && text.trim()) setManualLocation(text);
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        {onDismiss && (
          <Pressable
            style={styles.back}
            onPress={onDismiss}
            hitSlop={spacing.xs}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <MaterialIcons name="chevron-left" size={iconSize.xl} color={color.iconBack} />
          </Pressable>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.heading, { fontFamily: fonts.bold }]}>{strings.location_heading}</Text>
          <Text style={[styles.subtext, { fontFamily: fonts.regular }]}>{strings.location_subtext}</Text>

          <TextInput
            style={[styles.input, { fontFamily: fonts.regular }]}
            placeholder={strings.location_placeholder}
            placeholderTextColor={color.inputPlaceholder}
            value={text}
            onChangeText={setText}
            returnKeyType="search"
            autoFocus
            onSubmitEditing={handleSubmit}
            autoCorrect={false}
            accessibilityLabel={strings.location_placeholder}
          />

          {error && (
            <Text
              style={[styles.error, { fontFamily: fonts.regular }]}
              accessibilityRole="alert"
            >
              {error}
            </Text>
          )}

          <Pressable
            style={styles.button}
            onPress={handleSubmit}
            disabled={isResolving}
            accessibilityRole="button"
            accessibilityLabel={strings.location_cta}
            accessibilityState={{ disabled: isResolving }}
          >
            {isResolving
              ? <ActivityIndicator color={color.white} />
              : <Text style={[styles.buttonText, { fontFamily: fonts.semibold }]}>{strings.location_cta}</Text>
            }
          </Pressable>

          {!canAskAgain && (
            <Pressable
              onPress={() => { Linking.openSettings().catch(() => {}); }}
              accessibilityRole="link"
              accessibilityLabel={strings.location_settings_link}
            >
              <Text style={[styles.settingsLink, { fontFamily: fonts.regular }]}>
                {strings.location_settings_link}
              </Text>
            </Pressable>
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: color.screenWarm,
  },
  back: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    width: size.iconBtn,
    height: size.iconBtn,
    borderRadius: radius.md,
    backgroundColor: color.brand,
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
    color: color.textWarm,
    textAlign: 'center',
  },
  subtext: {
    fontSize: fontSize.md,
    color: color.textSubtle,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: color.white,
    borderRadius: radius.sm,
    padding: spacing.md,
    fontSize: fontSize.base,
    color: color.textWarm,
    ...shadow.input,
  },
  error: {
    color: color.error,
    fontSize: fontSize.md,
    textAlign: 'center',
  },
  button: {
    backgroundColor: color.brand,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.md,
    minWidth: size.minBtnWidth,
    alignItems: 'center',
  },
  buttonText: {
    color: color.white,
    fontSize: fontSize.base,
  },
  settingsLink: {
    color: color.textLink,
    fontSize: fontSize.md,
    textDecorationLine: 'underline',
    marginTop: spacing.xs,
  },
});
