import React from 'react';
import { Bot, Zap, LogOut, Lock, Database, Sparkles, Menu } from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  user: UserAccount | null;
  activeTab: 'models' | 'playground' | 'analytics' | 'pricing' | 'keys' | 'admin' | 'datapacks' | 'plans';
  setActiveTab: (tab: 'models' | 'playground' | 'analytics' | 'pricing' | 'keys' | 'admin' | 'datapacks' | 'plans') => void;
  onOpenRecharge: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenRecharge,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navbar Layout: Brand Header with Actions next to HYBRID ENGINE & PWA */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
          
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('models'); }} className="flex items-center gap-3.5 group">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-xl shadow-cyan-500/30 shrink-0 overflow-hidden">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
                  <img src="/app_logo.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
              </div>
              {user && (
                <div className="flex items-center gap-1.5 mt-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveTab('analytics'); }} 
                    className="w-5 h-5 rounded-full border border-slate-300 overflow-hidden hover:border-cyan-500 transition-all shadow-sm shrink-0"
                    title="యూజర్ ప్రొఫైల్ / ఎనలిటిక్స్"
                  >
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  </button>
                  <div className="text-[9px] text-cyan-600 font-mono font-bold bg-white/80 px-1.5 py-0.5 rounded border border-cyan-500/20 max-w-[70px] sm:max-w-[90px] truncate shadow-sm">
                    {user.email && user.email !== 'user@airecharge.com' ? user.email : user.mobile || user.email}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-slate-900 leading-tight">
                AI RECHARGE MODELS
              </span>
            </div>
          </a>

          {/* Gateway badge with action buttons stacked directly underneath */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 bg-cyan-500 text-slate-950 rounded shadow-sm">
              Gateway
            </span>
            <div className="flex items-center gap-2">
              {user && user.isAdmin && (
                <button 
                  onClick={() => setActiveTab('admin' as any)} 
                  className="p-1.5 bg-slate-900 border text-cyan-400 rounded-lg animate-hybrid-engine-glow transition-all shadow-md"
                  title="హైబ్రిడ్ ఇంజన్ అనుసంధాన అడ్మిన్ ప్యానెల్"
                >
                  <Lock className="w-5 h-5" />
                </button>
              )}
              {user ? (
                <>
                  <button 
                    onClick={() => setActiveTab('analytics')} 
                    className="p-2 text-emerald-600 hover:text-emerald-700 transition-all font-bold"
                    title="బిల్డింగ్ సెక్షన్ (మూడు గీతలు)"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={onOpenAuth} 
                    className="p-1.5 text-slate-700 hover:text-emerald-600 transition-all"
                    title="లాగిన్ పేజీకి వెళ్ళండి"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button 
                  onClick={onOpenAuth} 
                  className="px-3 py-1 text-xs font-extrabold bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-lg transition-all shadow-md"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};
