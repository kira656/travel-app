import React from 'react';
import { View, ViewStyle } from 'react-native';
import { SafeAreaView as RNSafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaViewProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: string;
}

export const SafeAreaView: React.FC<SafeAreaViewProps> = ({
  children,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor,
}) => {
  const insets = useSafeAreaInsets();

  // If we want to handle safe areas manually
  if (edges.length === 0) {
    return (
      <View style={[{ backgroundColor }, style]}>
        {children}
      </View>
    );
  }

  // Ensure the safe area view fills the full screen and applies background color
  return (
    <RNSafeAreaView
      style={[{ backgroundColor, flex: 1, paddingTop: edges.includes('top') ? insets.top : 0, paddingBottom: edges.includes('bottom') ? insets.bottom : 0 }, style]}
      edges={edges}
    >
      {children}
    </RNSafeAreaView>
  );
};

export default SafeAreaView; 