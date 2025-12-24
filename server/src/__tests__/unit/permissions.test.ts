import type { Express } from 'express';
import { createTestServer, gqlRequest } from '../helpers/server';

const REGISTER = `mutation Register($input: RegisterInput!) {
  register(input: $input) { token user { id email } }
}`;

const CREATE_BOARD = `mutation CreateBoard($input: CreateBoardInput!) {
  createBoard(input: $input) { id title }
}`;

const LISTS = `query Lists($boardId: ID!) {
  lists(boardId: $boardId) { id title }
}`;

const CREATE_TASK = `mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) { id title status }
}`;

const UPDATE_TASK_STATUS = `mutation UpdateTaskStatus($id: ID!, $status: TaskStatus!) {
  updateTaskStatus(id: $id, status: $status) { id status }
}`;

describe('permissions enforcement', () => {
  let ownerToken: string;
  let otherToken: string;
  let boardId: string;
  let listId: string;
  let taskId: string;
  let stop: () => Promise<void>;
  let app: Express;

  beforeAll(async () => {
    const server = await createTestServer();
    app = server.app;
    stop = server.stop;

    const ownerRes = await gqlRequest(app, REGISTER, {
      input: { email: 'a@example.com', password: 'password', name: 'Owner' }
    });
    ownerToken = ownerRes.body.data.register.token;

    const otherRes = await gqlRequest(app, REGISTER, {
      input: { email: 'b@example.com', password: 'password', name: 'Other' }
    });
    otherToken = otherRes.body.data.register.token;

    const boardRes = await gqlRequest(
      app,
      CREATE_BOARD,
      { input: { title: 'Board 1', visibility: 'PRIVATE' } },
      ownerToken
    );
    boardId = boardRes.body.data.createBoard.id;

    const listsRes = await gqlRequest(app, LISTS, { boardId }, ownerToken);
    listId = listsRes.body.data.lists[0].id;

    const taskRes = await gqlRequest(
      app,
      CREATE_TASK,
      { input: { listId, title: 'Task by owner' } },
      ownerToken
    );
    taskId = taskRes.body.data.createTask.id;
  });

  afterAll(async () => {
    await stop();
  });

  it('blocks non-owner from creating list', async () => {
    const res = await gqlRequest(
      app,
      `mutation CreateList($input: CreateListInput!) {
        createList(input: $input) { id }
      }`,
      { input: { boardId, title: 'X', order: 99 } },
      otherToken
    );

    expect(res.body.errors?.[0].extensions?.code).toBe('FORBIDDEN');
  });

  it('blocks non-owner from creating task', async () => {
    const res = await gqlRequest(
      app,
      CREATE_TASK,
      { input: { listId, title: 'Task by other' } },
      otherToken
    );

    expect(res.body.errors?.[0].extensions?.code).toBe('FORBIDDEN');
  });

  it('blocks non-owner from updating task status', async () => {
    const res = await gqlRequest(app, UPDATE_TASK_STATUS, { id: taskId, status: 'DONE' }, otherToken);
    expect(res.body.errors?.[0].extensions?.code).toBe('FORBIDDEN');
  });
});
