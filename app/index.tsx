import LoadingScreen from '@/components/LoadingScreen';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import SplashScreen from './splash';

export default function Index() {
  const router = useRouter();
  const { isLoggedIn, isLoading } = useAuthStore();

  useEffect(() => {
    // If auth is still loading, stay on splash
    if (isLoading) {
      return;
    }

    // If user is logged in, redirect to main app
    if (isLoggedIn) {
      router.replace('/(tabs)');
    }
    // If user is not logged in, stay on splash screen (user will choose login/signup)
  }, [isLoggedIn, isLoading, router]);

  // Show loading indicator while checking auth status
  if (isLoading) {
    return <LoadingScreen message="Initializing..." />;
  }

  // Show splash screen if not logged in
  if (!isLoggedIn) {
    return <SplashScreen />;
  }

  // This should not be reached, but just in case
  return null;
}

 