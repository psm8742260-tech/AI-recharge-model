import React, { useState, useEffect } from 'react';
import { Shield, Zap, Sparkles, Settings, Database, Activity, Save, Plus, Trash2, ShieldAlert, Cpu, ShieldCheck, ArrowLeft, CreditCard, QrCode, Upload } from 'lucide-react';
import { SubscriptionPlan, TopUpPack } from '../data/plansData';
import { UserAccount } from '../types';

import { getDisplayVersion } from '../version';

interface AdminPanelProps {
  user: UserAccount | null;
  onBack: () => void;
}

interface AdminConfig {
  gatewayName: string;
  tokenDeductionMultiplier: number;
  defaultDailyLimitMB: number;
  isMaintenanceMode: boolean;
  isPaymentEnabled: boolean;
  hybridEngineStatus: string;
  adminEmail: string;
  masterPin?: string;
  upiId?: string;
  qrCodeUrl?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onBack }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);

  if (!user || !user.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-white">Access Denied</h2>
        <p className="text-slate-400 text-sm">You do not have administrative privileges.</p>
      </div>
    );
  }
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [topups, setTopups] = useState<TopUpPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Security Form States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [masterPin, setMasterPin] = useState('');

  // QR Code File Upload Ref & Handler
  const qrFileInputRef = React.useRef<HTMLInputElement>(null);

  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('దయచేసి సరైన ఫోటో లేదా ఇమేజ్ ఫైల్ మాత్రమే ఎంచుకోండి (Please select a valid image file).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('ఇమేజ్ సైజు 10MB కంటే తక్కువగా ఉండాలి (Image size must be under 10MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && config) {
        setConfig({ ...config, qrCodeUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (activeTab === 2) fetchUsers();
    if (activeTab === 3) fetchReceipts();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      setConfig(data.config);
      setPlans(data.plans);
      setTopups(data.topups);
      setAdminEmail(data.config.adminEmail || '');
      setAdminMobile(data.config.adminMobile || '');
      setAdminPassword(data.config.adminPassword || '');
      setMasterPin(data.config.masterPin || '');
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchReceipts = async () => {
    try {
      const res = await fetch('/api/admin/receipts');
      const data = await res.json();
      setReceipts(data.receipts);
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
    }
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      alert('System settings updated successfully!');
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePlan = async (plan: SubscriptionPlan) => {
    setIsSaving(true);
    try {
      await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });
      alert(`${plan.name} ప్లాన్ విజయవంతంగా సేవ్ చేయబడింది!`);
    } catch (err) {
      console.error('Failed to save plan:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async () => {
    setIsSaving(true);
    try {
      await fetch('/api/admin/security', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminEmail, adminMobile, adminPassword, masterPin }),
      });
      alert('Security settings updated successfully!');
    } catch (err) {
      console.error('Failed to save security:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePlan = (id: string, field: keyof SubscriptionPlan, value: any) => {
    setPlans(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 text-sm font-medium">Loading Admin Core...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-lg"
              title="మళ్ళీ వెనక్కి వెళ్ళండి"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            {/* Admin Access Toggle */}
            {config && (
              <button
                onClick={async () => {
                  const newConfig = { ...config, isPaymentEnabled: !config.isPaymentEnabled };
                  setConfig(newConfig);
                  setIsSaving(true);
                  try {
                    await fetch('/api/admin/config', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ config: newConfig }),
                    });
                  } finally {
                    setIsSaving(false);
                  }
                }}
                className={`p-2 rounded-lg border transition-all shadow-lg flex items-center justify-center ${
                  !config.isPaymentEnabled 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
                }`}
                title={config.isPaymentEnabled ? "అడ్మిన్ యాక్సెస్ ఆన్ చేయండి" : "అడ్మిన్ యాక్సెస్ ఆఫ్ చేయండి"}
              >
                <ShieldCheck className={`w-4 h-4 ${!config.isPaymentEnabled ? 'animate-pulse' : ''}`} />
              </button>
            )}
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Master Control Admin Panel
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Gateway Management
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure token economics, recharge plans, and system-level parameters.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {getDisplayVersion()}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full overflow-x-auto">
        <button
          onClick={() => setActiveTab(0)}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 0 ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          PE Money System
        </button>
        <button
          onClick={() => setActiveTab(1)}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 1 ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          System Settings
        </button>
        <button
          onClick={() => setActiveTab(2)}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 2 ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4" />
          PWA & TWA Support
        </button>
        <button
          onClick={() => setActiveTab(3)}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 3 ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4" />
          User Database
        </button>
        <button
          onClick={() => setActiveTab(4)}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 4 ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Payment Config
        </button>
        <button
          onClick={() => setActiveTab(5)}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 5 ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Security
        </button>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {/* Tab 0: Recharge Management */}
        {activeTab === 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="p-6 rounded-2xl glass-panel space-y-4 border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">PE {plan.name}</h3>
                    <div className="p-1 rounded bg-slate-800 text-[10px] font-mono text-cyan-400">{plan.id}</div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">ధర (Price INR)</label>
                      <input
                        type="number"
                        value={plan.priceINR}
                        onChange={(e) => updatePlan(plan.id, 'priceINR', parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">డేటా ప్యాక్ (Data Pack GB)</label>
                      <input
                        type="number"
                        value={plan.dataPackGB}
                        onChange={(e) => {
                          const gb = parseFloat(e.target.value);
                          updatePlan(plan.id, 'dataPackGB', gb);
                          updatePlan(plan.id, 'dataPackMB', gb * 1024);
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">డైలీ లిమిట్ (Daily Limit MB)</label>
                      <input
                        type="number"
                        value={plan.dailyLimitMB}
                        onChange={(e) => updatePlan(plan.id, 'dailyLimitMB', parseInt(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">మొత్తం రిక్వెస్ట్లు (Total Requests)</label>
                      <input
                        type="text"
                        value={plan.customField1 || ''}
                        onChange={(e) => updatePlan(plan.id, 'customField1', e.target.value)}
                        placeholder="ఉదా: 5000"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">రిక్వెస్ట్ కి అక్షరాలు (Chars per Request)</label>
                      <input
                        type="text"
                        value={plan.customField2 || ''}
                        onChange={(e) => updatePlan(plan.id, 'customField2', e.target.value)}
                        placeholder="ఉదా: 4 సంఖ్యలు"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end">
                    <button
                      onClick={() => handleSavePlan(plan)}
                      disabled={isSaving}
                      className="px-5 py-2 rounded-lg bg-cyan-500 text-slate-950 text-xs font-extrabold hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-cyan-500/10"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSaving ? 'Saving...' : 'సేవ్'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* Tab 1: System Settings */}
        {activeTab === 1 && config && (
          <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 rounded-2xl glass-panel space-y-6 border-slate-700/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Gateway Instance Name</label>
                  <input
                    type="text"
                    value={config.gatewayName}
                    onChange={(e) => setConfig({ ...config, gatewayName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Hybrid Engine Status</label>
                  <input
                    type="text"
                    value={config.hybridEngineStatus}
                    onChange={(e) => setConfig({ ...config, hybridEngineStatus: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed outline-none"
                    disabled
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Token MB Multiplier</label>
                  <input
                    type="number"
                    step="0.05"
                    value={config.tokenDeductionMultiplier}
                    onChange={(e) => setConfig({ ...config, tokenDeductionMultiplier: parseFloat(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">Multiplies the calculated MB deduction for each request.</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Default Daily Limit (MB)</label>
                  <input
                    type="number"
                    value={config.defaultDailyLimitMB}
                    onChange={(e) => setConfig({ ...config, defaultDailyLimitMB: parseInt(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${config.isMaintenanceMode ? 'bg-amber-500 animate-pulse' : 'bg-slate-700'}`} />
                  <div>
                    <h4 className="text-xs font-bold text-white">Maintenance Mode</h4>
                    <p className="text-[10px] text-slate-500">Enable to block all gateway proxy requests.</p>
                  </div>
                </div>
                <button
                  onClick={() => setConfig({ ...config, isMaintenanceMode: !config.isMaintenanceMode })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${config.isMaintenanceMode ? 'bg-amber-500' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${config.isMaintenanceMode ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-extrabold hover:bg-cyan-400 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Updating Core...' : 'Sync System Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: PWA & TWA Support */}
        {activeTab === 2 && (
          <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 rounded-2xl glass-panel space-y-6 border-slate-700/50">
              <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">PWA & TWA Future Update</h3>
                  <p className="text-xs text-slate-400">Manage Progressive Web App and Trusted Web Activity status.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">PWA Status</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-white">Configured</span>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase">TWA AssetLinks</div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-bold text-white">Active</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-cyan-400">PWA Manifest Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">App Name</span>
                    <span className="text-slate-300 font-mono">AI Recharge Models Gateway</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">Display Mode</span>
                    <span className="text-slate-300 font-mono">Standalone</span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-slate-500">AssetLinks Scope</span>
                    <span className="text-slate-300 font-mono">com.airecharge.gateway</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-amber-500 mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">Hybrid Engine Alert</span>
                </div>
                <p className="text-[10px] text-amber-200/80 leading-relaxed">
                  The PWA and TWA configurations are locked to the Hybrid Engine. Any manual changes to `vite.config.ts` or `assetlinks.json` require Admin Master PIN validation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: User Database */}
        {activeTab === 3 && (
          <div className="glass-panel overflow-hidden border-slate-700/50 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">User / ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Data Remaining</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} className="w-8 h-8 rounded-full border border-slate-700" alt="" />
                          <div>
                            <div className="text-xs font-bold text-white">{u.name}</div>
                            <div className="text-[10px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-300">{u.activePlanName}</div>
                        <div className="text-[10px] text-slate-500">ID: {u.activePlanId}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-cyan-400">
                        {(u.dataPackMBRemaining / 1024).toFixed(2)} / {(u.dataPackMBTotal / 1024).toFixed(1)} GB
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isAdmin ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                          {u.isAdmin ? 'ADMIN' : 'ACTIVE'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Payment Config */}
        {activeTab === 4 && config && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* QR Code & UPI Config */}
            <div className="p-6 rounded-2xl glass-panel space-y-6 border-slate-700/50 max-w-2xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <QrCode className="w-4 h-4 text-cyan-400" />
                QR Code & UPI Gateway Settings
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1.5">UPI ID (psm8742260@upi)</label>
                  <input
                    type="text"
                    value={config.upiId || ''}
                    onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                  />
                </div>

                {/* Square QR Code Board */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-400 block">
                    QR Code Gateway Board
                  </label>
                  
                  <div className="flex flex-col items-center justify-center">
                    {/* Square Preview Board */}
                    <div 
                      onClick={() => qrFileInputRef.current?.click()}
                      className="w-48 h-48 sm:w-52 sm:h-52 shrink-0 bg-slate-950 border-2 border-dashed border-cyan-500/40 rounded-2xl p-2.5 flex flex-col items-center justify-center relative cursor-pointer hover:border-cyan-400 transition-all group overflow-hidden shadow-xl shadow-cyan-950/20"
                    >
                      {config.qrCodeUrl ? (
                        <>
                          <img 
                            src={config.qrCodeUrl} 
                            alt="QR Code Preview" 
                            className="w-full h-full object-contain rounded-xl bg-white p-1"
                          />
                          <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center rounded-2xl">
                            <Upload className="w-5 h-5 text-cyan-400 mb-1" />
                            <span className="text-[10px] font-bold text-white">Change QR</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-center p-3">
                          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <QrCode className="w-5 h-5 text-cyan-400" />
                          </div>
                          <span className="text-xs font-bold text-slate-300">QR Board</span>
                        </div>
                      )}
                    </div>

                    {config.qrCodeUrl && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfig({ ...config, qrCodeUrl: '' });
                        }}
                        className="text-[10px] text-rose-400 hover:text-rose-300 underline font-semibold cursor-pointer mt-3"
                      >
                        Remove QR
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Hidden File Input for QR Code Image */}
              <input
                type="file"
                ref={qrFileInputRef}
                accept="image/*"
                onChange={handleQrImageUpload}
                className="hidden"
              />

              {/* Buttons Row: Three small side-by-side buttons */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => qrFileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 text-[10px] font-black hover:border-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Upload className="w-3.5 h-3.5" />
                  UPLOAD QR
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-[10px] font-black hover:bg-cyan-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-500/10 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {isSaving ? 'SAVING...' : 'SAVE GATEWAY'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (config) {
                      setConfig({ ...config, qrCodeUrl: '' });
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black hover:border-rose-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  DELETE QR
                </button>
              </div>
            </div>

            {/* Dynamic Data Pack Management Cards - Exactly 5 Boards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Data Pack Inventory Management ({topups.length} Boards)
                </h3>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                  మొత్తం 5 డేటా బోర్డులు
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topups.map((tp, idx) => (
                  <div key={tp.id} className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/30 transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20 uppercase font-mono">
                          Board #{tp.id.replace('topup-', '').toUpperCase()}
                        </span>
                        <Zap className="w-4 h-4 text-emerald-500" />
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Pack Name</label>
                          <input 
                            type="text" 
                            value={tp.name} 
                            onChange={(e) => setTopups(prev => prev.map(p => p.id === tp.id ? { ...p, name: e.target.value } : p))}
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:border-emerald-500 outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Price (₹)</label>
                            <input 
                              type="number" 
                              value={tp.priceINR} 
                              onChange={(e) => setTopups(prev => prev.map(p => p.id === tp.id ? { ...p, priceINR: parseInt(e.target.value) || 0 } : p))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-emerald-400 font-bold outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Data (MB)</label>
                            <input 
                              type="number" 
                              value={tp.dataMB} 
                              onChange={(e) => setTopups(prev => prev.map(p => p.id === tp.id ? { ...p, dataMB: parseInt(e.target.value) || 0 } : p))}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-cyan-400 font-bold outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={async () => {
                        setIsSaving(true);
                        try {
                          await fetch('/api/admin/plans', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ topups }),
                          });
                          alert('డేటా ప్యాక్ విజయవంతంగా సేవ్ చేయబడింది! (Data Pack Saved!)');
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      className="w-full mt-6 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-slate-700/50 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Feed & Save
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Security */}
        {activeTab === 5 && (
          <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 rounded-2xl glass-panel space-y-6 border-slate-700/50">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Admin Credentials
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Primary Admin Email</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Admin Mobile Number</label>
                  <input
                    type="text"
                    value={adminMobile}
                    onChange={(e) => setAdminMobile(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Master Password</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 outline-none"
                    placeholder="Enter new password"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-2">Master Security PIN</label>
                  <input
                    type="text"
                    value={masterPin}
                    onChange={(e) => setMasterPin(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:border-cyan-500 outline-none font-mono"
                    placeholder="6606.0k"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                {config && (
                  <button
                    onClick={async () => {
                      const newConfig = { ...config, isPaymentEnabled: !config.isPaymentEnabled };
                      setConfig(newConfig);
                      setIsSaving(true);
                      try {
                        await fetch('/api/admin/config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ config: newConfig }),
                        });
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5 border shadow-md ${
                      config.isPaymentEnabled
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                    }`}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 ${config.isPaymentEnabled ? 'animate-pulse' : ''}`} />
                    ACCESS: {config.isPaymentEnabled ? 'ON' : 'OFF'}
                  </button>
                )}
                <button
                  onClick={handleSaveSecurity}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-[10px] font-black hover:bg-red-400 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isSaving ? 'UPDATING...' : 'UPDATE ADMIN'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
