process.env.NODE_ENV = 'test';
process.env.USE_LOCAL_DB = 'true';

const test = require('node:test');
const assert = require('node:assert/strict');
const { io } = require('socket.io-client');
const { startServer } = require('../src/server');
const db = require('../src/db');

let serverInstance = null;
let baseUrl = '';

let lamToken = '';
let lamUser = null;
let hafidhToken = '';
let hafidhUser = null;
let personalPlanId = '';
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

test('1. Auth — Register @lam and @hafidh, verify JWT, auto-created NGN wallets, and unauthorized error handling', async () => {
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

  // Duplicate username/email should return 409
  const dupReg = await api('/api/auth/register', {
    method: 'POST',
    body: {
      name: 'Duplicate',
      email: 'lam@pulse.ng',
      username: 'lam',
      password: 'password123'
    }
  });
  assert.equal(dupReg.status, 409);

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

  // Invalid password should return 401
  const badLogin = await api('/api/auth/login', {
    method: 'POST',
    body: {
      emailOrUsername: 'lam',
      password: 'wrongpassword'
    }
  });
  assert.equal(badLogin.status, 401);

  // Protected endpoint without token should return 401
  const unauthMe = await api('/api/auth/me');
  assert.equal(unauthMe.status, 401);

  const meRes = await api('/api/auth/me', { token: lamToken });
  assert.equal(meRes.status, 200);
  assert.equal(meRes.data.user.id, lamUser.id);
  assert.equal(meRes.data.wallet.currency, 'NGN');
  assert.equal(meRes.data.wallet.totalSaved, 0);
});

test('2. Wallet Funding — Top up @lam wallet (demo & paystack modes), reject invalid amounts, and verify ledger', async () => {
  // Invalid amount should return 400
  const invalidFund = await api('/api/wallet/fund', {
    method: 'POST',
    token: lamToken,
    body: { amount: -100, method: 'demo' }
  });
  assert.equal(invalidFund.status, 400);

  // Invalid method should return 400
  const invalidMethod = await api('/api/wallet/fund', {
    method: 'POST',
    token: lamToken,
    body: { amount: 5000, method: 'crypto' }
  });
  assert.equal(invalidMethod.status, 400);

  // Fund ₦40,000 via demo mode
  const fundDemo = await api('/api/wallet/fund', {
    method: 'POST',
    token: lamToken,
    body: {
      amount: 40000,
      method: 'demo'
    }
  });

  assert.equal(fundDemo.status, 200);
  assert.equal(fundDemo.data.wallet.balance, 40000);
  assert.equal(fundDemo.data.transaction.type, 'WALLET_FUND');
  assert.equal(fundDemo.data.transaction.direction, 'CREDIT');
  assert.equal(fundDemo.data.transaction.amount, 40000);

  // Fund ₦10,000 via paystack test verification mode
  const fundPaystack = await api('/api/wallet/fund', {
    method: 'POST',
    token: lamToken,
    body: {
      amount: 10000,
      method: 'paystack',
      reference: 'PSK-TEST-REF-001'
    }
  });
  assert.equal(fundPaystack.status, 200);
  assert.equal(fundPaystack.data.wallet.balance, 50000);
  assert.equal(fundPaystack.data.transaction.reference, 'PSK-TEST-REF-001');

  const walletSummary = await api('/api/wallet', { token: lamToken });
  assert.equal(walletSummary.status, 200);
  assert.equal(walletSummary.data.balance, 50000);
  assert.equal(walletSummary.data.transactions.length, 2);
});

test('3. P2P Transfer — Lookup @hafidh, block self-transfer & overdraft, transfer ₦15,000 atomically with notifications', async () => {
  const lookup = await api('/api/users/lookup?q=hafidh', { token: lamToken });
  assert.equal(lookup.status, 200);
  assert.equal(lookup.data.user.username, 'hafidh');

  // Self-transfer should return 400
  const selfTransfer = await api('/api/transfers/p2p', {
    method: 'POST',
    token: lamToken,
    body: { recipientUsername: 'lam', amount: 1000 }
  });
  assert.equal(selfTransfer.status, 400);

  // Overdraft transfer should return 400
  const overdraftTransfer = await api('/api/transfers/p2p', {
    method: 'POST',
    token: lamToken,
    body: { recipientUsername: 'hafidh', amount: 999999 }
  });
  assert.equal(overdraftTransfer.status, 400);

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
  assert.equal(transfer.data.transaction.direction, 'DEBIT');

  const hafidhWallet = await api('/api/wallet', { token: hafidhToken });
  assert.equal(hafidhWallet.status, 200);
  assert.equal(hafidhWallet.data.balance, 15000);
  assert.equal(hafidhWallet.data.transactions[0].type, 'P2P_RECEIVE');
  assert.equal(hafidhWallet.data.transactions[0].direction, 'CREDIT');

  const notifs = await api('/api/notifications', { token: hafidhToken });
  assert.equal(notifs.status, 200);
  assert.ok(notifs.data.unreadCount >= 1);
  assert.ok(notifs.data.notifications.some((n) => n.type === 'P2P_RECEIVE' && n.body));
});

