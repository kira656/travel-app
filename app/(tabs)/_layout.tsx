
import { useAuthStore } from '@/stores/authStore'
import { Stack } from 'expo-router'
import React from 'react'

export function AppNavigator() {
  const { isLoggedIn } = useAuthStore() // ✅ Now it's safe because AuthProvider wraps this

  return (
    <Stack>
      <Stack.Protected guard={isLoggedIn}>
      <Stack.Screen name='profile'/>
      </Stack.Protected>
            <Stack.Protected guard={!isLoggedIn}>
      <Stack.Screen name='login'/>
      </Stack.Protected>
    </Stack>
    
  )
}
