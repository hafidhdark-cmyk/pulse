import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';
import { Users, User, Calendar, Target } from 'lucide-react';

export default function CreatePlanModal({ isOpen, onClose, onPlanCreated }) {
  const { showToast } = useNotifications();
  const [type, setType] = useState('GROUP');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [frequency, setFrequency] = useState('WEEKLY');
  const [deadline, setDeadline] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Please provide a plan title", "error");
      return;
    }
    const target = Number(targetAmount);
    if (!target || target <= 0) {
      showToast("Target amount must be greater than zero", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await api.savings.createPlan({
        title,
        description,
        type,
        targetAmount: target,
        frequency,
        deadline: deadline || undefined
      });
      showToast(`Savings plan "${title}" created!`, "success");
      onPlanCreated(res.plan);
      onClose();
      setTitle('');
      setDescription('');
      setTargetAmount('');
    } catch (err) {
      showToast(err.message || "Failed to create plan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Savings Goal">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#F4F8FF] rounded-xl border border-[#DCE7F9]">
          <button
            type="button"
            onClick={() => setType('GROUP')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
              type === 'GROUP'
                ? 'bg-white text-[#1D4ED8] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <Users size={14} />
            <span>Group Pool</span>
          </button>
          <button
            type="button"
            onClick={() => setType('PERSONAL')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition ${
              type === 'PERSONAL'
                ? 'bg-white text-[#1D4ED8] shadow-sm'
                : 'text-[#64748B] hover:text-[#0F172A]'
            }`}
          >
            <User size={14} />
            <span>Personal Target</span>
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#475569] mb-1">Plan Title</label>
          <input
            type="text"
            required
            placeholder={type === 'GROUP' ? "e.g. December Detty Group Plan" : "e.g. Emergency Rainy Day Fund"}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#475569] mb-1">Description (Optional)</label>
          <input
            type="text"
            placeholder="What is this fund for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition"
          />
        </div>

        {/* Target Amount */}
        <div>
          <label className="block text-xs font-semibold text-[#475569] mb-1">Target Amount (₦)</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] font-mono font-bold">₦</span>
            <input
              type="number"
              required
              placeholder="100000"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full h-11 pl-8 pr-4 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm font-mono text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition tabular-nums"
            />
          </div>
        </div>

        {/* Frequency & Deadline Row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full h-11 px-3 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition"
            >
              <option value="WEEKLY">Weekly</option>
              <option value="DAILY">Daily</option>
              <option value="MONTHLY">Monthly</option>
              <option value="FLEXIBLE">Flexible</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">Target Deadline</label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full h-11 px-3 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 mt-2"
        >
          {loading ? "Creating..." : type === 'GROUP' ? "Create Group Vault & Generate Code" : "Start Personal Target"}
        </button>
      </form>
    </Modal>
  );
}
