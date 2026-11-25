import { io } from 'socket.io-client';

let socketInstance = null;
let currentToken = null;

export function getSocket() {
  const rawToken = localStorage.getItem('pulse_token');
  const token = rawToken && rawToken !== 'null' && rawToken !== 'undefined' ? rawToken.trim() : null;

  if (socketInstance && currentToken !== token) {
    socketInstance.disconnect();
    socketInstance = null;
  }

  if (!socketInstance) {
    currentToken = token;
    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    socketInstance = io(socketUrl, {
      auth: { token }
    });
  }

  return socketInstance;
}

export function disconnectSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    currentToken = null;
  }
}
