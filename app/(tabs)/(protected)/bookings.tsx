import ordersApi from '@/apis/orders'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import { MaterialIcons } from '@expo/vector-icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { router } from 'expo-router'
import React from 'react'
import { Alert, FlatList, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

function formatDate(d: string) {
  try {
    return new Date(d).toLocaleDateString()
  } catch {
    return d
  }
}

export default function BookingsScreen() {
  const { token } = useAuthStore()
  const queryClient = useQueryClient()
  const cancelMode: 'future' | 'past' = 'future'
  const { darkMode } = useThemeStore()

  // Fetch orders
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getOrders(),
  })

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (orderId: number) => ordersApi.cancelOrder(orderId),

    onMutate: async (orderId: number) => {
      await queryClient.cancelQueries({ queryKey: ['orders'] } as any)
      const previous = queryClient.getQueryData<any[]>({ queryKey: ['orders'] } as any)

      // Optimistic update
      queryClient.setQueryData<any[]>({ queryKey: ['orders'] } as any, old =>
        old?.map(o =>
          o.orderId === orderId ? { ...o, status: 'CANCELLED' } : o
        ) ?? []
      )

      return { previous }
    },

    onError: (err: any, _orderId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['orders'], context.previous)
      }
      Alert.alert('Cancel failed', err?.message || 'Unknown error')
    },

    onSuccess: (data, variables) => {
      const serverOrder = data?.order || { orderId: variables, status: 'CANCELLED' }
      queryClient.setQueryData<any[]>({ queryKey: ['orders'] } as any, old =>
        old?.map(o =>
          o.orderId === serverOrder.orderId ? { ...o, ...serverOrder } : o
        ) ?? []
      )
      // Invalidate to ensure UI reflects authoritative server state
      queryClient.invalidateQueries({ queryKey: ['orders'] } as any)
      Alert.alert('Cancelled successfully')
    },
  })

  const canCancel = (booking: any) => {
    if (!booking) return false
    const start = booking.startDate || booking.checkInDate
    if (!start) return false

    const normalize = (d: Date) => {
      const nd = new Date(d)
      nd.setHours(0, 0, 0, 0)
      return nd
    }

    const startDate = normalize(new Date(start))
    const today = normalize(new Date())

    return cancelMode === 'future' ? startDate >= today : startDate <= today
  }

  const handleCancel = (order: any) => {
    if (!order) return
    if ((order.status || '').toUpperCase() === 'CANCELLED') {
      Alert.alert('Already cancelled')
      return
    }

    const booking = order.bookings?.[0]
    if (!canCancel(booking)) {
      Alert.alert('Cannot cancel', 'Booking start date is not cancellable')
      return
    }

    Alert.alert('Are you sure?', 'Do you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes',
        onPress: () => cancelMutation.mutate(order.orderId),
      },
    ])
  }

  if (isLoading) {
    return <View style={[styles.center, darkMode && styles.darkContainer]}><Text style={darkMode ? styles.darkText : undefined}>Loading...</Text></View>
  }

  if (error) {
    const message = typeof error === 'string' ? error : (error as any)?.message || JSON.stringify(error)
    return (
      <View style={styles.center}>
        <Text style={{ marginBottom: 12 }}>Error loading orders: {message}</Text>
        <TouchableOpacity style={[styles.button, styles.primary]} onPress={() => refetch()}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <Pressable onPress={() => router.push('/(tabs)/(protected)/profile')} style={{ position: 'absolute', top: 16, left: 16, zIndex: 10, backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)', borderRadius: 999, padding: 8, borderWidth: 1, borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
        <MaterialIcons name="arrow-back" size={22} color={darkMode ? '#fff' : '#1e293b'} />
      </Pressable>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.orderId)}
        renderItem={({ item }) => {
          const booking = item.bookings?.[0]
          const isCancelled = (item.status || '').toUpperCase() === 'CANCELLED'
          const canBeCancelled = canCancel(booking)
          const disabled = isCancelled || !canBeCancelled || cancelMutation.status === 'pending'
          const btnStyle = isCancelled ? styles.disabled : canBeCancelled ? styles.primary : styles.disabled

          return (
            <View style={[styles.card, darkMode && styles.darkCard, { borderColor: darkMode ? '#334155' : '#eee' }]}>
              <Text style={[styles.title, darkMode && styles.darkText]}>Order #{item.orderId}</Text>
              <Text style={darkMode && styles.darkSubtext}>Status: {item.status}</Text>
              <Text style={darkMode && styles.darkSubtext}>Total: {item.total}</Text>
              <Text style={darkMode && styles.darkSubtext}>Created: {formatDate(item.createdAt)}</Text>

              {booking && (
                <View style={styles.bookingRow}>
                  <Text style={darkMode && styles.darkSubtext}>Type: {booking.type}</Text>
                  <Text style={darkMode && styles.darkSubtext}>From: {formatDate(booking.startDate || booking.checkInDate)}</Text>
                  <Text style={darkMode && styles.darkSubtext}>To: {formatDate(booking.endDate || booking.checkOutDate)}</Text>
                </View>
              )}

              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.button, btnStyle, darkMode && (isCancelled ? styles.darkDisabled : styles.darkPrimary)]}
                  onPress={() => handleCancel(item)}
                  disabled={disabled}
                >
                  <Text style={[styles.buttonText, darkMode && styles.darkButtonText]}>{isCancelled ? 'Cancelled' : 'Cancel'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  darkContainer: { backgroundColor: '#0f172a' },
  darkText: { color: '#f8fafc' },
  darkSubtext: { color: '#94a3b8' },
  darkCard: { backgroundColor: '#0b1220' },
  darkPrimary: { backgroundColor: '#ef4444' },
  darkDisabled: { backgroundColor: '#475569' },
  darkButtonText: { color: '#fff' },
  card: { padding: 12, borderRadius: 10, backgroundColor: '#fff', marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  title: { fontWeight: '600', marginBottom: 6 },
  bookingRow: { marginTop: 8 },
  actions: { marginTop: 12, flexDirection: 'row' },
  button: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  primary: { backgroundColor: '#e11d48' },
  disabled: { backgroundColor: '#ddd' },
  buttonText: { color: '#fff' },
})
