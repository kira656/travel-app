import { citiesApi } from '@/apis/cities';
import { favouritesApi } from '@/apis/favourites';
import { reviewsApi } from '@/apis/reviews';
import MapView, { Marker } from '@/components/MapShim';
import SafeAreaView from '@/components/SafeAreaView';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { getImageUrl } from '@/utils/imageUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

export default function CityDetails() {
  const router = useRouter();
  const { cityId } = useLocalSearchParams();
  const { darkMode } = useThemeStore();
  const [showFavouritesModal, setShowFavouritesModal] = useState(false);
  const [showReviewsModal, setShowReviewsModal] = useState(false);
  const [favouritesLoading, setFavouritesLoading] = useState(false);
  const [favouritesList, setFavouritesList] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsList, setReviewsList] = useState<any[]>([]);
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);


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
  const queryClient = useQueryClient();

  // Define fetch functions before effects so they are available when effects run
  async function fetchFavourites(page = 1, limit = 20) {
    if (!cityData) return;
    setFavouritesLoading(true);
    try {
      const token = useAuthStore.getState().token ?? undefined;
      const res = await favouritesApi.getFavouritesForEntity('city', cityData.id, page, limit, token ?? undefined);
      setFavouritesList(res.items ?? []);
    } catch (err) {
      console.warn('Failed to fetch favourites', err);
      setFavouritesList([]);
    } finally {
      setFavouritesLoading(false);
    }
  }

  async function fetchReviews(page = 1, limit = 20) {
    if (!cityData) return;
    setReviewsLoading(true);
    try {
      const token = useAuthStore.getState().token ?? undefined;
      const res = await reviewsApi.getReviewsForEntity('city', cityData.id, page, limit, token ?? undefined);
      setReviewsList(res.items ?? []);
    } catch (err) {
      console.warn('Failed to fetch reviews', err);
      setReviewsList([]);
    } finally {
      setReviewsLoading(false);
    }
  }

  useEffect(() => {
    if (showFavouritesModal) fetchFavourites();
  }, [showFavouritesModal]);

  useEffect(() => {
    if (showReviewsModal) fetchReviews();
  }, [showReviewsModal]);

  // Fetch favourites and reviews when city data becomes available
  useEffect(() => {
    if (cityData) {
      fetchFavourites();
      fetchReviews();
    }
  }, [cityData]);

  const openFavouritesModal = () => setShowFavouritesModal(true);
  const openReviewsModal = () => setShowReviewsModal(true);

  const handleToggleFavourite = async () => {
    if (!cityData) return;
    if (!useAuthStore.getState().isLoggedIn) { router.push('/(auth)/login'); return; }
    try {
      await useAuthStore.getState().toggleFavorite({ id: cityData.id.toString(), name: cityData.name, type: 'city' });
      await queryClient.invalidateQueries({ queryKey: ['city', cityId] });
      if (showFavouritesModal) await fetchFavourites();
    } catch (err) {
      console.warn('Failed to toggle favourite', err);
    }
  };

  const handleAddReview = async () => {
    if (!cityData) return;
    if (!useAuthStore.getState().isLoggedIn) { router.push('/(auth)/login'); return; }
    try {
      const token = useAuthStore.getState().token ?? undefined;
      await reviewsApi.addReview({ entityType: 'city', entityId: cityData.id, rating: newReviewRating, comment: newReviewText }, token ?? undefined);
      setNewReviewText('');
      setNewReviewRating(5);
      await queryClient.invalidateQueries({ queryKey: ['city', cityId] });
      if (showReviewsModal) await fetchReviews();
    } catch (err) {
      console.warn('Failed to add review', err);
    }
  };

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
  console.log("city data",cityData);
  // City API returns [longitude, latitude] — be defensive when reading values
  const rawCenter = Array.isArray(cityData.center) ? cityData.center : [undefined, undefined];
  const [lng, lat] = rawCenter;
  // Ensure we have numeric coords
  const latNum = typeof lat === 'number' ? lat : parseFloat(String(lat)) || undefined;
  const lngNum = typeof lng === 'number' ? lng : parseFloat(String(lng)) || undefined;
  const mainImageUrl = cityData.mainImage ? getImageUrl(cityData.mainImage) : null;
  const transportRate = cityData.distanceRates[0]?.transportRatePerKm;

  return (
<View style={{ flex: 1, backgroundColor: darkMode ? '#0b1220' : '#ffffff' }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with back button */}
        {/* <View style={styles.header}> */}
          {/* <Pressable onPress={() => router.replace(`/(tabs)/(protected)/countries/${cityData.countryId}?name=${encodeURIComponent(cityData.country.name)}`)} style={styles.headerButton}>
            <MaterialIcons
              name="arrow-back"
              size={22} color={darkMode ? '#fff' : '#1e293b'}
            />
          </Pressable> */}
          <Pressable
          onPress={() => {
            //const ctryId = String((data as any)?.city?.countryId ?? countryId ?? '');
           // const ctyId = String((data as any)?.city?.id ?? cityId ?? '');
           router.replace(`/(tabs)/(protected)/countries/${cityData.countryId}?name=${encodeURIComponent(cityData.country.name)}`)}}
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)', borderRadius: 999, padding: 8, borderWidth: 1, borderColor: darkMode ? '#334155' : '#e2e8f0' }}
        >
          <MaterialIcons name="arrow-back" size={22} color={darkMode ? '#fff' : '#1e293b'} />
        </Pressable>

        {/* </View> */}

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

        {/* Favourites and Reviews under main image */}
        <View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Pressable onPress={openFavouritesModal} style={{ marginRight: 16 }}>
              <Text style={{ color: darkMode ? '#9BD3E6' : '#0a7ea4' }}>{(cityData as any).favourites?.length ?? (cityData as any).favouritesCount ?? 0} favourites</Text>
            </Pressable>
            <Pressable onPress={openReviewsModal}>
              <Text style={{ color: darkMode ? '#9BD3E6' : '#0a7ea4' }}>{(cityData as any).reviewsCount ?? 0} reviews</Text>
            </Pressable>
          </View>
          <Pressable onPress={handleToggleFavourite} style={{ padding: 8 }}>
            <MaterialIcons name={useAuthStore.getState().isFavorite(String(cityData.id)) ? 'favorite' : 'favorite-border'} size={28} color={useAuthStore.getState().isFavorite(String(cityData.id)) ? (darkMode ? '#ff6b6b' : '#dc2626') : (darkMode ? '#94a3b8' : '#64748b')} />
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
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
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
          <TouchableWithoutFeedback onPress={() => setShowReviewsModal(false)}>
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
                style={{ borderWidth: 1, borderColor: '#e2e8f0', padding: 8, marginTop: 8 }}
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
            ) : (
              (Platform.OS === 'ios' || Platform.OS === 'android' || (typeof latNum === 'number' && typeof lngNum === 'number')) ? (
                <View style={{ height: 400, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
                  <MapView
                    style={{ flex: 1 }}
                    mapType="standard"
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
              )
            )}
          </View>

          {/* Action Buttons */}
          <View style={[styles.actionsContainer, themeStyles.card]}>
            <View style={styles.actionsRow}>
              <Pressable
                style={styles.actionButton}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/(protected)/countries/[countryId]/[cityId]/hotels',
                    params: { countryId: cityData.country.id.toString(), cityId: cityData.id.toString() },
                  })
                }
              >
                <Text style={[styles.actionText, themeStyles.text]}>View Hotels</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/(protected)/countries/[countryId]/[cityId]/attractions',
                    params: { countryId: cityData.country.id.toString(), cityId: cityData.id.toString() },
                  })
                }
              >
                <Text style={[styles.actionText, themeStyles.text]}>View Attractions</Text>
              </Pressable>
            </View>

            <View style={styles.actionsRow}>
              <Pressable
                style={styles.actionButton}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/(protected)/countries/[countryId]/[cityId]/trips',
                    params: { countryId: cityData.country.id.toString(), cityId: cityData.id.toString() },
                  })
                }
              >
                <Text style={[styles.actionText, themeStyles.text]}>View Trips</Text>
              </Pressable>

              <Pressable
                style={styles.actionButton}
                onPress={() =>
                  router.push({
                    pathname: '/(tabs)/(protected)/countries/[countryId]/[cityId]/map',
                    params: { countryId: cityData.country.id.toString(), cityId: cityData.id.toString() },
                  })
                }
              >
                <Text style={[styles.actionText, themeStyles.text]}>View on Map</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
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
  actionsContainer: {
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  actionButton: {
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});