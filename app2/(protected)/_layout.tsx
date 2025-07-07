import { useAuth } from '@/stores/authStor'
import { Redirect, Stack } from 'expo-router'

export default function ProtectedLayout() {
  const { user, isLoading } = useAuth()

  // While we’re fetching tokens from storage → splash or null
  if (isLoading) {
    return null // or <ActivityIndicator />
  }

  // Not signed in → kick to the welcome screen in (auth)
  if (!user) {
    return <Redirect href="/(auth)/welcom" />
  }
  return <Stack />
}
