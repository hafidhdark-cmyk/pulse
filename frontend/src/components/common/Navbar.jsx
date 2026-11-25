import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../context/WalletContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatNaira, getInitials } from '../../utils/formatters';
import PulseLogo from './PulseLogo';
import { 
  Wallet, 
  PiggyBank, 
  Send, 
  Bell, 
  LogOut, 
  ChevronDown, 
  Plus, 
  ArrowRightLeft 
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenFund, onOpenP2P, onOpenNotifications }) {
  const { user, logout } = useAuth();
  const { balance } = useWallet();
  const { unreadCount } = useNotifications();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      {/* Sticky Top Header (Desktop & Mobile) */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#DCE7F9] shadow-[0_2px_10px_rgba(29,78,216,0.03)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <div 
                className="cursor-pointer group flex items-center"
                onClick={() => setActiveTab('wallet')}
              >
                <PulseLogo variant="light" size="default" />
              </div>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1.5">
                <button
                  onClick={() => setActiveTab('wallet')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    activeTab === 'wallet'
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] shadow-sm'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100/70'
                  }`}
                >
                  <Wallet size={16} />
                  <span>Dashboard</span>
                </button>

                <button
                  onClick={() => setActiveTab('savings')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    activeTab === 'savings'
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] shadow-sm'
                      : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100/70'
                  }`}
                >
                  <PiggyBank size={16} />
                  <span>Savings Plans</span>
                </button>

                <button
                  onClick={onOpenP2P}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#475569] hover:text-[#0F172A] hover:bg-slate-100/70 transition"
                >
                  <ArrowRightLeft size={16} />
                  <span>P2P Transfer</span>
                </button>
              </nav>
            </div>

            {/* Right Side: Quick Fund Pill, Notification Bell, User Pill */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Quick Fund Balance Pill */}
              <button
                onClick={onOpenFund}
                className="hidden sm:flex items-center gap-2 bg-[#F4F8FF] border border-[#DCE7F9] hover:border-[#1D4ED8]/40 px-3.5 py-1.5 rounded-full transition group shadow-sm"
                title="Click to fund wallet"
              >
                <span className="text-xs text-[#52627A] font-medium">Balance:</span>
                <span className="text-xs font-mono font-bold text-[#1D4ED8] tabular-nums">
                  {formatNaira(balance)}
                </span>
                <div className="w-5 h-5 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center group-hover:scale-105 transition">
                  <Plus size={12} strokeWidth={3} />
                </div>
              </button>

              {/* Notification Bell with Live Unread Indicator */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-xl text-[#52627A] hover:text-[#0F172A] hover:bg-slate-100 transition"
                aria-label="View notifications"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#1D4ED8] text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* User Account Chip & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full bg-[#F4F8FF] border border-[#DCE7F9] hover:border-slate-300 transition"
                >
                  <div className="w-7 h-7 rounded-full bg-[#1D4ED8] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                    {getInitials(user?.name)}
                  </div>
                  <span className="text-xs font-bold text-[#0F172A] hidden sm:inline">
                    @{user?.username}
                  </span>
                  <ChevronDown size={14} className="text-[#64748B]" />
                </button>

                {userMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-30" 
                      onClick={() => setUserMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-52 bg-white border border-[#DCE7F9] rounded-2xl shadow-elevation py-2 z-40 text-sm">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-[11px] text-[#64748B]">Signed in as</p>
                        <p className="font-bold text-[#0F172A] truncate">@{user?.username}</p>
                        <p className="text-xs text-[#52627A] truncate mt-0.5">{user?.email}</p>
                      </div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-[#B91C1C] hover:bg-rose-50 text-left transition font-semibold text-xs mt-1"
                      >
                        <LogOut size={15} />
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

      {/* Mobile Fixed Bottom Navigation Bar (< 768px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[#DCE7F9] z-40 px-4 flex items-center justify-around shadow-[0_-4px_16px_rgba(29,78,216,0.05)]">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition ${
            activeTab === 'wallet' ? 'text-[#1D4ED8]' : 'text-[#64748B]'
          }`}
        >
          <Wallet size={19} strokeWidth={activeTab === 'wallet' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('savings')}
          className={`flex flex-col items-center justify-center gap-1 w-16 py-1 transition ${
            activeTab === 'savings' ? 'text-[#1D4ED8]' : 'text-[#64748B]'
          }`}
        >
          <PiggyBank size={19} strokeWidth={activeTab === 'savings' ? 2.5 : 2} />
          <span className="text-[10px] font-semibold">Savings</span>
        </button>

        <button
          onClick={onOpenP2P}
          className="flex flex-col items-center justify-center gap-1 w-16 py-1 text-[#64748B] hover:text-[#1D4ED8] transition"
        >
          <ArrowRightLeft size={19} />
          <span className="text-[10px] font-semibold">Transfer</span>
        </button>

        <button
          onClick={onOpenNotifications}
          className="relative flex flex-col items-center justify-center gap-1 w-16 py-1 text-[#64748B] hover:text-[#1D4ED8] transition"
        >
          <Bell size={19} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-3.5 w-3.5 h-3.5 bg-[#1D4ED8] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className="text-[10px] font-semibold">Alerts</span>
        </button>
      </div>
    </>
  );
}
