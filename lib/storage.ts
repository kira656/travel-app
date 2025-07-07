// src/lib/storage.ts
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

async function canUseSecureStore() {
  return Platform.OS !== 'web' && (await SecureStore.isAvailableAsync())
}

export async function save(key: string, value: string) {
  return (await canUseSecureStore())
    ? SecureStore.setItemAsync(key, value)
    : AsyncStorage.setItem(key, value)
}

export async function read(key: string) {
  return (await canUseSecureStore())
    ? SecureStore.getItemAsync(key)
    : AsyncStorage.getItem(key)
}

export async function remove(key: string) {
  return (await canUseSecureStore())
    ? SecureStore.deleteItemAsync(key)
    : AsyncStorage.removeItem(key)
}
