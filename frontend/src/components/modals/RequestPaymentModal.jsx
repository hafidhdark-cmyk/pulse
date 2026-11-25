import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';
import { formatNaira } from '../../utils/formatters';
import { Receipt, Send } from 'lucide-react';

export default function RequestPaymentModal({ isOpen, onClose, planId, onCreated }) {
  const { showToast } = useNotifications();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    if (!description.trim()) {
      showToast("Please provide a description", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await api.transfers.createRequest({
        amount: numAmount,
        description,
        planId
      });
      showToast("Bill split request posted to group chat!", "success");
      onCreated(res.paymentRequest);
      onClose();
      setAmount('');
      setDescription('');
    } catch (err) {
      showToast(err.message || "Failed to create payment request", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="1-Click Bill Split Request">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#475569] mb-1">What is this split for?</label>
          <input
            type="text"
            required
            placeholder="e.g. Uber ride for group, Airbnb deposit, Dinner"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#475569] mb-1">Amount to Split (₦)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] font-mono font-bold">₦</span>
            <input
              type="number"
              required
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-11 pl-8 pr-4 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm font-mono text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition tabular-nums"
            />
          </div>
        </div>

        <p className="text-[11px] text-[#64748B] leading-relaxed">
          This drops an interactive 1-click payment card directly inside the group chat stream. Other members can pay their share with one tap.
        </p>

        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full h-12 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 mt-2"
        >
          <Receipt size={16} />
          <span>{loading ? "Posting..." : "Post Split to Group Chat"}</span>
        </button>
      </form>
    </Modal>
  );
}
