import { countriesApi } from '@/apis/countries';
import type { Country } from '@/apis/countries.types';
import { useThemeStore } from '@/stores/themeStore';
import { getImageUrl } from '@/utils/imageUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CountriesScreen() {
  const router = useRouter();
  const { darkMode } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: countriesResponse,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['countries', 'public'],
    queryFn: countriesApi.getPublicCountries,
    staleTime: 5 * 60 * 1000,
  });

  const countries = countriesResponse?.data || [];

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return countries;
    
    const query = searchQuery.toLowerCase();
    return countries.filter(country =>
      country.name.toLowerCase().includes(query) ||
      country.code.toLowerCase().includes(query) ||
      country.description.toLowerCase().includes(query)
    );
  }, [countries, searchQuery]);

  const handleSelectCountry = (country: Country) => {
    router.push({
      pathname: '/(tabs)/(protected)/countries/[countryId]',
      params: { countryId: country.id.toString(), name: country.name },
    });
  };

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[styles.countryCard, darkMode && styles.darkCountryCard]}
      onPress={() => handleSelectCountry(item)}
    >
      {/* Country Image */}
      {item.mainImage ? (
        <Image
          source={{ uri: getImageUrl(item.mainImage) }}
          style={styles.countryImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.countryImagePlaceholder, darkMode && styles.darkCountryImagePlaceholder]}>
          <MaterialIcons 
            name="public" 
            size={24} 
            color={darkMode ? '#666' : '#999'} 
          />
        </View>
      )}
      
      {/* Country Info */}
      <View style={styles.countryInfo}>
        <Text style={[styles.countryName, darkMode && styles.darkText]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.countryCode, darkMode && styles.darkSubtext]} numberOfLines={1}>
          {item.code} • {item.currency}
        </Text>
        <Text style={[styles.countryDescription, darkMode && styles.darkSubtext]} numberOfLines={2}>
          {item.description}
        </Text>
        
        {/* Rating and Cities */}
        <View style={styles.countryDetails}>
          {item.avgRating !== '0.00' && (
            <View style={styles.countryRating}>
              <MaterialIcons 
                name="star" 
                size={12} 
                color="#FFD700" 
              />
              <Text style={[styles.countryRatingText, darkMode && styles.darkSubtext]}>
                {item.avgRating}
              </Text>
            </View>
          )}
          {item.cities && item.cities.length > 0 && (
            <Text style={[styles.countryCities, darkMode && styles.darkSubtext]}>
              {item.cities.length} city{item.cities.length !== 1 ? 'ies' : 'y'}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={darkMode ? '#0a7ea4' : '#0a7ea4'} />
          <Text style={[styles.loadingText, darkMode && styles.darkText]}>
            Loading countries...
          </Text>
        </View>
     
    );
  }

  if (error) {
    return (
      
        <View style={styles.errorContainer}>
          <MaterialIcons 
            name="error-outline" 
            size={48} 
            color={darkMode ? '#ff6b6b' : '#ff6b6b'} 
          />
          <Text style={[styles.errorTitle, darkMode && styles.darkText]}>
            Failed to load countries
          </Text>
          <Text style={[styles.errorMessage, darkMode && styles.darkSubtext]}>
            Please check your connection and try again
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, darkMode && styles.darkRetryButton]}
            onPress={() => refetch()}
          >
            <Text style={[styles.retryButtonText, darkMode && styles.darkRetryButtonText]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      
    );
  }

  return (
    <>
      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={[styles.searchContainer, darkMode && styles.darkSearchContainer]}>
          <MaterialIcons 
            name="search" 
            size={20} 
            color={darkMode ? '#aaa' : '#666'} 
            style={styles.searchIcon} 
          />
          <TextInput
            style={[styles.searchInput, darkMode && styles.darkSearchInput]}
            placeholder="Search countries..."
            placeholderTextColor={darkMode ? '#aaa' : '#888'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <MaterialIcons 
                name="close" 
                size={18} 
                color={darkMode ? '#aaa' : '#666'} 
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Countries List */}
      <FlatList
        data={filteredCountries}
        renderItem={renderCountryItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        numColumns={2}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refetch}
            tintColor={darkMode ? '#0a7ea4' : '#0a7ea4'}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons 
              name="search-off" 
              size={48} 
              color={darkMode ? '#666' : '#999'} 
            />
            <Text style={[styles.emptyTitle, darkMode && styles.darkText]}>
              {searchQuery ? `No countries found for "${searchQuery}"` : 'No countries available'}
            </Text>
            <Text style={[styles.emptyMessage, darkMode && styles.darkSubtext]}>
              {searchQuery ? 'Try a different search term' : 'Countries will be available soon'}
            </Text>
          </View>
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  darkText: { color: '#fff' },
  darkSubtext: { color: '#9BA1A6' },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  darkSearchContainer: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  darkSearchInput: {
    color: '#fff',
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  countryCard: {
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
    width: '48%',
  },
  darkCountryCard: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  countryImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  countryImagePlaceholder: {
    width: '100%',
    height: 120,
    backgroundColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  darkCountryImagePlaceholder: {
    backgroundColor: '#333',
  },
  countryInfo: {
    padding: 12,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  countryCode: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  countryDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  countryDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countryRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryRatingText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
  },
  countryCities: {
    fontSize: 11,
    color: '#666',
  },
  loadingContainer: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ff6b6b',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: '#999',
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
  darkRetryButton: {
    backgroundColor: '#0a7ea4',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  darkRetryButtonText: {
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
});
