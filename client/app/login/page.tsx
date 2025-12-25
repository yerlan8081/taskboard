'use client';

import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '../../store/auth';
import { LOGIN } from '../../graphql/operations';

export default function LoginPage() {
  const router = useRouter();
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('owner@test.com');
  const [password, setPassword] = useState('Passw0rd!');
  const [error, setError] = useState<string | null>(null);

  const [login, { loading }] = useMutation(LOGIN, {
    onCompleted: (data) => {
      const token = data?.login?.token;
      const user = data?.login?.user;
      if (token) {
        setToken(token);
        setUser(user);
        router.push('/boards');
      }
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (!password) {
      setError('Password cannot be empty');
      return;
    }
    setError(null);
    login({ variables: { input: { email: email.trim(), password } } });
  };

  return (
    <main className="w-full max-w-xl space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 px-8 py-10 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-500 dark:text-amber-300">Taskboard</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Login</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Use your account to access boards.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-700 dark:text-slate-300">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-700 dark:text-slate-300">Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
            type="password"
            placeholder="********"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="text-sm text-slate-600 dark:text-slate-400">
        <Link href="/boards" className="text-amber-300 hover:text-amber-200">
          Go to boards
        </Link>
        <div className="mt-2">
          <Link href="/register" className="text-amber-300 hover:text-amber-200">
            No account? Register
          </Link>
        </div>
      </div>
    </main>
  );
}
