// src/stores/authStore.ts
import axios from 'axios';
import { create } from 'zustand';

import { authApi } from '@/apis/auth';
import type { LoginDto, SignUpDto, User } from '@/apis/auth.types';
import { favouritesApi } from '@/apis/favourites';
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

function flattenFavourites(items: any): FavoriteItem[] {
  if (!items) return [];
  if (Array.isArray(items)) return items;
  const flat: FavoriteItem[] = [];
  Object.keys(items).forEach((type) => {
    const arr = items[type] || [];
    arr.forEach((it: any) => {
      flat.push({
        id: String(it.entityId ?? it.id ?? ''),
        name: it.title || it.name || '',
        type,
        image: it.mainImage?.url ?? null,
      });
    });
  });
  return flat;
}

interface AuthState {
    user: (User & { favourites: FavoriteItem[] }) | null;
  
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
  isFavoriteByType: (type: string | undefined, id: any) => boolean;
  fetchFavorites: () => Promise<void>;
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
          // Normalize favourites shape when bootstrapping
          if (user) {
            user.favourites = flattenFavourites(user.favourites || (user as any).favourites);
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
    // Initialize favourites array and normalize shape if needed
    const userWithFavourites = user
      ? { ...user, favourites: flattenFavourites(user.favourites || (user as any).favourites), balance: (user as any).wallets?.balance ?? (user as any).balance ?? 0 }
      : null;

    await Promise.all([
      storage.save(TOKEN_KEY, token),
      storage.save(REFRESH_KEY, refreshToken),
      storage.save(USER_KEY, JSON.stringify(userWithFavourites)),
      storage.save(LOGGEDIN_KEY, 'true'),
    ]);

    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    set({
      user: userWithFavourites,
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
    console.log("user",user)
    const normalizedUser = { ...user, favourites: flattenFavourites(user.favourites || (user as any).favourites) };
    await get().persistAuth(tokens.accessToken, tokens.refreshToken, normalizedUser);
  },

  signUp: async (dto) => {
    const { user, tokens } = await authApi.signUp(dto);
    await get().persistAuth(tokens.accessToken, tokens.refreshToken, { ...user, favourites: [] });
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
    
    // If we're updating favourites, normalize to flat array
    if ((updates as any).favourites) {
      (updatedUser as any).favourites = flattenFavourites((updates as any).favourites);
    }
    
    await storage.save(USER_KEY, JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },

  toggleFavorite: async (item) => {
    // Toggle favorite locally and then sync with server
    const { user, fetchFavorites } = get();

    if (!user) return;

    // Local optimistic toggle detection (ensure favourites is an array)
    const currentFavourites = Array.isArray((user as any).favourites)
      ? (user as any).favourites
      : flattenFavourites((user as any).favourites);
    const isFav = currentFavourites.some(
      (fav: any) => String(fav.id) === String(item.id) && fav.type === item.type
    );

    try {
      const token = get().token ?? undefined;
      if (isFav) {
        // remove favourite on server
        await favouritesApi.removeFavourite({ entityType: (item.type as any) || 'unknown', entityId: item.id }, token);
      } else {
        // add favourite on server
        await favouritesApi.addFavourite({ entityType: (item.type as any) || 'unknown', entityId: item.id }, token);
      }

      // Refetch authoritative favourites from server and update store
      if (fetchFavorites) await fetchFavorites();
    } catch (err) {
      // If server call fails, refetch to ensure consistency
      if (fetchFavorites) await fetchFavorites();
      console.error('Failed to toggle favorite on server:', err);
    }
  },

  isFavorite: (id) => {
    const { user } = get();
    if (!user || !Array.isArray((user as any).favourites)) return false;
    return (user as any).favourites.some((fav: any) => fav.id === id);
  },
  
  // Check favorite by type + id without hitting the server
  isFavoriteByType: (type: string | undefined, id: any) => {
    const { user } = get();
    if (!user || !Array.isArray((user as any).favourites)) return false;
    return (user as any).favourites.some((fav: any) => fav.type === type && String(fav.id) === String(id));
  },

  // Fetch favourites/me from server and sync into store
  fetchFavorites: async () => {
    try {
      const token = get().token ?? undefined;
      const res = await favouritesApi.getMyFavourites(token);
      const items = res.items || {};

      const flat: any[] = [];
      Object.keys(items).forEach((type) => {
        const arr = items[type] || [];
        arr.forEach((it: any) => {
          flat.push({
            id: String(it.entityId ?? it.id ?? ''),
            name: it.title || it.name || '',
            type,
            image: it.mainImage?.url ?? null,
            raw: it,
          });
        });
      });

      await get().updateUser({ favourites: flat });
    } catch (err) {
      console.error('Failed to fetch favourites:', err);
    }
  },
}));