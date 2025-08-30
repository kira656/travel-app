
import popularApi from '@/apis/popular';
import { useThemeStore } from '@/stores/themeStore';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function Home() {
  const { darkMode } = useThemeStore();
  const base = process.env.EXPO_PUBLIC_API_URL || '';
  const router = useRouter();

  const getImageUri = (path?: string) => {
    if (!path) return undefined
    if (path.startsWith('http') || path.startsWith('data:')) return path
    const baseUrl = 'http://192.168.43.40:3000/storage/media'
    return `${baseUrl}${path}`
  }

  const { data: citiesData } = useQuery({ queryKey: ['popular', 'cities'], queryFn: () => popularApi.getPopular('city') })
  const { data: hotelsData } = useQuery({ queryKey: ['popular', 'hotels'], queryFn: () => popularApi.getPopular('hotel') })
  const { data: countriesData } = useQuery({ queryKey: ['popular', 'countries'], queryFn: () => popularApi.getPopular('country') })
  const { data: tripsData } = useQuery({ queryKey: ['popular', 'trips'], queryFn: () => popularApi.getPopular('trip') })

  const normalize = (d: any) => {
    if (!d) return []
    if (Array.isArray(d)) return d
    if (d.items && Array.isArray(d.items)) return d.items
    return []
  }

  const popularCities = normalize(citiesData)
  const popularHotels = normalize(hotelsData)
  const popularCountries = normalize(countriesData)
  const upcomingTrips = normalize(tripsData)

  return (
      <ScrollView style={[styles.bgWhite, darkMode && styles.bgDark]} showsVerticalScrollIndicator={false}>
      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Popular Cities</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={popularCities}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => {
              const countryId = item.countryId ?? ''
              const cityId = item.id
              const name = encodeURIComponent(item.title || '')
              router.push(`/countries/${countryId}/${cityId}?name=${name}` as any)
            }}
          >
            <View style={[styles.destinationCard, darkMode && styles.darkCard]}> 
              <View style={styles.imageWrap}>
                <Image source={{ uri: getImageUri(item.image) }} style={styles.destinationImage} />
                <View style={styles.imageOverlay}>
                  <Text style={[styles.overlayTitle, darkMode && styles.darkText]} numberOfLines={1}>{item.title}</Text>
                </View>
                <View style={[styles.ratingBadge, darkMode && styles.ratingBadgeDark]}>
                  <Text style={styles.ratingText}>{item.avgRating}</Text>
                </View>
              </View>
              <View style={styles.destinationInfo}>
                <Text style={[styles.destinationPrice, darkMode && styles.darkSubtext]}>Rating: {item.avgRating}</Text>
          </View>
        </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.eventList}
      />

      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Popular Hotels</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
        data={popularHotels}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push(`/hotels/${item.id}` as any)}>
            <View style={[styles.destinationCard, darkMode && styles.darkCard]}>
                <View style={styles.imageWrap}>
                  <Image source={{ uri: getImageUri(item.image) }} style={styles.destinationImage} />
                  <View style={styles.imageOverlay}>
                    <Text style={[styles.overlayTitle, darkMode && styles.darkText]} numberOfLines={1}>{item.title}</Text>
                  </View>
                  <View style={[styles.ratingBadge, darkMode && styles.ratingBadgeDark]}>
                    <Text style={styles.ratingText}>{item.avgRating}</Text>
                  </View>
                </View>
              <View style={styles.destinationInfo}>
                  <Text style={[styles.destinationPrice, darkMode && styles.darkSubtext]}>Rating: {item.avgRating}</Text>
              </View>
            </View>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.eventList}
        />

      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Popular Countries</Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
        data={popularCountries}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.85} onPress={() => router.push(`/countries/${item.id}` as any)}>
              <View style={[styles.destinationCard, darkMode && styles.darkCard]}>
                <View style={styles.imageWrap}>
                  <Image source={{ uri: getImageUri(item.image) }} style={styles.destinationImage} />
                  <View style={styles.imageOverlay}>
                    <Text style={[styles.overlayTitle, darkMode && styles.darkText]} numberOfLines={1}>{item.title}</Text>
                  </View>
                  <View style={[styles.ratingBadge, darkMode && styles.ratingBadgeDark]}>
                    <Text style={styles.ratingText}>{item.avgRating}</Text>
                  </View>
                </View>
                <View style={styles.destinationInfo}>
                  <Text style={[styles.destinationPrice, darkMode && styles.darkSubtext]}>Rating: {item.avgRating}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        contentContainerStyle={styles.eventList}
      />

      <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Upcoming Trips</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={upcomingTrips}
        keyExtractor={(item, idx) => `${item.id}-${idx}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              const countryId = item.countryId ?? ''
              const cityId = item.cityId ?? item.cityId ?? ''
              const tripId = item.id
              router.push(`/countries/${countryId}/${cityId}/trips/${tripId}` as any)
            }}
          >
            <View style={[styles.upcomingCard, darkMode && styles.eventCardDark]}>
              <Image source={{ uri: getImageUri(item.image) }} style={styles.upcomingImage} />
              <View style={styles.upcomingInfo}>
                <Text style={[styles.eventTitle, darkMode && styles.darkText]} numberOfLines={2}>{item.title}</Text>
                <Text style={[styles.eventInfoText, darkMode && styles.darkSubtext]}> {item.startDate} → {item.endDate}</Text>
                <Text style={[styles.eventInfoText, darkMode && styles.darkSubtext, { marginTop: 8 }]}>Price: <Text style={{ fontWeight: '700' }}>€{Number(item.pricePerPerson).toFixed(2)}</Text></Text>
              </View>
          </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={[styles.eventList, { paddingLeft: 16 }]}
      />

        <View style={{ height: 20 }} />
      </ScrollView>
  )
}


// --- Stylesheet definition ---
const styles = StyleSheet.create({
  bgDark:{backgroundColor: '#0f172a',},
  bgWhite:{},
  heroContainer: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  darkCard: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  darkText: {
    color: '#f8fafc',
  },
  darkSubtext: {
    color: '#cbd5e1',
  },
  favoriteButton: {
    marginLeft: 8,
    padding: 4,
  },
  nameAndFavorite: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  destinationCard: {
    width: 180,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  destinationImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  imageWrap: {
    position: 'relative',
    width: '100%',
    height: 120,
    overflow: 'hidden',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  ratingBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingBadgeDark: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  destinationInfo: {
    padding: 12,
  },
  imageOverlay: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  overlayTitle: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  destinationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
  },
  favoriteIcon: {
    marginLeft: 8,
    padding: 4,
  },
  destinationPrice: {
    fontSize: 14,
    color: '#64748b',
  },
  // ... rest of your styles



  destinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  heroContentDark: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  heroTitle: {
    fontSize: 24,
    fontFamily: 'Poppins-Regular',
    color: '#fff',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#e2e8f0',
    marginBottom: 16,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  searchText: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  tabContainerDark: {
    backgroundColor: '#334155',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    fontFamily: 'Poppins-Regular',
    marginLeft: 8,
    color: '#64748b',
  },
  activeTabText: {
    color: '#fff',
  },
  sectionTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
    color: '#1e293b',
  },
  destinationList: {
    paddingHorizontal: 16,
  },



  eventList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    marginBottom: 10
  },
  eventCard: {
    width: 260,
    marginRight: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  eventCardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  eventImage: {
    width: '100%',
    height: 140,
  },
  upcomingCard: {
    width: 260,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
  },
  upcomingImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  upcomingInfo: {
    padding: 12,
  },
  eventDetails: {
    padding: 12,
  },
  eventTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    marginBottom: 8,
    color: '#1e293b',
  },
  eventInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventInfoText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    marginLeft: 6,
    color: '#64748b',
  },
  eventActionRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  badge: {
    backgroundColor: '#0a7ea4',
    color: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    fontWeight: '700',
  },
  badgeDark: {
    backgroundColor: '#0ea5a4',
  },
  eventButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 8,
    gap: 8
  },
  eventButtonDark: {
    backgroundColor: '#2563eb',
  },
  eventButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },
  dealList: {
    paddingHorizontal: 16,
    marginBottom: 30,
    paddingBottom: 15
  },
  dealCard: {
    width: 200,
    marginRight: 12,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f1f5f9',
  },
  dealCardDark: {
    backgroundColor: '#1e293b',
    borderColor: '#334155',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  dealBadge: {
    backgroundColor: '#3b82f6',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  dealDiscount: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
  },
  dealTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 4,
  },
  dealExpiry: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  cabContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
  },
  cabContainerDark: {
    backgroundColor: '#1e293b',
  borderColor: '#334155',
  borderWidth: 1,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
  elevation: 4,
  },
  cabTextContainer: {
    flex: 1,
  },
  cabTitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 18,
    color: '#1e293b',
    marginBottom: 4,
  },
  cabSubtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: '#64748b',
  },
  cabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  cabButtonDark: {
    backgroundColor: '#2563eb',
  },
  cabButtonText: {
    color: '#fff',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
  },

});