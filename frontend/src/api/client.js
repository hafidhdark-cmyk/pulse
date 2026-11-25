import { mockService } from './mockService';

/**
 * TOGGLE: When your backend engineer finishes, flip this to false!
 * true  = Decoupled mock layer (default for now, matches 100% of API spec)
 * false = Real backend requests to http://localhost:4000/api or /api
 */
export const USE_MOCK = true;

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function realFetch(endpoint, options = {}) {
  const token = localStorage.getItem('pulse_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
}

export const api = {
  // Auth
  auth: {
    login: (credentials) =>
      USE_MOCK ? mockService.login(credentials) : realFetch('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) =>
      USE_MOCK ? mockService.register(userData) : realFetch('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () =>
      USE_MOCK ? mockService.getMe() : realFetch('/auth/me')
  },

  // Wallet
  wallet: {
    getWallet: () =>
      USE_MOCK ? mockService.getWallet() : realFetch('/wallet'),
    fund: (payload) =>
      USE_MOCK ? mockService.fundWallet(payload) : realFetch('/wallet/fund', { method: 'POST', body: JSON.stringify(payload) })
  },

  // Savings
  savings: {
    getPlans: () =>
      USE_MOCK ? mockService.getSavingsPlans() : realFetch('/savings'),
    getPlan: (id) =>
      USE_MOCK ? mockService.getSavingsPlan(id) : realFetch(`/savings/${id}`),
    createPlan: (data) =>
      USE_MOCK ? mockService.createSavingsPlan(data) : realFetch('/savings', { method: 'POST', body: JSON.stringify(data) }),
    joinPlan: (payload) =>
      USE_MOCK ? mockService.joinSavingsPlan(payload) : realFetch('/savings/join', { method: 'POST', body: JSON.stringify(payload) }),
    contribute: (id, payload) =>
      USE_MOCK ? mockService.contributeToPlan(id, payload) : realFetch(`/savings/${id}/contribute`, { method: 'POST', body: JSON.stringify(payload) })
  },

  // Chat & Messages
  chat: {
    getMessages: (planId) =>
      USE_MOCK ? mockService.getMessages(planId) : realFetch(`/savings/${planId}/messages`),
    sendMessage: (planId, payload) =>
      USE_MOCK ? mockService.sendMessage(planId, payload) : realFetch(`/savings/${planId}/messages`, { method: 'POST', body: JSON.stringify(payload) })
  },

  // Transfers & Bill Split
  transfers: {
    lookup: (q) =>
      USE_MOCK ? mockService.lookupUser(q) : realFetch(`/users/lookup?q=${encodeURIComponent(q)}`),
    p2p: (payload) =>
      USE_MOCK ? mockService.sendP2PTransfer(payload) : realFetch('/transfers/p2p', { method: 'POST', body: JSON.stringify(payload) }),
    createRequest: (payload) =>
      USE_MOCK ? mockService.createPaymentRequest(payload) : realFetch('/transfers/request', { method: 'POST', body: JSON.stringify(payload) }),
    payRequest: (id) =>
      USE_MOCK ? mockService.payPaymentRequest(id) : realFetch(`/transfers/request/${id}/pay`, { method: 'POST' })
  },

  // Notifications
  notifications: {
    get: () =>
      USE_MOCK ? mockService.getNotifications() : realFetch('/notifications'),
    markAllRead: () =>
      USE_MOCK ? mockService.markAllNotificationsRead() : realFetch('/notifications/read-all', { method: 'PATCH' })
  }
};
