'use client';

import { useMutation, useQuery } from '@apollo/client';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { TASK, LIST, LISTS, UPDATE_TASK, MOVE_TASK, DELETE_TASK } from '../../../graphql/operations';
import { useAuthStore } from '../../../store/auth';

type TaskDetail = {
  id: string;
  listId: string;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  tags: string[];
  assigneeId?: string | null;
  dueDate?: string | null;
};

type ListRow = {
  id: string;
  boardId: string;
  title: string;
  isArchived?: boolean | null;
};

function hasErrorCode(err: any, code: string) {
  return err?.graphQLErrors?.some((e: any) => e?.extensions?.code === code);
}

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = useMemo(() => {
    const value = params?.id;
    if (!value) return '';
    return Array.isArray(value) ? value[0] : value.toString();
  }, [params]);

  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [pageError, setPageError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [form, setForm] = useState<{ title: string; description: string; status: string; priority: string }>({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM'
  });
  const [moveListId, setMoveListId] = useState('');

  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const stored = localStorage.getItem('taskboard_token');
      if (stored) setToken(stored);
    }
  }, [setToken, token]);

  const handleAuthError = (err: any) => {
    if (hasErrorCode(err, 'UNAUTHENTICATED')) {
      clearAuth();
      router.replace('/login');
      return true;
    }
    if (hasErrorCode(err, 'FORBIDDEN')) {
      setPageError('Access denied (FORBIDDEN)');
      return true;
    }
    return false;
  };

  const {
    data: taskData,
    loading: taskLoading,
    refetch: refetchTask
  } = useQuery<{ task: TaskDetail }>(TASK, {
    variables: { id: taskId },
    skip: !token || !taskId,
    onCompleted: (data) => {
      if (data?.task) {
        setForm({
          title: data.task.title,
          description: data.task.description ?? '',
          status: data.task.status,
          priority: data.task.priority
        });
        setMoveListId(data.task.listId);
      }
    },
    onError: (err) => {
      if (handleAuthError(err)) return;
      setPageError(err.message);
    }
  });

  const listId = taskData?.task?.listId ?? '';

  const { data: listData } = useQuery<{ list: ListRow | null }>(LIST, {
    variables: { id: listId },
    skip: !token || !listId,
    onError: (err) => {
      if (handleAuthError(err)) return;
      setPageError(err.message);
    }
  });

  const boardId = listData?.list?.boardId ?? '';

  const { data: listsData, refetch: refetchLists } = useQuery<{ lists: ListRow[] }>(LISTS, {
    variables: { boardId },
    skip: !token || !boardId,
    onError: (err) => {
      if (handleAuthError(err)) return;
      setPageError(err.message);
    }
  });

  const [updateTaskMutation, { loading: updating }] = useMutation(UPDATE_TASK, {
    onError: (err) => {
      if (handleAuthError(err)) return;
      setPageError(err.message);
    }
  });
  const [moveTaskMutation, { loading: moving }] = useMutation(MOVE_TASK, {
    onError: (err) => {
      if (handleAuthError(err)) return;
      setPageError(err.message);
    }
  });
  const [deleteTaskMutation, { loading: deleting }] = useMutation(DELETE_TASK, {
    onError: (err) => {
      if (handleAuthError(err)) return;
      setPageError(err.message);
    }
  });

  const task = taskData?.task;
  const lists = useMemo(() => (listsData?.lists ?? []).filter((l) => !l.isArchived), [listsData?.lists]);
  const currentListName = useMemo(() => lists.find((l) => l.id === listId)?.title ?? listId, [listId, lists]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setInfoMessage(null);
    setPageError(null);
    if (!taskId) return;
    const title = form.title.trim();
    if (!title) {
      setPageError('Title is required');
      return;
    }
    try {
      await updateTaskMutation({
        variables: {
          input: {
            id: taskId,
            title,
            description: form.description.trim(),
            status: form.status,
            priority: form.priority
          }
        }
      });
      await refetchTask();
      setInfoMessage('Task updated');
    } catch (err) {
      // handled by onError
    }
  };

  const handleMove = async () => {
    setInfoMessage(null);
    setPageError(null);
    if (!taskId || !moveListId) {
      setPageError('Select a list to move to');
      return;
    }
    try {
      await moveTaskMutation({ variables: { input: { taskId, toListId: moveListId } } });
      await refetchTask();
      await refetchLists();
      setInfoMessage('Task moved');
    } catch (err) {
      // handled by onError
    }
  };

  const handleDelete = async () => {
    setInfoMessage(null);
    setPageError(null);
    if (!taskId) return;
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTaskMutation({ variables: { id: taskId } });
      setInfoMessage('Task deleted');
      if (window.history.length > 1) {
        router.back();
      } else {
        router.push('/boards');
      }
    } catch (err) {
      // handled by onError
    }
  };

  if (!token) {
    return (
      <main className="w-full max-w-3xl space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 px-8 py-10 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
        <p className="text-sm text-slate-700 dark:text-slate-300">Please login to view task details.</p>
        <Link className="text-amber-600 hover:text-amber-500 dark:text-amber-300" href="/login">
          Go to login
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full max-w-4xl space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 px-8 py-10 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500 dark:text-amber-300">Task</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{task ? task.title : 'Task'}</h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">ID: {taskId}</p>
          {currentListName && <p className="text-xs text-slate-600 dark:text-slate-400">List: {currentListName}</p>}
          {boardId && (
            <Link href={`/boards/${boardId}`} className="text-xs text-amber-600 hover:text-amber-500 dark:text-amber-300">
              View board
            </Link>
          )}
        </div>
        <div className="flex gap-3 text-sm">
          <Link href="/boards" className="text-amber-600 hover:text-amber-500 dark:text-amber-300">
            Back to boards
          </Link>
        </div>
      </header>

      {pageError && <p className="text-sm text-red-600 dark:text-red-300">{pageError}</p>}
      {infoMessage && <p className="text-sm text-emerald-600 dark:text-emerald-300">{infoMessage}</p>}

      {taskLoading && <p className="text-sm text-slate-600 dark:text-slate-400">Loading task...</p>}
      {!taskLoading && !task && <p className="text-sm text-slate-600 dark:text-slate-400">Task not found.</p>}

      {task && (
        <>
          <section className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/30">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Details</h2>
              <p className="text-sm text-slate-700 dark:text-slate-200">{task.description || 'No description'}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Status: {task.status}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Priority: {task.priority}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Assignee: {task.assigneeId || 'Unassigned'}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">Due: {task.dueDate || 'N/A'}</p>
              {task.tags?.length ? (
                <p className="text-xs text-amber-700 dark:text-amber-200">Tags: {task.tags.join(', ')}</p>
              ) : (
                <p className="text-xs text-slate-500 dark:text-slate-400">No tags</p>
              )}
            </div>

            <form
              onSubmit={handleUpdate}
              className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/30"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Edit task</h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">listId: {listId}</span>
              </div>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                placeholder="Title"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                placeholder="Description"
              />
              <select
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
              >
                <option value="TODO">TODO</option>
                <option value="DOING">DOING</option>
                <option value="DONE">DONE</option>
              </select>
              <select
                value={form.priority}
                onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
              <button
                type="submit"
                disabled={updating}
                className="w-full rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60"
              >
                {updating ? 'Saving...' : 'Save changes'}
              </button>
            </form>
          </section>

          <section className="space-y-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/30">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Move / Delete</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Board ID: {boardId || 'Unknown'}</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={moveListId}
                onChange={(e) => setMoveListId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white sm:w-auto"
              >
                <option value="">Select list</option>
                {lists.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleMove}
                disabled={moving || lists.length === 0}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 shadow hover:bg-amber-400 disabled:opacity-60"
              >
                {moving ? 'Moving...' : 'Move task'}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 hover:border-rose-500 hover:text-rose-600 dark:border-rose-500 dark:text-rose-200 disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Delete task'}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Moving is limited to lists inside the same board; archived lists are hidden from options.
            </p>
          </section>
        </>
      )}
    </main>
  );
}
