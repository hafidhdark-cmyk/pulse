import React, { useState } from 'react';
import Modal from '../common/Modal';
import { api } from '../../api/client';
import { useNotifications } from '../../context/NotificationContext';
import { KeyRound, ArrowRight } from 'lucide-react';

export default function JoinPlanModal({ isOpen, onClose, onJoined }) {
  const { showToast } = useNotifications();
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e) => {
    e.preventDefault();
    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      showToast('Please enter an invite code', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await api.savings.joinPlan({ inviteCode: code });
      showToast(`Joined "${res.plan.title}".`, 'success');
      onJoined(res.plan.id);
      onClose();
      setInviteCode('');
    } catch (err) {
      showToast(err.message || 'Failed to join plan', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join Group Plan">
      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Group Invite Code
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <KeyRound size={16} />
            </span>
            <input
              type="text"
              placeholder="PLS-XXXXX"
              maxLength={12}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full h-11 pl-9 pr-4 bg-white border border-slate-300 rounded-lg text-slate-900 text-center font-mono font-bold tracking-widest text-sm focus:outline-none focus:border-[#1D4ED8] transition uppercase"
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Enter the invite code shared by the group creator.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !inviteCode.trim()}
          className="w-full h-11 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 mt-2"
        >
          <span>{loading ? 'Joining...' : 'Join Group'}</span>
          <ArrowRight size={15} />
        </button>
      </form>
    </Modal>
  );
}
