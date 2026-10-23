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
import { Bot, Key, Sparkles, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [receipts, setReceipts] = useState<MagicReceipt[]>([]);
  const [transactions, setTransactions] = useState<RechargeTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'models' | 'playground' | 'analytics' | 'pricing' | 'keys' | 'admin' | 'datapacks' | 'plans'>('models');
  
  const [selectedModelDetail, setSelectedModelDetail] = useState<AIModel | null>(null);
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [playgroundModelId, setPlaygroundModelId] = useState<string>('deepseek-v3');

  // Load user data on mount
  const fetchUserData = async () => {
    try {
      const res = await fetch('/api/user/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setReceipts(data.receipts || []);
        setTransactions(data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to fetch user state:', err);
    }
  };

  useEffect(() => {
    fetchUserData();
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
    <div className="min-h-screen flex flex-col bg-slate-900/60 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'pricing') {
            setIsRechargeOpen(true);
          } else if (tab === 'admin' && (!user || !user.isAdmin)) {
            // Do nothing or show alert
            console.warn('Unauthorized admin access attempt');
          } else {
            setActiveTab(tab);
          }
        }}
        onOpenRecharge={() => setIsRechargeOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={() => setUser(null)}
      />

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
          <AdminPanel user={user} onBack={() => setActiveTab('models')} />
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

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-slate-300">AI Recharge Models</span>
            <span>· Prepaid AI Model Data Packs & Reverse Proxy Gateway</span>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <span>20 AI Models</span>
            <span>·</span>
            <span className="font-mono text-cyan-400">phrs-</span>
            <span>·</span>
            <span>Magic Receipts</span>
          </div>
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
          setActiveTab('models');
        }}
      />

    </div>
  );
}
