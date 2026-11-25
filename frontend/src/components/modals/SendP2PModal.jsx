import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { api } from '../../api/client';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatNaira, formatDate } from '../../utils/formatters';
import { Check, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

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
  const [receipt, setReceipt] = useState(null);

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
        const res = await api.transfers.lookup(recipientQuery.trim());
        setVerifiedUser(res.user);
      } catch (err) {
        setVerifiedUser(null);
        setLookupError(err.message || 'User not found');
      } finally {
        setLookingUp(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [recipientQuery]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!verifiedUser) {
      showToast('Please enter a valid recipient username', 'error');
      return;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      showToast('Please enter a valid amount', 'error');
      return;
    }
    if (numAmount > balance) {
      showToast('Insufficient wallet balance', 'error');
      return;
    }

    try {
      setLoading(true);
      const res = await sendP2P(verifiedUser.username, numAmount, note);
      showToast(`Sent ${formatNaira(numAmount)} to @${verifiedUser.username}.`, 'success');
      setReceipt(res.transaction);
    } catch (err) {
      showToast(err.message || 'Transfer failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReceipt(null);
    setRecipientQuery('');
    setVerifiedUser(null);
    setLookupError(null);
    setAmount('');
    setNote('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={receipt ? 'Transfer Receipt' : 'Send Money'}
    >
      {receipt ? (
        <div className="space-y-5 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 size={26} />
          </div>

          <div>
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
              Transfer Completed
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-mono text-slate-900 tabular-nums mt-1">
              {formatNaira(receipt.amount)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Recipient: @{verifiedUser?.username}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs space-y-2.5 text-left">
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Reference</span>
              <span className="font-mono font-semibold text-slate-900">{receipt.reference}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Time</span>
              <span className="font-mono text-slate-900">{formatDate(receipt.createdAt)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-slate-500">Recipient</span>
              <span className="font-semibold text-slate-900">{verifiedUser?.name}</span>
            </div>
            {note && (
              <div className="flex justify-between gap-2">
                <span className="text-slate-500">Note</span>
                <span className="text-slate-900">{note}</span>
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className="w-full h-11 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-xs rounded-lg transition"
          >
            Done
          </button>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Recipient Username
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                @
              </span>
              <input
                type="text"
                placeholder="Enter username"
                value={recipientQuery}
                onChange={(e) => setRecipientQuery(e.target.value)}
                className="w-full h-11 pl-8 pr-16 bg-white border border-slate-300 rounded-lg text-base sm:text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
              />
              {lookingUp && (
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  Checking...
                </span>
              )}
            </div>

            {verifiedUser && (
              <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs">
                <span className="font-semibold text-emerald-800 flex items-center gap-1.5">
                  <Check size={14} strokeWidth={2.5} />
                  <span>
                    {verifiedUser.name} (@{verifiedUser.username})
                  </span>
                </span>
              </div>
            )}

            {lookupError && recipientQuery && !lookingUp && (
              <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                <AlertCircle size={13} /> {lookupError}
              </p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Amount (₦)</label>
              <span className="text-[11px] text-slate-500">
                Available:{' '}
                <strong className="font-mono text-slate-900 tabular-nums">
                  {formatNaira(balance)}
                </strong>
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-semibold">
                ₦
              </span>
              <input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full h-11 pl-8 pr-4 bg-white border border-slate-300 rounded-lg text-base sm:text-sm font-mono text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Note (Optional)
            </label>
            <input
              type="text"
              placeholder="Add a note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-base sm:text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !verifiedUser || !amount}
            className="w-full h-11 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Sending...' : 'Send Transfer'}</span>
            <ArrowRight size={15} />
          </button>
        </form>
      )}
    </Modal>
  );
}
