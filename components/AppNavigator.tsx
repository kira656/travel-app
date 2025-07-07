import { useAuth } from '@/stores/authStore.ts'
import { Ionicons } from '@expo/vector-icons'
import { Stack, Tabs } from 'expo-router'

export function AppNavigator() {
  const { isLoggedIn } = useAuth()

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#aaa',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="hotels"
          options={{
            title: 'Hotels',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="bed-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            title: 'Favorites',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="heart-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen name="signup" options={{ href: null }} />
        <Tabs.Screen
          name={isLoggedIn ? 'profile' : 'login'}
          options={{
            title: isLoggedIn ? 'Profile' : 'Login',
            tabBarIcon: ({ color, size }) => (
              <Ionicons
                name={isLoggedIn ? 'person-outline' : 'log-in-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tabs>
      <Stack.Screen name="+not-found" />
    </Stack>
  )
}
