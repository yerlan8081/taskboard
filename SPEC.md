# Taskboard (MERN2 Final) — SPEC

## 0. Purpose
Build a minimal Trello-like task board that satisfies MERN2 final requirements:
- MongoDB + Express + Node.js + Next.js (MERN) with TypeScript across full stack.
- GraphQL (Query/Mutation/Subscription) + Apollo (server & client).
- Zustand for client state.
- Jest tests (10+ unit, 1+ integration).
- Docker/Docker Compose: one command to run (`docker compose up --build`).

This spec is authoritative. Any generated code must comply with this file.

---

## 1. Tech Stack (Hard Requirements)
### 1.1 Server
- Node.js + Express
- TypeScript
- Apollo Server (GraphQL)
- MongoDB + Mongoose
- JWT auth (access token)
- GraphQL Subscriptions using `graphql-ws` (WebSocket)

### 1.2 Client
- Next.js (App Router) + TypeScript
- TailwindCSS
- Apollo Client
- Zustand

### 1.3 Tooling
- Jest (server tests)
- Docker + Docker Compose
- Env vars via `.env` + provide `.env.example` (no secrets committed)

### 1.4 Prohibited
- No NestJS, Prisma, TypeORM, tRPC, REST-only APIs, or switching away from Apollo GraphQL.
- Do not change monorepo folder names or the port assignments.
- Do not introduce additional frameworks unless explicitly approved in this spec.

---

## 2. Monorepo Structure (Hard Requirements)
Repository root MUST keep this structure:

taskboard/
- docker-compose.yml
- README.md
- SPEC.md
- server/
  - Dockerfile
  - package.json
  - tsconfig.json
  - jest.config.ts
  - .env.example
  - src/
- client/
  - Dockerfile
  - package.json
  - .env.example
  - app/ (Next.js App Router)
  - src/ (optional; if Next generated it)
  
No additional top-level apps. Only `client/` and `server/`.

---

## 3. Ports and URLs (Hard Requirements)
- Client: http://localhost:3000
- Server HTTP: http://localhost:4000/graphql
- Server Health: http://localhost:4000/health
- Server WS (subscriptions): ws://localhost:4000/graphql

Docker compose MUST expose:
- 3000:3000
- 4000:4000
- 27017:27017 (Mongo)

---

## 4. Data Models (Hard Requirements)
At least 4 domain models, each >= 5 fields (excluding _id, createdAt, updatedAt).
Mongoose schemas MUST validate types and basic constraints.

### 4.1 User
Fields (minimum):
- email (unique, required)
- passwordHash (required)
- name (required)
- role ("USER" | "ADMIN") default "USER"
- avatarUrl (optional)
- status ("ACTIVE" | "DISABLED") default "ACTIVE"

### 4.2 Board
Fields (minimum):
- title (required)
- description (optional)
- ownerId (User reference, required)
- visibility ("PRIVATE" | "PUBLIC") default "PRIVATE"
- cover (optional string)
- isArchived (boolean default false)

### 4.3 List
Fields (minimum):
- boardId (Board reference, required)
- title (required)
- order (number required)
- color (optional)
- isArchived (boolean default false)
- wipLimit (optional number)

### 4.4 Task
Fields (minimum):
- listId (List reference, required)
- title (required)
- description (optional)
- assigneeId (User reference, optional)
- priority ("LOW" | "MEDIUM" | "HIGH") default "MEDIUM"
- status ("TODO" | "DOING" | "DONE") default "TODO"
- dueDate (optional Date)
- tags (array of strings, optional)

### 4.5 Relationships (Must exist)
- Board 1..N List
- List 1..N Task
- Task N..1 User (assignee)
- Board N..1 User (owner)

---

## 5. GraphQL API (Hard Requirements)
Schema must include:
- >= 6 Queries
- >= 6 Mutations
- >= 1 Subscription

### 5.1 Queries (minimum set)
- me: User!
- boards: [Board!]!
- board(id: ID!): Board
- lists(boardId: ID!): [List!]!
- tasks(listId: ID!): [Task!]!
- task(id: ID!): Task

