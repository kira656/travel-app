import { attractionsApi } from '@/apis/attractions';
import { favouritesApi } from '@/apis/favourites';
import { reviewsApi } from '@/apis/reviews';
import MapView, { Marker } from '@/components/MapShim';
import SafeAreaView from '@/components/SafeAreaView';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { getImageUrl } from '@/utils/imageUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function AttractionDetails() {
  const router = useRouter();
  const navigation = useNavigation();
  const { attractionId, cityId, countryId } = useLocalSearchParams();
  const { darkMode } = useThemeStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['attraction', attractionId],
    queryFn: async () => {
      if (!attractionId) throw new Error('Missing attractionId');
      const res = await attractionsApi.getAttractionById(Number(attractionId));
      return res;
    },
    enabled: !!attractionId,
  });

  const attraction = data;
console.log(data);
  const queryClient = useQueryClient();
  const [showFavouritesModal, setShowFavouritesModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [favouritesList, setFavouritesList] = useState<any[]>([]);
  const [favouritesLoading, setFavouritesLoading] = useState(false);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useLayoutEffect(() => {
    if ((attraction as any)?.name) {
      navigation.setOptions({ title: (attraction as any).name });
    } else {
      navigation.setOptions({ title: 'Attraction' });
    }
  }, [(attraction as any)?.name]);

  useEffect(() => {
    if (showFavouritesModal && attraction?.id) fetchFavourites();
  }, [showFavouritesModal]);

  useEffect(() => {
    if (showReviewsModal && attraction?.id) fetchReviews();
  }, [showReviewsModal]);

  const handleAddFavourite = async () => {
    const { isLoggedIn, toggleFavorite } = useAuthStore.getState();
    if (!isLoggedIn) { router.push('/(auth)/login'); return; }
    try {
      const isFav = useAuthStore.getState().isFavorite(String(attraction.id));
      await toggleFavorite({ id: String(attraction.id), name: attraction.name, type: 'poi' });
      // Optimistic update favourites count
      queryClient.setQueryData(['attraction', String(attractionId)], (old: any) => {
        if (!old) return old;
        const delta = isFav ? -1 : 1;
        return { ...old, favouritesCount: Math.max(0, (old.favouritesCount ?? 0) + delta) };
      });
      await queryClient.invalidateQueries({ queryKey: ['attraction', String(attractionId)] });
      await refetch();
      if (showFavouritesModal) await fetchFavourites();
    } catch (err) {
      console.warn('Failed to toggle favourite', err);
    }
  };

  const handleAddReview = async () => {
    const { isLoggedIn } = useAuthStore.getState();
    if (!isLoggedIn) { router.push('/(auth)/login'); return; }
    try {
      const token = useAuthStore.getState().token ?? undefined;
      await reviewsApi.addReview({ entityType: 'poi', entityId: attraction.id, rating: newReviewRating, comment: newReviewText }, token ?? undefined);
      setNewReviewText('');
      setNewReviewRating(5);
      // Optimistic update reviews count
      queryClient.setQueryData(['attraction', String(attractionId)], (old: any) => {
        if (!old) return old;
        return { ...old, reviewsCount: (old.reviewsCount ?? 0) + 1 };
      });
      await queryClient.invalidateQueries({ queryKey: ['attraction', String(attractionId)] });
      await refetch();
      if (showReviewsModal) await fetchReviews();
    } catch (err) {
      console.warn('Failed to add review', err);
    }
  };

  const fetchFavourites = async (page = 1, limit = 20) => {
    setFavouritesLoading(true);
    try {
      const token = useAuthStore.getState().token ?? undefined;
      const res = await favouritesApi.getFavouritesForEntity('poi', attraction.id, page, limit, token ?? undefined);
      setFavouritesList(res.items ?? []);
    } catch (err) {
      console.warn('Failed to fetch favourites', err);
      setFavouritesList([]);
    } finally {
      setFavouritesLoading(false);
    }
  };

  const fetchReviews = async (page = 1, limit = 20) => {
    setReviewsLoading(true);
    try {
      const token = useAuthStore.getState().token ?? undefined;
      const res = await reviewsApi.getReviewsForEntity('poi', attraction.id, page, limit, token ?? undefined);
      setReviewsList(res.items ?? []);
    } catch (err) {
      console.warn('Failed to fetch reviews', err);
      setReviewsList([]);
    } finally {
      setReviewsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#0a7ea4" />
          <Text style={[styles.loadingText, { color: darkMode ? '#fff' : '#1e293b' }]}>Loading attraction...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !attraction) {
    return (
      <SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
        <View style={styles.center}>
          <MaterialIcons name="error-outline" size={48} color="#ff6b6b" />
          <Text style={[styles.errorText, { color: darkMode ? '#fff' : '#1e293b' }]}>Failed to load attraction</Text>
          <Pressable onPress={() => refetch()} style={styles.retryButton}><Text style={styles.retryButtonText}>Retry</Text></Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: darkMode ? '#0b1220' : '#ffffff' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Floating back button to City attractions page */}
        <Pressable
          onPress={() => {
            const ctryId = String((attraction as any)?.city?.countryId ?? countryId ?? '');
            const ctyId = String((attraction as any)?.city?.id ?? cityId ?? '');
            router.push({ pathname: '/(tabs)/(protected)/countries/[countryId]/[cityId]/attractions', params: { countryId: ctryId, cityId: ctyId } });
          }}
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)', borderRadius: 999, padding: 8, borderWidth: 1, borderColor: darkMode ? '#334155' : '#e2e8f0' }}
        >
          <MaterialIcons name="arrow-back" size={22} color={darkMode ? '#fff' : '#1e293b'} />
        </Pressable>


        {attraction.mainImage ? (
          <Image source={{ uri: getImageUrl(attraction.mainImage) }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: darkMode ? '#1E1E1E' : '#f3f4f6' }]}>
            <MaterialIcons name="photo" size={48} color={darkMode ? '#666' : '#999'} />
          </View>
        )}

        <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 16 }}>
              <MaterialIcons name="star" size={18} color="#FFD700" />
              <Text style={{ marginLeft: 4, color: darkMode ? '#fff' : '#1e293b', fontWeight: '600' }}>
                {(((attraction as any)?.avgRating ?? (attraction as any)?.averageRating ?? (attraction as any)?.rating ?? 0) as number).toFixed ? ((attraction as any)?.avgRating ?? (attraction as any)?.averageRating ?? (attraction as any)?.rating ?? 0).toFixed(1) : String((attraction as any)?.avgRating ?? (attraction as any)?.averageRating ?? (attraction as any)?.rating ?? 0)}
              </Text>
              <Text style={{ marginLeft: 6, color: darkMode ? '#9CA3AF' : '#6B7280' }}>({(attraction as any)?.reviewsCount ?? 0})</Text>
            </View>
            <Pressable onPress={() => setShowFavouritesModal(true)} style={{ marginRight: 16 }}>
              <Text style={{ color: darkMode ? '#9BD3E6' : '#0a7ea4' }}>{(attraction as any)?.favourites?.length ?? (attraction as any)?.favouritesCount ?? 0} favourites</Text>
            </Pressable>
            <Pressable onPress={() => setShowReviewsModal(true)}>
              <Text style={{ color: darkMode ? '#9BD3E6' : '#0a7ea4' }}>{(attraction as any)?.reviewsCount ?? 0} reviews</Text>
            </Pressable>
          </View>
          <Pressable onPress={handleAddFavourite} style={{ padding: 8 }}>
            <MaterialIcons name={useAuthStore.getState().isFavorite(String(attraction.id)) ? 'favorite' : 'favorite-border'} size={28} color={useAuthStore.getState().isFavorite(String(attraction.id)) ? (darkMode ? '#ff6b6b' : '#dc2626') : (darkMode ? '#94a3b8' : '#64748b')} />
          </Pressable>
        </View>

        {/* Favourites Modal */}
        <Modal
          visible={showFavouritesModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowFavouritesModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowFavouritesModal(false)}>
            <View style={{  flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          </TouchableWithoutFeedback>
          <View style={{ backgroundColor: darkMode ? '#222' : '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: '60%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: darkMode ? '#fff' : '#111' }}>Favourites</Text>
              <Pressable onPress={() => setShowFavouritesModal(false)}>
                <Text style={{ color: '#0a7ea4' }}>Close</Text>
              </Pressable>
            </View>
            {favouritesLoading ? (
              <View style={{ padding: 16 }}>
                <ActivityIndicator />
              </View>
            ) : favouritesList.length > 0 ? (
              <ScrollView>
                {favouritesList.map((f: any, idx: number) => (
                  <View key={idx} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                    <Text style={{ color: darkMode ? '#fff' : '#111' }}>{f.user?.name}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={{ color: darkMode ? '#fff' : '#111', marginTop: 12 }}>No favourites yet</Text>
            )}
          </View>
        </Modal>

        {/* Reviews Modal */}
        <Modal
          visible={showReviewsModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowReviewsModal(false)}
        >
          <TouchableWithoutFeedback  onPress={() => setShowReviewsModal(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
          </TouchableWithoutFeedback>
          <View style={{ backgroundColor: darkMode ? '#222' : '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: '70%' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontSize: 18, fontWeight: '600', color: darkMode ? '#fff' : '#111' }}>Reviews</Text>
              <Pressable onPress={() => setShowReviewsModal(false)}>
                <Text style={{ color: '#0a7ea4' }}>Close</Text>
              </Pressable>
            </View>
            {reviewsLoading ? (
              <View style={{ padding: 16 }}>
                <ActivityIndicator />
              </View>
            ) : reviewsList.length > 0 ? (
              <ScrollView>
                {reviewsList.map((r: any) => (
                  <View key={r.id} style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                    <Text style={{ color: darkMode ? '#fff' : '#111' }}>{r.user?.name} — {r.rating}★</Text>
                    <Text style={{ color: darkMode ? '#ddd' : '#444' }}>{r.comment}</Text>
                  </View>
                ))}
              </ScrollView>
            ) : (
              <Text style={{ color: darkMode ? '#fff' : '#111', marginTop: 12 }}>No reviews yet</Text>
            )}

            <View style={{ marginTop: 12 }}>
              <Text style={{ color: darkMode ? '#fff' : '#111' }}>Add review</Text>
              <TextInput
                value={newReviewText}
                onChangeText={setNewReviewText}
                placeholder="Write your review"
                style={{color: darkMode ? '#fff' : '#111', borderWidth: 1, borderColor: '#e2e8f0', padding: 8, marginTop: 8 }}
                multiline
              />
              <View style={{ flexDirection: 'row', marginTop: 8 }}>
                {[1,2,3,4,5].map((n) => (
                  <Pressable key={n} onPress={() => setNewReviewRating(n)} style={{ marginRight: 8 }}>
                    <Text style={{ color: newReviewRating >= n ? '#FFD700' : '#999' }}>{'★'}</Text>
                  </Pressable>
                ))}
              </View>
              <Pressable onPress={handleAddReview} style={{ marginTop: 12 }}>
                <Text style={{ color: '#0a7ea4' }}>Submit Review</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#1e293b' }]}>About</Text>
          <Text style={[styles.description, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>{attraction.description}</Text>

          {(attraction as any)?.address ? (
            <Text style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>Address: {(attraction as any).address}</Text>
          ) : null}
          {(attraction as any)?.website ? (
            <Text style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>Website: {(attraction as any).website}</Text>
          ) : null}
          {(attraction as any)?.phone ? (
            <Text style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>Phone: {(attraction as any).phone}</Text>
          ) : null}
          {(attraction as any)?.contactEmail ? (
            <Text style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>Email: {(attraction as any).contactEmail}</Text>
          ) : null}
          {(attraction as any)?.openingHours ? (
            <Text style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>Hours: {(attraction as any).openingHours}</Text>
          ) : null}
          {(attraction as any)?.avgDuration ? (
            <Text style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>Avg. visit: {(attraction as any).avgDuration}</Text>
          ) : null}
          {(attraction as any)?.price ? (
            <Text style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>Price: ${(attraction as any).price}{(attraction as any)?.discountPrice ? ` (discount $${(attraction as any).discountPrice})` : ''}</Text>
          ) : null}

          {Array.isArray((attraction as any)?.tags) && (attraction as any).tags.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {(attraction as any).tags.map((t: any) => (
                <View key={t.id} style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: darkMode ? '#0b2239' : '#e6f3f7', borderRadius: 999, marginRight: 8, marginBottom: 8 }}>
                  <Text style={{ color: darkMode ? '#9BD3E6' : '#0a7ea4' }}>#{t.name}</Text>
                </View>
              ))}
            </View>
          ) : null}

          {Array.isArray((attraction as any)?.galleryImages) && (attraction as any).galleryImages.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {(attraction as any).galleryImages.map((img: any) => (
                <Image key={img.id} source={{ uri: getImageUrl(img) }} style={{ width: 160, height: 110, borderRadius: 8, marginRight: 8 }} />
              ))}
            </ScrollView>
          ) : null}

          {(() => {
            const lat = (attraction as any)?.latitude ?? (attraction as any)?.lat ?? (attraction as any)?.location?.lat;
            const lng = (attraction as any)?.longitude ?? (attraction as any)?.lng ?? (attraction as any)?.location?.lng;
            if (typeof lat === 'number' && typeof lng === 'number') {
              return (
                <View style={{ marginTop: 12, height: 220, borderRadius: 12, overflow: 'hidden' }}>
                  <MapView style={{ flex: 1 }} initialRegion={{ latitude: lat, longitude: lng, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
                    <Marker coordinate={{ latitude: lat, longitude: lng }} title={(attraction as any)?.name} />
                  </MapView>
                </View>
              );
            }
            return null;
          })()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 0, paddingBottom: 10 },
  headerButton: { padding: 8 },
  title: { fontSize: 20, fontWeight: '600' },
  image: { width: '100%', height: 200 },
  imagePlaceholder: { width: '100%', height: 200, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  description: { fontSize: 14, lineHeight: 20 },
  loadingText: { fontSize: 16, marginTop: 12 },
  errorText: { fontSize: 16, marginTop: 12 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  retryButton: { backgroundColor: '#0a7ea4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 12 },
  retryButtonText: { color: '#fff' },
});


