import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../api/client';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatNaira } from '../../utils/formatters';
import { ShieldAlert, ArrowDownToLine } from 'lucide-react';

export default function WithdrawModal({ isOpen, onClose, plan, onWithdrawn }) {
  const { refreshWallet } = useWallet();
  const { showToast } = useNotifications();
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!plan) return null;

  const isGroup = plan.type === 'GROUP';
  const maxAvailable = Number(plan.currentAmount || 0);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      showToast('Please enter a valid withdrawal amount', 'error');
      return;
    }
    if (numAmount > maxAvailable) {
      showToast('Withdrawal amount exceeds available savings balance', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await api.savings.withdraw(plan.id, {
        amount: numAmount,
        reason: reason.trim()
      });
      await refreshWallet();

      if (res.mode === 'INSTANT') {
        showToast(
          `Withdrew ${formatNaira(numAmount)} from "${plan.title}" to your wallet.`,
          'success'
        );
      } else {
        showToast(
          `Withdrawal request for ${formatNaira(numAmount)} submitted for group approval.`,
          'info'
        );
      }

      if (onWithdrawn) onWithdrawn(res);
      onClose();
      setAmount('');
      setReason('');
    } catch (err) {
      showToast(err.message || 'Withdrawal failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isGroup ? `Request Group Withdrawal` : `Withdraw to Wallet`}
    >
      <form onSubmit={handleWithdraw} className="space-y-4">
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs">
          <span className="text-slate-500">Available in {plan.title}</span>
          <span className="font-mono font-bold text-slate-900 tabular-nums">
            {formatNaira(maxAvailable)}
          </span>
        </div>

        {isGroup && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
            <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="font-semibold block">Group Approval Required</strong>
              Withdrawals from a group pool require majority member approval before funds are disbursed to your wallet.
            </div>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-700">
              Withdrawal Amount (₦)
            </label>
            {maxAvailable > 0 && (
              <button
                type="button"
                onClick={() => setAmount(String(maxAvailable))}
                className="text-[11px] font-semibold text-[#1D4ED8] hover:underline"
              >
                Withdraw Max ({formatNaira(maxAvailable)})
              </button>
            )}
          </div>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-semibold">
              ₦
            </span>
            <input
              type="number"
              required
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-11 pl-8 pr-4 bg-white border border-slate-300 rounded-lg text-base sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition tabular-nums"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {isGroup ? 'Reason for Withdrawal (Shown to Group Members)' : 'Note (Optional)'}
          </label>
          <input
            type="text"
            required={isGroup}
            placeholder={
              isGroup ? 'Explain why these funds are being withdrawn' : 'Optional note'
            }
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-base sm:text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !amount || Number(amount) <= 0 || Number(amount) > maxAvailable}
          className="w-full h-11 flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 mt-2"
        >
          <ArrowDownToLine size={15} />
          <span>
            {loading
              ? 'Processing...'
              : isGroup
              ? `Submit Withdrawal Request (${amount ? formatNaira(Number(amount)) : '₦0'})`
              : `Withdraw ${amount ? formatNaira(Number(amount)) : '₦0'} to Wallet`}
          </span>
        </button>
      </form>
    </Modal>
  );
}
