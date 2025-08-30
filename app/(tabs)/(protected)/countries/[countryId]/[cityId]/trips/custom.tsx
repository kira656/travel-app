import { citiesApi } from '@/apis/cities';
import { guidesApi } from '@/apis/guides';
import { hotelsApi } from '@/apis/hotels';
import { tripsApi } from '@/apis/tripsApi';
import MapView, { Circle, Marker } from '@/components/MapShim'; // ⬅️ NEW
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

// Date/Time picker (community)
const DateTimePickerModule: any = (() => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require('@react-native-community/datetimepicker')
  } catch (e) {
    return null
  }
})()
const DateTimePicker = DateTimePickerModule?.default ?? null

type TripDayPOI = { poiId: number; visitOrder: number }
type TripDay = { dayNumber: number; startTime: string; endTime: string; description?: string; pois: TripDayPOI[] }

const formatHHMM = (d: Date) => {
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${hh}:${mm}`
}
const parseHHMM = (s: string) => {
  const [h, m] = (s || '09:00').split(':').map((n) => Number(n) || 0)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

// helpers for map center
const metersToDegreesLat = (meters: number) => meters / 111000

export default function CustomTripScreen() {
  const { countryId, cityId } = useLocalSearchParams()
  const router = useRouter()
  const { darkMode } = useThemeStore()
  const token = useAuthStore.getState().token ?? undefined

  // theme colors
  const bg = darkMode ? '#0b1220' : '#ffffff'
  const cardBg = darkMode ? '#111827' : '#fff'
  const textColor = darkMode ? '#E5E7EB' : '#0f172a'
  const subText = darkMode ? '#9CA3AF' : '#6B7280'
  const inputBg = darkMode ? '#0f1724' : '#fff'
  const inputBorder = darkMode ? '#374151' : '#e5e7eb'

  const [people, setPeople] = useState('1')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [showStartPicker, setShowStartPicker] = useState(false)
  const [showEndPicker, setShowEndPicker] = useState(false)
  const [startDateObj, setStartDateObj] = useState<Date | undefined>(undefined)
  const [endDateObj, setEndDateObj] = useState<Date | undefined>(undefined)

  // state for TIME picker (per day)
  const [timePicker, setTimePicker] = useState<{ visible: boolean; dayIndex: number; field: 'start' | 'end' }>({
    visible: false,
    dayIndex: 0,
    field: 'start',
  })

  const getDaysCountInclusive = (s: string, e: string) => {
    try {
      const sd = new Date(s)
      const ed = new Date(e)
      const diffMs = ed.setHours(0, 0, 0, 0) - sd.setHours(0, 0, 0, 0)
      if (isNaN(diffMs)) return 0
      return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1
    } catch {
      return 0
    }
  }

  const [calculation, setCalculation] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [withMeals, setWithMeals] = useState(false)
  const [withTransport, setWithTransport] = useState(false)
  const [hotelIncluded, setHotelIncluded] = useState(false)

  const [days, setDays] = useState<TripDay[]>([
    { dayNumber: 1, startTime: '09:00', endTime: '18:00', description: '', pois: [] },
  ])
  const [activeDayIndex, setActiveDayIndex] = useState(0)

  // hotel/guide selection
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null)
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<number | null>(null)
  const [roomsNeeded, setRoomsNeeded] = useState<number>(1)
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null)

  // meet/drop for map
  const [meetLocation, setMeetLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [dropLocation, setDropLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [selectingLocation, setSelectingLocation] = useState<'meet' | 'drop' | null>('meet')

  // fetch city data (center + attractions + hotels)
  const { data: cityWithData } = useQuery({
    queryKey: ['city-with-data', cityId],
    queryFn: () => citiesApi.getCityWithHotelsAttractions(String(cityId)),
    enabled: Boolean(cityId),
  })
  const attractions = (cityWithData?.attractions || []) as any[]

  useEffect(() => {
    if (!startDate || !endDate) return
    const count = getDaysCountInclusive(startDate, endDate)
    if (count <= 0) return
    setDays((prev) => {
      const next: TripDay[] = []
      for (let i = 0; i < count; i++) {
        const dayNumber = i + 1
        const existing = prev.find((d) => d.dayNumber === dayNumber)
        next.push(
          existing || {
            dayNumber,
            startTime: '09:00',
            endTime: '18:00',
            description: '',
            pois: [],
          }
        )
      }
      setActiveDayIndex((ai) => (ai >= next.length ? 0 : ai))
      return next
    })
  }, [startDate, endDate])

  const { data: hotelsData } = useQuery({
    queryKey: ['hotels-for-city', cityId, startDate, endDate],
    queryFn: () =>
      hotelsApi.getAvailableHotels({ cityId: Number(cityId), startDate, endDate, page: 1, limit: 50 }),
    enabled: Boolean(cityId && hotelIncluded && startDate && endDate),
  })

  const { data: guidesData } = useQuery({
    queryKey: ['guides-available', cityId, startDate, endDate],
    queryFn: () => guidesApi.getAvailableGuides({ cityId: Number(cityId), startDate, endDate }, token),
    enabled: Boolean(cityId && startDate && endDate && token),
  })

  const hotelsList = Array.isArray(hotelsData) ? hotelsData : hotelsData?.data ?? []
  const guidesList = Array.isArray(guidesData) ? guidesData : guidesData?.data ?? []

  const onCalculate = async () => {
    const payload: any = {
      cityId: Number(cityId),
      startDate,
      endDate,
      people: Number(people),
      withMeals,
      withTransport,
      hotelIncluded,
    }
    if (selectedGuideId) payload.guideId = selectedGuideId
    payload.pois = days.flatMap((d) =>
      d.pois.map((p) => ({ poiId: p.poiId, dayNumber: d.dayNumber, visitOrder: p.visitOrder }))
    )
    if (hotelIncluded && selectedRoomTypeId)
      payload.hotels = [{ roomTypeId: selectedRoomTypeId, roomsRequested: roomsNeeded }]

    try {
      setLoading(true)
      const res = await tripsApi.calculateCustomTrip(payload, token)
      setCalculation(res)
    } catch (err) {
      console.warn(err)
    } finally {
      setLoading(false)
    }
  }

  const onCreate = async () => {
    if (!calculation) return
    const tripObj: any = {
      name: `Custom trip ${cityId}`,
      cityId: Number(cityId),
      tripType: 'CUSTOM',
      startDate,
      endDate,
      pricePerPerson: calculation?.perPerson || 0,
      minPeople: Number(people),
      maxPeople: Number(people),
      minSeatsPerUser: 1,
      maxSeatsPerUser: Number(people),
      withMeals,
      withTransport,
      hotelIncluded,
      mealPricePerPerson: calculation?.perPersonMeals || 0,
      transportationPricePerPerson: calculation?.perPersonTransport || 0,
      guideId: selectedGuideId || undefined,
      // ⬇️ include meet/drop if chosen
      meetLocationAddress: meetLocation ? `${meetLocation.lat},${meetLocation.lon}` : undefined,
      meetLocation: meetLocation ? { lat: meetLocation.lat, lon: meetLocation.lon } : undefined,
      dropLocationAddress: dropLocation ? `${dropLocation.lat},${dropLocation.lon}` : undefined,
      dropLocation: dropLocation ? { lat: dropLocation.lat, lon: dropLocation.lon } : undefined,
      mainImageId: undefined,
      galleryImageIds: [],
      tripDays: days.map((d) => ({
        dayNumber: d.dayNumber,
        startTime: d.startTime,
        endTime: d.endTime,
        description: d.description || '',
        pois: d.pois.map((p) => ({ poiId: p.poiId, visitOrder: p.visitOrder })),
      })),
      hotels:
        hotelIncluded && selectedHotelId && selectedRoomTypeId
          ? [{ hotelId: selectedHotelId, roomTypeId: selectedRoomTypeId, roomsNeeded }]
          : [],
      tagIds: [],
    }

    try {
      setLoading(true)
      await tripsApi.createCustomTrip(Number(people), tripObj, token)
      router.push(`/(tabs)/(protected)/countries/${countryId}/${cityId}/trips`)
    } catch (err) {
      console.warn('didnt work', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAndBookClick = async () => {
    const payload: any = {
      cityId: Number(cityId),
      startDate,
      endDate,
      people: Number(people),
      withMeals,
      withTransport,
      hotelIncluded,
    }
    if (selectedGuideId) payload.guideId = selectedGuideId
    payload.pois = days.flatMap((d) =>
      d.pois.map((p) => ({ poiId: p.poiId, dayNumber: d.dayNumber, visitOrder: p.visitOrder }))
    )
    if (hotelIncluded && selectedRoomTypeId)
      payload.hotels = [{ roomTypeId: selectedRoomTypeId, roomsRequested: roomsNeeded }]

    try {
      setLoading(true)
      const res = await tripsApi.calculateCustomTrip(payload, token)
      setCalculation(res)
      setShowConfirmModal(true)
    } catch (err) {
      console.warn('calc failed', err)
      Alert.alert('Calculation failed', 'Could not calculate total. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [bookingLoading, setBookingLoading] = useState(false)

  const confirmBooking = async () => {
    if (!calculation) return
    // if no hotel, require meet/drop
    if (!hotelIncluded && (!meetLocation || !dropLocation)) {
      Alert.alert('Pick locations', 'Please set both meet and drop locations on the map.')
      return
    }

    const user = useAuthStore.getState().user
    const balance = Number((user as any)?.wallets?.balance ?? (user as any)?.balance ?? 0)
    const total = Number(
      calculation.total || calculation.totalAmount || calculation.perPerson * Number(people) || 0
    )
    if (balance < total) {
      Alert.alert('Insufficient balance', 'You do not have enough balance to complete this booking.')
      return
    }

    const tripObj: any = {
      name: `Custom trip ${cityId}`,
      cityId: Number(cityId),
      tripType: 'CUSTOM',
      startDate,
      endDate,
      pricePerPerson: calculation?.perPerson || 0,
      minPeople: Number(people),
      maxPeople: Number(people),
      minSeatsPerUser: 1,
      maxSeatsPerUser: Number(people),
      withMeals,
      withTransport,
      hotelIncluded,
      mealPricePerPerson: calculation?.perPersonMeals || 0,
      transportationPricePerPerson: calculation?.perPersonTransport || 0,
      guideId: selectedGuideId || undefined,
      meetLocationAddress: meetLocation ? `${meetLocation.lat},${meetLocation.lon}` : undefined,
      meetLocation: meetLocation ? { lat: meetLocation.lat, lon: meetLocation.lon } : undefined,
      dropLocationAddress: dropLocation ? `${dropLocation.lat},${dropLocation.lon}` : undefined,
      dropLocation: dropLocation ? { lat: dropLocation.lat, lon: dropLocation.lon } : undefined,
      mainImageId: undefined,
      galleryImageIds: [],
      tripDays: days.map((d) => ({
        dayNumber: d.dayNumber,
        startTime: d.startTime,
        endTime: d.endTime,
        description: d.description || '',
        pois: d.pois.map((p) => ({ poiId: p.poiId, visitOrder: p.visitOrder })),
      })),
      hotels:
        hotelIncluded && selectedHotelId && selectedRoomTypeId
          ? [{ hotelId: selectedHotelId, roomTypeId: selectedRoomTypeId, roomsNeeded }]
          : [],
      tagIds: [],
    }

    try {
      setBookingLoading(true)
      await tripsApi.createCustomTrip(Number(people), tripObj, token)
      setShowConfirmModal(false)
      Alert.alert('Success', 'Trip created and booked successfully')
      router.push(`/(tabs)/(protected)/countries/${countryId}/${cityId}/trips`)
    } catch (err) {
      console.warn('didnt work', err)
      Alert.alert('Booking failed', 'Failed to create and book trip')
    } finally {
      setBookingLoading(false)
    }
  }

  // derive map center from city
  let centerLat = 41.8933203
  let centerLng = 12.4829321
  const rawCenter = Array.isArray((cityWithData as any)?.center)
    ? (cityWithData as any).center
    : undefined // [lng, lat]
  if (rawCenter?.length === 2) {
    const [lng, lat] = rawCenter
    centerLat = typeof lat === 'number' ? lat : lat ? parseFloat(String(lat)) : centerLat
    centerLng = typeof lng === 'number' ? lng : lng ? parseFloat(String(lng)) : centerLng
  }

  let cityRadiusMeters = 10000
const rawRadius = (cityWithData as any)?.radius
if (rawRadius !== undefined && rawRadius !== null) {
  const parsed = Number(rawRadius)
  if (!Number.isNaN(parsed) && parsed > 0) {
    // if small value, assume kilometers; else meters
    cityRadiusMeters = parsed > 1000 ? parsed : parsed * (parsed <= 100 ? 1000 : 1)
  }
}


  const latDelta = Math.max(0.01, metersToDegreesLat(cityRadiusMeters * 1.6))
  const lngDelta = latDelta

  return (
    <ScrollView style={{ backgroundColor: darkMode ? '#222' : '#fff'}}   contentContainerStyle={{ padding: 16 }}>
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: darkMode ? '#fff' : '#111' }}>
          Make a Custom Trip
        </Text>

        {/* People */}
        <View>
          <Text style={{ color: darkMode ? '#9ca3af' : '#555' }}>People</Text>
          <TextInput value={people} onChangeText={setPeople} keyboardType="number-pad" style={[styles.input, { backgroundColor: inputBg, borderColor: inputBorder, color: textColor }]} />
        </View>

        {/* Dates */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: darkMode ? '#9ca3af' : '#555' }}>Start Date</Text>
            <Pressable onPress={() => setShowStartPicker(true)} style={[styles.input, { justifyContent: 'center', backgroundColor: inputBg, borderColor: inputBorder }]}>
              <Text style={{ color: startDate ? textColor : subText }}>{startDate || 'Select start date'}</Text>
            </Pressable>
            {showStartPicker && DateTimePicker ? (
              <DateTimePicker
                value={startDateObj || new Date()}
                mode="date"
                display="default"
                onChange={(_event: any, d: Date | undefined) => {
                  if (d) {
                    setStartDateObj(d)
                    const yyyy = d.getFullYear()
                    const mm = String(d.getMonth() + 1).padStart(2, '0')
                    const dd = String(d.getDate()).padStart(2, '0')
                    setStartDate(`${yyyy}-${mm}-${dd}`)
                  }
                  setShowStartPicker(false)
                }}
              />
            ) : null}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={{ color: darkMode ? '#9ca3af' : '#555' }}>End Date</Text>
            <Pressable onPress={() => setShowEndPicker(true)} style={[styles.input, { justifyContent: 'center', backgroundColor: inputBg, borderColor: inputBorder }]}>
              <Text style={{ color: endDate ? textColor : subText }}>{endDate || 'Select end date'}</Text>
            </Pressable>
            {showEndPicker && DateTimePicker ? (
              <DateTimePicker
                value={endDateObj || new Date()}
                mode="date"
                display="default"
                onChange={(_event: any, d: Date | undefined) => {
                  if (d) {
                    setEndDateObj(d)
                    const yyyy = d.getFullYear()
                    const mm = String(d.getMonth() + 1).padStart(2, '0')
                    const dd = String(d.getDate()).padStart(2, '0')
                    setEndDate(`${yyyy}-${mm}-${dd}`)
                  }
                  setShowEndPicker(false)
                }}
              />
            ) : null}
          </View>
        </View>

        {/* Add-ons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Switch value={withMeals} onValueChange={setWithMeals} />
            <Text style={{ color: darkMode ? '#fff' : '#111' }}>With Meals</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Switch value={withTransport} onValueChange={setWithTransport} />
            <Text style={{ color: darkMode ? '#fff' : '#111' }}>With Transport</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Switch value={hotelIncluded} onValueChange={setHotelIncluded} />
            <Text style={{ color: darkMode ? '#fff' : '#111' }}>Include Hotel</Text>
          </View>
        </View>

        {/* Map for meet/drop when NO hotel */}
        {!hotelIncluded && (
          <View style={{ marginTop: 10 }}>
            <Text style={{ color: darkMode ? '#9ca3af' : '#555' }}>Meet & Drop Locations</Text>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
              <Pressable
                onPress={() => setSelectingLocation('meet')}
                style={[
                  styles.btn,
                  {
                    backgroundColor: selectingLocation === 'meet' ? '#0a7ea4' : '#e5e7eb',
                  },
                ]}
              >
                <Text style={{ color: selectingLocation === 'meet' ? '#fff' : '#111' }}>Set Meet</Text>
              </Pressable>
              <Pressable
                onPress={() => setSelectingLocation('drop')}
                style={[
                  styles.btn,
                  {
                    backgroundColor: selectingLocation === 'drop' ? '#0a7ea4' : '#e5e7eb',
                  },
                ]}
              >
                <Text style={{ color: selectingLocation === 'drop' ? '#fff' : '#111' }}>Set Drop</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMeetLocation(null)
                  setDropLocation(null)
                }}
                style={[styles.btn, { backgroundColor: '#ef4444' }]}
              >
                <Text style={{ color: '#fff' }}>Clear</Text>
              </Pressable>
            </View>

            {Platform.OS === 'web' ? (
              <Text style={{ marginTop: 6, color: darkMode ? '#9ca3af' : '#777' }}>
                Map is not supported on web preview. Enter coordinates manually or test on device.
              </Text>
            ) : (
              <View style={{ height: 300, marginTop: 8, borderRadius: 8, overflow: 'hidden' }}>
                <MapView
                  style={{ flex: 1 }}
                  initialRegion={{
                    latitude: centerLat,
                    longitude: centerLng,
                    latitudeDelta: latDelta,
                    longitudeDelta: lngDelta,
                  }}
                  onPress={(e: any) => {
                    if (!selectingLocation) return
                    const { latitude, longitude } = e.nativeEvent.coordinate
                    if (selectingLocation === 'meet') setMeetLocation({ lat: latitude, lon: longitude })
                    else setDropLocation({ lat: latitude, lon: longitude })
                  }}
                >
                  {meetLocation && (
                    <Marker
                      title="Meet location"
                      pinColor="#10b981"
                      coordinate={{ latitude: meetLocation.lat, longitude: meetLocation.lon }}
                    />
                  )}
                  {dropLocation && (
                    <Marker
                      title="Drop location"
                      pinColor="#f59e0b"
                      coordinate={{ latitude: dropLocation.lat, longitude: dropLocation.lon }}
                    />
                  )}
                  {typeof Circle !== 'undefined' ? (
                    <Circle
                      center={{ latitude: centerLat, longitude: centerLng }}
                      radius={cityRadiusMeters}
                      strokeColor="rgba(14,165,233,0.6)"
                      fillColor="rgba(14,165,233,0.15)"
                    />
                  ) : null}
                </MapView>
              </View>
            )}

            <View style={{ marginTop: 8, gap: 4 }}>
              <Text style={{ color: darkMode ? '#cbd5e1' : '#111' }}>
                Meet: {meetLocation ? `${meetLocation.lat.toFixed(5)}, ${meetLocation.lon.toFixed(5)}` : '—'}
              </Text>
              <Text style={{ color: darkMode ? '#cbd5e1' : '#111' }}>
                Drop: {dropLocation ? `${dropLocation.lat.toFixed(5)}, ${dropLocation.lon.toFixed(5)}` : '—'}
              </Text>
            </View>
          </View>
        )}

        {/* Hotels (only when included) */}

        {hotelIncluded && (
          <View>
            <Text style={{ color: darkMode ? '#9ca3af' : '#555', marginTop: 8 }}>Available Hotels</Text>
            {!hotelsList || hotelsList.length === 0 ? (
              <Text style={{ color: darkMode ? '#9ca3af' : '#777' }}>No hotels loaded</Text>
            ) : (
              hotelsList.map((item: any) => (
                <Pressable
                  key={item.hotel.id}
                  onPress={() => {
                    setSelectedHotelId(item.hotel.id)
                    setSelectedRoomTypeId(item.roomTypes?.[0]?.id ?? null)
                  }}
                  style={{ padding: 8, borderWidth: 1, borderColor: '#ddd', marginVertical: 4, borderRadius: 8 }}
                >
                  {console.log("hotels list single",item)}
                  <Text style={{ color: darkMode ? '#fff' : '#111' }}>
                    {item.hotel.name} — {item.hotel.stars}★
                  </Text>
                  <Text style={{ color: darkMode ? '#9ca3af' : '#666' }}>{item.hotel.address}</Text>
                  {selectedHotelId === item.hotel.id && item.roomTypes && (
                    <View style={{ marginTop: 6 }}>
                      {item.roomTypes.map((rt: any) => (
                        <Pressable key={rt.id} onPress={() => setSelectedRoomTypeId(rt.id)} style={{ paddingVertical: 4 }}>
                          <Text
                            style={{
                              color: selectedRoomTypeId === rt.id ? '#0a7ea4' : darkMode ? '#fff' : '#111',
                            }}
                          >
                            {rt.label} — {rt.capacity} ppl — {rt.baseNightlyRate}
                          </Text>
                        </Pressable>
                      ))}
                      <View style={{ flexDirection: 'row', gap: 8, marginTop: 6, alignItems: 'center' }}>
                        <Text style={{ color: darkMode ? '#fff' : '#111' }}>Rooms:</Text>
                        <TextInput
                          value={String(roomsNeeded)}
                          onChangeText={(v) => setRoomsNeeded(Number(v || '1'))}
                          keyboardType="number-pad"
                          style={[styles.input, { width: 80 }]}
                        />
                      </View>
                    </View>
                  )}
                </Pressable>
              ))
            )}
          </View>
        )}

        {/* Guides */}
        <View style={{ marginTop: 8 }}>
          <Text style={{ color: darkMode ? '#9ca3af' : '#555' }}>Available Guides</Text>
          {!guidesList || guidesList.length === 0 ? (
            <Text style={{ color: darkMode ? '#9ca3af' : '#777' }}>No guides available for selected dates</Text>
          ) : (
            <View>
              {guidesList.map((g: any) => (
                <Pressable
                  key={g.id}
                  onPress={() => setSelectedGuideId(g.id)}
                  style={{
                    padding: 8,
                    borderWidth: 1,
                    borderColor: selectedGuideId === g.id ? '#0a7ea4' : '#ddd',
                    marginVertical: 4,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: darkMode ? '#fff' : '#111' }}>
                    {g.user?.name} — {g.pricePerDay}/day
                  </Text>
                  <Text style={{ color: darkMode ? '#9ca3af' : '#666' }}>{g.user?.email}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        {/* Day planner (TIME PICKERS) */}
        <View style={{ marginTop: 12 }}>
          <Text style={{ color: darkMode ? '#9ca3af' : '#555' }}>Days</Text>
          {days.map((d, i) => (
            <View key={d.dayNumber} style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 8, marginTop: 8 }}>
              <Pressable onPress={() => setActiveDayIndex(i)}>
                <Text style={{ color: darkMode ? '#fff' : '#111', fontWeight: '600' }}>
                  Day {d.dayNumber} — {d.startTime} → {d.endTime}
                </Text>
              </Pressable>

              {activeDayIndex === i && (
                <View style={{ marginTop: 8 }}>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {/* START time - press to open time picker */}
                    <Pressable
                      onPress={() =>
                        setTimePicker({ visible: true, dayIndex: i, field: 'start' })
                      }
                      style={[styles.input, { flex: 1, justifyContent: 'center', backgroundColor: inputBg, borderColor: inputBorder }]}
                    >
                      <Text style={{ color: textColor }}>{d.startTime}</Text>
                    </Pressable>

                    {/* END time */}
                    <Pressable
                      onPress={() =>
                        setTimePicker({ visible: true, dayIndex: i, field: 'end' })
                      }
                      style={[styles.input, { flex: 1, justifyContent: 'center', backgroundColor: inputBg, borderColor: inputBorder }]}
                    >
                      <Text style={{ color: textColor }}>{d.endTime}</Text>
                    </Pressable>
                  </View>

                  {/* Fallback text inputs when picker not available (web or module missing) */}
                  {!DateTimePicker && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                      <TextInput
                        value={d.startTime}
                        onChangeText={(v) => {
                          const copy = [...days]
                          copy[i].startTime = v
                          setDays(copy)
                        }}
                        placeholder="HH:MM"
                        style={[styles.input, { flex: 1 }]}
                      />
                      <TextInput
                        value={d.endTime}
                        onChangeText={(v) => {
                          const copy = [...days]
                          copy[i].endTime = v
                          setDays(copy)
                        }}
                        placeholder="HH:MM"
                        style={[styles.input, { flex: 1 }]}
                      />
                    </View>
                  )}

                  <TextInput
                    value={d.description}
                    onChangeText={(v) => {
                      const copy = [...days]
                      copy[i].description = v
                      setDays(copy)
                    }}
                    placeholder="Description"
                    style={[styles.input, { marginTop: 8 }]}
                  />

                  {/* POIs list */}
                  <View style={{ marginTop: 8 }}>
                    <Text style={{ color: darkMode ? '#9ca3af' : '#555' }}>POIs</Text>
                    <View>
                      {d.pois.map((p, idx) => {
                        const poi = attractions.find((a: any) => a.id === p.poiId)
                        return (
                          <View
                            key={`${p.poiId}-${idx}`}
                            style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}
                          >
                            <Text style={{ color: darkMode ? '#fff' : '#111' }}>
                              #{p.visitOrder} — {poi?.name || `POI ${p.poiId}`}
                            </Text>
                            <Pressable
                              onPress={() => {
                                const copy = [...days]
                                copy[i].pois.splice(idx, 1)
                                copy[i].pois = copy[i].pois.map((pp, j) => ({ ...pp, visitOrder: j + 1 }))
                                setDays(copy)
                              }}
                            >
                              <Text style={{ color: '#dc2626' }}>Remove</Text>
                            </Pressable>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                </View>
              )}
            </View>
          ))}



          {/* City Attractions to add */}
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: darkMode ? '#9ca3af' : '#555' }}>City Attractions</Text>
            {attractions.map((a: any) => (
              <View key={a.id} style={{ borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 8, marginTop: 6 }}>
                <Text style={{ color: darkMode ? '#fff' : '#111' }}>{a.name}</Text>
                <Text style={{ color: darkMode ? '#9ca3af' : '#666' }}>Duration: {a.avgDuration}</Text>
                <Pressable
                  onPress={() => {
                    const getPoiDuration = (poiId: number) => {
                      const p = attractions.find((x: any) => x.id === poiId)
                      if (!p) return 0
                      const [h, m, s] = (p.avgDuration || '00:00:00').split(':').map(Number)
                      return (h || 0) * 60 + (m || 0) + Math.floor((s || 0) / 60)
                    }
                    const canAdd = (day: any, poiId: number) => {
                      const [sh, sm] = day.startTime.split(':').map(Number)
                      const [eh, em] = day.endTime.split(':').map(Number)
                      const windowMin = eh * 60 + em - (sh * 60 + sm)
                      const used = day.pois.reduce((acc: any, p: any) => acc + getPoiDuration(p.poiId), 0)
                      return used + getPoiDuration(poiId) <= windowMin
                    }
                    const copy = [...days]
                    const d = copy[activeDayIndex]
                    if (!d) return
                    if (!canAdd(d, a.id)) {
                      Alert.alert('Not enough time', 'This POI does not fit in the remaining time of the day.')
                      return
                    }
                    const nextOrder = (d.pois[d.pois.length - 1]?.visitOrder || 0) + 1
                    d.pois.push({ poiId: a.id, visitOrder: nextOrder })
                    setDays(copy)
                  }}
                  style={[styles.btn, { marginTop: 6, backgroundColor: '#0a7ea4' }]}
                >
                  <Text style={{ color: '#fff' }}>
                    Add to Day {days[activeDayIndex]?.dayNumber ?? 1}
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>

        {/* Primary CTA */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, justifyContent: 'center' }}>
          <Pressable onPress={handleCreateAndBookClick} style={[styles.btn, { backgroundColor: '#0a7ea4' }]}>
            <Text style={{ color: '#fff' }}>{loading ? 'Processing...' : 'Create & Book'}</Text>
          </Pressable>
        </View>

        {/* Confirmation modal */}
        <Modal
          visible={showConfirmModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowConfirmModal(false)}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 }}>
            <View style={{ backgroundColor: darkMode ? '#0b1220' : '#fff', padding: 16, borderRadius: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: darkMode ? '#fff' : '#111' }}>
                Confirm Booking
              </Text>
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: darkMode ? '#9ca3af' : '#666' }}>
                  Per Person: {calculation?.perPerson ?? '-'}
                </Text>
                <Text style={{ color: darkMode ? '#9ca3af' : '#666', marginTop: 4 }}>
                  Nights: {calculation?.nights ?? '-'}
                </Text>
                <Text style={{ color: darkMode ? '#fff' : '#111', marginTop: 8, fontWeight: '600' }}>
                  Total: {calculation?.total ?? '-'}
                </Text>
                <Text style={{ color: darkMode ? '#9ca3af' : '#666', marginTop: 8 }}>
                  Your balance:{' '}
                  {(useAuthStore.getState().user as any)?.wallets?.balance ??
                    (useAuthStore.getState().user as any)?.balance ??
                    0}
                </Text>
                {!hotelIncluded && (
                  <Text style={{ color: darkMode ? '#f59e0b' : '#92400e', marginTop: 8 }}>
                    Meet: {meetLocation ? `${meetLocation.lat.toFixed(5)},${meetLocation.lon.toFixed(5)}` : '—'} | Drop:{' '}
                    {dropLocation ? `${dropLocation.lat.toFixed(5)},${dropLocation.lon.toFixed(5)}` : '—'}
                  </Text>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
                <Pressable
                  onPress={() => setShowConfirmModal(false)}
                  style={[styles.btn, { backgroundColor: '#ef4444', flex: 1 }]}
                >
                  <Text style={{ color: '#fff', textAlign: 'center' }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={confirmBooking}
                  style={[styles.btn, { backgroundColor: '#0a7ea4', flex: 1 }]}
                >
                  {bookingLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={{ color: '#fff', textAlign: 'center' }}>Confirm</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        {calculation && (
          <View style={{ marginTop: 12 }}>
            <Text style={{ color: darkMode ? '#fff' : '#111' }}>Per person: {calculation.perPerson}</Text>
            <Text style={{ color: darkMode ? '#9ca3af' : '#666' }}>Total: {calculation.total}</Text>
          </View>
        )}
      </View>

      {/* Global TIME picker element (only once) */}
      {timePicker.visible && DateTimePicker && (
        <DateTimePicker
          value={parseHHMM(days[timePicker.dayIndex]?.[timePicker.field === 'start' ? 'startTime' : 'endTime'])}
          mode="time"
          is24Hour
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(_event: any, d: Date | undefined) => {
            // Android fires on dismiss with undefined
            if (!d) {
              if (Platform.OS === 'android') setTimePicker((t) => ({ ...t, visible: false }))
              return
            }
            const copy = [...days]
            copy[timePicker.dayIndex][timePicker.field === 'start' ? 'startTime' : 'endTime'] = formatHHMM(d)
            setDays(copy)
            setTimePicker((t) => ({ ...t, visible: false }))
          }}
        />
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#e5e7eb', padding: 8, borderRadius: 8, marginTop: 6 },
  btn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
})
