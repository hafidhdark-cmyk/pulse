require('dotenv').config();
const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const db = require('./db');
const { initSocket } = require('./socket');

const authRoutes = require('./routes/auth.routes');
const walletRoutes = require('./routes/wallet.routes');
const savingsRoutes = require('./routes/savings.routes');
const chatRoutes = require('./routes/chat.routes');
const transferRoutes = require('./routes/transfer.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();
const BOOT_TIME = new Date().toISOString();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  })
);
app.use(express.json());

const ENDPOINTS_CATALOG = [
  {
    category: 'Health',
    method: 'GET',
    path: '/api/health',
    auth: false,
    description: 'Health check and service status'
  },
  {
    category: 'Auth',
    method: 'POST',
    path: '/api/auth/register',
    auth: false,
    body: { name: 'Layi', email: 'lam@pulse.ng', username: 'lam', password: 'password123' },
    response: '{ token, user: { id, name, username, email, avatarColor }, wallet: { balance, currency: "NGN" } }'
  },
  {
    category: 'Auth',
    method: 'POST',
    path: '/api/auth/login',
    auth: false,
    body: { emailOrUsername: 'lam', password: 'password123' },
    response: '{ token, user, wallet }'
  },
  {
    category: 'Auth',
    method: 'GET',
    path: '/api/auth/me',
    auth: true,
    response: '{ user, wallet, unreadNotifications }'
  },
  {
    category: 'Users',
    method: 'GET',
    path: '/api/users/lookup?q=<username>',
    auth: true,
    response: '{ user: { id, name, username, avatarColor }, users: [...] }'
  },
  {
    category: 'Wallet',
    method: 'GET',
    path: '/api/wallet',
    auth: true,
    response: '{ balance, totalSaved, currency: "NGN", wallet, transactions: [...] }'
  },
  {
    category: 'Wallet',
    method: 'POST',
    path: '/api/wallet/fund',
    auth: true,
    body: { amount: 50000, method: 'demo', reference: 'optional-paystack-ref' },
    response: '{ message, wallet: { balance, currency: "NGN" }, transaction }'
  },
  {
    category: 'Savings',
    method: 'GET',
    path: '/api/savings',
    auth: true,
    response: '{ personalPlans: [...], groupPlans: [...] }'
  },
  {
    category: 'Savings',
    method: 'POST',
    path: '/api/savings',
    auth: true,
    body: {
      title: 'Nobus Hackathon Squad',
      description: 'Server & launch fund',
      targetAmount: 100000,
      type: 'GROUP',
      frequency: 'WEEKLY',
      deadline: '2026-12-31T00:00:00.000Z'
    },
    response: '{ plan, inviteCode: "PLS-XXXXX" }'
  },
  {
    category: 'Savings',
    method: 'POST',
    path: '/api/savings/join',
    auth: true,
    body: { inviteCode: 'PLS-XXXXX' },
    response: '{ plan, membership }'
  },
  {
    category: 'Savings',
    method: 'GET',
    path: '/api/savings/:id',
    auth: true,
    response: '{ plan, members: [...], leaderboard: [...], insights: { completionPercentage, remainingAmount, daysRemaining, dailyPerMember, weeklyPerMember, recommendation } }'
  },
  {
    category: 'Savings',
    method: 'POST',
    path: '/api/savings/:id/contribute',
    auth: true,
    body: { amount: 20000 },
    response: '{ plan, walletBalance, contribution }'
  },
  {
    category: 'Savings',
    method: 'POST',
    path: '/api/savings/:id/withdraw',
    auth: true,
    body: { amount: 5000, reason: 'Optional reason (required for group requests)' },
    response: '{ mode: "INSTANT" | "APPROVAL_REQUIRED", plan?, walletBalance?, withdrawalRequest? }'
  },
  {
    category: 'Savings',
    method: 'POST',
    path: '/api/savings/:id/withdrawals/:withdrawalId/approve',
    auth: true,
    body: { action: 'APPROVE' },
    response: '{ withdrawalRequest, disbursed, plan? }'
  },
  {
    category: 'Group Chat',
    method: 'GET',
    path: '/api/savings/:id/messages',
    auth: true,
    response: '{ messages: [{ id, planId, sender, content, type: "CHAT" | "ACTIVITY_ALERT", createdAt }] }'
  },
  {
    category: 'Group Chat',
    method: 'POST',
    path: '/api/savings/:id/messages',
    auth: true,
    body: { content: 'We just hit 25% of our target!' },
    response: '{ message }'
  },
  {
    category: 'P2P Transfers',
    method: 'POST',
    path: '/api/transfers/p2p',
    auth: true,
    body: { recipientUsername: 'hafidh', amount: 15000, note: 'Lunch split' },
    response: '{ transaction, newBalance, recipient }'
  },
  {
    category: 'P2P Transfers',
    method: 'POST',
    path: '/api/transfers/request',
    auth: true,
    body: { amount: 5000, description: 'Domain split', planId: 'optional-group-plan-id' },
    response: '{ paymentRequest }'
  },
  {
    category: 'P2P Transfers',
    method: 'POST',
    path: '/api/transfers/request/:id/pay',
    auth: true,
    response: '{ paymentRequest, transaction, newBalance }'
  },
  {
    category: 'Notifications',
    method: 'GET',
    path: '/api/notifications',
    auth: true,
    response: '{ notifications: [...], unreadCount }'
  },
  {
    category: 'Notifications',
    method: 'PATCH',
    path: '/api/notifications/read-all',
    auth: true,
    response: '{ success: true }'
  }
];

