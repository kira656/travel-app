import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
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

const countries = [
  { name: 'United States', code: 'US' },
  { name: 'Canada', code: 'CA' },
  { name: 'India', code: 'IN' },
];

export default function Countries() {
  const { darkMode, toggleDarkMode } = useThemeStore();
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filteredCountries = countries
    .filter((country) =>
      country.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const s = search.toLowerCase();
      const aStarts = a.name.toLowerCase().startsWith(s);
      const bStarts = b.name.toLowerCase().startsWith(s);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return 0;
    });

  const renderItem = ({ item }: { item: typeof countries[0] }) => (
    <TouchableOpacity
      style={[styles.item, darkMode && styles.darkItem]}
      onPress={() =>
        router.push({
          pathname: '/(tabs)/(protected)/countries/[countryId]',
          params: { countryId: item.code, name: item.name },
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

        <Text style={[styles.title, darkMode && styles.darkText]}>Countries</Text>

        <Pressable onPress={toggleDarkMode} hitSlop={10} style={styles.headerButton}>
          <MaterialIcons name={darkMode ? 'dark-mode' : 'light-mode'} size={28} color={darkMode ? '#fff' : '#1e293b'} />
        </Pressable>
      </View>

      <View style={[styles.searchContainer, darkMode && styles.darkSearchContainer]}>
        <MaterialIcons name="search" size={20} color={darkMode ? '#aaa' : '#666'} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, darkMode && styles.darkInput]}
          placeholder="Search country..."
          placeholderTextColor={darkMode ? '#aaa' : '#888'}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filteredCountries}
        keyExtractor={(item) => item.code}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={[styles.emptyText, darkMode && styles.darkText]}>
            No countries found.
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
