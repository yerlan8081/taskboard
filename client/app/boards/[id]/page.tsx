'use client';

import { useApolloClient, useMutation, useQuery, useSubscription } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BOARD,
  LISTS,
  TASKS,
  TASK_UPDATED_SUB,
  UPDATE_TASK_STATUS,
  CREATE_LIST,
  CREATE_TASK,
  UPDATE_LIST,
  DELETE_LIST,
  UPDATE_TASK,
  MOVE_TASK,
  DELETE_TASK
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
  wipLimit?: number | null;
  isArchived?: boolean | null;
};

type TaskEvent = {
  taskUpdated?: { type: string; task: Task };
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
  const [listEdit, setListEdit] = useState<{ id: string | null; title: string; order: number | ''; color: string; wipLimit: number | ''; isArchived: boolean }>({
    id: null,
    title: '',
    order: '',
    color: '',
    wipLimit: '',
    isArchived: false
  });
  const [taskEdit, setTaskEdit] = useState<{ id: string | null; title: string; status: string; priority: string; listId: string }>({
    id: null,
    title: '',
    status: 'TODO',
    priority: 'MEDIUM',
    listId: ''
  });
  const [pageError, setPageError] = useState<string | null>(null);

  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const stored = localStorage.getItem('taskboard_token');
      if (stored) setToken(stored);
    }
  }, [setToken, token]);

  const handleAuthError = (err: any) => {
    const code = err?.graphQLErrors?.[0]?.extensions?.code;
    if (code === 'UNAUTHENTICATED') {
      clearAuth();
      router.replace('/login');
      return true;
    }
    if (code === 'FORBIDDEN') {
      setForbidden(true);
      return true;
    }
    return false;
  };

  const { data: boardData } = useQuery(BOARD, {
    variables: { id: boardId },
    skip: !boardId || !token,
    onError: handleAuthError
  });

  const {
    data: listsData,
    loading: listsLoading,
    refetch: refetchLists
  } = useQuery<{ lists: List[] }>(LISTS, {
    variables: { boardId },
    skip: !boardId || !token,
    onError: (err) => {
      if (handleAuthError(err)) return;
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

  useSubscription<TaskEvent>(TASK_UPDATED_SUB, {
    variables: { boardId },
    skip: !boardId || !token,
    onData: ({ data }) => {
      const event = data.data?.taskUpdated;
      if (!event) return;
      setLastEvent(`${event.type} ${event.task.title}`);
      setTasksByList((prev) => {
        const next = { ...prev };
        const task = event.task;
        const removeTaskEverywhere = () => {
          Object.keys(next).forEach((lid) => {
            const tasks = next[lid] ?? [];
            const filtered = tasks.filter((t) => t.id !== task.id);
            if (filtered.length !== tasks.length) {
              next[lid] = filtered;
            }
          });
        };

        switch (event.type) {
          case 'CREATED':
          case 'UPDATED': {
            const existing = next[task.listId] ?? [];
            const idx = existing.findIndex((t) => t.id === task.id);
            if (idx >= 0) {
              const updated = [...existing];
              updated[idx] = task;
              next[task.listId] = updated;
            } else {
              next[task.listId] = [...existing, task];
            }
            break;
          }
          case 'DELETED': {
            removeTaskEverywhere();
            break;
          }
          case 'MOVED': {
            removeTaskEverywhere();
            const dest = next[task.listId] ?? [];
            next[task.listId] = [...dest.filter((t) => t.id !== task.id), task];
            break;
          }
          default:
            break;
        }
        return { ...next };
      });
    }
  });

  const [updateTaskStatus] = useMutation(UPDATE_TASK_STATUS, { onError: handleAuthError });
  const [updateTaskMutation] = useMutation(UPDATE_TASK, { onError: handleAuthError });
  const [moveTaskMutation] = useMutation(MOVE_TASK, { onError: handleAuthError });
  const [deleteTaskMutation] = useMutation(DELETE_TASK, { onError: handleAuthError });

  const [createListMutation, { loading: creatingList }] = useMutation(CREATE_LIST, {
    onCompleted: async () => {
      await refetchLists();
      setListTitle('');
    },
    onError: handleAuthError
  });

  const [createTaskMutation, { loading: creatingTask }] = useMutation(CREATE_TASK, {
    onCompleted: async () => {
      setTaskTitle('');
    },
    onError: handleAuthError
  });

  const [updateListMutation] = useMutation(UPDATE_LIST, { onError: handleAuthError });
  const [deleteListMutation] = useMutation(DELETE_LIST, { onError: handleAuthError });

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

  const lists = useMemo(() => listsData?.lists ?? [], [listsData?.lists]);
  useEffect(() => {
    if (boardData?.board?.title) {
      setBoardTitle(boardData.board.title);
    }
  }, [boardData]);

  const startEditList = (list: List) => {
    setListEdit({
      id: list.id,
      title: list.title,
      order: list.order ?? '',
      color: list.color ?? '',
      wipLimit: list.wipLimit ?? '',
      isArchived: list.isArchived ?? false
    });
  };

  const submitEditList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listEdit.id) return;
    if (!listEdit.title.trim()) return;
    await updateListMutation({
      variables: {
        input: {
          id: listEdit.id,
          title: listEdit.title.trim(),
          order: listEdit.order === '' ? null : Number(listEdit.order),
          color: listEdit.color || null,
          wipLimit: listEdit.wipLimit === '' ? null : Number(listEdit.wipLimit)
        }
      }
    });
    await refetchLists();
    setListEdit({ id: null, title: '', order: '', color: '', wipLimit: '', isArchived: false });
  };

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Delete this list and its tasks?')) return;
    await deleteListMutation({ variables: { id: listId } });
    await refetchLists();
    setTasksByList((prev) => {
      const next = { ...prev };
      delete next[listId];
      return next;
    });
  };

  const startEditTask = (task: Task) => {
    setTaskEdit({
      id: task.id,
      title: task.title,
      status: task.status,
      priority: task.priority,
      listId: task.listId
    });
  };

  const submitEditTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskEdit.id) return;
    if (!taskEdit.title.trim()) return;
    await updateTaskMutation({
      variables: {
        input: {
          id: taskEdit.id,
          title: taskEdit.title.trim(),
          status: taskEdit.status,
          priority: taskEdit.priority
        }
      }
    });
    setTaskEdit({ id: null, title: '', status: 'TODO', priority: 'MEDIUM', listId: '' });
  };

  const handleMoveTask = async (taskId: string, toListId: string) => {
    await moveTaskMutation({ variables: { input: { taskId, toListId } } });
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    await deleteTaskMutation({ variables: { id: taskId } });
    setTasksByList((prev) => {
      const next: Record<string, Task[]> = {};
      for (const key of Object.keys(prev)) {
        next[key] = prev[key].filter((t) => t.id !== taskId);
      }
      return next;
    });
  };

  if (!token) {
    return (
      <main className="w-full max-w-3xl space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 px-8 py-10 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
        <p className="text-sm text-slate-700 dark:text-slate-300">Please login to view this board.</p>
        <Link className="text-amber-300 hover:text-amber-200" href="/login">
          Go to login
        </Link>
      </main>
    );
  }

  return (
    <main className="w-full max-w-5xl space-y-6 rounded-3xl border border-slate-200/80 bg-white/90 px-6 py-8 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-slate-900/70 dark:text-slate-100">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-amber-500 dark:text-amber-300">Board Detail</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{boardTitle || 'Board'}</h1>
          <p className="break-all text-xs text-slate-600 dark:text-slate-400">ID: {boardId}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/boards"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-amber-600 hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-amber-200"
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
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-slate-200"
          >
            Logout
          </button>
        </div>
      </header>

      {forbidden && (
        <div className="rounded-xl border border-red-500/40 bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/40 dark:text-red-100">
          You do not have access to this board (FORBIDDEN).
        </div>
      )}
      {pageError && <div className="text-sm text-red-600 dark:text-red-300">{pageError}</div>}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-slate-700 dark:text-slate-300">Subscription status</label>
          <div className="rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm text-slate-800 dark:border-white/10 dark:bg-black/30 dark:text-slate-200">
            {token && boardId ? 'Listening for taskUpdated events...' : 'Disconnected'}
          </div>
          {lastEvent ? (
            <p className="text-xs text-amber-600 dark:text-amber-300">Last event: {lastEvent}</p>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-500">Waiting for events</p>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/30">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Create List</p>
            <button
              onClick={() => setShowCreatePanels((v) => !v)}
              className="text-xs text-amber-600 hover:text-amber-500 dark:text-amber-300 dark:hover:text-amber-200"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
              />
              <input
                type="number"
                value={listOrder}
                onChange={(e) => setListOrder(Number(e.target.value))}
                placeholder="Order"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
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

        <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-black/30">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Create Task</p>
            <button
              onClick={() => setShowCreatePanels((v) => !v)}
              className="text-xs text-amber-600 hover:text-amber-500 dark:text-amber-300 dark:hover:text-amber-200"
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
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
              />
              <select
                value={taskListId}
                onChange={(e) => setTaskListId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
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
              {lists.length === 0 && <p className="text-xs text-slate-600 dark:text-slate-500">Create a list first.</p>}
            </>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Lists</h2>
          {listsLoading && <span className="text-xs text-slate-500 dark:text-slate-400">Loading lists...</span>}
        </div>
        {lists.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-400">No lists yet. Create one via GraphQL and reload.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {lists
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((list) => (
                <div key={list.id} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{list.title}</p>
                    </div>
                    <span className="text-xs text-slate-600 dark:text-slate-400">#{list.order}</span>
                  </div>
                  <div className="mt-2 flex gap-2 text-xs">
                    <button
                      onClick={() => startEditList(list)}
                      className="rounded border border-slate-300 px-2 py-1 text-slate-700 hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteList(list.id)}
                      className="rounded border border-rose-300 px-2 py-1 text-rose-700 hover:border-rose-500 hover:text-rose-600 dark:border-rose-500 dark:text-rose-200"
                    >
                      Delete
                    </button>
                  </div>
                  {listEdit.id === list.id && (
                    <form onSubmit={submitEditList} className="mt-2 space-y-2 rounded-xl border border-slate-200/80 p-3 text-sm dark:border-white/10">
                      <input
                        value={listEdit.title}
                        onChange={(e) => setListEdit((prev) => ({ ...prev, title: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                        placeholder="Title"
                      />
                      <input
                        type="number"
                        value={listEdit.order}
                        onChange={(e) => setListEdit((prev) => ({ ...prev, order: e.target.value === '' ? '' : Number(e.target.value) }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                        placeholder="Order"
                      />
                      <input
                        value={listEdit.color}
                        onChange={(e) => setListEdit((prev) => ({ ...prev, color: e.target.value }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                        placeholder="Color"
                      />
                      <input
                        type="number"
                        value={listEdit.wipLimit}
                        onChange={(e) => setListEdit((prev) => ({ ...prev, wipLimit: e.target.value === '' ? '' : Number(e.target.value) }))}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                        placeholder="WIP Limit"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-slate-900 shadow hover:bg-amber-400"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setListEdit({ id: null, title: '', order: '', color: '', wipLimit: '', isArchived: false })}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-700 hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                  <div className="mt-3 space-y-2">
                    {(tasksByList[list.id] ?? []).map((task) => (
                      <div
                        key={task.id}
                        className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-white/5 dark:bg-slate-800/60 dark:text-white"
                      >
                        <div className="flex items-center justify-between">
                          <span>{task.title}</span>
                          <span className="rounded bg-slate-200 px-2 py-0.5 text-xs uppercase tracking-wide text-amber-700 dark:bg-slate-700 dark:text-amber-200">
                            {task.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Priority: {task.priority}</p>
                        <div className="flex gap-2 text-xs flex-wrap">
                          {['TODO', 'DOING', 'DONE'].map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(task.id, status)}
                              className={`rounded px-2 py-1 ${
                                task.status === status
                                  ? 'bg-amber-500 text-slate-900'
                                  : 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200'
                              }`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                          <button
                            onClick={() => startEditTask(task)}
                            className="rounded border border-slate-300 px-2 py-1 text-slate-700 hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-slate-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setTaskEdit({ id: task.id, title: task.title, status: task.status, priority: task.priority, listId: '' })}
                            className="rounded border border-slate-300 px-2 py-1 text-slate-700 hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-slate-200"
                          >
                            Move...
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="rounded border border-rose-300 px-2 py-1 text-rose-700 hover:border-rose-500 hover:text-rose-600 dark:border-rose-500 dark:text-rose-200"
                          >
                            Delete
                          </button>
                        </div>
                        {taskEdit.id === task.id && (
                          <form onSubmit={submitEditTask} className="mt-2 space-y-2 rounded border border-slate-200/80 p-2 text-xs dark:border-white/10">
                            <input
                              value={taskEdit.title}
                              onChange={(e) => setTaskEdit((prev) => ({ ...prev, title: e.target.value }))}
                              className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                              placeholder="Title"
                            />
                            <select
                              value={taskEdit.status}
                              onChange={(e) => setTaskEdit((prev) => ({ ...prev, status: e.target.value }))}
                              className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                            >
                              <option value="TODO">TODO</option>
                              <option value="DOING">DOING</option>
                              <option value="DONE">DONE</option>
                            </select>
                            <select
                              value={taskEdit.priority}
                              onChange={(e) => setTaskEdit((prev) => ({ ...prev, priority: e.target.value }))}
                              className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                            >
                              <option value="LOW">LOW</option>
                              <option value="MEDIUM">MEDIUM</option>
                              <option value="HIGH">HIGH</option>
                            </select>
                            <select
                              value={taskEdit.listId}
                              onChange={(e) => setTaskEdit((prev) => ({ ...prev, listId: e.target.value }))}
                              className="w-full rounded border border-slate-300 bg-white px-2 py-1 text-slate-900 focus:border-amber-400 focus:outline-none dark:border-white/10 dark:bg-slate-800/60 dark:text-white"
                            >
                              <option value="">Keep list</option>
                              {lists.map((l) => (
                                <option key={l.id} value={l.id}>
                                  {l.title}
                                </option>
                              ))}
                            </select>
                            <div className="flex gap-2">
                              <button type="submit" className="rounded bg-amber-500 px-3 py-1 font-semibold text-slate-900">
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setTaskEdit({ id: null, title: '', status: 'TODO', priority: 'MEDIUM', listId: '' })}
                                className="rounded border border-slate-300 px-3 py-1 text-slate-700 dark:border-white/20 dark:text-slate-200"
                              >
                                Cancel
                              </button>
                              {taskEdit.listId && (
                                <button
                                  type="button"
                                  onClick={() => handleMoveTask(task.id, taskEdit.listId)}
                                  className="rounded border border-slate-300 px-3 py-1 text-slate-700 hover:border-amber-400 hover:text-amber-600 dark:border-white/20 dark:text-slate-200"
                                >
                                  Move
                                </button>
                              )}
                            </div>
                          </form>
                        )}
                        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                          Move to:
                          <select
                            className="ml-2 rounded border border-slate-300 bg-white px-2 py-1 dark:border-white/20 dark:bg-slate-800 dark:text-white"
                            onChange={(e) => handleMoveTask(task.id, e.target.value)}
                            value=""
                          >
                            <option value="">Select list</option>
                            {lists.map((l) => (
                              <option key={l.id} value={l.id}>
                                {l.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))}
                    {(tasksByList[list.id] ?? []).length === 0 && (
                      <p className="text-xs text-slate-600 dark:text-slate-500">No tasks yet.</p>
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
