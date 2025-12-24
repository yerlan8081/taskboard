'use client';

import { useApolloClient, useMutation, useQuery, useSubscription } from '@apollo/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BOARD,
  LISTS,
  TASKS,
  TASK_UPDATED_SUB,
  UPDATE_TASK_STATUS,
  CREATE_LIST,
  CREATE_TASK
} from '../../../graphql/operations';
import { useAuthStore } from '../../../store/auth';

type Task = {
  id: string;
  listId: string;
  title: string;
  status: string;
  priority: string;
  tags: string[];
};

type List = {
  id: string;
  title: string;
  order: number;
  color?: string | null;
};

export default function BoardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = useMemo(() => {
    const value = params?.id;
    if (!value) return '';
    return Array.isArray(value) ? value[0] : value.toString();
  }, [params]);

  const client = useApolloClient();
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const [boardTitle, setBoardTitle] = useState('');
  const [tasksByList, setTasksByList] = useState<Record<string, Task[]>>({});
  const [lastEvent, setLastEvent] = useState<string | null>(null);
  const [listTitle, setListTitle] = useState('');
  const [listOrder, setListOrder] = useState(1);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskListId, setTaskListId] = useState('');
  const [listsError, setListsError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);
  const [showCreatePanels, setShowCreatePanels] = useState(false);

  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const stored = localStorage.getItem('taskboard_token');
      if (stored) setToken(stored);
    }
  }, [setToken, token]);

  const { data: boardData } = useQuery(BOARD, {
    variables: { id: boardId },
    skip: !boardId || !token,
    onError: (err) => {
      const code = err?.graphQLErrors?.[0]?.extensions?.code;
      if (code === 'UNAUTHENTICATED') {
        clearAuth();
        router.replace('/login');
      }
      if (code === 'FORBIDDEN') {
        setForbidden(true);
      }
    }
  });

  const {
    data: listsData,
    loading: listsLoading,
    refetch: refetchLists
  } = useQuery<{ lists: List[] }>(LISTS, {
    variables: { boardId },
    skip: !boardId || !token,
    onError: (err) => {
      const code = err?.graphQLErrors?.[0]?.extensions?.code;
      if (code === 'UNAUTHENTICATED') {
        clearAuth();
        router.replace('/login');
      }
      if (code === 'FORBIDDEN') {
        setForbidden(true);
      }
      setListsError(err.message);
    }
  });

  const fetchTasksForLists = useCallback(
    async (lists: List[]) => {
      const entries = await Promise.all(
        lists.map(async (list) => {
          const res = await client.query<{ tasks: Task[] }>({
            query: TASKS,
            variables: { listId: list.id },
            fetchPolicy: 'network-only'
          });
          return [list.id, res.data.tasks] as const;
        })
      );
      const asRecord = entries.reduce<Record<string, Task[]>>((acc, [listId, tasks]) => {
        acc[listId] = tasks;
        return acc;
      }, {});
      setTasksByList(asRecord);
    },
    [client]
  );

  useEffect(() => {
    if (!listsData?.lists || listsData.lists.length === 0) {
      setTasksByList({});
      return;
    }
    fetchTasksForLists(listsData.lists);
  }, [fetchTasksForLists, listsData]);

  useSubscription(TASK_UPDATED_SUB, {
    variables: { boardId },
    skip: !boardId || !token,
    onData: ({ data }) => {
      const event = data.data?.taskUpdated;
      if (!event) return;
      setLastEvent(`${event.type} ${event.task.title}`);
      setTasksByList((prev) => {
        const listId = event.task.listId;
        const existing = prev[listId] ?? [];
        const idx = existing.findIndex((t) => t.id === event.task.id);
        let nextList: Task[];
        if (idx >= 0) {
          nextList = [...existing.slice(0, idx), event.task, ...existing.slice(idx + 1)];
        } else {
          nextList = [...existing, event.task];
        }
        return { ...prev, [listId]: nextList };
      });
    }
  });

  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS, {
    onError: (err) => {
      const code = err?.graphQLErrors?.[0]?.extensions?.code;
      if (code === 'UNAUTHENTICATED') {
        clearAuth();
        router.replace('/login');
      }
      if (code === 'FORBIDDEN') {
        setForbidden(true);
      }
    },
    onCompleted: (result) => {
      const updated = result?.updateTaskStatus;
      if (!updated) return;
      setTasksByList((prev) => {
        const listId = updated.listId;
        const existing = prev[listId] ?? [];
        const idx = existing.findIndex((t) => t.id === updated.id);
        if (idx >= 0) {
          const nextList = [...existing];
          nextList[idx] = { ...existing[idx], ...updated };
          return { ...prev, [listId]: nextList };
        }
        return prev;
      });
    }
  });

  const [createListMutation, { loading: creatingList }] = useMutation(CREATE_LIST, {
    onCompleted: async () => {
      await refetchLists();
      setListTitle('');
    }
  });

  const [createTaskMutation, { loading: creatingTask }] = useMutation(CREATE_TASK, {
    onCompleted: async () => {
      setTaskTitle('');
    }
  });

  const handleReload = useCallback(async () => {
    if (!boardId || !token) return;
    const listsResult = await refetchLists();
    const lists = listsResult.data?.lists ?? [];
    if (lists.length > 0) {
      await fetchTasksForLists(lists);
    } else {
      setTasksByList({});
    }
  }, [boardId, fetchTasksForLists, refetchLists, token]);

  const handleStatusChange = async (taskId: string, status: string) => {
    await updateTaskStatus({
      variables: { id: taskId, status }
    });
  };

  const handleCreateList = async () => {
    if (!boardId || !listTitle.trim()) return;
    await createListMutation({
      variables: {
        input: {
          boardId,
          title: listTitle.trim(),
          order: Number(listOrder) || 1
        }
      }
    });
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) return;
    const listId = taskListId || lists[0]?.id;
    if (!listId) return;
    await createTaskMutation({
      variables: {
        input: {
          listId,
          title: taskTitle.trim()
        }
      }
    });
  };

  const lists = listsData?.lists ?? [];
  useEffect(() => {
    if (boardData?.board?.title) {
      setBoardTitle(boardData.board.title);
    }
  }, [boardData]);

  if (!token) {
    return (
      <main className="w-full max-w-3xl space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-10 shadow-2xl backdrop-blur">
        <p className="text-sm text-slate-300">Please login to view this board.</p>
        <Link className="text-amber-300 hover:text-amber-200" href="/login">
          Go to login
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full max-w-4xl space-y-6 rounded-3xl border border-white/10 bg-slate-900/70 px-6 py-8 shadow-2xl backdrop-blur">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Board Detail</p>
          <h1 className="text-3xl font-semibold text-white">{boardTitle || 'Board'}</h1>
          <p className="text-xs text-slate-400 break-all">ID: {boardId}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/boards"
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-amber-200 hover:border-amber-400"
          >
            Go to boards
          </Link>
          <button
            onClick={handleReload}
            className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400"
            disabled={!token || !boardId}
          >
            Reload lists & tasks
          </button>
          <button
            onClick={() => {
              clearAuth();
              router.replace('/login');
            }}
            className="rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-200 hover:border-amber-400"
          >
            Logout
          </button>
        </div>
      </header>

      {forbidden && (
        <div className="rounded-xl border border-red-500/40 bg-red-900/40 px-3 py-2 text-sm text-red-100">
          You do not have access to this board (FORBIDDEN).
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-300">Subscription status</label>
          <div className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-200">
            {token && boardId ? 'Listening for taskUpdated events...' : 'Disconnected'}
          </div>
          {lastEvent ? (
            <p className="text-xs text-amber-300">Last event: {lastEvent}</p>
          ) : (
            <p className="text-xs text-slate-500">Waiting for events</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Create List</p>
            <button
              onClick={() => setShowCreatePanels((v) => !v)}
              className="text-xs text-amber-300 hover:text-amber-200"
            >
              {showCreatePanels ? 'Hide' : 'Show'}
            </button>
          </div>
          {showCreatePanels && (
            <>
              <input
                value={listTitle}
                onChange={(e) => setListTitle(e.target.value)}
                placeholder="List title"
                className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
              <input
                type="number"
                value={listOrder}
                onChange={(e) => setListOrder(Number(e.target.value))}
                placeholder="Order"
                className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
              <button
                onClick={handleCreateList}
                disabled={creatingList}
                className="w-full rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60"
              >
                {creatingList ? 'Creating...' : 'Create List'}
              </button>
            </>
          )}
        </div>

        <div className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-white">Create Task</p>
            <button
              onClick={() => setShowCreatePanels((v) => !v)}
              className="text-xs text-amber-300 hover:text-amber-200"
            >
              {showCreatePanels ? 'Hide' : 'Show'}
            </button>
          </div>
          {showCreatePanels && (
            <>
              <input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="Task title"
                className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              />
              <select
                value={taskListId}
                onChange={(e) => setTaskListId(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-sm text-white focus:border-amber-400 focus:outline-none"
              >
                <option value="">Select list (or first)</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateTask}
                disabled={creatingTask || lists.length === 0}
                className="w-full rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60"
              >
                {creatingTask ? 'Creating...' : 'Create Task'}
              </button>
              {lists.length === 0 && <p className="text-xs text-slate-500">Create a list first.</p>}
            </>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Lists</h2>
          {listsLoading && <span className="text-xs text-slate-400">Loading lists...</span>}
        </div>
        {lists.length === 0 ? (
          <p className="text-sm text-slate-400">No lists yet. Create one via GraphQL and reload.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {lists
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((list) => (
                <div key={list.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <p className="text-lg font-semibold text-white">{list.title}</p>
                    </div>
                    <span className="text-xs text-slate-400">#{list.order}</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    {(tasksByList[list.id] ?? []).map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-white/5 bg-slate-800/60 px-3 py-2 text-sm text-white"
                      >
                        <div className="flex items-center justify-between">
                          <span>{task.title}</span>
                          <span className="rounded bg-slate-700 px-2 py-0.5 text-xs uppercase tracking-wide text-amber-200">
                            {task.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">Priority: {task.priority}</p>
                        <div className="flex gap-2 text-xs">
                          {['TODO', 'DOING', 'DONE'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(task.id, status)}
                              className={`rounded px-2 py-1 ${
                                task.status === status ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-slate-200'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                        {task.tags.length > 0 && (
                          <p className="text-xs text-amber-200">Tags: {task.tags.join(', ')}</p>
                        )}
                      </div>
                    ))}
                    {(tasksByList[list.id] ?? []).length === 0 && (
                      <p className="text-xs text-slate-500">No tasks yet.</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
