import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatNaira } from '../../utils/formatters';
import confetti from 'canvas-confetti';
import { Zap, CreditCard, CheckCircle2 } from 'lucide-react';

export default function FundWalletModal({ isOpen, onClose }) {
  const { fundWallet } = useWallet();
  const { showToast } = useNotifications();
  const [method, setMethod] = useState('demo');
  const [amount, setAmount] = useState(50000);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const presets = [5000, 10000, 25000, 50000, 100000];

  const handleFund = async (e) => {
    e.preventDefault();
    const finalAmount = customAmount ? Number(customAmount) : amount;
    if (!finalAmount || finalAmount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    try {
      setLoading(true);
      await fundWallet(finalAmount, method);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
      showToast(`Wallet credited with ${formatNaira(finalAmount)}!`, "success");
      onClose();
    } catch (err) {
      showToast(err.message || "Failed to fund wallet", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fund Your Pulse Wallet">
      <form onSubmit={handleFund} className="space-y-4">
        {/* Method Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4F8FF] rounded-xl border border-[#DCE7F9]">
          <button
            type="button"
            onClick={() => setMethod('demo')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
              method === 'demo'
                ? 'bg-white text-[#1D4ED8] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Zap size={14} />
            <span>Instant Demo Top-Up</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('paystack')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
              method === 'paystack'
                ? 'bg-white text-[#1D4ED8] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <CreditCard size={14} />
            <span>Paystack Checkout</span>
          </button>
        </div>

        {/* Quick Amount Chips */}
        <div>
          <label className="block text-xs font-semibold text-[#475569] mb-1.5">Quick Select Amount</label>
          <div className="grid grid-cols-5 gap-1.5">
            {presets.map(val => (
              <button
                key={val}
                type="button"
                onClick={() => { setAmount(val); setCustomAmount(''); }}
                className={`py-2 px-1 text-xs font-mono font-bold rounded-xl border transition tabular-nums text-center ${
                  amount === val && !customAmount
                    ? 'border-[#1D4ED8] bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'border-[#DCE7F9] bg-[#F8FAFC] text-[#475569] hover:border-slate-300'
                }`}
              >
                +₦{(val / 1000)}k
              </button>
            ))}
          </div>
        </div>

        {/* Custom Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-[#475569] mb-1">Custom Amount (₦)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] font-mono font-bold">₦</span>
            <input
              type="number"
              placeholder="e.g. 75000"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full h-11 pl-8 pr-4 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm font-mono text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition tabular-nums"
            />
          </div>
        </div>

        {method === 'paystack' && (
          <div className="p-3 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex items-start gap-2.5 text-xs text-[#1D4ED8]">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>Paystack test card mode is active. Instant credit simulation upon clicking proceed.</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 mt-2"
        >
          {loading ? "Processing Deposit..." : `Confirm Deposit (${formatNaira(customAmount ? Number(customAmount) : amount)})`}
        </button>
      </form>
    </Modal>
  );
}
