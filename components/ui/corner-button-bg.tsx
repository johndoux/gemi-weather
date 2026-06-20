import { color, radius, size } from '@/constants/theme';
import { BlurView } from 'expo-blur';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

interface CornerButtonBgProps {
  isDay: boolean;
  children: ReactNode;
}

export function CornerButtonBg({ isDay, children }: CornerButtonBgProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        tint={isDay ? 'systemMaterialLight' : 'systemMaterialDark'}
        intensity={80}
        style={styles.circle}
      >
        {children}
      </BlurView>
    );
  }
  return (
    <View style={[styles.circle, { backgroundColor: color.btnOverlay }]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: size.iconBtn,
    height: size.iconBtn,
    borderRadius: radius.md,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
