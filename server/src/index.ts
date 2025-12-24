import 'dotenv/config';
import { connectToDatabase } from './db';
import { createApp } from './app';

async function startServer() {
  await connectToDatabase();

  const { app, httpServer } = await createApp({ enableSubscriptions: true });

  const port = Number(process.env.PORT) || 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port }, resolve));
  console.log(`Server ready at http://localhost:${port}/graphql`);
}

startServer().catch((error) => {
  console.error('Failed to start server', error);
  process.exit(1);
});
