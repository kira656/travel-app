import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Image,
    Platform,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';

const cityCoordinates: Record<
  string,
  { lat: number; lng: number; title: string; description: string }
> = {
  NYC: {
    lat: 40.7128,
    lng: -74.006,
    title: 'New York City',
    description: 'Famous for Times Square, Central Park, and more.',
  },
  LA: {
    lat: 34.0522,
    lng: -118.2437,
    title: 'Los Angeles',
    description: 'Hollywood, beaches, and sunny weather.',
  },
  CHI: {
    lat: 41.8781,
    lng: -87.6298,
    title: 'Chicago',
    description: 'Known for deep-dish pizza and architecture.',
  },
  TOR: {
    lat: 43.65107,
    lng: -79.347015,
    title: 'Toronto',
    description: 'A diverse city with the CN Tower.',
  },
  VAN: {
    lat: 49.2827,
    lng: -123.1207,
    title: 'Vancouver',
    description: 'Nature and city blended beautifully.',
  },
  MON: {
    lat: 45.5017,
    lng: -73.5673,
    title: 'Montreal',
    description: 'Known for French culture and food.',
  },
  BOM: {
    lat: 19.076,
    lng: 72.8777,
    title: 'Mumbai',
    description: 'Financial capital of India.',
  },
  DEL: {
    lat: 28.6139,
    lng: 77.209,
    title: 'Delhi',
    description: 'Capital of India, rich in history.',
  },
  BLR: {
    lat: 12.9716,
    lng: 77.5946,
    title: 'Bangalore',
    description: 'India’s Silicon Valley.',
  },
};

export default function CityDetails() {
  const { cityId, name, countryId } = useLocalSearchParams();
  const router = useRouter();

  // Local state for dark mode to avoid state updates during render
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Read current theme state after mount
    setDarkMode(useThemeStore.getState().darkMode);

    // Optional: subscribe to theme changes
    const unsubscribe = useThemeStore.subscribe(
      (state) => setDarkMode(state.darkMode)
    );
    return () => unsubscribe();
  }, [darkMode]);

  const cityData = cityCoordinates[cityId as keyof typeof cityCoordinates];

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={28} color={darkMode ? '#fff' : '#1e293b'} />
        </Pressable>
        <Text style={[styles.title, darkMode && styles.darkText]}>{name} Details</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Image */}
      <Image
        source={require('../../../../../..//assets/images/mountain.jpg')}
        style={styles.image}
        resizeMode="cover"
      />

      {/* City Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.infoText, darkMode && styles.darkText]}>City Code: {cityId}</Text>
        <Text style={[styles.infoText, darkMode && styles.darkText]}>Country Code: {countryId}</Text>
        <Text style={[styles.infoText, darkMode && styles.darkText]}>Welcome to {name}!</Text>
      </View>

      {/* Map or fallback for Web */}
      {Platform.OS === 'web' ? (
        <Text style={[styles.webFallback, darkMode && styles.darkText]}>
          Map view is not supported on web.
        </Text>
      ) : cityData ? (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: cityData.lat,
            longitude: cityData.lng,
            latitudeDelta: 0.1,
            longitudeDelta: 0.1,
          }}
        >
          <Marker
            coordinate={{ latitude: cityData.lat, longitude: cityData.lng }}
            title={cityData.title}
            description={cityData.description}
          />
        </MapView>
      ) : (
        <Text style={[styles.webFallback, darkMode && styles.darkText]}>
          Coordinates not available for this city.
        </Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#121212' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 10,
  },
  headerButton: { padding: 8 },
  title: { fontSize: 22, fontWeight: '600', color: '#1e293b' },
  darkText: { color: '#fff' },
  image: {
    width: '100%',
    height: 200,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  infoContainer: { padding: 20 },
  infoText: {
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 8,
  },
  map: {
    width: Dimensions.get('window').width,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
  },
  webFallback: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});
