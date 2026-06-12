import { BlurView } from 'expo-blur';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

interface AdaptiveGlassProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AdaptiveGlass({ children, style }: AdaptiveGlassProps) {
  if (isLiquidGlassAvailable()) {
    return <GlassView style={style}>{children}</GlassView>;
  }
  return (
    <BlurView tint="systemMaterial" intensity={80} style={style}>
      {children}
    </BlurView>
  );
}
