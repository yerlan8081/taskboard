import request, { type SuperTest, type Test } from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Express } from 'express';
import { createApp } from '../../app';
import { connectToDatabase, disconnectFromDatabase, dropDatabase } from '../../db';

export type TestServer = {
  app: Express;
  mongo: MongoMemoryServer;
  stop: () => Promise<void>;
};

export async function createTestServer(): Promise<TestServer> {
  const mongo = await MongoMemoryServer.create();
  await connectToDatabase(mongo.getUri());

  const { app, httpServer } = await createApp({ enableSubscriptions: false });

  const stop = async () => {
    await dropDatabase();
    await disconnectFromDatabase();
    await mongo.stop();
    httpServer.close();
  };

  return { app, mongo, stop };
}

export function authHeader(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function gqlRequest(app: Express, query: string, variables?: Record<string, unknown>, token?: string) {
  const agent: SuperTest<Test> = request(app);
  const req = agent
    .post('/graphql')
    .set('Accept', 'application/json')
    .send({ query, variables });
  if (token) {
    req.set('Authorization', `Bearer ${token}`);
  }
  return req;
}
