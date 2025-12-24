# Taskboard 答辩提纲（15–20 分钟）

## 1. 作品概览（1 分钟）
- 核心卖点：看板式任务管理，JWT 鉴权 + GraphQL CRUD + graphql-ws 实时订阅。
- 技术栈：Next.js(App Router) + Apollo Client + Zustand；Express + Apollo Server + Mongoose；graphql-ws；Docker Compose；Jest。

## 2. 架构与数据流（2 分钟）
- 架构：Client（HTTP+WS）→ GraphQL Server → MongoDB。
- Auth：JWT Bearer，HTTP context/WS connectionParams 注入 userId。
- Subscription：同一端口 4000，graphql-ws 协议。

## 3. 模型与权限（2 分钟）
- User(email, passwordHash, name, role, status)。
- Board(title, description, ownerId, visibility, isArchived)。
- List(boardId, title, order, isArchived, wipLimit)。
- Task(listId, title, description, priority, status, dueDate, tags, assigneeId)。
- 权限：所有 CRUD 需 JWT；Board 所有权校验；未登录 UNAUTHENTICATED，越权 FORBIDDEN。

## 4. GraphQL API（2 分钟）
- Queries ≥6：boards, board, lists(boardId), tasks(listId), task, me, hello。
- Mutations ≥6：register, login, createBoard, createList, createTask, updateTask, updateTaskStatus。
- Subscription：taskUpdated(boardId) → TaskEvent(type, task)。

## 5. 实时与前端接入（3 分钟）
- Apollo split link：HTTP + graphql-ws，均自动带 Authorization。
- Board 详情页订阅 taskUpdated(boardId)，收到 CREATED/UPDATED 同步缓存或 refetch。
- UI 要点：Board 标题 + 订阅状态徽标；任务状态按钮立即更新；登录后 token 自动持久化。

## 6. Docker 与部署（2 分钟）
- docker compose up --build 一键启动：mongo + server(4000) + client(3000)。
- Health: GET /health；GraphQL/WS: http/ws://localhost:4000/graphql。

## 7. 测试与质量（2 分钟）
- Jest >=10 用例 + 1 集成，用 mongodb-memory-server。
- 覆盖：auth、权限、未登录、状态校验、完整 CRUD 流。
- 运行：cd server && npm test。

## 8. Seed 演示（2 分钟）
- 命令：cd server && npm run seed。
- 生成 demo 用户 demo@example.com / Passw0rd!，Board “Realtime Demo Board”，列表 今天/本周/稍后 + 多个任务。
- 打开两个窗口登录同一账号，演示实时状态同步。

## 9. Demo 脚本（3–4 分钟）
1) docker compose up --build（提前准备）。
2) /login 使用 demo 账号登录；或 /register 自建账号。
3) /boards 创建或进入默认 Board；点击 Dashboard 查看三个默认列表。
4) /boards/[id]：查看 lists/tasks；更新任务状态，观察订阅徽标。
5) 打开隐身窗口，同一 board 更新任务状态，另一窗口实时变化。
6) /tasks/[id] 查看详情，/profile 查看当前用户，最后 logout。

## 10. 常见追问（留 1–2 分钟）
- 为什么用 graphql-ws：官方协议、Apollo 兼容、同端口复用。
- 权限怎么做：JWT → context，Board 所有权校验，UNAUTHENTICATED/FORBIDDEN。
- 为什么用 input：便于扩展/校验。
- 测试覆盖什么：auth、权限、枚举校验、集成流。
- 如何扩展：增加活动日志、Webhooks、细粒度角色。
