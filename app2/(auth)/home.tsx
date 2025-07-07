import { useAuth } from '@/stores/authStore.ts';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useTheme } from '../../stores/themeStore';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Home() {
  const { logout } = useAuth();
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useTheme();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
  });

  const drawerTranslateX = useState(new Animated.Value(-250))[0];

  const openDrawer = () => {
    Animated.timing(drawerTranslateX, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    Animated.timing(drawerTranslateX, {
      toValue: -250,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setDrawerOpen(false));
  };

  const toggleDrawer = () => {
    drawerOpen ? closeDrawer() : openDrawer();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/welcom');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {drawerOpen && (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX: drawerTranslateX }] },
          darkMode && styles.drawerDark,
        ]}
      >
        <View style={styles.drawerHeader}>
          <Text style={[styles.drawerTitle, darkMode && styles.darkText]}>Menu</Text>
          <Pressable onPress={closeDrawer} hitSlop={10}>
            <MaterialIcons
              name="close"
              size={28}
              color={darkMode ? '#fff' : '#1e293b'}
            />
          </Pressable>
        </View>

        <Pressable style={styles.drawerItem} onPress={() => router.push('/profile')}>
          <MaterialIcons name="person" size={22} color={darkMode ? '#fff' : '#333'} />
          <Text style={[styles.drawerText, darkMode && styles.darkText]}>Profile</Text>
        </Pressable>

        <Pressable style={styles.drawerItem} onPress={() => router.push('/settings')}>
          <MaterialIcons name="settings" size={22} color={darkMode ? '#fff' : '#333'} />
          <Text style={[styles.drawerText, darkMode && styles.darkText]}>Settings</Text>
        </Pressable>

        <Pressable style={styles.drawerItem} onPress={handleLogout}>
          <MaterialIcons name="logout" size={22} color={darkMode ? '#fff' : '#333'} />
          <Text style={[styles.drawerText, darkMode && styles.darkText]}>Logout</Text>
        </Pressable>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={toggleDrawer}>
            <MaterialIcons name="menu" size={28} color={darkMode ? '#fff' : '#1e293b'} />
          </Pressable>

          <Pressable onPress={toggleDarkMode} style={styles.darkModeToggle}>
            <MaterialIcons
              name={darkMode ? 'dark-mode' : 'light-mode'}
              size={28}
              color={darkMode ? '#fff' : '#1e293b'}
            />
          </Pressable>
        </View>

        {/* Body */}
        <View style={styles.content}>
          <Text style={[styles.title, darkMode && styles.darkText]}>Welcome to Travel App</Text>
          <Text style={[styles.subtitle, darkMode && styles.darkSubtext]}>
            Discover amazing destinations
          </Text>
        </View>

        {/* Bottom Nav */}
<View style={[styles.navBar, darkMode && styles.darkNavBar]}>
  <Pressable style={styles.navItem} onPress={() => router.push('/home')}>
    <MaterialIcons name="home" size={22} color={darkMode ? '#94a3b8' : '#666'} />
    <Text style={[styles.navText, darkMode && styles.darkNavText]}>Home</Text>
  </Pressable>

  <Pressable style={styles.navItem} onPress={() => router.push('/stays')}>
    <MaterialIcons name="hotel" size={22} color={darkMode ? '#94a3b8' : '#666'} />
    <Text style={[styles.navText, darkMode && styles.darkNavText]}>Stays</Text>
  </Pressable>

  <Pressable style={styles.navItem} onPress={() => router.push('/flights')}>
    <MaterialIcons name="flight" size={22} color={darkMode ? '#94a3b8' : '#666'} />
    <Text style={[styles.navText, darkMode && styles.darkNavText]}>Flights</Text>
  </Pressable>

  <Pressable style={styles.navItem} onPress={() => router.push('/taxi')}>
    <MaterialIcons name="directions-car" size={22} color={darkMode ? '#94a3b8' : '#666'} />
    <Text style={[styles.navText, darkMode && styles.darkNavText]}>Taxi</Text>
  </Pressable>
</View>
        </View>
      </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 5,
  },
  drawer: {
    position: 'absolute',
    width: 250,
    height: '100%',
    backgroundColor: '#f1f5f9',
    paddingTop: 40,
    paddingHorizontal: 16,
    zIndex: 10,
    elevation: 10,
    left: 0,
    top: 0,
  },
  drawerDark: {
    backgroundColor: '#1e293b',
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  drawerTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Regular',
    color: '#1e293b',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  drawerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  mainArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  darkModeToggle: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Regular',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#64748b',
    marginTop: 10,
  },
  darkSubtext: {
    color: '#a0a0a0',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
  },
  darkNavBar: {
    backgroundColor: '#1e293b',
    borderTopColor: '#334155',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 11,
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  darkNavText: {
    color: '#94a3b8',
  },
});
