import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Custom header component that includes the menu button, title, and theme toggle.
// This is now native to the Tabs navigator header, not a separate View.
const CustomHeader = ({ title }:{title:string}) => {
  const router = useRouter();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const iconColor = darkMode ? '#fff' : '#1e293b';
  if(!title) title = "";

  return (
    <View style={[styles.headerContainer, darkMode && styles.darkHeaderContainer]}>
      {/* Drawer toggle button - you'll need to use a real drawer component later
          or rely on a `Stack` navigator for this. For now, it's a placeholder. */}
      <TouchableOpacity onPress={() => console.log('Open Drawer')} hitSlop={10}>
        <MaterialIcons name="menu" size={28} color={iconColor} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, darkMode && styles.darkText]}>{title}</Text>
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
  const iconColor = darkMode ? '#fff' : '#1E293B';

  return (
      <Tabs
        screenOptions={{
          headerShown: true, // We will show a custom header
          header: ({ options }) => <CustomHeader title={options.title} />,
          tabBarActiveTintColor: '#0a7ea4',
          tabBarInactiveTintColor: darkMode ? '#94a3b8' : '#64748b',
          tabBarStyle: [
            styles.tabBar,
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
