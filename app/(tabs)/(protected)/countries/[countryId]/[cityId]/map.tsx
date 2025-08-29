import { citiesApi } from '@/apis/cities';
import MapView, { Circle, Marker } from '@/components/MapShim';
import SafeAreaView from '@/components/SafeAreaView';
import { useThemeStore } from '@/stores/themeStore';
import { getFallbackImageUrl, getImageUrl } from '@/utils/imageUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function CityMap() {
	const router = useRouter();
	const { cityId } = useLocalSearchParams();
	const { darkMode } = useThemeStore();

	const [selected, setSelected] = useState<{ type: 'hotel' | 'poi'; item: any } | null>(null);

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['city-with-places', cityId],
		queryFn: async () => {
			if (!cityId) throw new Error('Missing cityId');
			const res = await citiesApi.getCityWithHotelsAttractions(String(cityId));
			return res;
		},
		enabled: !!cityId,
	});

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
				<View style={styles.center}>
				<ActivityIndicator size="large" color="#0a7ea4" />
				<Text style={[styles.loadingText, { color: darkMode ? '#fff' : '#1e293b' }]}>Loading map...</Text>
				</View>
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
				<View style={styles.center}>
					<MaterialIcons name="error-outline" size={48} color="#ff6b6b" />
					<Text style={[styles.errorText, { color: darkMode ? '#fff' : '#1e293b' }]}>Failed to load map places</Text>
					<Pressable onPress={() => refetch()} style={styles.retryButton}>
						<Text style={styles.retryButtonText}>Retry</Text>
					</Pressable>
				</View>
			</SafeAreaView>
		);
	}
	console.log("ddddddddddddddddddddddddddddd",data);

	return (
		<SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
				
					<Pressable onPress={() => router.replace(`/(tabs)/(protected)/countries/${data.country.id}/${cityId}?name=${encodeURIComponent(data.name)}`)} style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)', borderRadius: 999, padding: 8, borderWidth: 1, borderColor: darkMode ? '#334155' : '#e2e8f0', }}>
						<MaterialIcons name="arrow-back" size={22} color={darkMode ? '#fff' : '#1e293b'} />
					</Pressable>
					
					{/* <Pressable onPress={() => router.push({ pathname: '/(tabs)/(protected)/countries/[countryId]/[cityId]', params: { countryId: String(data?.data?.[0]?.city?.countryId ?? ''), cityId: String(cityId) } })} style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)', borderRadius: 999, padding: 8, borderWidth: 1, borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
					<MaterialIcons name="arrow-back" size={22} color={darkMode ? '#fff' : '#1e293b'} />
				</Pressable> */}
					{/* <Text style={[styles.title, { color: darkMode ? '#fff' : '#1e293b' }]}>Map</Text> */}
					<View style={{ width: 28 }} />
				
			<View style={styles.content}>
				<Text style={{ color: darkMode ? '#fff' : '#1e293b', marginBottom: 8, textAlign: 'center' }}>Map for city {String((data as any)?.name || cityId)}</Text>
				{Platform.OS === 'web' ? (
					<Text style={{ color: darkMode ? '#9CA3AF' : '#6B7280',textAlign: 'center' }}>Map not supported on web.</Text>
				) : (
					(() => {
						// Determine map center from API if available; default to Rome coords
						let centerLat = 41.8933203;
						let centerLng = 12.4829321;
						const rawCenter = Array.isArray((data as any)?.center) ? (data as any).center : undefined; // [lng, lat]
						if (rawCenter && rawCenter.length === 2) {
							const [lng, lat] = rawCenter;
							centerLat = typeof lat === 'number' ? lat : (lat ? parseFloat(String(lat)) : centerLat);
							centerLng = typeof lng === 'number' ? lng : (lng ? parseFloat(String(lng)) : centerLng);
						}

						// Parse radius (meters) from data; default to 10000 meters if missing
						let cityRadiusMeters = 10000;
						const rawRadius = (data as any)?.radius;
						if (rawRadius !== undefined && rawRadius !== null) {
							const parsed = Number(rawRadius);
							if (!Number.isNaN(parsed) && parsed > 0) {
								// some APIs store radius as string kilometers or meters; assume kilometers if <= 100 and > 1
								cityRadiusMeters = parsed > 1000 ? parsed : parsed * (parsed <= 100 ? 1000 : 1);
							}
						}

						// Compute map deltas (latitudeDelta/longitudeDelta) from radius so default zoom is tighter
						// Earth: ~111km per degree latitude. We'll compute a delta that fits the radius with a padding factor.
						const metersToDegreesLat = (meters: number) => meters / 111000;
						const paddingFactor = 1.6; // slightly larger so markers aren't on the edge
						const latDelta = Math.max(0.01, metersToDegreesLat(cityRadiusMeters * paddingFactor));
						const lngDelta = Math.max(0.01, latDelta * 1.0);

						// Helper to compute fallback coordinates around center when item has no coords
						const pointOnCircle = (index: number, total: number, radius = 0.01) => {
							const angle = (2 * Math.PI * index) / Math.max(1, total);
							return {
								lat: centerLat + radius * Math.sin(angle),
								lng: centerLng + radius * Math.cos(angle),
							};
						};

						const hotels: any[] = Array.isArray((data as any)?.hotels) ? (data as any).hotels : [];
						const pois: any[] = Array.isArray((data as any)?.attractions) ? (data as any).attractions : [];

						return (
							<View style={{ height: 500, width: '100%', borderRadius: 8, overflow: 'hidden' }}>
								<MapView style={{ flex: 1 }} initialRegion={{ latitude: centerLat, longitude: centerLng, latitudeDelta: latDelta, longitudeDelta: lngDelta }}>
									{/* City center marker */}
									<Marker
										key={`city-center-${(data as any).id}`}
										coordinate={{ latitude: centerLat, longitude: centerLng }}
										title={(data as any).name}
										description={`City center of ${(data as any).name}`}
										pinColor="#EF4444"
									/>
									{/* Draw radius circle around city center (meters) */}
									{typeof Circle !== 'undefined' ? (
										<Circle center={{ latitude: centerLat, longitude: centerLng }} radius={cityRadiusMeters} strokeColor="rgba(14,165,233,0.6)" fillColor="rgba(14,165,233,0.15)" />
									) : null}
									{hotels.map((h, i) => {
										console.log('hotels',h.location)
										
										let lat = h.location[1];
										let lng = h.location[0];
										if (typeof lat !== 'number' || typeof lng !== 'number') {
											const p = pointOnCircle(i, hotels.length, 0.015);
											lat = p.lat; lng = p.lng;
										}
										return (
											<Marker
												key={`hotel-${h.id}`}
												coordinate={{ latitude: lat, longitude: lng }}
												title={h.name}
												description={(h.address || '').toString()}
												pinColor="#0a7ea4"
												onPress={() => setSelected({ type: 'hotel', item: h })}
											/>
										);
									})}

									{pois.map((p, i) => {
										let lat = p.location[1];
										let lng = p.location[0];
										if (typeof lat !== 'number' || typeof lng !== 'number') {
											const off = pointOnCircle(i, pois.length, 0.03); // different ring radius
											lat = off.lat; lng = off.lng;
										}
										return (
											<Marker
												key={`poi-${p.id}`}
												coordinate={{ latitude: lat, longitude: lng }}
												title={p.name}
												description={(p.address || '').toString()}
												pinColor="#F59E0B"
												onPress={() => setSelected({ type: 'poi', item: p })}
											/>
										);
									})}
								</MapView>
							</View>
						);
					})()
				)}
			{/* Bottom info card */}
			{selected && (
				<View style={{ position: 'absolute', left: 16, right: 16, bottom: 24 }}>
					<View style={{ borderRadius: 12, padding: 16, backgroundColor: darkMode ? '#1f2937' : '#ffffff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 }}>
						<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
							<Image source={{ uri: getImageUrl(selected.item.mainImage) || getFallbackImageUrl() }} style={{ width: 64, height: 64, borderRadius: 8, marginRight: 12 }} />
							<Text style={{ fontSize: 16, fontWeight: '700', color: darkMode ? '#fff' : '#1e293b' }} numberOfLines={1}>
								{selected.item.name}
							</Text>
							<Pressable onPress={() => setSelected(null)} style={{ padding: 6 }}>
								<MaterialIcons name="close" size={20} color={darkMode ? '#cbd5e1' : '#64748b'} />
							</Pressable>
						</View>
						<Text style={{ marginTop: 6, color: darkMode ? '#cbd5e1' : '#475569' }} numberOfLines={2}>
							{(selected.item.address || selected.item.description || '').toString()}
						</Text>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
							<MaterialIcons name="star" size={16} color="#F59E0B" />
							<Text style={{ marginLeft: 4, color: darkMode ? '#fff' : '#1e293b' }}>
								{(selected.item.avgRating ?? selected.item.averageRating ?? selected.item.rating ?? 0).toString()}
							</Text>
							<Text style={{ marginLeft: 6, color: darkMode ? '#94a3b8' : '#64748b' }}>({selected.item.ratingCount ?? selected.item.reviewsCount ?? 0})</Text>
						</View>
						<View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 }}>
							<Pressable
								onPress={() => {
									if (selected.type === 'hotel') {
										router.push({ pathname: '/(tabs)/(protected)/hotels/[hotelId]', params: { hotelId: String(selected.item.id) } });
									} else {
										router.push({ pathname: '/(tabs)/(protected)/attractions/[attractionId]', params: { attractionId: String(selected.item.id), cityId: String(cityId) } });
									}
								}}
								style={{ backgroundColor: '#0a7ea4', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 8 }}
							>
								<Text style={{ color: '#fff', fontWeight: '600' }}>View more</Text>
							</Pressable>
						</View>
					</View>
				</View>
			)}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: Platform.OS === 'android' ? 20 : 0, paddingBottom: 10 },
	headerButton: { padding: 8 },
	title: { fontSize: 20, fontWeight: '600' },
	content: { padding: 16 },
	loadingText: { fontSize: 16, marginTop: 12 },
	errorText: { fontSize: 16, marginTop: 12 },
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	retryButton: { backgroundColor: '#0a7ea4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 12 },
	retryButtonText: { color: '#fff' },
}); 