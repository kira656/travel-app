import { countriesApi } from '@/apis/countries';
import SafeAreaView from '@/components/SafeAreaView';
import { useThemeStore } from '@/stores/themeStore';
import { getImageUrl } from '@/utils/imageUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function CountryDetails() {
  const { countryId, name } = useLocalSearchParams();
  const router = useRouter();
  const { darkMode } = useThemeStore();

  // Convert countryId to number for API call
  const countryIdNumber = parseInt(countryId as string, 10);

  // Fetch country data using React Query
  const {
    data: country,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['country', countryIdNumber],
    queryFn: () => countriesApi.getCountryById(countryIdNumber),
    enabled: !!countryIdNumber && !isNaN(countryIdNumber),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Local state for dark mode to avoid state updates during render
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Read current theme state after mount
    setIsDarkMode(useThemeStore.getState().darkMode);

    // Optional: subscribe to theme changes
    const unsubscribe = useThemeStore.subscribe(
      (state) => setIsDarkMode(state.darkMode)
    );
    return () => unsubscribe();
  }, []);

  const renderInfoRow = (label: string, value: string | number | undefined) => (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, isDarkMode && styles.darkText]}>
        {label}:
      </Text>
      <Text style={[styles.infoValue, isDarkMode && styles.darkText]}>
        {value || 'N/A'}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView 
        style={styles.container} 
        backgroundColor={isDarkMode ? '#121212' : '#fff'}
      >
        {/* <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={28} color={isDarkMode ? '#fff' : '#1e293b'} />
          </Pressable>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>Loading...</Text>
          <View style={{ width: 28 }} />
        </View> */}
<SafeAreaView style={{ flex: 1, backgroundColor: isDarkMode ? '#121212' : '#ffffff' }}>
  <View style={[styles.centerContainer]}>
    <ActivityIndicator size="large" color="#0a7ea4" />
    <Text style={[styles.loadingText, isDarkMode && styles.darkText]}>
      Loading country details...
    </Text>
  </View>
