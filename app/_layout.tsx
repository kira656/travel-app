// app/_layout.tsx
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

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (isLoggedIn && inAuthGroup) {
      // Correctly redirect to the protected group's root
      router.replace('/(tabs)/(protected)/countries'); 
    } else if (!isLoggedIn && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
  }, [isLoggedIn, isLoading, segments, router]);

  return <Slot />; // Slot is crucial here
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