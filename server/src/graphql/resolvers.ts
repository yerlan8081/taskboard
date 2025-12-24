import { GraphQLError } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { Types } from 'mongoose';
import { createToken, getUserIdFromAuthHeader, hashPassword, verifyPassword } from '../auth';
import { badUserInputError, forbiddenError, unauthenticatedError } from '../errors';
import { GraphQLContext } from '../types';
import { BoardModel, type BoardDocument } from '../models/board';
import { ListModel, type ListDocument } from '../models/list';
import { TaskModel, type TaskDocument, type TaskPriority, type TaskStatus } from '../models/task';
import { UserModel, type UserDocument } from '../models/user';
import { taskUpdatedTopic } from '../subscriptions';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    hello: () => 'Hello from Taskboard',
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuthenticatedUser(context);
      const user = await UserModel.findById(userId);
      if (!user) {
        throw unauthenticatedError();
      }
      return toUserOutput(user);
    },
    boards: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const userId = requireAuthenticatedUser(context);
      const boards = await BoardModel.find({ ownerId: userId, isArchived: { $in: [false, null] } });
      return boards.map(toBoardOutput);
    },
    board: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const userId = requireAuthenticatedUser(context);
      const board = await BoardModel.findById(args.id);
      if (!board) {
        return null;
      }
      ensureBoardOwnership(board, userId);
      return toBoardOutput(board);
    },
    lists: async (_parent: unknown, args: { boardId: string }, context: GraphQLContext) => {
      const userId = requireAuthenticatedUser(context);
      await requireBoardOwner(args.boardId, userId);
      const lists = await ListModel.find({ boardId: args.boardId });
      return lists.map(toListOutput);
    },
    tasks: async (_parent: unknown, args: { listId: string }, context: GraphQLContext) => {
      const userId = requireAuthenticatedUser(context);
      await requireBoardOwnershipFromList(args.listId, userId);
      const tasks = await TaskModel.find({ listId: args.listId });
      return tasks.map(toTaskOutput);
    },
    task: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const userId = requireAuthenticatedUser(context);
      const task = await TaskModel.findById(args.id);
      if (!task) {
        return null;
      }
      await requireBoardOwnershipFromTask(task, userId);
      return toTaskOutput(task);
    }
  },
  Mutation: {
    register: async (
      _parent: unknown,
      args: { input: { email: string; password: string; name: string; avatarUrl?: string } }
    ) => {
      const email = args.input.email.trim().toLowerCase();
      const name = args.input.name.trim();

      const existing = await UserModel.findOne({ email });
      if (existing) {
        throw badUserInputError('Email already registered');
      }

      const passwordHash = await hashPassword(args.input.password);
      const user = await UserModel.create({
        email,
        passwordHash,
        name,
        avatarUrl: args.input.avatarUrl
      });

      const token = createToken(user.id);
      return { token, user: toUserOutput(user) };
    },
    login: async (_parent: unknown, args: { input: { email: string; password: string } }) => {
      const email = args.input.email.trim().toLowerCase();
      const user = await UserModel.findOne({ email });
      if (!user) {
        throw unauthenticatedError();
      }

      const isValid = await verifyPassword(args.input.password, user.passwordHash);
      if (!isValid) {
        throw unauthenticatedError();
      }

      const token = createToken(user.id);
      return { token, user: toUserOutput(user) };
    },
    createBoard: async (
      _parent: unknown,
      args: { input: { title: string; description?: string; visibility?: 'PRIVATE' | 'PUBLIC'; cover?: string } },
      context: GraphQLContext
    ) => {
      const userId = requireAuthenticatedUser(context);
      const title = args.input.title.trim();
      if (!title) {
        throw badUserInputError('Title is required');
      }

      const board = await BoardModel.create({
        title,
        description: args.input.description,
        visibility: args.input.visibility ?? 'PRIVATE',
        cover: args.input.cover,
        ownerId: new Types.ObjectId(userId)
      });

      const defaultLists = [
        { title: '今天', order: 1 },
        { title: '本周', order: 2 },
        { title: '稍后', order: 3 }
      ];
      await ListModel.insertMany(
        defaultLists.map((l) => ({
          boardId: board._id,
          title: l.title,
          order: l.order
        }))
      );

      return toBoardOutput(board);
    },
    createList: async (
      _parent: unknown,
      args: { input: { boardId: string; title: string; order: number; color?: string; wipLimit?: number } },
      context: GraphQLContext
    ) => {
      const userId = requireAuthenticatedUser(context);
      await requireBoardOwner(args.input.boardId, userId);

      const title = args.input.title.trim();
      if (!title) {
        throw badUserInputError('Title is required');
      }

      if (typeof args.input.order !== 'number') {
        throw badUserInputError('Order is required');
      }

      const list = await ListModel.create({
        boardId: new Types.ObjectId(args.input.boardId),
        title,
        order: args.input.order,
        color: args.input.color,
        wipLimit: args.input.wipLimit
      });

      return toListOutput(list);
    },
    createTask: async (
      _parent: unknown,
      args: {
        input: {
          listId: string;
          title: string;
          description?: string;
          assigneeId?: string;
          priority?: TaskPriority;
          status?: TaskStatus;
          dueDate?: string;
          tags?: string[];
        };
      },
      context: GraphQLContext
    ) => {
      const userId = requireAuthenticatedUser(context);
      const { board } = await requireBoardOwnershipFromList(args.input.listId, userId);

      const title = args.input.title.trim();
      if (!title) {
        throw badUserInputError('Title is required');
      }

      const dueDate = parseOptionalDate(args.input.dueDate);

      const task = await TaskModel.create({
        listId: new Types.ObjectId(args.input.listId),
        title,
        description: args.input.description,
        assigneeId: args.input.assigneeId ? new Types.ObjectId(args.input.assigneeId) : undefined,
        priority: args.input.priority ?? 'MEDIUM',
        status: args.input.status ?? 'TODO',
        dueDate,
        tags: args.input.tags ?? []
      });

      const taskOutput = toTaskOutput(task);
      await pubsub.publish(taskUpdatedTopic(String(board.id)), {
        taskUpdated: { type: 'CREATED', task: taskOutput }
      });

      return taskOutput;
    },
    updateTask: async (
      _parent: unknown,
      args: {
        input: {
          id: string;
          title?: string;
          description?: string;
          assigneeId?: string;
          priority?: TaskPriority;
          status?: TaskStatus;
          dueDate?: string;
          tags?: string[];
        };
      },
      context: GraphQLContext
    ) => {
      const userId = requireAuthenticatedUser(context);
      const task = await TaskModel.findById(args.input.id);
      if (!task) {
        throw badUserInputError('Task not found');
      }
      const board = await requireBoardOwnershipFromTask(task, userId);

      if (args.input.title !== undefined) {
        const title = args.input.title.trim();
        if (!title) {
          throw badUserInputError('Title is required');
        }
        task.title = title;
      }

      if (args.input.description !== undefined) {
        task.description = args.input.description;
      }
      if (args.input.assigneeId !== undefined) {
        task.assigneeId = args.input.assigneeId ? new Types.ObjectId(args.input.assigneeId) : undefined;
      }
      if (args.input.priority !== undefined) {
        task.priority = args.input.priority;
      }
      if (args.input.status !== undefined) {
        task.status = args.input.status;
      }
      if (args.input.dueDate !== undefined) {
        task.dueDate = parseOptionalDate(args.input.dueDate);
      }
      if (args.input.tags !== undefined) {
        task.tags = args.input.tags;
      }

      await task.save();
      const taskOutput = toTaskOutput(task);
      await pubsub.publish(taskUpdatedTopic(String(board.id)), {
        taskUpdated: { type: 'UPDATED', task: taskOutput }
      });
      return taskOutput;
    },
    updateTaskStatus: async (_parent: unknown, args: { id: string; status: TaskStatus }, context: GraphQLContext) => {
      const userId = requireAuthenticatedUser(context);
      const task = await TaskModel.findById(args.id);
      if (!task) {
        throw badUserInputError('Task not found');
      }

      const board = await requireBoardOwnershipFromTask(task, userId);
      task.status = args.status;
      await task.save();
      const taskOutput = toTaskOutput(task);
      await pubsub.publish(taskUpdatedTopic(String(board.id)), {
        taskUpdated: { type: 'UPDATED', task: taskOutput }
      });
      return taskOutput;
    }
  },
  Subscription: {
    taskUpdated: {
      subscribe: (_parent: unknown, args: { boardId: string }, context: GraphQLContext) => {
        requireAuthenticatedUser(context);
        const iteratorFactory = (pubsub as unknown as { asyncIterator?: (arg: string) => AsyncIterator<unknown> }).asyncIterator;
        if (iteratorFactory) {
          return iteratorFactory.call(pubsub, taskUpdatedTopic(args.boardId));
        }
        return (pubsub as unknown as { asyncIterableIterator: (arg: string) => AsyncIterator<unknown> }).asyncIterableIterator(
          taskUpdatedTopic(args.boardId)
        );
      }
    }
  }
};

