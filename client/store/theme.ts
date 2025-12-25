'use client';

import { create } from 'zustand';

export type ThemeMode = 'light' | 'dark';

const THEME_KEY = 'taskboard_theme';

function applyThemeClass(theme: ThemeMode) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

type ThemeState = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  hydrateTheme: () => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark',
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(THEME_KEY, theme);
    }
    applyThemeClass(theme);
    set({ theme });
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
  hydrateTheme: () => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem(THEME_KEY) as ThemeMode | null;
    let theme: ThemeMode = 'dark';

    if (stored === 'light' || stored === 'dark') {
      theme = stored;
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      theme = 'light';
    }

    applyThemeClass(theme);
    set({ theme });
  }
}));
