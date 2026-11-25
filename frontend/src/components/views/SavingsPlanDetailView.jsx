import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../../api/client';
import { getSocket } from '../../api/socket';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatNaira, formatDate, getInitials } from '../../utils/formatters';
import ProgressBar from '../common/ProgressBar';
import Badge from '../common/Badge';
import WithdrawModal from '../modals/WithdrawModal';
import {
  ArrowLeft,
  Copy,
  Check,
  Send,
  Trophy,
  Receipt,
  Plus,
  Calendar,
  ArrowDownToLine,
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export default function SavingsPlanDetailView({
  planId,
  onBack,
  onOpenContribute,
  onOpenSplit
}) {
  const { user } = useAuth();
  const { refreshWallet } = useWallet();
  const { showToast } = useNotifications();
  const [details, setDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [votingId, setVotingId] = useState(null);
  const [mobileTab, setMobileTab] = useState('vault');
  const chatBottomRef = useRef(null);

  const fetchPlanDetails = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const [planRes, msgRes] = await Promise.all([
        api.savings.getPlan(planId),
        api.chat.getMessages(planId)
      ]);
      setDetails(planRes);
      setMessages(msgRes.messages || []);
    } catch (err) {
      if (!silent) {
        showToast(err.message || 'Failed to load savings plan', 'error');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, [planId, showToast]);

  useEffect(() => {
    if (!planId) return;
    fetchPlanDetails();

    const socket = getSocket();
    socket.emit('join:plan', planId);

    const handleNewMessage = (msg) => {
      if (!msg || msg.planId !== planId) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      fetchPlanDetails(true);
    };

    const handleSavingsUpdated = () => {
      fetchPlanDetails(true);
    };

    socket.on('chat:message', handleNewMessage);
    socket.on('savings:updated', handleSavingsUpdated);
    socket.on('savings:member_joined', handleSavingsUpdated);
    socket.on('transfer:request_created', handleSavingsUpdated);
    socket.on('transfer:request_paid', handleSavingsUpdated);

    return () => {
      socket.emit('leave:plan', planId);
      socket.off('chat:message', handleNewMessage);
      socket.off('savings:updated', handleSavingsUpdated);
      socket.off('savings:member_joined', handleSavingsUpdated);
      socket.off('transfer:request_created', handleSavingsUpdated);
      socket.off('transfer:request_paid', handleSavingsUpdated);
    };
  }, [planId, fetchPlanDetails]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mobileTab]);

  const handleCopyCode = () => {
    if (!details?.plan?.inviteCode) return;
    navigator.clipboard.writeText(details.plan.inviteCode);
    setCopiedCode(true);
    showToast('Invite code copied.', 'info');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSendingMsg(true);
      const res = await api.chat.sendMessage(planId, { content: newMessage.trim() });
      setMessages((prev) => {
        if (prev.some((m) => m.id === res.message.id)) return prev;
        return [...prev, res.message];
      });
      setNewMessage('');
    } catch (err) {
      showToast(err.message || 'Failed to send message', 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  const handlePaySplit = async (requestId) => {
    if (!requestId) return;
    try {
      await api.transfers.payRequest(requestId);
      await refreshWallet();
      showToast('Payment request settled.', 'success');
      fetchPlanDetails(true);
    } catch (err) {
      showToast(err.message || 'Failed to settle request', 'error');
    }
  };

  const handleVoteWithdrawal = async (withdrawalId, action = 'APPROVE') => {
    if (!withdrawalId) return;
    try {
      setVotingId(withdrawalId);
      const res = await api.savings.approveWithdrawal(planId, withdrawalId, action);
      await refreshWallet();
      if (action === 'REJECT') {
        showToast('Withdrawal request declined.', 'info');
      } else if (res.disbursed) {
        showToast('Withdrawal approved and disbursed to requester wallet.', 'success');
      } else {
        showToast('Your approval has been recorded.', 'success');
      }
      fetchPlanDetails(true);
    } catch (err) {
      showToast(err.message || 'Could not record vote', 'error');
    } finally {
      setVotingId(null);
    }
  };

  if (loading || !details) {
    return (
      <div className="py-20 text-center text-slate-500">
        <div className="w-7 h-7 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto mb-2.5" />
        <p className="text-xs font-medium">Loading plan details...</p>
      </div>
    );
  }

  const {
    plan,
    members = [],
    leaderboard = [],
    insights = {},
    withdrawalRequests = []
  } = details;
  const isGroup = plan.type === 'GROUP';
  const remainingAmount = Math.max(0, Number(plan.targetAmount) - Number(plan.currentAmount));

  return (
    <div className="space-y-5">
      {/* Top Navigation & Mobile View Switcher (Group mode only) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 transition font-semibold self-start py-1"
        >
          <ArrowLeft size={15} />
          <span>Back to savings plans</span>
        </button>

        {isGroup && (
          <div className="lg:hidden grid grid-cols-2 p-1 bg-slate-100 border border-slate-200 rounded-lg w-full sm:w-auto">
            <button
              onClick={() => setMobileTab('vault')}
              className={`px-3 py-2 rounded-md text-xs font-semibold transition ${
                mobileTab === 'vault' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Overview &amp; Votes
            </button>
            <button
              onClick={() => setMobileTab('chat')}
              className={`px-3 py-2 rounded-md text-xs font-semibold transition ${
                mobileTab === 'chat' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Group Chat ({messages.length})
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Aligned 7 / 5 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-stretch">
        {/* Left Column (7 cols): Plan Overview + (Group Approvals & Leaderboard if Group) */}
        <div
          className={`lg:col-span-7 space-y-4 sm:space-y-5 flex flex-col ${
            isGroup && mobileTab !== 'vault' ? 'hidden lg:flex' : ''
          }`}
        >
          {/* Plan Overview Card */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden flex-1 flex flex-col justify-between">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5 sm:mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant={isGroup ? 'primary' : 'default'}>
                    {isGroup ? 'Group Pool' : 'Personal Target'}
                  </Badge>
                  <Badge variant="default">{plan.frequency || 'FLEXIBLE'}</Badge>
                </div>

                {/* Invite Code is ONLY shown for GROUP plans */}
                {isGroup && plan.inviteCode && (
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 px-2.5 py-1.5 sm:py-1 rounded-md text-xs font-mono font-semibold text-slate-800 transition"
                    title="Copy group invite code"
                  >
                    <span>Invite: {plan.inviteCode}</span>
                    {copiedCode ? (
                      <Check size={13} className="text-emerald-600" />
                    ) : (
                      <Copy size={13} className="text-slate-500" />
                    )}
                  </button>
                )}
              </div>

              <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
                {plan.title}
              </h1>
              {plan.description && (
                <p className="text-xs sm:text-sm text-slate-500 mt-1">{plan.description}</p>
              )}
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Compact 2+1 Metrics Grid on Mobile, 3-Col on Desktop */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="col-span-2 sm:col-span-1 p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Total Saved
                  </span>
                  <span className="text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                    {formatNaira(plan.currentAmount)}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Target Goal
                  </span>
                  <span className="text-base sm:text-xl font-bold font-mono tabular-nums text-slate-900 mt-1 block">
                    {formatNaira(plan.targetAmount)}
                  </span>
                </div>

                <div className="p-3 sm:p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg">
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-500 block">
                    Remaining
                  </span>
                  <span className="text-base sm:text-xl font-bold font-mono tabular-nums text-slate-700 mt-1 block">
                    {formatNaira(remainingAmount)}
                  </span>
                </div>
              </div>

              <ProgressBar
                current={plan.currentAmount}
                target={plan.targetAmount}
                percent={insights.completionPercentage ?? plan.progressPercent}
                height="h-2.5"
              />

              {/* Primary Action Bar: Contribute + Withdraw (+ Split Bill for Groups) */}
              <div className="grid grid-cols-2 lg:flex items-center gap-2 sm:gap-2.5">
                <button
                  onClick={() => onOpenContribute(plan)}
                  className="col-span-2 sm:col-span-1 flex-1 flex items-center justify-center gap-1.5 min-h-[44px] h-11 px-4 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs sm:text-sm rounded-lg transition active:scale-[0.98]"
                >
                  <Plus size={16} strokeWidth={2.5} />
                  <span>Contribute Funds</span>
                </button>

                <button
                  onClick={() => setWithdrawModalOpen(true)}
                  disabled={Number(plan.currentAmount) <= 0}
                  className={`${
                    isGroup ? 'col-span-1' : 'col-span-2 sm:col-span-1'
                  } flex-1 flex items-center justify-center gap-1.5 min-h-[44px] h-11 px-3 sm:px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-lg transition disabled:opacity-40 active:scale-[0.98]`}
                  title={
                    Number(plan.currentAmount) <= 0
                      ? 'No funds available to withdraw yet'
                      : isGroup
                      ? 'Request a group-approved withdrawal'
                      : 'Withdraw funds to your wallet'
                  }
                >
                  <ArrowDownToLine size={15} />
                  <span>{isGroup ? 'Withdraw' : 'Withdraw to Wallet'}</span>
                </button>

                {isGroup && (
                  <button
                    onClick={() => onOpenSplit(plan.id)}
                    className="col-span-1 lg:flex-none flex items-center justify-center gap-1.5 min-h-[44px] h-11 px-3 sm:px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs sm:text-sm rounded-lg border border-slate-300 transition active:scale-[0.98]"
                  >
                    <Receipt size={15} />
                    <span>Split Bill</span>
                  </button>
                )}
              </div>

              {/* Savings Schedule Insights */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Calendar size={14} className="text-[#1D4ED8]" />
                    <span>Savings Schedule</span>
                  </span>
                  {insights.daysRemaining && (
                    <span className="text-slate-500 font-mono">
                      {insights.daysRemaining} day(s) remaining
                    </span>
                  )}
                </div>
                <p className="text-slate-600 leading-relaxed">
                  {insights.summary || insights.recommendation}
                </p>
                <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-4 text-[11px] text-slate-600">
                  <span>
                    {isGroup ? 'Daily per member:' : 'Daily target:'}{' '}
                    <strong className="font-mono text-slate-900">
                      {formatNaira(insights.dailyPerMember)}
                    </strong>
                  </span>
                  <span>
                    {isGroup ? 'Weekly per member:' : 'Weekly target:'}{' '}
                    <strong className="font-mono text-slate-900">
                      {formatNaira(insights.weeklyPerMember)}
                    </strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Group Withdrawal Approval Queue (Shown for GROUP plans) */}
          {isGroup && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-[#1D4ED8]" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Group Withdrawal Approvals
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Withdrawals require member consensus before disbursement
                    </p>
                  </div>
                </div>
                <Badge variant="default">{withdrawalRequests.length} Request(s)</Badge>
              </div>

              {withdrawalRequests.length === 0 ? (
                <div className="p-5 text-xs text-slate-500 text-center">
                  No withdrawal requests submitted yet. Any group withdrawal will appear here for member approval.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {withdrawalRequests.map((wd) => {
                    const approvals = wd.approvals || [];
                    const hasVoted = approvals.includes(user?.id);
                    const isPending = wd.status === 'PENDING';

                    return (
                      <div key={wd.id} className="p-4 sm:px-5 space-y-2.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono tabular-nums">
                                {formatNaira(wd.amount)}
                              </span>
                              <span className="text-xs text-slate-600">
                                requested by <strong>@{wd.requester?.username}</strong>
                              </span>
                            </div>
                            {wd.reason && (
                              <p className="text-xs text-slate-500 mt-0.5">
                                Reason: &ldquo;{wd.reason}&rdquo;
                              </p>
                            )}
                          </div>

                          <Badge
                            variant={
                              wd.status === 'APPROVED'
                                ? 'success'
                                : wd.status === 'REJECTED'
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {wd.status === 'PENDING'
                              ? `${approvals.length}/${wd.requiredApprovals} Approved`
                              : wd.status}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                          <span className="text-[11px] text-slate-500 font-mono">
                            {formatDate(wd.createdAt)}
                          </span>

                          {isPending && !hasVoted ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleVoteWithdrawal(wd.id, 'REJECT')}
                                disabled={votingId === wd.id}
                                className="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() => handleVoteWithdrawal(wd.id, 'APPROVE')}
                                disabled={votingId === wd.id}
                                className="px-3 py-1.5 rounded-md bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs transition"
                              >
                                {votingId === wd.id ? 'Approving...' : 'Approve Withdrawal'}
                              </button>
                            </div>
                          ) : isPending && hasVoted ? (
                            <span className="text-[11px] text-slate-500 font-medium">
                              You approved • Waiting for remaining members
                            </span>
                          ) : wd.status === 'APPROVED' ? (
                            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                              <CheckCircle2 size={13} /> Disbursed to @{wd.requester?.username}
                            </span>
                          ) : (
                            <span className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                              <XCircle size={13} /> Declined by group
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Member Contributor Leaderboard (Only shown for GROUP plans) */}
          {isGroup && (
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy size={16} className="text-amber-600" />
                  <h3 className="text-sm font-bold text-slate-900">Member Contributions</h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {members.length} {members.length === 1 ? 'Member' : 'Members'}
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {leaderboard.map((member) => {
                  const share = member.sharePercent ?? member.sharePercentage ?? 0;
                  const cleanBadge = String(member.badge || 'Member')
                    .replace(/^[^\w#]+/, '')
                    .trim();
                  return (
                    <div
                      key={member.username}
                      className="px-5 py-3.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs font-mono shrink-0 border ${
                            member.rank === 1
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          #{member.rank}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                              {member.name}
                            </span>
                            <Badge variant={member.rank === 1 ? 'gold' : 'default'}>
                              {cleanBadge}
                            </Badge>
                          </div>
                          <span className="text-xs text-slate-500">
                            @{member.username} • {share}% share
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs sm:text-sm font-bold font-mono text-slate-900 tabular-nums">
                          {formatNaira(member.contributedAmount)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols):
            - For PERSONAL plans: Personal Savings Activity & Withdrawal Log (NO chat box!)
            - For GROUP plans: Live Group Chat & Collaborative Activity Stream */}
        <div
          className={`lg:col-span-5 flex flex-col ${
            isGroup && mobileTab !== 'chat' ? 'hidden lg:flex' : ''
          }`}
        >
          {!isGroup ? (
            /* PERSONAL PLAN RIGHT PANEL: Activity & Withdrawal Ledger (No Chat) */
            <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-full min-h-[420px] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Plan Activity Log</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Deposits and instant wallet withdrawals
                  </p>
                </div>
                <Badge variant="default">Personal Vault</Badge>
              </div>

              <div className="flex-1 p-5 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center mb-3">
                      <Clock size={18} />
                    </div>
                    <p className="text-sm font-bold text-slate-900">No plan activity yet</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
                      Every contribution from your wallet or withdrawal back to your wallet will be recorded here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {messages.map((item) => {
                      const isWithdrawal =
                        item.metadata?.event === 'WITHDRAWAL_COMPLETED' ||
                        String(item.content).toLowerCase().includes('withdrew');
                      return (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-0.5">
                            <span
                              className={`font-semibold block ${
                                isWithdrawal ? 'text-slate-900' : 'text-emerald-700'
                              }`}
                            >
                              {isWithdrawal ? 'Wallet Withdrawal' : 'Savings Contribution'}
                            </span>
                            <p className="text-slate-600 leading-relaxed">{item.content}</p>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 shrink-0">
                            {formatDate(item.createdAt)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* GROUP PLAN RIGHT PANEL: Live Group Chat, Split Cards & Withdrawal Approval Alerts */
            <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-[calc(100dvh-215px)] min-h-[380px] lg:h-[680px] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Group Chat &amp; Activity</h3>
                  <p className="text-[11px] text-slate-500">
                    Messages, contributions, splits &amp; withdrawal votes
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                  Live
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500 text-center px-4">
                    No group activity yet. Send a message or contribute to start collaborating.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isPaymentRequest =
                      msg.type === 'PAYMENT_REQUEST' ||
                      msg.metadata?.event === 'PAYMENT_REQUEST';

                    if (isPaymentRequest) {
                      const isPaid = msg.metadata?.status === 'PAID';
                      const isRequester = msg.sender?.id === user?.id;
                      const reqAmount = msg.metadata?.amount || 0;

                      return (
                        <div
                          key={msg.id}
                          className="p-3.5 rounded-lg bg-white border border-slate-200 text-xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <Receipt size={14} className="text-[#1D4ED8]" />
                              <span>Bill Split Request</span>
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                          <p className="text-slate-700">{msg.content}</p>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                              {formatNaira(reqAmount)}
                            </span>
                            {isPaid ? (
                              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded border border-emerald-200">
                                Settled
                              </span>
                            ) : isRequester ? (
                              <span className="text-[11px] text-slate-500">Awaiting payment</span>
                            ) : (
                              <button
                                onClick={() => handlePaySplit(msg.metadata?.requestId)}
                                className="px-3 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs rounded-md transition"
                              >
                                Pay {formatNaira(reqAmount)}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    }

                    if (msg.metadata?.event === 'WITHDRAWAL_REQUEST') {
                      const matchingWd = withdrawalRequests.find(
                        (w) => w.id === msg.metadata?.withdrawalId
                      );
                      const wdStatus = matchingWd?.status || msg.metadata?.status || 'PENDING';
                      const approvals = matchingWd?.approvals || msg.metadata?.approvals || [];
                      const requiredApprovals =
                        matchingWd?.requiredApprovals || msg.metadata?.requiredApprovals || 2;
                      const hasVoted = approvals.includes(user?.id);

                      return (
                        <div
                          key={msg.id}
                          className="p-3.5 rounded-lg bg-white border border-amber-200 text-xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <ShieldCheck size={14} className="text-amber-600" />
                              <span>Group Withdrawal Request</span>
                            </span>
                            <Badge
                              variant={
                                wdStatus === 'APPROVED'
                                  ? 'success'
                                  : wdStatus === 'REJECTED'
                                  ? 'danger'
                                  : 'warning'
                              }
                            >
                              {wdStatus === 'PENDING'
                                ? `${approvals.length}/${requiredApprovals} Approved`
                                : wdStatus}
                            </Badge>
                          </div>
                          <p className="text-slate-700">{msg.content}</p>
                          {wdStatus === 'PENDING' && !hasVoted && (
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                              <button
                                onClick={() =>
                                  handleVoteWithdrawal(msg.metadata?.withdrawalId, 'REJECT')
                                }
                                disabled={votingId === msg.metadata?.withdrawalId}
                                className="px-2.5 py-1 rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs"
                              >
                                Decline
                              </button>
                              <button
                                onClick={() =>
                                  handleVoteWithdrawal(msg.metadata?.withdrawalId, 'APPROVE')
                                }
                                disabled={votingId === msg.metadata?.withdrawalId}
                                className="px-3 py-1 rounded bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs"
                              >
                                Approve
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    }

                    if (msg.type === 'ACTIVITY_ALERT') {
                      return (
                        <div key={msg.id} className="flex justify-center my-1.5">
                          <div className="bg-white text-slate-700 border border-slate-200 rounded-md px-3 py-1.5 text-[11px] font-medium text-center max-w-[92%]">
                            {msg.content}
                          </div>
                        </div>
                      );
                    }

                    const isMe = msg.sender?.id === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        <div className="w-7 h-7 rounded-md bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          {getInitials(msg.sender?.name)}
                        </div>
                        <div
                          className={`max-w-[80%] rounded-lg px-3.5 py-2.5 text-xs ${
                            isMe
                              ? 'bg-[#1D4ED8] text-white'
                              : 'bg-white border border-slate-200 text-slate-900'
                          }`}
                        >
                          {!isMe && (
                            <span className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                              @{msg.sender?.username}
                            </span>
                          )}
                          <p className="leading-relaxed break-words">{msg.content}</p>
                          <span
                            className={`block text-[10px] mt-1 text-right font-mono ${
                              isMe ? 'text-blue-200' : 'text-slate-400'
                            }`}
                          >
                            {formatDate(msg.createdAt)}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={chatBottomRef} />
              </div>

              <form
                onSubmit={handleSendMessage}
                className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
              >
                <button
                  type="button"
                  onClick={() => onOpenSplit(planId)}
                  className="px-2.5 h-10 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-semibold text-xs flex items-center gap-1 shrink-0 transition"
                  title="Request bill split"
                >
                  <Receipt size={14} />
                  <span className="hidden sm:inline">Split</span>
                </button>

                <input
                  type="text"
                  placeholder="Write a message to the group..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 h-10 px-3 bg-white border border-slate-300 rounded-lg text-base sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1D4ED8] transition"
                />

                <button
                  type="submit"
                  disabled={sendingMsg || !newMessage.trim()}
                  className="w-10 h-10 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold rounded-lg flex items-center justify-center shrink-0 transition disabled:opacity-50"
                >
                  <Send size={15} />
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Modal (Instant for Personal, Approval Request for Group) */}
      <WithdrawModal
        isOpen={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        plan={plan}
        onWithdrawn={() => fetchPlanDetails(true)}
      />
    </div>
  );
}
