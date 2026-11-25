import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import PulseLogo from '../common/PulseLogo';
import collabHeroImg from '../../assets/collab-savings-hero.jpg';
import { ArrowRight, ShieldCheck, Users, ArrowRightLeft } from 'lucide-react';

export default function AuthView() {
  const { login, register } = useAuth();
  const { showToast } = useNotifications();
  const [isRegister, setIsRegister] = useState(false);
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegister) {
        await register({ name, username, email, password });
        showToast('Account created successfully.', 'success');
      } else {
        await login(emailOrUsername, password);
        showToast('Signed in.', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Authentication failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Left Panel: Brand Story & Collaborative Savings Photography */}
        <div className="lg:col-span-6 bg-[#0F172A] p-6 sm:p-9 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <PulseLogo variant="pill" size="default" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-300 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-full">
                Collaborative Finance
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-snug">
              Personal &amp; group savings, built for clarity.
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed">
              Pool funds with friends and teammates, track every contribution transparently, and settle instant transfers from one NGN wallet.
            </p>

            {/* Editorial Collaborative Savings Visual Card */}
            <div className="mt-5 relative rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900">
              <img
                src={collabHeroImg}
                alt="Friends collaborating on a shared group savings goal"
                className="w-full h-48 sm:h-56 object-cover object-center"
              />
              <div className="p-3.5 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-xs font-semibold text-white">Shared Group Pools</p>
                    <p className="text-[11px] text-slate-400">
                      Real-time member ledger, chat &amp; bill splits
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-semibold text-blue-300 bg-blue-950/80 border border-blue-800/60 px-2.5 py-1 rounded-md shrink-0">
                  NGN ₦
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800/90 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <Users size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <span>Group vaults with invite codes</span>
            </div>
            <div className="flex items-start gap-2">
              <ArrowRightLeft size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <span>Instant P2P &amp; 1-click splits</span>
            </div>
            <div className="flex items-start gap-2">
              <ShieldCheck size={15} className="text-blue-400 shrink-0 mt-0.5" />
              <span>Live contribution tracking</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Auth Form */}
        <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {isRegister ? 'Create your Pulse account' : 'Sign in to your account'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isRegister
                  ? 'Set up your profile and NGN wallet to start saving together.'
                  : 'Enter your username or email to access your wallet and groups.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 mb-6">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`py-2 text-xs font-semibold rounded-md transition ${
                  !isRegister
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={`py-2 text-xs font-semibold rounded-md transition ${
                  isRegister
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Username
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm">
                        @
                      </span>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) =>
                          setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                        }
                        className="w-full h-11 pl-8 pr-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
                        placeholder="username"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
                      placeholder="name@example.com"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
                    placeholder="username or email"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 mt-2"
              >
                <span>
                  {loading
                    ? 'Please wait...'
                    : isRegister
                    ? 'Create Account'
                    : 'Sign In'}
                </span>
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