test('4. Savings Plans (Personal & Group), Chat & Live Socket.io — Create plans, join via code, contribute, verify leaderboard, insights & real-time events', async () => {
  // Create a Personal Savings Plan for @hafidh
  const createPersonal = await api('/api/savings', {
    method: 'POST',
    token: hafidhToken,
    body: {
      title: 'Emergency Laptop Fund',
      description: 'Personal backup savings',
      targetAmount: 50000,
      type: 'PERSONAL',
      frequency: 'MONTHLY'
    }
  });
  assert.equal(createPersonal.status, 201);
  assert.equal(createPersonal.data.plan.type, 'PERSONAL');
  personalPlanId = createPersonal.data.plan.id;

  // Create a Group Savings Plan for @lam
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

  // Connect Socket.io client for @lam and join plan room
  const socketClient = io(baseUrl, {
    auth: { token: lamToken },
    transports: ['websocket']
  });

  await new Promise((resolve, reject) => {
    socketClient.on('connect', () => {
      socketClient.emit('join:plan', groupPlanId);
      resolve();
    });
    socketClient.on('connect_error', reject);
  });

  const receivedChatMessages = [];
  const receivedSavingsUpdates = [];
  socketClient.on('chat:message', (msg) => receivedChatMessages.push(msg));
  socketClient.on('savings:updated', (upd) => receivedSavingsUpdates.push(upd));

  try {
    // @hafidh joins via inviteCode
    const joinRes = await api('/api/savings/join', {
      method: 'POST',
      token: hafidhToken,
      body: { inviteCode: groupInviteCode }
    });
    assert.equal(joinRes.status, 200);
    assert.equal(joinRes.data.plan.id, groupPlanId);

    // Over-contribution should return 400
    const badContrib = await api(`/api/savings/${groupPlanId}/contribute`, {
      method: 'POST',
      token: lamToken,
      body: { amount: 500000 }
    });
    assert.equal(badContrib.status, 400);

    // @lam contributes ₦20,000
    const lamContrib = await api(`/api/savings/${groupPlanId}/contribute`, {
      method: 'POST',
      token: lamToken,
      body: { amount: 20000 }
    });
    assert.equal(lamContrib.status, 200);
    assert.equal(lamContrib.data.walletBalance, 15000);
    assert.equal(lamContrib.data.plan.currentAmount, 20000);
    assert.equal(lamContrib.data.plan.progressPercent, 20);
    assert.equal(lamContrib.data.transaction.type, 'SAVINGS_CONTRIBUTION');

    // @hafidh contributes ₦5,000
    const hafidhContrib = await api(`/api/savings/${groupPlanId}/contribute`, {
      method: 'POST',
      token: hafidhToken,
      body: { amount: 5000 }
    });
    assert.equal(hafidhContrib.status, 200);
    assert.equal(hafidhContrib.data.walletBalance, 10000);
    assert.equal(hafidhContrib.data.plan.currentAmount, 25000);
    assert.equal(hafidhContrib.data.plan.progressPercent, 25);

    // Verify GET /api/savings list returns plans, personalPlans, and groupPlans
    const hafidhPlans = await api('/api/savings', { token: hafidhToken });
    assert.equal(hafidhPlans.status, 200);
    assert.equal(hafidhPlans.data.plans.length, 2);
    assert.equal(hafidhPlans.data.personalPlans.length, 1);
    assert.equal(hafidhPlans.data.groupPlans.length, 1);

    // Verify Plan Details, Leaderboard, and Smart Insights
    const details = await api(`/api/savings/${groupPlanId}`, { token: lamToken });
    assert.equal(details.status, 200);
    assert.equal(details.data.plan.currentAmount, 25000);
    assert.equal(details.data.plan.progressPercent, 25);
    assert.equal(details.data.members.length, 2);
    assert.equal(details.data.leaderboard[0].username, 'lam');
    assert.equal(details.data.leaderboard[0].badge, '🥇 Top Saver');
    assert.equal(details.data.leaderboard[0].sharePercent, 80);
    assert.equal(details.data.insights.completionPercentage, 25);
    assert.equal(details.data.insights.remainingAmount, 75000);
    assert.equal(details.data.insights.status, 'ON_TRACK');
    assert.ok(details.data.insights.summary);

    // Send a user chat message in the group plan
    const sendChat = await api(`/api/savings/${groupPlanId}/messages`, {
      method: 'POST',
      token: hafidhToken,
      body: { content: 'Awesome, we are already at 25% of our Nobus target!' }
    });
    assert.equal(sendChat.status, 201);
    assert.equal(sendChat.data.message.type, 'CHAT');

    // Wait briefly for Socket.io events to arrive
    await new Promise((r) => setTimeout(r, 80));
    assert.ok(receivedSavingsUpdates.length >= 2);
    assert.ok(
      receivedChatMessages.some(
        (m) => m.type === 'CHAT' && m.content.includes('25% of our Nobus target')
      )
    );

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
  } finally {
    socketClient.disconnect();
  }
});

