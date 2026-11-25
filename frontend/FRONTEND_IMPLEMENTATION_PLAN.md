# Pulse MVP — Frontend Integration & API Contract Guide (For `@h@fidhdark..`)

## 1. What We Are Building (Scope & Alignment)
We are building **Pulse**, a social wallet and group savings platform deployed on **Nobus Cloud** via Docker in a single monorepo (`backend/` + `frontend/`).

### Core MVP Features (Priority 1)
1. **Authentication**: Sign up with a unique `@username`, login, and persistent JWT session.
2. **Wallet Funding**: Every user gets an `NGN (₦)` wallet on registration. Supports instant demo top-up (`method: "demo"`) and Paystack test verification (`method: "paystack"`), plus full transaction history.
3. **Savings Plan Creation**: Users can create **Personal** (`PERSONAL`) or **Group** (`GROUP`) savings plans with a target amount, frequency, and deadline. Group plans automatically generate a 6-character invite code (e.g. `PLS-89X2`) so other users can join, and members fund the plan directly from their main wallet balance.
4. **Group Savings Communication**: Each savings plan has a message & activity stream where members can send text messages AND the backend automatically posts system activity alerts whenever someone joins or contributes money.
5. **P2P Transfer**: Instant wallet-to-wallet money transfer to any user via their `@username` (with a lookup endpoint to verify the recipient before sending).

### Stretch Features (Priority 2 — Already Supported by Backend)
6. **Notifications**: In-app notification list + real-time Socket.io push when a user receives a P2P transfer, someone joins their group plan, or someone contributes to a group plan.
7. **Bonus 1 — Group Contributor Leaderboard**: Returned automatically inside `GET /api/savings/:id` (ranks group members by amount & percentage contributed with badges like `🥇 Top Saver`).
8. **Bonus 2 — Smart Savings Pace Insights**: Returned automatically inside `GET /api/savings/:id` (calculates days left and how much each member needs to save daily/weekly to hit the target on time).
9. **Bonus 3 — 1-Click Payment Request / Bill Split**: Create a payment request link or in-group split request that another user can pay with one click from their wallet.

---

## 2. Base URLs, Auth & Monorepo Rules

| Environment | REST Base URL | Socket.io URL |
| :--- | :--- | :--- |
| **Local Dev** | `http://localhost:4000/api` (or `/api` via proxy) | `http://localhost:4000` |
| **Production (Nobus Docker)** | `/api` (proxied automatically by Nginx on port `80`) | `/` (same origin) |

- **Authentication Header**: Pass the JWT on all protected requests:
  ```http
  Authorization: Bearer <token>
  ```
- **Standard Error Format**: All error responses (`400`, `401`, `403`, `404`, `500`) return:
  ```json
  {
    "error": "Insufficient wallet balance for this transfer"
  }
  ```
- **Monorepo Folder**: Put all frontend code inside `frontend/`. As long as `npm run build` outputs static files to `frontend/dist` (Vite/ React default) or `frontend/build`, our `frontend/Dockerfile` + Nginx config will automatically package and serve it on Nobus.

---

## 3. Complete REST API Specification (Request & Response JSON)

### Feature 1: Authentication

