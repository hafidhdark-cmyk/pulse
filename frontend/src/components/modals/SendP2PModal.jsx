import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../api/client';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatNaira, formatDate } from '../../utils/formatters';
import { Check, AlertCircle, ArrowRight, CheckCircle2, Share2, Receipt } from 'lucide-react';

export default function SendP2PModal({ isOpen, onClose }) {
  const { balance, sendP2P } = useWallet();
  const { showToast } = useNotifications();
  const [recipientQuery, setRecipientQuery] = useState('');
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [lookupError, setLookupError] = useState(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null); // Receipt view upon success

  // Debounced lookup
  useEffect(() => {
    if (!recipientQuery.trim()) {
      setVerifiedUser(null);
      setLookupError(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLookingUp(true);
        setLookupError(null);
        const res = await api.transfers.lookup(recipientQuery);
        setVerifiedUser(res.user);
      } catch (err) {
        setVerifiedUser(null);
        setLookupError(err.message || 'User not found');
      } finally {
        setLookingUp(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [recipientQuery]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!verifiedUser) {
      showToast("Please enter a verified recipient", "error");
      return;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }
    if (numAmount > balance) {
      showToast("Insufficient wallet balance", "error");
      return;
    }

    try {
      setLoading(true);
      const res = await sendP2P(verifiedUser.username, numAmount, note);
      showToast(`Transfer sent to @${verifiedUser.username}!`, "success");
      setReceipt(res.transaction);
    } catch (err) {
      showToast(err.message || "Transfer failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReceipt(null);
    setRecipientQuery('');
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={receipt ? "Transfer Receipt" : "Send P2P Transfer"}>
      {receipt ? (
        /* Shareable Transfer Receipt */
        <div className="space-y-5 text-center">
          <div className="w-14 h-14 rounded-full bg-[#DCFCE7] text-[#15803D] flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 size={32} />
          </div>

          <div>
            <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider block">Transfer Successful</span>
            <h2 className="text-3xl font-extrabold font-mono text-[#0F172A] tabular-nums mt-1">
              {formatNaira(receipt.amount)}
            </h2>
            <p className="text-xs text-[#64748B] mt-1">Sent to @{receipt.recipient?.username || verifiedUser?.username}</p>
          </div>

          <div className="bg-[#F8FAFC] border border-[#DCE7F9] rounded-2xl p-4 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-[#64748B]">Reference</span>
              <span className="font-mono font-bold text-[#0F172A]">{receipt.reference}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Date & Time</span>
              <span className="font-mono text-[#0F172A]">{formatDate(receipt.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B]">Recipient</span>
              <span className="font-semibold text-[#0F172A]">{receipt.recipient?.name || verifiedUser?.name}</span>
            </div>
            {note && (
              <div className="flex justify-between">
                <span className="text-[#64748B]">Note</span>
                <span className="text-[#0F172A] italic">{note}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className="w-full h-11 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-xs rounded-xl transition"
          >
            Done
          </button>
        </div>
      ) : (
        /* Transfer Form */
        <form onSubmit={handleSend} className="space-y-4">
          {/* Recipient Input with Verified Badge */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">Recipient Username</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] font-bold text-sm">@</span>
              <input
                type="text"
                placeholder="username (e.g. lam, chioma, tunde)"
                value={recipientQuery}
                onChange={(e) => setRecipientQuery(e.target.value)}
                className="w-full h-11 pl-8 pr-10 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition"
              />
              {lookingUp && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-[#64748B]">
                  Verifying...
                </span>
              )}
            </div>

            {verifiedUser && (
              <div className="mt-2 p-2.5 bg-[#DCFCE7] border border-[#BBF7D0] rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-[#15803D] flex items-center gap-1.5">
                  <Check size={14} strokeWidth={3} />
                  <span>Verified: {verifiedUser.name} (@{verifiedUser.username})</span>
                </span>
              </div>
            )}

            {lookupError && recipientQuery && !lookingUp && (
              <p className="mt-1.5 text-xs text-[#B91C1C] flex items-center gap-1 font-medium">
                <AlertCircle size={13} /> {lookupError}
              </p>
            )}
          </div>

          {/* Amount */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-semibold text-[#475569]">Amount (₦)</label>
              <span className="text-[11px] text-[#64748B]">
                Available: <strong className="font-mono text-[#0F172A] tabular-nums">{formatNaira(balance)}</strong>
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] font-mono font-bold">₦</span>
              <input
                type="number"
                placeholder="e.g. 10000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 pl-8 pr-4 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm font-mono text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition tabular-nums"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-semibold text-[#475569] mb-1">Note (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Lunch split, drinks, ticket"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !verifiedUser || !amount}
            className="w-full h-12 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 mt-2"
          >
            <span>{loading ? "Sending..." : "Send Money Now"}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      )}
    </Modal>
  );
}
