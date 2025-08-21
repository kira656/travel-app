import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FavoriteItem {
  id: string;
  name: string;
  type?: string;
}

export default function Favorites() {
  const { darkMode } = useThemeStore();
  const { user, toggleFavorite } = useAuthStore();

  // Get favorites directly from user object
  const favorites = user?.favorites || [];

  const handleRemoveFavorite = (item: FavoriteItem) => {
    toggleFavorite(item); // This will update both local and global state
  };

  return (
   
      <View style={[styles.container, darkMode && styles.darkContainer]}>
        {favorites.length > 0 ? (
          <FlatList
            data={favorites}
            renderItem={({ item }) => (
              <View style={[styles.favoriteItem, darkMode && styles.darkFavoriteItem]}>
                <View style={styles.favoriteInfo}>
                  <Text style={[styles.favoriteName, darkMode && styles.darkText]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.favoriteType, darkMode && styles.darkSubtext]}>
                    {item.type || 'destination'}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleRemoveFavorite(item)}
                  style={styles.removeButton}
                >
                  <MaterialIcons 
                    name="favorite" 
                    size={24} 
                    color={darkMode ? '#ef4444' : '#dc2626'} 
                  />
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
  darkText: {
    color: '#fff',
  },
  darkSubtext: {
    color: '#94a3b8',
  },
});