#### `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "Hafidh Dark",
    "username": "hafidh",
    "email": "hafidh@pulse.app",
    "password": "password123"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
    "user": {
      "id": "usr_01",
      "name": "Hafidh Dark",
      "username": "hafidh",
      "email": "hafidh@pulse.app",
      "createdAt": "2026-11-25T12:00:00.000Z"
    },
    "wallet": {
      "id": "wal_01",
      "balance": 0,
      "currency": "NGN"
    }
  }
  ```

#### `POST /api/auth/login`
- **Request Body** (accepts either email or `@username`):
  ```json
  {
    "emailOrUsername": "hafidh",
    "password": "password123"
  }
  ```
- **Response (`200 OK`)**: Same shape as `/api/auth/register` (`{ token, user, wallet }`).

#### `GET /api/auth/me` *(Protected)*
- **Response (`200 OK`)**:
  ```json
  {
    "user": { "id": "usr_01", "name": "Hafidh Dark", "username": "hafidh", "email": "hafidh@pulse.app" },
    "wallet": { "id": "wal_01", "balance": 35000, "totalSaved": 15000, "currency": "NGN" },
    "unreadNotifications": 2
  }
  ```

---

### Feature 2: Wallet & Funding

#### `GET /api/wallet` *(Protected)*
- **Response (`200 OK`)**:
  ```json
  {
    "balance": 35000,
    "totalSaved": 15000,
    "currency": "NGN",
    "transactions": [
      {
        "id": "txn_03",
        "type": "SAVINGS_CONTRIBUTION",
        "direction": "DEBIT",
        "amount": 15000,
        "reference": "PLS-SAV-99182",
        "description": "Contribution to December Detty Group Plan",
        "createdAt": "2026-11-25T12:10:00.000Z"
      },
      {
        "id": "txn_01",
        "type": "FUND",
        "direction": "CREDIT",
        "amount": 50000,
        "reference": "PLS-FND-10293",
        "description": "Wallet funded via demo",
        "createdAt": "2026-11-25T12:05:00.000Z"
      }
    ]
  }
  ```
  *(Note: `type` is one of `FUND`, `P2P_SEND`, `P2P_RECEIVE`, `SAVINGS_CONTRIBUTION`, `REQUEST_PAYMENT`. `direction` is always `CREDIT` or `DEBIT`.)*

#### `POST /api/wallet/fund` *(Protected)*
- **Request Body**:
  ```json
  {
    "amount": 50000,
    "method": "demo",
    "reference": "optional_paystack_ref"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "message": "Wallet funded successfully",
    "wallet": { "balance": 50000, "currency": "NGN" },
    "transaction": {
      "id": "txn_01",
      "type": "FUND",
      "direction": "CREDIT",
      "amount": 50000,
      "reference": "PLS-FND-10293",
      "description": "Wallet funded via demo",
      "createdAt": "2026-11-25T12:05:00.000Z"
    }
  }
  ```

---

### Feature 3: Savings Plan Creation & Contributions

#### `GET /api/savings` *(Protected)*
Returns all savings plans the logged-in user created or joined.
- **Response (`200 OK`)**:
  ```json
  {
    "plans": [
      {
        "id": "pln_01",
        "title": "December Detty Group Plan",
        "description": "End of year trip pool",
        "type": "GROUP",
        "targetAmount": 100000,
        "currentAmount": 84000,
        "progressPercent": 84,
        "frequency": "WEEKLY",
        "inviteCode": "PLS-89X2",
        "deadline": "2026-12-20T00:00:00.000Z",
        "memberCount": 4,
        "myContribution": 35000
      }
    ],
    "personalPlans": [],
    "groupPlans": []
  }
  ```

#### `POST /api/savings` *(Protected)*
- **Request Body**:
  ```json
  {
    "title": "December Detty Group Plan",
    "description": "End of year trip pool",
    "type": "GROUP",
    "targetAmount": 100000,
    "frequency": "WEEKLY",
    "deadline": "2026-12-20"
  }
  ```
  *(Note: `type` is `"PERSONAL"` or `"GROUP"`. `frequency` is `"DAILY"`, `"WEEKLY"`, `"MONTHLY"`, or `"FLEXIBLE"`.)*
- **Response (`201 Created`)**:
  ```json
  {
    "plan": {
      "id": "pln_01",
      "title": "December Detty Group Plan",
      "description": "End of year trip pool",
      "type": "GROUP",
      "targetAmount": 100000,
      "currentAmount": 0,
      "progressPercent": 0,
      "frequency": "WEEKLY",
      "inviteCode": "PLS-89X2",
      "deadline": "2026-12-20T00:00:00.000Z"
    },
    "inviteCode": "PLS-89X2"
  }
  ```

#### `POST /api/savings/join` *(Protected)*
Lets a user join an existing `GROUP` savings plan using its `inviteCode`.
- **Request Body**:
  ```json
  {
    "inviteCode": "PLS-89X2"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "message": "Joined group savings plan",
    "plan": { "id": "pln_01", "title": "December Detty Group Plan", "inviteCode": "PLS-89X2" }
  }
  ```

#### `GET /api/savings/:id` *(Protected)*
Returns full plan details, member list, **Leaderboard**, and **Smart Pace Insights**.
- **Response (`200 OK`)**:
  ```json
  {
    "plan": {
      "id": "pln_01",
      "title": "December Detty Group Plan",
      "description": "End of year trip pool",
      "type": "GROUP",
      "targetAmount": 100000,
      "currentAmount": 84000,
      "progressPercent": 84,
      "frequency": "WEEKLY",
      "inviteCode": "PLS-89X2",
      "deadline": "2026-12-20T00:00:00.000Z"
    },
    "members": [
      {
        "userId": "usr_02",
        "name": "Lam",
        "username": "lam",
        "role": "ADMIN",
        "contributedAmount": 50000,
        "sharePercent": 59.5,
        "rank": 1,
        "badge": "🥇 Top Saver"
      },
      {
        "userId": "usr_01",
        "name": "Hafidh Dark",
        "username": "hafidh",
        "role": "MEMBER",
        "contributedAmount": 34000,
        "sharePercent": 40.5,
        "rank": 2,
        "badge": "⚡ Active Saver"
      }
    ],
    "leaderboard": [
      { "rank": 1, "username": "lam", "name": "Lam", "contributedAmount": 50000, "sharePercent": 59.5, "badge": "🥇 Top Saver" },
      { "rank": 2, "username": "hafidh", "name": "Hafidh Dark", "contributedAmount": 34000, "sharePercent": 40.5, "badge": "⚡ Active Saver" }
    ],
    "insights": {
      "remainingAmount": 16000,
      "daysRemaining": 25,
      "dailyPerMember": 320,
      "weeklyPerMember": 2240,
      "status": "ON_TRACK",
      "summary": "⚡ Smart Pace: Save ₦320/day per member to hit ₦100,000 on schedule."
    }
  }
  ```

#### `POST /api/savings/:id/contribute` *(Protected)*
Deducts `amount` from the user's main wallet, adds it to the savings plan, logs a transaction, and automatically posts an `ACTIVITY_ALERT` message to the plan's group chat.
- **Request Body**:
  ```json
  {
    "amount": 15000
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "message": "Contribution successful",
    "walletBalance": 35000,
    "plan": {
      "id": "pln_01",
      "currentAmount": 84000,
      "targetAmount": 100000,
      "progressPercent": 84
    },
    "transaction": { "id": "txn_03", "type": "SAVINGS_CONTRIBUTION", "amount": 15000 }
  }
  ```

---

### Feature 4: Group Savings Communication (Chat & Activity Feed)

#### `GET /api/savings/:id/messages` *(Protected)*
Returns all chat messages and automated system activity alerts inside the plan.
- **Response (`200 OK`)**:
  ```json
  {
    "messages": [
      {
        "id": "msg_01",
        "planId": "pln_01",
        "type": "ACTIVITY_ALERT",
        "content": "🔥 @lam contributed ₦15,000! Plan is now at 84% of target.",
        "sender": { "id": "usr_02", "name": "Lam", "username": "lam" },
        "metadata": { "amount": 15000, "progressPercent": 84 },
        "createdAt": "2026-11-25T12:10:00.000Z"
      },
      {
        "id": "msg_02",
        "planId": "pln_01",
        "type": "CHAT",
        "content": "Awesome! Dropping my final ₦10k contribution now 🚀",
        "sender": { "id": "usr_01", "name": "Hafidh Dark", "username": "hafidh" },
        "metadata": null,
        "createdAt": "2026-11-25T12:11:00.000Z"
      }
    ]
  }
  ```
  *(Note: `type` is `"CHAT"`, `"ACTIVITY_ALERT"`, or `"PAYMENT_REQUEST"`.)*

#### `POST /api/savings/:id/messages` *(Protected)*
Posts a new chat message to the savings plan and broadcasts it via Socket.io (`new_group_message`).
- **Request Body**:
  ```json
  {
    "content": "Awesome! Dropping my final ₦10k contribution now 🚀"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "message": {
      "id": "msg_02",
      "planId": "pln_01",
      "type": "CHAT",
      "content": "Awesome! Dropping my final ₦10k contribution now 🚀",
      "sender": { "id": "usr_01", "name": "Hafidh Dark", "username": "hafidh" },
      "createdAt": "2026-11-25T12:11:00.000Z"
    }
  }
  ```

---

### Feature 5: P2P Transfers & 1-Click Payment Requests

#### `GET /api/users/lookup?q=<usernameOrEmail>` *(Protected)*
Verifies a recipient before sending a P2P transfer.
- **Response (`200 OK`)**:
  ```json
  {
    "user": {
      "id": "usr_02",
      "name": "Lam",
      "username": "lam"
    }
  }
  ```

#### `POST /api/transfers/p2p` *(Protected)*
Atomically transfers funds from the logged-in user's wallet to `recipientUsername`'s wallet.
- **Request Body**:
  ```json
  {
    "recipientUsername": "lam",
    "amount": 10000,
    "note": "Lunch split"
  }
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "message": "Transfer successful",
    "newBalance": 25000,
    "transaction": {
      "id": "txn_04",
      "type": "P2P_SEND",
      "direction": "DEBIT",
      "amount": 10000,
      "reference": "PLS-P2P-77412",
      "description": "Transfer to @lam: Lunch split",
      "recipient": { "id": "usr_02", "name": "Lam", "username": "lam" },
      "createdAt": "2026-11-25T12:15:00.000Z"
    }
  }
  ```

#### `POST /api/transfers/request` *(Protected — Stretch Feature)*
Creates a 1-click payment request (optionally attached to a `planId` so it also posts into the group chat).
- **Request Body**:
  ```json
  {
    "amount": 5000,
    "description": "Uber split for the group",
    "planId": "pln_01"
  }
  ```
- **Response (`201 Created`)**:
  ```json
  {
    "paymentRequest": {
      "id": "req_01",
      "requester": { "id": "usr_02", "name": "Lam", "username": "lam" },
      "amount": 5000,
      "description": "Uber split for the group",
      "status": "PENDING",
      "planId": "pln_01",
      "createdAt": "2026-11-25T12:16:00.000Z"
    }
  }
  ```

#### `POST /api/transfers/request/:id/pay` *(Protected — Stretch Feature)*
Pays a pending payment request from the caller's wallet into the requester's wallet.
- **Response (`200 OK`)**:
  ```json
  {
    "message": "Payment request settled",
    "newBalance": 20000,
    "paymentRequest": { "id": "req_01", "status": "PAID", "paidBy": "hafidh" },
    "transaction": { "id": "txn_05", "type": "P2P_SEND", "amount": 5000 }
  }
  ```

---

### Feature 6: Notifications (Stretch Feature)

#### `GET /api/notifications` *(Protected)*
- **Response (`200 OK`)**:
  ```json
  {
    "unreadCount": 1,
    "notifications": [
      {
        "id": "notif_01",
        "title": "Money Received 💸",
        "body": "@hafidh sent you ₦10,000 (Lunch split)",
        "type": "P2P_RECEIVED",
        "isRead": false,
        "createdAt": "2026-11-25T12:15:00.000Z"
      }
    ]
  }
  ```

#### `PATCH /api/notifications/read-all` *(Protected)*
Marks all notifications for the logged-in user as read.
- **Response (`200 OK`)**: `{ "success": true, "unreadCount": 0 }`

---

## 4. Real-Time Socket.io Contract

Connect using `socket.io-client` and pass the JWT token in `auth`:
```javascript
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
  auth: { token: localStorage.getItem('pulse_token') }
});
```

### Events to Emit (Frontend → Backend)
| Event | Payload | When to Emit |
| :--- | :--- | :--- |
| `join:plan` *(or `join_plan_room`)* | `"pln_01"` *(or `{ "planId": "pln_01" }`)* | When viewing a savings plan page |
| `leave:plan` *(or `leave_plan_room`)* | `"pln_01"` *(or `{ "planId": "pln_01" }`)* | When leaving a savings plan page |
| `join:user` | `"usr_01"` *(or `{ "userId": "usr_01" }`)* | On login/session restore to join personal notification room |

### Events to Listen For (Backend → Frontend)
| Event | Payload | What Happened |
| :--- | :--- | :--- |
| `chat:message` | `{ "id": "msg_01", "planId": "pln_01", "type": "CHAT" \| "ACTIVITY_ALERT", "content": "...", "sender": { ... }, "metadata": { ... } }` | A chat message, deposit `ACTIVITY_ALERT`, or `PAYMENT_REQUEST` was posted in `planId` |
| `savings:updated` | `{ "plan": { ... }, "contribution": { ... }, "contributor": { ... } }` | Someone contributed to the savings plan |
| `savings:member_joined` | `{ "planId": "pln_01", "user": { ... } }` | A new member joined the group savings plan via invite code |
| `wallet:updated` | `{ "balance": 45000, "currency": "NGN" }` | Logged-in user's wallet balance changed (e.g. funded, contributed, or P2P transfer) |
| `p2p:received` | `{ "from": { ... }, "amount": 15000, "note": "..." }` | Logged-in user received an instant P2P transfer |
| `notification:new` | `{ "notification": { "id": "...", "title": "...", "message": "...", "body": "...", "type": "..." } }` | New real-time notification arrived for the logged-in user |
| `transfer:request_created` | `{ "id": "req_01", "planId": "pln_01", "amount": 5000, "status": "PENDING", ... }` | A group bill split / payment request was created |
| `transfer:request_paid` | `{ "id": "req_01", "planId": "pln_01", "amount": 5000, "status": "PAID", "paidBy": "hafidh", ... }` | A group bill split / payment request was settled |
