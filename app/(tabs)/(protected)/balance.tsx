import { walletApi } from '@/apis/wallet';
import SafeAreaView from '@/components/SafeAreaView';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function BalanceScreen() {
  const { darkMode } = useThemeStore();
  const token = useAuthStore.getState().token;

  const [active, setActive] = useState<'overview'|'requests'|'transactions'>('overview');

  // Overview
  const [wallet, setWallet] = useState<any>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  // Requests
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  // Transactions
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqAmount, setReqAmount] = useState('');
  const [reqNote, setReqNote] = useState('');
  const primaryText = darkMode ? '#fff' : '#111';
  const secondaryText = darkMode ? '#9CA3AF' : '#6B7280';


  useEffect(() => { loadWallet(); }, []);

  async function loadWallet() {
    setLoadingWallet(true);
    try {
      const res = await walletApi.getMyWallet(token ?? undefined);
      setWallet(res);
      // also refresh auth store user balance
      useAuthStore.getState().updateUser({ balance: res.balance } as any);
    } catch (err) {
      console.warn(err);
    } finally { setLoadingWallet(false); }
  }

  async function loadRequests() {
    setLoadingRequests(true);
    try {
      const res = await walletApi.getRequests(1, 20, token ?? undefined);
      setRequests(res.items ?? []);
    } catch (err) { console.warn(err); } finally { setLoadingRequests(false); }
  }

  async function loadTransactions() {
    setLoadingTransactions(true);
    try {
      const res = await walletApi.getTransactions(1, 20, token ?? undefined);
      setTransactions(res.items ?? []);
    } catch (err) { console.warn(err); } finally { setLoadingTransactions(false); }
  }

  useEffect(() => { if (active === 'requests') loadRequests(); if (active === 'transactions') loadTransactions(); }, [active]);

  async function submitRequest() {
    try {
      await walletApi.postRequest({ amount: reqAmount, note: reqNote }, token ?? undefined);
      setShowRequestModal(false);
      setReqAmount(''); setReqNote('');
      if (active === 'requests') loadRequests();
    } catch (err) { console.warn(err); }
  }

  return (
    <SafeAreaView style={{ flex: 1 }} backgroundColor={darkMode ? '#121212' : '#fff'}>

      <View style={{ flexDirection: 'column', justifyContent: 'space-around', padding: 12 }}>
        
      <Pressable onPress={() => router.push({ pathname: '/(tabs)/(protected)/profile' })} style={{position: 'absolute',  top: 16, left: 16, zIndex: 10, backgroundColor: darkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.95)', borderRadius: 999, padding: 8, borderWidth: 1, borderColor: darkMode ? '#334155' : '#e2e8f0' }}>
					<MaterialIcons name="arrow-back" size={22} color={darkMode ? '#fff' : '#1e293b'} />
				</Pressable>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', padding: 12,marginTop:40 }}>
        <Pressable onPress={() => setActive('overview')}><Text style={{ color: active === 'overview' ? '#0a7ea4' : (darkMode ? '#fff' : '#111') }}>Overview</Text></Pressable>
        <Pressable onPress={() => setActive('requests')}><Text style={{ color: active === 'requests' ? '#0a7ea4' : (darkMode ? '#fff' : '#111') }}>Requests</Text></Pressable>
        <Pressable onPress={() => setActive('transactions')}><Text style={{ color: active === 'transactions' ? '#0a7ea4' : (darkMode ? '#fff' : '#111') }}>Transactions</Text></Pressable>
      
        </View>
        </View>

      {active === 'overview' && (
        <View style={{ padding: 16 }}>
          {loadingWallet ? <ActivityIndicator /> : (
            <View>
<View>
  <Text style={{ fontSize: 20, fontWeight: '600', color: primaryText }}>Balance</Text>
  <Text style={{ fontSize: 28, marginTop: 8, color: primaryText }}>${wallet?.balance ?? '0.00'}</Text>
  <Text style={{ marginTop: 8, color: secondaryText }}>{wallet?.currency ?? 'USD'}</Text>
  <Pressable onPress={()=>loadWallet()} ><Text>refresh</Text></Pressable>
</View>

              <Pressable onPress={() => setShowRequestModal(true)} style={{ marginTop: 16, backgroundColor: '#0a7ea4', padding: 12, borderRadius: 8 }}>
                <Text style={{ color: '#fff' }}>Request Balance</Text>
              </Pressable>
            </View>
          )}
        </View>
      )}

      {active === 'requests' && (
        <ScrollView style={{ padding: 16 }}>
          {loadingRequests ? <ActivityIndicator /> : requests.map((r) => (
            <View key={r.id} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <Text>{r.amount} — {r.status}</Text>
              <Text style={{ color: '#666' }}>{new Date(r.createdAt).toLocaleString()}</Text>
              <Text>{r.note}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {active === 'transactions' && (
        <ScrollView style={{ padding: 16 }}>
          {loadingTransactions ? <ActivityIndicator /> : transactions.map((t) => (
            <View key={t.id} style={{ padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
              <Text>{t.amount} — {t.source} — {t.status}</Text>
              <Text style={{ color: '#666' }}>{new Date(t.createdAt).toLocaleString()}</Text>
              <Text>{t.note}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      <Modal visible={showRequestModal} animationType="slide" transparent onRequestClose={() => setShowRequestModal(false)}>
        <TouchableWithoutFeedback onPress={() => setShowRequestModal(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }} />
        </TouchableWithoutFeedback>
        <View style={{ backgroundColor: darkMode ? '#222' : '#fff', padding: 16, borderTopLeftRadius: 12, borderTopRightRadius: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: darkMode ? '#fff' : '#111' }}>Request Balance</Text>
          <TextInput
  value={reqAmount}
  onChangeText={setReqAmount}
  placeholder="Amount"
  keyboardType="numeric"
  style={{
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
    marginTop: 12,
    color: darkMode ? '#fff' : '#111', // ✅ Add this
  }}
  placeholderTextColor={darkMode ? '#9CA3AF' : '#6B7280'} // ✅ Add this
/>

<TextInput
  value={reqNote}
  onChangeText={setReqNote}
  placeholder="Note (optional)"
  style={{
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 8,
    marginTop: 12,
    color: darkMode ? '#fff' : '#111', // ✅ Add this
  }}
  placeholderTextColor={darkMode ? '#9CA3AF' : '#6B7280'} // ✅ Add this
/>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
          <Pressable onPress={() => setShowRequestModal(false)} style={{ padding: 12 }}>
  <Text style={{ color: darkMode ? '#9CA3AF' : '#0a7ea4' }}>Cancel</Text>
</Pressable>
<Pressable onPress={submitRequest} style={{ backgroundColor: '#0a7ea4', padding: 12, borderRadius: 8 }}>
  <Text style={{ color: '#fff' }}>Submit</Text>
</Pressable>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
} 