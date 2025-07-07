// src/stores/authStore.ts
import axios from 'axios';
import { create } from 'zustand';

import { authApi } from '@/apis/auth';
import type { LoginDto, SignUpDto, User } from '@/apis/auth.types'; // Import Tokens here
import * as storage from '@/lib/storage'; // Assuming this is your wrapper for AsyncStorage or similar

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user';
const LOGGEDIN_KEY = 'is_loggedin';

// Define the shape of your Zustand store state
interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean; // Keep this
  isLoading: boolean;
}

// Define the shape of your Zustand store actions
interface AuthActions {
  bootstrapAuth: () => Promise<void>;
  // Updated persistAuth to ensure isLoggedIn is correctly set
  persistAuth: (token: string, refreshToken: string, user: User | null) => Promise<void>;
  clearAuth: () => Promise<void>;
  login: (dto: LoginDto) => Promise<void>;
  signUp: (dto: SignUpDto) => Promise<void>;
  logout: () => Promise<void>;
}

// Combine state and actions into the store's full interface
type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial State
  user: null,
  token: null,
  refreshToken: null,
  isLoggedIn: false, // Initial state, will be updated by bootstrapAuth
  isLoading: true, // Start as true because we're bootstrapping auth

  // Actions
// In your authStore.ts, ensure bootstrapAuth doesn't cause loops
bootstrapAuth: async () => {
  try {
    const [storedAccess, storedRefresh, userJson] = await Promise.all([
      storage.read(TOKEN_KEY),
      storage.read(REFRESH_KEY),
      storage.read(USER_KEY),
    ]);

    if (storedRefresh) {
      try {
        const freshTokens = await authApi.refresh(storedRefresh);
        await get().persistAuth(freshTokens.accessToken, freshTokens.refreshToken, 
          userJson ? JSON.parse(userJson) : null);
      } catch (err) {
        await get().clearAuth();
      }
    } else {
      set({ isLoading: false });
    }
  } catch (error) {
    await get().clearAuth();
  }
},

  persistAuth: async (token, refreshToken, user) => {
    // Save all relevant auth data to storage
    await Promise.all([
      storage.save(TOKEN_KEY, token),
      storage.save(REFRESH_KEY, refreshToken),
      storage.save(USER_KEY, JSON.stringify(user)),
      storage.save(LOGGEDIN_KEY, 'true'), // Explicitly set isLoggedIn to 'true' in storage
    ]);

    // Set Authorization header for Axios
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    // Update Zustand state
    set({
      user,
      token,
      refreshToken,
      isLoggedIn: true, // Set isLoggedIn to true
      isLoading: false, // Loading is complete once authenticated
    });
  },

  clearAuth: async () => {
    // Remove all auth data from storage
    await Promise.all([
      storage.remove(TOKEN_KEY),
      storage.remove(REFRESH_KEY),
      storage.remove(USER_KEY),
      storage.remove(LOGGEDIN_KEY), // Remove isLoggedIn from storage
    ]);

    // Remove Authorization header from Axios
    delete axios.defaults.headers.common.Authorization;

    // Reset Zustand state
    set({
      user: null,
      token: null,
      refreshToken: null,
      isLoggedIn: false, // Set isLoggedIn to false
      isLoading: false, // Loading is complete after clearing
    });
  },

  login: async (dto) => {
    const { user, tokens } = await authApi.login(dto);
    // Use persistAuth to consistently handle state and storage updates
    await get().persistAuth(tokens.accessToken, tokens.refreshToken, user);
  },

  signUp: async (dto) => {
    const { user, tokens } = await authApi.signUp(dto);
    // Use persistAuth to consistently handle state and storage updates
    await get().persistAuth(tokens.accessToken, tokens.refreshToken, user);
  },

  logout: async () => {
    try {
      const currentToken = get().token;
      if (currentToken) {
        await authApi.logout(currentToken);
      }
    } catch (e) {
      console.warn('Remote logout failed:', (e as Error).message);
    } finally {
      // Always clear local auth regardless of remote logout success
      await get().clearAuth();
    }
  },
}));