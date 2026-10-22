import React from 'react';
import { Bot, Zap, Shield, Key, BarChart3, Terminal, Sparkles, User, LogOut, Lock } from 'lucide-react';
import { UserAccount } from '../types';

interface NavbarProps {
  user: UserAccount | null;
  activeTab: 'models' | 'playground' | 'analytics' | 'pricing' | 'keys' | 'admin';
  setActiveTab: (tab: 'models' | 'playground' | 'analytics' | 'pricing' | 'keys' | 'admin') => void;
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
  const remainingGB = user ? (user.dataPackMBRemaining / 1024).toFixed(2) : '0.00';
  const totalGB = user ? (user.dataPackMBTotal / 1024).toFixed(1) : '0.0';
  const percentLeft = user ? Math.min(100, Math.max(0, (user.dataPackMBRemaining / user.dataPackMBTotal) * 100)) : 0;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 shadow-xl shadow-slate-950/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-24 flex items-center justify-between gap-4">
        
        {/* Zone 1: Brand Title with prominent Robot Icon */}
        <div className="flex items-center gap-4 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('models');
            }}
            className="flex items-center gap-3.5 group"
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-0.5 shadow-xl shadow-cyan-500/30 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-9 h-9 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black tracking-tighter text-white flex items-center gap-2 whitespace-nowrap">
                AI Recharge Models
                <span className="text-[10px] uppercase font-black tracking-widest px-2 py-0.5 bg-cyan-500 text-slate-950 rounded shadow-sm">
                  Gateway
                </span>
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Hybrid Engine v2.1</span>
            </div>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => setActiveTab('models')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'models'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Zap className="w-4 h-4" />
            20 AI Models
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'playground'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            API Playground
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Usage & Receipts
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'pricing'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Recharge Packs
          </button>

          <button
            onClick={() => setActiveTab('keys')}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
              activeTab === 'keys'
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Key className="w-4 h-4" />
            API Keys
          </button>
        </nav>

        {/* Zone 3: Quota Balance & User Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {user && user.isAdmin && (
            <button
              onClick={() => setActiveTab('admin' as any)}
              className={`p-2.5 rounded-xl transition-all shadow-lg flex items-center gap-2 ${
                activeTab === ('admin' as any)
                  ? 'bg-cyan-500 text-slate-950 border border-cyan-400'
                  : 'bg-slate-900 text-cyan-400 hover:text-cyan-300 hover:bg-slate-800 border border-slate-800'
              }`}
              title="మాస్టర్ అడ్మిన్ ప్యానెల్"
            >
              <Lock className="w-5 h-5" />
              <span className="text-[10px] font-extrabold uppercase hidden lg:inline">అడ్మిన్ యాక్సెస్</span>
            </button>
          )}

          {user ? (
            <>

              {/* Quota Pack Pill Meter */}
              <button
                onClick={onOpenRecharge}
                className="hidden sm:flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all group shadow-inner"
                title="Click to recharge AI data pack"
              >
                <div className="flex flex-col text-right">
                  <div className="text-[11px] font-black text-slate-400 flex items-center gap-1.5 justify-end uppercase tracking-tighter">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    PE Balance
                  </div>
                  <div className="text-lg font-black text-white font-mono leading-none mt-0.5">
                    <span className={user.dataPackMBRemaining < 300 ? 'text-amber-400' : 'text-cyan-400'}>
                      {remainingGB} GB
                    </span>
                  </div>
                </div>

                <div className="w-12 h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      percentLeft < 20
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-cyan-500 to-emerald-400'
                    }`}
                    style={{ width: `${percentLeft}%` }}
                  />
                </div>

                <div className="px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-black group-hover:bg-cyan-400 transition-colors whitespace-nowrap shadow-lg shadow-cyan-500/20">
                  RECHARGE
                </div>
              </button>

              {/* User Avatar */}
              <div className="relative group flex items-center gap-1">
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="w-10 h-10 rounded-full border border-slate-700 p-0.5 hover:border-cyan-400 transition-colors"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full rounded-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </button>
                <button
                  onClick={onLogout}
                  className="p-2.5 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 text-xs font-bold rounded-xl text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all shadow-md shadow-cyan-500/20 whitespace-nowrap flex items-center gap-2"
            >
              <User className="w-4 h-4" />
              Sign In / Sign Up
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
