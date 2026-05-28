import {
  VarelaRound_400Regular,
  useFonts,
} from '@expo-google-fonts/varela-round';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    VarelaRound_400Regular,
  });

  // Wait for fonts on every platform. If loading fails, render with system
  // fallback rather than blocking forever.
  if (!fontsLoaded && !fontError) return null;

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
