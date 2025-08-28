import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native';

import { tripBookingsApi } from '@/apis/tripBookings';
import { tripsApi } from '@/apis/tripsApi';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { getImageUrl } from '@/utils/imageUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { TextInput } from 'react-native-gesture-handler';

export default function TripDetailScreen() {
  const { tripId , countryId, cityId } = useLocalSearchParams();
  const { darkMode } = useThemeStore();

  const backgroundColor = darkMode ? '#0b1220' : '#ffffff';
  const cardColor = darkMode ? '#1e293b' : '#f8fafc';
  const textColor = darkMode ? '#f1f5f9' : '#0f172a';
  const subTextColor = darkMode ? '#94a3b8' : '#475569';
  const borderColor = darkMode ? '#334155' : '#e2e8f0';
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [desiredSeats, setDesiredSeats] = useState<number | null>(null);



  const { data, isLoading, isError } = useQuery({
    queryKey: ['trip', tripId],
    queryFn: () => tripsApi.getTripById(Number(tripId)),
  });

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor }]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (isError || !data) {
    return (
      <View style={[styles.center, { backgroundColor }]}>
        <Text style={{ color: textColor }}>Failed to load trip</Text>
      </View>
    );
  }

  const trip = data;
  
  console.log(data);
  return (
    
    <ScrollView style={{ backgroundColor }} contentContainerStyle={{ padding: 16 }}>
                      <Pressable
          onPress={() => {
            const ctryId = String((data as any)?.city?.countryId ?? countryId ?? '');
            const ctyId = String((data as any)?.city?.id ?? cityId ?? '');
            router.push({ pathname: '/(tabs)/(protected)/countries/[countryId]/[cityId]/trips', params: { countryId: ctryId, cityId: ctyId } });
          }}
          style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)', borderRadius: 999, padding: 8, borderWidth: 1, borderColor: darkMode ? '#334155' : '#e2e8f0' }}
        >
          <MaterialIcons name="arrow-back" size={22} color={darkMode ? '#fff' : '#1e293b'} />
        </Pressable>
      {/* Main Image */}
      <Image
        source={{ uri: (getImageUrl(trip.mainImage)) }}
        style={styles.mainImage}
      />

      {/* Title & Tags */}
      <Text style={[styles.title, { color: textColor }]}>{trip.name}</Text>
      <Text style={[styles.subtext, { color: subTextColor }]}>
        {trip.startDate} → {trip.endDate}
      </Text>
      <View style={styles.tagRow}>
        {trip.tripToTags.map(({ tag }) => (
          <View key={tag.id} style={[styles.tag, { backgroundColor: cardColor, borderColor }]}>
            <Text style={{ color: textColor }}>{tag.name}</Text>
          </View>
        ))}
      </View>

      {/* Guide Info */}
      <View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
        <Text style={[styles.sectionTitle, { color: textColor }]}>Guide</Text>
        <Text style={[styles.subtext, { color: subTextColor }]}>
          {trip.guide.user.name} — ${trip.guide.pricePerDay}/day
        </Text>
        <Text style={[styles.subtext, { color: subTextColor }]}>{trip.guide.description}</Text>
      </View>

      {/* Hotel Info */}
      {trip.tripHotels.map(({ hotel, roomType }, i) => (
        <View key={i} style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Hotel</Text>
          <Text style={[styles.subtext, { color: subTextColor }]}>
            {hotel.name} ({hotel.stars}★) — {roomType.label} @ ${roomType.baseNightlyRate}
          </Text>
        </View>
      ))}
      {/* Pricing Info */}
<View style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
  <Text style={[styles.sectionTitle, { color: textColor }]}>Pricing</Text>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
    <MaterialIcons name="payments" size={18} color="#0a7ea4" />
    <Text style={[styles.subtext, { color: subTextColor }]}>
      Base: ${trip.pricePerPerson}
    </Text>
  </View>

  {trip.withMeals && (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <MaterialIcons name="restaurant" size={18} color="#0a7ea4" />
      <Text style={[styles.subtext, { color: subTextColor }]}>
        Meals: +${trip.mealPricePerPerson}
      </Text>
    </View>
  )}

  {trip.withTransport && (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
      <MaterialIcons name="directions-bus" size={18} color="#0a7ea4" />
      <Text style={[styles.subtext, { color: subTextColor }]}>
        Transport: +${trip.transportationPricePerPerson}
      </Text>
    </View>
  )}
