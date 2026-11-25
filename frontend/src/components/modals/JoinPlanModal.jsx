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
      showToast("Please enter an invite code", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await api.savings.joinPlan({ inviteCode: code });
      showToast(`Joined "${res.plan.title}"!`, "success");
      onJoined(res.plan.id);
      onClose();
      setInviteCode('');
    } catch (err) {
      showToast(err.message || "Failed to join plan", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Join a Group Savings Vault">
      <form onSubmit={handleJoin} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[#475569] mb-1">
            6-Character Invite Code
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]">
              <KeyRound size={16} />
            </span>
            <input
              type="text"
              placeholder="e.g. PLS-89X2"
              maxLength={8}
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              className="w-full h-12 pl-9 pr-4 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-[#0F172A] text-center font-mono font-bold tracking-widest text-base focus:outline-none focus:border-[#1D4ED8] transition uppercase"
            />
          </div>
          <p className="mt-2 text-[11px] text-[#64748B]">
            Enter the 6-character code (e.g. <span className="font-mono font-bold text-[#1D4ED8]">PLS-89X2</span>) shared by the group vault creator.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !inviteCode}
          className="w-full h-12 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 mt-2"
        >
          <span>{loading ? "Joining Vault..." : "Join Group Vault"}</span>
          <ArrowRight size={16} />
        </button>
      </form>
    </Modal>
  );
}
