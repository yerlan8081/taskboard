import { getUserIdFromAuthHeader } from './auth';

export function getUserIdFromConnectionParams(params: unknown): string | null {
  if (!params || typeof params !== 'object') {
    return null;
  }
  const record = params as Record<string, unknown>;
  const auth =
    (typeof record.Authorization === 'string' && record.Authorization) ||
    (typeof record.authorization === 'string' && record.authorization);
  if (typeof auth === 'string') {
    return getUserIdFromAuthHeader(auth);
  }
  return null;
}

export function taskUpdatedTopic(boardId: string) {
  return `taskUpdated:${boardId}`;
}
