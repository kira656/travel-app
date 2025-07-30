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

  // Use the built-in SafeAreaView for automatic handling
  return (
    <RNSafeAreaView
      style={[{ backgroundColor }, style]}
      edges={edges}
    >
      {children}
    </RNSafeAreaView>
  );
};

export default SafeAreaView; 