<<<<<<< HEAD
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Custom header component
const CustomHeader = ({ title }: { title: string }) => {
=======
import Drawer from '@/components/Drawer';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Tabs } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Custom header component that includes the menu button, title, and theme toggle.
// This is now native to the Tabs navigator header, not a separate View.
const CustomHeader = ({ title, onMenuPress }: { title: string; onMenuPress?: () => void }) => {
>>>>>>> 1c5dcb411cdf6b3e4c4ef5ddd536117b444362ea
  const { darkMode, toggleDarkMode } = useThemeStore();
  const insets = useSafeAreaInsets();
  const iconColor = darkMode ? '#fff' : '#1e293b';
<<<<<<< HEAD

  return (
    <View style={[styles.headerContainer, darkMode && styles.darkHeaderContainer]}>
      <TouchableOpacity onPress={() => console.log('Open Drawer')} hitSlop={10}>
=======
  if (!title) title = '';

  return (
    <View style={[styles.headerContainer, { paddingTop: insets.top + 10 }, darkMode && styles.darkHeaderContainer]}>
      <TouchableOpacity onPress={onMenuPress} hitSlop={10}>
>>>>>>> 1c5dcb411cdf6b3e4c4ef5ddd536117b444362ea
        <MaterialIcons name="menu" size={28} color={iconColor} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, darkMode && styles.darkText]}>{title || ''}</Text>
      <TouchableOpacity onPress={toggleDarkMode} hitSlop={10}>
        <MaterialIcons name={darkMode ? 'light-mode' : 'dark-mode'} size={28} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

export default function ProtectedLayout() {
  const { darkMode } = useThemeStore();
<<<<<<< HEAD
  const { isLoggedIn, isLoading } = useAuthStore();

  // 🔹 Wait for auth check before deciding
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // 🔹 If not logged in, boot out of protected area
  if (!isLoggedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        header: ({ options }) => <CustomHeader title={options.title} />,
        tabBarActiveTintColor: '#0a7ea4',
        tabBarInactiveTintColor: darkMode ? '#94a3b8' : '#64748b',
        tabBarStyle: [styles.tabBar, darkMode && styles.darkTabBar],
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="countries/index"
        options={{
          title: 'Countries',
          tabBarIcon: ({ color }) => <MaterialIcons name="public" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          href: null,
          title: 'Favorites',
          tabBarIcon: ({ color }) => <MaterialIcons name="favorite" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="countries/[countryId]/index"
        options={{ href: null, title: 'Country' }}
      />
      <Tabs.Screen
        name="countries/[countryId]/[cityId]/index"
        options={{ href: null, title: 'Details' }}
      />
    </Tabs>
=======
  const iconColor = darkMode ? '#fff' : '#1E293B';
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? '#0b1220' : '#fff' }}>
      <Tabs
        screenOptions={{
          headerShown: true, // We will show a custom header
          header: ({ options }) => <CustomHeader title={options.title!} onMenuPress={openDrawer} />,
          tabBarActiveTintColor: '#0a7ea4',
          tabBarInactiveTintColor: darkMode ? '#94a3b8' : '#64748b',
          tabBarStyle: [
            styles.tabBar,
            { paddingBottom: insets.bottom || 8 },
            darkMode && styles.darkTabBar,
          ],
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          }
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="countries/index"
          options={{
            title: 'Countries',
            tabBarIcon: ({ color }) => <MaterialIcons name="public" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            href: null, // This hides it from the tab bar
            title: 'Favorites',
            tabBarIcon: ({ color }) => <MaterialIcons name="favorite" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => <MaterialIcons name="person" size={24} color={color} />,
          }}
        />
        {/* These screens are not visible in the tab bar and are only accessible by navigation */}
        <Tabs.Screen
          name="countries/[countryId]/index"
          options={{ href: null, title: 'Country' }}
        />
        <Tabs.Screen
          name="countries/[countryId]/[cityId]/index"
          options={{ href: null, title: 'Details' }}
        />
      </Tabs>

      <Drawer visible={drawerVisible} onClose={closeDrawer}>
        <TouchableOpacity onPress={() => { closeDrawer(); }} style={{ paddingVertical: 12 }}>
          <Text>Close</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { router.push('/(tabs)/(protected)/home');closeDrawer(); }} style={{ paddingVertical: 12 }}>
          <Text>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { router.push('/(tabs)/(protected)/countries'); closeDrawer(); }} style={{ paddingVertical: 12 }}>
          <Text>Countries</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { router.push('/(tabs)/(protected)/profile'); closeDrawer(); }} style={{ paddingVertical: 12 }}>
          <Text>Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { router.push('/(tabs)/(protected)/favorites'); closeDrawer(); }} style={{ paddingVertical: 12 }}>
          <Text>Favorates</Text>
        </TouchableOpacity>
      </Drawer>
    </View>
>>>>>>> 1c5dcb411cdf6b3e4c4ef5ddd536117b444362ea
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  darkHeaderContainer: {
    backgroundColor: '#121212',
    borderBottomColor: '#334155',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
  },
  darkText: {
    color: '#fff',
  },
  tabBar: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#fff',
    paddingVertical: 4,
    height: 60,
  },
  darkTabBar: {
    backgroundColor: '#1e293b',
    borderTopColor: '#334155',
  },
});
