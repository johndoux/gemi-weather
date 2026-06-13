export interface AckEntry {
  name: string;
  url: string;
}

export interface AckSection {
  header: string;
  items: AckEntry[];
}

export const ACK_SECTIONS: AckSection[] = [
  {
    header: 'WEATHER DATA',
    items: [
      { name: 'Open-Meteo', url: 'https://open-meteo.com' },
    ],
  },
  {
    header: 'FONTS',
    items: [
      { name: 'Nunito (Vernon Adams)', url: 'https://fonts.google.com/specimen/Nunito' },
    ],
  },
  {
    header: 'ICONS',
    items: [
      { name: '@expo/vector-icons', url: 'https://github.com/expo/vector-icons' },
    ],
  },
  {
    header: 'FRAMEWORK & TOOLING',
    items: [
      { name: 'React',                          url: 'https://reactjs.org' },
      { name: 'React Native',                   url: 'https://reactnative.dev' },
      { name: 'Expo',                           url: 'https://expo.dev' },
      { name: 'Expo Router',                    url: 'https://docs.expo.dev/router/introduction' },
      { name: 'Expo Image',                     url: 'https://docs.expo.dev/versions/latest/sdk/image' },
      { name: 'Expo Linear Gradient',           url: 'https://docs.expo.dev/versions/latest/sdk/linear-gradient' },
      { name: 'Expo Location',                  url: 'https://docs.expo.dev/versions/latest/sdk/location' },
      { name: 'Expo Haptics',                   url: 'https://docs.expo.dev/versions/latest/sdk/haptics' },
      { name: 'Expo Secure Store',              url: 'https://docs.expo.dev/versions/latest/sdk/securestore' },
      { name: 'Expo Store Review',              url: 'https://docs.expo.dev/versions/latest/sdk/storereview' },
      { name: 'Expo IAP',                       url: 'https://github.com/expo/expo/tree/main/packages/expo-iap' },
      { name: 'React Native Reanimated',        url: 'https://docs.swmansion.com/react-native-reanimated' },
      { name: 'React Native Gesture Handler',   url: 'https://docs.swmansion.com/react-native-gesture-handler' },
      { name: 'React Native Safe Area Context', url: 'https://github.com/th3rdwave/react-native-safe-area-context' },
    ],
  },
];
