import SafeAreaView from '@/components/SafeAreaView';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useThemeStore();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = () => {
    router.push('/(auth)/login');
  };

  const handleSignup = () => {
    router.push('/(auth)/signup');
  };

  const handleHome = () => {
    router.push('/(tabs)/(protected)/home');
  };

  const gradientColors = darkMode
    ? ['#1a1a2e', '#16213e', '#0f3460'] as const
    : ['#667eea', '#764ba2', '#f093fb'] as const;

  return (
    <SafeAreaView
      style={styles.container}
      backgroundColor={darkMode ? '#1a1a2e' : '#667eea'}
    >
      <LinearGradient
        colors={gradientColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Theme Toggle */}
        <TouchableOpacity
          style={[styles.themeToggle, darkMode && styles.darkThemeToggle]}
          onPress={toggleDarkMode}
        >
          <MaterialIcons
            name={darkMode ? 'light-mode' : 'dark-mode'}
            size={24}
            color="#fff"
          />
        </TouchableOpacity>

        {/* Main Content */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          {/* App Icon */}
          <View style={[styles.iconContainer, darkMode && styles.darkIconContainer]}>
            <MaterialIcons
              name="flight"
              size={80}
              color={darkMode ? '#0a7ea4' : '#fff'}
            />
          </View>

          {/* Title and Text */}
          <Text style={[styles.title, darkMode && styles.darkTitle]}>TravelApp</Text>
          <Text style={[styles.subtitle, darkMode && styles.darkSubtitle]}>
            Explore the world with ease
          </Text>
          <Text style={[styles.description, darkMode && styles.darkDescription]}>
            Discover amazing destinations, book flights, find hotels, and create unforgettable memories
          </Text>
        </Animated.View>

        {/* Action Buttons */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Login */}
          <TouchableOpacity
            style={[styles.loginButton, darkMode && styles.darkLoginButton]}
            onPress={handleLogin}
          >
            <MaterialIcons
              name="login"
              size={20}
              color={darkMode ? '#0a7ea4' : '#667eea'}
            />
            <Text style={[styles.loginButtonText, darkMode && styles.darkLoginButtonText]}>
              Login
            </Text>
          </TouchableOpacity>

          {/* Sign Up */}
          <TouchableOpacity
            style={[styles.signupButton, darkMode && styles.darkSignupButton]}
            onPress={handleSignup}
          >
            <MaterialIcons
              name="person-add"
              size={20}
              color="#fff"
            />
            <Text style={styles.signupButtonText}>
              Sign Up
            </Text>
          </TouchableOpacity>

          {/* Home */}
          {/* <TouchableOpacity
            style={[styles.homeButton, darkMode && styles.darkHomeButton]}
            onPress={handleHome}
          >
            <MaterialIcons
              name="home"
              size={20}
              color={darkMode ? '#fff' : '#0a7ea4'}
            />
            <Text style={[styles.homeButtonText, darkMode && styles.darkHomeButtonText]}>
              Go to Home
            </Text>
          </TouchableOpacity> */}
        </Animated.View>

        {/* Footer */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          <Text style={[styles.footerText, darkMode && styles.darkFooterText]}>
            © 2024 TravelApp. All rights reserved.
          </Text>
        </Animated.View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 60,
  },
  themeToggle: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  darkThemeToggle: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  darkIconContainer: {
    backgroundColor: 'rgba(10, 126, 164, 0.2)',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  darkTitle: {
    color: '#fff',
  },
  subtitle: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
    textAlign: 'center',
  },
  darkSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  darkDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 40,
    gap: 16,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  darkLoginButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  darkLoginButtonText: {
    color: '#0a7ea4',
  },
  signupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0a7ea4',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  darkSignupButton: {
    backgroundColor: '#0a7ea4',
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  darkHomeButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  homeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a7ea4',
  },
  darkHomeButtonText: {
    color: '#fff',
  },
  footer: {
    paddingHorizontal: 40,
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  darkFooterText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
