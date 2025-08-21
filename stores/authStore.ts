// src/stores/authStore.ts
import axios from 'axios';
import { create } from 'zustand';

import { authApi } from '@/apis/auth';
import type { LoginDto, SignUpDto, User } from '@/apis/auth.types';
import * as storage from '@/lib/storage';

const TOKEN_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';
const USER_KEY = 'user';
const LOGGEDIN_KEY = 'is_loggedin';

interface FavoriteItem {
  id: string;
  name: string;
  type?: string;
  image?: any; // You can add image reference if needed
  price?: string; // Additional properties for display
}

interface AuthState {
  user: (User & { favorites: FavoriteItem[] }) | null;
  
  token: string | null;
  refreshToken: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  
}

interface AuthActions {
  bootstrapAuth: () => Promise<void>;
  persistAuth: (token: string, refreshToken: string, user: User | null) => Promise<void>;
  clearAuth: () => Promise<void>;
  login: (dto: LoginDto) => Promise<void>;
  signUp: (dto: SignUpDto) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  toggleFavorite: (item: FavoriteItem) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial State
  user: null,
  token: null,
  refreshToken: null,
  isLoggedIn: false,
  isLoading: true,

  

  // Actions
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
          const user = userJson ? JSON.parse(userJson) : null;
          // Ensure favorites array exists when bootstrapping
          if (user && !user.favorites) {
            user.favorites = [];
          }
          await get().persistAuth(freshTokens.accessToken, freshTokens.refreshToken, user);
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
    // Initialize favorites array if it doesn't exist
    const userWithFavorites = user ? { 
      ...user, 
      favorites: user.favorites || [] 
    } : null;

    await Promise.all([
      storage.save(TOKEN_KEY, token),
      storage.save(REFRESH_KEY, refreshToken),
      storage.save(USER_KEY, JSON.stringify(userWithFavorites)),
      storage.save(LOGGEDIN_KEY, 'true'),
    ]);

    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    set({
      user: userWithFavorites,
      token,
      refreshToken,
      isLoggedIn: true,
      isLoading: false,
    });
  },

  clearAuth: async () => {
    await Promise.all([
      storage.remove(TOKEN_KEY),
      storage.remove(REFRESH_KEY),
      storage.remove(USER_KEY),
      storage.remove(LOGGEDIN_KEY),
    ]);

    delete axios.defaults.headers.common.Authorization;

    set({
      user: null,
      token: null,
      refreshToken: null,
      isLoggedIn: false,
      isLoading: false,
    });
  },

  login: async (dto) => {
    const { user, tokens } = await authApi.login(dto);
    await get().persistAuth(tokens.accessToken, tokens.refreshToken, {
      ...user,
      favorites: user.favorites || [] // Initialize favorites if not present
    });
  },

  signUp: async (dto) => {
    const { user, tokens } = await authApi.signUp(dto);
    await get().persistAuth(tokens.accessToken, tokens.refreshToken, {
      ...user,
      favorites: [] // Initialize empty favorites array for new users
    });
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
      await get().clearAuth();
    }
  },

  updateUser: async (updates) => {
    const { user } = get();
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    
    // If we're updating favorites, make sure it's an array
    if (updates.favorites && !Array.isArray(updates.favorites)) {
      updatedUser.favorites = [];
    }
    
    await storage.save(USER_KEY, JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  toggleFavorite: async (item) => {
    console.log('[DEBUG] Starting toggleFavorite with item:', item);

    const { user } = get();
    console.log('[DEBUG] Current user:', user);

    if (!user){
      console.log('[DEBUG] No user found - aborting');
    
      return;
    }

    const currentFavorites = user.favorites || [];
    console.log('[DEBUG] Current favorites:', currentFavorites);

    const isFav = currentFavorites.some(fav => {
      const match = fav.id === item.id;
      console.log(`[DEBUG] Checking favorite ${fav.id} vs ${item.id}:`, match);
      return match;
    });
    
    const newFavorites = isFav
    ? currentFavorites.filter(fav => {
        const keep = fav.id !== item.id;
        console.log(`[DEBUG] Filtering favorite ${fav.id}: keep?`, keep);
        return keep;
      })
    : [...currentFavorites, item];
  
  console.log('[DEBUG] New favorites:', newFavorites);
  
  try {
    await get().updateUser({ favorites: newFavorites });
    console.log('[DEBUG] Successfully updated user favorites');
  } catch (error) {
    console.error('[DEBUG] Error updating favorites:', error);
  }
},

  isFavorite: (id) => {
    const { user } = get();
    if (!user || !user.favorites) return false;
    return user.favorites.some(fav => fav.id === id);
  },
}));