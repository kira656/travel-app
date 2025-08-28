import { favouritesApi } from '@/apis/favourites';
import { hotelsApi } from '@/apis/hotels';
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
import { ActivityIndicator, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function HotelDetails() {
	const router = useRouter();
	const { hotelId } = useLocalSearchParams();
	const { darkMode } = useThemeStore();

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['hotel', hotelId],
		queryFn: async () => {
			if (!hotelId) throw new Error('Missing hotelId');
			const res = await hotelsApi.getHotelById(Number(hotelId));
			return res;
		},
		enabled: !!hotelId,
	});

	const queryClient = useQueryClient();
	const [showFavouritesModal, setShowFavouritesModal] = useState(false);
	const [showReviewsModal, setShowReviewsModal] = useState(false);
	const [newReviewText, setNewReviewText] = useState('');
	const [newReviewRating, setNewReviewRating] = useState(5);
	const [favouritesList, setFavouritesList] = useState<any[]>([]);
	const [favouritesLoading, setFavouritesLoading] = useState(false);
	const [reviewsList, setReviewsList] = useState<any[]>([]);
	const [reviewsLoading, setReviewsLoading] = useState(false);

	useEffect(() => {
		if (showFavouritesModal) fetchFavourites();
	}, [showFavouritesModal]);

	useEffect(() => {
		if (showReviewsModal) fetchReviews();
	}, [showReviewsModal]);
	const [isFavorite, setIsFavorite] = useState(useAuthStore.getState().isFavorite(hotelId?.toString() ?? ''));

	const handleAddFavourite = async () => {
		const { isLoggedIn, toggleFavorite } = useAuthStore.getState();
		if (!isLoggedIn) {
		  router.push('/(auth)/login');
		  return;
		}
		try {
		  await toggleFavorite({ id: hotel.id.toString(), name: hotel.name, type: 'hotel' });
		  setIsFavorite(useAuthStore.getState().isFavorite(hotel.id.toString())); // ✅ update local state
		  await queryClient.invalidateQueries({ queryKey: ['hotel', Number(hotel.id)] });
		  await refetch(); // ✅ ensures fresh data

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
			await reviewsApi.addReview({ entityType: 'hotel', entityId: data.id, rating: newReviewRating, comment: newReviewText }, token ?? undefined);
			setNewReviewText('');
			setNewReviewRating(5);
			await queryClient.invalidateQueries({ queryKey: ['hotel', Number(data.id)] });
			if (showReviewsModal) await fetchReviews();
		} catch (err) {
			console.warn('Failed to add review', err);
		}
	};

	const fetchFavourites = async (page = 1, limit = 20) => {
		setFavouritesLoading(true);
		try {
			const token = useAuthStore.getState().token ?? undefined;
			const res = await favouritesApi.getFavouritesForEntity('hotel', data.id, page, limit, token ?? undefined);
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
			const res = await reviewsApi.getReviewsForEntity('hotel', data.id, page, limit, token ?? undefined);
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
					<Text style={[styles.loadingText, { color: darkMode ? '#fff' : '#1e293b' }]}>Loading hotel...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (error || !data) {
		return (
			<SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
				<View style={styles.center}>
					<MaterialIcons name="error-outline" size={48} color="#ff6b6b" />
					<Text style={[styles.errorText, { color: darkMode ? '#fff' : '#1e293b' }]}>Failed to load hotel</Text>
					<Pressable onPress={() => refetch()} style={styles.retryButton}><Text style={styles.retryButtonText}>Retry</Text></Pressable>
				</View>
			</SafeAreaView>
		);
	}

	const hotel = data;


	return (
		<View style={{ flex: 1, backgroundColor: darkMode ? '#0b1220' : '#ffffff' }}>
			<ScrollView showsVerticalScrollIndicator={false}>

					<Pressable onPress={() => router.push({ pathname: '/(tabs)/(protected)/countries/[countryId]/[cityId]/hotels', params: { countryId: String(hotel.city?.countryId ?? ''), cityId: String(hotel.city?.id ?? '') } })} style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)', borderRadius: 999, padding: 8, borderWidth: 1, borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
						<MaterialIcons name="arrow-back" size={22} color={darkMode ? '#fff' : '#1e293b'} />
					</Pressable>
					
					<View style={{ width: 28 }} />
				{/* </View> */}

				{hotel.mainImage ? (
					<Image source={{ uri: getImageUrl(hotel.mainImage) }} style={styles.image} resizeMode="cover" />
				) : (
					<View style={[styles.imagePlaceholder, { backgroundColor: darkMode ? '#1E1E1E' : '#f3f4f6' }]}>
						<MaterialIcons name="hotel" size={48} color={darkMode ? '#666' : '#999'} />
					</View>
				)}

				{/* Favourites and Reviews under main image */}
				<View style={{ flexDirection: 'row', marginTop: 12, alignItems: 'center', justifyContent: 'space-between' }}>
					<View style={{ flexDirection: 'row', alignItems: 'center' }}>
						<Pressable onPress={() => setShowFavouritesModal(true)} style={{ marginRight: 16 }}>
							<Text style={{ color: darkMode ? '#9BD3E6' : '#0a7ea4' }}>{hotel.favourites?.length ?? hotel.favouritesCount ?? 0} favourites</Text>
						</Pressable>
						<Pressable onPress={() => setShowReviewsModal(true)}>
							<Text style={{ color: darkMode ? '#9BD3E6' : '#0a7ea4' }}>{hotel.reviewsCount ?? 0} reviews</Text>
						</Pressable>
					</View>
					<Pressable onPress={handleAddFavourite} style={{ padding: 8 }}>
					<MaterialIcons
  name={isFavorite ? 'favorite' : 'favorite-border'}
  size={28}
  color={isFavorite ? (darkMode ? '#ff6b6b' : '#dc2626') : (darkMode ? '#94a3b8' : '#64748b')}
/>

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
					<Text style={[styles.description, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>{hotel.description}</Text>

					<Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#1e293b' }]}>Room Types</Text>
					{Array.isArray(hotel.roomTypes) && hotel.roomTypes.length > 0 ? (
						hotel.roomTypes.map((rt: any) => (
							<Pressable key={rt.id} style={[styles.roomTypeRow, { backgroundColor: darkMode ? '#1F2937' : '#fff' }]} onPress={() => router.push({ pathname: '/(tabs)/(protected)/hotels/[hotelId]/room-types/[roomTypeId]', params: { hotelId: String(hotel.id), roomTypeId: String(rt.id) } })}>
									{rt.mainImage ? (
										<Image source={{ uri: getImageUrl(rt.mainImage) }} style={styles.image} resizeMode="cover" />
									) : (
										<View style={[styles.imagePlaceholder, { backgroundColor: darkMode ? '#1E1E1E' : '#f3f4f6' }]}>
											<MaterialIcons name="hotel" size={48} color={darkMode ? '#666' : '#999'} />
										</View>
									)}
								<Text style={[styles.roomTypeLabel, { color: darkMode ? '#fff' : '#1e293b' }]}>{rt.label}</Text>
								<Text style={[styles.roomTypeSubtitle, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>{rt.description}</Text>
							</Pressable>
						))
					) : (
						<Text style={{ color: darkMode ? '#fff' : '#1e293b' }}>No room types found.</Text>
					)}

					{/* Map section (uses MapShim for web safety) */}
					{(() => {
						const lat = (hotel as any)?.latitude ?? (hotel as any)?.lat ?? (hotel as any)?.location?.lat;
						const lng = (hotel as any)?.longitude ?? (hotel as any)?.lng ?? (hotel as any)?.location?.lng;
						let latNum: number | undefined = typeof lat === 'number' ? lat : (lat ? parseFloat(String(lat)) : undefined);
						let lngNum: number | undefined = typeof lng === 'number' ? lng : (lng ? parseFloat(String(lng)) : undefined);
						if ((latNum == null || isNaN(latNum)) && Array.isArray((hotel as any)?.city?.center)) {
							const [cityLng, cityLat] = (hotel as any).city.center;
							latNum = typeof cityLat === 'number' ? cityLat : (cityLat ? parseFloat(String(cityLat)) : undefined);
							lngNum = typeof cityLng === 'number' ? cityLng : (cityLng ? parseFloat(String(cityLng)) : undefined);
						}
						if (typeof latNum === 'number' && typeof lngNum === 'number') {
							return (
								<View style={{ marginTop: 12, height: 220, borderRadius: 12, overflow: 'hidden' }}>
									<MapView style={{ flex: 1 }} initialRegion={{ latitude: latNum, longitude: lngNum, latitudeDelta: 0.02, longitudeDelta: 0.02 }}>
										<Marker coordinate={{ latitude: latNum, longitude: lngNum }} title={hotel.name} />
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
	roomTypeRow: { borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
	roomTypeLabel: { fontSize: 16, fontWeight: '600' },
	roomTypeSubtitle: { fontSize: 13, marginTop: 4 },
	loadingText: { fontSize: 16, marginTop: 12 },
	errorText: { fontSize: 16, marginTop: 12 },
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	retryButton: { backgroundColor: '#0a7ea4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 12 },
	retryButtonText: { color: '#fff' },
}); 