function collectBackendFiles(baseDir, relDir = '') {
  const results = [];
  const fullDir = path.join(baseDir, relDir);
  if (!fs.existsSync(fullDir)) return results;

  const entries = fs.readdirSync(fullDir, { withFileTypes: true });
  for (const entry of entries) {
    if (['node_modules', '.git', '.data', 'package-lock.json'].includes(entry.name)) continue;
    const relPath = relDir ? `${relDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      results.push(...collectBackendFiles(baseDir, relPath));
    } else if (/\.(js|sql|json)$/i.test(entry.name) || entry.name === 'Dockerfile') {
      try {
        const content = fs.readFileSync(path.join(baseDir, relPath), 'utf8');
        results.push({
          path: `backend/${relPath}`,
          size: Buffer.byteLength(content, 'utf8'),
          lines: content.split('\n').length,
          content
        });
      } catch (e) {
        // skip unreadable file
      }
    }
  }
  return results;
}

// Health & Nobus status endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'pulse-backend',
    currency: 'NGN',
    bootTime: BOOT_TIME,
    timestamp: new Date().toISOString()
  });
});

// Source code inspection endpoint (for Vercel-like Source view)
app.get('/api/source', (req, res) => {
  const backendRoot = path.join(__dirname, '..');
  const files = collectBackendFiles(backendRoot);
  res.json({
    project: 'pulse-backend',
    deployedAt: BOOT_TIME,
    filesCount: files.length,
    files
  });
});

// Machine-readable API docs catalog
app.get('/api/docs', (req, res) => {
  res.json({
    name: 'Pulse Social Fintech MVP API',
    version: '1.0.0',
    currency: 'NGN (₦)',
    authHeader: 'Authorization: Bearer <token>',
    socketEvents: {
      emit: ['join:plan', 'leave:plan', 'join:user', 'chat:send'],
      listen: [
        'chat:message',
        'savings:updated',
        'savings:member_joined',
        'wallet:updated',
        'notification:new',
        'p2p:received',
        'transfer:request_created',
        'transfer:request_paid'
      ]
    },
    endpoints: ENDPOINTS_CATALOG
  });
});

function renderVercelStyleDashboard(req, res) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Pulse Backend — Nobus Cloud Deployment & Source Explorer</title>
  <style>
    :root {
      --bg: #090d16;
      --panel: #111827;
      --panel-2: #1e293b;
      --border: #263248;
      --text: #f8fafc;
      --muted: #94a3b8;
      --accent: #3b82f6;
      --green: #10b981;
      --purple: #8b5cf6;
      --amber: #f59e0b;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
      background: var(--bg);
      color: var(--text);
    }
    header {
      border-bottom: 1px solid var(--border);
      background: rgba(17, 24, 39, 0.85);
      backdrop-filter: blur(8px);
      padding: 16px 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .brand { display: flex; align-items: center; gap: 12px; }
    .logo-badge {
      width: 36px; height: 36px; border-radius: 9px;
      background: linear-gradient(135deg, #2563eb, #7c3aed);
      display: flex; align-items: center; justify-content: center;
      font-weight: 800; font-size: 18px;
    }
    .status-pill {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(16, 185, 129, 0.14); color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
      padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 600;
    }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--green); box-shadow: 0 0 8px var(--green); }
    .container { max-width: 1320px; margin: 0 auto; padding: 24px 28px; }
    .tabs {
      display: flex; gap: 8px; border-bottom: 1px solid var(--border);
      margin-bottom: 24px; padding-bottom: 12px;
    }
    .tab-btn {
      background: transparent; color: var(--muted);
      border: 1px solid transparent; padding: 8px 16px;
      border-radius: 8px; cursor: pointer; font-weight: 600; font-size: 14px;
    }
    .tab-btn.active {
      background: var(--panel-2); color: var(--text); border-color: var(--border);
    }
    .grid-cards {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 16px; margin-bottom: 24px;
    }
    .card {
      background: var(--panel); border: 1px solid var(--border);
      border-radius: 12px; padding: 18px;
    }
    .card-label { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
    .card-val { font-size: 20px; font-weight: 700; margin-top: 8px; word-break: break-all; }
    .source-layout {
      display: grid; grid-template-columns: 300px 1fr; gap: 16px;
      min-height: 580px;
    }
    .file-list {
      background: var(--panel); border: 1px solid var(--border);
      border-radius: 12px; overflow: hidden;
    }
    .file-list-header {
      padding: 12px 16px; border-bottom: 1px solid var(--border);
      font-weight: 600; font-size: 13px; color: var(--muted);
    }
    .file-item {
      padding: 10px 16px; border-bottom: 1px solid rgba(38,50,72,0.5);
      cursor: pointer; font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 13px; display: flex; justify-content: space-between; align-items: center;
    }
    .file-item:hover { background: rgba(59, 130, 246, 0.08); }
    .file-item.active { background: rgba(59, 130, 246, 0.18); color: #60a5fa; font-weight: 600; }
    .code-viewer {
      background: #0b101b; border: 1px solid var(--border);
      border-radius: 12px; display: flex; flex-direction: column; overflow: hidden;
    }
    .code-header {
      padding: 12px 18px; background: var(--panel); border-bottom: 1px solid var(--border);
      display: flex; justify-content: space-between; align-items: center;
      font-family: ui-monospace, monospace; font-size: 13px;
    }
    pre {
      margin: 0; padding: 18px; overflow: auto;
      font-family: ui-monospace, SFMono-Regular, Consolas, monospace;
      font-size: 13px; line-height: 1.55; color: #e2e8f0; max-height: 640px;
    }
    .endpoint-row {
      background: var(--panel); border: 1px solid var(--border);
      border-radius: 10px; padding: 14px 18px; margin-bottom: 10px;
      display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
    }
    .method {
      font-family: ui-monospace, monospace; font-size: 12px; font-weight: 700;
      padding: 4px 10px; border-radius: 6px; min-width: 64px; text-align: center;
    }
    .method-GET { background: rgba(16, 185, 129, 0.15); color: #34d399; }
    .method-POST { background: rgba(59, 130, 246, 0.18); color: #60a5fa; }
    .method-PATCH { background: rgba(245, 158, 11, 0.18); color: #fbbf24; }
    .ep-path { font-family: ui-monospace, monospace; font-size: 14px; font-weight: 600; }
    .btn-link {
      display: inline-block; background: var(--accent); color: white;
      text-decoration: none; padding: 8px 14px; border-radius: 8px;
      font-size: 13px; font-weight: 600;
    }
    .hidden { display: none; }
    @media (max-width: 820px) { .source-layout { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="logo-badge">P</div>
      <div>
        <div style="font-weight:700;font-size:16px;">pulse-backend <span style="color:var(--muted);font-weight:400;">/ production</span></div>
        <div style="font-size:12px;color:var(--muted);">Hosted on Nobus Cloud (Ubuntu 24.04 • Docker Compose • PostgreSQL 16)</div>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:12px;">
      <span class="status-pill"><span class="dot"></span> Ready • Online</span>
      <a class="btn-link" href="http://102.209.47.224:8080/?pgsql=db&username=pulse&db=pulsedb" target="_blank">Open PostgreSQL GUI (:8080)</a>
    </div>
  </header>

  <div class="container">
    <div class="grid-cards">
      <div class="card">
        <div class="card-label">Deployment Environment</div>
        <div class="card-val">Nobus Cloud FCS</div>
        <div style="color:var(--muted);font-size:12px;margin-top:4px;">IP: 102.209.47.224 (PostgreSQL 16)</div>
      </div>
      <div class="card">
        <div class="card-label">REST API Base URL</div>
        <div class="card-val" style="color:#60a5fa;font-size:16px;" id="api-base-url">/api</div>
        <div style="color:var(--muted);font-size:12px;margin-top:4px;">19 Active Endpoints • CORS Enabled</div>
      </div>
      <div class="card">
        <div class="card-label">Real-Time Engine</div>
        <div class="card-val" style="color:#a78bfa;">Socket.io v4</div>
        <div style="color:var(--muted);font-size:12px;margin-top:4px;">Rooms: plan:&lt;id&gt; &amp; user:&lt;id&gt;</div>
      </div>
      <div class="card">
        <div class="card-label">Deployed At</div>
        <div class="card-val" style="font-size:15px;">${BOOT_TIME}</div>
        <div style="color:var(--muted);font-size:12px;margin-top:4px;">Currency: NGN (₦)</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('source', this)">📁 Deployed Source Code</button>
      <button class="tab-btn" onclick="switchTab('endpoints', this)">⚡ All 19 API Endpoints</button>
    </div>

    <!-- Tab 1: Vercel-style Source Browser -->
    <div id="tab-source">
      <div class="source-layout">
        <div class="file-list">
          <div class="file-list-header">BACKEND FILES (<span id="file-count">0</span>)</div>
          <div id="file-tree"></div>
        </div>
        <div class="code-viewer">
          <div class="code-header">
            <span id="current-file-name">Select a file</span>
            <span id="current-file-meta" style="color:var(--muted);"></span>
          </div>
          <pre id="code-content">Loading deployed source files from container...</pre>
        </div>
      </div>
    </div>

    <!-- Tab 2: Endpoints Catalog -->
    <div id="tab-endpoints" class="hidden">
      <div id="endpoints-list"></div>
    </div>
  </div>

  <script>
    document.getElementById('api-base-url').textContent = window.location.origin + '/api';
    let sourceFiles = [];

    function switchTab(tab, btn) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-source').classList.toggle('hidden', tab !== 'source');
      document.getElementById('tab-endpoints').classList.toggle('hidden', tab !== 'endpoints');
    }

    function selectFile(index) {
      const f = sourceFiles[index];
      if (!f) return;
      document.querySelectorAll('.file-item').forEach((el, idx) => {
        el.classList.toggle('active', idx === index);
      });
      document.getElementById('current-file-name').textContent = f.path;
      document.getElementById('current-file-meta').textContent = f.lines + ' lines • ' + f.size + ' bytes';
      document.getElementById('code-content').textContent = f.content;
    }

    async function loadDashboard() {
      const [srcRes, docsRes] = await Promise.all([
        fetch('/api/source').then(r => r.json()),
        fetch('/api/docs').then(r => r.json())
      ]);

      sourceFiles = srcRes.files || [];
      document.getElementById('file-count').textContent = sourceFiles.length;
      const treeEl = document.getElementById('file-tree');
      treeEl.innerHTML = sourceFiles.map((f, i) =>
        '<div class="file-item" onclick="selectFile(' + i + ')">' +
          '<span>' + f.path.replace(/^backend\\//, '') + '</span>' +
          '<span style="color:var(--muted);font-size:11px;">' + f.lines + 'L</span>' +
        '</div>'
      ).join('');
      if (sourceFiles.length > 0) selectFile(0);

      const epEl = document.getElementById('endpoints-list');
      epEl.innerHTML = (docsRes.endpoints || []).map(ep =>
        '<div class="endpoint-row">' +
          '<div style="display:flex;align-items:center;gap:12px;">' +
            '<span class="method method-' + ep.method + '">' + ep.method + '</span>' +
            '<span class="ep-path">' + ep.path + '</span>' +
            (ep.auth ? '<span style="font-size:11px;background:#1e293b;padding:3px 8px;border-radius:4px;color:#94a3b8;">🔒 Bearer JWT</span>' : '') +
          '</div>' +
          '<div style="color:var(--muted);font-size:12px;font-family:ui-monospace,monospace;">' + (ep.response || ep.description || '') + '</div>' +
        '</div>'
      ).join('');
    }
    loadDashboard();
  </script>
</body>
</html>`;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.send(html);
}

app.get('/api/dashboard', renderVercelStyleDashboard);

// Mount API routes under /api
app.use('/api', authRoutes);
app.use('/api', walletRoutes);
app.use('/api', savingsRoutes);
app.use('/api', chatRoutes);
app.use('/api', transferRoutes);
app.use('/api', notificationRoutes);

// Root info / Vercel-style Deployment & Source Explorer Dashboard
app.get('/', (req, res) => {
  const accept = req.headers.accept || '';
  if (accept.includes('text/html')) {
    return renderVercelStyleDashboard(req, res);
  }
  return res.json({
    name: 'Pulse Social Fintech MVP API',
    version: '1.0.0',
    health: '/api/health',
    docs: '/api/docs',
    dashboard: '/api/dashboard',
    source: '/api/source',
    endpointsCount: ENDPOINTS_CATALOG.length
  });
});

// Central error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error'
  });
});

async function startServer(port = process.env.PORT || 4000) {
  const dbStatus = await db.initDb();
  const server = http.createServer(app);
  initSocket(server);

  return new Promise((resolve, reject) => {
    server.on('error', reject);
    server.listen(port, () => {
      const actualPort = server.address().port;
      if (process.env.NODE_ENV !== 'test') {
        console.log(
          `🚀 Pulse Backend running on http://localhost:${actualPort} (DB mode: ${dbStatus.mode})`
        );
      }
      resolve({ app, server, port: actualPort, dbMode: dbStatus.mode });
    });
  });
}

if (require.main === module) {
  startServer().catch((err) => {
    console.error('Failed to start Pulse Backend:', err);
    process.exit(1);
  });
}

module.exports = {
  app,
  startServer
};
