import type { Express } from 'express';
import { createTestServer, gqlRequest } from '../helpers/server';

const REGISTER = `mutation Register($input: RegisterInput!) {
  register(input: $input) { token user { id } }
}`;

const CREATE_BOARD = `mutation CreateBoard($input: CreateBoardInput!) {
  createBoard(input: $input) { id title }
}`;

const LISTS = `query Lists($boardId: ID!) { lists(boardId: $boardId) { id title } }`;

const CREATE_TASK = `mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) { id title status }
}`;

const UPDATE_TASK_STATUS = `mutation UpdateTaskStatus($id: ID!, $status: TaskStatus!) {
  updateTaskStatus(id: $id, status: $status) { id status }
}`;

describe('input validation', () => {
  let app: Express;
  let token: string;
  let boardId: string;
  let listId: string;
  let taskId: string;
  let stop: () => Promise<void>;

  beforeAll(async () => {
    const server = await createTestServer();
    app = server.app;
    stop = server.stop;

    const registerRes = await gqlRequest(app, REGISTER, {
      input: { email: 'val@example.com', password: 'password', name: 'Validator' }
    });
    token = registerRes.body.data.register.token;

    const boardRes = await gqlRequest(
      app,
      CREATE_BOARD,
      { input: { title: 'Validation Board', visibility: 'PRIVATE' } },
      token
    );
    boardId = boardRes.body.data.createBoard.id;

    const listsRes = await gqlRequest(app, LISTS, { boardId }, token);
    listId = listsRes.body.data.lists[0].id;

    const taskRes = await gqlRequest(
      app,
      CREATE_TASK,
      { input: { listId, title: 'Initial task' } },
      token
    );
    taskId = taskRes.body.data.createTask.id;
  });

  afterAll(async () => {
    await stop();
  });

  it('rejects empty title when creating board', async () => {
    const res = await gqlRequest(app, CREATE_BOARD, { input: { title: '   ' } }, token);
    expect(res.body.errors?.[0].extensions?.code).toBe('BAD_USER_INPUT');
  });

  it('rejects invalid status value in updateTaskStatus', async () => {
    const res = await gqlRequest(app, UPDATE_TASK_STATUS, { id: taskId, status: 'INVALID' as never }, token);
    expect(res.body.errors?.[0].message).toContain('TaskStatus');
  });

  it('rejects empty title when creating task', async () => {
    const res = await gqlRequest(
      app,
      CREATE_TASK,
      { input: { listId, title: '   ' } },
      token
    );
    expect(res.body.errors?.[0].extensions?.code).toBe('BAD_USER_INPUT');
  });
});