### 5.2 Mutations (minimum set)
- register(email, password, name): AuthPayload!
- login(email, password): AuthPayload!
- createBoard(input): Board!
- createList(input): List!
- createTask(input): Task!
- updateTask(input): Task!
- updateTaskStatus(id: ID!, status: TaskStatus!): Task!  (can be part of updateTask but must exist)
- (optional) moveTask(taskId, toListId, toOrder)

AuthPayload:
- token: String!
- user: User!

### 5.3 Subscription (minimum)
- taskUpdated(boardId: ID!): TaskEvent!

TaskEvent includes:
- type: "CREATED" | "UPDATED" | "DELETED"
- task: Task!

### 5.4 Authorization Rules
- Only `register` and `login` are public.
- All other queries/mutations require JWT in `Authorization: Bearer <token>`.
- Ownership rules:
  - Board owner can create lists/tasks within their board.
  - Update task allowed for board owner and assignee (minimum).
- If unauthorized: return GraphQL error with code `UNAUTHENTICATED`.
- If forbidden: return GraphQL error with code `FORBIDDEN`.

---

## 6. Client UI (Hard Requirements)
Minimum pages (App Router):
- /login  (login/register)
- /boards (board list + create board)
- /boards/[id] (board detail: lists + tasks, update task status)
- /tasks/[id] (task detail/edit)
- /profile (me)

Minimum UI behavior:
- Store JWT in Zustand (in-memory + optional localStorage hydration).
- Apollo Client uses auth link to attach token.
- Subscription updates UI in board detail (taskUpdated).

---

## 7. Testing (Hard Requirements)
### 7.1 Unit tests (>= 10)
- Use Jest on server.
- Target services/resolvers/helpers (not UI).
- Include auth tests and at least one task update authorization test.

### 7.2 Integration test (>= 1)
- Spin up test Mongo (prefer `mongodb-memory-server` OR dedicated test DB in Docker).
- Execute a real GraphQL mutation chain:
  register -> createBoard -> createList -> createTask -> updateTaskStatus

---

## 8. Docker (Hard Requirements)
- `docker compose up --build` must start mongo, server, client.
- Compose includes healthchecks.
- No manual steps after compose for normal run (except first-time seed optional).
- Provide `.env.example` files for server and client.

---

## 9. Delivery Phases (Codex Must Follow)
Codex MUST implement in phases. Each phase must be runnable and verifiable before moving to next.

### Phase 0 — Skeleton
- Docker compose
- server: /health + GraphQL hello query
- client: Next.js page "Taskboard OK"
- no auth, no DB models, no subscriptions

### Phase 1 — Auth
- User model, JWT, register/login/me
- protect resolvers

### Phase 2 — CRUD
- Board/List/Task models + queries/mutations

### Phase 3 — Subscription
- graphql-ws server + Apollo client subscription
- taskUpdated(boardId) fully working

### Phase 4 — UI completeness
- Pages: login/boards/board detail/task detail/profile

### Phase 5 — Tests
- 10 unit + 1 integration

### Phase 6 — Documentation + Seed
- README steps: run, login, create board, verify subscription
- seed script optional

Codex must NOT skip phases or implement future phases prematurely.

---

## 10. Output Rules for Codex
When Codex modifies code, it MUST:
- List changed files with paths.
- Provide complete file contents for new files and for any file it changes (no partial snippets).
- Provide PowerShell commands to run verification (docker compose, tests).
- Avoid adding unrelated features.

---

## 11. Acceptance Checklist (for each phase)
Phase 0:
- docker compose up --build works
- /health returns ok
- /graphql hello query works
- client on :3000 loads

Phase 1:
- register/login/me works with JWT
- unauthorized access yields UNAUTHENTICATED

Phase 2:
- CRUD works for board/list/task

Phase 3:
- two browser sessions: task status change pushes realtime update

Phase 5:
- jest passes locally/in docker
