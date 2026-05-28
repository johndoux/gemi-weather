import { SpritePreloader } from '@/components/sprite-preloader';
import { WeatherProvider } from '@/contexts/weather-context';
import { Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function Layout() {
  return (
    <WeatherProvider>
      {Platform.OS !== 'android' && <SpritePreloader />}
      <Stack screenOptions={{ headerShown: false, animation: 'none' }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="location"
          options={{
            presentation: 'fullScreenModal',
            animation: 'none',
            gestureEnabled: false,
          }}
        />
      </Stack>
    </WeatherProvider>
  );
}
