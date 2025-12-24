import type { Express } from 'express';
import { createTestServer, gqlRequest } from '../helpers/server';

const REGISTER = `mutation Register($input: RegisterInput!) {
  register(input: $input) { token user { id email } }
}`;

const ME = `query Me { me { id email name } }`;

const BOARDS = `query Boards { boards { id title } }`;

describe('resolver smoke tests', () => {
  let app: Express;
  let token: string;
  let stop: () => Promise<void>;

  beforeAll(async () => {
    const server = await createTestServer();
    app = server.app;
    stop = server.stop;

    const registerRes = await gqlRequest(app, REGISTER, {
      input: { email: 'smoke@example.com', password: 'password', name: 'Smoke' }
    });
    token = registerRes.body.data.register.token;
  });

  afterAll(async () => {
    await stop();
  });

  it('returns UNAUTHENTICATED for me without token', async () => {
    const res = await gqlRequest(app, ME);
    expect(res.body.errors?.[0].extensions?.code).toBe('UNAUTHENTICATED');
  });

  it('returns current user for me with token', async () => {
    const res = await gqlRequest(app, ME, undefined, token);
    expect(res.body.data.me.email).toBe('smoke@example.com');
  });

  it('returns boards array for authenticated user', async () => {
    const res = await gqlRequest(app, BOARDS, undefined, token);
    expect(Array.isArray(res.body.data.boards)).toBe(true);
  });
});
