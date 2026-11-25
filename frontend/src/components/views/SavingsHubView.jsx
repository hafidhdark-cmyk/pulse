import React, { useState } from 'react';
import { formatNaira } from '../../utils/formatters';
import ProgressBar from '../common/ProgressBar';
import Badge from '../common/Badge';
import collabHeroImg from '../../assets/collab-savings-hero.jpg';
import vaultIllustration from '../../assets/group-vault-illustration.jpg';
import {
  Users,
  User,
  Plus,
  KeyRound,
  ArrowRight
} from 'lucide-react';

export default function SavingsHubView({ plans = [], onSelectPlan, onOpenCreate, onOpenJoin }) {
  const [filter, setFilter] = useState('ALL');

  const filteredPlans = (plans || []).filter((p) => {
    if (filter === 'ALL') return true;
    return p.type === filter;
  });

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Collaborative Savings Banner Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-center">
        <div className="lg:col-span-4 order-first lg:order-last">
          <img
            src={collabHeroImg}
            alt="Collaborative savings team"
            className="w-full h-32 sm:h-44 object-cover rounded-lg border border-slate-200"
          />
        </div>

        <div className="lg:col-span-8 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="primary">Collaborative &amp; Personal Vaults</Badge>
          </div>
          <h2 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
            Pool funds together or save toward personal milestones
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Create a shared group plan with an invite code, track member shares on a live leaderboard, and require group approval for withdrawals.
          </p>
          <div className="pt-2 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenCreate}
              className="flex items-center justify-center gap-1.5 min-h-[44px] sm:h-10 px-4 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>New Plan</span>
            </button>

            <button
              onClick={onOpenJoin}
              className="flex items-center justify-center gap-1.5 min-h-[44px] sm:h-10 px-4 bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 transition"
            >
              <KeyRound size={14} />
              <span>Join with Code</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="grid grid-cols-3 sm:flex gap-1.5 border-b border-slate-200 pb-3">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition text-center whitespace-nowrap ${
            filter === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          All ({plans.length})
        </button>
        <button
          onClick={() => setFilter('GROUP')}
          className={`px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition text-center whitespace-nowrap ${
            filter === 'GROUP'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Groups ({plans.filter((p) => p.type === 'GROUP').length})
        </button>
        <button
          onClick={() => setFilter('PERSONAL')}
          className={`px-3 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold transition text-center whitespace-nowrap ${
            filter === 'PERSONAL'
              ? 'bg-slate-900 text-white'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          Personal ({plans.filter((p) => p.type === 'PERSONAL').length})
        </button>
      </div>

      {/* Plans Grid */}
      {filteredPlans.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 text-center">
          <img
            src={vaultIllustration}
            alt="Shared savings vault"
            className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-xl object-cover border border-slate-200 mb-4"
          />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">No savings plans in this view</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Create a group savings pool to save with friends or start a personal target.
          </p>
          <div className="mt-4 grid grid-cols-2 sm:flex items-center justify-center gap-2 max-w-xs sm:max-w-none mx-auto">
            <button
              onClick={onOpenCreate}
              className="min-h-[42px] px-4 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition"
            >
              Create Plan
            </button>
            <button
              onClick={onOpenJoin}
              className="min-h-[42px] px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition"
            >
              Invite Code
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-stretch">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              onClick={() => onSelectPlan(plan.id)}
              className="group bg-white hover:bg-slate-50/50 border border-slate-200 hover:border-slate-300 rounded-xl overflow-hidden transition cursor-pointer flex flex-col justify-between h-full"
            >
              <div className="p-4 sm:p-5 pb-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0">
                      {plan.type === 'GROUP' ? <Users size={17} /> : <User size={17} />}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#1D4ED8] transition truncate">
                        {plan.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {plan.description || (plan.type === 'GROUP' ? 'Group savings plan' : 'Personal savings plan')}
                      </p>
                    </div>
                  </div>

                  <Badge variant={plan.type === 'GROUP' ? 'primary' : 'default'}>
                    {plan.type === 'GROUP' ? 'Group' : 'Personal'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-lg mb-3.5">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Current Balance
                    </span>
                    <span className="text-sm font-mono font-bold text-slate-900 tabular-nums mt-0.5 block">
                      {formatNaira(plan.currentAmount)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                      Target Amount
                    </span>
                    <span className="text-sm font-mono font-semibold text-slate-700 tabular-nums mt-0.5 block">
                      {formatNaira(plan.targetAmount)}
                    </span>
                  </div>
                </div>

                <ProgressBar
                  current={plan.currentAmount}
                  target={plan.targetAmount}
                  percent={plan.progressPercent ?? plan.progressPercentage}
                />
              </div>

              <div className="px-4 sm:px-5 py-3 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  {plan.type === 'GROUP' && plan.inviteCode && (
                    <span className="font-mono text-[11px] bg-white text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                      {plan.inviteCode}
                    </span>
                  )}
                  <span>
                    {plan.memberCount || 1} {(plan.memberCount || 1) === 1 ? 'member' : 'members'}
                  </span>
                </div>

                <span className="inline-flex items-center gap-1 text-[#1D4ED8] font-semibold">
                  <span>Manage</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
