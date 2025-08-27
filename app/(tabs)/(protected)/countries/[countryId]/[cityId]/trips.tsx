import { tripsApi } from '@/apis/tripsApi';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TripsScreen() {
  const router = useRouter();
  const { darkMode } = useThemeStore();

  const backgroundColor = darkMode ? '#0b1220' : '#ffffff';
  const cardColor = darkMode ? '#1e293b' : '#f8fafc';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const subTextColor = darkMode ? '#94a3b8' : '#475569';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['trips', 7], // City ID = 7
    queryFn: () => tripsApi.getTripsForCity(7),
  });

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.loaderContainer, { backgroundColor }]}>
        <Text style={{ color: textColor }}>Failed to load trips</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ backgroundColor }} contentContainerStyle={{ padding: 16 }}>
      {data?.data.map((trip: any) => (
        <TouchableOpacity
          key={trip.id}
          style={[
            styles.card,
            { backgroundColor: cardColor, borderColor },
            darkMode && styles.darkShadow,
          ]}
          onPress={() => router.push(`/trips/${trip.id}`)}
        >
          <Image
            source={{ uri: `http://192.168.137.1:3000/${trip.mainImage.objectKey}` }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.cardContent}>
            <Text style={[styles.tripName, { color: textColor }]}>{trip.name}</Text>
            <Text style={[styles.tripDate, { color: subTextColor }]}>
              {trip.startDate} → {trip.endDate}
            </Text>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <MaterialIcons name="payments" size={18} color="#0a7ea4" />
                <Text style={[styles.metaText, { color: textColor }]}>
                  ${trip.pricePerPerson}
                </Text>
              </View>
              {trip.withMeals && <MaterialIcons name="restaurant" size={18} color="#0a7ea4" />}
              {trip.withTransport && <MaterialIcons name="directions-bus" size={18} color="#0a7ea4" />}
              {trip.hotelIncluded && <MaterialIcons name="hotel" size={18} color="#0a7ea4" />}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 12,
  },
  tripName: {
    fontSize: 18,
    fontWeight: '600',
  },
  tripDate: {
    fontSize: 14,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginRight: 8,
  },
  metaText: {
    fontSize: 14,
  },
  darkShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 4,
  },
});
