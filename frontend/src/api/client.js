const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
  const rawToken = localStorage.getItem('pulse_token');
  const token = rawToken && rawToken !== 'null' && rawToken !== 'undefined' ? rawToken.trim() : null;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  let data = {};
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401 && !endpoint.startsWith('/auth/login') && !endpoint.startsWith('/auth/register')) {
      localStorage.removeItem('pulse_token');
      window.dispatchEvent(
        new CustomEvent('pulse:unauthorized', {
          detail: { message: data.error || 'Session expired. Please sign in again.' }
        })
      );
    }
    const err = new Error(data.error || 'Request failed');
    err.status = response.status;
    throw err;
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
      request(`/savings/${id}/contribute`, { method: 'POST', body: JSON.stringify(payload) }),
    withdraw: (id, payload) =>
      request(`/savings/${id}/withdraw`, { method: 'POST', body: JSON.stringify(payload) }),
    approveWithdrawal: (planId, withdrawalId, action = 'APPROVE') =>
      request(`/savings/${planId}/withdrawals/${withdrawalId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ action })
      })
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
