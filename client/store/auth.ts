'use client';

import { create } from 'zustand';

const TOKEN_KEY = 'taskboard_token';
const USER_KEY = 'taskboard_user';

export type AuthUser = { id: string; email: string; name: string; role: string; status: string; avatarUrl: string | null };

type AuthState = {
  token: string | null;
  user: AuthUser | null;
  hydrated: boolean;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  clearAuth: () => void;
  hydrateFromStorage: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  setToken: (token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        window.localStorage.setItem(TOKEN_KEY, token);
      } else {
        window.localStorage.removeItem(TOKEN_KEY);
      }
    }
    set({ token });
  },
  setUser: (user) => {
    const normalizedUser = user ? { ...user, avatarUrl: user.avatarUrl ?? null } : null;
    if (typeof window !== 'undefined') {
      if (normalizedUser) {
        window.localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      } else {
        window.localStorage.removeItem(USER_KEY);
      }
    }
    set({ user: normalizedUser });
  },
  clearAuth: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
    set({ token: null, user: null });
  },
  hydrateFromStorage: () => {
    if (typeof window === 'undefined') return;
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = window.localStorage.getItem(USER_KEY);
    const parsedUser = storedUser ? (JSON.parse(storedUser) as Partial<AuthUser>) : null;
    set({
      token: storedToken || null,
      user: parsedUser ? ({ ...parsedUser, avatarUrl: parsedUser.avatarUrl ?? null } as AuthUser) : null,
      hydrated: true
    });
  }
}));
