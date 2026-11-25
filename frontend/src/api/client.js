const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('pulse_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

export const api = {
  auth: {
    login: (credentials) =>
      request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData) =>
      request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () => request('/auth/me')
  },

  wallet: {
    getWallet: () => request('/wallet'),
    fund: (payload) =>
      request('/wallet/fund', { method: 'POST', body: JSON.stringify(payload) })
  },

  savings: {
    getPlans: async () => {
      const res = await request('/savings');
      const plans = res.plans || [
        ...(res.groupPlans || []),
        ...(res.personalPlans || [])
      ];
      return { ...res, plans };
    },
    getPlan: (id) => request(`/savings/${id}`),
    createPlan: (data) =>
      request('/savings', { method: 'POST', body: JSON.stringify(data) }),
    joinPlan: (payload) =>
      request('/savings/join', { method: 'POST', body: JSON.stringify(payload) }),
    contribute: (id, payload) =>
      request(`/savings/${id}/contribute`, { method: 'POST', body: JSON.stringify(payload) })
  },

  chat: {
    getMessages: (planId) => request(`/savings/${planId}/messages`),
    sendMessage: (planId, payload) =>
      request(`/savings/${planId}/messages`, { method: 'POST', body: JSON.stringify(payload) })
  },

  transfers: {
    lookup: (q) => request(`/users/lookup?q=${encodeURIComponent(q)}`),
    p2p: (payload) =>
      request('/transfers/p2p', { method: 'POST', body: JSON.stringify(payload) }),
    createRequest: (payload) =>
      request('/transfers/request', { method: 'POST', body: JSON.stringify(payload) }),
    payRequest: (id) =>
      request(`/transfers/request/${id}/pay`, { method: 'POST' })
  },

  notifications: {
    get: () => request('/notifications'),
    markAllRead: () => request('/notifications/read-all', { method: 'PATCH' })
  }
};
