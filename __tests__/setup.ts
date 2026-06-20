// ── Worklets ─────────────────────────────────────────────────────────────────
jest.mock('react-native-worklets', () => require('react-native-worklets/lib/module/mock'));

// ── Reanimated ───────────────────────────────────────────────────────────────
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  Reanimated.useReducedMotion  = () => false;
  Reanimated.useFrameCallback  = () => {};
  Reanimated.ReduceMotion = { System: 'system', Always: 'always', Never: 'never' };
  return Reanimated;
});

// ── expo-image ───────────────────────────────────────────────────────────────
jest.mock('expo-image', () => ({
  Image: 'Image',
}));

// ── expo-linear-gradient ─────────────────────────────────────────────────────
jest.mock('expo-linear-gradient', () => ({
  LinearGradient: 'LinearGradient',
}));

// ── expo-haptics ─────────────────────────────────────────────────────────────
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Medium: 'Medium' },
}));

// ── expo-router ───────────────────────────────────────────────────────────────
jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useFocusEffect: jest.fn(),
}));

// ── expo-store-review ─────────────────────────────────────────────────────────
jest.mock('expo-store-review', () => ({
  storeUrl: jest.fn().mockResolvedValue(null),
}));

// ── expo-iap ─────────────────────────────────────────────────────────────────
jest.mock('expo-iap', () => ({
  initConnection: jest.fn(),
  fetchProducts: jest.fn().mockResolvedValue([]),
  requestPurchase: jest.fn(),
  finishTransaction: jest.fn(),
  purchaseUpdatedListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
  endConnection: jest.fn(),
}));

// ── react-native-safe-area-context ───────────────────────────────────────────
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: any) => children,
}));

// ── lucide-react-native ──────────────────────────────────────────────────────
jest.mock('lucide-react-native', () => {
  const React = require('react');
  const { View } = require('react-native');
  const icon = (name: string) => (props: any) =>
    React.createElement(View, { testID: `icon-${name}`, ...props });
  return {
    Sun: icon('Sun'), Moon: icon('Moon'), Cloud: icon('Cloud'),
    Haze: icon('Haze'), CloudDrizzle: icon('CloudDrizzle'),
    CloudRain: icon('CloudRain'), Snowflake: icon('Snowflake'),
    Zap: icon('Zap'), MapPin: icon('MapPin'), TriangleAlert: icon('TriangleAlert'),
  };
});

// ── @expo/vector-icons ────────────────────────────────────────────────────────
jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

// ── Weather context ───────────────────────────────────────────────────────────
jest.mock('@/contexts/weather-context', () => ({
  useWeatherContext: jest.fn(),
}));
