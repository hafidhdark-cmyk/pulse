import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';
import { useAuth } from './AuthContext';
import { getSocket } from '../api/socket';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({
    balance: 0,
    totalSaved: 0,
    currency: 'NGN',
    transactions: []
  });
  const [loading, setLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await api.wallet.getWallet();
      setWallet(data);
    } catch (err) {
      console.error("Failed to load wallet:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWallet();

      const socket = getSocket();
      const handleWalletUpdated = (payload) => {
        if (payload && payload.balance !== undefined) {
          setWallet(prev => ({ ...prev, balance: payload.balance }));
        }
      };

      socket.on('wallet_updated', handleWalletUpdated);
      return () => socket.off('wallet_updated', handleWalletUpdated);
    }
  }, [user, fetchWallet]);

  const fundWallet = async (amount, method = 'demo', reference = null) => {
    const res = await api.wallet.fund({ amount, method, reference });
    await fetchWallet();
    return res;
  };

  const sendP2P = async (recipientUsername, amount, note) => {
    const res = await api.transfers.p2p({ recipientUsername, amount, note });
    await fetchWallet();
    return res;
  };

  return (
    <WalletContext.Provider value={{
      ...wallet,
      loading,
      refreshWallet: fetchWallet,
      fundWallet,
      sendP2P
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) throw new Error("useWallet must be used within a WalletProvider");
  return context;
}
