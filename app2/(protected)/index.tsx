import { useAuth } from '@/stores/authStore.ts'
import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function Welcome() {
  const { logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const handelLogout = async () => {
    try {
      await logout()

      // 3️⃣  go to the protected/home stack now that the user is authenticated
      router.replace('/(auth)/welcom') // adjust to your route
    } catch (err: any) {
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Travel-App</Text>


      <Pressable onPress={handelLogout}>
        <Text style={styles.buttonTxt}>logout</Text>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    color: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    padding: 24,
  },
  title: { fontSize: 24, fontWeight: '600', marginBottom: 32, color: '#fff' },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 8,
    backgroundColor: '#467cff',
    width: 220,
    alignItems: 'center',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#467cff',
  },
  buttonTxt: { color: 'black', fontWeight: '500' },
})
