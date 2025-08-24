import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Custom header component
const CustomHeader = ({ title }: { title: string }) => {
  const { darkMode, toggleDarkMode } = useThemeStore();
  const iconColor = darkMode ? '#fff' : '#1e293b';

  return (
    <View style={[styles.headerContainer, darkMode && styles.darkHeaderContainer]}>
      <TouchableOpacity onPress={() => console.log('Open Drawer')} hitSlop={10}>
        <MaterialIcons name="menu" size={28} color={iconColor} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, darkMode && styles.darkText]}>{title || ''}</Text>
      <TouchableOpacity onPress={toggleDarkMode} hitSlop={10}>
        <MaterialIcons
          name={darkMode ? 'light-mode' : 'dark-mode'}
          size={28}
          color={iconColor}
        />
      </TouchableOpacity>
    </View>
  );
};

export default function ProtectedLayout() {
  const { darkMode } = useThemeStore();
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
