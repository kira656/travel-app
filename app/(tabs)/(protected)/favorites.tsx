import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FavoriteItem {
  id: string;
  name: string;
  type?: string;
}

export default function Favorites() {
  const { darkMode } = useThemeStore();
  const { user, toggleFavorite, fetchFavorites } = useAuthStore();

  // Get favorites directly from user object (support API `favourites` or store `favorites`)
  const favorites = user?.favourites || (user as any)?.favourites || [];

  // Tabs: all | country | city | hotel | poi | trip
  const tabs = ['All', 'Countries', 'Cities', 'Hotels', 'POI', 'Trips'];
  const [activeTab, setActiveTab] = useState('All');

  // Filter client-side based on active tab (no fetching)
  const visibleItems = useMemo(() => {
    if (activeTab === 'All') return favorites;
    const map: Record<string, string> = {
      Countries: 'country',
      Cities: 'city',
      Hotels: 'hotel',
      POI: 'poi',
      Trips: 'trip',
    };
    const type = map[activeTab] || '';
    return favorites.filter((f: any) => String(f.type).toLowerCase() === type);
  }, [activeTab, favorites]);

  // Fetch user's favourites when opening the screen
  React.useEffect(() => {
    fetchFavorites().catch(() => {});
  }, [fetchFavorites]);

  const handleRemoveFavorite = async (item: FavoriteItem) => {
    await toggleFavorite(item); // toggleFavorite calls server then refetches store
  };

  return (
   
      <View style={[styles.container, darkMode && styles.darkContainer]}>
        <Pressable onPress={() => router.push({ pathname: '/(tabs)/(protected)/profile' })} style={{position: 'absolute',  top: 16, left: 16, zIndex: 10, backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)', borderRadius: 999, padding: 8, borderWidth: 1, borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
					<MaterialIcons name="arrow-back" size={22} color={darkMode ? '#fff' : '#1e293b'} />
				</Pressable>
        {/* Tabs header */}
        <View style={styles.tabsContainer}>
          {tabs.map((t) => (
            <TouchableOpacity key={t} onPress={() => setActiveTab(t)} style={[styles.tabButton, activeTab === t && styles.activeTabButton]}>
              <Text style={[styles.tabText, activeTab === t && styles.activeTabText]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {visibleItems.length > 0 ? (
          <FlatList
            data={visibleItems}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={({ item }) => (
              <View style={[styles.card, darkMode && styles.darkCard]}>
                <Image
                  source={
                    item.image
                      ? { uri: `${process.env.EXPO_PUBLIC_IMAGES_URL}${item.image}` }
                      : undefined
                  }
                  style={styles.cardImage}
                />
                <Text style={[styles.cardTitle, darkMode && styles.darkText]} numberOfLines={1}>{item.name}</Text>
                <TouchableOpacity onPress={() => handleRemoveFavorite(item)} style={styles.cardHeart}>
                  <MaterialIcons name="favorite" size={20} color={darkMode ? '#ef4444' : '#dc2626'} />
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons 
              name="favorite-border" 
              size={48} 
              color={darkMode ? '#94a3b8' : '#64748b'} 
            />
            <Text style={[styles.emptyText, darkMode && styles.darkSubtext]}>
              No favorites yet
            </Text>
            <Text style={[styles.hintText, darkMode && styles.darkSubtext]}>
              Tap the ♡ icon on destinations to add them
            </Text>
          </View>
        )}
      </View>
   
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  listContainer: {
    paddingBottom: 20,
  },
  favoriteItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkFavoriteItem: {
    backgroundColor: '#1e293b',
  },
  favoriteInfo: {
    flex: 1,
  },
  favoriteName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 4,
  },
  favoriteType: {
    fontSize: 14,
    color: '#64748b',
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
    color: '#64748b',
  },
  hintText: {
    fontSize: 14,
    marginTop: 8,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  tabsContainer: {
    marginTop:50,
    flexDirection: 'row',
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#0a7ea4',
  },
  tabText: {
    color: '#0a7ea4',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  card: {
    width: '48%',
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
  },
  darkCard: {
    backgroundColor: '#1e293b',
  },
  cardImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  cardHeart: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'transparent',
    padding: 6,
    borderRadius: 20,
  },
  darkText: {
    color: '#fff',
  },
  darkSubtext: {
    color: '#94a3b8',
  },
});