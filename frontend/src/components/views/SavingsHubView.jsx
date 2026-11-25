import React, { useState } from 'react';
import { formatNaira, formatDate } from '../../utils/formatters';
import ProgressBar from '../common/ProgressBar';
import Badge from '../common/Badge';
import { 
  PiggyBank, 
  Users, 
  User, 
  Plus, 
  KeyRound, 
  ArrowRight, 
  Calendar,
  Sparkles,
  Zap
} from 'lucide-react';

export default function SavingsHubView({ plans = [], onSelectPlan, onOpenCreate, onOpenJoin }) {
  const [filter, setFilter] = useState('ALL'); // ALL, GROUP, PERSONAL

  const filteredPlans = (plans || []).filter(p => {
    if (filter === 'ALL') return true;
    return p.type === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Savings Vaults</h2>
          <p className="text-xs text-[#52627A]">Multiplayer group pools and personal milestones</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenJoin}
            className="flex items-center gap-1.5 h-11 px-4 bg-white hover:bg-slate-50 text-[#1D4ED8] text-xs font-bold rounded-xl border border-[#DCE7F9] shadow-sm transition"
          >
            <KeyRound size={15} />
            <span>Join with Code</span>
          </button>

          <button
            onClick={onOpenCreate}
            className="flex items-center gap-1.5 h-11 px-5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>New Goal</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-[#DCE7F9] pb-2">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filter === 'ALL' ? 'bg-[#EFF6FF] text-[#1D4ED8] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          All Vaults ({plans.length})
        </button>
        <button
          onClick={() => setFilter('GROUP')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filter === 'GROUP' ? 'bg-[#EFF6FF] text-[#1D4ED8] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Group Pools ({plans.filter(p => p.type === 'GROUP').length})
        </button>
        <button
          onClick={() => setFilter('PERSONAL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
            filter === 'PERSONAL' ? 'bg-[#EFF6FF] text-[#1D4ED8] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
          }`}
        >
          Personal Targets ({plans.filter(p => p.type === 'PERSONAL').length})
        </button>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white border border-[#DCE7F9] rounded-2xl p-12 text-center shadow-card">
          <PiggyBank size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="text-base font-bold text-[#0F172A]">No savings plans yet</h3>
          <p className="text-xs text-[#64748B] mt-1 max-w-sm mx-auto">
            Start a group savings kitty with friends or set a private personal target.
          </p>
          <button
            onClick={onOpenCreate}
            className="mt-4 h-11 px-5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-bold rounded-xl transition"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredPlans.map(plan => (
            <div
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className="group bg-white hover:bg-[#F8FAFF] border border-[#DCE7F9] hover:border-[#1D4ED8]/50 rounded-2xl p-6 transition-all duration-200 shadow-card cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2.5 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-[#1D4ED8]">
                      {plan.type === 'GROUP' ? <Users size={18} /> : <User size={18} />}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-[#0F172A] group-hover:text-[#1D4ED8] transition">
                        {plan.title}
                      </h3>
                      <p className="text-xs text-[#64748B] line-clamp-1">{plan.description || "Savings plan"}</p>
                    </div>
                  </div>

                  <Badge variant={plan.type === 'GROUP' ? 'cyan' : 'default'}>
                    {plan.frequency}
                  </Badge>
                </div>

                {/* Progress bar */}
                <div className="my-4">
                  <ProgressBar
                    current={plan.currentAmount}
                    target={plan.targetAmount}
                    percent={plan.progressPercent}
                  />
                </div>

                {/* Stats row */}
                <div className="flex justify-between items-center text-xs pt-1">
                  <div>
                    <span className="text-[#64748B] block text-[10px] font-semibold">POOLED</span>
                    <span className="font-mono font-bold text-[#1D4ED8] tabular-nums">{formatNaira(plan.currentAmount)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#64748B] block text-[10px] font-semibold">TARGET</span>
                    <span className="font-mono font-bold text-[#0F172A] tabular-nums">{formatNaira(plan.targetAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom footer with member count & invite code */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  {plan.type === 'GROUP' && (
                    <span className="flex items-center gap-1 font-mono text-[11px] bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded-md border border-[#BFDBFE] font-bold">
                      {plan.inviteCode}
                    </span>
                  )}
                  {plan.memberCount > 1 && (
                    <span>{plan.memberCount} members</span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[#1D4ED8] group-hover:translate-x-1 transition-transform font-bold">
                  <span>Open Vault</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
