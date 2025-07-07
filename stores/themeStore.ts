// src/stores/themeStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage'; // You'll need to install this
import { create } from 'zustand';

const DARK_MODE_KEY = 'darkMode';

// Define the shape of your Zustand store state
interface ThemeState {
  darkMode: boolean;
}

// Define the shape of your Zustand store actions
interface ThemeActions {
  toggleDarkMode: () => Promise<void>; // Make it async to handle AsyncStorage
  loadTheme: () => Promise<void>; // Action to load theme from storage
}

// Combine state and actions into the store's full interface
type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>((set, get) => ({
  // Initial State
  darkMode: false, // Default to false, will be overridden by loaded preference

  // Actions
  toggleDarkMode: async () => {
    const newMode = !get().darkMode; // Get current state using `get()`
    set({ darkMode: newMode }); // Update state

    // Persist to AsyncStorage
    await AsyncStorage.setItem(DARK_MODE_KEY, String(newMode));
  },

  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(DARK_MODE_KEY);
      if (savedTheme !== null) { // Check if a value exists
        set({ darkMode: savedTheme === 'true' });
      }
    } catch (e) {
      console.error('Failed to load theme from storage', e);
      // Optionally, set a default or handle error
    }
  },
}));