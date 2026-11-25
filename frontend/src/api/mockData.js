/**
 * Initial Mock Seed Data matching the exact schema and guide
 */
export const initialMockUser = {
  id: "usr_01",
  name: "Hafidh Dark",
  username: "hafidh",
  email: "hafidh@pulse.app",
  avatarColor: "from-emerald-500 to-teal-700",
  createdAt: "2026-11-20T10:00:00.000Z"
};

export const initialMockWallet = {
  id: "wal_01",
  balance: 35000,
  totalSaved: 34000,
  currency: "NGN",
  transactions: [
    {
      id: "txn_03",
      type: "SAVINGS_CONTRIBUTION",
      direction: "DEBIT",
      amount: 15000,
      reference: "PLS-SAV-99182",
      description: "Contribution to December Detty Group Plan",
      createdAt: "2026-11-25T11:45:00.000Z"
    },
    {
      id: "txn_02",
      type: "P2P_RECEIVE",
      direction: "CREDIT",
      amount: 10000,
      reference: "PLS-P2P-33921",
      description: "Transfer from @lam: Hackathon snacks refund",
      createdAt: "2026-11-24T16:20:00.000Z"
    },
    {
      id: "txn_01",
      type: "FUND",
      direction: "CREDIT",
      amount: 50000,
      reference: "PLS-FND-10293",
      description: "Wallet funded via demo",
      createdAt: "2026-11-24T09:00:00.000Z"
    }
  ]
};

export const initialMockPlans = [
  {
    id: "pln_01",
    title: "December Detty Group Plan",
    description: "End of year vacation and festivities kitty with the squad",
    type: "GROUP",
    targetAmount: 100000,
    currentAmount: 84000,
    progressPercent: 84,
    frequency: "WEEKLY",
    inviteCode: "PLS-89X2",
    deadline: "2026-12-25T00:00:00.000Z",
    memberCount: 4,
    myContribution: 34000,
    creatorId: "usr_02",
    members: [
      {
        userId: "usr_02",
        name: "Lam",
        username: "lam",
        role: "ADMIN",
        contributedAmount: 50000,
        sharePercent: 59.5,
        rank: 1,
        badge: "🥇 Top Saver"
      },
      {
        userId: "usr_01",
        name: "Hafidh Dark",
        username: "hafidh",
        role: "MEMBER",
        contributedAmount: 34000,
        sharePercent: 40.5,
        rank: 2,
        badge: "⚡ Active Saver"
      }
    ],
    leaderboard: [
      { rank: 1, username: "lam", name: "Lam", contributedAmount: 50000, sharePercent: 59.5, badge: "🥇 Top Saver" },
      { rank: 2, username: "hafidh", name: "Hafidh Dark", contributedAmount: 34000, sharePercent: 40.5, badge: "⚡ Active Saver" }
    ],
    insights: {
      remainingAmount: 16000,
      daysRemaining: 25,
      dailyPerMember: 320,
      weeklyPerMember: 2240,
      status: "ON_TRACK",
      summary: "⚡ Smart Pace: Save ₦320/day per member to hit ₦100,000 on schedule."
    }
  },
  {
    id: "pln_02",
    title: "Emergency Rainy Day Fund",
    description: "Personal 3-month safety buffer for unexpected expenses",
    type: "PERSONAL",
    targetAmount: 200000,
    currentAmount: 60000,
    progressPercent: 30,
    frequency: "MONTHLY",
    inviteCode: "PLS-99E1",
    deadline: "2027-03-31T00:00:00.000Z",
    memberCount: 1,
    myContribution: 60000,
    creatorId: "usr_01",
    members: [
      {
        userId: "usr_01",
        name: "Hafidh Dark",
        username: "hafidh",
        role: "ADMIN",
        contributedAmount: 60000,
        sharePercent: 100,
        rank: 1,
        badge: "🥇 Top Saver"
      }
    ],
    leaderboard: [
      { rank: 1, username: "hafidh", name: "Hafidh Dark", contributedAmount: 60000, sharePercent: 100, badge: "🥇 Top Saver" }
    ],
    insights: {
      remainingAmount: 140000,
      daysRemaining: 126,
      dailyPerMember: 1111,
      weeklyPerMember: 7777,
      status: "ON_TRACK",
      summary: "⚡ Smart Pace: Save ₦1,111/day to hit ₦200,000 on schedule."
    }
  }
];

export const initialMockMessages = {
  "pln_01": [
    {
      id: "msg_01",
      planId: "pln_01",
      type: "ACTIVITY_ALERT",
      content: "🔥 @lam contributed ₦15,000! Plan is now at 84% of target.",
      sender: { id: "usr_02", name: "Lam", username: "lam" },
      metadata: { amount: 15000, progressPercent: 84 },
      createdAt: "2026-11-25T11:40:00.000Z"
    },
    {
      id: "msg_02",
      planId: "pln_01",
      type: "CHAT",
      content: "Awesome progress team! Just dropped my contribution too 🚀",
      sender: { id: "usr_01", name: "Hafidh Dark", username: "hafidh" },
      metadata: null,
      createdAt: "2026-11-25T11:42:00.000Z"
    },
    {
      id: "msg_03",
      planId: "pln_01",
      type: "PAYMENT_REQUEST",
      content: "Shared Uber bill for the planning meetup",
      sender: { id: "usr_02", name: "Lam", username: "lam" },
      metadata: {
        requestId: "req_01",
        amount: 4500,
        status: "PENDING"
      },
      createdAt: "2026-11-25T11:44:00.000Z"
    }
  ]
};

export const initialMockNotifications = [
  {
    id: "notif_01",
    title: "Money Received 💸",
    body: "@lam sent you ₦10,000 (Hackathon snacks refund)",
    type: "P2P_RECEIVED",
    isRead: false,
    createdAt: "2026-11-24T16:20:00.000Z"
  },
  {
    id: "notif_02",
    title: "Group Goal Near! 🎯",
    body: "December Detty Group Plan reached 84% of target",
    type: "GOAL_PROGRESS",
    isRead: true,
    createdAt: "2026-11-25T11:40:00.000Z"
  }
];
