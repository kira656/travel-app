import { hotelsApi } from '@/apis/hotels';
import { walletApi } from '@/apis/wallet';
import SafeAreaView from '@/components/SafeAreaView';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { getImageUrl } from '@/utils/imageUtils';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

function formatDateISO(d: Date) {
	return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number) {
	const n = new Date(d);
	n.setDate(n.getDate() + days);
	return n;
}

export default function RoomTypeDetails() {
	const router = useRouter();
	const { hotelId, roomTypeId } = useLocalSearchParams();
	const { darkMode } = useThemeStore();
	const [checkIn, setCheckIn] = useState<string | null>(null);
	const [checkOut, setCheckOut] = useState<string | null>(null);

	const { data, isLoading, error, refetch } = useQuery({
		queryKey: ['room-type', hotelId, roomTypeId],
		queryFn: async () => {
			if (!hotelId || !roomTypeId) throw new Error('Missing ids');
			const res = await hotelsApi.getRoomType(Number(hotelId), Number(roomTypeId));
			return res;
		},
		enabled: !!hotelId && !!roomTypeId,
	});

	const roomType = data;
console.log(roomType)
	// Booking modal state
	const [showBookingModal, setShowBookingModal] = useState(false);
	const [desiredRooms, setDesiredRooms] = useState<number>(1);
	const [modalCheckIn, setModalCheckIn] = useState<string | null>(null);
	const [modalCheckOut, setModalCheckOut] = useState<string | null>(null);

	const inventoryByDate = useMemo(() => {
		const map: Record<string, number> = {};
		if (Array.isArray(roomType?.roomInventory)) {
			for (const r of roomType.roomInventory) {
				map[String(r.date)] = r.availableRooms ?? 0;
			}
		}
		return map;
	}, [roomType]);

	// build next 60 days calendar for main view (availability > 0)
	const days = useMemo(() => {
		const start = new Date();
		const list: { date: string; available: boolean }[] = [];
		for (let i = 0; i < 60; i++) {
			const d = addDays(start, i);
			const iso = formatDateISO(d);
			const available = (inventoryByDate[iso] ?? (roomType?.totalRooms ?? 0)) > 0;
			list.push({ date: iso, available });
		}
		return list;
	}, [inventoryByDate]);

	// modal calendar depends on desiredRooms (available if availableRooms >= desiredRooms)
	const modalDays = useMemo(() => {
		const start = new Date();
		const list: { date: string; available: boolean }[] = [];
		for (let i = 0; i < 60; i++) {
			const d = addDays(start, i);
			const iso = formatDateISO(d);
			const avail = inventoryByDate[iso] ?? (roomType?.totalRooms ?? 0);
			list.push({ date: iso, available: avail >= desiredRooms });
		}
		return list;
	}, [inventoryByDate, desiredRooms, roomType]);

	function handleDatePress(date: string, available: boolean) {
		if (!available) {
			Alert.alert('Unavailable', 'This date is not available');
			return;
		}
		if (!checkIn) {
			setCheckIn(date);
			setCheckOut(null);
			return;
		}
		// if clicking same date as checkIn -> clear
		if (checkIn === date) {
			setCheckIn(null);
			setCheckOut(null);
			return;
		}
		// set checkOut only if after checkIn
		if (date <= checkIn) {
			Alert.alert('Invalid', 'Check-out must be after check-in');
			return;
		}
		// validate range availability
		let cur = new Date(checkIn);
		cur = addDays(cur, 1);
		let ok = true;
		while (formatDateISO(cur) <= date) {
			if ((inventoryByDate[formatDateISO(cur)] ?? 0) <= 0) {
				ok = false;
				break;
			}
			cur = addDays(cur, 1);
		}
		if (!ok) {
			Alert.alert('Unavailable', 'One or more days in the selected range are unavailable');
			return;
		}
		setCheckOut(date);
	}

function modalHandleDatePress(date: string, available: boolean) {
	if (!available) {
		Alert.alert('Unavailable', 'This date is not available for the selected number of rooms');
		return;
	}
	if (!modalCheckIn) {
		setModalCheckIn(date);
		setModalCheckOut(null);
		return;
	}
	if (modalCheckIn === date) {
		setModalCheckIn(null);
		setModalCheckOut(null);
		return;
	}
	if (date <= modalCheckIn) {
		Alert.alert('Invalid', 'Check-out must be after check-in');
		return;
	}
	let cur = new Date(modalCheckIn);
	cur = addDays(cur, 1);
	let ok = true;
	while (formatDateISO(cur) <= date) {
		const avail = inventoryByDate[formatDateISO(cur)] ?? (roomType?.totalRooms ?? 0);
		if (avail < desiredRooms) { ok = false; break; }
		cur = addDays(cur, 1);
	}
	if (!ok) { Alert.alert('Unavailable', 'One or more days in the selected range do not have enough rooms'); return; }
	setModalCheckOut(date);
}

function checkRangeAvailability(start: string | null, end: string | null, qty: number) {
	if (!start || !end) return { ok: false, minAvailable: 0 };
	let cur = new Date(start);
	const endDate = new Date(end);
	let minAvail = Number.MAX_SAFE_INTEGER;
	while (formatDateISO(cur) <= formatDateISO(endDate)) {
		const avail = inventoryByDate[formatDateISO(cur)] ?? (roomType?.totalRooms ?? 0);
		minAvail = Math.min(minAvail, avail);
		cur = addDays(cur, 1);
	}
	return { ok: minAvail >= qty, minAvailable: minAvail === Number.MAX_SAFE_INTEGER ? 0 : minAvail };
}

function onConfirmBooking() {
	(async () => {
		const res = checkRangeAvailability(modalCheckIn, modalCheckOut, desiredRooms);
		if (!res.ok) { Alert.alert('Cannot book', `Not enough rooms for selected dates. Max available in range: ${res.minAvailable}`); return; }
		try {
			const token = useAuthStore.getState().token ?? undefined;
			await hotelsApi.bookRoomType(Number(hotelId), Number(roomTypeId), { checkInDate: modalCheckIn!, checkOutDate: modalCheckOut!, roomsBooked: desiredRooms }, token ?? undefined);
			// refresh wallet from server
			const walletRes = await walletApi.getMyWallet(token ?? undefined);
			useAuthStore.getState().updateUser({ balance: walletRes.balance } as any);
			Alert.alert('Success', 'Booking confirmed');
			setShowBookingModal(false);
		} catch (err: any) {
			console.warn('Booking failed', err);
			Alert.alert('Booking failed', err?.message ?? String(err));
		}
	})();
}

	if (isLoading) {
		return (
			<SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
				<ActivityIndicator size="large" color="#0a7ea4" />
				<Text style={[styles.loadingText, { color: darkMode ? '#fff' : '#1e293b' }]}>Loading room type...</Text>
			</SafeAreaView>
		);
	}

	if (error || !roomType) {
		return (
			<SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
				<View style={styles.center}>
					<MaterialIcons name="error-outline" size={48} color="#ff6b6b" />
					<Text style={[styles.errorText, { color: darkMode ? '#fff' : '#1e293b' }]}>Failed to load room type</Text>
					<Pressable onPress={() => refetch()} style={styles.retryButton}><Text style={styles.retryButtonText}>Retry</Text></Pressable>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container} backgroundColor={darkMode ? '#121212' : '#fff'}>
			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.header}>
					<Pressable onPress={() => router.push({ pathname: '/(tabs)/(protected)/hotels/[hotelId]', params: { hotelId: String(roomType.hotel?.id ?? hotelId) } })} style={styles.headerButton}>
						<MaterialIcons name="arrow-back" size={28} color={darkMode ? '#fff' : '#1e293b'} />
					</Pressable>
					<Text style={[styles.title, { color: darkMode ? '#fff' : '#1e293b' }]}>{roomType.label}</Text>
					<View style={{ width: 28 }} />
				</View>

				{/* Room main image and gallery */}
				{roomType.mainImage ? (
					<Image source={{ uri: getImageUrl(roomType.mainImage) }} style={{ width: '100%', height: 200 }} />
				) : null}
				{roomType.galleryImages && roomType.galleryImages.length > 0 && (
					<ScrollView horizontal style={{ marginTop: 8 }} showsHorizontalScrollIndicator={false}>
						{roomType.galleryImages.map((img: any) => (
							<Image key={img.id} source={{ uri: getImageUrl(img) }} style={{ width: 120, height: 80, borderRadius: 8, marginRight: 8 }} />
						))}
					</ScrollView>
				)}
				<View style={styles.content}>
					<Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#1e293b' }]}>Details</Text>
					<Text style={[styles.description, { color: darkMode ? '#9CA3AF' : '#6B7280' }]}>{roomType.description}</Text>

					<Text style={[styles.sectionTitle, { color: darkMode ? '#fff' : '#1e293b' }]}>Select Dates</Text>
					<View style={styles.pickerRow}>
						<Text style={{ color: darkMode ? '#fff' : '#1e293b' }}>Check-in: {checkIn ?? '--'}</Text>
						<Text style={{ color: darkMode ? '#fff' : '#1e293b' }}>Check-out: {checkOut ?? '--'}</Text>
					</View>

					{checkIn && checkOut && (
						<View style={{ marginTop: 12 }}>
							<Text style={{ color: darkMode ? '#fff' : '#1e293b' }}>Selected {checkIn} → {checkOut}</Text>
						</View>
					)}

					{/* Book Room Button */}
					<Pressable onPress={() => { setShowBookingModal(true); setModalCheckIn(null); setModalCheckOut(null); setDesiredRooms(1); }} style={[styles.actionButton, { marginTop: 16 }]}>
						<Text style={[styles.actionText, { textAlign: 'center' }]}>Book Room</Text>
					</Pressable>

				{/* Booking Modal (month-grid calendar view, scrollable) */}
				<Modal visible={showBookingModal} animationType="slide" transparent onRequestClose={() => setShowBookingModal(false)}>
					<TouchableWithoutFeedback onPress={() => setShowBookingModal(false)}>
						<View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
					</TouchableWithoutFeedback>
					<View style={{ backgroundColor: darkMode ? '#222' : '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12, height: '80%' }}>
						<Text style={{ fontSize: 18, fontWeight: '600', color: darkMode ? '#fff' : '#111' }}>Book {roomType.label}</Text>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
							<Text style={{ color: darkMode ? '#fff' : '#111', marginRight: 8 }}>Rooms</Text>
							<TextInput value={String(desiredRooms)} onChangeText={(t) => { const n = parseInt(t || '1', 10); setDesiredRooms(isNaN(n) ? 1 : Math.max(1, Math.min(n, roomType.totalRooms))); }} keyboardType="number-pad" style={{ borderWidth: 1, borderColor: '#e2e8f0', padding: 8, width: 80 }} />
							<Text style={{ marginLeft: 12, color: darkMode ? '#9CA3AF' : '#6B7280' }}>Max {roomType.totalRooms}</Text>
						</View>
						<Text style={{ marginTop: 12, color: darkMode ? '#fff' : '#111' }}>Select Dates</Text>
						<ScrollView style={{ marginTop: 8 }} contentContainerStyle={{ paddingBottom: 140 }}>
							{/* Render next 6 months as month grids */}
							{(function renderMonths() {
								const months = [];
								let cur = new Date();
								cur.setDate(1);
								for (let m = 0; m < 6; m++) {
									const year = cur.getFullYear();
									const month = cur.getMonth();
									const daysInMonth = new Date(year, month + 1, 0).getDate();
									const firstWeekday = new Date(year, month, 1).getDay();
									const weeks: Array<Array<string | null>> = [];
									let week: Array<string | null> = [];
									for (let i = 0; i < firstWeekday; i++) week.push(null);
									for (let d = 1; d <= daysInMonth; d++) {
										week.push(formatDateISO(new Date(year, month, d)));
										if (week.length === 7) { weeks.push(week); week = []; }
									}
									if (week.length > 0) { while (week.length < 7) week.push(null); weeks.push(week); }
									months.push({ year, month, weeks });
									cur = new Date(year, month + 1, 1);
								}
								return months.map((mon, idx) => (
									<View key={idx} style={{ marginBottom: 16 }}>
										<Text style={{ fontSize: 16, fontWeight: '600', color: darkMode ? '#fff' : '#111', marginBottom: 8 }}>{new Date(mon.year, mon.month).toLocaleString(undefined, { month: 'long', year: 'numeric' })}</Text>
										<View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
											{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((wd) => (
											<Text key={wd} style={{ width: `${100/7}%`, textAlign: 'center', color: darkMode ? '#9CA3AF' : '#6B7280' }}>{wd}</Text>
											))}
										</View>
										{mon.weeks.map((w, wi) => (
											<View key={wi} style={{ flexDirection: 'row' }}>
												{w.map((day) => {
													if (!day) return <View key={Math.random()} style={{ width: `${100/7}%`, padding: 6 }} />;
													const available = (inventoryByDate[day] ?? (roomType?.totalRooms ?? 0)) >= desiredRooms;
													const selected = (modalCheckIn === day) || (modalCheckOut === day) || (modalCheckIn && modalCheckOut && day > modalCheckIn && day < modalCheckOut);
													return (
														<Pressable key={day} onPress={() => modalHandleDatePress(day, available)} style={{ width: `${100/7}%`, padding: 6, alignItems: 'center' }}>
															<View style={[styles.dayCell, selected ? { borderColor: '#0a7ea4', borderWidth: 2 } : null, { backgroundColor: available ? (darkMode ? '#0b1220' : '#fff') : (darkMode ? '#2b2b2b' : '#f3f4f6'), width: '100%', aspectRatio: 1, justifyContent: 'center' }]}>
															<Text style={{ color: available ? (darkMode ? '#fff' : '#1e293b') : (darkMode ? '#666' : '#9CA3AF') }}>{day.slice(-2)}</Text>
															</View>
														</Pressable>
													);
												})}
											</View>
										))}
									</View>
								));
							})()}
						</ScrollView>
						{/* Sticky footer: price and confirm */}
						<View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, borderTopWidth: 1, borderTopColor: darkMode ? '#333' : '#eee', backgroundColor: darkMode ? '#1a1a1a' : '#fff' }}>
							{/* compute nights and price */}
							{(function () {
								const nights = (modalCheckIn && modalCheckOut) ? Math.max(0, (new Date(modalCheckOut).getTime() - new Date(modalCheckIn).getTime()) / (1000*60*60*24)) : 0;
								const pricePerNight = parseFloat(String(roomType?.baseNightlyRate ?? '0')) || 0;
								const total = nights * (desiredRooms || 1) * pricePerNight;
								const userBalance = Number((useAuthStore.getState().user as any)?.balance ?? 0);
								return (
									<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
										<View>
											<Text style={{ color: darkMode ? '#fff' : '#111' }}>Nights: {nights} x Rooms: {desiredRooms}</Text>
											<Text style={{ color: darkMode ? '#9CA3AF' : '#6B7280' }}>${pricePerNight.toFixed(2)} / night</Text>
										</View>
										<View style={{ alignItems: 'flex-end' }}>
											<Text style={{ color: darkMode ? '#fff' : '#111', fontWeight: '600' }}>Total: ${total.toFixed(2)}</Text>
											<Text style={{ color: userBalance >= total ? (darkMode ? '#9BE6B8' : '#059669') : (darkMode ? '#ffb4b4' : '#dc2626') }}>Balance: ${userBalance.toFixed(2)}</Text>
											<Pressable onPress={() => {
												if (userBalance < total) { Alert.alert('Insufficient balance', 'You do not have enough balance to complete this booking.'); return; }
												// deduct from user balance in store (optimistic)
												const newBal = userBalance - total;
												useAuthStore.getState().updateUser({ balance: newBal } as any);
												onConfirmBooking();
											}} style={{ marginTop: 8, backgroundColor: '#0a7ea4', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 }}>
												<Text style={{ color: '#fff' }}>Confirm & Pay</Text>
											</Pressable>
										</View>
									</View>
							);
							})()}
						</View>
					</View>
				</Modal>
				</View>
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
	sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
	description: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
	pickerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
	calendarContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
	dayCell: { width: '13%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginBottom: 8 },
	loadingText: { fontSize: 16, marginTop: 12 },
	errorText: { fontSize: 16, marginTop: 12 },
	center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
	retryButton: { backgroundColor: '#0a7ea4', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, marginTop: 12 },
	retryButtonText: { color: '#fff' },
	actionButton: {
		backgroundColor: '#0a7ea4',
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		alignItems: 'center',
	},
	actionText: {
		color: '#fff',
		fontSize: 16,
		fontWeight: '600',
	},
}); 