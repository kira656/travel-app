import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const citiesByCountry: Record<string, { name: string; code: string; latitude: number; longitude: number }[]> = {
  US: [
    { name: 'New York', code: 'NYC', latitude: 40.7128, longitude: -74.006 },
    { name: 'Los Angeles', code: 'LA', latitude: 34.0522, longitude: -118.2437 },
    { name: 'Chicago', code: 'CHI', latitude: 41.8781, longitude: -87.6298 },
  ],
  CA: [
    { name: 'Toronto', code: 'TOR', latitude: 43.65107, longitude: -79.347015 },
    { name: 'Vancouver', code: 'VAN', latitude: 49.2827, longitude: -123.1207 },
    { name: 'Montreal', code: 'MON', latitude: 45.5017, longitude: -73.5673 },
  ],
  IN: [
    { name: 'Mumbai', code: 'BOM', latitude: 19.076, longitude: 72.8777 },
    { name: 'Delhi', code: 'DEL', latitude: 28.7041, longitude: 77.1025 },
    { name: 'Bangalore', code: 'BLR', latitude: 12.9716, longitude: 77.5946 },
  ],
};

export default function Cities() {
  const { darkMode, toggleDarkMode } = useThemeStore();
  const router = useRouter();
  const params = useLocalSearchParams();

  const countryCode = Array.isArray(params.countryId) ? params.countryId[0] : params.countryId ?? '';
  const countryName = Array.isArray(params.name) ? params.name[0] : params.name ?? 'Country';
  const cityList = citiesByCountry[countryCode] || [];
  const [search, setSearch] = useState('');

  const filteredCities = cityList
    .filter((city) =>
      city.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const searchLower = search.toLowerCase();
      const aStarts = a.name.toLowerCase().startsWith(searchLower);
      const bStarts = b.name.toLowerCase().startsWith(searchLower);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

  const renderItem = ({ item }: { item: typeof cityList[0] }) => (
    <TouchableOpacity
      style={[styles.item, darkMode && styles.darkItem]}
      onPress={() =>
        router.push({
          pathname: '/(tabs)/(protected)/countries/[countryId]/[cityId]',
          params: {
            cityId: item.code,
            name: item.name,
            countryId: countryCode,
            latitude: item.latitude.toString(),
            longitude: item.longitude.toString(),
          },
        })
      }
    >
      <Text style={[styles.itemText, darkMode && styles.darkText]}>
        {item.name} ({item.code})
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.headerButton}>
          <MaterialIcons name="arrow-back" size={28} color={darkMode ? '#fff' : '#1e293b'} />
        </Pressable>

        <Text style={[styles.title, darkMode && styles.darkText]}>{countryName} Cities</Text>

        <Pressable onPress={toggleDarkMode} hitSlop={10} style={styles.headerButton}>
          <MaterialIcons name={darkMode ? 'dark-mode' : 'light-mode'} size={28} color={darkMode ? '#fff' : '#1e293b'} />
        </Pressable>
      </View>

      <View style={[styles.searchContainer, darkMode && styles.darkSearchContainer]}>
        <MaterialIcons name="search" size={20} color={darkMode ? '#aaa' : '#666'} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, darkMode && styles.darkInput]}
          placeholder="Search city..."
          placeholderTextColor={darkMode ? '#aaa' : '#888'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredCities}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.emptyText, darkMode && styles.darkText]}>
            No cities found.
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  darkContainer: { backgroundColor: '#121212' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 0,
    paddingBottom: 10,
  },
  headerButton: { padding: 8 },
  title: { fontSize: 24, fontWeight: '600', color: '#1e293b' },
  darkText: { color: '#fff' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    marginHorizontal: 20,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  darkSearchContainer: { backgroundColor: '#1E1E1E' },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 40, fontSize: 16, color: '#000' },
  darkInput: { color: '#fff' },
  list: { paddingHorizontal: 20 },
  item: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  darkItem: { borderBottomColor: '#333' },
  itemText: { fontSize: 16, color: '#1e293b' },
  emptyText: {
    padding: 20,
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});
