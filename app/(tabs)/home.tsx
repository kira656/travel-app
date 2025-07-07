
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Home() {
  // --- Use Zustand Auth Store ---
  const logout = useAuthStore((state) => state.logout);
  // Assuming your auth store has a 'user' or 'isAuthenticated' state
  const user = useAuthStore((state) => state.user); // Or state.isAuthenticated
  const isLoggedIn = !!user; // Convert user object to boolean for login status
  // --- End Zustand Auth Store ---

  const router = useRouter();

  // --- Use Zustand Theme Store ---
  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleDarkMode = useThemeStore((state) => state.toggleDarkMode);
  // --- End Zustand Theme Store ---

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [fontsLoaded] = useFonts({
    'Poppins-Regular': require('../../assets/fonts/Poppins-Regular.ttf'),
    });

  const [activeTab, setActiveTab] = useState('flights');
  const drawerTranslateX = useState(new Animated.Value(-250))[0];

  // Sample Data (remains the same)
  const [upcomingEvents] = useState([
    {
      id: '1',
      title: 'Beach Festival',
      location: 'Bali, Indonesia',
      date: '2023-12-15',
      image: require('../../assets/images/beach.jpg'),
      daysLeft: '12 days left'
    },
    {
      id: '2',
      title: 'Mountain Trek',
      location: 'Swiss Alps',
      date: '2024-01-20',
      image: require('../../assets/images/mountain.jpg'),
      daysLeft: 'Coming soon'
    },
    {
      id: '3',
      title: 'City Marathon',
      location: 'New York, USA',
      date: '2023-11-30',
      image: require('../../assets/images/marathon.jpg'),
      daysLeft: '3 days left'
    }
  ]);
  const popularDestinations = [
    { id: '1', name: 'Paris', image: require('../../assets/images/paris.jpg'), price: '$399' },
    { id: '2', name: 'Tokyo', image: require('../../assets/images/tokyo.jpg'), price: '$599' },
    { id: '3', name: 'New York', image: require('../../assets/images/nyc.jpg'), price: '$299' },
  ];

  const deals = [
    { id: '1', title: '30% Off Europe', discount: '30% OFF', expiry: '2 days left' },
    { id: '2', title: 'Beach Resorts', discount: '40% OFF', expiry: '5 days left' },
    { id: '3', title: 'Winter Getaway', discount: '25% Off', expiry: '1 week left' },
  ];

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

  // Ensure fonts are loaded before rendering
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

  <View style={styles.drawerContent}>
    {/* Countries Item */}
    <TouchableOpacity
      style={styles.drawerItem}
      onPress={() => {
        router.push('/(tabs)/(protected)/countries'); // Ensure this matches your file structure
        closeDrawer();
      }}
    >
      <MaterialIcons name="public" size={24} color={darkMode ? '#fff' : '#1e293b'} />
      <Text style={[styles.drawerItemText, darkMode && styles.darkText]}>Countries</Text>
    </TouchableOpacity>

    {/* Login/Logout */}
    {isLoggedIn ? (
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={async () => {
          await logout();
          router.replace('/(auth)/login');
        }}
      >
        <MaterialIcons name="logout" size={24} color={darkMode ? '#fff' : '#1e293b'} />
        <Text style={[styles.drawerItemText, darkMode && styles.darkText]}>Logout</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity
        style={styles.drawerItem}
        onPress={() => {
          router.push('/(auth)/login');
          closeDrawer();
        }}
      >
        <MaterialIcons name="login" size={24} color={darkMode ? '#fff' : '#1e293b'} />
        <Text style={[styles.drawerItemText, darkMode && styles.darkText]}>Login</Text>
      </TouchableOpacity>
    )}
  </View>
</Animated.View>


      {/* Main Content */}
      <View style={styles.mainArea}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={openDrawer}>
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

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Hero Banner */}
          <View style={styles.heroContainer}>
            <View style={[styles.heroContent, darkMode && styles.heroContentDark]}>
              <Text style={[styles.heroTitle, darkMode && styles.darkText]}>Explore the World</Text>
              <Text style={[styles.heroSubtitle, darkMode && styles.darkSubtext]}>
                Find the best deals for your next trip
              </Text>
              <TouchableOpacity
                style={styles.searchButton}
              // onPress={() => router.push('/search')}
              >
                <FontAwesome name="search" size={16} color="#fff" />
                <Text style={styles.searchText}>Search flights or hotels</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Booking Tabs */}
          <View style={[styles.tabContainer, darkMode && styles.tabContainerDark]}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'flights' && styles.activeTab,
                darkMode && styles.tabDark,
                activeTab === 'flights' && darkMode && styles.activeTabDark
              ]}
              onPress={() => setActiveTab('flights')}
            >
              <Ionicons
                name="airplane"
                size={20}
                color={
                  activeTab === 'flights'
                    ? '#fff'
                    : (darkMode ? '#94a3b8' : '#64748b')
                }
              />
              <Text style={[
                styles.tabText,
                activeTab === 'flights' ? styles.activeTabText : {},
                darkMode && styles.tabTextDark,
                activeTab === 'flights' && darkMode && styles.activeTabTextDark
              ]}>
                Flights
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'hotels' && styles.activeTab,
                darkMode && styles.tabDark,
                activeTab === 'hotels' && darkMode && styles.activeTabDark
              ]}
              onPress={() => setActiveTab('hotels')}
            >
              <Ionicons
                name="bed"
                size={20}
                color={
                  activeTab === 'hotels'
                    ? '#fff'
                    : (darkMode ? '#94a3b8' : '#64748b')
                }
              />
              <Text style={[
                styles.tabText,
                activeTab === 'hotels' ? styles.activeTabText : {},
                darkMode && styles.tabTextDark,
                activeTab === 'hotels' && darkMode && styles.activeTabTextDark
              ]}>
                Hotels
              </Text>
            </TouchableOpacity>
          </View>

          {/* Popular Destinations */}
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Popular Destinations</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={popularDestinations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.destinationCard}>
                <Image source={item.image} style={styles.destinationImage} />
                <View style={styles.destinationInfo}>
                  <Text style={[styles.destinationName, darkMode && styles.darkText]}>{item.name}</Text>
                  <Text style={[styles.destinationPrice, darkMode && styles.darkSubtext]}>From {item.price}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.destinationList}
          />
          {/* Upcoming Events Section */}
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Upcoming Events</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={upcomingEvents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.eventCard, darkMode && styles.eventCardDark]}>
                <Image source={item.image} style={styles.eventImage} />
                <View style={styles.eventDetails}>
                  <Text style={[styles.eventTitle, darkMode && styles.darkText]}>{item.title}</Text>
                  <View style={styles.eventInfoRow}>
                    <MaterialIcons
                      name="location-on"
                      size={16}
                      color={darkMode ? '#94a3b8' : '#64748b'}
                    />
                    <Text style={[styles.eventInfoText, darkMode && styles.darkSubtext]}>
                      {item.location}
                    </Text>
                  </View>
                  <View style={styles.eventInfoRow}>
                    <MaterialIcons
                      name="event"
                      size={16}
                      color={darkMode ? '#94a3b8' : '#64748b'}
                    />
                    <Text style={[styles.eventInfoText, darkMode && styles.darkSubtext]}>
                      {item.date} • {item.daysLeft}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.eventButton, darkMode && styles.eventButtonDark]}
                  // onPress={() => router.push(`/events/${item.id}`)}
                  >
                    <Text style={styles.eventButtonText}>View Details</Text>
                    <FontAwesome name="arrow-right" size={12} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={styles.eventList}
          />

          {/* Special Offers */}
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Special Offers</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={deals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.dealCard, darkMode && styles.dealCardDark]}>
                <View style={styles.dealBadge}>
                  <Text style={styles.dealDiscount}>{item.discount}</Text>
                </View>
                <Text style={[styles.dealTitle, darkMode && styles.darkText]}>{item.title}</Text>
                <Text style={[styles.dealExpiry, darkMode && styles.darkSubtext]}>{item.expiry}</Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.dealList}
          />
          {/* Cab Section */}
          <View style={[styles.cabContainer, darkMode && styles.cabContainerDark]}>
            <View style={styles.cabTextContainer}>
              <Text style={[styles.cabTitle, darkMode && styles.darkText]}>Need a cab?</Text>
              <Text style={[styles.cabSubtitle, darkMode && styles.darkSubtext]}>
                Get a ride in minutes with our trusted partners
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.cabButton, darkMode && styles.cabButtonDark]}
            // onPress={() => router.push('/cab-booking')}
            >
              <MaterialIcons name="directions-car" size={24} color="#fff" />
              <Text style={styles.cabButtonText}>Book Now</Text>
            </TouchableOpacity>
          </View>
          {/* Add extra space if needed */}

          <View style={{ height: 20 }} />

        </ScrollView>

        {/* Bottom Navigation */}
        <View style={[styles.navBar, darkMode && styles.darkNavBar]}>
          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="home" size={24} color={darkMode ? '#fff' : '#1e293b'} />
            <Text style={[styles.navText, darkMode && styles.darkNavText]}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="search" size={24} color={darkMode ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.navText, darkMode && styles.darkNavText]}>Search</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.navItem}>
            <MaterialIcons name="favorite-border" size={24} color={darkMode ? '#94a3b8' : '#64748b'} />
            <Text style={[styles.navText, darkMode && styles.darkNavText]}>Saved</Text>
          </TouchableOpacity>
          {/* Conditional Profile/Login tab */}
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push(isLoggedIn ? '/profile' : '/(auth)/login')}
          >
            <MaterialIcons
              name={isLoggedIn ? 'person' : 'login'} // Change icon based on login status
              size={24}
              color={darkMode ? '#94a3b8' : '#64748b'}
            />
            <Text style={[styles.navText, darkMode && styles.darkNavText]}>
              {isLoggedIn ? 'Profile' : 'Login'} {/* Change text based on login status */}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}


