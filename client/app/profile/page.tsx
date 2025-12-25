'use client';

import { ApolloError, useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CHANGE_PASSWORD, ME, UPDATE_PROFILE } from '../../graphql/operations';
import { useAuthStore } from '../../store/auth';

type MeResult = {
  me: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: string;
    avatarUrl: string | null;
  };
};

function hasUnauthenticatedError(error: ApolloError) {
  return error.graphQLErrors.some((graphError) => {
    const code = (graphError.extensions as { code?: string } | undefined)?.code;
    return code === 'UNAUTHENTICATED';
  });
}

function isValidHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

export default function ProfilePage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [name, setName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

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

  const { data, loading, refetch } = useQuery<MeResult>(ME, {
    skip: !token,
    onError: (error) => {
      if (hasUnauthenticatedError(error)) {
        clearAuth();
        router.replace('/login');
        return;
      }
      setPageError(error.message);
    }
  });

  const me = data?.me;

  useEffect(() => {
    if (me) {
      setName(me.name);
      setAvatarUrl(me.avatarUrl ?? '');
      setUser(me);
    }
  }, [me, setUser]);

  const handleAuthRedirect = (error: ApolloError) => {
    if (hasUnauthenticatedError(error)) {
      clearAuth();
      router.replace('/login');
      return true;
    }
    return false;
  };

  const [updateProfile, { loading: updatingProfile }] = useMutation(UPDATE_PROFILE, {
    onCompleted: (result) => {
      if (result?.updateProfile) {
        setUser(result.updateProfile);
        setProfileSuccess('Profile updated');
        setProfileError(null);
      }
    },
    onError: (error) => {
      if (handleAuthRedirect(error)) return;
      setProfileError(error.message);
      setProfileSuccess(null);
    }
  });

  const [changePassword, { loading: changingPassword }] = useMutation(CHANGE_PASSWORD, {
    onCompleted: () => {
      setPasswordSuccess('Password changed successfully');
      setPasswordError(null);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (error) => {
      if (handleAuthRedirect(error)) return;
      setPasswordError(error.message);
      setPasswordSuccess(null);
    }
  });

  const avatarInitial = useMemo(() => {
    const source = me?.name || me?.email || '?';
    return source.charAt(0).toUpperCase();
  }, [me?.email, me?.name]);

  const hasProfileChanges = useMemo(() => {
    if (!me) return false;
    const nextName = name.trim();
    const nextAvatar = avatarUrl.trim();
    return nextName !== me.name || nextAvatar !== (me.avatarUrl ?? '');
  }, [avatarUrl, me, name]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) return;
    setProfileError(null);
    setProfileSuccess(null);

    const nextName = name.trim();
    const nextAvatar = avatarUrl.trim();

    if (!hasProfileChanges) {
      setProfileError('Please change at least one field before saving.');
      return;
    }

    if (nextName && nextName.length < 2) {
      setProfileError('Name should be at least 2 characters.');
      return;
    }

    if (nextAvatar && !isValidHttpUrl(nextAvatar)) {
      setProfileError('Avatar URL must start with http:// or https://');
      return;
    }

    const input: { name?: string; avatarUrl?: string } = {};
    if (nextName !== me.name) {
      input.name = nextName;
    }
    if (nextAvatar !== (me.avatarUrl ?? '')) {
      input.avatarUrl = nextAvatar;
    }

    try {
      await updateProfile({ variables: { input } });
      await refetch();
    } catch {
      // handled in onError
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!oldPassword) {
      setPasswordError('Old password is required.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      await changePassword({ variables: { input: { oldPassword, newPassword } } });
    } catch {
      // handled in onError
    }
  };

  if (!token) {
    return null;
  }

  return (
    <main className="w-full max-w-5xl space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 px-8 py-10 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500 dark:text-amber-300">Profile</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{me?.name || 'Profile'}</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">Manage your personal info and password.</p>
        </div>
        <div className="flex items-center gap-3 text-sm text-slate-200">
          <Link href="/boards" className="text-amber-500 hover:text-amber-200">
            Boards
          </Link>
          <Link href="/dashboard" className="text-amber-500 hover:text-amber-200">
            Dashboard
          </Link>
          <button
            onClick={() => {
              clearAuth();
              router.replace('/login');
            }}
            className="rounded-lg border border-slate-300 px-3 py-1 text-slate-800 hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-slate-200"
          >
            Logout
          </button>
        </div>
      </header>

      {loading && <p className="text-sm text-slate-600 dark:text-slate-400">Loading profile...</p>}
      {pageError && <p className="text-sm text-red-600 dark:text-red-300">{pageError}</p>}

      {me && (
        <section className="flex flex-col gap-6 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/30 md:flex-row md:items-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-amber-500 text-2xl font-semibold text-slate-900">
            {me.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.avatarUrl} alt={me.name} className="h-full w-full object-cover" />
            ) : (
              <span>{avatarInitial}</span>
            )}
          </div>
          <div className="grid flex-1 grid-cols-1 gap-2 text-sm text-slate-800 dark:text-slate-200 sm:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Name</p>
              <p className="font-semibold text-slate-900 dark:text-white">{me.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Email</p>
              <p className="font-semibold text-slate-900 break-all dark:text-white">{me.email}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Role</p>
              <p className="font-semibold text-slate-900 dark:text-white">{me.role}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</p>
              <p className="font-semibold text-slate-900 dark:text-white">{me.status}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">User ID</p>
              <p className="font-mono text-xs text-amber-700 dark:text-amber-200">{me.id}</p>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleProfileSubmit}
          className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/30"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit profile</h2>
            {profileSuccess && <span className="text-xs text-emerald-600 dark:text-emerald-300">{profileSuccess}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-700 dark:text-slate-300">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
              type="text"
              placeholder="Your display name"
            />
            <p className="text-xs text-slate-600 dark:text-slate-500">At least 2 characters.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-700 dark:text-slate-300">Avatar URL</label>
            <input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
              type="url"
              placeholder="https://example.com/avatar.png"
            />
            <p className="text-xs text-slate-600 dark:text-slate-500">Must start with http:// or https://</p>
          </div>
          {profileError && <p className="text-sm text-red-600 dark:text-red-300">{profileError}</p>}
          <button
            type="submit"
            disabled={updatingProfile || !hasProfileChanges || !me}
            className="w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60"
          >
            {updatingProfile ? 'Saving...' : 'Save changes'}
          </button>
        </form>

        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-black/30"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Change password</h2>
            {passwordSuccess && <span className="text-xs text-emerald-600 dark:text-emerald-300">{passwordSuccess}</span>}
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-700 dark:text-slate-300">Old password</label>
            <input
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
              type="password"
              placeholder="Current password"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-700 dark:text-slate-300">New password</label>
            <input
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
              type="password"
              placeholder="At least 6 characters"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-700 dark:text-slate-300">Confirm new password</label>
            <input
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
              type="password"
              placeholder="Repeat new password"
              required
            />
          </div>
          {passwordError && <p className="text-sm text-red-600 dark:text-red-300">{passwordError}</p>}
          <button
            type="submit"
            disabled={changingPassword}
            className="w-full rounded-xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-white disabled:opacity-60"
          >
            {changingPassword ? 'Updating password...' : 'Change password'}
          </button>
        </form>
      </div>
    </main>
  );
}
