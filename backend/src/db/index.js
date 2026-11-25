const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Pool } = require('pg');

const AVATAR_COLORS = ['#2563EB', '#059669', '#7C3AED', '#DB2777', '#D97706', '#0891B2'];

function pickAvatarColor(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function generateId(prefix = '') {
  const uuid = crypto.randomUUID();
  return prefix ? `${prefix}_${uuid.replace(/-/g, '').slice(0, 16)}` : uuid;
}

function generateInviteCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 5; i += 1) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PLS-${suffix}`;
}

function roundMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
}

function formatSafeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    username: u.username,
    avatarColor: u.avatar_color || u.avatarColor || '#2563EB',
    createdAt: u.created_at || u.createdAt
  };
}

function computeSavingsInsights(plan, members) {
  const targetAmount = roundMoney(plan.targetAmount);
  const currentAmount = roundMoney(plan.currentAmount);
  const remainingAmount = Math.max(0, roundMoney(targetAmount - currentAmount));
  const completionPercentage = targetAmount > 0
    ? Math.min(100, Math.round((currentAmount / targetAmount) * 1000) / 10)
    : 0;

  const memberCount = Math.max(1, members.length);
  let daysRemaining = 30;
  if (plan.deadline) {
    const diffMs = new Date(plan.deadline).getTime() - Date.now();
    daysRemaining = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  const weeksRemaining = Math.max(1, Math.ceil(daysRemaining / 7));
  const dailyTargetTotal = roundMoney(remainingAmount / daysRemaining);
  const dailyPerMember = roundMoney(dailyTargetTotal / memberCount);
  const weeklyPerMember = roundMoney(remainingAmount / weeksRemaining / memberCount);
  const recommendation =
    remainingAmount === 0
      ? 'Target achieved. This savings plan is 100% funded.'
      : `Contribute ₦${dailyPerMember.toLocaleString('en-NG')}/day (or ₦${weeklyPerMember.toLocaleString('en-NG')}/week) per member to reach ₦${targetAmount.toLocaleString('en-NG')} within ${daysRemaining} day(s).`;

  const isCompleted = completionPercentage >= 100 || remainingAmount === 0;
  return {
    targetAmount,
    currentAmount,
    remainingAmount,
    completionPercentage,
    daysRemaining,
    memberCount,
    dailyPerMember,
    weeklyPerMember,
    onTrack: true,
    status: isCompleted ? 'COMPLETED' : 'ON_TRACK',
    recommendation,
    summary: recommendation
  };
}

function computeLeaderboard(plan, members) {
  const currentAmount = roundMoney(plan.currentAmount);
  const sorted = [...members].sort((a, b) => b.contributedAmount - a.contributedAmount);

  return sorted.map((m, idx) => {
    const sharePercentage = currentAmount > 0
      ? Math.round((m.contributedAmount / currentAmount) * 1000) / 10
      : 0;

    let badge = 'Member';
    if (m.contributedAmount > 0 && idx === 0) {
      badge = '🥇 Top Saver';
    } else if (m.contributedAmount > 0 && idx === 1) {
      badge = 'Runner-Up';
    } else if (m.contributedAmount > 0) {
      badge = 'Active Saver';
    }

    return {
      rank: idx + 1,
      userId: m.userId,
      name: m.name,
      username: m.username,
      avatarColor: m.avatarColor,
      role: m.role,
      contributedAmount: roundMoney(m.contributedAmount),
      sharePercentage,
      sharePercent: sharePercentage,
      badge
    };
  });
}

// ============================================================================
// Dual-Mode Engine: PostgreSQL (Nobus DB / Docker) OR Local Dev Store Fallback
// ============================================================================

let pgPool = null;
let isPostgresMode = false;

const localStoreFile = path.join(__dirname, '../../.data/local-db.json');
let localState = createEmptyState();

function createEmptyState() {
  return {
    users: [],
    wallets: [],
    transactions: [],
    savingsPlans: [],
    savingsMembers: [],
    groupMessages: [],
    paymentRequests: [],
    notifications: []
  };
}

function persistLocalState() {
  if (process.env.NODE_ENV === 'test') return;
  try {
    const dir = path.dirname(localStoreFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(localStoreFile, JSON.stringify(localState, null, 2), 'utf8');
  } catch (err) {
    // Ignore persistence write warnings in restricted environments
  }
}

function loadLocalState() {
  if (process.env.NODE_ENV === 'test') {
    localState = createEmptyState();
    return;
  }
  try {
    if (fs.existsSync(localStoreFile)) {
      const raw = fs.readFileSync(localStoreFile, 'utf8');
      localState = { ...createEmptyState(), ...JSON.parse(raw) };
    }
  } catch (err) {
    localState = createEmptyState();
  }
}

async function initDb() {
  const dbUrl = (process.env.DATABASE_URL || '').trim();
  if (dbUrl && process.env.USE_LOCAL_DB !== 'true') {
    const useSsl = process.env.DB_SSL === 'true' || dbUrl.includes('sslmode=require');
    pgPool = new Pool({
      connectionString: dbUrl,
      ssl: useSsl ? { rejectUnauthorized: false } : false
    });

    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pgPool.query(schemaSql);
    isPostgresMode = true;
    return { mode: 'postgres' };
  }

  isPostgresMode = false;
  loadLocalState();
  return { mode: 'local' };
}

async function resetDb() {
  if (isPostgresMode && pgPool) {
    await pgPool.query(`
      TRUNCATE TABLE
        notifications,
        payment_requests,
        group_messages,
        savings_members,
        savings_plans,
        transactions,
        wallets,
        users
      CASCADE;
    `);
    return;
  }
  localState = createEmptyState();
  persistLocalState();
}

async function closeDb() {
  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
}

async function withTransaction(workFn) {
  if (isPostgresMode && pgPool) {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const result = await workFn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  // Atomic snapshot rollback for local mode
  const snapshot = JSON.parse(JSON.stringify(localState));
  try {
    const result = await workFn(null);
    persistLocalState();
    return result;
  } catch (err) {
    localState = snapshot;
    throw err;
  }
}

// ============================================================================
// Repository Methods
// ============================================================================

async function createUserWithWallet({ name, email, username, passwordHash }) {
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim().replace(/^@/, '').toLowerCase();
  const cleanName = name.trim();
  const avatarColor = pickAvatarColor(cleanUsername);
  const userId = generateId('usr');
  const walletId = generateId('wal');
  const now = new Date().toISOString();

  if (isPostgresMode) {
    return withTransaction(async (client) => {
      const existing = await client.query(
        'SELECT id, email, username FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $2 LIMIT 1',
        [cleanEmail, cleanUsername]
      );
      if (existing.rows.length > 0) {
        const err = new Error('Email or username is already registered');
        err.status = 409;
        throw err;
      }

      const userRes = await client.query(
        `INSERT INTO users (id, name, email, username, password_hash, avatar_color, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [userId, cleanName, cleanEmail, cleanUsername, passwordHash, avatarColor, now]
      );

      const walletRes = await client.query(
        `INSERT INTO wallets (id, user_id, balance, currency, updated_at)
         VALUES ($1, $2, 0.00, 'NGN', $3)
         RETURNING *`,
        [walletId, userId, now]
      );

      await client.query(
        `INSERT INTO notifications (id, user_id, title, message, type, created_at)
         VALUES ($1, $2, $3, $4, 'WELCOME', $5)`,
        [
          generateId('ntf'),
          userId,
          'Welcome to Pulse!',
          `Hi ${cleanName}, your NGN (₦) digital wallet is active and ready for savings & instant P2P transfers.`,
          now
        ]
      );

      return {
        user: formatSafeUser(userRes.rows[0]),
        wallet: {
          id: walletRes.rows[0].id,
          userId,
          balance: roundMoney(walletRes.rows[0].balance),
          currency: walletRes.rows[0].currency
        }
      };
    });
  }

  return withTransaction(async () => {
    const duplicate = localState.users.find(
      (u) => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanUsername
    );
    if (duplicate) {
      const err = new Error('Email or username is already registered');
      err.status = 409;
      throw err;
    }

    const user = {
      id: userId,
      name: cleanName,
      email: cleanEmail,
      username: cleanUsername,
      passwordHash,
      avatarColor,
      createdAt: now
    };
    const wallet = {
      id: walletId,
      userId,
      balance: 0,
      currency: 'NGN',
      updatedAt: now
    };

    localState.users.push(user);
    localState.wallets.push(wallet);
    localState.notifications.push({
      id: generateId('ntf'),
      userId,
      title: 'Welcome to Pulse!',
      message: `Hi ${cleanName}, your NGN (₦) digital wallet is active and ready for savings & instant P2P transfers.`,
      type: 'WELCOME',
      isRead: false,
      metadata: {},
      createdAt: now
    });

    return {
      user: formatSafeUser(user),
      wallet: {
        id: wallet.id,
        userId: wallet.userId,
        balance: roundMoney(wallet.balance),
        currency: wallet.currency
      }
    };
  });
}

