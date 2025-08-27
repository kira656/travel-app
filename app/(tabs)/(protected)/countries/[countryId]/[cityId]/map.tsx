import SafeAreaView from '@/components/SafeAreaView';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

export default function CityMap() {
	const router = useRouter();
	const { cityId } = useLocalSearchParams();
	const { darkMode } = useThemeStore();

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['city-map-places', cityId],
		queryFn: async () => {
			if (!cityId) throw new Error('Missing cityId');
			return [] as any;
		},
		enabled: !!cityId,
	});

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
				<ActivityIndicator size="large" color="#0a7ea4" />
				<Text style={[styles.loadingText, { color: darkMode ? '#fff' : '#1e293b' }]}>Loading map...</Text>
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

	return (
		<SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
			<View style={styles.header}>
				<Pressable onPress={() => router.back()} style={styles.headerButton}>
					<MaterialIcons name="arrow-back" size={28} color={darkMode ? '#fff' : '#1e293b'} />
				</Pressable>
				<Text style={[styles.title, { color: darkMode ? '#fff' : '#1e293b' }]}>Map</Text>
				<View style={{ width: 28 }} />
			</View>
			<View style={styles.content}>
				<Text style={{ color: darkMode ? '#fff' : '#1e293b' }}>Map page for city {cityId}</Text>
				{/* Map component will be placed here later */}
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