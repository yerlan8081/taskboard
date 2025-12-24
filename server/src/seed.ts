import 'dotenv/config';
import { Types } from 'mongoose';
import { connectToDatabase, disconnectFromDatabase } from './db';
import { hashPassword } from './auth';
import { UserModel } from './models/user';
import { BoardModel } from './models/board';
import { ListModel } from './models/list';
import { TaskModel } from './models/task';

async function seed() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskboard';
  process.env.MONGO_URI = mongoUri;
  await connectToDatabase(mongoUri);

  const demoEmail = 'demo@example.com';
  const demoPassword = 'Passw0rd!';
  const demoName = 'Demo User';
  const boardTitle = 'Realtime Demo Board';

  const existingUser = await UserModel.findOne({ email: demoEmail });
  if (existingUser) {
    const existingBoards = await BoardModel.find({ ownerId: existingUser._id, title: boardTitle });
    const boardIds = existingBoards.map((b) => b._id);
    if (boardIds.length) {
      const lists = await ListModel.find({ boardId: { $in: boardIds } });
      const listIds = lists.map((l) => l._id);
      if (listIds.length) {
        await TaskModel.deleteMany({ listId: { $in: listIds } });
      }
      await ListModel.deleteMany({ boardId: { $in: boardIds } });
      await BoardModel.deleteMany({ _id: { $in: boardIds } });
    }
    await UserModel.deleteOne({ _id: existingUser._id });
  }

  const passwordHash = await hashPassword(demoPassword);
  const user = await UserModel.create({
    email: demoEmail,
    passwordHash,
    name: demoName,
    role: 'USER',
    status: 'ACTIVE'
  });

  const board = await BoardModel.create({
    title: boardTitle,
    visibility: 'PRIVATE',
    ownerId: user._id
  });

  const lists = await ListModel.insertMany([
    { boardId: board._id, title: '今天', order: 1 },
    { boardId: board._id, title: '本周', order: 2 },
    { boardId: board._id, title: '稍后', order: 3 }
  ]);

  const listByTitle: Record<string, Types.ObjectId> = {};
  lists.forEach((l) => {
    listByTitle[l.title] = l._id;
  });

  const tasks = [
    { listTitle: '今天', title: '配置 Apollo Client', status: 'TODO', priority: 'HIGH' },
    { listTitle: '今天', title: '撰写 README 演示步骤', status: 'DOING', priority: 'MEDIUM' },
    { listTitle: '本周', title: '完善 Dashboard 列表数量', status: 'TODO', priority: 'LOW' },
    { listTitle: '本周', title: '修复权限提示文案', status: 'DONE', priority: 'MEDIUM' },
    { listTitle: '稍后', title: '打包 Docker 镜像', status: 'TODO', priority: 'HIGH' }
  ] as const;

  await TaskModel.insertMany(
    tasks.map((task) => ({
      listId: listByTitle[task.listTitle],
      title: task.title,
      status: task.status,
      priority: task.priority,
      tags: ['demo']
    }))
  );

  console.log('Seed completed.');
  console.log(`Demo user: ${demoEmail} / ${demoPassword}`);
  console.log(`Board title: ${boardTitle}`);
  console.log('Open: http://localhost:3000/login (use demo user), then /boards or /dashboard');
  console.log('GraphQL Playground: http://localhost:4000/graphql');
}

seed()
  .catch((err) => {
    console.error('Seed failed', err);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectFromDatabase();
  });
