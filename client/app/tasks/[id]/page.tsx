'use client';

import { gql, useQuery } from '@apollo/client';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect } from 'react';
import { useAuthStore } from '../../../store/auth';

const TASK_QUERY = gql`
  query Task($id: ID!) {
    task(id: $id) {
      id
      listId
      title
      description
      status
      priority
      tags
    }
  }
`;

export default function TaskDetailPage() {
  const params = useParams();
  const taskId = Array.isArray(params?.id) ? params?.id[0] : params?.id?.toString() ?? '';
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);

  useEffect(() => {
    if (!token && typeof window !== 'undefined') {
      const stored = localStorage.getItem('taskboard_token');
      if (stored) setToken(stored);
    }
  }, [setToken, token]);

  const { data, loading } = useQuery<{
    task: {
      id: string;
      listId: string;
      title: string;
      description?: string;
      status: string;
      priority: string;
      tags: string[];
      assigneeId?: string | null;
      dueDate?: string | null;
    };
  }>(
    TASK_QUERY,
    { variables: { id: taskId }, skip: !token || !taskId }
  );

  if (!token) {
    return (
      <main className="w-full max-w-3xl space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-10 shadow-2xl backdrop-blur">
        <p className="text-sm text-slate-300">Please login to view task details.</p>
        <Link className="text-amber-300 hover:text-amber-200" href="/login">
          Go to login
        </Link>
      </main>
    );
  }

  const task = data?.task;

  return (
    <main className="w-full max-w-3xl space-y-4 rounded-3xl border border-white/10 bg-slate-900/70 px-8 py-10 shadow-2xl backdrop-blur">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.35em] text-amber-300">Task</p>
        <h1 className="text-3xl font-semibold text-white">{task ? task.title : 'Task'}</h1>
        <p className="text-sm text-slate-400">ID: {taskId}</p>
      </header>

      {loading && <p className="text-sm text-slate-400">Loading...</p>}
      {!loading && !task && <p className="text-sm text-slate-400">Task not found.</p>}
      {task && (
        <div className="space-y-2 rounded-2xl border border-white/10 bg-black/30 p-4">
          <p className="text-sm text-slate-200">{task.description || 'No description'}</p>
          <p className="text-xs text-slate-400">Status: {task.status}</p>
          <p className="text-xs text-slate-400">Priority: {task.priority}</p>
          <p className="text-xs text-slate-400">Assignee: {task.assigneeId || 'Unassigned'}</p>
          <p className="text-xs text-slate-400">Due: {task.dueDate || 'N/A'}</p>
          {task.tags?.length ? <p className="text-xs text-amber-200">Tags: {task.tags.join(', ')}</p> : null}
          <p className="text-xs text-slate-500">List: {task.listId}</p>
        </div>
      )}

      <div className="text-sm text-slate-400">
        <Link href="/boards" className="text-amber-300 hover:text-amber-200">
          Back to boards
        </Link>
      </div>
    </main>
  );
}
