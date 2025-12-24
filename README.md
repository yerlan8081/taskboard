````md
# Taskboard

## A) Жобаға шолу (Project Overview)
- Канбан-тақтаға негізделген тапсырма менеджері: Board/List/Task CRUD, JWT аутентификациясы, graphql-ws арқылы тапсырмаларды нақты уақыт режимінде жаңарту.
- Frontend: Next.js App Router + Apollo Client + Zustand, token-ді жергілікті сақтау (persist), subscription арқылы автоматты жаңарту.
- Backend: Express + Apollo Server + Mongoose, UNAUTHENTICATED/FORBIDDEN қателерінің бірыңғай кодтары.

## B) Технологиялық стек (Tech Stack)
- Client: Next.js (App Router), TailwindCSS, Apollo Client (HTTP + graphql-ws), Zustand.
- Server: Express, Apollo Server 4, Mongoose, graphql-ws.
- Infra: Docker Compose (mongo + server + client).
- Test: Jest + ts-jest + mongodb-memory-server + supertest.

## C) Архитектура (Architecture)
- Ағым: Client (HTTP/WS, Authorization: Bearer) → Apollo Server → MongoDB.
- Бір портта (4000) HTTP GraphQL және graphql-ws Subscription қатар жұмыс істейді.
- Health: GET /health.

## D) Домендік модельдер (Domain Models)
- User: email (unique, required), passwordHash, name, role (USER/ADMIN), status (ACTIVE/DISABLED), avatarUrl?.
- Board: title (required), description?, ownerId (User), visibility (PRIVATE/PUBLIC), cover?, isArchived.
- List: boardId (Board), title (required), order (required), color?, wipLimit?, isArchived.
- Task: listId (List), title (required), description?, priority (LOW/MEDIUM/HIGH), status (TODO/DOING/DONE), dueDate?, tags[], assigneeId?.

## E) Жергілікті іске қосу (Docker)
```powershell
docker compose up --build
````

* Client: [http://localhost:3000](http://localhost:3000)
* GraphQL HTTP: [http://localhost:4000/graphql](http://localhost:4000/graphql)
* GraphQL WS: ws://localhost:4000/graphql
* Health: [http://localhost:4000/health](http://localhost:4000/health)

## F) Қоршаған орта айнымалылары (Environment Variables)

* Үлгіні көшіру:

  * Server: `cp server/.env.example server/.env` (PowerShell үшін: `copy server/.env.example server/.env`)
  * Client: `cp client/.env.example client/.env`
* Әдепкі мәндер localhost-қа бағытталған; Docker Compose қолдансаңыз, әдетте тікелей іске қосуға болады.

## G) Негізгі демонстрация ағымы (Core Demo Flow)

1. [http://localhost:3000/login](http://localhost:3000/login) ашыңыз, тіркеліңіз немесе seed аккаунтымен кіріңіз.
2. /boards бетіне өтіңіз: boards тізімін қараңыз, жаңа board жасаңыз (әдепкісі PRIVATE).
3. Белгілі бір board-қа кіріңіз (/boards/[id]): lists + tasks қарап, тапсырма статусын жаңартыңыз.
4. /dashboard: әдепкі board және «Бүгін/Осы апта/Кейінірек» тізімдерінің барын қамтамасыз етіп, тапсырмалар санын көрсетеді.
5. /tasks/[id] тапсырма деталі, /profile ағымдағы қолданушы ақпаратын көрсетеді.

## H) Нақты уақыттағы Subscription демонстрациясы (Екі терезе)

1. Терезе A: кіріп, board деталь бетін ашыңыз (/boards/[id]).
2. Терезе B (инкогнито болуы мүмкін): сол аккаунтпен кіріп, дәл сол board-ты ашыңыз.
3. Терезе A-да тапсырма статус батырмасын басыңыз (TODO→DOING немесе DOING→DONE).
4. Терезе B-ны бақылаңыз: статус бірден жаңаруы керек; subscription белгісі Listening деп тұрады.
5. Егер желі үзілсе, «Reload lists & tasks» арқылы сақтық (fallback) жаңартуды қолданыңыз.

## I) Тестілеу (Testing)

```powershell
cd server
npm test
```

## J) Seed деректері (Seed Data)

```powershell
cd server
npm run seed
```

* Қолданушы құрады: [demo@example.com](mailto:demo@example.com) / Passw0rd!
* Board құрады: "Realtime Demo Board", әдепкі Lists: «Бүгін/Осы апта/Кейінірек» (order 1/2/3), бірнеше тапсырмамен бірге.
* Іске қосқаннан кейін /login бетінде осы аккаунтпен кіріп, тез демонстрация жасай аласыз.

## K) Ақауларды жою (Troubleshooting)

* Порт бос емес: 3000/4000 бос екеніне көз жеткізіңіз; бос болмаса .env-те өзгертіп, қайта іске қосыңыз.
* WS аутентификациясы: Authorization connectionParams арқылы Bearer token ретінде беріледі; кірмеген болса UNAUTHENTICATED болады.
* UNAUTHENTICATED: token мерзімі өткен/жоқ — қайта кіріңіз; клиент автоматты түрде /login бетіне жібереді.
* FORBIDDEN: өзіңізге тиесілі емес Board-та операция жасау — owner аккаунтын қолданыңыз.
* Деректерді тазалау (тек локал): `docker compose down -v` жасап, қайта `docker compose up --build`.

## L) Үлес қосу (Contribution)

* Орны: кейін код стилі, branch стратегиясы және commit ережелерін қосуға болады. Қазіргі кезеңде бастысы — жұмыс істейтін демонстрация.

```

Дереккөз: :contentReference[oaicite:0]{index=0}
```
