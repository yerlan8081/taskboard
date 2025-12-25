'use client';

import { useApolloClient, useMutation } from '@apollo/client';
import Link from 'next/link';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  BOARDS,
  LISTS,
  TASKS,
  CREATE_BOARD,
  CREATE_LIST,
  CREATE_TASK
} from '../../graphql/operations';
import { useAuthStore } from '../../store/auth';

type ListInfo = {
  id: string;
  title: string;
  order: number;
  tasksCount: number;
};

const DEFAULT_LISTS = [
  { title: '今天', order: 1 },
  { title: '本周', order: 2 },
  { title: '稍后', order: 3 }
];

export default function DashboardPage() {
  const client = useApolloClient();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [boardId, setBoardId] = useState<string | null>(null);
  const [lists, setLists] = useState<ListInfo[]>([]);
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [createBoard] = useMutation(CREATE_BOARD);
  const [createList] = useMutation(CREATE_LIST);
  const [createTask, { loading: creatingTask }] = useMutation(CREATE_TASK);

  const sortedLists = useMemo(() => {
    return [...lists].sort((a, b) => a.order - b.order);
  }, [lists]);

  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const stored = localStorage.getItem('taskboard_token');
      if (stored) {
        setToken(stored);
      } else {
        router.replace('/login');
      }
    }
  }, [router, setToken, token]);

  const handleAuthError = (err: any) => {
    const code = err?.graphQLErrors?.[0]?.extensions?.code;
    if (code === 'UNAUTHENTICATED') {
      clearAuth();
      router.replace('/login');
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (!token) return;

    const setup = async () => {
      setLoading(true);
      setError(null);
      try {
        let boardsResult;
        try {
          boardsResult = await client.query<{ boards: { id: string; title: string }[] }>({
            query: BOARDS,
            fetchPolicy: 'network-only'
          });
        } catch (err: any) {
          if (handleAuthError(err)) return;
          throw err;
        }

        let targetBoardId: string;
        if (!boardsResult.data.boards.length) {
          const created = await createBoard({
            variables: { input: { title: 'My Board', visibility: 'PRIVATE' } }
          });
          targetBoardId = created.data?.createBoard?.id;
        } else {
          targetBoardId = boardsResult.data.boards[0].id;
        }

        if (!targetBoardId) {
          throw new Error('Failed to get or create board');
        }
        setBoardId(targetBoardId);

        const fetchLists = async () =>
          client.query<{ lists: { id: string; title: string; order: number }[] }>({
            query: LISTS,
            variables: { boardId: targetBoardId },
            fetchPolicy: 'network-only'
          });

        let listsResult = await fetchLists();

        const existingTitles = new Set(listsResult.data.lists.map((l) => l.title));
        const missing = DEFAULT_LISTS.filter((l) => !existingTitles.has(l.title));

        for (const m of missing) {
          await createList({
            variables: {
              input: {
                boardId: targetBoardId,
                title: m.title,
                order: m.order
              }
            }
          });
        }

        if (missing.length) {
          listsResult = await fetchLists();
        }

        const listsWithCounts: ListInfo[] = [];
        for (const list of listsResult.data.lists) {
          try {
            const tasksResult = await client.query<{ tasks: { id: string }[] }>({
              query: TASKS,
              variables: { listId: list.id },
              fetchPolicy: 'network-only'
            });
            listsWithCounts.push({
              id: list.id,
              title: list.title,
              order: list.order,
              tasksCount: tasksResult.data.tasks.length
            });
          } catch (err: any) {
            if (handleAuthError(err)) return;
            throw err;
          }
        }

        setLists(listsWithCounts);
      } catch (err: any) {
        if (!handleAuthError(err)) {
          setError(err.message || 'Failed to load dashboard');
        }
      } finally {
        setLoading(false);
      }
    };

    setup();
  }, [client, createBoard, createList, token, router, clearAuth]);

  const handleCreateTask = async (listId: string) => {
    const title = (taskInputs[listId] || '').trim();
    if (!title) return;
    try {
      const res = await createTask({
        variables: {
          input: {
            listId,
            title
          }
        }
      });
      if (res.data?.createTask) {
        setLists((prev) =>
          prev.map((l) => (l.id === listId ? { ...l, tasksCount: l.tasksCount + 1 } : l))
        );
        setTaskInputs((prev) => ({ ...prev, [listId]: '' }));
      }
    } catch (err: any) {
      handleAuthError(err);
      setError(err.message || 'Failed to create task');
    }
  };

  const handlePlus = (listId: string) => {
    const el = inputRefs.current[listId];
    if (el) {
      el.focus();
    }
  };

  return (
    <main className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 px-6 py-10 text-slate-900 transition-colors dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 dark:text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-amber-500 dark:text-amber-300">Dashboard</p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">我的taskboard面板</h1>
            {boardId && (
              <p className="text-xs text-slate-600 dark:text-slate-400">默认看板 ID: {boardId}</p>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/boards" className="text-amber-500 hover:text-amber-200">
              Go to Boards
            </Link>
            <Link href="/profile" className="text-amber-500 hover:text-amber-200">
              Profile
            </Link>
          </div>
        </header>

        {loading && <p className="text-sm text-slate-700 dark:text-slate-300">Loading dashboard...</p>}
        {error && <p className="text-sm text-red-600 dark:text-red-300">{error}</p>}

        <div className="grid gap-4 md:grid-cols-3">
          {sortedLists.map((list) => (
            <div
              key={list.id}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg backdrop-blur dark:border-white/10 dark:bg-white/5"
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlus(list.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-amber-400 text-amber-600 hover:bg-amber-500 hover:text-slate-900 dark:border-amber-300 dark:text-amber-200"
                    title="Add task"
                  >
                    +
                  </button>
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-white">{list.title}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">{list.tasksCount} tasks</p>
                  </div>
                </div>
                <button className="rounded-full px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10" title="More">
                  ...
                </button>
              </div>

              <div className="space-y-2">
                <input
                  ref={(el) => (inputRefs.current[list.id] = el)}
                  value={taskInputs[list.id] ?? ''}
                  onChange={(e) =>
                    setTaskInputs((prev) => ({ ...prev, [list.id]: e.target.value }))
                  }
                  placeholder="Quick task title"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                />
                <button
                  onClick={() => handleCreateTask(list.id)}
                  disabled={creatingTask}
                  className="w-full rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60"
                >
                  {creatingTask ? 'Creating...' : 'Add Task'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
