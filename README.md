# Pulse — Social Wallet & Multiplayer Savings Platform

Built for the Hackathon & deployed on **Nobus Cloud** via Docker Compose.

## Repository Structure (Monorepo)

- **[`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md)** — Full Monorepo, Backend Architecture, Database Schema & Nobus Cloud Deployment Plan.
- **[`frontend/FRONTEND_IMPLEMENTATION_PLAN.md`](./frontend/FRONTEND_IMPLEMENTATION_PLAN.md)** — Frontend Integration Guide, Complete REST API Request/Response JSON Payloads, and Real-Time Socket.io Events Contract (for `@h@fidhdark..`).
- **[`presentation/Pulse_Hackathon_Deck_Updated.pdf`](./presentation/Pulse_Hackathon_Deck_Updated.pdf)** — Updated 10-slide Hackathon Presentation Deck aligned with our live MVP features.
- **`backend/`** — Node.js + Express + Socket.io + PostgreSQL (Nobus DB) API server.
- **`frontend/`** — Frontend application + Nginx reverse proxy container.

---

## Core MVP Features
1. **Authentication** (`/api/auth/*`) — JWT auth with unique `@username` tags.
2. **Wallet Funding** (`/api/wallet/*`) — `NGN (₦)` wallet with instant demo top-up, Paystack verification, and atomic double-entry transaction ledger.
3. **Savings Plan Creation** (`/api/savings/*`) — Personal & Group savings plans with targets, deadlines, 6-character group invite codes (`PLS-XXXX`), and wallet-to-plan contributions.
4. **Group Savings Communication** (`/api/savings/:id/messages` + Socket.io) — Live group chat inside each savings plan with automated deposit and milestone alerts.
5. **P2P Transfers** (`/api/transfers/p2p` + `/api/users/lookup`) — Instant `@username` wallet-to-wallet transfers.

## Stretch Features
6. **Real-Time Notifications** (`/api/notifications` + Socket.io `notification` event).
7. **Group Contributor Leaderboard** (included in `GET /api/savings/:id`).
8. **Smart Savings Pace Insights** (included in `GET /api/savings/:id`).
9. **1-Click Payment Request / Bill Split** (`POST /api/transfers/request` & `POST /api/transfers/request/:id/pay`).
