'use client';

import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/auth';

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
      role
      status
    }
  }
`;

export default function ProfilePage() {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const stored = localStorage.getItem('taskboard_token');
      if (stored) setToken(stored);
    }
  }, [setToken, token]);

  const { data, loading } = useQuery<{ me: { id: string; email: string; name: string; role: string; status: string } }>(ME_QUERY, {
    skip: !token
  });

  if (!token) {
    return (
      <main className="w-full max-w-3xl space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-10 shadow-2xl backdrop-blur">
        <p className="text-sm text-slate-300">Please login to view profile.</p>
        <Link className="text-amber-300 hover:text-amber-200" href="/login">
          Go to login
        </Link>
      </main>
    );
  }

  const me = data?.me;

  return (
    <main className="w-full max-w-3xl space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-10 shadow-2xl backdrop-blur">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Profile</p>
        <h1 className="text-3xl font-semibold text-white">{me?.name || 'Profile'}</h1>
      </header>

      {loading && <p className="text-sm text-slate-400">Loading...</p>}
      {me && (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-200">
          <p>Email: {me.email}</p>
          <p>Role: {me.role}</p>
          <p>Status: {me.status}</p>
          <p>ID: {me.id}</p>
        </div>
      )}

      <div className="flex gap-4 text-sm text-slate-400">
        <Link href="/boards" className="text-amber-300 hover:text-amber-200">
          Back to boards
        </Link>
      </div>
    </main>
  );
}