</SafeAreaView>



      </SafeAreaView>
    );
  }

  if (error || !country) {
    return (
      <SafeAreaView 
        style={styles.container} 
        backgroundColor={isDarkMode ? '#121212' : '#fff'}
      >
        {/* <View style={styles.header}>
          {/* <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={28} color={isDarkMode ? '#fff' : '#1e293b'} />
          </Pressable>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>Error</Text>
          <View style={{ width: 28 }} />
        </View> */} 
        <View style={styles.centerContainer}>
          <MaterialIcons 
            name="error-outline" 
            size={48} 
            color={isDarkMode ? '#ff6b6b' : '#ff6b6b'} 
          />
          <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
            Failed to load country details
          </Text>
          <Text style={[styles.errorSubtext, isDarkMode && styles.darkSubtext]}>
            {error instanceof Error ? error.message : 'Unknown error occurred'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isNaN(countryIdNumber)) {
    return (
      <SafeAreaView 
        style={styles.container} 
        backgroundColor={isDarkMode ? '#121212' : '#fff'}
      >
        {/* <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerButton}>
            <MaterialIcons name="arrow-back" size={28} color={isDarkMode ? '#fff' : '#1e293b'} />
          </Pressable>
          <Text style={[styles.title, isDarkMode && styles.darkText]}>Invalid Country</Text>
          <View style={{ width: 28 }} />
        </View> */}
        <View style={styles.centerContainer}>
          <MaterialIcons 
            name="error-outline" 
            size={48} 
            color={isDarkMode ? '#ff6b6b' : '#ff6b6b'} 
          />
          <Text style={[styles.errorText, isDarkMode && styles.darkText]}>
            Invalid country ID
          </Text>
          <Text style={[styles.errorSubtext, isDarkMode && styles.darkSubtext]}>
            The country ID provided is not valid
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView 
      style={styles.container} 
      backgroundColor={isDarkMode ? '#121212' : '#fff'}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={28} color={isDarkMode ? '#fff' : '#1e293b'} />
        </Pressable>
        <Text style={[styles.title, isDarkMode && styles.darkText]}>
          {country.name}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Country Code and Rating */}
        <View style={styles.basicInfoSection}>
          <Text style={[styles.countryCode, isDarkMode && styles.darkSubtext]}>
            {country.code}
          </Text>
          {country.avgRating !== '0.00' && (
            <View style={styles.ratingContainer}>
              <MaterialIcons 
                name="star" 
                size={20} 
                color="#FFD700" 
              />
              <Text style={[styles.ratingText, isDarkMode && styles.darkText]}>
                {country.avgRating} ({country.ratingCount} reviews)
              </Text>
            </View>
          )}
        </View>

        {/* Country Image or Placeholder */}
        <View style={styles.imageContainer}>
          {country.mainImage ? (
            <Image
              source={{ uri: getImageUrl(country.mainImage) }}
              style={styles.countryImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, isDarkMode && styles.darkImagePlaceholder]}>
              <MaterialIcons 
                name="public" 
                size={48} 
                color={isDarkMode ? '#666' : '#999'} 
              />
              <Text style={[styles.placeholderText, isDarkMode && styles.darkSubtext]}>
                No image available
              </Text>
            </View>
          )}
        </View>

        {/* Country Information */}
        <View style={styles.infoContainer}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            Country Information
          </Text>
          
          {renderInfoRow('Currency', country.currency)}
          {renderInfoRow('Timezone', country.timezone)}
          {renderInfoRow('Status', country.is_active ? 'Active' : 'Inactive')}
          {renderInfoRow('Created', new Date(country.createdAt).toLocaleDateString())}
        </View>

        {/* Description */}
        {country.description && (
          <View style={styles.descriptionContainer}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              About {country.name}
            </Text>
            <Text style={[styles.description, isDarkMode && styles.darkText]}>
              {country.description}
            </Text>
          </View>
        )}

        {/* Gallery Images */}
        {country.galleryImages && country.galleryImages.length > 0 && (
          <View style={styles.galleryContainer}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              Gallery
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {country.galleryImages.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: getImageUrl(image) }}
                  style={styles.galleryImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Cities Section */}
        {country.cities && country.cities.length > 0 && (
          <View style={styles.citiesContainer}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              Cities in {country.name}
            </Text>
            <Text style={[styles.citiesSubtitle, isDarkMode && styles.darkSubtext]}>
              {country.cities.length} city{country.cities.length !== 1 ? 'ies' : 'y'} found
            </Text>
            
            {country.cities.map((city) => (
              <Pressable
                key={city.id}
                style={[styles.cityItem, isDarkMode && styles.darkCityItem]}
                onPress={() => 
                  router.push({
                    pathname: '/(tabs)/(protected)/countries/[countryId]/[cityId]',
                    params: { 
                      countryId: country.id.toString(), 
                      cityId: city.id.toString(), 
                      name: city.name 
                    },
                  })
                }
              >
                <View style={styles.cityContent}>
                  <View style={styles.cityLeft}>
                    {city.mainImage ? (
                      <Image
                        source={{ uri: getImageUrl(city.mainImage) }}
                        style={styles.cityImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.cityImagePlaceholder, isDarkMode && styles.darkCityImagePlaceholder]}>
                        <MaterialIcons 
                          name="location-city" 
                          size={24} 
                          color={isDarkMode ? '#666' : '#999'} 
                        />
                      </View>
                    )}
                    <View style={styles.cityTextContainer}>
                      <Text style={[styles.cityName, isDarkMode && styles.darkText]}>
                        {city.name}
                      </Text>
                      <Text style={[styles.cityDescription, isDarkMode && styles.darkSubtext]}>
                        {city.description}
                      </Text>
                      <View style={styles.cityDetails}>
                        <Text style={[styles.cityDetail, isDarkMode && styles.darkSubtext]}>
                          Avg meal: ${city.avgMealPrice}
                        </Text>
                        {city.avgRating !== '0.00' && (
                          <View style={styles.cityRating}>
                            <MaterialIcons 
                              name="star" 
                              size={14} 
                              color="#FFD700" 
                            />
                            <Text style={[styles.cityRatingText, isDarkMode && styles.darkSubtext]}>
                              {city.avgRating} ({city.ratingCount})
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <MaterialIcons 
                    name="chevron-right" 
                    size={20} 
                    color={isDarkMode ? '#666' : '#999'} 
                  />
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {/* No Cities Message */}
        {(!country.cities || country.cities.length === 0) && (
          <View style={styles.noCitiesContainer}>
            <MaterialIcons 
              name="location-city" 
              size={48} 
              color={isDarkMode ? '#666' : '#999'} 
            />
            <Text style={[styles.noCitiesText, isDarkMode && styles.darkText]}>
              No cities available for {country.name}
            </Text>
            <Text style={[styles.noCitiesSubtext, isDarkMode && styles.darkSubtext]}>
              Cities will be added soon
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  scrollContainer: { flex: 1 },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  basicInfoSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  countryCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a7ea4',
    marginBottom: 8,
  },
  darkSubtext: { color: '#9BA1A6' },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 16,
    color: '#1e293b',
    marginLeft: 8,
  },
  imageContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  countryImage: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: width - 40,
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkImagePlaceholder: {
    backgroundColor: '#1E1E1E',
  },
  placeholderText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  infoContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  descriptionContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1e293b',
  },
  galleryContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  galleryImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  citiesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  citiesSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  darkCityItem: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  cityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  cityLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  cityImagePlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkCityImagePlaceholder: {
    backgroundColor: '#1E1E1E',
  },
  cityTextContainer: {
    flex: 1,
  },
  cityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  cityDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  cityDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  cityDetail: {
    fontSize: 14,
    color: '#1e293b',
    marginRight: 12,
  },
  cityRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityRatingText: {
    fontSize: 14,
    color: '#1e293b',
    marginLeft: 4,
  },
  noCitiesContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  noCitiesText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  noCitiesSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
});
