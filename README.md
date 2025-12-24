# Taskboard

## A) Project Overview
- 看板式任务管理：Board/List/Task CRUD、JWT 鉴权、graphql-ws 实时任务更新。
- 前端：Next.js App Router + Apollo Client + Zustand，本地持久化 token，订阅自动更新。
- 后端：Express + Apollo Server + Mongoose，统一 UNAUTHENTICATED/FORBIDDEN 错误码。

## B) Tech Stack
- Client: Next.js (App Router), TailwindCSS, Apollo Client (HTTP + graphql-ws), Zustand。
- Server: Express, Apollo Server 4, Mongoose, graphql-ws。
- Infra: Docker Compose (mongo + server + client)。
- Test: Jest + ts-jest + mongodb-memory-server + supertest。

## C) Architecture
- 流程：Client (HTTP/WS, Authorization: Bearer) → Apollo Server → MongoDB。
- 同一端口 4000 提供 HTTP GraphQL 与 graphql-ws Subscription。
- Health: GET /health。

## D) Domain Models
- User: email(unique, required), passwordHash, name, role(USER/ADMIN), status(ACTIVE/DISABLED), avatarUrl?。
- Board: title(required), description?, ownerId(User), visibility(PRIVATE/ PUBLIC), cover?, isArchived.
- List: boardId(Board), title(required), order(required), color?, wipLimit?, isArchived.
- Task: listId(List), title(required), description?, priority(LOW/MEDIUM/HIGH), status(TODO/DOING/DONE), dueDate?, tags[], assigneeId?.

## E) Local Run (Docker)
```powershell
docker compose up --build
```
- Client: http://localhost:3000
- GraphQL HTTP: http://localhost:4000/graphql
- GraphQL WS: ws://localhost:4000/graphql
- Health: http://localhost:4000/health

## F) Environment Variables
- 复制示例：
  - Server: `cp server/.env.example server/.env`（若使用 PowerShell: `copy server/.env.example server/.env`）
  - Client: `cp client/.env.example client/.env`
- 默认值已指向本机 localhost，如使用 Docker Compose 可直接运行。

## G) Core Demo Flow
1) 打开 http://localhost:3000/login，注册或使用 seed 账号登录。
2) 进入 /boards：查看现有 boards，可创建新 board（默认 PRIVATE）。
3) 进入某个 board（/boards/[id]）：查看 lists + tasks，更新任务状态。
4) /dashboard：自动确保默认 board 与 今天/本周/稍后 列表并展示任务数量。
5) /tasks/[id] 查看任务详情，/profile 查看当前用户信息。

## H) Realtime Subscription Demo（双窗口）
1) 窗口A 登录并打开某 board 的详情页 (/boards/[id])。
2) 窗口B（可用隐身）登录同一账号，打开同一 board。
3) 在窗口A 点击任务状态按钮（TODO→DOING 或 DOING→DONE）。
4) 观察窗口B：任务状态应瞬时更新；订阅徽标显示 Listening。
5) 如网络中断，点击“Reload lists & tasks”兜底刷新。

## I) Testing
```powershell
cd server
npm test
```

## J) Seed Data
```powershell
cd server
npm run seed
```
- 创建用户：demo@example.com / Passw0rd!
- 创建 Board："Realtime Demo Board"，默认 Lists：今天/本周/稍后（order 1/2/3），附带多条任务。
- 运行后直接在 /login 使用上述账号即可快速演示。

## K) Troubleshooting
- 端口占用：确保 3000/4000 空闲；如被占用可改 .env 后重启。
- WS 鉴权：Authorization 通过 connectionParams 传递 Bearer token，未登录会 UNAUTHENTICATED。
- UNAUTHENTICATED：token 过期/缺失，重新登录；客户端会自动跳转 /login。
- FORBIDDEN：操作非本人 Board，需使用 owner 账号。
- 清库（仅本地）：`docker compose down -v` 后重新 `docker compose up --build`。

## L) Contribution
- 占位：后续可补充代码规范、分支策略与提交规范。当前阶段以可演示为主。
