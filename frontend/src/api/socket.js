import { io } from 'socket.io-client';
import { USE_MOCK } from './client';

class MockSocket {
  constructor() {
    this.listeners = {};
  }
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
  }
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  emit(event, data) {
    // In mock mode, log room events or handle mock ping
    console.log(`[MockSocket Emit] ${event}:`, data);
  }
  // Helper to simulate incoming backend events in mock mode
  trigger(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(data));
    }
  }
  disconnect() {}
}

let socketInstance = null;

export function getSocket() {
  if (USE_MOCK) {
    if (!socketInstance) {
      socketInstance = new MockSocket();
    }
    return socketInstance;
  }

  if (!socketInstance) {
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    socketInstance = io(socketUrl, {
      auth: { token: localStorage.getItem('pulse_token') }
    });
  }
  return socketInstance;
}
