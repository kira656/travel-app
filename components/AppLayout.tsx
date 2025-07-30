import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface AppLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
  headerTitle?: string;
  showBackButton?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showHeader = true,
  headerTitle,
  showBackButton = false,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useThemeStore();
  const { logout, user } = useAuthStore();
  const isLoggedIn = !!user;

  const [drawerOpen, setDrawerOpen] = useState(false);
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

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const getCurrentTab = () => {
    if (pathname.includes('/home') || pathname === '/(tabs)') return 'home';
    if (pathname.includes('/countries')) return 'countries';
    if (pathname.includes('/profile')) return 'profile';
    return 'home';
  };

  const currentTab = getCurrentTab();

  const navigateToTab = (tab: string) => {
    switch (tab) {
      case 'home':
        router.push('/(tabs)');
        break;
      case 'countries':
        router.push('/(tabs)/(protected)/countries');
        break;
      case 'profile':
        router.push('/(tabs)/(protected)/profile');
        break;
    }
  };

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Overlay for drawer */}
      {drawerOpen && (
        <TouchableWithoutFeedback onPress={closeDrawer}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>
      )}

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          { transform: [{ translateX: drawerTranslateX }] },
          darkMode && styles.darkDrawer,
        ]}
      >
        <View style={styles.drawerHeader}>
          <Text style={[styles.drawerTitle, darkMode && styles.darkText]}>Menu</Text>
          <TouchableOpacity onPress={closeDrawer} hitSlop={10}>
            <MaterialIcons
              name="close"
              size={28}
              color={darkMode ? '#fff' : '#1e293b'}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.drawerItem}
          onPress={() => {
            router.push('/(tabs)/(protected)/countries');
            closeDrawer();
          }}
        >
          <MaterialIcons name="public" size={22} color={darkMode ? '#fff' : '#333'} />
          <Text style={[styles.drawerText, darkMode && styles.darkText]}>Countries</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
          <MaterialIcons name="logout" size={22} color={darkMode ? '#fff' : '#333'} />
          <Text style={[styles.drawerText, darkMode && styles.darkText]}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main Content */}
      <View style={styles.mainArea}>
        {/* Header */}
        {showHeader && (
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              {showBackButton ? (
                <TouchableOpacity onPress={handleBack} hitSlop={10}>
                  <MaterialIcons
                    name="arrow-back"
                    size={28}
                    color={darkMode ? '#fff' : '#1e293b'}
                  />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={openDrawer} hitSlop={10}>
                  <MaterialIcons
                    name="menu"
                    size={28}
                    color={darkMode ? '#fff' : '#1e293b'}
                  />
                </TouchableOpacity>
              )}
              {headerTitle && (
                <Text style={[styles.headerTitle, darkMode && styles.darkText]}>
                  {headerTitle}
                </Text>
              )}
            </View>

            <TouchableOpacity onPress={toggleDarkMode} hitSlop={10}>
              <MaterialIcons
                name={darkMode ? 'light-mode' : 'dark-mode'}
                size={28}
                color={darkMode ? '#fff' : '#1e293b'}
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Page Content */}
        <View style={styles.content}>
          {children}
        </View>

        {/* Bottom Navigation */}
        <View style={[styles.navBar, darkMode && styles.darkNavBar]}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigateToTab('home')}
          >
            <MaterialIcons
              name="home"
              size={24}
              color={currentTab === 'home' ? (darkMode ? '#0a7ea4' : '#0a7ea4') : (darkMode ? '#94a3b8' : '#64748b')}
            />
            <Text style={[
              styles.navText,
              currentTab === 'home' ? styles.activeNavText : {},
              darkMode && styles.darkNavText,
              currentTab === 'home' && darkMode && styles.darkActiveNavText,
            ]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigateToTab('countries')}
          >
            <MaterialIcons
              name="public"
              size={24}
              color={currentTab === 'countries' ? (darkMode ? '#0a7ea4' : '#0a7ea4') : (darkMode ? '#94a3b8' : '#64748b')}
            />
            <Text style={[
              styles.navText,
              currentTab === 'countries' ? styles.activeNavText : {},
              darkMode && styles.darkNavText,
              currentTab === 'countries' && darkMode && styles.darkActiveNavText,
            ]}>
              Countries
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => navigateToTab('profile')}
          >
            <MaterialIcons
              name={isLoggedIn ? 'person' : 'login'}
              size={24}
              color={currentTab === 'profile' ? (darkMode ? '#0a7ea4' : '#0a7ea4') : (darkMode ? '#94a3b8' : '#64748b')}
            />
            <Text style={[
              styles.navText,
              currentTab === 'profile' ? styles.activeNavText : {},
              darkMode && styles.darkNavText,
              currentTab === 'profile' && darkMode && styles.darkActiveNavText,
            ]}>
              {isLoggedIn ? 'Profile' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  darkDrawer: {
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
    paddingHorizontal: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  drawerText: {
    marginLeft: 15,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#1e293b',
  },
  mainArea: {
    flex: 1,
  },
  header: {
    paddingTop: 10,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Regular',
    color: '#1e293b',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
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
    flex: 1,
  },
  navText: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  activeNavText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  darkNavText: {
    color: '#94a3b8',
  },
  darkActiveNavText: {
    color: '#0a7ea4',
  },
  darkText: {
    color: '#fff',
  },
});

export default AppLayout; 