async function findUserByEmailOrUsername(identifier) {
  const clean = (identifier || '').trim().replace(/^@/, '').toLowerCase();
  if (!clean) return null;

  if (isPostgresMode) {
    const res = await pgPool.query(
      'SELECT * FROM users WHERE LOWER(email) = $1 OR LOWER(username) = $1 LIMIT 1',
      [clean]
    );
    if (!res.rows[0]) return null;
    const row = res.rows[0];
    return {
      ...formatSafeUser(row),
      passwordHash: row.password_hash
    };
  }

  const user = localState.users.find(
    (u) => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean
  );
  if (!user) return null;
  return {
    ...formatSafeUser(user),
    passwordHash: user.passwordHash
  };
}

async function findUserById(userId) {
  if (isPostgresMode) {
    const res = await pgPool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);
    return formatSafeUser(res.rows[0]);
  }
  const user = localState.users.find((u) => u.id === userId);
  return formatSafeUser(user);
}

async function searchUsers(query, excludeUserId = null) {
  const clean = (query || '').trim().replace(/^@/, '').toLowerCase();
  if (!clean) return [];

  if (isPostgresMode) {
    const res = await pgPool.query(
      `SELECT * FROM users
       WHERE (LOWER(username) LIKE $1 OR LOWER(name) LIKE $1 OR LOWER(email) = $2)
       ORDER BY CASE WHEN LOWER(username) = $2 THEN 0 ELSE 1 END, username ASC
       LIMIT 10`,
      [`%${clean}%`, clean]
    );
    return res.rows.map(formatSafeUser).filter((u) => u.id !== excludeUserId);
  }

  return localState.users
    .filter((u) => {
      if (excludeUserId && u.id === excludeUserId) return false;
      return (
        u.username.toLowerCase().includes(clean) ||
        u.name.toLowerCase().includes(clean) ||
        u.email.toLowerCase() === clean
      );
    })
    .sort((a, b) => {
      const aExact = a.username.toLowerCase() === clean ? 0 : 1;
      const bExact = b.username.toLowerCase() === clean ? 0 : 1;
      return aExact - bExact;
    })
    .slice(0, 10)
    .map(formatSafeUser);
}

async function getWalletByUserId(userId) {
  if (isPostgresMode) {
    const res = await pgPool.query('SELECT * FROM wallets WHERE user_id = $1 LIMIT 1', [userId]);
    const w = res.rows[0];
    if (!w) return null;
    return {
      id: w.id,
      userId: w.user_id,
      balance: roundMoney(w.balance),
      currency: w.currency,
      updatedAt: w.updated_at
    };
  }

  const w = localState.wallets.find((item) => item.userId === userId);
  if (!w) return null;
  return {
    id: w.id,
    userId: w.userId,
    balance: roundMoney(w.balance),
    currency: w.currency,
    updatedAt: w.updatedAt
  };
}

async function getTotalSavedByUserId(userId) {
  if (isPostgresMode) {
    const res = await pgPool.query(
      'SELECT COALESCE(SUM(contributed_amount), 0) AS total_saved FROM savings_members WHERE user_id = $1',
      [userId]
    );
    return roundMoney(res.rows[0]?.total_saved || 0);
  }

  const total = localState.savingsMembers
    .filter((m) => m.userId === userId)
    .reduce((acc, m) => acc + roundMoney(m.contributedAmount), 0);
  return roundMoney(total);
}

async function listTransactionsByUserId(userId, limit = 50) {
  const creditTypes = new Set(['WALLET_FUND', 'FUND', 'P2P_RECEIVE']);
  if (isPostgresMode) {
    const res = await pgPool.query(
      'SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2',
      [userId, limit]
    );
    return res.rows.map((t) => ({
      id: t.id,
      userId: t.user_id,
      type: t.type,
      direction: creditTypes.has(t.type) ? 'CREDIT' : 'DEBIT',
      amount: roundMoney(t.amount),
      currency: t.currency,
      reference: t.reference,
      description: t.description,
      metadata: t.metadata || {},
      createdAt: t.created_at
    }));
  }

  return localState.transactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit)
    .map((t) => ({
      ...t,
      direction: creditTypes.has(t.type) ? 'CREDIT' : 'DEBIT',
      amount: roundMoney(t.amount)
    }));
}

