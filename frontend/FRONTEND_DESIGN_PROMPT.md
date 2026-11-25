# Pulse — Master Frontend Design & Engineering Prompt / Brief

> **How to use this file**: Copy and paste the prompt below directly into your AI coding assistant (Cursor, Antigravity, v0, Bolt, Claude, etc.) inside the `frontend/` directory, or use it as the official design & responsive UI specification for `@h@fidhdark..`.

---

```markdown
You are a Principal Fintech Product Designer and Senior Frontend Engineer. Build the complete, production-ready frontend for **Pulse** inside the `frontend/` directory of this monorepo.

Before writing code, read `frontend/FRONTEND_IMPLEMENTATION_PLAN.md` for the exact REST API endpoints, request/response JSON contracts, and Socket.io real-time events already implemented by our backend (`backend/`).

---

## 1. PRODUCT IDENTITY & VALUE PROPOSITION
- **Product Name**: Pulse (`pulse.myupside.site`)
- **Tagline**: *"Save Together. Grow Faster."*
- **Category**: Social Fintech & Multiplayer Savings Platform (NGN `₦`)
- **Brand Vibe**: High-trust, modern Nigerian/African social fintech (think PiggyVest + Wise + Monzo + Telegram). Clean ice-blue surfaces, electric royal-blue gradients, crisp pill badges, bold tabular Naira (`₦`) typography, and real-time multiplayer energy.
- **Logo Asset**: Use `../presentation/pulse-logo.png` (copy it into `frontend/src/assets/pulse-logo.png`). On dark/blue gradient surfaces, render the logo inside a clean white rounded pill (`background: #FFFFFF`, `border-radius: 12px`, `padding: 8px 14px`). On light surfaces, render the transparent logo directly.
- **Signature Visual Motif**: Subtle concentric radar/pulse rings (`rgba(255,255,255,0.06)`) and an ECG pulse waveform line in hero cards.

---

## 2. BRAND DESIGN SYSTEM & TOKENS

### Typography
- **Font Family**: `'Poppins', -apple-system, BlinkMacSystemFont, sans-serif` (Load weights `400, 500, 600, 700, 800` from Google Fonts).
- **Currency Formatting**: Always format currency in Naira (`₦`) with commas (e.g., `₦84,000.00` or `₦15,000`). Use `font-variant-numeric: tabular-nums` on all balances, progress percentages, and transaction amounts.

### Color Palette (Exact Brand Tokens)
- **App Canvas Background**: `#F4F8FF` (Soft ice-blue background across all authenticated screens)
- **Card / Surface**: `#FFFFFF` with `1px solid #DCE7F9` border and subtle elevation `0 4px 14px rgba(29, 78, 216, 0.04)`
- **Primary Brand Blue**: `#1D4ED8` (hover: `#1E40AF`, active/light accent: `#2563EB`)
- **Electric Cyan Accent**: `#0EA5E9` / `#0284C7` (used for `GROUP PLAN` pills, secondary highlights, and progress bar gradients)
- **Brand Hero Gradient**: `linear-gradient(125deg, #1E3FA3 0%, #235EE3 52%, #1994E8 100%)`
- **Progress Bar Fill Gradient**: `linear-gradient(90deg, #1D4ED8 0%, #0EA5E9 100%)` (track background: `#E2E8F0`)
- **Text Hierarchy**:
  - Primary Ink / Headings: `#0F172A`
  - Secondary Body: `#475569` / `#52627A`
  - Muted / Captions: `#64748B`
- **Semantic Status Pills**:
  - **Success / Credit / Live**: Background `#DCFCE7`, Text `#15803D` (e.g. `● Live Feed`, `+₦50,000`, `🥇 Top Saver`)
  - **Info / Smart Pace / Activity Alert**: Background `#E0F2FE` or `#EFF6FF`, Text `#1D4ED8` (e.g. `⚡ Smart Pace`, `🔥 Milestone Alert`)
  - **Warning / Pending Request**: Background `#FEF3C7`, Text `#B45309`
  - **Danger / Debit**: Background `#FEE2E2`, Text `#B91C1C`

