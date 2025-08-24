import { useAuthStore } from '@/stores/authStore';
import { Redirect, Stack } from 'expo-router';

export default function AuthLayout() {
  const { isLoggedIn, isLoading } = useAuthStore();

  if (isLoading) return null;
  if (isLoggedIn) return <Redirect href="/(tabs)/(protected)/countries" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
