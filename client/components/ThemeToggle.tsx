'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../store/theme';

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const hydrateTheme = useThemeStore((s) => s.hydrateTheme);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-lg border border-slate-300 px-3 py-1 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-amber-400 hover:text-amber-600 dark:border-white/30 dark:text-slate-100 dark:hover:text-amber-200"
      aria-label="Toggle theme"
      title="Toggle light/dark theme"
    >
      {theme === 'dark' ? '🌙 Dark' : '☀ Light'}
    </button>
  );
}
