'use client';

import { ApolloProvider } from '@apollo/client';
import { ReactNode, useEffect, useMemo } from 'react';
import { createApolloClient } from '../lib/apolloClient';
import { useAuthStore } from '../store/auth';
import { useThemeStore } from '../store/theme';

export function Providers({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const hydrate = useAuthStore((s) => s.hydrateFromStorage);
  const hydrated = useAuthStore((s) => s.hydrated);
  const hydrateTheme = useThemeStore((s) => s.hydrateTheme);
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrate, hydrated]);

  useEffect(() => {
    hydrateTheme();
  }, [hydrateTheme]);

  const client = useMemo(() => createApolloClient(token), [token]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
