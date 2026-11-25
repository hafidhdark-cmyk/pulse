process.env.NODE_ENV = 'test';
process.env.USE_LOCAL_DB = 'true';

const test = require('node:test');
const assert = require('node:assert/strict');
const { startServer } = require('../src/server');
const db = require('../src/db');

let serverInstance = null;
let baseUrl = '';

let lamToken = '';
let lamUser = null;
let hafidhToken = '';
let hafidhUser = null;
let groupPlanId = '';
let groupInviteCode = '';
let paymentRequestId = '';

async function api(path, { method = 'GET', token = '', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });

  const data = await res.json();
  return { status: res.status, data };
}

test.before(async () => {
  const started = await startServer(0);
  serverInstance = started.server;
  baseUrl = `http://127.0.0.1:${started.port}`;
  await db.resetDb();
});

test.after(async () => {
  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
  }
  await db.closeDb();
});

test('1. Auth — Register @lam and @hafidh, verify JWT and auto-created NGN wallets', async () => {
  const regLam = await api('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Layi Dev',
      email: 'lam@pulse.ng',
      username: 'lam',
      password: 'password123'
    }
  });

  assert.equal(regLam.status, 201);
  assert.ok(regLam.data.token);
  assert.equal(regLam.data.user.username, 'lam');
  assert.equal(regLam.data.wallet.balance, 0);
  assert.equal(regLam.data.wallet.currency, 'NGN');

  lamToken = regLam.data.token;
  lamUser = regLam.data.user;

  const regHafidh = await api('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Hafidh Frontend',
      email: 'hafidh@pulse.ng',
      username: 'hafidh',
      password: 'password123'
    }
  });

  assert.equal(regHafidh.status, 201);
  assert.ok(regHafidh.data.token);
  assert.equal(regHafidh.data.user.username, 'hafidh');

  hafidhToken = regHafidh.data.token;
  hafidhUser = regHafidh.data.user;

  // Verify Login & /api/auth/me
  const loginLam = await api('/api/auth/login', {
    method: 'POST',
    body: {
      emailOrUsername: 'lam',
      password: 'password123'
    }
  });
  assert.equal(loginLam.status, 200);
  assert.ok(loginLam.data.token);

  const meRes = await api('/api/auth/me', { token: lamToken });
  assert.equal(meRes.status, 200);
  assert.equal(meRes.data.user.id, lamUser.id);
  assert.equal(meRes.data.wallet.currency, 'NGN');
});

test('2. Wallet Funding — Top up @lam wallet with ₦50,000 (demo mode) and verify ledger', async () => {
  const fundRes = await api('/api/wallet/fund', {
    method: 'POST',
    token: lamToken,
    body: {
      amount: 50000,
      method: 'demo'
    }
  });

  assert.equal(fundRes.status, 200);
  assert.equal(fundRes.data.wallet.balance, 50000);
  assert.equal(fundRes.data.transaction.type, 'WALLET_FUND');
  assert.equal(fundRes.data.transaction.amount, 50000);

  const walletSummary = await api('/api/wallet', { token: lamToken });
  assert.equal(walletSummary.status, 200);
  assert.equal(walletSummary.data.balance, 50000);
  assert.equal(walletSummary.data.transactions.length, 1);
});

test('3. P2P Transfer — Lookup @hafidh and transfer ₦15,000 atomically with notifications', async () => {
  const lookup = await api('/api/users/lookup?q=hafidh', { token: lamToken });
  assert.equal(lookup.status, 200);
  assert.equal(lookup.data.user.username, 'hafidh');

  const transfer = await api('/api/transfers/p2p', {
    method: 'POST',
    token: lamToken,
    body: {
      recipientUsername: '@hafidh',
      amount: 15000,
      note: 'Hackathon fuel'
    }
  });

  assert.equal(transfer.status, 200);
  assert.equal(transfer.data.newBalance, 35000);
  assert.equal(transfer.data.transaction.type, 'P2P_SEND');

  const hafidhWallet = await api('/api/wallet', { token: hafidhToken });
  assert.equal(hafidhWallet.status, 200);
  assert.equal(hafidhWallet.data.balance, 15000);
  assert.equal(hafidhWallet.data.transactions[0].type, 'P2P_RECEIVE');

  const notifs = await api('/api/notifications', { token: hafidhToken });
  assert.equal(notifs.status, 200);
  assert.ok(notifs.data.unreadCount >= 1);
  assert.ok(notifs.data.notifications.some((n) => n.type === 'P2P_RECEIVE'));
});

