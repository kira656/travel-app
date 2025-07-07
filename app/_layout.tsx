// app/layout.tsx
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
const queryClient = new QueryClient();

// Configure the onlineManager for network status
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Configure the focusManager for app foreground/background status
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

export default function RootLayout() {
  const colorScheme = useColorScheme(); // This hook might need to be adjusted or removed if its logic is now entirely in your themeStore

  // Get actions from Zustand stores
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);
  const loadTheme = useThemeStore((state) => state.loadTheme); // Get the loadTheme action

  // useEffect for AppState listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  // useEffect to call bootstrapAuth and loadTheme once when the app mounts
  useEffect(() => {
    bootstrapAuth();
    loadTheme(); // Call loadTheme here as well
  }, [bootstrapAuth, loadTheme]); // Both are stable function references

  // Font loading
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  // No ThemeProvider needed anymore!
  return (
    <QueryClientProvider client={queryClient}>
      <Slot />
    </QueryClientProvider>
  );
}