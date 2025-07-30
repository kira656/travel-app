import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const useSafeArea = () => {
  const insets = useSafeAreaInsets();
  
  return {
    top: insets.top,
    bottom: insets.bottom,
    left: insets.left,
    right: insets.right,
    horizontal: insets.left + insets.right,
    vertical: insets.top + insets.bottom,
    // Common padding styles
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
    // Safe area aware styles
    safeAreaStyle: {
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
    },
  };
}; 