</View>


      {/* Itinerary */}
      {trip.tripDays.map((day) => (
        <View key={day.id} style={[styles.section, { backgroundColor: cardColor, borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Day {day.dayNumber}: {day.startTime} → {day.endTime}
          </Text>
          {day.tripPois.map(({ poi }, i) => (
            <View key={i} style={styles.poiItem}>
              <MaterialIcons name="location-on" size={18} color="#0a7ea4" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.poiName, { color: textColor }]}>{poi.name}</Text>
                <Text style={[styles.subtext, { color: subTextColor }]}>{poi.address}</Text>
                <Text style={[styles.subtext, { color: subTextColor }]}>${poi.price}</Text>
              </View>
            </View>
          ))}
        </View>
      ))}
      <Pressable
  onPress={() => setShowBookingModal(true)}
  style={{ backgroundColor: '#0a7ea4', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 16 }}
>
  <Text style={{ color: '#fff' }}>Book Trip</Text>
</Pressable>
<Modal visible={showBookingModal} animationType="slide" transparent onRequestClose={() => setShowBookingModal(false)}>
  <TouchableWithoutFeedback onPress={() => setShowBookingModal(false)}>
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
  </TouchableWithoutFeedback>

  <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 16, borderTopWidth: 1, borderTopColor: darkMode ? '#333' : '#eee', backgroundColor: darkMode ? '#1a1a1a' : '#fff' }}>
    <Text style={{ color: textColor, fontSize: 16, fontWeight: '600', marginBottom: 8 }}>How many seats?</Text>
    <TextInput
      value={desiredSeats ? String(desiredSeats) : ''}
    
      onChangeText={(val) => {
        const num = parseInt(val);
        if (!isNaN(num)) setDesiredSeats(num);
      }}
      keyboardType="numeric"
      style={{ borderWidth: 1, borderColor: borderColor, padding: 8, borderRadius: 8, color: textColor }}
    />
    <Text style={{ color: subTextColor, marginTop: 4 }}>
      Min: {trip.minSeatsPerUser} / Max: {trip.maxSeatsPerUser}
    </Text>

    {/* Balance and Confirm */}
    {(() => {
      const base = parseFloat(trip.pricePerPerson);
      const meals = trip.withMeals ? parseFloat(trip.mealPricePerPerson) : 0;
      const transport = trip.withTransport ? parseFloat(trip.transportationPricePerPerson) : 0;
      const total = (base + meals + transport) * desiredSeats!;
      const userBalance = Number(useAuthStore.getState().user?.balance ?? 0);

      return (
        <View style={{ marginTop: 16 }}>
          <Text style={{ color: textColor }}>Total: ${total.toFixed(2)}</Text>
          <Text style={{ color: userBalance >= total ? (darkMode ? '#9BE6B8' : '#059669') : (darkMode ? '#ffb4b4' : '#dc2626') }}>
            Balance: ${userBalance.toFixed(2)}
          </Text>

          <Pressable
            onPress={async () => {
                if (
                    desiredSeats === null ||
                    desiredSeats < trip.minSeatsPerUser ||
                    desiredSeats > trip.maxSeatsPerUser
                  ) {
                    Alert.alert(
                      'Invalid seat count',
                      `Please enter a number between ${trip.minSeatsPerUser} and ${trip.maxSeatsPerUser}.`
                    );
                    return;
                  }
                  
              if (desiredSeats! < trip.minSeatsPerUser || desiredSeats! > trip.maxSeatsPerUser) {
                Alert.alert('Invalid seat count', `Please choose between ${trip.minSeatsPerUser} and ${trip.maxSeatsPerUser} seats.`);
                return;
              }
              if (userBalance < total) {
                Alert.alert('Insufficient balance', 'You do not have enough balance to complete this booking.');
                return;
              }

              try {
                await tripBookingsApi.bookTrip(Number(tripId), desiredSeats!);
                useAuthStore.getState().updateUser({ balance: userBalance - total } as any);
                Alert.alert('Booking confirmed', `You booked ${desiredSeats} seat(s).`);
                setShowBookingModal(false);
              } catch (err) {
                console.warn('Booking failed', err);
                Alert.alert('Booking failed', 'Please try again later.');
              }
            }}
            style={{ marginTop: 12, backgroundColor: '#0a7ea4', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', textAlign: 'center' }}>Confirm & Pay</Text>
          </Pressable>
        </View>
      );
    })()}
  </View>
</Modal>


      {/* Gallery */}
      <View style={styles.galleryRow}>
        {trip.galleryImages.map((img) => (
          <Image
            key={img.id}
            source={{ uri: getImageUrl(trip.mainImage) }}
            style={styles.galleryImage}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  mainImage: { width: '100%', height: 200, borderRadius: 12, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 4 },
  subtext: { fontSize: 14, marginBottom: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  section: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600', marginBottom: 6 },
  poiItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  poiName: { fontSize: 15, fontWeight: '500' },
  galleryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  galleryImage: {
    width: '48%',
    height: 120,
    borderRadius: 8,
  },
});
