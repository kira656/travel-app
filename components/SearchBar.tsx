import { countriesApi } from '@/apis/countries';
import type { City, Country } from '@/apis/countries.types';
import { useThemeStore } from '@/stores/themeStore';
import { getImageUrl } from '@/utils/imageUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface SearchBarProps {
  onSelectCountry?: (country: Country) => void;
  onSelectCity?: (city: City, country: Country) => void;
  placeholder?: string;
  showResults?: boolean;
}

interface SearchResult {
  type: 'country' | 'city';
  country?: Country;
  city?: City;
  displayName: string;
  subtitle: string;
  imageUrl?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSelectCountry,
  onSelectCity,
  placeholder = "Search countries or cities...",
  showResults = true,
}) => {
  const { darkMode } = useThemeStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Fetch countries data
  const {
    data: countriesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['countries', 'public'],
    queryFn: countriesApi.getPublicCountries,
    staleTime: 5 * 60 * 1000,
  });

  const countries = countriesResponse?.data || [];

  // Process search results
  const searchResults = useCallback((): SearchResult[] => {
    if (!searchQuery.trim() || !countries.length) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search countries
    countries.forEach(country => {
      const countryMatches = 
        country.name.toLowerCase().includes(query) ||
        country.code.toLowerCase().includes(query);

      if (countryMatches) {
        results.push({
          type: 'country',
          country,
          displayName: country.name,
          subtitle: `${country.code} • ${country.currency}`,
          imageUrl: country.mainImage ? getImageUrl(country.mainImage) : undefined,
        });
      }

      // Search cities within countries
      if (country.cities && country.cities.length > 0) {
        country.cities.forEach(city => {
          const cityMatches = 
            city.name.toLowerCase().includes(query) ||
            city.description.toLowerCase().includes(query);

          if (cityMatches) {
            results.push({
              type: 'city',
              country,
              city,
              displayName: city.name,
              subtitle: `${country.name} • ${city.description}`,
              imageUrl: city.mainImage ? getImageUrl(city.mainImage) : undefined,
            });
          }
        });
      }
    });

    // Sort results: exact matches first, then alphabetical
    return results.sort((a, b) => {
      const aStarts = a.displayName.toLowerCase().startsWith(query);
      const bStarts = b.displayName.toLowerCase().startsWith(query);
      
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      
      return a.displayName.localeCompare(b.displayName);
    }).slice(0, 10); // Limit to 10 results
  }, [searchQuery, countries]);

  const handleSelectResult = (result: SearchResult) => {
    if (result.type === 'country' && result.country && onSelectCountry) {
      onSelectCountry(result.country);
    } else if (result.type === 'city' && result.city && result.country && onSelectCity) {
      onSelectCity(result.city, result.country);
    }
    setSearchQuery('');
    setIsFocused(false);
  };

  const renderSearchResult = ({ item }: { item: SearchResult }) => (
    <Pressable
      style={[styles.resultItem, darkMode && styles.darkResultItem]}
      onPress={() => handleSelectResult(item)}
    >
      <View style={styles.resultContent}>
        {item.imageUrl ? (
          <MaterialIcons 
            name="public" 
            size={24} 
            color={darkMode ? '#0a7ea4' : '#0a7ea4'} 
            style={styles.resultIcon}
          />
        ) : (
          <View style={[styles.resultIconPlaceholder, darkMode && styles.darkResultIconPlaceholder]}>
            <MaterialIcons 
              name={item.type === 'country' ? 'public' : 'location-city'} 
              size={20} 
              color={darkMode ? '#666' : '#999'} 
            />
          </View>
        )}
        <View style={styles.resultTextContainer}>
          <Text style={[styles.resultTitle, darkMode && styles.darkText]}>
            {item.displayName}
          </Text>
          <Text style={[styles.resultSubtitle, darkMode && styles.darkSubtext]}>
            {item.subtitle}
          </Text>
        </View>
        <MaterialIcons 
          name={item.type === 'country' ? 'public' : 'location-city'} 
          size={16} 
          color={darkMode ? '#666' : '#999'} 
        />
      </View>
    </Pressable>
  );

  const results = searchResults();
  const showResultsList = showResults && isFocused && (searchQuery.trim().length > 0);

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={[styles.searchContainer, darkMode && styles.darkSearchContainer]}>
        <MaterialIcons 
          name="search" 
          size={20} 
          color={darkMode ? '#aaa' : '#666'} 
          style={styles.searchIcon} 
        />
        <TextInput
          style={[styles.searchInput, darkMode && styles.darkSearchInput]}
          placeholder={placeholder}
          placeholderTextColor={darkMode ? '#aaa' : '#888'}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
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

      {/* Search Results */}
      {showResultsList && (
        <View style={[styles.resultsContainer, darkMode && styles.darkResultsContainer]}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={darkMode ? '#0a7ea4' : '#0a7ea4'} />
              <Text style={[styles.loadingText, darkMode && styles.darkSubtext]}>
                Loading...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <MaterialIcons 
                name="error-outline" 
                size={24} 
                color={darkMode ? '#ff6b6b' : '#ff6b6b'} 
              />
              <Text style={[styles.errorText, darkMode && styles.darkText]}>
                Failed to load search data
              </Text>
            </View>
          ) : results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={renderSearchResult}
              keyExtractor={(item, index) => `${item.type}-${item.displayName}-${index}`}
              style={styles.resultsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          ) : (
            <View style={styles.noResultsContainer}>
              <MaterialIcons 
                name="search-off" 
                size={24} 
                color={darkMode ? '#666' : '#999'} 
              />
              <Text style={[styles.noResultsText, darkMode && styles.darkText]}>
                No results found for "{searchQuery}"
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  darkSearchContainer: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
    paddingVertical: 0,
  },
  darkSearchInput: {
    color: '#fff',
  },
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  darkResultsContainer: {
    backgroundColor: '#1E1E1E',
    borderColor: '#333',
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  darkResultItem: {
    borderBottomColor: '#333',
  },
  resultContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resultIcon: {
    marginRight: 12,
  },
  resultIconPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  darkResultIconPlaceholder: {
    backgroundColor: '#333',
  },
  resultTextContainer: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
  },
  darkText: {
    color: '#fff',
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  darkSubtext: {
    color: '#9BA1A6',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  noResultsContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noResultsText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SearchBar; 