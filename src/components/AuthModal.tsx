import React, { useState } from 'react';
import { X, Bot, Mail, Lock, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isUserMode, setIsUserMode] = useState(true);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent, isGoogle = false) => {
    if (e) e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: isGoogle ? 'user@airecharge.com' : email,
          name: isGoogle ? 'AI Developer' : name,
          mobile: isGoogle ? '' : mobile,
          password: isGoogle ? '' : password,
          provider: isGoogle ? 'google' : 'email',
          isAdminRequest: !isGoogle // Mark if this is a manual admin attempt
        }),
      });

      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
        onClose();
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Lockup */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 to-emerald-400 p-0.5 mx-auto shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Bot className="w-7 h-7 text-cyan-400" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">
              {isUserMode ? 'User Login' : 'Master Admin Login'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isUserMode 
                ? 'Access 20 AI Models with prepaid data packs.' 
                : 'Enter admin credentials to access master control.'}
            </p>
          </div>
        </div>

        {isUserMode ? (
          /* USER MODE: ONLY GOOGLE LOGIN */
          <div className="space-y-6 py-4">
            <button
              type="button"
              onClick={() => handleLogin(undefined, true)}
              disabled={isLoading}
              className="w-full py-4 px-4 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-100 font-bold text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-xl"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
              </svg>
              Sign in with Google
            </button>
            <div className="text-center">
               <p className="text-[11px] text-slate-500">Fast & Secure Automatic Login</p>
            </div>
          </div>
        ) : (
          /* ADMIN MODE: MANUAL FORM */
          <form onSubmit={(e) => handleLogin(e, false)} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Admin Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Master Admin"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@airecharge.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Admin Mobile Number
              </label>
              <div className="relative">
                <ShieldCheck className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="8466062260"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">
                Master Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-extrabold text-xs hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? 'Verifying Admin...' : 'Log In to Admin Panel'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Mode Toggle */}
        <div className="pt-2 border-t border-slate-800 flex justify-center">
          <button
            onClick={() => setIsUserMode(!isUserMode)}
            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider"
          >
            {isUserMode ? 'Switch to Master Admin Access' : 'Switch to Regular User Login'}
          </button>
        </div>

        <div className="text-[10px] text-center text-slate-600">
          By continuing, you agree to AI Recharge Terms & Reverse Proxy Usage Rules.
        </div>

      </div>
    </div>
  );
};
