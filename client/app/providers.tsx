'use client';

import { ApolloProvider } from '@apollo/client';
import { ReactNode, useEffect, useMemo } from 'react';
import { createApolloClient } from '../lib/apolloClient';
import { useAuthStore } from '../store/auth';

export function Providers({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const hydrate = useAuthStore((s) => s.hydrateFromStorage);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) {
      hydrate();
    }
  }, [hydrate, hydrated]);

  const client = useMemo(() => createApolloClient(token), [token]);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
