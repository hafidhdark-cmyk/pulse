import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../api/client';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatNaira } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import { Sparkles, PiggyBank } from 'lucide-react';

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
      showToast("Please enter a valid amount", "error");
      return;
    }
    if (numAmount > balance) {
      showToast("Insufficient wallet balance for this contribution", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await api.savings.contribute(plan.id, { amount: numAmount });
      await refreshWallet();

      confetti({
        particleCount: 75,
        spread: 70,
        origin: { y: 0.6 }
      });

      showToast(`Contributed ${formatNaira(numAmount)} to ${plan.title}!`, "success");
      onContributed(res);
      onClose();
      setAmount('');
    } catch (err) {
      showToast(err.message || "Contribution failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Contribute to "${plan.title}"`}>
      <form onSubmit={handleContribute} className="space-y-4">
        {/* Wallet Balance Card */}
        <div className="p-3.5 bg-[#F4F8FF] border border-[#DCE7F9] rounded-xl flex items-center justify-between text-xs">
          <span className="text-[#64748B]">Spendable Balance:</span>
          <span className="font-mono font-bold text-[#1D4ED8] tabular-nums">{formatNaira(balance)}</span>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-[#475569] mb-1">Contribution Amount (₦)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] font-mono font-bold">₦</span>
            <input
              type="number"
              placeholder="e.g. 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-11 pl-8 pr-4 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm font-mono text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition tabular-nums"
            />
          </div>

          <div className="grid grid-cols-5 gap-1.5 mt-2">
            {presets.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => setAmount(val)}
                className="py-1.5 px-1 text-xs font-mono font-bold rounded-xl border border-[#DCE7F9] bg-[#F8FAFC] hover:border-[#1D4ED8]/50 text-[#475569] tabular-nums text-center"
              >
                ₦{(val / 1000)}k
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !amount || Number(amount) > balance}
          className="w-full h-12 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 mt-2"
        >
          <Sparkles size={16} />
          <span>{loading ? "Depositing..." : `Contribute ${amount ? formatNaira(Number(amount)) : '₦0'}`}</span>
        </button>
      </form>
    </Modal>
  );
}
