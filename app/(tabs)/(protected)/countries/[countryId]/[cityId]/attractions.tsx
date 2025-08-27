import { attractionsApi } from '@/apis/attractions';
import SafeAreaView from '@/components/SafeAreaView';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function CityAttractions() {
	const router = useRouter();
	const { cityId } = useLocalSearchParams();
	const { darkMode } = useThemeStore();

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['city-pois', cityId],
		queryFn: async () => {
			if (!cityId) throw new Error('Missing cityId');
			const res = await attractionsApi.getAttractionsForCity(Number(cityId));
			return res;
		},
		enabled: !!cityId,
	});

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
				<ActivityIndicator size="large" color="#0a7ea4" />
				<Text style={[styles.loadingText, { color: darkMode ? '#fff' : '#1e293b' }]}>Loading attractions...</Text>
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
				<View style={styles.center}>
					<MaterialIcons name="error-outline" size={48} color="#ff6b6b" />
					<Text style={[styles.errorText, { color: darkMode ? '#fff' : '#1e293b' }]}>Failed to load attractions</Text>
					<Pressable onPress={() => refetch()} style={styles.retryButton}>
						<Text style={styles.retryButtonText}>Retry</Text>
					</Pressable>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
			<View style={styles.header}>
				<Pressable onPress={() => router.push({ pathname: '/(tabs)/(protected)/countries/[countryId]/[cityId]', params: { countryId: String(data?.data?.[0]?.city?.countryId ?? ''), cityId: String(cityId) } })} style={styles.headerButton}>
					<MaterialIcons name="arrow-back" size={28} color={darkMode ? '#fff' : '#1e293b'} />
				</Pressable>
				<Text style={[styles.title, { color: darkMode ? '#fff' : '#1e293b' }]}>Attractions</Text>
				<View style={{ width: 28 }} />
			</View>

			<ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
				{Array.isArray(data?.data) && data.data.length > 0 ? (
					data.data.map((poi: any) => (
						
						<Pressable key={poi.id} style={[styles.card, { backgroundColor: darkMode ? '#1F2937' : '#fff' }]} onPress={() => { /* TODO: detail page */ }}>
							{poi.mainImage ? (
								
								<Image 
								source={
									poi.mainImage
									  ? { uri: `${process.env.EXPO_PUBLIC_IMAGES_URL}/${poi.mainImage.objectKey}` }
									  : undefined
								  }
								 style={styles.cardImage} />
							) : (
								<View style={[styles.cardImagePlaceholder, { backgroundColor: darkMode ? '#111' : '#f3f4f6' }]}>
									<MaterialIcons name="image" size={24} color={darkMode ? '#666' : '#999'} />
								</View>
							)}
							<View style={styles.cardBody}>
								<Text style={[styles.cardTitle, { color: darkMode ? '#fff' : '#1e293b' }]}>{poi.name}</Text>
								<Text numberOfLines={2} style={[styles.cardSubtitle, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>{poi.description}</Text>
							</View>
						</Pressable>
					))
				) : (
					<Text style={{ color: darkMode ? '#fff' : '#1e293b' }}>No attractions found.</Text>
				)}
			</ScrollView>
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
	card: {
		borderRadius: 12,
		overflow: 'hidden',
		marginBottom: 16,
		flexDirection: 'row',
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	cardImage: {
		width: 100,
		height: 100,
		borderRadius: 12,
		marginRight: 12,
	},
	cardImagePlaceholder: {
		width: 100,
		height: 100,
		borderRadius: 12,
		justifyContent: 'center',
		alignItems: 'center',
	},
	cardBody: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: '600',
		marginBottom: 4,
	},
	cardSubtitle: {
		fontSize: 14,
	},
}); 