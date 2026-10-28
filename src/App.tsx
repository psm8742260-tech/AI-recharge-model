import React, { useEffect, useState } from 'react';
import { UserAccount, MagicReceipt, RechargeTransaction } from './types';
import { AIModel } from './data/modelsData';
import { Navbar } from './components/Navbar';
import { LandingHero } from './components/LandingHero';
import { ModelsGrid } from './components/ModelsGrid';
import { ModelDetailModal } from './components/ModelDetailModal';
import { PaymentGatewayModal } from './components/PaymentGatewayModal';
import { Playground } from './components/Playground';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { AuthModal } from './components/AuthModal';
import { AdminPanel } from './components/AdminPanel';
import { KeysManager } from './components/KeysManager';
import { DataPacks } from './components/DataPacks';
import { SubscriptionPlans } from './components/SubscriptionPlans';
import { ExportModal } from './components/ExportModal';
import { Bot, Key, Sparkles, ShieldCheck, Heart, ArrowLeft, Receipt, LogOut, Settings, BarChart2 } from 'lucide-react';

import { getDisplayVersion } from './version';

const DEFAULT_MASTER_ADMIN: UserAccount = {
  id: 'usr_admin_master',
  email: 'psm8742260@gmail.com',
  name: 'Priya Sharma (Admin)',
  mobile: '8466062260',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
  activePlanId: 'plan-master',
  activePlanName: 'Master Admin Unlimited Access',
  planDurationMonths: 12,
  dataPackMBTotal: 1024000,
  dataPackMBRemaining: 1024000,
  dailyLimitMB: 50000,
  dailyUsedMB: 0,
  lastResetDate: new Date().toISOString().split('T')[0],
  expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  activeApiKey: 'phrs-7f9a2d8e41bc90a57f9a2d8e41bc90a5',
  isAdmin: true,
  keysHistory: [
    {
      key: 'phrs-7f9a2d8e41bc90a57f9a2d8e41bc90a5',
      createdAt: new Date().toISOString(),
      status: 'active'
    }
  ]
};