### Border Radii & Components
- **Outer Cards**: `rounded-2xl` (`16px`) with `border-[#DCE7F9]`
- **Buttons & Inputs**: `rounded-xl` (`12px`), `h-11` or `h-12` for easy mobile tap targets (`>= 44px`)
- **Badges & Tags**: `rounded-full` (`9999px`), uppercase or bold micro-copy (`11px–12px`, `font-semibold`)

---

## 3. RESPONSIVE ARCHITECTURE (MOBILE vs. DESKTOP)

Design mobile-first (`375px–430px`) and scale up seamlessly to desktop (`1280px–1440px`):

### Desktop Layout (`lg: >= 1024px`)
1. **Navigation**: Left vertical sidebar (`240px` wide, white surface, `#DCE7F9` right border) OR sticky top glass header with navigation links (`Dashboard`, `Savings Plans`, `P2P Transfer`), active `@username` pill, and a live `NotificationBell` popover dropdown.
2. **Dashboard Grid**: 12-column layout (`max-w-7xl mx-auto px-6 py-8 gap-6`):
   - **Top Row**: Full-width or 8-col **Brand Gradient Wallet Hero Card** (showing Available Wallet Balance, Total Saved Across Plans, and 4 quick-action buttons: `+ Fund Wallet`, `↗ Send P2P`, `+ New Plan`, `# Join Code`) paired with a 4-col **Quick Stats / Smart Insights Card**.
   - **Main Body**: 7-col **Active Savings Plans Grid** (filterable by `All`, `Group Plans`, `Personal Plans`) alongside a 5-col **Wallet Transaction Ledger Feed**.
3. **Group Savings Plan Room (`/savings/:id`) — Desktop Split View**:
   - **Left Column (55% width)**: Vault overview card (Pooled Balance, `currentAmount / targetAmount` progress bar, `PLS-XXXX` one-click copy invite code pill, `+ Contribute from Wallet` CTA, `⚡ Smart Pace` banner, and the **Member Contributor Leaderboard** with `🥇 Top Saver` badges).
   - **Right Column (45% width, fixed height scrollable panel)**: **Live Group Chat & Activity Feed** (`● Live Feed` badge, unified stream of member chat bubbles, centered `🔥 ACTIVITY_ALERT` deposit pills, interactive `PAYMENT_REQUEST` split cards with a 1-click `Pay ₦X` button, and sticky message composer at the bottom).
4. **Modals**: Centered dialog modals (`max-w-md rounded-2xl`) with backdrop blur.

### Mobile Layout (`< 768px`)
1. **Top App Bar**: Compact sticky header (`h-14 px-4`) with Pulse logo on the left, `@username` chip and Notification Bell (with unread red dot/count) on the right.
2. **Bottom Navigation Bar**: Fixed native-style bottom bar (`h-16 bg-white border-t border-[#DCE7F9] z-40`) with 4 tabs:
   - `Home` (Wallet & Ledger)
   - `Savings` (Personal & Group Plans)
   - `Transfer` (P2P Lookup & Send)
   - `Alerts` (Notifications & Split Requests)
3. **Mobile Wallet Hero Card**: Compact rounded-2xl gradient card with large Naira balance (`₦35,000.00`), subtle ECG pulse SVG watermark, and a 4-icon horizontal action row (`Fund`, `Send`, `Save`, `Join`).
4. **Group Savings Plan Room (`/savings/:id`) — Mobile Segmented View**:
   - Because side-by-side columns squeeze mobile screens, render a sticky **Segmented Pill Switcher** right below the plan header on mobile:
     - **Tab 1: `Vault & Leaderboard`** (Progress card, Contribute CTA, Smart Pace insight, Invite code copy button, Member leaderboard).
     - **Tab 2: `Live Chat (●)`** (Full-height WhatsApp/Telegram-style chat view with sticky bottom input bar so the mobile keyboard never covers the input).
5. **Mobile Modals**: Slide-up **Bottom Sheets** (`rounded-t-3xl`) for `FundWallet`, `Contribute`, `CreatePlan`, and `P2PTransfer` for effortless thumb reach.

---

## 4. CORE USER FLOWS & SCREENS TO BUILD

