import notificationsApi from '@/apis/notifications';
import Drawer from '@/components/Drawer';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { Redirect, router, Tabs } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// 🎨 Centralized theme colors
const getThemeColors = (dark: boolean) => ({
  bgScreen: dark ? '#0b1220' : '#ffffff',
  bgHeader: dark ? '#121212' : '#ffffff',
  bgTab: dark ? '#1e293b' : '#ffffff',
  border: dark ? '#334155' : '#e2e8f0',
  text: dark ? '#ffffff' : '#1e293b',
  tabActive: dark ? '#4fd1c5' : '#0a7ea4',
  tabInactive: dark ? '#94a3b8' : '#64748b',
});

const CustomHeader = ({
  title,
  onMenuPress,
}: {
  title: string;
  onMenuPress?: () => void;
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { darkMode, toggleDarkMode } = useThemeStore();
  const insets = useSafeAreaInsets();
  const colors = getThemeColors(darkMode);

  return (
    <View
      style={[
        styles.headerContainer,
        {
          paddingTop: insets.top + 10,
          backgroundColor: colors.bgTab,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity onPress={onMenuPress} hitSlop={10}>
        <MaterialIcons name="menu" size={28} color={colors.text} />
      </TouchableOpacity>
      <Text style={[styles.headerTitle, { color: colors.text }]}>{title || ''}</Text>
      <TouchableOpacity onPress={toggleDarkMode} hitSlop={10}>
        <MaterialIcons
          name={darkMode ? 'light-mode' : 'dark-mode'}
          size={28}
          color={colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

export default function ProtectedLayout() {
  const { darkMode } = useThemeStore();
  const { isLoggedIn, isLoading } = useAuthStore();
  const { token } = useAuthStore();
  const logged = isLoggedIn; // derive from auth store
  const insets = useSafeAreaInsets();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const colors = getThemeColors(darkMode);

  // Android back button: close drawer if open, navigate back if possible, else allow default
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (drawerVisible) {
          setDrawerVisible(false);
          return true; // handled
        }
        if (router.canGoBack()) {
          router.back();
          return true; // handled
        }
        return false; // let the system handle (e.g., exit app)
      };
      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [drawerVisible])
  );

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bgScreen }]}>
        <ActivityIndicator size="large" color={colors.tabActive} />
      </View>
    );
  }

  if (!logged) {
    return <Redirect href="/(auth)/login" />;
  }

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const { data: notificationsData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getNotifications(token ?? undefined),
    enabled: !!logged,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bgScreen }} edges={["top", "left", "right"]}>
      <Tabs
        screenOptions={{
          headerShown: true,
          header: ({ options }) => (
            <CustomHeader title={options.title!} onMenuPress={openDrawer} />
          ),
          tabBarActiveTintColor: colors.tabActive,
          tabBarInactiveTintColor: colors.tabInactive,
          tabBarStyle: [
            styles.tabBar,
            {
              backgroundColor: colors.bgTab,
              borderTopColor: colors.border,
            },
          ],
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="home" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="countries/index"
          options={{
            title: 'Countries',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="public" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="favorites"
          options={{
            href: null,
            title: 'Favorites',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="favorite" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="balance"
          options={{
            href: null,
            title: 'Favorites',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="favorite" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color }) => (
              <MaterialIcons name="person" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="bookings"
          options={{ href: null, title: 'Bookings' }}
        />
        <Tabs.Screen
          name="countries/[countryId]/index"
          options={{ href: null, title: 'Country' }}
        />
        <Tabs.Screen
          name="countries/[countryId]/[cityId]/index"
          options={{ href: null, title: 'Details' }}
        />
        <Tabs.Screen
          name="countries/[countryId]/[cityId]/hotels"
          options={{ href: null, title: 'Hotels' }}
        />
        <Tabs.Screen
          name="countries/[countryId]/[cityId]/attractions"
          options={{ href: null, title: 'Attractions' }}
        />
        <Tabs.Screen
          name="countries/[countryId]/[cityId]/trips"
          options={{ href: null, title: 'Trips' }}
        />
        <Tabs.Screen
          name="countries/[countryId]/[cityId]/map"
          options={{ href: null, title: 'Map' }}
        />
        <Tabs.Screen
          name="attractions/[attractionId]/index"
          options={{ href: null, title: 'Attraction' }}
        />
        <Tabs.Screen
          name="hotels/[hotelId]/index"
          options={{ href: null, title: 'Hotel' }}
        />
        <Tabs.Screen
          name="hotels/[hotelId]/room-types/[roomTypeId]"
          options={{ href: null, title: 'Room Type' }}
        />
        <Tabs.Screen
          name="account/settings"
          options={{ href: null, title: 'Details' }}
        />
        <Tabs.Screen
          name="account/personal"
          options={{ href: null, title: 'Details' }}
        />
                <Tabs.Screen
          name="countries/[countryId]/[cityId]/trips/index"
          options={{ href: null, title: 'Attractions' }}
        />
                <Tabs.Screen
          name="countries/[countryId]/[cityId]/trips/[tripId]/index"
          options={{ href: null, title: 'Attractions' }}
        />
                <Tabs.Screen
          name="countries/[countryId]/[cityId]/trips/custom"
          options={{ href: null, title: 'Attractions' }}
        />

        
      </Tabs>


      <Drawer visible={drawerVisible} onClose={closeDrawer} notifications={notificationsData?.items ?? []} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
    //height: 70,
    // remove negative margin to avoid header overlapping the top edge
    marginTop: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  tabBar: {
    paddingVertical: 4,
    height: 100,
   // add bottom offset so tabs sit above the native navigation area
   paddingBottom: 30,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
