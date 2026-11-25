import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { useAuth } from '../../context/AuthContext';
import { formatNaira, formatDate } from '../../utils/formatters';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import vaultIllustration from '../../assets/group-vault-illustration.jpg';
import collabHeroImg from '../../assets/collab-savings-hero.jpg';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Eye,
  EyeOff,
  Plus,
  Send,
  KeyRound,
  ArrowRight,
  Users,
  User,
  Receipt
} from 'lucide-react';

export default function WalletDashboardView({
  onOpenFund,
  onOpenP2P,
  onOpenCreatePlan,
  onOpenJoinPlan,
  onSelectPlan,
  plans = []
}) {
  const { user } = useAuth();
  const { balance, totalSaved, transactions } = useWallet();
  const [showBalance, setShowBalance] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');

  const filteredTransactions = (transactions || []).filter((txn) => {
    if (filterType === 'ALL') return true;
    if (filterType === 'WALLET_FUND') {
      return txn.type === 'WALLET_FUND' || txn.type === 'FUND';
    }
    return txn.type === filterType;
  });

  const filteredPlans = (plans || []).filter((p) => {
    if (planFilter === 'ALL') return true;
    return p.type === planFilter;
  });

  const groupPlansCount = (plans || []).filter((p) => p.type === 'GROUP').length;
  const personalPlansCount = (plans || []).filter((p) => p.type === 'PERSONAL').length;

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Top Row: Aligned 7-Col / 5-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* Left 7 Cols: Primary Wallet Card */}
        <div className="lg:col-span-7 bg-[#0F172A] text-white border border-slate-800 rounded-xl p-4 sm:p-6 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Available Balance
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-slate-300 bg-slate-800 border border-slate-700 px-2 py-0.5 rounded">
                  NGN ₦
                </span>
              </div>

              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition text-slate-300"
                title={showBalance ? 'Hide balance' : 'Show balance'}
              >
                {showBalance ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <div className="mb-5 sm:mb-6">
              <h2 className="text-2xl sm:text-4xl font-bold font-mono tracking-tight tabular-nums text-white break-all">
                {showBalance ? formatNaira(balance, true) : '₦ ••••••••'}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-slate-400">
                <span>
                  Account: <strong className="text-slate-200 font-semibold">@{user?.username}</strong>
                </span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline">Instant P2P &amp; Group Vault Funding Ready</span>
              </div>
            </div>
          </div>

          <div className="pt-3.5 sm:pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            <button
              onClick={onOpenFund}
              className="flex items-center justify-center gap-1.5 min-h-[44px] sm:h-10 px-3 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs rounded-lg transition active:scale-[0.98]"
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Fund Wallet</span>
            </button>

            <button
              onClick={onOpenP2P}
              className="flex items-center justify-center gap-1.5 min-h-[44px] sm:h-10 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-lg border border-slate-700 transition active:scale-[0.98]"
            >
              <Send size={14} />
              <span>Send Money</span>
            </button>

            <button
              onClick={onOpenCreatePlan}
              className="flex items-center justify-center gap-1.5 min-h-[44px] sm:h-10 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-lg border border-slate-700 transition active:scale-[0.98]"
            >
              <Plus size={14} />
              <span>New Plan</span>
            </button>

            <button
              onClick={onOpenJoinPlan}
              className="flex items-center justify-center gap-1.5 min-h-[44px] sm:h-10 px-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs rounded-lg border border-slate-700 transition active:scale-[0.98]"
            >
              <KeyRound size={14} />
              <span>Join Group</span>
            </button>
          </div>
        </div>

        {/* Right 5 Cols: Total Saved & Collaborative Vaults Summary Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-4 sm:p-6 flex flex-col justify-between h-full">
          <div className="flex items-start justify-between gap-3 sm:gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Total Saved
                </span>
                <Badge variant="primary">{plans.length} Active</Badge>
              </div>

              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono tabular-nums break-all">
                {showBalance ? formatNaira(totalSaved, true) : '₦ ••••••••'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Combined balance across personal &amp; group plans
              </p>
            </div>

            <img
              src={vaultIllustration}
              alt="Collaborative savings vault"
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shrink-0"
            />
          </div>

          <div className="mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t border-slate-100 grid grid-cols-2 gap-2.5 sm:gap-3 text-xs">
            <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
              <span className="text-slate-600 font-medium flex items-center gap-1.5 truncate">
                <Users size={14} className="text-[#1D4ED8] shrink-0" />
                <span className="truncate">Groups</span>
              </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {groupPlansCount}
              </span>
            </div>
            <div className="p-2.5 sm:p-3 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
              <span className="text-slate-600 font-medium flex items-center gap-1.5 truncate">
                <User size={14} className="text-slate-700 shrink-0" />
                <span className="truncate">Personal</span>
              </span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {personalPlansCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Aligned 7-Col / 5-Col Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* Left 7 Cols: Active Savings Plans Card */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full">
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Savings Plans</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Shared group pools &amp; personal milestones
              </p>
            </div>

            <div className="grid grid-cols-3 sm:flex gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 w-full sm:w-auto">
              {['ALL', 'GROUP', 'PERSONAL'].map((type) => (
                <button
                  key={type}
                  onClick={() => setPlanFilter(type)}
                  className={`px-2.5 py-1.5 sm:py-1 rounded-md text-xs font-semibold transition text-center ${
                    planFilter === type
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type === 'ALL' ? 'All' : type === 'GROUP' ? 'Groups' : 'Personal'}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
            {filteredPlans.length === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-5">
                  <img
                    src={collabHeroImg}
                    alt="Collaborative group savings"
                    className="w-full h-36 sm:h-40 object-cover rounded-lg border border-slate-200"
                  />
                </div>
                <div className="sm:col-span-7 space-y-2.5 text-left">
                  <Badge variant="primary">Collaborative Savings</Badge>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900">
                    Save toward shared goals with your circle
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Launch a group pool with an invite code, track member contributions on a live leaderboard, or set a personal target.
                  </p>
                  <div className="pt-1 grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
                    <button
                      onClick={onOpenCreatePlan}
                      className="min-h-[40px] px-3.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-xs font-semibold rounded-lg transition"
                    >
                      Create Plan
                    </button>
                    <button
                      onClick={onOpenJoinPlan}
                      className="min-h-[40px] px-3.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg transition"
                    >
                      Join with Code
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => onSelectPlan(plan.id)}
                    className="group p-3.5 sm:p-4 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/60 transition cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3 mb-2.5 sm:mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 group-hover:text-[#1D4ED8] transition truncate">
                            {plan.title}
                          </span>
                          <Badge variant={plan.type === 'GROUP' ? 'primary' : 'default'}>
                            {plan.type === 'GROUP' ? 'Group' : 'Personal'}
                          </Badge>
                        </div>
                        {plan.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {plan.description}
                          </p>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-mono font-bold text-slate-900 tabular-nums block">
                          {formatNaira(plan.currentAmount)}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                          of {formatNaira(plan.targetAmount)}
                        </span>
                      </div>
                    </div>

                    <ProgressBar
                      current={plan.currentAmount}
                      target={plan.targetAmount}
                      percent={plan.progressPercent ?? plan.progressPercentage}
                      height="h-2"
                    />

                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2 flex-wrap">
                        {plan.type === 'GROUP' && plan.inviteCode && (
                          <span className="font-mono text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                            {plan.inviteCode}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1">
                          {plan.type === 'GROUP' ? <Users size={12} /> : <User size={12} />}
                          {plan.memberCount || 1} {(plan.memberCount || 1) === 1 ? 'member' : 'members'}
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1D4ED8] shrink-0">
                        <span>View</span>
                        <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Cols: Transaction Ledger Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col h-full">
          <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-slate-200 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Transactions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Recent account activity</p>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 sm:py-1.5 text-slate-700 font-medium focus:outline-none focus:border-[#1D4ED8]"
            >
              <option value="ALL">All Types</option>
              <option value="WALLET_FUND">Deposits</option>
              <option value="P2P_SEND">Sent</option>
              <option value="P2P_RECEIVE">Received</option>
              <option value="SAVINGS_CONTRIBUTION">Savings</option>
              <option value="SAVINGS_WITHDRAWAL">Withdrawals</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {filteredTransactions.length === 0 ? (
              <div className="p-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center mx-auto">
                  <Receipt size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">No transactions yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto leading-relaxed">
                    Fund your wallet or send an instant transfer to record your first ledger entry.
                  </p>
                </div>
                <div className="pt-1 flex items-center justify-center gap-2">
                  <button
                    onClick={onOpenFund}
                    className="min-h-[40px] px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                  >
                    Fund Wallet
                  </button>
                  <button
                    onClick={onOpenP2P}
                    className="min-h-[40px] px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition"
                  >
                    Send Money
                  </button>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 max-h-[460px] lg:max-h-[520px] overflow-y-auto">
                {filteredTransactions.map((txn) => {
                  const isCredit =
                    txn.direction === 'CREDIT' ||
                    ['WALLET_FUND', 'FUND', 'P2P_RECEIVE', 'SAVINGS_WITHDRAWAL'].includes(txn.type);

                  return (
                    <div
                      key={txn.id}
                      className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            isCredit
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                        >
                          {isCredit ? <ArrowDownLeft size={15} /> : <ArrowUpRight size={15} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate">
                            {txn.description}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                            {formatDate(txn.createdAt)} • {txn.reference}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-xs font-bold font-mono tabular-nums ${
                            isCredit ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {isCredit ? '+' : '-'}
                          {formatNaira(txn.amount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