test('4. Group Savings Plan & Chat — Create group plan, join via invite code, contribute, verify leaderboard & insights', async () => {
  const createPlan = await api('/api/savings', {
    method: 'POST',
    token: lamToken,
    body: {
      title: 'Nobus Hackathon Squad',
      description: 'Cloud deployment & launch fund',
      targetAmount: 100000,
      type: 'GROUP',
      frequency: 'WEEKLY'
    }
  });

  assert.equal(createPlan.status, 201);
  assert.ok(createPlan.data.inviteCode.startsWith('PLS-'));
  groupPlanId = createPlan.data.plan.id;
  groupInviteCode = createPlan.data.inviteCode;

  // @hafidh joins via inviteCode
  const joinRes = await api('/api/savings/join', {
    method: 'POST',
    token: hafidhToken,
    body: { inviteCode: groupInviteCode }
  });
  assert.equal(joinRes.status, 200);
  assert.equal(joinRes.data.plan.id, groupPlanId);

  // @lam contributes ₦20,000
  const lamContrib = await api(`/api/savings/${groupPlanId}/contribute`, {
    method: 'POST',
    token: lamToken,
    body: { amount: 20000 }
  });
  assert.equal(lamContrib.status, 200);
  assert.equal(lamContrib.data.walletBalance, 15000);
  assert.equal(lamContrib.data.plan.currentAmount, 20000);

  // @hafidh contributes ₦5,000
  const hafidhContrib = await api(`/api/savings/${groupPlanId}/contribute`, {
    method: 'POST',
    token: hafidhToken,
    body: { amount: 5000 }
  });
  assert.equal(hafidhContrib.status, 200);
  assert.equal(hafidhContrib.data.walletBalance, 10000);
  assert.equal(hafidhContrib.data.plan.currentAmount, 25000);

  // Verify Plan Details, Leaderboard, and Smart Insights
  const details = await api(`/api/savings/${groupPlanId}`, { token: lamToken });
  assert.equal(details.status, 200);
  assert.equal(details.data.plan.currentAmount, 25000);
  assert.equal(details.data.members.length, 2);
  assert.equal(details.data.leaderboard[0].username, 'lam');
  assert.equal(details.data.leaderboard[0].badge, '🥇 Top Saver');
  assert.equal(details.data.insights.completionPercentage, 25);
  assert.equal(details.data.insights.remainingAmount, 75000);

  // Send a user chat message in the group plan
  const sendChat = await api(`/api/savings/${groupPlanId}/messages`, {
    method: 'POST',
    token: hafidhToken,
    body: { content: 'Awesome, we are already at 25% of our Nobus target!' }
  });
  assert.equal(sendChat.status, 201);
  assert.equal(sendChat.data.message.type, 'CHAT');

  // Verify chat history contains both ACTIVITY_ALERT and CHAT messages
  const chatHistory = await api(`/api/savings/${groupPlanId}/messages`, {
    token: lamToken
  });
  assert.equal(chatHistory.status, 200);
  assert.ok(chatHistory.data.messages.some((m) => m.type === 'ACTIVITY_ALERT'));
  assert.ok(
    chatHistory.data.messages.some(
      (m) => m.type === 'CHAT' && m.content.includes('25% of our Nobus target')
    )
  );
});

test('5. Payment Request / Bill Split (Stretch Feature) — Create ₦5,000 request and settle with 1 click', async () => {
  const createReq = await api('/api/transfers/request', {
    method: 'POST',
    token: lamToken,
    body: {
      amount: 5000,
      description: 'Domain & SSL split',
      planId: groupPlanId
    }
  });

  assert.equal(createReq.status, 201);
  assert.equal(createReq.data.paymentRequest.status, 'PENDING');
  paymentRequestId = createReq.data.paymentRequest.id;

  // @hafidh pays the ₦5,000 request with 1 click
  const payReq = await api(`/api/transfers/request/${paymentRequestId}/pay`, {
    method: 'POST',
    token: hafidhToken
  });

  assert.equal(payReq.status, 200);
  assert.equal(payReq.data.paymentRequest.status, 'PAID');
  assert.equal(payReq.data.newBalance, 5000);

  // Verify @lam received the ₦5,000 (15,000 + 5,000 = 20,000)
  const lamWallet = await api('/api/wallet', { token: lamToken });
  assert.equal(lamWallet.data.balance, 20000);
  assert.equal(lamWallet.data.totalSaved, 20000);

  // Mark notifications read
  const markRead = await api('/api/notifications/read-all', {
    method: 'PATCH',
    token: lamToken
  });
  assert.equal(markRead.status, 200);
  assert.equal(markRead.data.success, true);
});