export function toUserOutput(user: UserDocument) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
    avatarUrl: user.avatarUrl ?? null
  };
}

export function toBoardOutput(board: BoardDocument) {
  return {
    id: board.id,
    title: board.title,
    description: board.description ?? null,
    ownerId: String(board.ownerId),
    visibility: board.visibility,
    cover: board.cover ?? null,
    isArchived: board.isArchived ?? false
  };
}

export function toListOutput(list: ListDocument) {
  return {
    id: list.id,
    boardId: String(list.boardId),
    title: list.title,
    order: list.order,
    color: list.color ?? null,
    isArchived: list.isArchived ?? false,
    wipLimit: list.wipLimit ?? null
  };
}

export function toTaskOutput(task: TaskDocument) {
  return {
    id: task.id,
    listId: String(task.listId),
    title: task.title,
    description: task.description ?? null,
    assigneeId: task.assigneeId ? String(task.assigneeId) : null,
    priority: task.priority,
    status: task.status,
    dueDate: task.dueDate ? task.dueDate.toISOString() : null,
    tags: task.tags ?? []
  };
}

export function requireAuthenticatedUser(context: GraphQLContext): string {
  if (!context.userId) {
    throw unauthenticatedError();
  }
  return context.userId;
}

export function ensureBoardOwnership(board: BoardDocument, userId: string) {
  if (board.ownerId.toString() !== userId) {
    throw forbiddenError();
  }
}

export async function requireBoardOwner(boardId: string, userId: string): Promise<BoardDocument> {
  const board = await BoardModel.findById(boardId);
  if (!board) {
    throw badUserInputError('Board not found');
  }
  ensureBoardOwnership(board, userId);
  return board;
}

export async function requireBoardOwnershipFromList(
  listId: string,
  userId: string
): Promise<{ list: ListDocument; board: BoardDocument }> {
  const list = await ListModel.findById(listId);
  if (!list) {
    throw badUserInputError('List not found');
  }
  const board = await requireBoardOwner(String(list.boardId), userId);
  return { list, board };
}

export async function requireBoardOwnershipFromTask(task: TaskDocument, userId: string): Promise<BoardDocument> {
  const list = await ListModel.findById(task.listId);
  if (!list) {
    throw badUserInputError('List not found');
  }
  const board = await requireBoardOwner(String(list.boardId), userId);
  return board;
}

export function parseOptionalDate(value?: string): Date | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new GraphQLError('Invalid date format', { extensions: { code: 'BAD_USER_INPUT' } });
  }
  return date;
}

export function getUserIdFromRequestAuth(header?: string): string | null {
  return getUserIdFromAuthHeader(header);
}

export { pubsub };
