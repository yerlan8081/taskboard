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
import { requireActiveUserFromContext, requireAdmin } from '../auth/guards';

const pubsub = new PubSub();

export const resolvers = {
  Query: {
    hello: () => 'Hello from Taskboard',
    me: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const user = await requireActiveUserFromContext(context);
      return toUserOutput(user);
    },
    boards: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      const user = await requireActiveUserFromContext(context);
      const filter =
        user.role === 'ADMIN'
          ? { isArchived: { $in: [false, null] } }
          : { ownerId: user.id, isArchived: { $in: [false, null] } };
      const boards = await BoardModel.find(filter);
      return boards.map(toBoardOutput);
    },
    board: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const user = await requireActiveUserFromContext(context);
      const board = await BoardModel.findById(args.id);
      if (!board) {
        return null;
      }
      ensureBoardOwnership(board, user);
      return toBoardOutput(board);
    },
    list: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const user = await requireActiveUserFromContext(context);
      const list = await ListModel.findById(args.id);
      if (!list) {
        return null;
      }
      await requireBoardOwner(String(list.boardId), user);
      return toListOutput(list);
    },
    lists: async (_parent: unknown, args: { boardId: string }, context: GraphQLContext) => {
      const user = await requireActiveUserFromContext(context);
      await requireBoardOwner(args.boardId, user);
      const lists = await ListModel.find({ boardId: args.boardId, isArchived: { $in: [false, null] } }).sort({ order: 1 });
      return lists.map(toListOutput);
    },
    tasks: async (_parent: unknown, args: { listId: string }, context: GraphQLContext) => {
      const user = await requireActiveUserFromContext(context);
      const { list } = await requireBoardOwnershipFromList(args.listId, user);
      if (list.isArchived) {
        return [];
      }
      const tasks = await TaskModel.find({ listId: args.listId });
      return tasks.map(toTaskOutput);
    },
    task: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const user = await requireActiveUserFromContext(context);
      const task = await TaskModel.findById(args.id);
      if (!task) {
        return null;
      }
      await requireBoardOwnershipFromTask(task, user);
      return toTaskOutput(task);
    },
    users: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      await requireAdmin(context);
      const users = await UserModel.find();
      return users.map(toUserOutput);
    },
    user: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      await requireAdmin(context);
      const user = await UserModel.findById(args.id);
      if (!user) return null;
      return toUserOutput(user);
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
    updateProfile: async (
      _parent: unknown,
      args: { input: { name?: string; avatarUrl?: string } },
      context: GraphQLContext
    ) => {
      const user = await requireActiveUserFromContext(context);
      const name = args.input.name !== undefined ? args.input.name.trim() : undefined;
      const avatarUrl = args.input.avatarUrl !== undefined ? args.input.avatarUrl.trim() : undefined;

      if ((name === undefined || name === '') && (avatarUrl === undefined || avatarUrl === '')) {
        throw badUserInputError('At least one field must be provided');
      }

      let updated = false;

      if (name !== undefined) {
        if (!name) {
          throw badUserInputError('Name is required');
        }
        if (name.length < 2) {
          throw badUserInputError('Name must be at least 2 characters long');
        }
        user.name = name;
        updated = true;
      }

      if (avatarUrl !== undefined) {
        if (!avatarUrl) {
          throw badUserInputError('Avatar URL cannot be empty');
        }
        if (!isValidHttpUrl(avatarUrl)) {
          throw badUserInputError('Avatar URL must be a valid http/https URL');
        }
        user.avatarUrl = avatarUrl;
        updated = true;
      }

      if (!updated) {
        throw badUserInputError('Nothing to update');
      }

      await user.save();
      return toUserOutput(user);
    },
    changePassword: async (
      _parent: unknown,
      args: { input: { oldPassword: string; newPassword: string } },
      context: GraphQLContext
    ) => {
      const user = await requireActiveUserFromContext(context);
      if (!args.input.newPassword || args.input.newPassword.length < 6) {
        throw badUserInputError('New password must be at least 6 characters long');
      }

      const matches = await verifyPassword(args.input.oldPassword, user.passwordHash);
      if (!matches) {
        throw badUserInputError('Old password is incorrect');
      }

      user.passwordHash = await hashPassword(args.input.newPassword);
      await user.save();
      return true;
    },
    createBoard: async (
      _parent: unknown,
      args: { input: { title: string; description?: string; visibility?: 'PRIVATE' | 'PUBLIC'; cover?: string } },
      context: GraphQLContext
    ) => {
      const user = await requireActiveUserFromContext(context);
      const title = args.input.title.trim();
      if (!title) {
        throw badUserInputError('Title is required');
      }

      const board = await BoardModel.create({
        title,
        description: args.input.description,
        visibility: args.input.visibility ?? 'PRIVATE',
        cover: args.input.cover,
        ownerId: new Types.ObjectId(user.id)
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
    updateBoard: async (
      _parent: unknown,
      args: {
        input: { id: string; title?: string; description?: string; visibility?: 'PRIVATE' | 'PUBLIC'; cover?: string; isArchived?: boolean };
      },
      context: GraphQLContext
    ) => {
      const user = await requireActiveUserFromContext(context);
      const board = await BoardModel.findById(args.input.id);
      if (!board) {
        throw badUserInputError('Board not found');
      }
      ensureBoardOwnership(board, user);
      if (args.input.title !== undefined) {
        const title = args.input.title.trim();
        if (!title) {
          throw badUserInputError('Title is required');
        }
        board.title = title;
      }
      if (args.input.description !== undefined) {
        board.description = args.input.description;
      }
      if (args.input.visibility !== undefined) {
        board.visibility = args.input.visibility as BoardDocument['visibility'];
      }
      if (args.input.cover !== undefined) {
        board.cover = args.input.cover;
      }
      if (args.input.isArchived !== undefined) {
        board.isArchived = args.input.isArchived;
      }
      await board.save();
      return toBoardOutput(board);
    },
    deleteBoard: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const user = await requireActiveUserFromContext(context);
      const board = await BoardModel.findById(args.id);
      if (!board) {
        throw badUserInputError('Board not found');
      }
      ensureBoardOwnership(board, user);
      board.isArchived = true;
      await board.save();
      const lists = await ListModel.find({ boardId: board._id });
      const listIds = lists.map((l) => l._id);
      await ListModel.updateMany({ boardId: board._id }, { $set: { isArchived: true } });
      if (listIds.length) {
        await TaskModel.deleteMany({ listId: { $in: listIds } });
      }
      return true;
    },
    createList: async (
      _parent: unknown,
      args: { input: { boardId: string; title: string; order: number; color?: string; wipLimit?: number } },
      context: GraphQLContext
    ) => {
      const user = await requireActiveUserFromContext(context);
      await requireBoardOwner(args.input.boardId, user);

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
    updateList: async (
      _parent: unknown,
      args: { input: { id: string; title?: string; order?: number; color?: string; wipLimit?: number; isArchived?: boolean } },
      context: GraphQLContext
    ) => {
      const user = await requireActiveUserFromContext(context);
      const list = await ListModel.findById(args.input.id);
      if (!list) {
        throw badUserInputError('List not found');
      }
      await requireBoardOwner(String(list.boardId), user);

      if (args.input.title !== undefined) {
        const title = args.input.title.trim();
        if (!title) {
          throw badUserInputError('Title is required');
        }
        list.title = title;
      }
      if (args.input.order !== undefined) {
        list.order = args.input.order;
      }
      if (args.input.color !== undefined) {
        list.color = args.input.color;
      }
      if (args.input.wipLimit !== undefined) {
        list.wipLimit = args.input.wipLimit;
      }
      if (args.input.isArchived !== undefined) {
        list.isArchived = args.input.isArchived;
      }
      await list.save();
      return toListOutput(list);
    },
    deleteList: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const user = await requireActiveUserFromContext(context);
      const list = await ListModel.findById(args.id);
      if (!list) {
        throw badUserInputError('List not found');
      }
      const board = await requireBoardOwner(String(list.boardId), user);
      list.isArchived = true;
      await list.save();
      const tasks = await TaskModel.find({ listId: list._id });
      if (tasks.length) {
        await TaskModel.deleteMany({ listId: list._id });
        for (const task of tasks) {
          await pubsub.publish(taskUpdatedTopic(String(board.id)), {
            taskUpdated: { type: 'DELETED', task: toTaskOutput(task) }
          });
        }
      }
      return true;
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
      const user = await requireActiveUserFromContext(context);
      const { board } = await requireBoardOwnershipFromList(args.input.listId, user);

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
      const user = await requireActiveUserFromContext(context);
      const task = await TaskModel.findById(args.input.id);
      if (!task) {
        throw badUserInputError('Task not found');
      }
      const board = await requireBoardOwnershipFromTask(task, user);

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
      const user = await requireActiveUserFromContext(context);
      const task = await TaskModel.findById(args.id);
      if (!task) {
        throw badUserInputError('Task not found');
      }

      const board = await requireBoardOwnershipFromTask(task, user);
      task.status = args.status;
      await task.save();
      const taskOutput = toTaskOutput(task);
      await pubsub.publish(taskUpdatedTopic(String(board.id)), {
        taskUpdated: { type: 'UPDATED', task: taskOutput }
      });
      return taskOutput;
    },
    moveTask: async (_parent: unknown, args: { input: { taskId: string; toListId: string } }, context: GraphQLContext) => {
      const user = await requireActiveUserFromContext(context);
      const task = await TaskModel.findById(args.input.taskId);
      if (!task) {
        throw badUserInputError('Task not found');
      }
      const sourceBoard = await requireBoardOwnershipFromTask(task, user);
      const { list: targetList, board: targetBoard } = await requireBoardOwnershipFromList(args.input.toListId, user);
      if (String(targetBoard.id) !== String(sourceBoard.id)) {
        throw badUserInputError('Cannot move task across boards');
      }
      task.listId = targetList._id;
      await task.save();
      const taskOutput = toTaskOutput(task);
      await pubsub.publish(taskUpdatedTopic(String(targetBoard.id)), {
        taskUpdated: { type: 'MOVED', task: taskOutput }
      });
      return taskOutput;
    },
    deleteTask: async (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      const user = await requireActiveUserFromContext(context);
      const task = await TaskModel.findById(args.id);
      if (!task) {
        throw badUserInputError('Task not found');
      }
      const board = await requireBoardOwnershipFromTask(task, user);
      const taskOutput = toTaskOutput(task);
      await TaskModel.deleteOne({ _id: task._id });
      await pubsub.publish(taskUpdatedTopic(String(board.id)), {
        taskUpdated: { type: 'DELETED', task: taskOutput }
      });
      return true;
    },
    setUserRole: async (_parent: unknown, args: { input: { userId: string; role: string } }, context: GraphQLContext) => {
      await requireAdmin(context);
      const { userId, role } = args.input;
      if (!['USER', 'ADMIN'].includes(role)) {
        throw badUserInputError('Invalid role');
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        throw badUserInputError('User not found');
      }
      user.role = role as 'USER' | 'ADMIN';
      await user.save();
      return toUserOutput(user);
    },
    setUserStatus: async (_parent: unknown, args: { input: { userId: string; status: string } }, context: GraphQLContext) => {
      await requireAdmin(context);
      const { userId, status } = args.input;
      if (!['ACTIVE', 'DISABLED'].includes(status)) {
        throw badUserInputError('Invalid status');
      }
      const user = await UserModel.findById(userId);
      if (!user) {
        throw badUserInputError('User not found');
      }
      user.status = status as 'ACTIVE' | 'DISABLED';
      await user.save();
      return toUserOutput(user);
    }
  },
  Subscription: {
    taskUpdated: {
      subscribe: async (_parent: unknown, args: { boardId: string }, context: GraphQLContext) => {
        await requireActiveUserFromContext(context);
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

export function ensureBoardOwnership(board: BoardDocument, user: UserDocument) {
  if (user.role === 'ADMIN') {
    return;
  }
  if (board.ownerId.toString() !== user.id) {
    throw forbiddenError();
  }
}

export async function requireBoardOwner(boardId: string, user: UserDocument): Promise<BoardDocument> {
  const board = await BoardModel.findById(boardId);
  if (!board) {
    throw badUserInputError('Board not found');
  }
  ensureBoardOwnership(board, user);
  return board;
}

export async function requireBoardOwnershipFromList(
  listId: string,
  user: UserDocument
): Promise<{ list: ListDocument; board: BoardDocument }> {
  const list = await ListModel.findById(listId);
  if (!list) {
    throw badUserInputError('List not found');
  }
  const board = await requireBoardOwner(String(list.boardId), user);
  return { list, board };
}

export async function requireBoardOwnershipFromTask(task: TaskDocument, user: UserDocument): Promise<BoardDocument> {
  const list = await ListModel.findById(task.listId);
  if (!list) {
    throw badUserInputError('List not found');
  }
  const board = await requireBoardOwner(String(list.boardId), user);
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

function isValidHttpUrl(value: string) {
  return /^https?:\/\//i.test(value);
}