async function fundWallet({ userId, amount, method = 'demo', reference }) {
  const numericAmount = roundMoney(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    const err = new Error('Funding amount must be greater than 0');
    err.status = 400;
    throw err;
  }

  const txRef = reference || `PLS-FUND-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  const description =
    method === 'paystack'
      ? `Wallet funded via Paystack (${txRef})`
      : `Instant Demo Wallet Top-Up (${txRef})`;

  if (isPostgresMode) {
    return withTransaction(async (client) => {
      const walletRes = await client.query(
        `UPDATE wallets
         SET balance = balance + $1, updated_at = $2
         WHERE user_id = $3
         RETURNING *`,
        [numericAmount, now, userId]
      );
      if (!walletRes.rows[0]) {
        const err = new Error('Wallet not found');
        err.status = 404;
        throw err;
      }

      const txId = generateId('txn');
      const txRes = await client.query(
        `INSERT INTO transactions (id, user_id, type, amount, currency, reference, description, metadata, created_at)
         VALUES ($1, $2, 'WALLET_FUND', $3, 'NGN', $4, $5, $6, $7)
         RETURNING *`,
        [txId, userId, numericAmount, txRef, description, JSON.stringify({ method }), now]
      );

      await client.query(
        `INSERT INTO notifications (id, user_id, title, message, type, metadata, created_at)
         VALUES ($1, $2, 'Wallet Funded', $3, 'WALLET_FUND', $4, $5)`,
        [
          generateId('ntf'),
          userId,
          `Your wallet was credited with ₦${numericAmount.toLocaleString('en-NG')}.`,
          JSON.stringify({ amount: numericAmount, reference: txRef, method }),
          now
        ]
      );

      const w = walletRes.rows[0];
      const t = txRes.rows[0];
      return {
        wallet: {
          id: w.id,
          userId: w.user_id,
          balance: roundMoney(w.balance),
          currency: w.currency,
          updatedAt: w.updated_at
        },
        transaction: {
          id: t.id,
          userId: t.user_id,
          type: t.type,
          direction: 'CREDIT',
          amount: roundMoney(t.amount),
          currency: t.currency,
          reference: t.reference,
          description: t.description,
          metadata: t.metadata,
          createdAt: t.created_at
        }
      };
    });
  }

  return withTransaction(async () => {
    const wallet = localState.wallets.find((w) => w.userId === userId);
    if (!wallet) {
      const err = new Error('Wallet not found');
      err.status = 404;
      throw err;
    }

    wallet.balance = roundMoney(wallet.balance + numericAmount);
    wallet.updatedAt = now;

    const transaction = {
      id: generateId('txn'),
      userId,
      type: 'WALLET_FUND',
      direction: 'CREDIT',
      amount: numericAmount,
      currency: 'NGN',
      reference: txRef,
      description,
      metadata: { method },
      createdAt: now
    };
    localState.transactions.push(transaction);

    localState.notifications.push({
      id: generateId('ntf'),
      userId,
      title: 'Wallet Funded',
      message: `Your wallet was credited with ₦${numericAmount.toLocaleString('en-NG')}.`,
      type: 'WALLET_FUND',
      isRead: false,
      metadata: { amount: numericAmount, reference: txRef, method },
      createdAt: now
    });

    return {
      wallet: { ...wallet, balance: roundMoney(wallet.balance) },
      transaction
    };
  });
}

async function createSavingsPlan({
  creatorId,
  title,
  description = '',
  targetAmount,
  type = 'PERSONAL',
  deadline = null,
  frequency = 'FLEXIBLE'
}) {
  const normalizedType = (type || 'PERSONAL').toUpperCase() === 'GROUP' ? 'GROUP' : 'PERSONAL';
  const numericTarget = roundMoney(targetAmount);
  if (!title || !title.trim()) {
    const err = new Error('Savings plan title is required');
    err.status = 400;
    throw err;
  }
  if (!Number.isFinite(numericTarget) || numericTarget <= 0) {
    const err = new Error('Target amount must be greater than 0');
    err.status = 400;
    throw err;
  }

  const planId = generateId('pln');
  const memberId = generateId('mbr');
  const inviteCode = generateInviteCode();
  const now = new Date().toISOString();
  const parsedDeadline = deadline
    ? new Date(deadline).toISOString()
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  if (isPostgresMode) {
    return withTransaction(async (client) => {
      const creatorRes = await client.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [creatorId]);
      const creator = creatorRes.rows[0];

      const planRes = await client.query(
        `INSERT INTO savings_plans
         (id, creator_id, title, description, target_amount, current_amount, type, invite_code, frequency, deadline, status, created_at)
         VALUES ($1, $2, $3, $4, $5, 0.00, $6, $7, $8, $9, 'ACTIVE', $10)
         RETURNING *`,
        [
          planId,
          creatorId,
          title.trim(),
          description.trim(),
          numericTarget,
          normalizedType,
          inviteCode,
          frequency,
          parsedDeadline,
          now
        ]
      );

      await client.query(
        `INSERT INTO savings_members (id, plan_id, user_id, role, contributed_amount, joined_at)
         VALUES ($1, $2, $3, 'OWNER', 0.00, $4)`,
        [memberId, planId, creatorId, now]
      );

      if (normalizedType === 'GROUP' && creator) {
        await client.query(
          `INSERT INTO group_messages (id, plan_id, sender_id, content, type, metadata, created_at)
           VALUES ($1, $2, $3, $4, 'ACTIVITY_ALERT', $5, $6)`,
          [
            generateId('msg'),
            planId,
            creatorId,
            `🎉 @${creator.username} created the group savings plan "${title.trim()}" with a target of ₦${numericTarget.toLocaleString('en-NG')}. Invite code: ${inviteCode}`,
            JSON.stringify({ event: 'PLAN_CREATED', inviteCode }),
            now
          ]
        );
      }

      const row = planRes.rows[0];
      return {
        plan: {
          id: row.id,
          creatorId: row.creator_id,
          title: row.title,
          description: row.description,
          targetAmount: roundMoney(row.target_amount),
          currentAmount: roundMoney(row.current_amount),
          progressPercent: 0,
          progressPercentage: 0,
          memberCount: 1,
          myContribution: 0,
          type: row.type,
          inviteCode: row.invite_code,
          frequency: row.frequency,
          deadline: row.deadline,
          status: row.status,
          createdAt: row.created_at
        },
        inviteCode: row.invite_code
      };
    });
  }

  return withTransaction(async () => {
    const creator = localState.users.find((u) => u.id === creatorId);
    const plan = {
      id: planId,
      creatorId,
      title: title.trim(),
      description: (description || '').trim(),
      targetAmount: numericTarget,
      currentAmount: 0,
      progressPercent: 0,
      progressPercentage: 0,
      memberCount: 1,
      myContribution: 0,
      type: normalizedType,
      inviteCode,
      frequency: frequency || 'FLEXIBLE',
      deadline: parsedDeadline,
      status: 'ACTIVE',
      createdAt: now
    };

    localState.savingsPlans.push(plan);
    localState.savingsMembers.push({
      id: memberId,
      planId,
      userId: creatorId,
      role: 'OWNER',
      contributedAmount: 0,
      joinedAt: now
    });

    if (normalizedType === 'GROUP' && creator) {
      localState.groupMessages.push({
        id: generateId('msg'),
        planId,
        senderId: creatorId,
        content: `🎉 @${creator.username} created the group savings plan "${plan.title}" with a target of ₦${numericTarget.toLocaleString('en-NG')}. Invite code: ${inviteCode}`,
        type: 'ACTIVITY_ALERT',
        metadata: { event: 'PLAN_CREATED', inviteCode },
        createdAt: now
      });
    }

    return { plan, inviteCode };
  });
}

async function listSavingsPlansForUser(userId) {
  if (isPostgresMode) {
    const res = await pgPool.query(
      `SELECT sp.*, sm.role AS my_role, sm.contributed_amount AS my_contribution,
              (SELECT COUNT(*) FROM savings_members WHERE plan_id = sp.id) AS member_count
       FROM savings_plans sp
       INNER JOIN savings_members sm ON sm.plan_id = sp.id
       WHERE sm.user_id = $1
       ORDER BY sp.created_at DESC`,
      [userId]
    );

    const plans = res.rows.map((row) => {
      const targetAmount = roundMoney(row.target_amount);
      const currentAmount = roundMoney(row.current_amount);
      const pct =
        targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 1000) / 10) : 0;
      return {
        id: row.id,
        creatorId: row.creator_id,
        title: row.title,
        description: row.description,
        targetAmount,
        currentAmount,
        type: row.type,
        inviteCode: row.invite_code,
        frequency: row.frequency,
        deadline: row.deadline,
        status: row.status,
        myRole: row.my_role,
        myContribution: roundMoney(row.my_contribution),
        memberCount: Number(row.member_count),
        progressPercentage: pct,
        progressPercent: pct,
        createdAt: row.created_at
      };
    });

    return {
      plans,
      personalPlans: plans.filter((p) => p.type === 'PERSONAL'),
      groupPlans: plans.filter((p) => p.type === 'GROUP')
    };
  }

  const memberships = localState.savingsMembers.filter((m) => m.userId === userId);
  const plans = memberships
    .map((m) => {
      const plan = localState.savingsPlans.find((p) => p.id === m.planId);
      if (!plan) return null;
      const memberCount = localState.savingsMembers.filter((sm) => sm.planId === plan.id).length;
      const targetAmount = roundMoney(plan.targetAmount);
      const currentAmount = roundMoney(plan.currentAmount);
      const pct =
        targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 1000) / 10) : 0;
      return {
        ...plan,
        targetAmount,
        currentAmount,
        myRole: m.role,
        myContribution: roundMoney(m.contributedAmount),
        memberCount,
        progressPercentage: pct,
        progressPercent: pct
      };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return {
    plans,
    personalPlans: plans.filter((p) => p.type === 'PERSONAL'),
    groupPlans: plans.filter((p) => p.type === 'GROUP')
  };
}

async function joinGroupPlanByInviteCode({ userId, inviteCode }) {
  const cleanCode = (inviteCode || '').trim().toUpperCase();
  if (!cleanCode) {
    const err = new Error('Invite code is required');
    err.status = 400;
    throw err;
  }

  const now = new Date().toISOString();

  if (isPostgresMode) {
    return withTransaction(async (client) => {
      const planRes = await client.query(
        'SELECT * FROM savings_plans WHERE UPPER(invite_code) = $1 LIMIT 1',
        [cleanCode]
      );
      const planRow = planRes.rows[0];
      if (!planRow) {
        const err = new Error('Invalid invite code. Group savings plan not found.');
        err.status = 404;
        throw err;
      }
      if (planRow.type !== 'GROUP') {
        const err = new Error('This savings plan is personal and cannot be joined via invite code.');
        err.status = 400;
        throw err;
      }

      const existingRes = await client.query(
        'SELECT * FROM savings_members WHERE plan_id = $1 AND user_id = $2 LIMIT 1',
        [planRow.id, userId]
      );

      const userRes = await client.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);
      const user = formatSafeUser(userRes.rows[0]);

      let membershipRow = existingRes.rows[0];
      let alertMessage = null;

      if (!membershipRow) {
        const insertMem = await client.query(
          `INSERT INTO savings_members (id, plan_id, user_id, role, contributed_amount, joined_at)
           VALUES ($1, $2, $3, 'MEMBER', 0.00, $4)
           RETURNING *`,
          [generateId('mbr'), planRow.id, userId, now]
        );
        membershipRow = insertMem.rows[0];

        const msgId = generateId('msg');
        const msgContent = `👋 @${user.username} (${user.name}) joined "${planRow.title}"!`;
        const msgRes = await client.query(
          `INSERT INTO group_messages (id, plan_id, sender_id, content, type, metadata, created_at)
           VALUES ($1, $2, $3, $4, 'ACTIVITY_ALERT', $5, $6)
           RETURNING *`,
          [msgId, planRow.id, userId, msgContent, JSON.stringify({ event: 'MEMBER_JOINED' }), now]
        );

        alertMessage = {
          id: msgRes.rows[0].id,
          planId: planRow.id,
          sender: user,
          content: msgRes.rows[0].content,
          type: 'ACTIVITY_ALERT',
          metadata: msgRes.rows[0].metadata,
          createdAt: msgRes.rows[0].created_at
        };
      }

      return {
        plan: {
          id: planRow.id,
          creatorId: planRow.creator_id,
          title: planRow.title,
          description: planRow.description,
          targetAmount: roundMoney(planRow.target_amount),
          currentAmount: roundMoney(planRow.current_amount),
          type: planRow.type,
          inviteCode: planRow.invite_code,
          frequency: planRow.frequency,
          deadline: planRow.deadline,
          status: planRow.status,
          createdAt: planRow.created_at
        },
        membership: {
          id: membershipRow.id,
          planId: membershipRow.plan_id,
          userId: membershipRow.user_id,
          role: membershipRow.role,
          contributedAmount: roundMoney(membershipRow.contributed_amount),
          joinedAt: membershipRow.joined_at
        },
        alertMessage
      };
    });
  }

  return withTransaction(async () => {
    const plan = localState.savingsPlans.find((p) => p.inviteCode.toUpperCase() === cleanCode);
    if (!plan) {
      const err = new Error('Invalid invite code. Group savings plan not found.');
      err.status = 404;
      throw err;
    }
    if (plan.type !== 'GROUP') {
      const err = new Error('This savings plan is personal and cannot be joined via invite code.');
      err.status = 400;
      throw err;
    }

    const user = formatSafeUser(localState.users.find((u) => u.id === userId));
    let membership = localState.savingsMembers.find(
      (m) => m.planId === plan.id && m.userId === userId
    );
    let alertMessage = null;

    if (!membership) {
      membership = {
        id: generateId('mbr'),
        planId: plan.id,
        userId,
        role: 'MEMBER',
        contributedAmount: 0,
        joinedAt: now
      };
      localState.savingsMembers.push(membership);

      const rawMsg = {
        id: generateId('msg'),
        planId: plan.id,
        senderId: userId,
        content: `👋 @${user.username} (${user.name}) joined "${plan.title}"!`,
        type: 'ACTIVITY_ALERT',
        metadata: { event: 'MEMBER_JOINED' },
        createdAt: now
      };
      localState.groupMessages.push(rawMsg);
      alertMessage = {
        id: rawMsg.id,
        planId: rawMsg.planId,
        sender: user,
        content: rawMsg.content,
        type: rawMsg.type,
        metadata: rawMsg.metadata,
        createdAt: rawMsg.createdAt
      };
    }

    return { plan, membership, alertMessage };
  });
}

async function getSavingsPlanDetails(planId, requestingUserId) {
  if (isPostgresMode) {
    const planRes = await pgPool.query('SELECT * FROM savings_plans WHERE id = $1 LIMIT 1', [planId]);
    const row = planRes.rows[0];
    if (!row) {
      const err = new Error('Savings plan not found');
      err.status = 404;
      throw err;
    }

    const memRes = await pgPool.query(
      `SELECT sm.*, u.name, u.username, u.email, u.avatar_color
       FROM savings_members sm
       INNER JOIN users u ON u.id = sm.user_id
       WHERE sm.plan_id = $1
       ORDER BY sm.joined_at ASC`,
      [planId]
    );

    const members = memRes.rows.map((m) => ({
      id: m.id,
      userId: m.user_id,
      name: m.name,
      username: m.username,
      email: m.email,
      avatarColor: m.avatar_color || '#2563EB',
      role: m.role,
      contributedAmount: roundMoney(m.contributed_amount),
      joinedAt: m.joined_at
    }));

    const isMember = members.some((m) => m.userId === requestingUserId);
    if (!isMember) {
      const err = new Error('You are not a member of this savings plan');
      err.status = 403;
      throw err;
    }

    const targetAmount = roundMoney(row.target_amount);
    const currentAmount = roundMoney(row.current_amount);
    const pct =
      targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 1000) / 10) : 0;

    const plan = {
      id: row.id,
      creatorId: row.creator_id,
      title: row.title,
      description: row.description,
      targetAmount,
      currentAmount,
      progressPercent: pct,
      progressPercentage: pct,
      type: row.type,
      inviteCode: row.invite_code,
      frequency: row.frequency,
      deadline: row.deadline,
      status: row.status,
      createdAt: row.created_at
    };

    const leaderboard = computeLeaderboard(plan, members);
    return {
      plan,
      members: leaderboard,
      leaderboard,
      insights: computeSavingsInsights(plan, members)
    };
  }

  const plan = localState.savingsPlans.find((p) => p.id === planId);
  if (!plan) {
    const err = new Error('Savings plan not found');
    err.status = 404;
    throw err;
  }

  const rawMembers = localState.savingsMembers.filter((m) => m.planId === planId);
  const isMember = rawMembers.some((m) => m.userId === requestingUserId);
  if (!isMember) {
    const err = new Error('You are not a member of this savings plan');
    err.status = 403;
    throw err;
  }

  const members = rawMembers.map((m) => {
    const u = localState.users.find((usr) => usr.id === m.userId) || {};
    return {
      id: m.id,
      userId: m.userId,
      name: u.name || 'User',
      username: u.username || 'user',
      email: u.email || '',
      avatarColor: u.avatarColor || '#2563EB',
      role: m.role,
      contributedAmount: roundMoney(m.contributedAmount),
      joinedAt: m.joinedAt
    };
  });

  const targetAmount = roundMoney(plan.targetAmount);
  const currentAmount = roundMoney(plan.currentAmount);
  const pct =
    targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 1000) / 10) : 0;
  const formattedPlan = {
    ...plan,
    targetAmount,
    currentAmount,
    progressPercent: pct,
    progressPercentage: pct
  };
  const leaderboard = computeLeaderboard(formattedPlan, members);

  return {
    plan: formattedPlan,
    members: leaderboard,
    leaderboard,
    insights: computeSavingsInsights(formattedPlan, members)
  };
}

async function contributeToSavingsPlan({ planId, userId, amount }) {
  const numericAmount = roundMoney(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    const err = new Error('Contribution amount must be greater than 0');
    err.status = 400;
    throw err;
  }

  const now = new Date().toISOString();
  const txRef = `PLS-SAVE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  if (isPostgresMode) {
    return withTransaction(async (client) => {
      const planRes = await client.query('SELECT * FROM savings_plans WHERE id = $1 FOR UPDATE', [planId]);
      const planRow = planRes.rows[0];
      if (!planRow) {
        const err = new Error('Savings plan not found');
        err.status = 404;
        throw err;
      }

      const memRes = await client.query(
        'SELECT * FROM savings_members WHERE plan_id = $1 AND user_id = $2 FOR UPDATE',
        [planId, userId]
      );
      if (!memRes.rows[0]) {
        const err = new Error('You must join this savings plan before contributing');
        err.status = 403;
        throw err;
      }

      const walletRes = await client.query('SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE', [userId]);
      const walletRow = walletRes.rows[0];
      if (!walletRow || roundMoney(walletRow.balance) < numericAmount) {
        const err = new Error('Insufficient wallet balance to make this savings contribution');
        err.status = 400;
        throw err;
      }

      const updatedWallet = await client.query(
        'UPDATE wallets SET balance = balance - $1, updated_at = $2 WHERE user_id = $3 RETURNING *',
        [numericAmount, now, userId]
      );

      const newCurrent = roundMoney(Number(planRow.current_amount) + numericAmount);
      const newStatus = newCurrent >= roundMoney(planRow.target_amount) ? 'COMPLETED' : planRow.status;

      const updatedPlan = await client.query(
        `UPDATE savings_plans
         SET current_amount = $1, status = $2
         WHERE id = $3
         RETURNING *`,
        [newCurrent, newStatus, planId]
      );

      const updatedMember = await client.query(
        `UPDATE savings_members
         SET contributed_amount = contributed_amount + $1
         WHERE plan_id = $2 AND user_id = $3
         RETURNING *`,
        [numericAmount, planId, userId]
      );

      const description = `Contribution to "${planRow.title}"`;
      const txRes = await client.query(
        `INSERT INTO transactions (id, user_id, type, amount, currency, reference, description, metadata, created_at)
         VALUES ($1, $2, 'SAVINGS_CONTRIBUTION', $3, 'NGN', $4, $5, $6, $7)
         RETURNING *`,
        [
          generateId('txn'),
          userId,
          numericAmount,
          txRef,
          description,
          JSON.stringify({ planId, planTitle: planRow.title }),
          now
        ]
      );

      const userRes = await client.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);
      const user = formatSafeUser(userRes.rows[0]);

      const pct = Math.min(
        100,
        Math.round((newCurrent / roundMoney(planRow.target_amount)) * 1000) / 10
      );
      const alertText = `💰 @${user.username} contributed ₦${numericAmount.toLocaleString('en-NG')} to "${planRow.title}" (${pct}% of target reached)!`;

      const msgRes = await client.query(
        `INSERT INTO group_messages (id, plan_id, sender_id, content, type, metadata, created_at)
         VALUES ($1, $2, $3, $4, 'ACTIVITY_ALERT', $5, $6)
         RETURNING *`,
        [
          generateId('msg'),
          planId,
          userId,
          alertText,
          JSON.stringify({ event: 'CONTRIBUTION', amount: numericAmount, progressPercentage: pct }),
          now
        ]
      );

      const p = updatedPlan.rows[0];
      return {
        plan: {
          id: p.id,
          creatorId: p.creator_id,
          title: p.title,
          description: p.description,
          targetAmount: roundMoney(p.target_amount),
          currentAmount: roundMoney(p.current_amount),
          progressPercent: pct,
          progressPercentage: pct,
          type: p.type,
          inviteCode: p.invite_code,
          frequency: p.frequency,
          deadline: p.deadline,
          status: p.status,
          createdAt: p.created_at
        },
        walletBalance: roundMoney(updatedWallet.rows[0].balance),
        contribution: {
          amount: numericAmount,
          totalMemberContribution: roundMoney(updatedMember.rows[0].contributed_amount),
          reference: txRef,
          createdAt: now
        },
        transaction: {
          id: txRes.rows[0].id,
          type: txRes.rows[0].type,
          direction: 'DEBIT',
          amount: roundMoney(txRes.rows[0].amount),
          reference: txRes.rows[0].reference
        },
        alertMessage: {
          id: msgRes.rows[0].id,
          planId,
          sender: user,
          content: msgRes.rows[0].content,
          type: 'ACTIVITY_ALERT',
          metadata: msgRes.rows[0].metadata,
          createdAt: msgRes.rows[0].created_at
        }
      };
    });
  }

  return withTransaction(async () => {
    const plan = localState.savingsPlans.find((p) => p.id === planId);
    if (!plan) {
      const err = new Error('Savings plan not found');
      err.status = 404;
      throw err;
    }

    const member = localState.savingsMembers.find(
      (m) => m.planId === planId && m.userId === userId
    );
    if (!member) {
      const err = new Error('You must join this savings plan before contributing');
      err.status = 403;
      throw err;
    }

    const wallet = localState.wallets.find((w) => w.userId === userId);
    if (!wallet || roundMoney(wallet.balance) < numericAmount) {
      const err = new Error('Insufficient wallet balance to make this savings contribution');
      err.status = 400;
      throw err;
    }

    wallet.balance = roundMoney(wallet.balance - numericAmount);
    wallet.updatedAt = now;

    plan.currentAmount = roundMoney(plan.currentAmount + numericAmount);
    if (plan.currentAmount >= plan.targetAmount) {
      plan.status = 'COMPLETED';
    }

    member.contributedAmount = roundMoney(member.contributedAmount + numericAmount);

    const transaction = {
      id: generateId('txn'),
      userId,
      type: 'SAVINGS_CONTRIBUTION',
      direction: 'DEBIT',
      amount: numericAmount,
      currency: 'NGN',
      reference: txRef,
      description: `Contribution to "${plan.title}"`,
      metadata: { planId, planTitle: plan.title },
      createdAt: now
    };
    localState.transactions.push(transaction);

    const user = formatSafeUser(localState.users.find((u) => u.id === userId));
    const pct = Math.min(100, Math.round((plan.currentAmount / plan.targetAmount) * 1000) / 10);
    plan.progressPercent = pct;
    plan.progressPercentage = pct;
    const rawMsg = {
      id: generateId('msg'),
      planId,
      senderId: userId,
      content: `💰 @${user.username} contributed ₦${numericAmount.toLocaleString('en-NG')} to "${plan.title}" (${pct}% of target reached)!`,
      type: 'ACTIVITY_ALERT',
      metadata: { event: 'CONTRIBUTION', amount: numericAmount, progressPercentage: pct, progressPercent: pct },
      createdAt: now
    };
    localState.groupMessages.push(rawMsg);

    return {
      plan: { ...plan, progressPercent: pct, progressPercentage: pct },
      walletBalance: wallet.balance,
      contribution: {
        amount: numericAmount,
        totalMemberContribution: member.contributedAmount,
        reference: txRef,
        createdAt: now
      },
      transaction,
      alertMessage: {
        id: rawMsg.id,
        planId,
        sender: user,
        content: rawMsg.content,
        type: rawMsg.type,
        metadata: rawMsg.metadata,
        createdAt: rawMsg.createdAt
      }
    };
  });
}

