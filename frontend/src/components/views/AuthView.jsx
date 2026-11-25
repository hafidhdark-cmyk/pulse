import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import PulseLogo from '../common/PulseLogo';
import ajoBgImg from '../../assets/ajo-savings-bg.jpg';
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
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center py-4 px-3.5 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 lg:min-h-[580px]">
        {/* Left Panel: Compact on Mobile, Full-Height on Desktop */}
        <div className="lg:col-span-6 relative overflow-hidden p-5 sm:p-8 lg:p-10 text-white flex flex-col justify-between min-h-[210px] sm:min-h-[260px] lg:min-h-full">
          <img
            src={ajoBgImg}
            alt="Community savings contribution with a local thrift collector"
            className="absolute inset-0 w-full h-full object-cover object-[50%_25%]"
          />
          <div className="absolute inset-0 bg-[#0B2A6B]/75 backdrop-blur-[1px]" />

          <div className="relative z-10">
            <div className="flex items-center justify-between gap-2 mb-4 sm:mb-8">
              <PulseLogo variant="pill" size="sm" />
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-white bg-white/15 border border-white/25 backdrop-blur-sm px-2.5 sm:px-3 py-1 rounded-full">
                Collaborative Finance
              </span>
            </div>

            <div className="max-w-md space-y-2 sm:space-y-3 mt-1 sm:mt-4">
              <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight drop-shadow-sm">
                Community savings, modernized for trust.
              </h1>
              <p className="text-xs sm:text-sm text-blue-50/95 leading-relaxed drop-shadow-sm">
                Bring shared Ajo and group contributions online—pool funds with your circle, approve withdrawals together, and send instant NGN transfers.
              </p>
            </div>
          </div>

          {/* Feature Highlights (shown on tablet/desktop so mobile keeps auth form above the fold) */}
          <div className="hidden sm:grid relative z-10 mt-6 lg:mt-8 pt-5 border-t border-white/20 grid-cols-3 gap-2.5 text-xs text-blue-50">
            <div className="flex items-start gap-2 bg-white/10 border border-white/15 backdrop-blur-sm rounded-lg p-2.5 lg:p-3">
              <Users size={15} className="text-blue-200 shrink-0 mt-0.5" />
              <span>Group vaults with invite codes</span>
            </div>
            <div className="flex items-start gap-2 bg-white/10 border border-white/15 backdrop-blur-sm rounded-lg p-2.5 lg:p-3">
              <ShieldCheck size={15} className="text-blue-200 shrink-0 mt-0.5" />
              <span>Member-approved withdrawals</span>
            </div>
            <div className="flex items-start gap-2 bg-white/10 border border-white/15 backdrop-blur-sm rounded-lg p-2.5 lg:p-3">
              <ArrowRightLeft size={15} className="text-blue-200 shrink-0 mt-0.5" />
              <span>Instant P2P &amp; bill splits</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Auth Form */}
        <div className="lg:col-span-6 p-5 sm:p-8 lg:p-10 flex flex-col justify-center">
          <div className="max-w-sm w-full mx-auto">
            <div className="mb-5 sm:mb-6">
              <h2 className="text-base sm:text-xl font-bold text-slate-900">
                {isRegister ? 'Create your Pulse account' : 'Sign in to your account'}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {isRegister
                  ? 'Set up your profile and NGN wallet to start saving together.'
                  : 'Enter your username or email to access your wallet and groups.'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`py-2.5 text-xs font-semibold rounded-md transition ${
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
                className={`py-2.5 text-xs font-semibold rounded-md transition ${
                  isRegister
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
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
                      className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-base sm:text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
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
                        autoCapitalize="none"
                        value={username}
                        onChange={(e) =>
                          setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                        }
                        className="w-full h-11 pl-8 pr-3.5 bg-white border border-slate-300 rounded-lg text-base sm:text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
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
                      autoCapitalize="none"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-base sm:text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
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
                    autoCapitalize="none"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-base sm:text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
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
                  className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-base sm:text-sm text-slate-900 focus:outline-none focus:border-[#1D4ED8] transition"
                  placeholder="Minimum 6 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white font-semibold text-sm rounded-lg transition disabled:opacity-50 mt-2 active:scale-[0.99]"
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
