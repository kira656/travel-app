import { tripsApi } from '@/apis/tripsApi';
import { useThemeStore } from '@/stores/themeStore';
import { getImageUrl } from '@/utils/imageUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Image, Pressable, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function TripsScreen() {
  const router = useRouter();
  const { darkMode } = useThemeStore();
  const { countryId, cityId } = useLocalSearchParams();

  const backgroundColor = darkMode ? '#0b1220' : '#ffffff';
  const cardColor = darkMode ? '#1e293b' : '#f8fafc';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const subTextColor = darkMode ? '#94a3b8' : '#475569';
  const badgeColor = darkMode ? '#334155' : '#e2e8f0';

  const { data, isLoading, isError } = useQuery({
    queryKey: ['trips', cityId],
    queryFn: () => tripsApi.getTripsForCity(Number(cityId)),
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
                              <Pressable
          onPress={() => {
            const ctryId = String((data as any)?.city?.countryId ?? countryId ?? '');
            const ctyId = String((data as any)?.city?.id ?? cityId ?? '');
            router.push({ pathname: '/(tabs)/(protected)/countries/[countryId]/[cityId]', params: { countryId: ctryId, cityId: ctyId } });
          }}
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)', borderRadius: 999, padding: 8, borderWidth: 1, borderColor: darkMode ? '#334155' : '#e2e8f0' }}
        >
          <MaterialIcons name="arrow-back" size={22} color={darkMode ? '#fff' : '#1e293b'} />
        </Pressable>

      {data?.data.map((trip: any) => (
        <TouchableOpacity
          key={trip.id}
          style={[
            styles.card,
            { backgroundColor: cardColor, borderColor },
            darkMode && styles.darkShadow,
          ]}
          onPress={() =>
            router.push(`/(tabs)/(protected)/countries/${countryId}/${cityId}/trips/${trip.id}/`)
          }
          
        >

          <Image
            source={{ uri: getImageUrl(trip.mainImage) }}
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

              {trip.withMeals && (
                <View style={styles.metaItem}>
                  <MaterialIcons name="restaurant" size={18} color="#0a7ea4" />
                  <Text style={[styles.metaText, { color: subTextColor }]}>
                    + ${trip.mealPricePerPerson} meals
                  </Text>
                </View>
              )}

              {trip.withTransport && (
                <View style={styles.metaItem}>
                  <MaterialIcons name="directions-bus" size={18} color="#0a7ea4" />
                  <Text style={[styles.metaText, { color: subTextColor }]}>
                    + ${trip.transportationPricePerPerson} transport
                  </Text>
                </View>
              )}

              {trip.hotelIncluded && (
                <MaterialIcons name="hotel" size={18} color="#0a7ea4" />
              )}
            </View>

            <View style={styles.metaRow}>
              <MaterialIcons name="group" size={18} color="#0a7ea4" />
              <Text style={[styles.metaText, { color: subTextColor }]}>
                {trip.minPeople}–{trip.maxPeople} people
              </Text>
            </View>

            <View style={styles.metaRow}>
              <MaterialIcons name="event-seat" size={18} color="#0a7ea4" />
              <Text style={[styles.metaText, { color: subTextColor }]}>
                {trip.minSeatsPerUser}–{trip.maxSeatsPerUser} seats/user
              </Text>
            </View>

            <View style={styles.metaRow}>
              <MaterialIcons name="info" size={18} color="#0a7ea4" />
              <Text style={[styles.metaText, { color: subTextColor }]}>{trip.tripType}</Text>
            </View>

            {trip.tripToTags?.length > 0 && (
              <View style={[styles.metaRow, { flexWrap: 'wrap' }]}>
                {trip.tripToTags.map(({ tag }: any) => (
                  <View
                    key={tag.id}
                    style={{
                      backgroundColor: badgeColor,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                      marginRight: 6,
                      marginTop: 6,
                    }}
                  >
                    <Text style={{ color: textColor, fontSize: 12 }}>{tag.name}</Text>
                  </View>
                ))}
              </View>
            )}
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
