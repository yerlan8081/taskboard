'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuthStore } from '../store/auth';

export function AppShell({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur dark:border-white/10 dark:bg-slate-900/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/boards" className="rounded-xl bg-amber-500 px-3 py-1 text-sm font-bold text-slate-900 shadow">
              Taskboard
            </Link>
            <nav className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-200">
              <Link href="/boards" className="hover:text-amber-500 dark:hover:text-amber-300">
                Boards
              </Link>
              <Link href="/dashboard" className="hover:text-amber-500 dark:hover:text-amber-300">
                Dashboard
              </Link>
              {user?.role === 'ADMIN' && (
                <Link href="/admin/users" className="hover:text-amber-500 dark:hover:text-amber-300">
                  Admin
                </Link>
              )}
              <Link href="/profile" className="hover:text-amber-500 dark:hover:text-amber-300">
                Profile
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {token ? (
              <button
                onClick={() => clearAuth()}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-800 transition hover:border-amber-400 hover:text-amber-600 dark:border-white/30 dark:text-slate-100 dark:hover:text-amber-200"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm text-slate-800 transition hover:border-amber-400 hover:text-amber-600 dark:border-white/30 dark:text-slate-100 dark:hover:text-amber-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl justify-center px-4 py-10">{children}</main>
    </div>
  );
}
