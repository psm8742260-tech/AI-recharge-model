import React, { useState } from 'react';
import { X, Bot, Mail, Lock, User, ShieldCheck, ArrowRight, Sparkles, ArrowLeft, Smartphone, Loader2, CheckCircle2 } from 'lucide-react';
import { UserAccount } from '../types';

export const GmailIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M45 16.2L40 18.95L35 23.7V40H42C43.657 40 45 38.657 45 37V16.2Z" fill="#34A853"/>
    <path d="M3 16.2L6.658 19.033L13 23.7V40H6C4.343 40 3 38.657 3 37V16.2Z" fill="#4285F4"/>
    <path d="M35 11.2L24 19.45L13 11.2L12 17L13 23.7L24 31.95L35 23.7L36 17L35 11.2Z" fill="#EA4335"/>
    <path d="M3 12.298V16.2L13 23.7V11.2L9.876 8.859C8.132 7.551 5.638 8.085 4.33 9.828C3.877 10.432 3.398 11.348 3 12.298Z" fill="#C5221F"/>
    <path d="M45 12.298V16.2L35 23.7V11.2L38.124 8.859C39.868 7.551 42.362 8.085 43.67 9.828C44.123 10.432 44.602 11.348 45 12.298Z" fill="#FBBC04"/>
  </svg>
);

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isMobileInputActive, setIsMobileInputActive] = useState(false);
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auto-submit mobile login when 10 digits are entered
  React.useEffect(() => {
    if (mobile.length === 10 && !isLoading) {
      handleLogin(undefined, false);
    }
  }, [mobile]);

  // Auto-submit email login when valid email ending with .com is entered
  React.useEffect(() => {
    if (email.includes('@') && email.includes('.') && email.length > 8 && !isLoading) {
      const timer = setTimeout(() => {
        handleLogin(undefined, true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [email]);

  if (!isOpen) return null;

  const handleLogin = async (e?: React.FormEvent, isGoogle = false) => {
    if (e) e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    const inputEmail = (isGoogle ? email : (isMobileInputActive ? '' : email)).trim();
    const inputMobile = isMobileInputActive ? mobile.trim() : '';

    const AUTHORIZED_ADMIN_EMAILS = ['psm8742260@gmail.com'];
    const AUTHORIZED_ADMIN_MOBILES = ['8466062260'];

    const isAdmin = AUTHORIZED_ADMIN_EMAILS.includes(inputEmail.toLowerCase()) || AUTHORIZED_ADMIN_MOBILES.includes(inputMobile);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inputEmail || 'user@airecharge.com',
          name: isGoogle ? (inputEmail.split('@')[0] || 'User') : 'AI Developer',
          mobile: inputMobile,
          provider: isGoogle ? 'google' : 'email',
          isAdminRequest: false
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.user) {
          if (inputEmail) localStorage.setItem('airecharge_last_email', inputEmail);
          if (inputMobile) localStorage.setItem('airecharge_last_mobile', inputMobile);
          localStorage.setItem('airecharge_user_account', JSON.stringify(data.user));
          onLoginSuccess(data.user);
          onClose();
          setIsLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend server auth endpoint unavailable, falling back to instant client session:', err);
    }

    // Fail-safe client session creation (Works on static hosting, cPanel & VPS)
    const activeApiKey = 'phrs-' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const fallbackUser: UserAccount = {
      id: `usr_${Date.now()}`,
      email: inputEmail || (inputMobile ? '' : 'user@airecharge.com'),
      name: inputEmail ? (inputEmail.split('@')[0] || 'AI Developer') : (inputMobile ? `User ${inputMobile.slice(-4)}` : 'AI Developer'),
      mobile: inputMobile || '',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      activePlanId: 'plan-1m',
      activePlanName: '1 Month Starter Pack',
      planDurationMonths: 1,
      dataPackMBTotal: 2048,
      dataPackMBRemaining: 1840.25,
      dailyLimitMB: 800,
      dailyUsedMB: 124.75,
      lastResetDate: new Date().toISOString().split('T')[0],
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      activeApiKey: activeApiKey,
      isAdmin: isAdmin, // Strictly true ONLY for psm8742260@gmail.com or 8466062260
      keysHistory: [
        {
          key: activeApiKey,
          createdAt: new Date().toISOString(),
          status: 'active',
        },
      ],
    };

    if (inputEmail) localStorage.setItem('airecharge_last_email', inputEmail);
    if (inputMobile) localStorage.setItem('airecharge_last_mobile', inputMobile);
    localStorage.setItem('airecharge_user_account', JSON.stringify(fallbackUser));

    onLoginSuccess(fallbackUser);
    onClose();
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-4 sm:p-6 relative shadow-2xl space-y-4 text-slate-900">
        
        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-lg"
          title="మళ్ళీ వెనక్కి వెళ్ళండి"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Modal Brand Lockup */}
        <div className="text-center space-y-4">
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-cyan-400 via-sky-400 to-emerald-400 p-0.5 mx-auto shadow-2xl shadow-cyan-500/25 overflow-hidden">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center overflow-hidden">
              <img src="/app_logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight mt-2">
              AI RECHARGE MODELS
            </h2>
          </div>
        </div>

        {/* UNIFIED LOGIN FORM */}
        <form onSubmit={(e) => handleLogin(e, !isMobileInputActive)} className="space-y-4 py-2">
          <div className="relative group">
            {!isMobileInputActive ? (
              <div className="space-y-2">
                <div className="relative">
                  {/* Left: Gmail Icon */}
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                    <GmailIcon className="w-6 h-6 shrink-0" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter Gmail Address"
                    className="w-full bg-slate-950 border-2 border-cyan-500/30 rounded-xl pl-12 pr-12 py-3 text-sm font-bold text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 shadow-lg transition-colors"
                  />
                  {/* Right: Loading Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <Loader2 className={`w-5 h-5 text-cyan-400 ${isLoading ? 'animate-spin' : 'animate-[spin_4s_linear_infinite] opacity-75'}`} />
                  </div>
                </div>
                <p className="text-[10px] text-center text-slate-600 font-medium">
                  జిమెయిల్ ఐడి టైప్ చేయగానే ఆటోమేటిక్‌గా వెరిఫై అవుతుంది
                </p>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative">
                  {/* Left: Mobile Icon */}
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-cyan-400 shrink-0" />
                  </div>
                  <input
                    type="tel"
                    autoFocus
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="Enter 10-digit Mobile Number"
                    className="w-full bg-slate-950 border-2 border-cyan-500/50 rounded-xl pl-12 pr-12 py-3 text-sm text-center font-black tracking-[0.2em] text-cyan-400 placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-lg shadow-cyan-500/10"
                  />
                  {/* Right: Loading Icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
                    <Loader2 className={`w-5 h-5 text-cyan-400 ${isLoading ? 'animate-spin' : 'animate-[spin_4s_linear_infinite] opacity-75'}`} />
                  </div>
                </div>
                <p className="text-[10px] text-center text-cyan-600 font-bold uppercase tracking-widest">
                  Auto-verifying number...
                </p>
              </div>
            )}
          </div>

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={isLoading || (!email && !mobile)}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500 hover:from-cyan-400 hover:via-sky-400 hover:to-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-40 transition-all active:scale-[0.98] cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                లాగిన్ అవుతోంది...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                లాగిన్ అవ్వండి (Submit Login)
              </>
            )}
          </button>
          
          <div className="flex flex-col items-center gap-4 pt-1">
            <div className="w-full flex items-center gap-4">
              <div className="h-px bg-slate-200 flex-1"></div>
              <button
                type="button"
                onClick={() => {
                  setIsMobileInputActive(!isMobileInputActive);
                  setMobile('');
                  setEmail('');
                }}
                className="w-11 h-11 rounded-2xl bg-slate-950 border-2 border-cyan-500/40 hover:border-cyan-400 flex items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all shadow-xl shadow-cyan-500/15 group cursor-pointer"
                title={isMobileInputActive ? 'Switch to Gmail Login' : 'Switch to Mobile Login'}
              >
                {isMobileInputActive ? (
                  <GmailIcon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                ) : (
                  <Smartphone className="w-6 h-6 group-hover:scale-110 transition-transform text-cyan-400" />
                )}
              </button>
              <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <p className="text-[11px] text-center text-slate-600 font-semibold flex items-center gap-1.5 justify-center">
              {isMobileInputActive ? (
                <>
                  <GmailIcon className="w-4 h-4 inline shrink-0" />
                  <span>జిమెయిల్ ద్వారా లాగిన్ అవ్వడానికి ఐకాన్ క్లిక్ చేయండి</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-4 h-4 inline text-cyan-600 shrink-0" />
                  <span>మొబైల్ నంబర్ తో లాగిన్ అవ్వడానికి ఐకాన్ క్లిక్ చేయండి</span>
                </>
              )}
            </p>
          </div>
        </form>

      </div>
    </div>
  );
};

