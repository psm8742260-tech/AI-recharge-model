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
import { Bot, Key, Sparkles, ShieldCheck, Heart, ArrowLeft } from 'lucide-react';

import { getDisplayVersion } from './version';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [receipts, setReceipts] = useState<MagicReceipt[]>([]);
  const [transactions, setTransactions] = useState<RechargeTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'models' | 'playground' | 'analytics' | 'pricing' | 'keys' | 'admin' | 'datapacks' | 'plans'>('models');
  
  const [selectedModelDetail, setSelectedModelDetail] = useState<AIModel | null>(null);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [playgroundModelId, setPlaygroundModelId] = useState<string>('deepseek-v3');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load user data on mount
  const fetchUserData = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setReceipts(data.receipts || []);
          setTransactions(data.transactions || []);
          return true;
        }
      }
      return false;
    } catch (err) {
      console.error('Failed to fetch user state:', err);
      return false;
    }
  };

  useEffect(() => {
    const initiateAutoLogin = async () => {
      const sessionExists = await fetchUserData();
      if (!sessionExists) {
        // Attempt silent re-login if we have previous data
        const storedEmail = localStorage.getItem('airecharge_last_email');
        const storedMobile = localStorage.getItem('airecharge_last_mobile');
        
        if (storedEmail || storedMobile) {
          try {
            const res = await fetch('/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: storedEmail || 'user@airecharge.com',
                mobile: storedMobile || '',
                provider: storedEmail ? 'google' : 'email',
                isAdminRequest: false
              }),
            });
            const data = await res.json();
            if (data.success) {
              setUser(data.user);
            }
          } catch (err) {
            console.error('Silent login failed:', err);
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
          } else if (tab === 'admin' && (!user || !user.isAdmin)) {
            console.warn('Unauthorized admin access attempt');
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenRecharge={() => setIsRechargeOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => {
          setUser(null);
          setIsSidebarOpen(false);
          localStorage.removeItem('airecharge_last_email');
          localStorage.removeItem('airecharge_last_mobile');
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
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-lg font-black text-white flex flex-col leading-tight">
                  AI Recharge <span className="text-cyan-400">Models</span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-cyan-500 text-slate-950 rounded w-fit mt-1">Platform</span>
                </div>
              </div>
              <button 
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-2">
              <button 
                onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'}`}
              >
                <Bot className="w-5 h-5" /> Usage
              </button>
              <button 
                onClick={() => { setActiveTab('keys'); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'keys' ? 'bg-slate-800 text-cyan-400' : 'text-slate-400 hover:bg-slate-850 hover:text-slate-200'}`}
              >
                <Key className="w-5 h-5" /> API keys
              </button>
              <button 
                onClick={() => { setIsRechargeOpen(true); setIsSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-850 hover:text-slate-200 transition-all"
              >
                <Sparkles className="w-5 h-5" /> Top up
              </button>
              <button 
                onClick={() => { setActiveTab('analytics'); setIsSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-850 hover:text-slate-200 transition-all"
              >
                <ShieldCheck className="w-5 h-5" /> Billing
              </button>
              
              <div className="pt-8 space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-850 hover:text-slate-200 transition-all">
                  Docs
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-850 hover:text-slate-200 transition-all">
                  Help & Feedback
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-850 hover:text-slate-200 transition-all">
                  Pricing
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-850 hover:text-slate-200 transition-all">
                  Chat for free
                </button>
              </div>
            </nav>

            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-850/50">
                <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-slate-700" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{user.name}</p>
                </div>
              </div>
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
