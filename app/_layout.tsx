import {
  Nunito_400Regular,
  Nunito_500Medium,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_900Black,
  useFonts,
} from '@expo-google-fonts/nunito';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated'; // required side-effect for Reanimated on the new architecture

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_900Black,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  // Keep splash screen visible (via preventAutoHideAsync) until fonts resolve.
  // If loading fails, render with system fallback rather than blocking forever.
  if (!fontsLoaded && !fontError) return null;

  return (
    <>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="acknowledgements"
          options={{ presentation: 'formSheet', sheetGrabberVisible: true, headerShown: false }}
        />
        <Stack.Screen
          name="tip-jar"
          options={{ presentation: 'formSheet', sheetGrabberVisible: true, headerShown: false }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
