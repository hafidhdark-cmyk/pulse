import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../api/client';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatNaira } from '../../utils/formatters';

export default function ContributeModal({ isOpen, onClose, plan, onContributed }) {
  const { balance, refreshWallet } = useWallet();
  const { showToast } = useNotifications();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  if (!plan) return null;

  const presets = [5000, 10000, 15000, 25000, 50000];

  const handleContribute = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (numAmount > balance) {
      showToast('Insufficient wallet balance for this contribution', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await api.savings.contribute(plan.id, { amount: numAmount });
      await refreshWallet();
      showToast(`Contributed ${formatNaira(numAmount)} to ${plan.title}.`, 'success');
      onContributed(res);
      onClose();
      setAmount('');
    } catch (err) {
      showToast(err.message || 'Contribution failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Contribute to ${plan.title}`}>
      <form onSubmit={handleContribute} className="space-y-4">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
          <span className="text-slate-500">Available Wallet Balance</span>
          <span className="font-mono font-bold text-slate-900 tabular-nums">
            {formatNaira(balance)}
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Contribution Amount (₦)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-semibold">
              ₦
            </span>
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-11 pl-8 pr-4 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition tabular-nums"
            />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mt-2">
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className="py-2 px-2 text-xs font-mono font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-700 tabular-nums text-center"
              >
                ₦{val / 1000}k
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !amount || Number(amount) > balance}
          className="w-full h-11 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 mt-2"
        >
          {loading
            ? 'Contributing...'
            : `Contribute ${amount ? formatNaira(Number(amount)) : '₦0'}`}
        </button>
      </form>
    </Modal>
  );
}
