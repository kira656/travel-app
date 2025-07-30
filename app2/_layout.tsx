import { useColorScheme } from '@/hooks/useColorScheme'
import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function RootLayout() {
  const colorScheme = useColorScheme()
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  })

  if (!loaded) {
    // Async font loading only occurs in development.
    return null
  }

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </SafeAreaProvider>
  )
}