test('5. Payment Request / Bill Split & Notifications — Create ₦5,000 request, settle with 1 click, verify chat metadata update & mark read', async () => {
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
  assert.equal(createReq.data.paymentRequest.requester.username, 'lam');
  paymentRequestId = createReq.data.paymentRequest.id;

  // Creator cannot pay own request (400)
  const selfPay = await api(`/api/transfers/request/${paymentRequestId}/pay`, {
    method: 'POST',
    token: lamToken
  });
  assert.equal(selfPay.status, 400);

  // @hafidh pays the ₦5,000 request with 1 click
  const payReq = await api(`/api/transfers/request/${paymentRequestId}/pay`, {
    method: 'POST',
    token: hafidhToken
  });

  assert.equal(payReq.status, 200);
  assert.equal(payReq.data.paymentRequest.status, 'PAID');
  assert.equal(payReq.data.paymentRequest.paidBy, 'hafidh');
  assert.equal(payReq.data.newBalance, 5000);

  // Paying an already paid request returns 400
  const doublePay = await api(`/api/transfers/request/${paymentRequestId}/pay`, {
    method: 'POST',
    token: hafidhToken
  });
  assert.equal(doublePay.status, 400);

  // Verify the group chat PAYMENT_REQUEST message metadata now has status === 'PAID'
  const chatAfterPay = await api(`/api/savings/${groupPlanId}/messages`, {
    token: lamToken
  });
  const reqMsg = chatAfterPay.data.messages.find(
    (m) => m.metadata?.event === 'PAYMENT_REQUEST' && m.metadata?.requestId === paymentRequestId
  );
  assert.ok(reqMsg);
  assert.equal(reqMsg.metadata.status, 'PAID');

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
  assert.equal(markRead.data.unreadCount, 0);
});

test('6. Withdrawals & Personal Chat Guard — Instant withdrawal on Personal, Group approval required before disbursement, and reject Personal chat', async () => {
  // Personal plans reject chat messages
  const personalChatAttempt = await api(`/api/savings/${personalPlanId}/messages`, {
    method: 'POST',
    token: hafidhToken,
    body: { content: 'Should not allow chat on personal plan' }
  });
  assert.equal(personalChatAttempt.status, 400);

  // @hafidh contributes ₦3,000 to Personal plan (balance was 5,000 -> 2,000)
  const pContrib = await api(`/api/savings/${personalPlanId}/contribute`, {
    method: 'POST',
    token: hafidhToken,
    body: { amount: 3000 }
  });
  assert.equal(pContrib.status, 200);
  assert.equal(pContrib.data.walletBalance, 2000);

  // Instant withdrawal of ₦2,000 from Personal plan back to wallet (balance 2,000 -> 4,000)
  const pWithdraw = await api(`/api/savings/${personalPlanId}/withdraw`, {
    method: 'POST',
    token: hafidhToken,
    body: { amount: 2000, reason: 'Urgent repair' }
  });
  assert.equal(pWithdraw.status, 200);
  assert.equal(pWithdraw.data.mode, 'INSTANT');
  assert.equal(pWithdraw.data.walletBalance, 4000);
  assert.equal(pWithdraw.data.plan.currentAmount, 1000);

  // @lam requests withdrawal of ₦10,000 from Group plan (currently 25,000)
  const gWithdrawReq = await api(`/api/savings/${groupPlanId}/withdraw`, {
    method: 'POST',
    token: lamToken,
    body: { amount: 10000, reason: 'Nobus server renewal' }
  });
  assert.equal(gWithdrawReq.status, 201);
  assert.equal(gWithdrawReq.data.mode, 'APPROVAL_REQUIRED');
  assert.equal(gWithdrawReq.data.withdrawalRequest.status, 'PENDING');
  assert.equal(gWithdrawReq.data.withdrawalRequest.approvals.length, 1);

  const withdrawalId = gWithdrawReq.data.withdrawalRequest.id;

  // Requester (@lam) cannot approve their own request a second time (400)
  const doubleVote = await api(`/api/savings/${groupPlanId}/withdrawals/${withdrawalId}/approve`, {
    method: 'POST',
    token: lamToken,
    body: { action: 'APPROVE' }
  });
  assert.equal(doubleVote.status, 400);

  // @hafidh approves the group withdrawal -> disbursed to @lam's wallet (20,000 -> 30,000)
  const hafidhApprove = await api(`/api/savings/${groupPlanId}/withdrawals/${withdrawalId}/approve`, {
    method: 'POST',
    token: hafidhToken,
    body: { action: 'APPROVE' }
  });
  assert.equal(hafidhApprove.status, 200);
  assert.equal(hafidhApprove.data.disbursed, true);
  assert.equal(hafidhApprove.data.withdrawalRequest.status, 'APPROVED');
  assert.equal(hafidhApprove.data.plan.currentAmount, 15000);

  const lamWalletAfter = await api('/api/wallet', { token: lamToken });
  assert.equal(lamWalletAfter.data.balance, 30000);
});