const DEFAULT_USER: UserAccount = {
  id: 'usr_guest',
  email: 'user@airecharge.com',
  name: 'AI Developer',
  mobile: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
  activePlanId: 'plan-1m',
  activePlanName: '1 Month Starter Pack',
  planDurationMonths: 1,
  dataPackMBTotal: 2048,
  dataPackMBRemaining: 1840.25,
  dailyLimitMB: 800,
  dailyUsedMB: 0,
  lastResetDate: new Date().toISOString().split('T')[0],
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  activeApiKey: 'phrs-user-demo-key',
  isAdmin: false,
  keysHistory: []
};

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem('airecharge_user_account');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.email || parsed.mobile || parsed.id)) {
          return parsed;
        }
      }
      const lastEmail = localStorage.getItem('airecharge_last_email') || '';
      const lastMobile = localStorage.getItem('airecharge_last_mobile') || '';
      if (lastEmail.toLowerCase() === 'psm8742260@gmail.com' || lastMobile === '8466062260') {
        return DEFAULT_MASTER_ADMIN;
      }
    } catch (e) {
      console.error('Failed to parse cached user:', e);
    }
    return DEFAULT_USER;
  });
  const [receipts, setReceipts] = useState<MagicReceipt[]>([]);
  const [transactions, setTransactions] = useState<RechargeTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'models' | 'playground' | 'analytics' | 'pricing' | 'keys' | 'admin' | 'datapacks' | 'plans'>('models');
  const [dashboardSection, setDashboardSection] = useState<'usage' | 'billing'>('usage');
  
  const [selectedModelDetail, setSelectedModelDetail] = useState<AIModel | null>(null);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [playgroundModelId, setPlaygroundModelId] = useState<string>('deepseek-v3');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load user data on mount
  const fetchUserData = async (): Promise<boolean> => {
    try {
      const headers: Record<string, string> = {};
      const saved = localStorage.getItem('airecharge_user_account');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed?.email) headers['x-user-email'] = parsed.email;
          if (parsed?.mobile) headers['x-user-mobile'] = parsed.mobile;
        } catch {}
      }

      const res = await fetch('/api/user/me', { headers });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('airecharge_user_account', JSON.stringify(data.user));
          setReceipts(data.receipts || []);
          setTransactions(data.transactions || []);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.warn('Backend user endpoint unavailable (static hosting mode):', err);
      return false;
    }
  };

  useEffect(() => {
    const initiateAutoLogin = async () => {
      // First check local storage saved account (supports both email & mobile logins)
      const savedAccount = localStorage.getItem('airecharge_user_account');
      if (savedAccount) {
        try {
          const parsed = JSON.parse(savedAccount);
          if (parsed && (parsed.email || parsed.mobile || parsed.id)) {
            setUser(parsed);
          }
        } catch (e) {
          console.error('Failed to parse saved user account:', e);
        }
      }

      const sessionExists = await fetchUserData();
      if (!sessionExists && !savedAccount) {
        // Attempt silent re-login if we have previous credentials
        const storedEmail = localStorage.getItem('airecharge_last_email');
        const storedMobile = localStorage.getItem('airecharge_last_mobile');
        
        if (storedEmail || storedMobile) {
          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: storedEmail || (storedMobile ? `${storedMobile}@airecharge.user` : 'psm8742260@gmail.com'),
                mobile: storedMobile || '',
                provider: storedEmail ? 'gmail' : 'mobile',
                isAdminRequest: false
              }),
            });
            const contentType = res.headers.get('content-type') || '';
            if (res.ok && contentType.includes('application/json')) {
              const data = await res.json();
              if (data && data.success && data.user) {
                setUser(data.user);
                localStorage.setItem('airecharge_user_account', JSON.stringify(data.user));
              }
            }
          } catch (err) {
            console.warn('Silent login check:', err);
          }
        }
      }
    };

    initiateAutoLogin();
  }, []);

  const handleRechargeSuccess = ({
    user: updatedUser,
    generatedKey,
  }: {
    user: UserAccount;
    generatedKey: string;
  }) => {
    setUser(updatedUser);
    fetchUserData();
  };

  const handleRegenerateKey = async () => {
    try {
      const res = await fetch('/api/keys/regenerate', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to regenerate key:', err);
    }
  };

  const handleReceiptGenerated = (newReceipt: MagicReceipt) => {
    setReceipts((prev) => [newReceipt, ...prev]);
    // Refresh user remaining data
    fetchUserData();
  };

  return (
    <div className="min-h-screen flex flex-col bg-transparent text-slate-900 font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'analytics') {
            setIsSidebarOpen(true);
          } else if (tab === 'pricing') {
            setIsRechargeOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenRecharge={() => setIsRechargeOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenExportZip={() => setIsExportOpen(true)}
        onLogout={() => {
          setUser(null);
          setIsSidebarOpen(false);
          localStorage.removeItem('airecharge_last_email');
          localStorage.removeItem('airecharge_last_mobile');
          localStorage.removeItem('airecharge_user_account');
        }}
      />

      {/* Sidebar Navigation */}
      {isSidebarOpen && user && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative w-72 h-full bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg font-black text-white flex flex-col leading-tight">
                  AI Recharge <span className="text-cyan-400">Models</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-cyan-500 text-slate-950 rounded w-fit mt-1">Platform</span>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            {/* USER PROFILE CARD AT TOP (AS REQUESTED BY ADMIN GARU) */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/40">
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-850/80 border border-slate-800 shadow-sm">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-11 h-11 rounded-full border-2 border-cyan-500/40 object-cover shadow-sm shrink-0" 
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-bold text-white truncate">{user.name}</p>
                    {user.isAdmin && (
                      <span className="text-[9px] px-1.5 py-0.2 bg-emerald-500 text-slate-950 font-black rounded-full shrink-0">ADMIN</span>
                    )}
                  </div>
                  <p className="text-[11px] text-cyan-400 font-mono truncate">{user.email || user.mobile}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <span className="text-[9px] px-1.5 py-0.5 bg-slate-800 text-cyan-300 font-bold rounded truncate">
                      {user.activePlanName || 'Prepaid Pack'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* THE 4 CORE TAILORED NAVIGATION FEATURES */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {/* 1. Usage */}
              <button 
                onClick={() => { setDashboardSection('usage'); setActiveTab('analytics'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'analytics' && dashboardSection === 'usage' 
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Bot className="w-5 h-5 text-cyan-400" /> 
                <div className="flex flex-col text-left">
                  <span>Usage (వినియోగం & ఎంబీ)</span>
                  <span className="text-[10px] text-slate-500 font-normal">ఎంత వాడారు • బ్యాలెన్స్ ఎంబీ</span>
                </div>
              </button>

              {/* 2. API Keys */}
              <button 
                onClick={() => { setActiveTab('keys'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'keys' 
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Key className="w-5 h-5 text-cyan-400" /> 
                <div className="flex flex-col text-left">
                  <span>API keys (కీలు & లాక్)</span>
                  <span className="text-[10px] text-slate-500 font-normal">పర్సనల్ కీ • లాక్ స్టేటస్</span>
                </div>
              </button>

              {/* 3. Top up */}
              <button 
                onClick={() => { setIsRechargeOpen(true); setIsSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-emerald-400" /> 
                <div className="flex flex-col text-left">
                  <span>Top up (రీచార్జ్ ప్యాక్స్)</span>
                  <span className="text-[10px] text-slate-500 font-normal">డేటా ప్యాక్స్ • తక్షణ టాప్-అప్</span>
                </div>
              </button>

              {/* 4. Billing */}
              <button 
                onClick={() => { setDashboardSection('billing'); setActiveTab('analytics'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'analytics' && dashboardSection === 'billing' 
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-md' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Receipt className="w-5 h-5 text-cyan-400" /> 
                <div className="flex flex-col text-left">
                  <span>Billing (బిల్లింగ్ & రసీదులు)</span>
                  <span className="text-[10px] text-slate-500 font-normal">మ్యాజిక్ రసీదులు • ఇన్‌వాయిస్‌లు</span>
                </div>
              </button>
            </nav>

            {/* BOTTOM SECTION: SETTINGS & SERVER CONNECTION */}
            <div className="p-4 border-t border-slate-800 space-y-2 bg-slate-950/30">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                <div className="flex items-center justify-between text-cyan-400 font-bold mb-1">
                  <span>Gateway Status</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">ONLINE</span>
                </div>
                <div className="font-mono text-[10px] text-slate-300 truncate">
                  arm.phrscrowd.online
                </div>
              </div>

              <button
                onClick={() => {
                  setUser(null);
                  setIsSidebarOpen(false);
                  localStorage.removeItem('airecharge_last_email');
                  localStorage.removeItem('airecharge_last_mobile');
                  localStorage.removeItem('airecharge_user_account');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/30 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>లాగౌట్ (Logout)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
        
        {/* If user not logged in & on landing tab, show hero first */}
        {!user && activeTab === 'models' && (
          <LandingHero
            onOpenAuth={() => setIsAuthOpen(true)}
            onExploreModels={() => setActiveTab('models')}
            onOpenRecharge={() => setIsRechargeOpen(true)}
          />
        )}

        {/* Tab 1: AI Models Grid */}
        {activeTab === 'models' && (
          <ModelsGrid
            onSelectModel={(model) => setSelectedModelDetail(model)}
            onOpenRecharge={() => setIsRechargeOpen(true)}
            onOpenDataPacks={() => setActiveTab('datapacks')}
          />
        )}

        {/* Tab 2: API Playground / Reverse Proxy Gateway Sandbox */}
        {activeTab === 'playground' && (
          <Playground
            user={user}
            initialModelId={playgroundModelId}
            onOpenRecharge={() => setIsRechargeOpen(true)}
            onReceiptGenerated={handleReceiptGenerated}
            onBack={() => setActiveTab('models')}
          />
        )}

        {/* Tab 3: Usage Analytics & Magic Receipts */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard
            user={user}
            receipts={receipts}
            transactions={transactions}
            onOpenRecharge={() => setIsRechargeOpen(true)}
            onRegenerateKey={handleRegenerateKey}
            onBack={() => setActiveTab('models')}
            initialSection={dashboardSection}
          />
        )}

        {/* Tab 4: Keys List */}
        {activeTab === 'keys' && (
          <KeysManager
            user={user}
            onRegenerateKey={handleRegenerateKey}
            onBack={() => setActiveTab('models')}
          />
        )}

        {/* Tab 5: Admin Control Panel */}
        {activeTab === 'admin' && (
          <AdminPanel 
            user={user} 
            onBack={() => setActiveTab('models')} 
            onOpenExportZip={() => setIsExportOpen(true)}
            onLoginSuccess={(loggedInUser) => setUser(loggedInUser)}
          />
        )}

        {/* Tab 6: Data Packs Viewer */}
        {activeTab === 'datapacks' && (
          <DataPacks
            onOpenRecharge={() => setIsRechargeOpen(true)}
            onBack={() => setActiveTab('models')}
          />
        )}

        {/* Tab 7: Subscription Plans */}
        {activeTab === 'plans' && (
          <SubscriptionPlans
            onOpenRecharge={() => setIsRechargeOpen(true)}
            onBack={() => setActiveTab('models')}
          />
        )}

      </main>
      
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-200/50 border border-slate-300 text-[10px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {getDisplayVersion()}
        </div>
      </footer>


      {/* Modals */}
      <ModelDetailModal
        model={selectedModelDetail}
        onClose={() => setSelectedModelDetail(null)}
        onOpenRecharge={() => setIsRechargeOpen(true)}
        onOpenPlaygroundWithModel={(modelId) => {
          setPlaygroundModelId(modelId);
          setActiveTab('playground');
        }}
      />

      <PaymentGatewayModal
        isOpen={isRechargeOpen}
        onClose={() => setIsRechargeOpen(false)}
        user={user}
        onRechargeSuccess={handleRechargeSuccess}
        onOpenPlayground={() => setActiveTab('playground')}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          if (loggedInUser.email) localStorage.setItem('airecharge_last_email', loggedInUser.email);
          if (loggedInUser.mobile) localStorage.setItem('airecharge_last_mobile', loggedInUser.mobile);
          setActiveTab('models');
        }}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

    </div>
  );
}
