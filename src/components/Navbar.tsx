import React from 'react';
import { Bot, Zap, LogOut, Lock, Database, Sparkles } from 'lucide-react';
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
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/60 shadow-xl shadow-slate-950/40 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navbar Layout: Brand Header with Actions next to HYBRID ENGINE & PWA */}
        <div className="flex items-center justify-between gap-4">
          
          <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('models'); }} className="flex items-center gap-3.5 group">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-xl shadow-cyan-500/30 shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-7 h-7 sm:w-9 sm:h-9 text-cyan-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tighter text-white flex items-center gap-2">
                AI Recharge Models
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 bg-cyan-500 text-slate-950 rounded shadow-sm">Gateway</span>
              </span>
              
              {/* Row next to HYBRID ENGINE & PWA where 3 red dots are marked */}
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  HYBRID ENGINE & PWA
                </span>

                <div className="flex items-center gap-2 ml-2.5 sm:ml-3">
                  {user && user.isAdmin && (
                    <button 
                      onClick={() => setActiveTab('admin' as any)} 
                      className="p-1.5 bg-slate-900 border text-cyan-400 rounded-lg animate-hybrid-engine-glow transition-all shadow-md"
                      title="హైబ్రిడ్ ఇంజన్ అనుసంధాన అడ్మిన్ ప్యానెల్ (5 రంగుల గ్లో)"
                    >
                      <Lock className="w-4 h-4" />
                    </button>
                  )}
                  {user ? (
                    <>
                      <button 
                        onClick={() => setActiveTab('analytics')} 
                        className="w-7 h-7 rounded-full border border-slate-700 overflow-hidden hover:border-cyan-400 transition-all shadow-md"
                        title="యూజర్ ప్రొఫైల్ / ఎనలిటిక్స్"
                      >
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      </button>
                      <button 
                        onClick={onLogout} 
                        className="p-1.5 text-slate-400 hover:text-red-400 transition-all"
                        title="లాగౌట్"
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
          </a>

        </div>
      </div>
    </header>
  );
};
