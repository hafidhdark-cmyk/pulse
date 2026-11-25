import React, { useState } from 'react';
import { useWallet } from '../../context/WalletContext';
import { formatNaira, formatDate } from '../../utils/formatters';
import PulseLogo from '../common/PulseLogo';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PiggyBank, 
  Eye, 
  EyeOff, 
  Plus, 
  Send, 
  KeyRound, 
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

export default function WalletDashboardView({ 
  onOpenFund, 
  onOpenP2P, 
  onOpenCreatePlan, 
  onOpenJoinPlan,
  onSelectPlan,
  plans = []
}) {
  const { balance, totalSaved, transactions } = useWallet();
  const [showBalance, setShowBalance] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [planFilter, setPlanFilter] = useState('ALL');

  const filteredTransactions = (transactions || []).filter(txn => {
    if (filterType !== 'ALL' && txn.type !== filterType) return false;
    return true;
  });

  const filteredPlans = (plans || []).filter(p => {
    if (planFilter === 'ALL') return true;
    return p.type === planFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Row: Brand Hero Gradient Card (8 cols) + Smart Insights / Quick Stats (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Brand Gradient Wallet Hero Card (8 cols on desktop) */}
        <div className="lg:col-span-8 relative overflow-hidden bg-brand-hero text-white rounded-2xl p-6 sm:p-8 shadow-hero flex flex-col justify-between">
          {/* Concentric Radar/Pulse Rings Motif */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full border border-white/[0.08] pointer-events-none" />
          <div className="absolute -right-10 -top-10 w-60 h-60 rounded-full border border-white/[0.08] pointer-events-none" />
          <div className="absolute -right-0 -top-0 w-40 h-40 rounded-full border border-white/[0.08] pointer-events-none" />
          
          {/* ECG Pulse Waveform Watermark */}
          <div className="absolute right-0 bottom-4 w-72 opacity-15 pointer-events-none">
            <svg viewBox="0 0 500 150" fill="none" stroke="currentColor" strokeWidth="3" className="w-full text-white">
              <path d="M0,75 L120,75 L140,20 L160,130 L180,60 L200,90 L220,75 L500,75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div>
            {/* Top Row: White Pill Logo on Gradient + Balance Toggle */}
            <div className="flex items-center justify-between gap-4 mb-6 relative z-10">
              <PulseLogo variant="pill" size="sm" showWordmark={true} />
              
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-white/15 px-3 py-1 rounded-full backdrop-blur-sm">
                  Active Wallet (NGN)
                </span>
                <button
                  onClick={() => setShowBalance(!showBalance)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition text-white"
                  title={showBalance ? "Hide balance" : "Show balance"}
                >
                  {showBalance ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Balance Numbers */}
            <div className="relative z-10 mb-6">
              <span className="text-xs text-blue-100 font-medium block mb-1">Available Spendable Balance</span>
              <h2 className="text-3xl sm:text-5xl font-extrabold font-mono tracking-tight tabular-nums text-white">
                {showBalance ? formatNaira(balance, true) : '₦ ••••••••'}
              </h2>
            </div>
          </div>

          {/* 4 Quick Actions Row */}
          <div className="relative z-10 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={onOpenFund}
              className="flex items-center justify-center gap-2 h-11 px-3 bg-white hover:bg-blue-50 text-[#1D4ED8] font-bold text-xs rounded-xl shadow-sm transition group"
            >
              <Plus size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform" />
              <span>Fund Wallet</span>
            </button>

            <button
              onClick={onOpenP2P}
              className="flex items-center justify-center gap-2 h-11 px-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-sm transition"
            >
              <Send size={15} />
              <span>Send P2P</span>
            </button>

            <button
              onClick={onOpenCreatePlan}
              className="flex items-center justify-center gap-2 h-11 px-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-sm transition"
            >
              <Plus size={15} />
              <span>New Plan</span>
            </button>

            <button
              onClick={onOpenJoinPlan}
              className="flex items-center justify-center gap-2 h-11 px-3 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 backdrop-blur-sm transition"
            >
              <KeyRound size={15} />
              <span>Join Code</span>
            </button>
          </div>
        </div>

        {/* Quick Stats / Smart Insights Card (4 cols on desktop) */}
        <div className="lg:col-span-4 bg-white border border-[#DCE7F9] rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[#52627A] uppercase tracking-wider flex items-center gap-1.5">
                <PiggyBank size={16} className="text-[#0EA5E9]" />
                <span>Savings Vaults</span>
              </span>
              <Badge variant="cyan">Multiplayer</Badge>
            </div>

            <span className="text-xs text-[#64748B] block">Total Saved Across Plans</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] font-mono tabular-nums mt-1">
              {showBalance ? formatNaira(totalSaved) : '₦ ••••••••'}
            </h3>

            {/* Smart Pace Pill */}
            <div className="mt-4 p-3.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl flex items-start gap-2.5">
              <Zap size={18} className="text-[#1D4ED8] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-[#1D4ED8]">Smart Pace Active</p>
                <p className="text-[11px] text-[#52627A] mt-0.5 leading-snug">
                  You are contributing regularly. Continue saving daily or weekly to hit targets on time.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-[#52627A]">
            <span className="flex items-center gap-1 text-[#15803D] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse" />
              Real-time Sync Active
            </span>
            <span className="font-mono font-semibold text-[#0F172A]">Nobus Cloud</span>
          </div>
        </div>
      </div>

      {/* Main Body: 7-Col Active Savings Plans Grid + 5-Col Transaction Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* 7-Col Active Savings Plans Grid */}
        <div className="lg:col-span-7 bg-white border border-[#DCE7F9] rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Active Savings Goals</h3>
              <p className="text-xs text-[#52627A]">Personal targets & multiplayer group vaults</p>
            </div>

            {/* Filter pills */}
            <div className="flex gap-1.5 p-1 bg-[#F4F8FF] rounded-xl border border-[#DCE7F9]">
              {['ALL', 'GROUP', 'PERSONAL'].map(type => (
                <button
                  key={type}
                  onClick={() => setPlanFilter(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    planFilter === type
                      ? 'bg-white text-[#1D4ED8] shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  {type === 'ALL' ? 'All' : type === 'GROUP' ? 'Groups' : 'Personal'}
                </button>
              ))}
            </div>
          </div>

          {filteredPlans.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748B]">
              No plans match this filter. Create one to begin saving!
            </div>
          ) : (
            <div className="space-y-3.5">
              {filteredPlans.map(plan => (
                <div
                  key={plan.id}
                  onClick={() => onSelectPlan(plan.id)}
                  className="group p-4 rounded-xl border border-[#DCE7F9] hover:border-[#1D4ED8]/50 hover:bg-[#F8FAFF] transition cursor-pointer flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0F172A] group-hover:text-[#1D4ED8] transition">
                          {plan.title}
                        </span>
                        <Badge variant={plan.type === 'GROUP' ? 'cyan' : 'default'}>
                          {plan.type === 'GROUP' ? 'GROUP POOL' : 'PERSONAL'}
                        </Badge>
                      </div>
                      <p className="text-xs text-[#64748B] mt-0.5 line-clamp-1">{plan.description}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-[#1D4ED8] tabular-nums">
                        {formatNaira(plan.currentAmount)}
                      </span>
                      <span className="text-[10px] text-[#64748B] block">
                        of {formatNaira(plan.targetAmount)}
                      </span>
                    </div>
                  </div>

                  <ProgressBar
                    current={plan.currentAmount}
                    target={plan.targetAmount}
                    percent={plan.progressPercent}
                    height="h-2"
                  />

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B]">
                    <div className="flex items-center gap-2 font-mono">
                      {plan.inviteCode && (
                        <span className="bg-[#EFF6FF] text-[#1D4ED8] px-2 py-0.5 rounded font-bold border border-[#BFDBFE]">
                          {plan.inviteCode}
                        </span>
                      )}
                      <span>{plan.frequency}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#1D4ED8] font-bold group-hover:translate-x-0.5 transition-transform">
                      <span>Open Vault</span>
                      <ArrowRight size={13} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 5-Col Wallet Transaction Ledger Feed */}
        <div className="lg:col-span-5 bg-white border border-[#DCE7F9] rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-[#0F172A]">Transaction Ledger</h3>
              <p className="text-xs text-[#52627A]">Wallet credits and debits</p>
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="text-xs bg-[#F4F8FF] border border-[#DCE7F9] rounded-lg px-2.5 py-1 text-[#52627A] font-semibold focus:outline-none"
            >
              <option value="ALL">All Activity</option>
              <option value="FUND">Fundings</option>
              <option value="P2P_SEND">Sent</option>
              <option value="P2P_RECEIVE">Received</option>
              <option value="SAVINGS_CONTRIBUTION">Savings</option>
            </select>
          </div>

          {filteredTransactions.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748B]">
              No transactions recorded yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[480px] overflow-y-auto pr-1">
              {filteredTransactions.map(txn => {
                const isCredit = txn.direction === 'CREDIT';
                return (
                  <div key={txn.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit ? 'bg-[#DCFCE7] text-[#15803D]' : 'bg-[#FEE2E2] text-[#B91C1C]'
                      }`}>
                        {isCredit ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#0F172A] truncate">
                          {txn.description}
                        </p>
                        <p className="text-[10px] text-[#64748B] font-mono mt-0.5">
                          {formatDate(txn.createdAt)} • {txn.reference}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`text-xs font-bold font-mono tabular-nums ${
                        isCredit ? 'text-[#15803D]' : 'text-[#0F172A]'
                      }`}>
                        {isCredit ? '+' : '-'}{formatNaira(txn.amount)}
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
  );
}
