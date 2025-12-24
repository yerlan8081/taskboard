"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = require("body-parser");
const server_1 = require("@apollo/server");
const express4_1 = require("@apollo/server/express4");
const graphql_1 = require("graphql");
const mongoose_1 = require("mongoose");
const http_1 = require("http");
const ws_1 = require("ws");
const ws_2 = require("graphql-ws/lib/use/ws");
const drainHttpServer_1 = require("@apollo/server/plugin/drainHttpServer");
const schema_1 = require("@graphql-tools/schema");
const graphql_subscriptions_1 = require("graphql-subscriptions");
const db_1 = require("./db");
const user_1 = require("./models/user");
const board_1 = require("./models/board");
const list_1 = require("./models/list");
const task_1 = require("./models/task");
const auth_1 = require("./auth");
const pubsub = new graphql_subscriptions_1.PubSub();
const typeDefs = `#graphql
  enum BoardVisibility {
    PRIVATE
    PUBLIC
  }

  enum TaskPriority {
    LOW
    MEDIUM
    HIGH
  }

  enum TaskStatus {
    TODO
    DOING
    DONE
  }

  enum TaskEventType {
    CREATED
    UPDATED
    DELETED
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: String!
    status: String!
    avatarUrl: String
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Board {
    id: ID!
    title: String!
    description: String
    ownerId: ID!
    visibility: BoardVisibility!
    cover: String
    isArchived: Boolean!
  }

  type List {
    id: ID!
    boardId: ID!
    title: String!
    order: Int!
    color: String
    isArchived: Boolean!
    wipLimit: Int
  }

  type Task {
    id: ID!
    listId: ID!
    title: String!
    description: String
    assigneeId: ID
    priority: TaskPriority!
    status: TaskStatus!
    dueDate: String
    tags: [String!]!
  }

  type TaskEvent {
    type: TaskEventType!
    task: Task!
  }

  type Query {
    hello: String!
    me: User!
    boards: [Board!]!
    board(id: ID!): Board
    lists(boardId: ID!): [List!]!
    tasks(listId: ID!): [Task!]!
    task(id: ID!): Task
  }

  input RegisterInput {
    email: String!
    password: String!
    name: String!
    avatarUrl: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input CreateBoardInput {
    title: String!
    description: String
    visibility: BoardVisibility = PRIVATE
    cover: String
  }

  input CreateListInput {
    boardId: ID!
    title: String!
    order: Int!
    color: String
    wipLimit: Int
  }

  input CreateTaskInput {
    listId: ID!
    title: String!
    description: String
    assigneeId: ID
    priority: TaskPriority = MEDIUM
    status: TaskStatus = TODO
    dueDate: String
    tags: [String!]
  }

  input UpdateTaskInput {
    id: ID!
    title: String
    description: String
    assigneeId: ID
    priority: TaskPriority
    status: TaskStatus
    dueDate: String
    tags: [String!]
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    createBoard(input: CreateBoardInput!): Board!
    createList(input: CreateListInput!): List!
    createTask(input: CreateTaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task!
    updateTaskStatus(id: ID!, status: TaskStatus!): Task!
  }

  type Subscription {
    taskUpdated(boardId: ID!): TaskEvent!
  }
`;
const resolvers = {
    Query: {
        hello: () => 'Hello from Taskboard',
        me: async (_parent, _args, context) => {
            const userId = requireAuthenticatedUser(context);
            const user = await user_1.UserModel.findById(userId);
            if (!user) {
                throw unauthenticatedError();
            }
            return toUserOutput(user);
        },
        boards: async (_parent, _args, context) => {
            const userId = requireAuthenticatedUser(context);
            const boards = await board_1.BoardModel.find({ ownerId: userId, isArchived: { $in: [false, null] } });
            return boards.map(toBoardOutput);
        },
        board: async (_parent, args, context) => {
            const userId = requireAuthenticatedUser(context);
            const board = await board_1.BoardModel.findById(args.id);
            if (!board) {
                return null;
            }
            ensureBoardOwnership(board, userId);
            return toBoardOutput(board);
        },
        lists: async (_parent, args, context) => {
            const userId = requireAuthenticatedUser(context);
            await requireBoardOwner(args.boardId, userId);
            const lists = await list_1.ListModel.find({ boardId: args.boardId });
            return lists.map(toListOutput);
        },
        tasks: async (_parent, args, context) => {
            const userId = requireAuthenticatedUser(context);
            await requireBoardOwnershipFromList(args.listId, userId);
            const tasks = await task_1.TaskModel.find({ listId: args.listId });
            return tasks.map(toTaskOutput);
        },
        task: async (_parent, args, context) => {
            const userId = requireAuthenticatedUser(context);
            const task = await task_1.TaskModel.findById(args.id);
            if (!task) {
                return null;
            }
            await requireBoardOwnershipFromTask(task, userId);
            return toTaskOutput(task);
        }
    },
    Mutation: {
        register: async (_parent, args) => {
            const email = args.input.email.trim().toLowerCase();
            const name = args.input.name.trim();
            const existing = await user_1.UserModel.findOne({ email });
            if (existing) {
                throw new graphql_1.GraphQLError('Email already registered', { extensions: { code: 'BAD_USER_INPUT' } });
            }
            const passwordHash = await (0, auth_1.hashPassword)(args.input.password);
            const user = await user_1.UserModel.create({
                email,
                passwordHash,
                name,
                avatarUrl: args.input.avatarUrl
            });
            const token = (0, auth_1.createToken)(user.id);
            return { token, user: toUserOutput(user) };
        },
        login: async (_parent, args) => {
            const email = args.input.email.trim().toLowerCase();
            const user = await user_1.UserModel.findOne({ email });
            if (!user) {
                throw unauthenticatedError();
            }
            const isValid = await (0, auth_1.verifyPassword)(args.input.password, user.passwordHash);
            if (!isValid) {
                throw unauthenticatedError();
            }
            const token = (0, auth_1.createToken)(user.id);
            return { token, user: toUserOutput(user) };
        },
        createBoard: async (_parent, args, context) => {
            var _a;
            const userId = requireAuthenticatedUser(context);
            const title = args.input.title.trim();
            if (!title) {
                throw new graphql_1.GraphQLError('Title is required', { extensions: { code: 'BAD_USER_INPUT' } });
            }
            const board = await board_1.BoardModel.create({
                title,
                description: args.input.description,
                visibility: (_a = args.input.visibility) !== null && _a !== void 0 ? _a : 'PRIVATE',
                cover: args.input.cover,
                ownerId: new mongoose_1.Types.ObjectId(userId)
            });
            const defaultLists = [
                { title: '今天', order: 1 },
                { title: '本周', order: 2 },
                { title: '稍后', order: 3 }
            ];
            await list_1.ListModel.insertMany(defaultLists.map((l) => ({
                boardId: board._id,
                title: l.title,
                order: l.order
            })));
            return toBoardOutput(board);
        },
        createList: async (_parent, args, context) => {
            const userId = requireAuthenticatedUser(context);
            await requireBoardOwner(args.input.boardId, userId);
            const title = args.input.title.trim();
            if (!title) {
                throw new graphql_1.GraphQLError('Title is required', { extensions: { code: 'BAD_USER_INPUT' } });
            }
            if (typeof args.input.order !== 'number') {
                throw new graphql_1.GraphQLError('Order is required', { extensions: { code: 'BAD_USER_INPUT' } });
            }
            const list = await list_1.ListModel.create({
                boardId: new mongoose_1.Types.ObjectId(args.input.boardId),
                title,
                order: args.input.order,
                color: args.input.color,
                wipLimit: args.input.wipLimit
            });
            return toListOutput(list);
        },
        createTask: async (_parent, args, context) => {
            var _a, _b, _c;
            const userId = requireAuthenticatedUser(context);
            const { board } = await requireBoardOwnershipFromList(args.input.listId, userId);
            const title = args.input.title.trim();
            if (!title) {
                throw new graphql_1.GraphQLError('Title is required', { extensions: { code: 'BAD_USER_INPUT' } });
            }
            const dueDate = parseOptionalDate(args.input.dueDate);
            const task = await task_1.TaskModel.create({
                listId: new mongoose_1.Types.ObjectId(args.input.listId),
                title,
                description: args.input.description,
                assigneeId: args.input.assigneeId ? new mongoose_1.Types.ObjectId(args.input.assigneeId) : undefined,
                priority: (_a = args.input.priority) !== null && _a !== void 0 ? _a : 'MEDIUM',
                status: (_b = args.input.status) !== null && _b !== void 0 ? _b : 'TODO',
                dueDate,
                tags: (_c = args.input.tags) !== null && _c !== void 0 ? _c : []
            });
            const taskOutput = toTaskOutput(task);
            await pubsub.publish(taskUpdatedTopic(String(board.id)), {
                taskUpdated: { type: 'CREATED', task: taskOutput }
            });
            return taskOutput;
        },
        updateTask: async (_parent, args, context) => {
            const userId = requireAuthenticatedUser(context);
            const task = await task_1.TaskModel.findById(args.input.id);
            if (!task) {
                throw new graphql_1.GraphQLError('Task not found', { extensions: { code: 'BAD_USER_INPUT' } });
            }
            const board = await requireBoardOwnershipFromTask(task, userId);
            if (args.input.title !== undefined) {
                const title = args.input.title.trim();
                if (!title) {
                    throw new graphql_1.GraphQLError('Title is required', { extensions: { code: 'BAD_USER_INPUT' } });
                }
                task.title = title;
            }
            if (args.input.description !== undefined) {
                task.description = args.input.description;
            }
            if (args.input.assigneeId !== undefined) {
                task.assigneeId = args.input.assigneeId ? new mongoose_1.Types.ObjectId(args.input.assigneeId) : undefined;
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
        updateTaskStatus: async (_parent, args, context) => {
            const userId = requireAuthenticatedUser(context);
            const task = await task_1.TaskModel.findById(args.id);
            if (!task) {
                throw new graphql_1.GraphQLError('Task not found', { extensions: { code: 'BAD_USER_INPUT' } });
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
            subscribe: (_parent, args, context) => {
                requireAuthenticatedUser(context);
                return pubsub.asyncIterableIterator(taskUpdatedTopic(args.boardId));
            }
        }
    }
};
function toUserOutput(user) {
    var _a;
    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        avatarUrl: (_a = user.avatarUrl) !== null && _a !== void 0 ? _a : null
    };
}
function toBoardOutput(board) {
    var _a, _b, _c;
    return {
        id: board.id,
        title: board.title,
        description: (_a = board.description) !== null && _a !== void 0 ? _a : null,
        ownerId: String(board.ownerId),
        visibility: board.visibility,
        cover: (_b = board.cover) !== null && _b !== void 0 ? _b : null,
        isArchived: (_c = board.isArchived) !== null && _c !== void 0 ? _c : false
    };
}
function toListOutput(list) {
    var _a, _b, _c;
    return {
        id: list.id,
        boardId: String(list.boardId),
        title: list.title,
        order: list.order,
        color: (_a = list.color) !== null && _a !== void 0 ? _a : null,
        isArchived: (_b = list.isArchived) !== null && _b !== void 0 ? _b : false,
        wipLimit: (_c = list.wipLimit) !== null && _c !== void 0 ? _c : null
    };
}
function toTaskOutput(task) {
    var _a, _b;
    return {
        id: task.id,
        listId: String(task.listId),
        title: task.title,
        description: (_a = task.description) !== null && _a !== void 0 ? _a : null,
        assigneeId: task.assigneeId ? String(task.assigneeId) : null,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate ? task.dueDate.toISOString() : null,
        tags: (_b = task.tags) !== null && _b !== void 0 ? _b : []
    };
}
function unauthenticatedError() {
    return new graphql_1.GraphQLError('UNAUTHENTICATED', { extensions: { code: 'UNAUTHENTICATED' } });
}
function forbiddenError() {
    return new graphql_1.GraphQLError('FORBIDDEN', { extensions: { code: 'FORBIDDEN' } });
}
function requireAuthenticatedUser(context) {
    if (!context.userId) {
        throw unauthenticatedError();
    }
    return context.userId;
}
function ensureBoardOwnership(board, userId) {
    if (board.ownerId.toString() !== userId) {
        throw forbiddenError();
    }
}
async function requireBoardOwner(boardId, userId) {
    const board = await board_1.BoardModel.findById(boardId);
    if (!board) {
        throw new graphql_1.GraphQLError('Board not found', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    ensureBoardOwnership(board, userId);
    return board;
}
async function requireBoardOwnershipFromList(listId, userId) {
    const list = await list_1.ListModel.findById(listId);
    if (!list) {
        throw new graphql_1.GraphQLError('List not found', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    const board = await requireBoardOwner(String(list.boardId), userId);
    return { list, board };
}
async function requireBoardOwnershipFromTask(task, userId) {
    const list = await list_1.ListModel.findById(task.listId);
    if (!list) {
        throw new graphql_1.GraphQLError('List not found', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    const board = await requireBoardOwner(String(list.boardId), userId);
    return board;
}
function parseOptionalDate(value) {
    if (value === undefined || value === null) {
        return undefined;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        throw new graphql_1.GraphQLError('Invalid date format', { extensions: { code: 'BAD_USER_INPUT' } });
    }
    return date;
}
function taskUpdatedTopic(boardId) {
    return `taskUpdated:${boardId}`;
}
function getUserIdFromConnectionParams(params) {
    if (!params || typeof params !== 'object') {
        return null;
    }
    const record = params;
    const auth = (typeof record.Authorization === 'string' && record.Authorization) ||
        (typeof record.authorization === 'string' && record.authorization);
    if (typeof auth === 'string') {
        return (0, auth_1.getUserIdFromAuthHeader)(auth);
    }
    return null;
}
async function startServer() {
    await (0, db_1.connectToDatabase)();
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)());
    app.get('/health', (_req, res) => {
        res.status(200).send('ok');
    });
    const schema = (0, schema_1.makeExecutableSchema)({
        typeDefs,
        resolvers
    });
    const httpServer = (0, http_1.createServer)(app);
    const wsServer = new ws_1.WebSocketServer({
        server: httpServer,
        path: '/graphql'
    });
    const serverCleanup = (0, ws_2.useServer)({
        schema,
        context: async (ctx) => {
            const userId = getUserIdFromConnectionParams(ctx.connectionParams) ||
                (0, auth_1.getUserIdFromAuthHeader)(ctx.extra.request.headers.authorization);
            if (!userId) {
                throw unauthenticatedError();
            }
            return { userId };
        }
    }, wsServer);
    const apolloServer = new server_1.ApolloServer({
        schema,
        plugins: [
            (0, drainHttpServer_1.ApolloServerPluginDrainHttpServer)({ httpServer }),
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            await serverCleanup.dispose();
                        }
                    };
                }
            }
        ]
    });
    await apolloServer.start();
    app.use('/graphql', (0, body_parser_1.json)(), (0, express4_1.expressMiddleware)(apolloServer, {
        context: async ({ req }) => {
            const userId = (0, auth_1.getUserIdFromAuthHeader)(req.headers.authorization);
            return { userId };
        }
    }));
    const port = Number(process.env.PORT) || 4000;
    await new Promise((resolve) => httpServer.listen({ port }, resolve));
    console.log(`Server ready at http://localhost:${port}/graphql`);
}
startServer().catch((error) => {
    console.error('Failed to start server', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map