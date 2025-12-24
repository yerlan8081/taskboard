import type { Express } from 'express';
import { createTestServer, gqlRequest } from '../helpers/server';

const REGISTER = `mutation Register($input: RegisterInput!) {
  register(input: $input) { token user { id email } }
}`;

const CREATE_BOARD = `mutation CreateBoard($input: CreateBoardInput!) {
  createBoard(input: $input) { id title }
}`;

const CREATE_LIST = `mutation CreateList($input: CreateListInput!) {
  createList(input: $input) { id title order }
}`;

const CREATE_TASK = `mutation CreateTask($input: CreateTaskInput!) {
  createTask(input: $input) { id title status }
}`;

const UPDATE_TASK_STATUS = `mutation UpdateTaskStatus($id: ID!, $status: TaskStatus!) {
  updateTaskStatus(id: $id, status: $status) { id status title }
}`;

const TASK = `query Task($id: ID!) { task(id: $id) { id title status listId } }`;

describe('GraphQL integration flow', () => {
  let app: Express;
  let token: string;
  let stop: () => Promise<void>;

  beforeAll(async () => {
    const server = await createTestServer();
    app = server.app;
    stop = server.stop;

    const registerRes = await gqlRequest(app, REGISTER, {
      input: { email: 'int@example.com', password: 'password', name: 'Integration' }
    });
    token = registerRes.body.data.register.token;
  });

  afterAll(async () => {
    await stop();
  });

  it('creates board, list, task and updates status', async () => {
    const boardRes = await gqlRequest(
      app,
      CREATE_BOARD,
      { input: { title: 'Integration Board', visibility: 'PRIVATE' } },
      token
    );
    const boardId = boardRes.body.data.createBoard.id;
    expect(boardId).toBeTruthy();

    const listRes = await gqlRequest(
      app,
      CREATE_LIST,
      { input: { boardId, title: 'Sprint', order: 10 } },
      token
    );
    const listId = listRes.body.data.createList.id;
    expect(listRes.body.data.createList.title).toBe('Sprint');

    const taskRes = await gqlRequest(
      app,
      CREATE_TASK,
      { input: { listId, title: 'Integration task' } },
      token
    );
    const taskId = taskRes.body.data.createTask.id;
    expect(taskRes.body.data.createTask.status).toBe('TODO');

    const updateRes = await gqlRequest(app, UPDATE_TASK_STATUS, { id: taskId, status: 'DOING' }, token);
    expect(updateRes.body.data.updateTaskStatus.status).toBe('DOING');

    const fetchRes = await gqlRequest(app, TASK, { id: taskId }, token);
    expect(fetchRes.body.data.task.status).toBe('DOING');
    expect(fetchRes.body.data.task.listId).toBe(listId);
  });
});
