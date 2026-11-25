import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';
import { Users, User } from 'lucide-react';

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
      showToast('Please provide a plan title', 'error');
      return;
    }
    const target = Number(targetAmount);
    if (!target || target <= 0) {
      showToast('Target amount must be greater than zero', 'error');
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
      showToast(`Savings plan "${title}" created.`, 'success');
      onPlanCreated(res.plan);
      onClose();
      setTitle('');
      setDescription('');
      setTargetAmount('');
    } catch (err) {
      showToast(err.message || 'Failed to create plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Savings Plan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setType('GROUP')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition ${
              type === 'GROUP'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users size={14} />
            <span>Group Pool</span>
          </button>
          <button
            type="button"
            onClick={() => setType('PERSONAL')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-xs font-semibold transition ${
              type === 'PERSONAL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User size={14} />
            <span>Personal Target</span>
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Plan Title</label>
          <input
            type="text"
            required
            placeholder={type === 'GROUP' ? 'Enter group plan name' : 'Enter personal goal name'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Description (Optional)
          </label>
          <input
            type="text"
            placeholder="Purpose of this savings plan"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Target Amount (₦)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-semibold">
              ₦
            </span>
            <input
              type="number"
              required
              placeholder="Enter target amount"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              className="w-full h-11 pl-8 pr-4 bg-white border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition tabular-nums"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
            >
              <option value="WEEKLY">Weekly</option>
              <option value="DAILY">Daily</option>
              <option value="MONTHLY">Monthly</option>
              <option value="FLEXIBLE">Flexible</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Target Date (Optional)
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 mt-2"
        >
          {loading
            ? 'Creating...'
            : type === 'GROUP'
            ? 'Create Group Plan'
            : 'Create Personal Plan'}
        </button>
      </form>
    </Modal>
  );
}
