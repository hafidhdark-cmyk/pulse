import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatNaira, formatDate, getInitials } from '../../utils/formatters';
import ProgressBar from '../common/ProgressBar';
import Badge from '../common/Badge';
import { 
  Users, 
  ArrowLeft, 
  Copy, 
  Check, 
  Send, 
  Sparkles, 
  Trophy, 
  TrendingUp, 
  Receipt,
  Plus,
  Zap,
  Clock,
  ShieldCheck,
  DollarSign
} from 'lucide-react';

export default function SavingsPlanDetailView({ planId, onBack, onOpenContribute, onOpenSplit }) {
  const { user } = useAuth();
  const { refreshWallet } = useWallet();
  const { showToast } = useNotifications();
  const [details, setDetails] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [mobileTab, setMobileTab] = useState('vault'); // 'vault' vs 'chat' on mobile
  const chatBottomRef = useRef(null);

  const fetchPlanDetails = async () => {
    try {
      setLoading(true);
      const res = await api.savings.getPlan(planId);
      setDetails(res);
      const msgRes = await api.chat.getMessages(planId);
      setMessages(msgRes.messages || []);
    } catch (err) {
      showToast(err.message || "Failed to load plan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (planId) fetchPlanDetails();
  }, [planId]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, mobileTab]);

  const handleCopyCode = () => {
    if (!details?.plan?.inviteCode) return;
    navigator.clipboard.writeText(details.plan.inviteCode);
    setCopiedCode(true);
    showToast("Invite code copied to clipboard!", "info");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSendingMsg(true);
      const res = await api.chat.sendMessage(planId, { content: newMessage.trim() });
      setMessages(prev => [...prev, res.message]);
      setNewMessage('');
    } catch (err) {
      showToast(err.message || "Failed to post message", "error");
    } finally {
      setSendingMsg(false);
    }
  };

  const handlePaySplit = async (requestId) => {
    try {
      await api.transfers.payRequest(requestId);
      await refreshWallet();
      showToast("Split payment settled from your wallet!", "success");
      const msgRes = await api.chat.getMessages(planId);
      setMessages(msgRes.messages || []);
    } catch (err) {
      showToast(err.message || "Failed to pay split", "error");
    }
  };

  if (loading || !details) {
    return (
      <div className="py-20 text-center text-[#52627A]">
        <div className="w-8 h-8 border-2 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-sm">Loading group vault details...</p>
      </div>
    );
  }

  const { plan, members, leaderboard, insights } = details;

  return (
    <div className="space-y-6">
      {/* Back button & Title Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-[#52627A] hover:text-[#0F172A] transition font-bold"
        >
          <ArrowLeft size={16} />
          <span>Back to all savings goals</span>
        </button>

        {/* Mobile Segmented Pill Switcher (< 1024px) */}
        <div className="lg:hidden flex p-1 bg-white border border-[#DCE7F9] rounded-xl self-start sm:self-auto shadow-sm">
          <button
            onClick={() => setMobileTab('vault')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition ${
              mobileTab === 'vault' ? 'bg-[#1D4ED8] text-white shadow-sm' : 'text-[#64748B]'
            }`}
          >
            Vault & Leaderboard
          </button>
          <button
            onClick={() => setMobileTab('chat')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              mobileTab === 'chat' ? 'bg-[#1D4ED8] text-white shadow-sm' : 'text-[#64748B]'
            }`}
          >
            <span>Live Chat</span>
            <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
          </button>
        </div>
      </div>

      {/* Main Split Layout: 55% Left Column & 45% Right Column on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Vault Overview, Smart Pace & Leaderboard (55% on desktop -> 7 cols) */}
        <div className={`lg:col-span-7 space-y-6 ${mobileTab !== 'vault' ? 'hidden lg:block' : ''}`}>
          {/* Vault Overview Card */}
          <div className="bg-white border border-[#DCE7F9] rounded-2xl p-6 sm:p-7 shadow-card relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Badge variant={plan.type === 'GROUP' ? 'cyan' : 'default'}>
                  {plan.type === 'GROUP' ? 'GROUP VAULT' : 'PERSONAL TARGET'}
                </Badge>
                <Badge variant="primary">{plan.frequency}</Badge>
              </div>

              {/* 1-Click Copy Invite Code Pill */}
              {plan.inviteCode && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 bg-[#EFF6FF] hover:bg-[#DBEAFE] border border-[#BFDBFE] px-3 py-1 rounded-full text-xs font-mono font-bold text-[#1D4ED8] transition shadow-sm"
                  title="Copy invite code"
                >
                  <span>{plan.inviteCode}</span>
                  {copiedCode ? <Check size={13} className="text-[#15803D]" /> : <Copy size={13} />}
                </button>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              {plan.title}
            </h1>
            <p className="text-xs sm:text-sm text-[#52627A] mt-1">
              {plan.description || "Multiplayer group savings pool"}
            </p>

            {/* Pooled Balance + Target */}
            <div className="my-6 p-5 bg-[#F8FAFF] border border-[#DCE7F9] rounded-2xl">
              <div className="flex justify-between items-baseline mb-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                    Total Pooled Balance
                  </span>
                  <span className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums text-[#1D4ED8]">
                    {formatNaira(plan.currentAmount)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] block">
                    Target Goal
                  </span>
                  <span className="text-lg font-bold font-mono tabular-nums text-[#0F172A]">
                    {formatNaira(plan.targetAmount)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <ProgressBar
                current={plan.currentAmount}
                target={plan.targetAmount}
                percent={plan.progressPercent}
                height="h-3"
              />
            </div>

            {/* CTA Button: + Contribute from Wallet */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onOpenContribute(plan)}
                className="flex-1 flex items-center justify-center gap-2 h-12 px-6 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-500/20"
              >
                <Plus size={18} strokeWidth={2.5} />
                <span>+ Contribute from Wallet</span>
              </button>

              {plan.type === 'GROUP' && (
                <button
                  onClick={() => onOpenSplit(plan.id)}
                  className="flex items-center justify-center gap-2 h-12 px-5 bg-white hover:bg-slate-50 text-[#1D4ED8] font-bold text-sm rounded-xl border border-[#DCE7F9] shadow-sm transition"
                >
                  <Receipt size={17} />
                  <span>Split Bill</span>
                </button>
              )}
            </div>

            {/* ⚡ Smart Pace Banner */}
            <div className="mt-6 p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-2xl flex items-start gap-3">
              <Zap size={20} className="text-[#1D4ED8] shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold text-[#1D4ED8] block">⚡ Smart Pace Insights</span>
                <p className="text-[#475569] mt-0.5 leading-relaxed">
                  {insights.summary}
                </p>
                <div className="flex gap-4 mt-2 text-[11px] font-semibold text-[#1D4ED8]">
                  <span>Daily / Member: <strong>{formatNaira(insights.dailyPerMember)}</strong></span>
                  <span>•</span>
                  <span>Weekly: <strong>{formatNaira(insights.weeklyPerMember)}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Member Contributor Leaderboard Card */}
          <div className="bg-white border border-[#DCE7F9] rounded-2xl p-6 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                <h3 className="text-base font-bold text-[#0F172A]">Group Contributor Leaderboard</h3>
              </div>
              <span className="text-xs text-[#64748B] font-semibold">{members.length} Members</span>
            </div>

            <div className="divide-y divide-slate-100">
              {leaderboard.map(member => (
                <div key={member.username} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs font-mono shrink-0 ${
                      member.rank === 1 ? 'bg-amber-100 text-amber-800 ring-2 ring-amber-300' :
                      member.rank === 2 ? 'bg-slate-200 text-slate-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      #{member.rank}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0F172A]">{member.name}</span>
                        <Badge variant={member.rank === 1 ? 'gold' : 'default'}>{member.badge}</Badge>
                      </div>
                      <span className="text-xs text-[#64748B]">@{member.username} • {member.sharePercent}% share</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold font-mono text-[#1D4ED8] tabular-nums">
                      {formatNaira(member.contributedAmount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Group Chat & Activity Feed (45% on desktop -> 5 cols) */}
        <div className={`lg:col-span-5 ${mobileTab !== 'chat' ? 'hidden lg:block' : ''}`}>
          <div className="bg-white border border-[#DCE7F9] rounded-2xl shadow-card flex flex-col h-[650px] overflow-hidden">
            {/* Header: Live Feed Badge */}
            <div className="px-5 py-4 border-b border-[#DCE7F9] bg-[#F8FAFC] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DCFCE7] text-[#15803D] border border-[#BBF7D0] text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-[#15803D] animate-ping" />
                  <span>● Live Feed</span>
                </span>
                <span className="text-xs text-[#64748B]">Vault Room</span>
              </div>
              <span className="text-xs font-mono text-[#64748B]">Socket.io Connected</span>
            </div>

            {/* Scrollable Chat Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#F4F8FF]">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-[#64748B] text-center px-4">
                  No activity yet. Send a chat or contribute money to start the conversation!
                </div>
              ) : (
                messages.map(msg => {
                  // Centered ACTIVITY_ALERT deposit pills
                  if (msg.type === 'ACTIVITY_ALERT') {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <div className="bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE] rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm text-center">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  // Interactive PAYMENT_REQUEST split cards
                  if (msg.type === 'PAYMENT_REQUEST') {
                    const isPaid = msg.metadata?.status === 'PAID';
                    const isRequester = msg.sender?.id === user?.id;

                    return (
                      <div key={msg.id} className="p-4 rounded-xl bg-white border border-[#BFDBFE] shadow-sm text-xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[#1D4ED8] flex items-center gap-1.5">
                            <Receipt size={14} />
                            <span>1-Click Bill Split Request</span>
                          </span>
                          <span className="text-[10px] text-[#64748B] font-mono">{formatDate(msg.createdAt)}</span>
                        </div>
                        <p className="text-[#0F172A] font-medium">{msg.content}</p>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="font-mono text-sm font-bold text-[#0F172A] tabular-nums">
                            {formatNaira(msg.metadata?.amount || 5000)}
                          </span>
                          {isPaid ? (
                            <span className="text-[11px] font-bold bg-[#DCFCE7] text-[#15803D] px-3 py-1 rounded-full border border-[#BBF7D0]">
                              ✓ Paid by @{msg.metadata?.paidBy || 'member'}
                            </span>
                          ) : isRequester ? (
                            <span className="text-[11px] text-[#64748B] italic">
                              Waiting for members
                            </span>
                          ) : (
                            <button
                              onClick={() => handlePaySplit(msg.metadata?.requestId)}
                              className="px-3.5 py-1.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs rounded-xl transition shadow-sm"
                            >
                              Pay {formatNaira(msg.metadata?.amount || 5000)}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Member Chat Bubbles
                  const isMe = msg.sender?.id === user?.id;
                  return (
                    <div key={msg.id} className={`flex items-start gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <div className="w-7 h-7 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm">
                        {getInitials(msg.sender?.name)}
                      </div>
                      <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-xs shadow-sm ${
                        isMe 
                          ? 'bg-[#1D4ED8] text-white font-medium rounded-tr-none' 
                          : 'bg-white border border-[#DCE7F9] text-[#0F172A] rounded-tl-none'
                      }`}>
                        {!isMe && (
                          <span className="text-[10px] font-bold text-[#1D4ED8] block mb-0.5">
                            @{msg.sender?.username}
                          </span>
                        )}
                        <p className="leading-relaxed">{msg.content}</p>
                        <span className={`block text-[9px] mt-1 text-right font-mono ${isMe ? 'text-blue-200' : 'text-[#64748B]'}`}>
                          {formatDate(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Sticky Message Composer with Request / Split ₦ button */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-[#DCE7F9] bg-white flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenSplit(planId)}
                className="px-3 h-11 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] border border-[#BFDBFE] font-bold text-xs flex items-center gap-1 shrink-0 transition"
                title="Post a bill split request to this chat"
              >
                <Receipt size={14} />
                <span className="hidden sm:inline">Split ₦</span>
              </button>

              <input
                type="text"
                placeholder="Message group or drop updates..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 h-11 px-3.5 bg-[#F4F8FF] border border-[#DCE7F9] rounded-xl text-xs sm:text-sm text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#1D4ED8] transition"
              />

              <button
                type="submit"
                disabled={sendingMsg || !newMessage.trim()}
                className="w-11 h-11 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold rounded-xl flex items-center justify-center shrink-0 transition disabled:opacity-50 shadow-sm"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