async function listGroupMessages(planId, userId, limit = 100) {
  if (isPostgresMode) {
    const memCheck = await pgPool.query(
      'SELECT 1 FROM savings_members WHERE plan_id = $1 AND user_id = $2 LIMIT 1',
      [planId, userId]
    );
    if (memCheck.rows.length === 0) {
      const err = new Error('You must be a member of this savings plan to view messages');
      err.status = 403;
      throw err;
    }

    const [res, reqRes] = await Promise.all([
      pgPool.query(
        `SELECT gm.*, u.name, u.username, u.email, u.avatar_color
         FROM group_messages gm
         INNER JOIN users u ON u.id = gm.sender_id
         WHERE gm.plan_id = $1
         ORDER BY gm.created_at ASC
         LIMIT $2`,
        [planId, limit]
      ),
      pgPool.query('SELECT id, status, paid_by_user_id FROM payment_requests WHERE plan_id = $1', [
        planId
      ])
    ]);

    const reqStatusMap = new Map(reqRes.rows.map((r) => [r.id, r.status]));

    return res.rows.map((m) => {
      const meta = { ...(m.metadata || {}) };
      if (meta.requestId && reqStatusMap.has(meta.requestId)) {
        meta.status = reqStatusMap.get(meta.requestId);
      }
      return {
        id: m.id,
        planId: m.plan_id,
        sender: {
          id: m.sender_id,
          name: m.name,
          username: m.username,
          avatarColor: m.avatar_color || '#2563EB'
        },
        content: m.content,
        type: m.type,
        metadata: meta,
        createdAt: m.created_at
      };
    });
  }

  const isMember = localState.savingsMembers.some(
    (m) => m.planId === planId && m.userId === userId
  );
  if (!isMember) {
    const err = new Error('You must be a member of this savings plan to view messages');
    err.status = 403;
    throw err;
  }

  return localState.groupMessages
    .filter((m) => m.planId === planId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .slice(-limit)
    .map((m) => {
      const u = localState.users.find((usr) => usr.id === m.senderId) || {};
      const meta = { ...(m.metadata || {}) };
      if (meta.requestId) {
        const pr = localState.paymentRequests.find((r) => r.id === meta.requestId);
        if (pr) {
          meta.status = pr.status;
        }
      }
      return {
        id: m.id,
        planId: m.planId,
        sender: {
          id: m.senderId,
          name: u.name || 'User',
          username: u.username || 'user',
          avatarColor: u.avatarColor || '#2563EB'
        },
        content: m.content,
        type: m.type,
        metadata: meta,
        createdAt: m.createdAt
      };
    });
}

async function createGroupMessage({ planId, senderId, content, type = 'CHAT', metadata = {} }) {
  const cleanContent = (content || '').trim();
  if (!cleanContent) {
    const err = new Error('Message content cannot be empty');
    err.status = 400;
    throw err;
  }

  const now = new Date().toISOString();
  const msgId = generateId('msg');

  if (isPostgresMode) {
    const memCheck = await pgPool.query(
      'SELECT 1 FROM savings_members WHERE plan_id = $1 AND user_id = $2 LIMIT 1',
      [planId, senderId]
    );
    if (memCheck.rows.length === 0) {
      const err = new Error('You must be a member of this savings plan to post messages');
      err.status = 403;
      throw err;
    }

    const userRes = await pgPool.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [senderId]);
    const sender = formatSafeUser(userRes.rows[0]);

    const res = await pgPool.query(
      `INSERT INTO group_messages (id, plan_id, sender_id, content, type, metadata, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [msgId, planId, senderId, cleanContent, type, JSON.stringify(metadata || {}), now]
    );

    const row = res.rows[0];
    return {
      id: row.id,
      planId: row.plan_id,
      sender: {
        id: sender.id,
        name: sender.name,
        username: sender.username,
        avatarColor: sender.avatarColor
      },
      content: row.content,
      type: row.type,
      metadata: row.metadata || {},
      createdAt: row.created_at
    };
  }

  const isMember = localState.savingsMembers.some(
    (m) => m.planId === planId && m.userId === senderId
  );
  if (!isMember) {
    const err = new Error('You must be a member of this savings plan to post messages');
    err.status = 403;
    throw err;
  }

  const sender = formatSafeUser(localState.users.find((u) => u.id === senderId));
  const message = {
    id: msgId,
    planId,
    senderId,
    content: cleanContent,
    type,
    metadata: metadata || {},
    createdAt: now
  };
  localState.groupMessages.push(message);
  persistLocalState();

  return {
    id: message.id,
    planId: message.planId,
    sender: {
      id: sender.id,
      name: sender.name,
      username: sender.username,
      avatarColor: sender.avatarColor
    },
    content: message.content,
    type: message.type,
    metadata: message.metadata,
    createdAt: message.createdAt
  };
}

async function executeP2PTransfer({ senderId, recipientUsername, amount, note = '' }) {
  const numericAmount = roundMoney(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    const err = new Error('Transfer amount must be greater than 0');
    err.status = 400;
    throw err;
  }

  const cleanRecipient = (recipientUsername || '').trim().replace(/^@/, '').toLowerCase();
  if (!cleanRecipient) {
    const err = new Error('Recipient username or email is required');
    err.status = 400;
    throw err;
  }

  const now = new Date().toISOString();
  const baseRef = `PLS-P2P-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  if (isPostgresMode) {
    return withTransaction(async (client) => {
      const senderRes = await client.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [senderId]);
      const sender = formatSafeUser(senderRes.rows[0]);

      const recRes = await client.query(
        'SELECT * FROM users WHERE LOWER(username) = $1 OR LOWER(email) = $1 LIMIT 1',
        [cleanRecipient]
      );
      const recipientRow = recRes.rows[0];
      if (!recipientRow) {
        const err = new Error(`Recipient "${recipientUsername}" not found`);
        err.status = 404;
        throw err;
      }
      const recipient = formatSafeUser(recipientRow);

      if (recipient.id === senderId) {
        const err = new Error('You cannot transfer funds to yourself');
        err.status = 400;
        throw err;
      }

      const senderWalletRes = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
        [senderId]
      );
      if (!senderWalletRes.rows[0] || roundMoney(senderWalletRes.rows[0].balance) < numericAmount) {
        const err = new Error('Insufficient wallet balance for this transfer');
        err.status = 400;
        throw err;
      }

      const updatedSenderWallet = await client.query(
        'UPDATE wallets SET balance = balance - $1, updated_at = $2 WHERE user_id = $3 RETURNING *',
        [numericAmount, now, senderId]
      );

      await client.query(
        'UPDATE wallets SET balance = balance + $1, updated_at = $2 WHERE user_id = $3',
        [numericAmount, now, recipient.id]
      );

      const sendDesc = note
        ? `Transfer to @${recipient.username}: ${note}`
        : `Instant P2P Transfer to @${recipient.username}`;
      const recDesc = note
        ? `Received from @${sender.username}: ${note}`
        : `Instant P2P Transfer from @${sender.username}`;

      const sendTxRes = await client.query(
        `INSERT INTO transactions (id, user_id, type, amount, currency, reference, description, metadata, created_at)
         VALUES ($1, $2, 'P2P_SEND', $3, 'NGN', $4, $5, $6, $7)
         RETURNING *`,
        [
          generateId('txn'),
          senderId,
          numericAmount,
          `${baseRef}-OUT`,
          sendDesc,
          JSON.stringify({ recipientId: recipient.id, recipientUsername: recipient.username, note }),
          now
        ]
      );

      await client.query(
        `INSERT INTO transactions (id, user_id, type, amount, currency, reference, description, metadata, created_at)
         VALUES ($1, $2, 'P2P_RECEIVE', $3, 'NGN', $4, $5, $6, $7)`,
        [
          generateId('txn'),
          recipient.id,
          numericAmount,
          `${baseRef}-IN`,
          recDesc,
          JSON.stringify({ senderId: sender.id, senderUsername: sender.username, note }),
          now
        ]
      );

      const notifRes = await client.query(
        `INSERT INTO notifications (id, user_id, title, message, type, metadata, created_at)
         VALUES ($1, $2, 'Money Received!', $3, 'P2P_RECEIVE', $4, $5)
         RETURNING *`,
        [
          generateId('ntf'),
          recipient.id,
          `@${sender.username} (${sender.name}) sent you ₦${numericAmount.toLocaleString('en-NG')}${note ? ` — "${note}"` : ''}.`,
          JSON.stringify({ senderId: sender.id, senderUsername: sender.username, amount: numericAmount, note }),
          now
        ]
      );

      const t = sendTxRes.rows[0];
      return {
        transaction: {
          id: t.id,
          userId: t.user_id,
          type: t.type,
          direction: 'DEBIT',
          amount: roundMoney(t.amount),
          currency: t.currency,
          reference: t.reference,
          description: t.description,
          recipient,
          metadata: t.metadata,
          createdAt: t.created_at
        },
        newBalance: roundMoney(updatedSenderWallet.rows[0].balance),
        recipient,
        recipientNotification: notifRes.rows[0]
      };
    });
  }

  return withTransaction(async () => {
    const sender = formatSafeUser(localState.users.find((u) => u.id === senderId));
    const recipientRaw = localState.users.find(
      (u) => u.username.toLowerCase() === cleanRecipient || u.email.toLowerCase() === cleanRecipient
    );
    if (!recipientRaw) {
      const err = new Error(`Recipient "${recipientUsername}" not found`);
      err.status = 404;
      throw err;
    }
    const recipient = formatSafeUser(recipientRaw);

    if (recipient.id === senderId) {
      const err = new Error('You cannot transfer funds to yourself');
      err.status = 400;
      throw err;
    }

    const senderWallet = localState.wallets.find((w) => w.userId === senderId);
    const recipientWallet = localState.wallets.find((w) => w.userId === recipient.id);

    if (!senderWallet || roundMoney(senderWallet.balance) < numericAmount) {
      const err = new Error('Insufficient wallet balance for this transfer');
      err.status = 400;
      throw err;
    }

    senderWallet.balance = roundMoney(senderWallet.balance - numericAmount);
    senderWallet.updatedAt = now;

    recipientWallet.balance = roundMoney(recipientWallet.balance + numericAmount);
    recipientWallet.updatedAt = now;

    const sendTx = {
      id: generateId('txn'),
      userId: senderId,
      type: 'P2P_SEND',
      direction: 'DEBIT',
      amount: numericAmount,
      currency: 'NGN',
      reference: `${baseRef}-OUT`,
      description: note
        ? `Transfer to @${recipient.username}: ${note}`
        : `Instant P2P Transfer to @${recipient.username}`,
      recipient,
      metadata: { recipientId: recipient.id, recipientUsername: recipient.username, note },
      createdAt: now
    };

    const receiveTx = {
      id: generateId('txn'),
      userId: recipient.id,
      type: 'P2P_RECEIVE',
      direction: 'CREDIT',
      amount: numericAmount,
      currency: 'NGN',
      reference: `${baseRef}-IN`,
      description: note
        ? `Received from @${sender.username}: ${note}`
        : `Instant P2P Transfer from @${sender.username}`,
      metadata: { senderId: sender.id, senderUsername: sender.username, note },
      createdAt: now
    };

    localState.transactions.push(sendTx, receiveTx);

    const recipientNotification = {
      id: generateId('ntf'),
      userId: recipient.id,
      title: 'Money Received!',
      message: `@${sender.username} (${sender.name}) sent you ₦${numericAmount.toLocaleString('en-NG')}${note ? ` — "${note}"` : ''}.`,
      type: 'P2P_RECEIVE',
      isRead: false,
      metadata: { senderId: sender.id, senderUsername: sender.username, amount: numericAmount, note },
      createdAt: now
    };
    localState.notifications.push(recipientNotification);

    return {
      transaction: sendTx,
      newBalance: senderWallet.balance,
      recipient,
      recipientNotification
    };
  });
}

