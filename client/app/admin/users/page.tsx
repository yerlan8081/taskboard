'use client';

import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { ME, USERS, SET_USER_ROLE, SET_USER_STATUS } from '../../../graphql/operations';
import { useAuthStore } from '../../../store/auth';

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: string;
  status: string;
};

function hasErrorCode(err: any, code: string) {
  return err?.graphQLErrors?.some((e: any) => e?.extensions?.code === code);
}

export default function AdminUsersPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [authChecked, setAuthChecked] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('taskboard_token') : null;
      if (stored) {
        setToken(stored);
      } else {
        router.replace('/login');
      }
    }
  }, [router, setToken, token]);

  const handleAuthError = (err: any) => {
    if (hasErrorCode(err, 'UNAUTHENTICATED')) {
      clearAuth();
      router.replace('/login');
      return true;
    }
    if (hasErrorCode(err, 'FORBIDDEN')) {
      router.replace('/boards');
      return true;
    }
    return false;
  };

  const { data: meData, loading: meLoading } = useQuery(ME, {
    skip: !token,
    onCompleted: (data) => {
      if (data?.me) {
        setUser(data.me);
        if (data.me.role !== 'ADMIN') {
          router.replace('/boards');
        }
      }
      setAuthChecked(true);
    },
    onError: (err) => {
      setAuthChecked(true);
      if (handleAuthError(err)) return;
      setPageError(err.message);
    }
  });

  const isAdmin = useMemo(() => meData?.me?.role === 'ADMIN', [meData?.me?.role]);

  const {
    data,
    loading,
    error,
    refetch
  } = useQuery<{ users: UserRow[] }>(USERS, {
    skip: !token || !isAdmin,
    onError: (err) => {
      if (handleAuthError(err)) return;
      setPageError(err.message);
    }
  });

  const [setUserRole, { loading: updatingRole }] = useMutation(SET_USER_ROLE, {
    onError: (err) => handleAuthError(err)
  });
  const [setUserStatus, { loading: updatingStatus }] = useMutation(SET_USER_STATUS, {
    onError: (err) => handleAuthError(err)
  });

  const handleToggleRole = async (user: UserRow) => {
    const nextRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    await setUserRole({ variables: { input: { userId: user.id, role: nextRole } } });
    await refetch();
  };

  const handleToggleStatus = async (user: UserRow) => {
    const nextStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    await setUserStatus({ variables: { input: { userId: user.id, status: nextStatus } } });
    await refetch();
  };

  if (!token || meLoading || !authChecked) {
    return (
      <main className="w-full max-w-5xl space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 px-8 py-10 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
        <p className="text-sm text-slate-600 dark:text-slate-300">Loading...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const users = data?.users ?? [];

  return (
    <main className="w-full max-w-6xl space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 px-8 py-10 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500 dark:text-amber-300">Admin</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">User Management</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Toggle roles and statuses.</p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => refetch()}
            disabled={loading}
            className="rounded-lg border border-slate-300 px-3 py-1 text-slate-800 hover:border-amber-400 hover:text-amber-600 dark:border-white/30 dark:text-slate-100 dark:hover:text-amber-200"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
          <Link href="/boards" className="text-amber-500 hover:text-amber-200">
            Back to Boards
          </Link>
        </div>
      </header>

      {pageError && <p className="text-sm text-red-600 dark:text-red-300">{pageError}</p>}
      {error && <p className="text-sm text-red-600 dark:text-red-300">{error.message}</p>}

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-white/10 dark:bg-slate-900/60">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10">
          <thead className="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm dark:divide-white/5">
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-4 text-center text-slate-500 dark:text-slate-400">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">{u.name}</td>
                <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="rounded bg-slate-200 px-2 py-1 text-xs font-semibold text-slate-800 dark:bg-slate-700 dark:text-slate-100">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-1 text-xs font-semibold ${
                      u.status === 'ACTIVE'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs font-mono text-slate-500 dark:text-amber-200">{u.id}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleToggleStatus(u)}
                      disabled={updatingStatus || loading}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-800 hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-slate-100 dark:hover:text-amber-200 disabled:opacity-60"
                    >
                      Toggle Status
                    </button>
                    <button
                      onClick={() => handleToggleRole(u)}
                      disabled={updatingRole || loading}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-800 hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-slate-100 dark:hover:text-amber-200 disabled:opacity-60"
                    >
                      Toggle Role
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
