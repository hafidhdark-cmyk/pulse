import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatNaira, getInitials } from '../../utils/formatters';
import PulseLogo from './PulseLogo';
import {
  Wallet,
  PiggyBank,
  Bell,
  LogOut,
  ChevronDown,
  Plus,
  ArrowRightLeft
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenFund,
  onOpenP2P,
  onOpenNotifications
}) {
  const { user, logout } = useAuth();
  const { balance } = useWallet();
  const { unreadCount } = useNotifications();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            <div className="flex items-center gap-6 shrink-0">
              <button
                type="button"
                className="flex items-center focus:outline-none"
                onClick={() => setActiveTab('wallet')}
              >
                <PulseLogo variant="light" size="sm" className="sm:hidden" />
                <PulseLogo variant="light" size="default" className="hidden sm:inline-flex" />
              </button>

              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-full select-none" title="Authentic UI & Architecture Remodel by Layi (@layi)">
                ⚡ Remodel by @layi
              </span>

              <nav className="hidden lg:flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'wallet'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Wallet size={15} />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveTab('savings')}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
                    activeTab === 'savings'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <PiggyBank size={15} />
                  <span>Savings Plans</span>
                </button>

                <button
                  onClick={onOpenP2P}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                >
                  <ArrowRightLeft size={15} />
                  <span>Transfer</span>
                </button>
              </nav>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
              {/* Compact Balance + Fund Trigger */}
              <button
                onClick={onOpenFund}
                className="flex items-center gap-1.5 sm:gap-2 bg-slate-50 border border-slate-200 hover:border-slate-300 px-2.5 sm:px-3 py-1.5 rounded-lg transition max-w-[155px] sm:max-w-none"
                title="Fund wallet"
              >
                <span className="hidden sm:inline text-xs text-slate-500 font-medium">Balance</span>
                <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-900 tabular-nums truncate">
                  {formatNaira(balance)}
                </span>
                <span className="w-4 h-4 rounded bg-[#1D4ED8] text-white flex items-center justify-center shrink-0">
                  <Plus size={11} strokeWidth={2.5} />
                </span>
              </button>

              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition shrink-0"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#1D4ED8] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <div className="relative shrink-0">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 transition"
                >
                  <div className="w-7 h-7 rounded-md bg-slate-900 flex items-center justify-center text-xs font-bold text-white">
                    {getInitials(user?.name)}
                  </div>
                  <span className="text-xs font-semibold text-slate-900 hidden sm:inline">
                    @{user?.username}
                  </span>
                  <ChevronDown size={13} className="text-slate-500 hidden sm:inline" />
                </button>

                {userMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-40 text-sm">
                      <div className="px-4 py-2.5 border-b border-slate-100">
                        <p className="text-[11px] text-slate-500">Signed in as</p>
                        <p className="font-bold text-slate-900 truncate">@{user?.username}</p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-rose-600 hover:bg-rose-50 text-left transition font-semibold text-xs"
                      >
                        <LogOut size={14} />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="grid grid-cols-4 h-14">
          <button
            onClick={() => setActiveTab('wallet')}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 active:scale-95 transition ${
              activeTab === 'wallet' ? 'text-[#1D4ED8]' : 'text-slate-500'
            }`}
          >
            {activeTab === 'wallet' && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#1D4ED8]" />
            )}
            <Wallet size={19} strokeWidth={activeTab === 'wallet' ? 2.4 : 2} />
            <span className="text-[11px] font-semibold">Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('savings')}
            className={`relative flex flex-col items-center justify-center gap-1 py-2 active:scale-95 transition ${
              activeTab === 'savings' ? 'text-[#1D4ED8]' : 'text-slate-500'
            }`}
          >
            {activeTab === 'savings' && (
              <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#1D4ED8]" />
            )}
            <PiggyBank size={19} strokeWidth={activeTab === 'savings' ? 2.4 : 2} />
            <span className="text-[11px] font-semibold">Savings</span>
          </button>

          <button
            onClick={onOpenP2P}
            className="flex flex-col items-center justify-center gap-1 py-2 text-slate-500 active:text-[#1D4ED8] active:scale-95 transition"
          >
            <ArrowRightLeft size={19} />
            <span className="text-[11px] font-semibold">Transfer</span>
          </button>

          <button
            onClick={onOpenNotifications}
            className="relative flex flex-col items-center justify-center gap-1 py-2 text-slate-500 active:text-[#1D4ED8] active:scale-95 transition"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1/2 translate-x-3.5 w-3.5 h-3.5 bg-[#1D4ED8] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
            <span className="text-[11px] font-semibold">Activity</span>
          </button>
        </div>
      </nav>
    </>
  );
}