async function createPaymentRequest({ creatorId, amount, description, planId = null }) {
  const numericAmount = roundMoney(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    const err = new Error('Payment request amount must be greater than 0');
    err.status = 400;
    throw err;
  }
  if (!description || !description.trim()) {
    const err = new Error('Payment request description is required');
    err.status = 400;
    throw err;
  }

  const reqId = generateId('req');
  const now = new Date().toISOString();

  if (isPostgresMode) {
    return withTransaction(async (client) => {
      const creatorRes = await client.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [creatorId]);
      const creator = formatSafeUser(creatorRes.rows[0]);

      const res = await client.query(
        `INSERT INTO payment_requests (id, creator_id, plan_id, amount, currency, description, status, created_at)
         VALUES ($1, $2, $3, $4, 'NGN', $5, 'PENDING', $6)
         RETURNING *`,
        [reqId, creatorId, planId || null, numericAmount, description.trim(), now]
      );

      let alertMessage = null;
      if (planId) {
        const msgRes = await client.query(
          `INSERT INTO group_messages (id, plan_id, sender_id, content, type, metadata, created_at)
           VALUES ($1, $2, $3, $4, 'ACTIVITY_ALERT', $5, $6)
           RETURNING *`,
          [
            generateId('msg'),
            planId,
            creatorId,
            `🧾 @${creator.username} requested ₦${numericAmount.toLocaleString('en-NG')} for "${description.trim()}"`,
            JSON.stringify({
              event: 'PAYMENT_REQUEST',
              requestId: reqId,
              amount: numericAmount,
              description: description.trim(),
              status: 'PENDING'
            }),
            now
          ]
        );
        alertMessage = {
          id: msgRes.rows[0].id,
          planId,
          sender: creator,
          content: msgRes.rows[0].content,
          type: 'ACTIVITY_ALERT',
          metadata: msgRes.rows[0].metadata,
          createdAt: msgRes.rows[0].created_at
        };
      }

      const r = res.rows[0];
      return {
        paymentRequest: {
          id: r.id,
          creatorId: r.creator_id,
          creator,
          requester: creator,
          planId: r.plan_id,
          amount: roundMoney(r.amount),
          currency: r.currency,
          description: r.description,
          status: r.status,
          paidByUserId: r.paid_by_user_id,
          paidAt: r.paid_at,
          createdAt: r.created_at
        },
        alertMessage
      };
    });
  }

  return withTransaction(async () => {
    const creator = formatSafeUser(localState.users.find((u) => u.id === creatorId));
    const paymentRequest = {
      id: reqId,
      creatorId,
      creator,
      requester: creator,
      planId: planId || null,
      amount: numericAmount,
      currency: 'NGN',
      description: description.trim(),
      status: 'PENDING',
      paidByUserId: null,
      paidAt: null,
      createdAt: now
    };
    localState.paymentRequests.push(paymentRequest);

    let alertMessage = null;
    if (planId) {
      const rawMsg = {
        id: generateId('msg'),
        planId,
        senderId: creatorId,
        content: `🧾 @${creator.username} requested ₦${numericAmount.toLocaleString('en-NG')} for "${description.trim()}"`,
        type: 'ACTIVITY_ALERT',
        metadata: {
          event: 'PAYMENT_REQUEST',
          requestId: reqId,
          amount: numericAmount,
          description: description.trim(),
          status: 'PENDING'
        },
        createdAt: now
      };
      localState.groupMessages.push(rawMsg);
      alertMessage = {
        id: rawMsg.id,
        planId,
        sender: creator,
        content: rawMsg.content,
        type: rawMsg.type,
        metadata: rawMsg.metadata,
        createdAt: rawMsg.createdAt
      };
    }

    return { paymentRequest, alertMessage };
  });
}