### Flow 1: Authentication (`/auth`)
- Split screen on desktop (Left: Blue gradient brand hero with `"Save Together. Grow Faster."`, ECG pulse graphic, and social proof pills; Right: clean auth card). Single card with top gradient header on mobile.
- Toggle between **Sign In** (`POST /api/auth/login` with `emailOrUsername` + `password`) and **Create Account** (`POST /api/auth/register` with `name`, `@username`, `email`, `password`).
- Persist JWT in `localStorage` under `pulse_token`.

### Flow 2: Wallet Funding (`FundWalletModal`)
- Quick-select Naira chips: `+₦5,000`, `+₦10,000`, `+₦25,000`, `+₦50,000`, `+₦100,000` plus custom numeric input.
- Method selector:
  1. **Instant Demo Deposit** (`method: "demo"`) — 1-click instant credit for hackathon demoing.
  2. **Paystack Checkout** (`method: "paystack"`) — simulated/test reference verification.
- Calls `POST /api/wallet/fund`, plays a crisp success state, and updates wallet balance + ledger immediately.

### Flow 3: Personal & Group Savings Plans (`CreatePlanModal`, `JoinGroupModal`, `/savings/:id`)
- **Create Plan (`POST /api/savings`)**: Choose `PERSONAL` or `GROUP`, title (e.g. `"December Detty Group Plan"`), description, target amount (`₦`), contribution frequency (`DAILY`, `WEEKLY`, `MONTHLY`, `FLEXIBLE`), and target deadline.
- **Join Group with Code (`POST /api/savings/join`)**: Enter a 6-character code (`PLS-XXXX`) to join a friend's group vault.
- **Contribute from Wallet (`POST /api/savings/:id/contribute`)**: Deducts from the user's main NGN wallet, updates the vault progress bar, and automatically posts an `ACTIVITY_ALERT` into the group chat.

### Flow 4: Group Savings Communication & 1-Click Bill Splits (`/savings/:id`)
- Connect to Socket.io (`join_plan_room` with `{ planId }`) and load history from `GET /api/savings/:id/messages`.
- Render 3 distinct message item styles in the feed:
  1. `type === "CHAT"`: Standard chat bubble with sender initials avatar (`LA`, `HF`), `@username`, timestamp, and message text (right-aligned in brand blue `#1D4ED8` for current user, left-aligned in `#EFF6FF` / white for others).
  2. `type === "ACTIVITY_ALERT"`: Centered pill banner (`bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-full px-4 py-1.5 text-xs font-semibold`) e.g. `"🔥 @lam contributed ₦15,000! Plan is now at 84% of target."`
  3. `type === "PAYMENT_REQUEST"`: Interactive card inside the chat stream showing requester, description (`"Uber split"`), amount (`₦5,000`), status badge (`PENDING` or `PAID`), and a **`Pay ₦5,000`** button that calls `POST /api/transfers/request/:id/pay`.
- Include a **`Request / Split ₦`** quick button next to the chat input (`POST /api/transfers/request` with `{ amount, description, planId }`).

### Flow 5: Instant P2P Transfer (`P2PTransferModal`)
- Live `@username` lookup input: debounce calls to `GET /api/users/lookup?q=<username>`.
- Show a verified green recipient badge (`✓ Verified: Lam (@lam)`) once matched, or a clear error if not found.
- Enter amount (`₦`) + optional note → submit to `POST /api/transfers/p2p` → render a shareable **Transfer Receipt** view with transaction reference (`PLS-P2P-XXXXX`) and timestamp.

### Flow 6: Real-Time Notifications (`NotificationBell`)
- Fetch initial notifications from `GET /api/notifications` and listen to Socket.io `notification` and `wallet_updated` events.
- Show toast popup on incoming P2P transfers or group activity + unread count badge on the bell icon + `"Mark all read"` (`PATCH /api/notifications/read-all`).

---

## 5. TECHNICAL & MONOREPO CONSTRAINTS
- Build inside `frontend/` using **React + Vite + Tailwind CSS + Lucide React + `socket.io-client`**.
- Configure `vite.config.js` to proxy `/api` and `/socket.io` to `http://localhost:4000` in local dev, while supporting `import.meta.env.VITE_API_URL` and `import.meta.env.VITE_SOCKET_URL` when pointing directly to our remote **Nobus Cloud** backend URL.
- Ensure `npm run build` outputs cleanly to `frontend/dist` so `frontend/Dockerfile` and `frontend/nginx.conf` can serve the production build on port `80`.
```
