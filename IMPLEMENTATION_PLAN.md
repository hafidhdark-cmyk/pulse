# Pulse MVP — Monorepo, Backend, Frontend & Nobus DB Deployment Plan

## Goal Description
Build and deploy **Pulse**, a social fintech MVP featuring digital wallets (`NGN ₦`), personal and group savings plans, real-time group savings chat/activity communication, and instant P2P transfers—structured as a **Monorepo** (`backend/` + `frontend/`) and deployed on **Nobus Cloud** with **Nobus Database (PostgreSQL)**.

---

## Confirmed Architecture Decisions

1. **Nobus Database Support (PostgreSQL)**: Connects via standard `DATABASE_URL` (PostgreSQL `pg` pool) with automatic schema migration on startup—plus a built-in `postgres:16-alpine` service in `docker-compose.yml` and a local fallback so `npm run dev` works immediately on any laptop.
2. **Currency & Wallet Funding**: Defaults to **NGN (`₦`)** with a **1-click Simulated Instant Top-Up** (`method: "demo"`) AND a **Paystack Test-Mode Verification** flow (`method: "paystack"`).
3. **Monorepo Structure**: Both `backend/` and `frontend/` live in this repository with a root `docker-compose.yml` so a single `docker compose up -d --build` on Nobus deploys the entire stack.

---

## Monorepo Directory Tree
```text
pulse/                          # Root of the Monorepo
├── docker-compose.yml          # Orchestrates frontend, backend, and postgres
├── .env.example                # Shared env template (DATABASE_URL, JWT_SECRET, PAYSTACK_SECRET_KEY)
├── README.md
├── IMPLEMENTATION_PLAN.md
├── presentation/
│   ├── Pulse_Hackathon_Deck_Updated.pdf
│   ├── Pulse_Hackathon_Deck_Updated.html
│   └── pulse-logo.png
├── backend/                    # Backend Workspace
│   ├── Dockerfile
│   ├── package.json
│   ├── src/
│   │   ├── server.js           # Express + Socket.io bootstrap
│   │   ├── socket.js           # Real-time group savings chat & notifications
│   │   ├── db/
│   │   │   ├── index.js        # Auto-migrating PostgreSQL (Nobus DB) + local dev adapter
│   │   │   └── schema.sql      # PostgreSQL DDL for tables & indexes
│   │   ├── middleware/
│   │   │   └── auth.js         # JWT verification middleware
│   │   └── routes/
│   │       ├── auth.routes.js
│   │       ├── wallet.routes.js
│   │       ├── savings.routes.js
│   │       ├── chat.routes.js
│   │       ├── transfer.routes.js
│   │       └── notification.routes.js
│   └── tests/
│       └── e2e-flow.test.js    # Full automated verification suite
└── frontend/                   # @h@fidhdark..'s Frontend Workspace
    ├── Dockerfile              # Multi-stage build -> Nginx container
    ├── nginx.conf              # Serves SPA & proxies /api and /socket.io to backend:4000
    └── FRONTEND_IMPLEMENTATION_PLAN.md
```

---

## Shared REST & WebSocket API Contract (`/api`)

See [`frontend/FRONTEND_IMPLEMENTATION_PLAN.md`](./frontend/FRONTEND_IMPLEMENTATION_PLAN.md) for full request & response JSON examples.

| Feature | Method & Endpoint | Request Body | Response (`200` / `201`) |
| :--- | :--- | :--- | :--- |
| **1. Auth — Register** | `POST /api/auth/register` | `{ name, email, username, password }` | `{ token, user: { id, name, username, email }, wallet: { balance, currency: "NGN" } }` |
| **1. Auth — Login** | `POST /api/auth/login` | `{ emailOrUsername, password }` | `{ token, user, wallet }` |
| **1. Auth — Me** | `GET /api/auth/me` | *(Header: `Authorization: Bearer <token>`)* | `{ user, wallet, unreadNotifications }` |
| **2. Wallet — Summary** | `GET /api/wallet` | *(Auth Header)* | `{ balance, totalSaved, currency: "NGN", transactions: [...] }` |
| **2. Wallet — Fund** | `POST /api/wallet/fund` | `{ amount, method: "demo" \| "paystack", reference? }` | `{ message, wallet: { balance }, transaction }` |
| **3. Savings — List** | `GET /api/savings` | *(Auth Header)* | `{ plans: [...], personalPlans: [...], groupPlans: [...] }` |
| **3. Savings — Create** | `POST /api/savings` | `{ title, description, targetAmount, type: "PERSONAL" \| "GROUP", deadline, frequency }` | `{ plan, inviteCode }` |
| **3. Savings — Join Group** | `POST /api/savings/join` | `{ inviteCode }` | `{ plan, membership }` |
| **3. Savings — Details** | `GET /api/savings/:id` | *(Auth Header)* | `{ plan, members, leaderboard, insights }` |
| **3. Savings — Contribute** | `POST /api/savings/:id/contribute` | `{ amount }` | `{ plan, walletBalance, transaction }` |
| **4. Group Chat — History** | `GET /api/savings/:id/messages` | *(Auth Header)* | `{ messages: [{ id, sender, content, type: "CHAT" \| "ACTIVITY_ALERT", createdAt }] }` |
| **4. Group Chat — Send** | `POST /api/savings/:id/messages` | `{ content }` | `{ message }` *(also broadcast via Socket.io)* |
| **5. P2P — Lookup User** | `GET /api/users/lookup?q=<username>` | *(Auth Header)* | `{ user: { id, name, username } }` |
| **5. P2P — Transfer** | `POST /api/transfers/p2p` | `{ recipientUsername, amount, note }` | `{ transaction, newBalance }` |
| **5. P2P — Request/Split** | `POST /api/transfers/request` | `{ amount, description, planId? }` | `{ paymentRequest }` |
| **5. P2P — Pay Request** | `POST /api/transfers/request/:id/pay` | *(Auth Header)* | `{ paymentRequest, transaction, newBalance }` |
| **6. Notifications** | `GET /api/notifications` | *(Auth Header)* | `{ notifications: [...], unreadCount }` |
| **6. Mark Read** | `PATCH /api/notifications/read-all` | *(Auth Header)* | `{ success: true, unreadCount: 0 }` |
