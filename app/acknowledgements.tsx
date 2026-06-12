import { AdaptiveGlass } from '@/components/ui/adaptive-glass';
import { ACKNOWLEDGEMENTS } from '@/constants/acknowledgements';
import { strings } from '@/constants/strings';
import { color, fontSize, fonts, iconSize, spacing } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Stack } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

function Divider() {
  return <View style={styles.divider} />;
}

export default function AcknowledgementsScreen() {
  return (
    <AdaptiveGlass style={styles.container}>
      <Stack.Screen
        options={{
          title: strings.menu_acknowledgements,
          presentation: 'formSheet',
          sheetGrabberVisible: true,
          contentStyle: { backgroundColor: 'transparent' },
        }}
      />
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {ACKNOWLEDGEMENTS.map((lib, i) => (
          <View key={lib.name}>
            {i > 0 && <Divider />}
            <Pressable
              style={styles.row}
              onPress={() => Linking.openURL(lib.url)}
              accessibilityRole="link"
              accessibilityLabel={lib.name}
            >
              <Text style={[styles.name, { fontFamily: fonts.regular }]}>{lib.name}</Text>
              <MaterialIcons name="open-in-new" size={iconSize.sm} color={color.ink} />
            </Pressable>
          </View>
        ))}
        <Text style={[styles.dataSource, { fontFamily: fonts.regular }]}>
          {strings.ack_data_source}
        </Text>
      </ScrollView>
    </AdaptiveGlass>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.xl,
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.xxs,
  },
  name: {
    fontSize: fontSize.base,
    color: color.black,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: color.divider,
    marginVertical: spacing.md,
  },
  dataSource: {
    fontSize: fontSize.xs,
    color: color.textFaint,
    textAlign: 'center',
    paddingTop: spacing.md,
  },
});
