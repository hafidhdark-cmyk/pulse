import React, { useState } from 'react';
import Modal from '../common/Modal';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatNaira } from '../../utils/formatters';
import { CreditCard, Building2 } from 'lucide-react';

export default function FundWalletModal({ isOpen, onClose }) {
  const { fundWallet } = useWallet();
  const { showToast } = useNotifications();
  const [method, setMethod] = useState('demo');
  const [amount, setAmount] = useState(25000);
  const [customAmount, setCustomAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const presets = [5000, 10000, 25000, 50000, 100000];

  const handleFund = async (e) => {
    e.preventDefault();
    const parsedCustom = customAmount.trim() !== '' ? Number(customAmount) : null;
    const finalAmount = parsedCustom !== null ? parsedCustom : amount;
    if (!Number.isFinite(finalAmount) || finalAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }

    try {
      setLoading(true);
      await fundWallet(finalAmount, method);
      showToast(`Wallet funded with ${formatNaira(finalAmount)}.`, 'success');
      onClose();
      setCustomAmount('');
    } catch (err) {
      showToast(err.message || 'Failed to fund wallet', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fund Wallet">
      <form onSubmit={handleFund} className="space-y-4">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setMethod('demo')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition ${
              method === 'demo'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 size={14} />
            <span>Direct Deposit</span>
          </button>
          <button
            type="button"
            onClick={() => setMethod('paystack')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition ${
              method === 'paystack'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard size={14} />
            <span>Paystack Card</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Select Amount
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {presets.map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => {
                  setAmount(val);
                  setCustomAmount('');
                }}
                className={`py-2 px-2 text-xs font-mono font-semibold rounded-lg border transition tabular-nums text-center ${
                  amount === val && !customAmount
                    ? 'border-[#1D4ED8] bg-blue-50 text-[#1D4ED8]'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                ₦{val / 1000}k
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Or Enter Custom Amount (₦)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-semibold">
              ₦
            </span>
            <input
              type="number"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full h-11 pl-8 pr-4 bg-white border border-slate-300 rounded-lg text-base sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition tabular-nums"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 mt-2"
        >
          {loading
            ? 'Processing...'
            : `Deposit ${formatNaira(customAmount ? Number(customAmount) : amount)}`}
        </button>
      </form>
    </Modal>
  );
}
