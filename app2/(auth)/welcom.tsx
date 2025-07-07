import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../stores/themeStore';


export default function Welcome() {
  const router = useRouter();
  const { width } = Dimensions.get('window');
  const planeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { darkMode, toggleDarkMode } = useTheme();

  const [fontsLoaded] = useFonts({
    'Playfair-Bold': require('../../assets/fonts/PlayfairDisplay-Bold.ttf'),
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded) {
      Animated.timing(planeAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      }).start();

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        delay: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  const planePosition = planeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, width + 100],
  });

  const contentFade = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <Pressable style={styles.themeToggle} onPress={toggleDarkMode}>
        <MaterialIcons 
          name={darkMode ? 'dark-mode' : 'light-mode'} 
          size={24} 
          color={darkMode ? '#fff' : '#1e293b'} 
        />
      </Pressable>

      <View style={styles.inner}>
        <Animated.View
          style={[
            styles.plane,
            {
              transform: [{ translateX: planePosition }],
              top: '10%',
            },
          ]}
        >
          <Image
            source={require('../../assets/images/airplane.png')}
            style={styles.planeImage}
          />
        </Animated.View>

        <Animated.View style={[styles.content, { opacity: contentFade }]}>
          <Text style={[styles.title, darkMode && styles.darkText]}>Welcome to Travel-App</Text>
          <Text style={[styles.subtitle, darkMode && styles.darkSubtext]}>Your journey begins here</Text>

          <Pressable 
            style={[styles.button, darkMode && styles.darkButton]} 
            onPress={() => router.push('/(auth)/signup')}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </Pressable>

          <Pressable 
            style={[styles.button, darkMode && styles.darkButton]} 
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.buttonText}>Log In</Text>
          </Pressable>
          <Pressable 
            style={[styles.guestButton, darkMode && styles.guestButtonDark]}
            onPress={() => router.push('/(auth)/home')}
          >
            <Text style={[styles.guestButtonText, darkMode && styles.guestButtonTextDark]}>
              Continue as Guest
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  inner: {
    width: '85%',
    height: '100%',
  },
  content: {
    marginTop: 180,
    alignItems: 'center',
    gap: 20,
  },
  title: {
    fontSize: 32,
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  darkText: {
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 32,
    textAlign: 'center',
    fontFamily: 'Poppins-Regular',
  },
  darkSubtext: {
    color: '#a0a0a0',
  },
  button: {
    backgroundColor: '#3B82F6',
    width: 240,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  darkButton: {
    backgroundColor: '#1E40AF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  plane: {
    position: 'absolute',
    width: 100,
    height: 100,
    zIndex: 1,
  },
  planeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  themeToggle: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    zIndex: 2,
  },
    guestButton: {
    width: 240,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  guestButtonDark: {
    borderColor: '#1E40AF',
  },
  guestButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Poppins-Regular',
  },
  guestButtonTextDark: {
    color: '#1E40AF',
  },
});
