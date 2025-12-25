'use client';

import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BOARDS, CREATE_BOARD, UPDATE_BOARD, DELETE_BOARD } from '../../graphql/operations';
import { useAuthStore } from '../../store/auth';

export default function BoardsPage() {
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const router = useRouter();
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ title: string; description: string; visibility: string; cover: string }>({
    title: '',
    description: '',
    visibility: 'PRIVATE',
    cover: ''
  });

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

  const { data, loading, error: boardsError, refetch } = useQuery<{
    boards: { id: string; title: string; visibility: string; description?: string | null; cover?: string | null; isArchived?: boolean | null }[];
  }>(
    BOARDS,
    { skip: !token }
  );

  const [createBoard, { loading: creating, error }] = useMutation(CREATE_BOARD, {
    onCompleted: () => refetch()
  });
  const [updateBoard, { loading: updatingBoard }] = useMutation(UPDATE_BOARD, {
    onCompleted: () => refetch()
  });
  const [deleteBoard, { loading: deletingBoard }] = useMutation(DELETE_BOARD, {
    onCompleted: () => refetch()
  });

  const handleCreate = async (formData: FormData) => {
    const title = String(formData.get('title') || '').trim();
    if (!title) return;
    await createBoard({ variables: { input: { title, visibility: 'PRIVATE' } } });
  };

  const startEdit = (board: { id: string; title: string; description?: string | null; visibility: string; cover?: string | null }) => {
    setEditingBoardId(board.id);
    setEditForm({
      title: board.title,
      description: board.description ?? '',
      visibility: board.visibility,
      cover: board.cover ?? ''
    });
  };

  const handleEditSubmit = async (e: React.FormEvent, boardId: string) => {
    e.preventDefault();
    if (!editForm.title.trim()) return;
    await updateBoard({
      variables: {
        input: {
          id: boardId,
          title: editForm.title.trim(),
          description: editForm.description.trim(),
          visibility: editForm.visibility,
          cover: editForm.cover.trim() || null
        }
      }
    });
    setEditingBoardId(null);
  };

  const handleDelete = async (boardId: string) => {
    if (!confirm('Delete this board? It will archive the board and remove tasks.')) return;
    await deleteBoard({ variables: { id: boardId } });
  };

  const boards = useMemo(() => data?.boards ?? [], [data?.boards]);

  if (!token) {
    return (
      <main className="w-full max-w-3xl space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 px-8 py-10 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
        <p className="text-sm text-slate-700 dark:text-slate-300">Please login to view boards.</p>
        <Link className="text-amber-300 hover:text-amber-200" href="/login">
          Go to login
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full max-w-4xl space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 px-8 py-10 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500 dark:text-amber-300">Boards</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Your boards</h1>
        </div>
      </header>

      <form
        action={handleCreate}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/30 sm:flex-row sm:items-center"
      >
        <input
          name="title"
          placeholder="New board title"
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/50 dark:text-white"
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
      {error && <p className="text-sm text-red-600 dark:text-red-300">{error.message}</p>}
      {boardsError && <p className="text-sm text-red-600 dark:text-red-300">{boardsError.message}</p>}

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Board list</h2>
          {loading && <span className="text-xs text-slate-500 dark:text-slate-400">Loading...</span>}
        </div>
        {boards.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {boards.map((board) => (
              <div
                key={board.id}
                className="rounded-2xl border border-slate-200/80 bg-white p-4 transition hover:border-amber-400 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <Link href={`/boards/${board.id}`} className="text-lg font-semibold text-slate-900 dark:text-white hover:text-amber-500">
                      {board.title}
                    </Link>
                    {board.description && <p className="text-xs text-slate-500 dark:text-slate-400">{board.description}</p>}
                    <p className="text-[11px] text-slate-400">ID: {board.id}</p>
                  </div>
                  <span className="rounded bg-slate-200 px-2 py-0.5 text-xs uppercase text-amber-600 dark:bg-slate-800 dark:text-amber-200">
                    {board.visibility}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <button
                    onClick={() => startEdit(board)}
                    className="rounded border border-slate-300 px-3 py-1 text-slate-700 hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-slate-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(board.id)}
                    disabled={deletingBoard}
                    className="rounded border border-rose-300 px-3 py-1 text-rose-700 hover:border-rose-500 hover:text-rose-600 dark:border-rose-500 dark:text-rose-200 disabled:opacity-60"
                  >
                    Delete
                  </button>
                </div>
                {editingBoardId === board.id && (
                  <form onSubmit={(e) => handleEditSubmit(e, board.id)} className="mt-3 space-y-2 rounded-xl border border-slate-200/80 p-3 dark:border-white/10">
                    <input
                      value={editForm.title}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, title: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                      placeholder="Title"
                      required
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                      placeholder="Description"
                    />
                    <input
                      value={editForm.cover}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, cover: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                      placeholder="Cover URL"
                    />
                    <select
                      value={editForm.visibility}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, visibility: e.target.value }))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                    >
                      <option value="PRIVATE">PRIVATE</option>
                      <option value="PUBLIC">PUBLIC</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={updatingBoard}
                        className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60"
                      >
                        {updatingBoard ? 'Saving...' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingBoardId(null)}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-400">No boards yet.</p>
        )}
      </section>
    </main>
  );
}
