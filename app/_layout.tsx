// app/_layout.tsx
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import NetInfo from '@react-native-community/netinfo';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const queryClient = new QueryClient();

onlineManager.setEventListener((setOnline) =>
  NetInfo.addEventListener((state) => setOnline(!!state.isConnected))
);

export default function RootLayout() {
  const bootstrapAuth = useAuthStore((s) => s.bootstrapAuth);
  const isLoadingAuth = useAuthStore((s) => s.isLoading);
  const loadTheme = useThemeStore((s) => s.loadTheme);
  const isThemeReady = useThemeStore((s) => s.isReady ?? true); // adjust if you track this

  useEffect(() => {
    bootstrapAuth();
    loadTheme();
  }, [bootstrapAuth, loadTheme]);

  const loading = isLoadingAuth || !isThemeReady;

  if (loading) {
    return (
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" />
          </View>
        </QueryClientProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <Slot />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
