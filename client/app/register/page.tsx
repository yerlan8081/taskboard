'use client';

import { useMutation } from '@apollo/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { REGISTER } from '../../graphql/operations';
import { useAuthStore } from '../../store/auth';

export default function RegisterPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      router.replace('/boards');
    }
  }, [router, token]);

  const [register, { loading }] = useMutation(REGISTER, {
    onCompleted: (data) => {
      const auth = data?.register;
      if (auth?.token) {
        setToken(auth.token);
        setUser(auth.user);
        router.push('/boards');
      }
    },
    onError: (err) => {
      setError(err.message);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Name should be at least 2 characters');
      return;
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    register({ variables: { input: { name: name.trim(), email: email.trim(), password } } });
  };

  return (
    <main className="w-full max-w-xl space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 px-8 py-10 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-500 dark:text-amber-300">Taskboard</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Register</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Create an account to start using Taskboard.</p>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-700 dark:text-slate-300">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
            type="text"
            placeholder="Your name"
            required
          />
        </div>
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
            placeholder="At least 6 characters"
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-700 dark:text-slate-300">Confirm Password</label>
          <input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
            type="password"
            placeholder="Repeat password"
            required
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-amber-500 px-4 py-2 text-center text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="text-sm text-slate-600 dark:text-slate-400">
        Already have an account?{' '}
        <Link href="/login" className="text-amber-300 hover:text-amber-200">
          Go to login
        </Link>
      </div>
    </main>
  );
}
