import {
  initialMockUser,
  initialMockWallet,
  initialMockPlans,
  initialMockMessages,
  initialMockNotifications
} from './mockData';

// Local storage keys
const STORAGE_KEYS = {
  USER: 'pulse_mock_user',
  WALLET: 'pulse_mock_wallet',
  PLANS: 'pulse_mock_plans',
  MESSAGES: 'pulse_mock_messages',
  NOTIFS: 'pulse_mock_notifications',
  TOKEN: 'pulse_token'
};

function loadStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Storage error', err);
  }
}

// In-memory state synchronized with localStorage
let currentUser = loadStorage(STORAGE_KEYS.USER, initialMockUser);
let currentWallet = loadStorage(STORAGE_KEYS.WALLET, initialMockWallet);
let currentPlans = loadStorage(STORAGE_KEYS.PLANS, initialMockPlans);
let currentMessages = loadStorage(STORAGE_KEYS.MESSAGES, initialMockMessages);
let currentNotifs = loadStorage(STORAGE_KEYS.NOTIFS, initialMockNotifications);

// Simulates network latency (100-250ms)
const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms));

export const mockService = {
  // Auth
  async login({ emailOrUsername, password }) {
    await delay();
    if (!password) throw new Error("Password is required");
    const user = {
      ...currentUser,
      username: emailOrUsername.includes('@') ? currentUser.username : emailOrUsername
    };
    currentUser = user;
    saveStorage(STORAGE_KEYS.USER, user);
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock_jwt_token_pulse_' + Date.now());
    return {
      token: localStorage.getItem(STORAGE_KEYS.TOKEN),
      user,
      wallet: {
        id: currentWallet.id,
        balance: currentWallet.balance,
        currency: currentWallet.currency
      }
    };
  },

  async register({ name, username, email, password }) {
    await delay();
    if (!username || !email || !password) throw new Error("All fields are required");
    const user = {
      id: "usr_" + Math.random().toString(36).substring(2, 7),
      name: name || username,
      username: username.replace('@', ''),
      email,
      createdAt: new Date().toISOString()
    };
    const wallet = {
      id: "wal_" + Math.random().toString(36).substring(2, 7),
      balance: 0,
      totalSaved: 0,
      currency: "NGN",
      transactions: []
    };
    currentUser = user;
    currentWallet = wallet;
    saveStorage(STORAGE_KEYS.USER, user);
    saveStorage(STORAGE_KEYS.WALLET, wallet);
    localStorage.setItem(STORAGE_KEYS.TOKEN, 'mock_jwt_token_pulse_' + Date.now());
    return {
      token: localStorage.getItem(STORAGE_KEYS.TOKEN),
      user,
      wallet: { id: wallet.id, balance: 0, currency: "NGN" }
    };
  },

  async getMe() {
    await delay(80);
    return {
      user: currentUser,
      wallet: {
        id: currentWallet.id,
        balance: currentWallet.balance,
        totalSaved: currentWallet.totalSaved,
        currency: currentWallet.currency
      },
      unreadNotifications: currentNotifs.filter(n => !n.isRead).length
    };
  },

  // Wallet
  async getWallet() {
    await delay(100);
    return {
      balance: currentWallet.balance,
      totalSaved: currentWallet.totalSaved,
      currency: currentWallet.currency,
      transactions: currentWallet.transactions
    };
  },

  async fundWallet({ amount, method, reference }) {
    await delay(200);
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) throw new Error("Invalid funding amount");

    currentWallet.balance += numAmount;
    const txn = {
      id: "txn_" + Date.now(),
      type: "FUND",
      direction: "CREDIT",
      amount: numAmount,
      reference: reference || `PLS-FND-${Math.floor(10000 + Math.random() * 90000)}`,
      description: `Wallet funded via ${method || 'demo'}`,
      createdAt: new Date().toISOString()
    };
    currentWallet.transactions.unshift(txn);
    saveStorage(STORAGE_KEYS.WALLET, currentWallet);

    return {
      message: "Wallet funded successfully",
      wallet: { balance: currentWallet.balance, currency: "NGN" },
      transaction: txn
    };
  },

  // Savings Plans
  async getSavingsPlans() {
    await delay(120);
    const personalPlans = currentPlans.filter(p => p.type === 'PERSONAL');
    const groupPlans = currentPlans.filter(p => p.type === 'GROUP');
    return {
      plans: currentPlans,
      personalPlans,
      groupPlans
    };
  },

  async getSavingsPlan(id) {
    await delay(100);
    const plan = currentPlans.find(p => p.id === id);
    if (!plan) throw new Error("Savings plan not found");
    return {
      plan: {
        id: plan.id,
        title: plan.title,
        description: plan.description,
        type: plan.type,
        targetAmount: plan.targetAmount,
        currentAmount: plan.currentAmount,
        progressPercent: plan.progressPercent,
        frequency: plan.frequency,
        inviteCode: plan.inviteCode,
        deadline: plan.deadline
      },
      members: plan.members || [],
      leaderboard: plan.leaderboard || [],
      insights: plan.insights || {
        remainingAmount: Math.max(0, plan.targetAmount - plan.currentAmount),
        daysRemaining: 30,
        dailyPerMember: 500,
        weeklyPerMember: 3500,
        status: "ON_TRACK",
        summary: "⚡ Smart Pace: Save regularly to hit target."
      }
    };
  },

  async createSavingsPlan(data) {
    await delay(200);
    const id = "pln_" + Math.random().toString(36).substring(2, 6);
    const inviteCode = "PLS-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const target = Number(data.targetAmount);

    const newPlan = {
      id,
      title: data.title,
      description: data.description || "",
      type: data.type || "GROUP",
      targetAmount: target,
      currentAmount: 0,
      progressPercent: 0,
      frequency: data.frequency || "WEEKLY",
      inviteCode,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : new Date(Date.now() + 30*86400000).toISOString(),
      memberCount: 1,
      myContribution: 0,
      creatorId: currentUser.id,
      members: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          username: currentUser.username,
          role: "ADMIN",
          contributedAmount: 0,
          sharePercent: 0,
          rank: 1,
          badge: "🥇 Top Saver"
        }
      ],
      leaderboard: [
        { rank: 1, username: currentUser.username, name: currentUser.name, contributedAmount: 0, sharePercent: 0, badge: "🥇 Top Saver" }
      ],
      insights: {
        remainingAmount: target,
        daysRemaining: 30,
        dailyPerMember: Math.round(target / 30),
        weeklyPerMember: Math.round(target / 4),
        status: "ON_TRACK",
        summary: `⚡ Smart Pace: Save ₦${Math.round(target / 30)}/day to hit target on schedule.`
      }
    };

    currentPlans.unshift(newPlan);
    saveStorage(STORAGE_KEYS.PLANS, currentPlans);
    return { plan: newPlan, inviteCode };
  },

  async joinSavingsPlan({ inviteCode }) {
    await delay(150);
    const cleanCode = inviteCode.trim().toUpperCase();
    const plan = currentPlans.find(p => p.inviteCode.toUpperCase() === cleanCode);
    if (!plan) throw new Error("Invalid invite code or plan not found");

    const alreadyMember = plan.members?.some(m => m.userId === currentUser.id);
    if (!alreadyMember) {
      plan.members = plan.members || [];
      plan.members.push({
        userId: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        role: "MEMBER",
        contributedAmount: 0,
        sharePercent: 0,
        rank: plan.members.length + 1,
        badge: "⚡ Active Saver"
      });
      plan.memberCount = plan.members.length;
      saveStorage(STORAGE_KEYS.PLANS, currentPlans);
    }

    return {
      message: "Joined group savings plan",
      plan: { id: plan.id, title: plan.title, inviteCode: plan.inviteCode }
    };
  },

  async contributeToPlan(planId, { amount }) {
    await delay(200);
    const numAmount = Number(amount);
    if (currentWallet.balance < numAmount) {
      throw new Error("Insufficient wallet balance for this contribution");
    }

    const plan = currentPlans.find(p => p.id === planId);
    if (!plan) throw new Error("Savings plan not found");

    // Deduct from wallet
    currentWallet.balance -= numAmount;
    currentWallet.totalSaved += numAmount;

    // Log transaction
    const txn = {
      id: "txn_" + Date.now(),
      type: "SAVINGS_CONTRIBUTION",
      direction: "DEBIT",
      amount: numAmount,
      reference: `PLS-SAV-${Math.floor(10000 + Math.random() * 90000)}`,
      description: `Contribution to ${plan.title}`,
      createdAt: new Date().toISOString()
    };
    currentWallet.transactions.unshift(txn);
    saveStorage(STORAGE_KEYS.WALLET, currentWallet);

    // Update plan
    plan.currentAmount += numAmount;
    plan.progressPercent = Math.min(100, Math.round((plan.currentAmount / plan.targetAmount) * 100));
    plan.myContribution = (plan.myContribution || 0) + numAmount;

    // Update member record & leaderboard
    let member = plan.members?.find(m => m.userId === currentUser.id);
    if (member) {
      member.contributedAmount += numAmount;
    }

    // Recalculate leaderboard
    if (plan.members) {
      const totalContributed = plan.members.reduce((s, m) => s + m.contributedAmount, 0) || 1;
      plan.members.sort((a, b) => b.contributedAmount - a.contributedAmount);
      plan.members.forEach((m, idx) => {
        m.rank = idx + 1;
        m.sharePercent = Number(((m.contributedAmount / totalContributed) * 100).toFixed(1));
        m.badge = idx === 0 ? "🥇 Top Saver" : idx === 1 ? "🥈 Runner-Up" : "⚡ Active Saver";
      });
      plan.leaderboard = plan.members.map(m => ({
        rank: m.rank,
        username: m.username,
        name: m.name,
        contributedAmount: m.contributedAmount,
        sharePercent: m.sharePercent,
        badge: m.badge
      }));
    }

    saveStorage(STORAGE_KEYS.PLANS, currentPlans);

    // Auto-post ACTIVITY_ALERT to chat feed
    if (!currentMessages[planId]) currentMessages[planId] = [];
    const alertMsg = {
      id: "msg_" + Date.now(),
      planId,
      type: "ACTIVITY_ALERT",
      content: `🔥 @${currentUser.username} contributed ₦${numAmount.toLocaleString()}! Plan is now at ${plan.progressPercent}% of target.`,
      sender: { id: currentUser.id, name: currentUser.name, username: currentUser.username },
      metadata: { amount: numAmount, progressPercent: plan.progressPercent },
      createdAt: new Date().toISOString()
    };
    currentMessages[planId].push(alertMsg);
    saveStorage(STORAGE_KEYS.MESSAGES, currentMessages);

    return {
      message: "Contribution successful",
      walletBalance: currentWallet.balance,
      plan: {
        id: plan.id,
        currentAmount: plan.currentAmount,
        targetAmount: plan.targetAmount,
        progressPercent: plan.progressPercent
      },
      transaction: txn
    };
  },

  // Group Messages & Chat
  async getMessages(planId) {
    await delay(80);
    return {
      messages: currentMessages[planId] || []
    };
  },

  async sendMessage(planId, { content, type = "CHAT", metadata = null }) {
    await delay(120);
    if (!content) throw new Error("Message content cannot be empty");
    if (!currentMessages[planId]) currentMessages[planId] = [];

    const newMsg = {
      id: "msg_" + Date.now(),
      planId,
      type,
      content,
      sender: { id: currentUser.id, name: currentUser.name, username: currentUser.username },
      metadata,
      createdAt: new Date().toISOString()
    };
    currentMessages[planId].push(newMsg);
    saveStorage(STORAGE_KEYS.MESSAGES, currentMessages);
    return { message: newMsg };
  },

  // P2P Transfers & Lookup
  async lookupUser(query) {
    await delay(100);
    const q = query.toLowerCase().replace('@', '').trim();
    const directory = [
      { id: "usr_02", name: "Lam", username: "lam" },
      { id: "usr_03", name: "Chioma Okonjo", username: "chioma" },
      { id: "usr_04", name: "Tunde Ednut", username: "tunde" },
      { id: "usr_05", name: "Zainab Ahmed", username: "zainab" }
    ];
    const match = directory.find(u => u.username.includes(q) || u.name.toLowerCase().includes(q));
    if (!match) throw new Error(`User '@${query}' not found on Pulse`);
    return { user: match };
  },

  async sendP2PTransfer({ recipientUsername, amount, note }) {
    await delay(250);
    const numAmount = Number(amount);
    if (numAmount <= 0) throw new Error("Amount must be greater than zero");
    if (currentWallet.balance < numAmount) {
      throw new Error("Insufficient wallet balance for this transfer");
    }

    const { user: recipient } = await this.lookupUser(recipientUsername);

    currentWallet.balance -= numAmount;
    const txn = {
      id: "txn_" + Date.now(),
      type: "P2P_SEND",
      direction: "DEBIT",
      amount: numAmount,
      reference: `PLS-P2P-${Math.floor(10000 + Math.random() * 90000)}`,
      description: `Transfer to @${recipient.username}${note ? ': ' + note : ''}`,
      recipient,
      createdAt: new Date().toISOString()
    };
    currentWallet.transactions.unshift(txn);
    saveStorage(STORAGE_KEYS.WALLET, currentWallet);

    return {
      message: "Transfer successful",
      newBalance: currentWallet.balance,
      transaction: txn
    };
  },

  async createPaymentRequest({ amount, description, planId }) {
    await delay(150);
    const numAmount = Number(amount);
    const req = {
      id: "req_" + Date.now(),
      requester: { id: currentUser.id, name: currentUser.name, username: currentUser.username },
      amount: numAmount,
      description,
      status: "PENDING",
      planId,
      createdAt: new Date().toISOString()
    };

    if (planId) {
      await this.sendMessage(planId, {
        content: `💰 Bill Split: ${description} (₦${numAmount.toLocaleString()})`,
        type: "PAYMENT_REQUEST",
        metadata: {
          requestId: req.id,
          amount: numAmount,
          status: "PENDING",
          requester: req.requester
        }
      });
    }

    return { paymentRequest: req };
  },

  async payPaymentRequest(requestId) {
    await delay(200);
    // Find in any plan messages
    let foundMsg = null;
    let targetPlanId = null;

    for (const [pId, msgs] of Object.entries(currentMessages)) {
      const m = msgs.find(x => x.metadata?.requestId === requestId);
      if (m) {
        foundMsg = m;
        targetPlanId = pId;
        break;
      }
    }

    const amount = foundMsg ? foundMsg.metadata.amount : 5000;
    if (currentWallet.balance < amount) {
      throw new Error("Insufficient wallet balance to pay split request");
    }

    currentWallet.balance -= amount;
    const txn = {
      id: "txn_" + Date.now(),
      type: "REQUEST_PAYMENT",
      direction: "DEBIT",
      amount,
      reference: `PLS-REQ-${Math.floor(10000 + Math.random() * 90000)}`,
      description: `Settled split: ${foundMsg ? foundMsg.content : 'Payment request'}`,
      createdAt: new Date().toISOString()
    };
    currentWallet.transactions.unshift(txn);
    saveStorage(STORAGE_KEYS.WALLET, currentWallet);

    if (foundMsg) {
      foundMsg.metadata.status = "PAID";
      foundMsg.metadata.paidBy = currentUser.username;
      saveStorage(STORAGE_KEYS.MESSAGES, currentMessages);
    }

    return {
      message: "Payment request settled",
      newBalance: currentWallet.balance,
      transaction: txn
    };
  },

  // Notifications
  async getNotifications() {
    await delay(80);
    const unreadCount = currentNotifs.filter(n => !n.isRead).length;
    return {
      unreadCount,
      notifications: currentNotifs
    };
  },

  async markAllNotificationsRead() {
    await delay(80);
    currentNotifs.forEach(n => { n.isRead = true; });
    saveStorage(STORAGE_KEYS.NOTIFS, currentNotifs);
    return { success: true, unreadCount: 0 };
  }
};
