// app/_layout.tsx
import SafeAreaView from '@/components/SafeAreaView';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AppStateStatus, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

const InitialLayout = () => {
  const { isLoggedIn, isLoading } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const { darkMode } = useThemeStore();

  useEffect(() => {
    if (isLoading) return;

    // Allow the splash screen (root '/') to be shown without redirecting.
    // When segments is empty (root), do not redirect here — let `app/index.tsx` handle it.
    const currentRoot = segments[0];
    const isRoot = !currentRoot; // true when at '/'
    const inAuthGroup = currentRoot === '(auth)';

    if (isLoggedIn && inAuthGroup) {
      // Redirect logged-in users away from auth pages into protected area
      router.replace('/(tabs)/(protected)/countries');
    } else if (!isLoggedIn && !inAuthGroup && !isRoot) {
      // Only redirect unauthenticated users if they are NOT on the root splash page
      router.replace('/(auth)/login');
    }
  }, [isLoggedIn, isLoading, segments, router]);

  // Wrap Slot in a themed SafeArea so background colors apply app-wide
  return (
    // Avoid forcing bottom safe-area padding at the root so tab navigator can handle it
    <SafeAreaView style={{ flex: 1 }} backgroundColor={darkMode ? '#0b1220' : '#fff'} edges={['top', 'left', 'right']}>
      <Slot />
    </SafeAreaView>
  );
};

export default function RootLayout() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrapAuth);
  const loadTheme = useThemeStore((state) => state.loadTheme);

  useEffect(() => {
    bootstrapAuth();
    loadTheme();
  }, [bootstrapAuth, loadTheme]);


  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <InitialLayout />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}