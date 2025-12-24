'use client';

import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BOARDS, CREATE_BOARD } from '../../graphql/operations';
import { useAuthStore } from '../../store/auth';

export default function BoardsPage() {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

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

  const { data, loading, error: boardsError, refetch } = useQuery<{ boards: { id: string; title: string; visibility: string }[] }>(
    BOARDS,
    { skip: !token }
  );

  const [createBoard, { loading: creating, error }] = useMutation(CREATE_BOARD, {
    onCompleted: () => refetch()
  });

  const handleCreate = async (formData: FormData) => {
    const title = String(formData.get('title') || '').trim();
    if (!title) return;
    await createBoard({ variables: { input: { title, visibility: 'PRIVATE' } } });
  };

  if (!token) {
    return (
      <main className="w-full max-w-3xl space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-10 shadow-2xl backdrop-blur">
        <p className="text-sm text-slate-300">Please login to view boards.</p>
        <Link className="text-amber-300 hover:text-amber-200" href="/login">
          Go to login
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full max-w-4xl space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-10 shadow-2xl backdrop-blur">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Boards</p>
          <h1 className="text-3xl font-semibold text-white">Your boards</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/dashboard" className="text-amber-300 hover:text-amber-200">
            Dashboard
          </Link>
          <Link href="/profile" className="text-amber-300 hover:text-amber-200">
            View profile
          </Link>
          <button
            onClick={() => {
              clearAuth();
              router.replace('/login');
            }}
            className="rounded-lg border border-white/20 px-3 py-1 text-slate-200 hover:border-amber-400"
          >
            Logout
          </button>
        </div>
      </header>

      <form action={handleCreate} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/30 p-4 sm:flex-row sm:items-center">
        <input
          name="title"
          placeholder="New board title"
          className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-3 py-2 text-white focus:border-amber-400 focus:outline-none"
          required
        />
        <button
          type="submit"
          disabled={creating}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60"
        >
          {creating ? 'Creating...' : 'Create board'}
        </button>
      </form>
      {error && <p className="text-sm text-red-300">{error.message}</p>}
      {boardsError && <p className="text-sm text-red-300">{boardsError.message}</p>}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Board list</h2>
          {loading && <span className="text-xs text-slate-400">Loading...</span>}
        </div>
        {data?.boards?.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {data.boards.map((board) => (
              <Link
                key={board.id}
                href={`/boards/${board.id}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-amber-400"
              >
                <div className="flex items-center justify-between">
                  <p className="text-lg font-semibold text-white">{board.title}</p>
                  <span className="rounded bg-slate-800 px-2 py-0.5 text-xs uppercase text-amber-200">
                    {board.visibility}
                  </span>
                </div>
                <p className="text-xs text-slate-400">ID: {board.id}</p>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400">No boards yet.</p>
        )}
      </section>
    </main>
  );
}
