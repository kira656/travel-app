import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { darkMode } = useThemeStore();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const profileOptions = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: 'person',
      onPress: () => router.push('/account/personal'),
    },
    {
      id: 'bookings',
      title: 'My Bookings',
      icon: 'flight',
      onPress: () => console.log('My Bookings'),
    },
    {
      id: 'favorites',
      title: 'Favorites',
      icon: 'favorite',
      onPress: () => console.log('Favorites'),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'settings',
      onPress: () => router.push('/account/settings'),
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: 'help',
      onPress: () => console.log('Help & Support'),
    },
  ];

  return (
    
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={[styles.profileHeader, darkMode && styles.darkProfileHeader]}>
          <View style={[styles.avatarContainer, darkMode && styles.darkAvatarContainer]}>
            <MaterialIcons
              name="person"
              size={48}
              color={darkMode ? '#0a7ea4' : '#0a7ea4'}
            />
          </View>
          <Text style={[styles.userName, darkMode && styles.darkText]}>
            {user?.name || 'Travel User'}
          </Text>
          <Text style={[styles.userEmail, darkMode && styles.darkSubtext]}>
            {user?.email || 'user@example.com'}
          </Text>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsContainer}>
          {profileOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[styles.optionItem, darkMode && styles.darkOptionItem]}
              onPress={option.onPress}
            >
              <View style={styles.optionLeft}>
                <MaterialIcons
                  name={option.icon as any}
                  size={24}
                  color={darkMode ? '#0a7ea4' : '#0a7ea4'}
                />
                <Text style={[styles.optionTitle, darkMode && styles.darkText]}>
                  {option.title}
                </Text>
              </View>
              <MaterialIcons
                name="chevron-right"
                size={20}
                color={darkMode ? '#666' : '#999'}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[styles.logoutButton, darkMode && styles.darkLogoutButton]}
          onPress={handleLogout}
        >
          <MaterialIcons
            name="logout"
            size={20}
            color="#ff6b6b"
          />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, darkMode && styles.darkSubtext]}>
            TravelApp v1.0.0
          </Text>
        </View>
      </ScrollView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
    marginBottom: 20,
  },
  darkProfileHeader: {
    backgroundColor: '#1e293b',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  darkAvatarContainer: {
    backgroundColor: '#334155',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#64748b',
  },
  optionsContainer: {
    paddingHorizontal: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkOptionItem: {
    backgroundColor: '#1e293b',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionTitle: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkLogoutButton: {
    backgroundColor: '#1e293b',
  },
  logoutText: {
    fontSize: 16,
    color: '#ff6b6b',
    marginLeft: 8,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  versionText: {
    fontSize: 12,
    color: '#64748b',
  },
  darkText: {
    color: '#fff',
  },
  darkSubtext: {
    color: '#9BA1A6',
  },
});