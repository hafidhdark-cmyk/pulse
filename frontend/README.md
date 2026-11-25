# Pulse Frontend Workspace — API Contract & Handoff Guide (`@h@fidhdark..`)

Welcome to the **Pulse** Monorepo! The backend API + Socket.io real-time server lives in `../backend/` and is pre-configured to work out-of-the-box on your laptop (`npm run dev` from root) and in production on **Nobus Cloud** via Docker Compose + Nginx reverse proxy.

---

## 1. Quickstart for Frontend Development

1. From the monorepo root (`pulse-backend/`), start the backend API on port `4000`:
   ```bash
   npm run dev:backend
   ```
   *(No local PostgreSQL installation required—the backend automatically falls back to a local store when `DATABASE_URL` is blank!)*
2. In your frontend app (e.g., Vite + React / Next / Vue inside `frontend/`):
   - Use relative `/api` paths in production (Nginx automatically proxies `/api/*` and `/socket.io/*` to `http://backend:4000`).
   - During local Vite dev, add a proxy in `vite.config.js` or set `VITE_API_URL=http://localhost:4000`:
     ```js
     export default defineConfig({
       server: {
         proxy: {
           '/api': 'http://localhost:4000',
           '/socket.io': {
             target: 'http://localhost:4000',
             ws: true
           }
         }
       }
     });
     ```

---

## 2. REST API Endpoints (`/api`)

All protected endpoints require the header:
```http
Authorization: Bearer <token>
```

### A. Authentication & User Lookup
- **`POST /api/auth/register`**
  - Body: `{ "name": "Layi", "email": "lam@pulse.ng", "username": "lam", "password": "password123" }`
  - Returns (`201`): `{ "token": "<jwt>", "user": { "id", "name", "username", "email", "avatarColor" }, "wallet": { "balance": 0, "currency": "NGN" } }`
- **`POST /api/auth/login`**
  - Body: `{ "emailOrUsername": "lam", "password": "password123" }`
  - Returns (`200`): `{ "token": "<jwt>", "user": { ... }, "wallet": { "balance": 0, "currency": "NGN" } }`
- **`GET /api/auth/me`**
  - Returns (`200`): `{ "user": { ... }, "wallet": { ... }, "unreadNotifications": 1 }`
- **`GET /api/users/lookup?q=hafidh`**
  - Returns (`200`): `{ "user": { "id", "name", "username", "avatarColor" }, "users": [...] }`

### B. Digital Wallet (`NGN ₦`)
- **`GET /api/wallet`**
  - Returns (`200`):
    ```json
    {
      "balance": 35000,
      "totalSaved": 20000,
      "currency": "NGN",
      "transactions": [
        {
          "id": "txn_...",
          "type": "WALLET_FUND",
          "amount": 50000,
          "currency": "NGN",
          "reference": "PLS-FUND-...",
          "description": "Instant Demo Wallet Top-Up (...)",
          "createdAt": "2026-11-25T12:00:00.000Z"
        }
      ]
    }
    ```
- **`POST /api/wallet/fund`**
  - Body: `{ "amount": 50000, "method": "demo" }` *(or `"method": "paystack", "reference": "T12345"`)*
  - Returns (`200`): `{ "message": "...", "wallet": { "balance": 50000, "currency": "NGN" }, "transaction": { ... } }`

### C. Personal & Group Savings Plans
- **`GET /api/savings`**
  - Returns (`200`): `{ "personalPlans": [...], "groupPlans": [...] }`
- **`POST /api/savings`**
  - Body:
    ```json
    {
      "title": "Nobus Hackathon Squad",
      "description": "Server & launch kitty",
      "targetAmount": 100000,
      "type": "GROUP",
      "frequency": "WEEKLY",
      "deadline": "2026-12-31T00:00:00.000Z"
    }
    ```
  - Returns (`201`): `{ "plan": { ... }, "inviteCode": "PLS-9X4K2" }`
- **`POST /api/savings/join`**
  - Body: `{ "inviteCode": "PLS-9X4K2" }`
  - Returns (`200`): `{ "plan": { ... }, "membership": { ... } }`
- **`GET /api/savings/:id`**
  - Returns (`200`):
    - `plan`: plan details (`currentAmount`, `targetAmount`, `inviteCode`, `status`)
    - `members`: list of group members & their contributions
    - `leaderboard`: ranked members with `rank`, `sharePercentage`, and `badge` (`🥇 Top Saver`, `🥈 Runner-Up Saver`, `⚡ Active Saver`)
    - `insights`: `{ completionPercentage, remainingAmount, daysRemaining, dailyPerMember, weeklyPerMember, recommendation }`
- **`POST /api/savings/:id/contribute`**
  - Body: `{ "amount": 25000 }`
  - Returns (`200`): `{ "plan": { ... }, "walletBalance": 10000, "contribution": { ... } }`

### D. Group Savings Chat & Automated Activity Feed
- **`GET /api/savings/:id/messages`**
  - Returns (`200`):
    ```json
    {
      "messages": [
        {
          "id": "msg_...",
          "planId": "pln_...",
          "sender": { "id": "usr_...", "name": "Layi", "username": "lam", "avatarColor": "#2563EB" },
          "content": "💰 @lam contributed ₦25,000 to \"Nobus Hackathon Squad\" (25% of target reached)!",
          "type": "ACTIVITY_ALERT",
          "createdAt": "2026-11-25T12:05:00.000Z"
        }
      ]
    }
    ```
- **`POST /api/savings/:id/messages`**
  - Body: `{ "content": "Let's hit 50% before Friday!" }`
  - Returns (`201`): `{ "message": { ... } }`

### E. Instant P2P Transfers & 1-Click Bill Split Requests
- **`POST /api/transfers/p2p`**
  - Body: `{ "recipientUsername": "hafidh", "amount": 15000, "note": "Lunch split" }`
  - Returns (`200`): `{ "transaction": { ... }, "newBalance": 35000, "recipient": { ... } }`
- **`POST /api/transfers/request`**
  - Body: `{ "amount": 5000, "description": "Domain renewal split", "planId": "pln_..." }`
  - Returns (`201`): `{ "paymentRequest": { "id": "req_...", "status": "PENDING", ... } }`
- **`POST /api/transfers/request/:id/pay`**
  - Returns (`200`): `{ "paymentRequest": { "status": "PAID", ... }, "transaction": { ... }, "newBalance": 10000 }`

### F. Notifications
- **`GET /api/notifications`** -> `{ "notifications": [...], "unreadCount": 2 }`
- **`PATCH /api/notifications/read-all`** -> `{ "success": true }`

---

## 3. Real-Time Socket.io Events

Connect using `socket.io-client`:
```js
import { io } from 'socket.io-client';

const socket = io('/', {
  auth: { token: localStorage.getItem('pulse_token') }
});

// Join a group savings room to receive live chat & contribution alerts
socket.emit('join:plan', planId);

// Listen for new group messages & activity alerts
socket.on('chat:message', (message) => {
  // message.type is 'CHAT' or 'ACTIVITY_ALERT'
});

// Listen for live savings progress updates
socket.on('savings:updated', ({ plan, contribution, contributor }) => {});

// Listen for live wallet & P2P notifications
socket.on('wallet:updated', ({ balance }) => {});
socket.on('notification:new', (notif) => {});
socket.on('p2p:received', ({ from, amount, note }) => {});
```
