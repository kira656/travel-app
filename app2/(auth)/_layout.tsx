// app/(auth)/_layout.tsx
import { useAuth } from '@/stores/authStore'
import { Redirect, Stack } from 'expo-router'

export default function AuthLayout() {
  const { user, isLoading } = useAuth()

  if (isLoading) return null

  // Already signed in → straight to protected home
  if (user) {
    return <Redirect href="/(protected)" /> // adjust to your landing page
  }

  return <Stack screenOptions={{ headerShown: false }} />
}
