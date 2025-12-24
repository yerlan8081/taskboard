import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { createServer, type Server } from 'http';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { GraphQLContext } from './types';
import { getUserIdFromAuthHeader } from './auth';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { getUserIdFromConnectionParams } from './subscriptions';
import { unauthenticatedError } from './errors';

type CreateAppOptions = {
  enableSubscriptions?: boolean;
};

export async function createApp(options: CreateAppOptions = {}) {
  const app = express();
  app.use(cors());

  app.get('/health', (_req, res) => {
    res.status(200).send('ok');
  });

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers
  });

  const httpServer: Server = createServer(app);

  let wsCleanup: (() => Promise<void>) | undefined;

  if (options.enableSubscriptions) {
    const wsServer = new WebSocketServer({
      server: httpServer,
      path: '/graphql'
    });

    const serverCleanup = useServer(
      {
        schema,
        context: async (ctx): Promise<GraphQLContext> => {
          const userId =
            getUserIdFromConnectionParams(ctx.connectionParams) ||
            getUserIdFromAuthHeader(ctx.extra.request.headers.authorization);
          if (!userId) {
            throw unauthenticatedError();
          }
          return { userId };
        }
      },
      wsServer
    );

    wsCleanup = async () => {
      await serverCleanup.dispose();
    };
  }

  const apolloServer = new ApolloServer<GraphQLContext>({
    schema,
    plugins:
      options.enableSubscriptions && wsCleanup
        ? [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
              async serverWillStart() {
                return {
                  async drainServer() {
                    await wsCleanup?.();
                  }
                };
              }
            }
          ]
        : []
  });

  await apolloServer.start();

  app.use(
    '/graphql',
    json(),
    expressMiddleware(apolloServer, {
      context: async ({ req }) => {
        const userId = getUserIdFromAuthHeader(req.headers.authorization);
        return { userId };
      }
    })
  );

  return { app, httpServer, apolloServer, schema, wsCleanup };
}