// --- Stylesheet definition ---
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
  // Added for drawer item styling
  drawerContent: {
    flex: 1, // Allows content to fill space and enable scrolling if needed
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 5,
    borderRadius: 8,
    // Add specific styles for drawer items, e.g., borders or spacing
    marginBottom: 10,
  },
  drawerItemText: {
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
  },
  darkModeToggle: {
    padding: 8,
  },
  darkText: {
    color: '#fff',
  },
  darkSubtext: {
    color: '#a0a0a0',
  },
  heroContainer: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroContentDark: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#e2e8f0',
    marginBottom: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchText: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  tabContainerDark: {
    backgroundColor: '#334155', // Corrected for dark mode tabs background
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
  },
  tabDark: {
    backgroundColor: 'transparent', // Inactive tab background in dark mode
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  activeTabDark: {
    backgroundColor: '#2563eb', // Active tab background in dark mode
  },
  tabText: {
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
    color: '#64748b',
  },
  tabTextDark: {
    color: '#94a3b8', // Inactive tab text in dark mode
  },
  activeTabText: {
    color: '#fff',
  },
  activeTabTextDark: {
    color: '#fff', // Active tab text in dark mode
  },
  sectionTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    color: '#1e293b',
  },
  destinationList: {
    paddingHorizontal: 16,
  },
  destinationCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  destinationImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
  },
  destinationInfo: {
    padding: 8,
  },
  destinationName: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: '#1e293b',
  },
  destinationPrice: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  dealList: {
    paddingHorizontal: 16,
    marginBottom: 30, // Space after the scrollable list
    paddingBottom: 15 // Space inside scrollable area
  },
  dealCard: {
    width: 200,
    marginRight: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  dealCardDark: {
    backgroundColor: '#1e293b',
  },
  dealBadge: {
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  dealDiscount: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  dealTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  dealExpiry: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748b',
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
  },
  navText: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  darkNavText: {
    color: '#94a3b8',
  },
  eventList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    marginBottom: 10
  },
  eventCard: {
    width: 260,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  eventCardDark: {
    backgroundColor: '#1e293b',
  },
  eventImage: {
    width: '100%',
    height: 140,
  },
  eventDetails: {
    padding: 12,
  },
  eventTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    marginBottom: 8,
    color: '#1e293b',
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventInfoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginLeft: 6,
    color: '#64748b',
  },
  eventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 8
  },
  eventButtonDark: {
    backgroundColor: '#2563eb',
  },
  eventButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  cabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  cabContainerDark: {
    backgroundColor: '#1e293b',
  },
  cabTextContainer: {
    flex: 1,
  },
  cabTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 4,
  },
  cabSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  cabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  cabButtonDark: {
    backgroundColor: '#2563eb',
  },
  cabButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
});