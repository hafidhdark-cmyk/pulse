import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import PulseLogo from '../common/PulseLogo';
import { ShieldCheck, Users, Zap, ArrowRight } from 'lucide-react';

export default function AuthView() {
  const { login, register } = useAuth();
  const { showToast } = useNotifications();
  const [isRegister, setIsRegister] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('hafidh');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('Hafidh Dark');
  const [username, setUsername] = useState('hafidh');
  const [email, setEmail] = useState('hafidh@pulse.app');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register({ name, username, email, password });
        showToast("Welcome to Pulse! Account created.", "success");
      } else {
        await login(emailOrUsername, password);
        showToast("Signed in successfully!", "success");
      }
    } catch (err) {
      showToast(err.message || "Authentication failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async () => {
    setLoading(true);
    try {
      await login('hafidh', 'password123');
      showToast("Signed in as Demo User @hafidh!", "success");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F8FF] flex flex-col justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto bg-white border border-[#DCE7F9] rounded-3xl shadow-elevation overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* LEFT COLUMN: Blue Gradient Brand Hero on Desktop */}
        <div className="lg:col-span-6 bg-brand-hero p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Radar Rings Motif */}
          <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-white/[0.08] pointer-events-none" />
          <div className="absolute -right-12 -top-12 w-72 h-72 rounded-full border border-white/[0.08] pointer-events-none" />
          
          {/* ECG pulse graphic watermark */}
          <div className="absolute right-0 bottom-8 w-80 opacity-20 pointer-events-none">
            <svg viewBox="0 0 500 150" fill="none" stroke="currentColor" strokeWidth="3" className="w-full text-white">
              <path d="M0,75 L120,75 L140,20 L160,130 L180,60 L200,90 L220,75 L500,75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="relative z-10">
            {/* White rounded pill logo */}
            <div className="mb-8">
              <PulseLogo variant="pill" size="default" showWordmark={true} />
            </div>

            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold text-blue-100 uppercase tracking-wider">
                <Zap size={13} />
                Multiplayer Social Fintech
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Save Together. <br />Grow Faster.
              </h1>
              <p className="text-sm text-blue-100 max-w-sm leading-relaxed">
                The collaborative group savings and P2P wallet built for friends, squads, and communities.
              </p>
            </div>
          </div>

          {/* Social Proof Pills */}
          <div className="relative z-10 pt-8 mt-8 border-t border-white/15 grid grid-cols-3 gap-2.5 text-center text-xs">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <span className="block font-bold font-mono text-sm">NGN ₦</span>
              <span className="text-[10px] text-blue-100">Zero Fees</span>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <span className="block font-bold text-sm">Group Vaults</span>
              <span className="text-[10px] text-blue-100">Live Chat</span>
            </div>
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <span className="block font-bold text-sm">1-Click</span>
              <span className="text-[10px] text-blue-100">Bill Splits</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean Auth Card */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F4F8FF] rounded-xl border border-[#DCE7F9] mb-6">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  !isRegister ? 'bg-white text-[#1D4ED8] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={`py-2 text-xs font-bold rounded-lg transition ${
                  isRegister ? 'bg-white text-[#1D4ED8] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition"
                      placeholder="Hafidh Dark"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">Unique Username</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] font-bold text-sm">@</span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full h-11 pl-8 pr-3.5 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition"
                        placeholder="hafidh"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#475569] mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition"
                      placeholder="hafidh@pulse.app"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#475569] mb-1">Email or Username</label>
                  <input
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition"
                    placeholder="hafidh or hafidh@pulse.app"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3.5 bg-[#F8FAFC] border border-[#DCE7F9] rounded-xl text-sm text-[#0F172A] focus:outline-none focus:border-[#1D4ED8] transition"
                  placeholder="••••••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-bold text-sm rounded-xl transition shadow-md shadow-blue-500/20 disabled:opacity-50 mt-2"
              >
                <span>{loading ? "Authenticating..." : isRegister ? "Create Wallet & Account" : "Sign In to Pulse"}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Quick Demo Shortcut */}
            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={handleQuickDemo}
                disabled={loading}
                className="inline-flex items-center gap-1.5 text-xs text-[#1D4ED8] hover:text-[#1E40AF] font-bold"
              >
                <Zap size={14} />
                <span>1-Click Sign In as Demo User (@hafidh)</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
