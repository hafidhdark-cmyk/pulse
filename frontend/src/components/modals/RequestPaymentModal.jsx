import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';
import { Receipt } from 'lucide-react';

export default function RequestPaymentModal({ isOpen, onClose, planId, onCreated }) {
  const { showToast } = useNotifications();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (!description.trim()) {
      showToast('Please provide a description', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await api.transfers.createRequest({
        amount: numAmount,
        description,
        planId
      });
      showToast('Bill split request posted to group.', 'success');
      onCreated(res.paymentRequest);
      onClose();
      setAmount('');
      setDescription('');
    } catch (err) {
      showToast(err.message || 'Failed to create payment request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Request Bill Split">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
          <input
            type="text"
            required
            placeholder="What is this payment request for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-base sm:text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Amount (₦)</label>
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

        <p className="text-xs text-slate-500 leading-relaxed">
          Posts a payment request card to the group activity feed so members can settle directly from their wallet.
        </p>

        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full h-11 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 mt-2"
        >
          <Receipt size={15} />
          <span>{loading ? 'Posting...' : 'Post Split Request'}</span>
        </button>
      </form>
    </Modal>
  );
}
