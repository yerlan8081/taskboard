export const typeDefs = `#graphql
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
    MOVED
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
    list(id: ID!): List
    lists(boardId: ID!): [List!]!
    tasks(listId: ID!): [Task!]!
    task(id: ID!): Task
    users: [User!]!
    user(id: ID!): User
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

  input UpdateProfileInput {
    name: String
    avatarUrl: String
  }

  input ChangePasswordInput {
    oldPassword: String!
    newPassword: String!
  }

  input CreateBoardInput {
    title: String!
    description: String
    visibility: BoardVisibility = PRIVATE
    cover: String
  }

  input UpdateBoardInput {
    id: ID!
    title: String
    description: String
    visibility: BoardVisibility
    cover: String
    isArchived: Boolean
  }

  input CreateListInput {
    boardId: ID!
    title: String!
    order: Int!
    color: String
    wipLimit: Int
  }

  input UpdateListInput {
    id: ID!
    title: String
    order: Int
    color: String
    wipLimit: Int
    isArchived: Boolean
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

  input MoveTaskInput {
    taskId: ID!
    toListId: ID!
  }

  input SetUserRoleInput {
    userId: ID!
    role: String!
  }

  input SetUserStatusInput {
    userId: ID!
    status: String!
  }

  type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateProfile(input: UpdateProfileInput!): User!
    changePassword(input: ChangePasswordInput!): Boolean!
    createBoard(input: CreateBoardInput!): Board!
    updateBoard(input: UpdateBoardInput!): Board!
    deleteBoard(id: ID!): Boolean!
    createList(input: CreateListInput!): List!
    updateList(input: UpdateListInput!): List!
    deleteList(id: ID!): Boolean!
    createTask(input: CreateTaskInput!): Task!
    updateTask(input: UpdateTaskInput!): Task!
    updateTaskStatus(id: ID!, status: TaskStatus!): Task!
    moveTask(input: MoveTaskInput!): Task!
    deleteTask(id: ID!): Boolean!
    setUserRole(input: SetUserRoleInput!): User!
    setUserStatus(input: SetUserStatusInput!): User!
  }

  type Subscription {
    taskUpdated(boardId: ID!): TaskEvent!
  }
`;
