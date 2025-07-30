import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...' 
}) => {
  const { darkMode } = useThemeStore();

  return (
    <LinearGradient
      colors={darkMode 
        ? ['#151718', '#1a1b1c', '#0f1011'] 
        : ['#fff', '#f8fafc', '#e2e8f0']
      }
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <MaterialIcons 
            name="flight" 
            size={60} 
            color={darkMode ? '#0a7ea4' : '#0a7ea4'} 
          />
        </View>
        
        <Text style={[styles.appName, darkMode && styles.darkText]}>
          TravelApp
        </Text>
        
        <ActivityIndicator 
          size="large" 
          color={darkMode ? '#0a7ea4' : '#0a7ea4'} 
          style={styles.spinner}
        />
        
        <Text style={[styles.message, darkMode && styles.darkSubtext]}>
          {message}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 30,
  },
  darkText: {
    color: '#ECEDEE',
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#687076',
    textAlign: 'center',
  },
  darkSubtext: {
    color: '#9BA1A6',
  },
});

export default LoadingScreen; 