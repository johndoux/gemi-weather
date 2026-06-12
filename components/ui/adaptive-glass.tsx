import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

interface AdaptiveGlassProps {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function AdaptiveGlass({ children, style }: AdaptiveGlassProps) {
  return <View style={style}>{children}</View>;
}
