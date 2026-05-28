import { strings } from '@/constants/strings';
import { color, fontSize, fonts, radius, spacing } from '@/constants/theme';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface ErrorScreenProps {
  message?: string;
  onRetry: () => void;
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{strings.error_emoji}</Text>
      <Text style={[styles.message, { fontFamily: fonts.regular }]}>
        {message ?? strings.error_message}
      </Text>
      <Pressable
        style={styles.button}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel={strings.error_retry}
      >
        <Text style={[styles.buttonText, { fontFamily: fonts.semibold }]}>
          {strings.error_retry}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.screenWarm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    padding: spacing.xxl,
  },
  emoji: {
    fontSize: fontSize.mark,
  },
  message: {
    fontSize: fontSize.lg,
    color: color.textMutedWarm,
    textAlign: 'center',
  },
  button: {
    backgroundColor: color.brand,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.sm,
  },
  buttonText: {
    color: color.white,
    fontSize: fontSize.base,
  },
});
