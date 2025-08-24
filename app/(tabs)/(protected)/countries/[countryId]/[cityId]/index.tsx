import { citiesApi } from '@/apis/cities';
import MapView, { Marker } from '@/components/MapShim';
import SafeAreaView from '@/components/SafeAreaView';
import { useThemeStore } from '@/stores/themeStore';
import { getImageUrl } from '@/utils/imageUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function CityDetails() {
  const router = useRouter();
  const { cityId } = useLocalSearchParams();
  const { darkMode } = useThemeStore();

  const {
    data: cityData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['city', cityId],
    queryFn: () => {
      if (!cityId) {
        throw new Error("City ID is not available.");
      }
      return citiesApi.getCityDetails(cityId as string);
    },
    enabled: !!cityId,
    staleTime: 5 * 60 * 1000,
  });

  const themeStyles = StyleSheet.create({
    text: { color: darkMode ? '#E5E7EB' : '#1E293B' },
    subtext: { color: darkMode ? '#9CA3AF' : '#6B7280' },
    card: { backgroundColor: darkMode ? '#1F2937' : '#F3F4F6' },
    divider: { backgroundColor: darkMode ? '#4B5563' : '#E5E7EB' },
  });

  // Handle loading and error states separately
  if (isLoading) {
    return (
      <SafeAreaView
       // style={[styles.container, styles.centerContainer]}
        //backgroundColor={darkMode ? '#121212' : '#fff'}
      >
        <ActivityIndicator size="large" color={darkMode ? '#0a7ea4' : '#0a7ea4'} />
        <Text style={[styles.loadingText, themeStyles.text]}>Loading city details...</Text>
      </SafeAreaView>
    );
  }

  // Handle the error state, which includes a missing cityId
  if (error || !cityData) {
    return (
      <SafeAreaView
      //  style={[styles.container, styles.centerContainer]}
       // backgroundColor={darkMode ? '#121212' : '#fff'}
      >
        <MaterialIcons
          name="error-outline"
          size={48}
          color={darkMode ? '#ff6b6b' : '#ff6b6b'}
        />
        <Text style={[styles.errorTitle, themeStyles.text]}>Failed to load city details</Text>
        <Text style={[styles.errorMessage, themeStyles.subtext]}>
          Please check your connection and try again.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }
  console.log(cityData);
  // City API returns [longitude, latitude] — be defensive when reading values
  const rawCenter = Array.isArray(cityData.center) ? cityData.center : [undefined, undefined];
  const [lng, lat] = rawCenter;
  // Ensure we have numeric coords
  const latNum = typeof lat === 'number' ? lat : parseFloat(String(lat)) || undefined;
  const lngNum = typeof lng === 'number' ? lng : parseFloat(String(lng)) || undefined;
  const mainImageUrl = cityData.mainImage ? getImageUrl(cityData.mainImage) : null;
  const transportRate = cityData.distanceRates[0]?.transportRatePerKm;

  return (
    <SafeAreaView
      style={styles.container}
      backgroundColor={darkMode ? '#121212' : '#fff'}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.headerButton}>
            <MaterialIcons
              name="arrow-back"
              size={28}
              color={darkMode ? '#fff' : '#1e293b'}
            />
          </Pressable>
          <Text style={[styles.title, themeStyles.text]}>{cityData.name}</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* City Image */}
        {mainImageUrl ? (
          <Image
            source={{ uri: mainImageUrl }}
            style={styles.cityImage}
            resizeMode="cover"
          />
        ) : (
          <View style={[styles.imagePlaceholder, themeStyles.card]}>
            <MaterialIcons name="image" size={48} color={themeStyles.subtext.color} />
            <Text style={[styles.noImageText, themeStyles.subtext]}>No image available</Text>
          </View>
        )}

        <View style={styles.contentContainer}>
          {/* Main Info Card */}
          <View style={[styles.infoCard, themeStyles.card]}>
            <Text style={[styles.cardTitle, themeStyles.text]}>{cityData.name}</Text>
            <View style={styles.tagContainer}>
              <View style={[styles.tag, themeStyles.divider]}>
                <Text style={[styles.tagText, themeStyles.subtext]}>{cityData.country.name}</Text>
              </View>
              {cityData.avgRating !== '0.00' && (
                <View style={[styles.tag, themeStyles.divider]}>
                  <MaterialIcons name="star" size={14} color="#FBBF24" />
                  <Text style={[styles.tagText, themeStyles.subtext, { marginLeft: 4 }]}>
                    {cityData.avgRating}
                  </Text>
                </View>
              )}
            </View>

            <Text style={[styles.descriptionText, themeStyles.subtext]}>
              {cityData.description}
            </Text>
          </View>

          {/* Details Card */}
          <View style={[styles.detailsCard, themeStyles.card]}>
            <Text style={[styles.detailsTitle, themeStyles.text]}>Quick Facts</Text>
            <View style={styles.detailItem}>
              <MaterialIcons name="local-dining" size={20} color={themeStyles.subtext.color} />
              <Text style={[styles.detailText, themeStyles.text]}>
                Avg Meal Price:
              </Text>
              <Text style={[styles.detailValue, themeStyles.subtext]}>${parseFloat(cityData.avgMealPrice).toFixed(2)}</Text>
            </View>
            {transportRate && (
              <View style={styles.detailItem}>
                <MaterialIcons name="directions-car" size={20} color={themeStyles.subtext.color} />
                <Text style={[styles.detailText, themeStyles.text]}>
                  Transport Rate:
                </Text>
                <Text style={[styles.detailValue, themeStyles.subtext]}>${parseFloat(transportRate).toFixed(2)}/km</Text>
              </View>
            )}
            <View style={styles.detailItem}>
              <MaterialIcons name="flag" size={20} color={themeStyles.subtext.color} />
              <Text style={[styles.detailText, themeStyles.text]}>
                Country Code:
              </Text>
              <Text style={[styles.detailValue, themeStyles.subtext]}>{cityData.country.code}</Text>
            </View>
          </View>

          {/* Map View */}
          <View style={[styles.mapCard, themeStyles.card]}>
            <Text style={[styles.mapTitle, themeStyles.text]}>Location</Text>
            {Platform.OS === 'web' ? (
  <Text style={[styles.webFallback, themeStyles.subtext]}>
    Map view is not supported on web.
  </Text>
) : (<View style={[styles.mapCard, themeStyles.card]}>
  <Text style={[styles.mapTitle, themeStyles.text]}>Location</Text>
  {( Platform.OS === 'ios' || Platform.OS === 'android' || (typeof latNum === 'number' && typeof lngNum === 'number')) ? (
    <View style={{ height: 400, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
<MapView
    style={{ flex: 1 }}
    mapType="standard"   // hide Apple/Google base
    zoomEnabled={true}
    scrollEnabled={true}
    pitchEnabled={true}
    rotateEnabled={true}
    showsUserLocation={true}
    showsMyLocationButton={true}
    showsCompass={true}
    initialRegion={{
      latitude: 41.8933203,
      longitude: 12.4829321,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }}
  >
    <Marker coordinate={{ latitude: 41.8933203, longitude: 12.4829321 }} />
  </MapView>
    </View>
  ) : (
    <View style={[styles.imagePlaceholder, themeStyles.card]}>
      <Text style={themeStyles.subtext}>Map unavailable for this device.</Text>
    </View>
  )}
</View>
)}

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 10,
  },
  headerButton: { padding: 8 },
  title: { fontSize: 24, fontWeight: '700' },
  cityImage: {
    width: '100%',
    height: 250,
  },
  imagePlaceholder: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    marginTop: 8,
    fontSize: 14,
  },
  contentContainer: {
    padding: 16,
    gap: 16,
  },
  infoCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
  },
  detailsCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  mapCard: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  webFallback: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 50,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});