async function payPaymentRequest({ requestId, payerId }) {
  const now = new Date().toISOString();
  const baseRef = `PLS-REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  if (isPostgresMode) {
    return withTransaction(async (client) => {
      const reqRes = await client.query(
        'SELECT * FROM payment_requests WHERE id = $1 FOR UPDATE',
        [requestId]
      );
      const reqRow = reqRes.rows[0];
      if (!reqRow) {
        const err = new Error('Payment request not found');
        err.status = 404;
        throw err;
      }
      if (reqRow.status === 'PAID') {
        const err = new Error('This payment request has already been paid');
        err.status = 400;
        throw err;
      }
      if (reqRow.creator_id === payerId) {
        const err = new Error('You cannot pay your own payment request');
        err.status = 400;
        throw err;
      }

      const amount = roundMoney(reqRow.amount);
      const payerWalletRes = await client.query(
        'SELECT * FROM wallets WHERE user_id = $1 FOR UPDATE',
        [payerId]
      );
      if (!payerWalletRes.rows[0] || roundMoney(payerWalletRes.rows[0].balance) < amount) {
        const err = new Error('Insufficient wallet balance to settle this payment request');
        err.status = 400;
        throw err;
      }

      const payerRes = await client.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [payerId]);
      const creatorRes = await client.query(
        'SELECT * FROM users WHERE id = $1 LIMIT 1',
        [reqRow.creator_id]
      );
      const payer = formatSafeUser(payerRes.rows[0]);
      const creator = formatSafeUser(creatorRes.rows[0]);

      const updatedPayerWallet = await client.query(
        'UPDATE wallets SET balance = balance - $1, updated_at = $2 WHERE user_id = $3 RETURNING *',
        [amount, now, payerId]
      );
      const updatedCreatorWallet = await client.query(
        'UPDATE wallets SET balance = balance + $1, updated_at = $2 WHERE user_id = $3 RETURNING *',
        [amount, now, creator.id]
      );

      const updatedReq = await client.query(
        `UPDATE payment_requests
         SET status = 'PAID', paid_by_user_id = $1, paid_at = $2
         WHERE id = $3
         RETURNING *`,
        [payerId, now, requestId]
      );

      const txRes = await client.query(
        `INSERT INTO transactions (id, user_id, type, amount, currency, reference, description, metadata, created_at)
         VALUES ($1, $2, 'P2P_SEND', $3, 'NGN', $4, $5, $6, $7)
         RETURNING *`,
        [
          generateId('txn'),
          payerId,
          amount,
          `${baseRef}-OUT`,
          `Paid request "${reqRow.description}" to @${creator.username}`,
          JSON.stringify({ requestId, recipientId: creator.id }),
          now
        ]
      );

      await client.query(
        `INSERT INTO transactions (id, user_id, type, amount, currency, reference, description, metadata, created_at)
         VALUES ($1, $2, 'P2P_RECEIVE', $3, 'NGN', $4, $5, $6, $7)`,
        [
          generateId('txn'),
          creator.id,
          amount,
          `${baseRef}-IN`,
          `Payment request "${reqRow.description}" settled by @${payer.username}`,
          JSON.stringify({ requestId, payerId }),
          now
        ]
      );

      const notifRes = await client.query(
        `INSERT INTO notifications (id, user_id, title, message, type, metadata, created_at)
         VALUES ($1, $2, 'Payment Request Settled!', $3, 'REQUEST_PAID', $4, $5)
         RETURNING *`,
        [
          generateId('ntf'),
          creator.id,
          `@${payer.username} paid ₦${amount.toLocaleString('en-NG')} for "${reqRow.description}".`,
          JSON.stringify({ requestId, payerId, amount }),
          now
        ]
      );

      let alertMessage = null;
      if (reqRow.plan_id) {
        await client.query(
          `UPDATE group_messages
           SET metadata = COALESCE(metadata, '{}'::jsonb) || $1::jsonb
           WHERE plan_id = $2 AND metadata->>'requestId' = $3`,
          [
            JSON.stringify({ status: 'PAID', paidBy: payer.username, paidByUserId: payerId, paidAt: now }),
            reqRow.plan_id,
            requestId
          ]
        );

        const msgRes = await client.query(
          `INSERT INTO group_messages (id, plan_id, sender_id, content, type, metadata, created_at)
           VALUES ($1, $2, $3, $4, 'ACTIVITY_ALERT', $5, $6)
           RETURNING *`,
          [
            generateId('msg'),
            reqRow.plan_id,
            payerId,
            `✅ @${payer.username} paid ₦${amount.toLocaleString('en-NG')} to @${creator.username} for "${reqRow.description}"`,
            JSON.stringify({ event: 'PAYMENT_REQUEST_PAID', requestId, amount, status: 'PAID' }),
            now
          ]
        );
        alertMessage = {
          id: msgRes.rows[0].id,
          planId: reqRow.plan_id,
          sender: payer,
          content: msgRes.rows[0].content,
          type: 'ACTIVITY_ALERT',
          metadata: msgRes.rows[0].metadata,
          createdAt: msgRes.rows[0].created_at
        };
      }

      const r = updatedReq.rows[0];
      const t = txRes.rows[0];
      const nRow = notifRes.rows[0];
      return {
        paymentRequest: {
          id: r.id,
          creatorId: r.creator_id,
          planId: r.plan_id,
          amount: roundMoney(r.amount),
          currency: r.currency,
          description: r.description,
          status: r.status,
          paidBy: payer.username,
          paidByUserId: r.paid_by_user_id,
          paidAt: r.paid_at,
          createdAt: r.created_at
        },
        transaction: {
          id: t.id,
          userId: t.user_id,
          type: t.type,
          direction: 'DEBIT',
          amount: roundMoney(t.amount),
          currency: t.currency,
          reference: t.reference,
          description: t.description,
          createdAt: t.created_at
        },
        newBalance: roundMoney(updatedPayerWallet.rows[0].balance),
        creatorBalance: roundMoney(updatedCreatorWallet.rows[0]?.balance || 0),
        creator,
        creatorNotification: {
          id: nRow.id,
          userId: nRow.user_id,
          title: nRow.title,
          message: nRow.message,
          body: nRow.message,
          type: nRow.type,
          isRead: nRow.is_read,
          metadata: nRow.metadata || {},
          createdAt: nRow.created_at
        },
        alertMessage
      };
    });
  }

  return withTransaction(async () => {
    const reqItem = localState.paymentRequests.find((r) => r.id === requestId);
    if (!reqItem) {
      const err = new Error('Payment request not found');
      err.status = 404;
      throw err;
    }
    if (reqItem.status === 'PAID') {
      const err = new Error('This payment request has already been paid');
      err.status = 400;
      throw err;
    }
    if (reqItem.creatorId === payerId) {
      const err = new Error('You cannot pay your own payment request');
      err.status = 400;
      throw err;
    }

    const amount = roundMoney(reqItem.amount);
    const payerWallet = localState.wallets.find((w) => w.userId === payerId);
    const creatorWallet = localState.wallets.find((w) => w.userId === reqItem.creatorId);
    if (!payerWallet || roundMoney(payerWallet.balance) < amount) {
      const err = new Error('Insufficient wallet balance to settle this payment request');
      err.status = 400;
      throw err;
    }

    const payer = formatSafeUser(localState.users.find((u) => u.id === payerId));
    const creator = formatSafeUser(localState.users.find((u) => u.id === reqItem.creatorId));

    payerWallet.balance = roundMoney(payerWallet.balance - amount);
    payerWallet.updatedAt = now;

    creatorWallet.balance = roundMoney(creatorWallet.balance + amount);
    creatorWallet.updatedAt = now;

    reqItem.status = 'PAID';
    reqItem.paidBy = payer.username;
    reqItem.paidByUserId = payerId;
    reqItem.paidAt = now;

    const sendTx = {
      id: generateId('txn'),
      userId: payerId,
      type: 'P2P_SEND',
      direction: 'DEBIT',
      amount,
      currency: 'NGN',
      reference: `${baseRef}-OUT`,
      description: `Paid request "${reqItem.description}" to @${creator.username}`,
      metadata: { requestId, recipientId: creator.id },
      createdAt: now
    };
    const recTx = {
      id: generateId('txn'),
      userId: creator.id,
      type: 'P2P_RECEIVE',
      direction: 'CREDIT',
      amount,
      currency: 'NGN',
      reference: `${baseRef}-IN`,
      description: `Payment request "${reqItem.description}" settled by @${payer.username}`,
      metadata: { requestId, payerId },
      createdAt: now
    };
    localState.transactions.push(sendTx, recTx);

    const creatorNotification = {
      id: generateId('ntf'),
      userId: creator.id,
      title: 'Payment Request Settled!',
      message: `@${payer.username} paid ₦${amount.toLocaleString('en-NG')} for "${reqItem.description}".`,
      body: `@${payer.username} paid ₦${amount.toLocaleString('en-NG')} for "${reqItem.description}".`,
      type: 'REQUEST_PAID',
      isRead: false,
      metadata: { requestId, payerId, amount },
      createdAt: now
    };
    localState.notifications.push(creatorNotification);

    let alertMessage = null;
    if (reqItem.planId) {
      localState.groupMessages.forEach((gm) => {
        if (gm.planId === reqItem.planId && gm.metadata?.requestId === requestId) {
          gm.metadata = {
            ...gm.metadata,
            status: 'PAID',
            paidBy: payer.username,
            paidByUserId: payerId,
            paidAt: now
          };
        }
      });

      const rawMsg = {
        id: generateId('msg'),
        planId: reqItem.planId,
        senderId: payerId,
        content: `✅ @${payer.username} paid ₦${amount.toLocaleString('en-NG')} to @${creator.username} for "${reqItem.description}"`,
        type: 'ACTIVITY_ALERT',
        metadata: { event: 'PAYMENT_REQUEST_PAID', requestId, amount, status: 'PAID' },
        createdAt: now
      };
      localState.groupMessages.push(rawMsg);
      alertMessage = {
        id: rawMsg.id,
        planId: reqItem.planId,
        sender: payer,
        content: rawMsg.content,
        type: rawMsg.type,
        metadata: rawMsg.metadata,
        createdAt: rawMsg.createdAt
      };
    }

    return {
      paymentRequest: { ...reqItem },
      transaction: sendTx,
      newBalance: payerWallet.balance,
      creatorBalance: creatorWallet.balance,
      creator,
      creatorNotification,
      alertMessage
    };
  });
}

async function listNotifications(userId) {
  if (isPostgresMode) {
    const res = await pgPool.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    const notifications = res.rows.map((n) => ({
      id: n.id,
      userId: n.user_id,
      title: n.title,
      message: n.message,
      body: n.message,
      type: n.type,
      isRead: n.is_read,
      metadata: n.metadata || {},
      createdAt: n.created_at
    }));
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    return { notifications, unreadCount };
  }

  const notifications = localState.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 50)
    .map((n) => ({
      ...n,
      body: n.message || n.body
    }));
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  return { notifications, unreadCount };
}

async function markAllNotificationsRead(userId) {
  if (isPostgresMode) {
    await pgPool.query('UPDATE notifications SET is_read = TRUE WHERE user_id = $1', [userId]);
    return { success: true, unreadCount: 0 };
  }

  localState.notifications.forEach((n) => {
    if (n.userId === userId) {
      n.isRead = true;
    }
  });
  persistLocalState();
  return { success: true, unreadCount: 0 };
}

module.exports = {
  initDb,
  resetDb,
  closeDb,
  withTransaction,
  createUserWithWallet,
  findUserByEmailOrUsername,
  findUserById,
  searchUsers,
  getWalletByUserId,
  getTotalSavedByUserId,
  listTransactionsByUserId,
  fundWallet,
  createSavingsPlan,
  listSavingsPlansForUser,
  joinGroupPlanByInviteCode,
  getSavingsPlanDetails,
  contributeToSavingsPlan,
  listGroupMessages,
  createGroupMessage,
  executeP2PTransfer,
  createPaymentRequest,
  payPaymentRequest,
  listNotifications,
  markAllNotificationsRead
};
