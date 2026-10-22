import React, { useState, useEffect } from 'react';
import { Shield, Zap, Sparkles, Settings, Database, Activity, Save, Plus, Trash2, ShieldAlert, Cpu, ShieldCheck } from 'lucide-react';
import { SubscriptionPlan, TopUpPack } from '../data/plansData';
import { UserAccount } from '../types';

interface AdminPanelProps {
  user: UserAccount | null;
}

interface AdminConfig {
  gatewayName: string;
  tokenDeductionMultiplier: number;
  defaultDailyLimitMB: number;
  isMaintenanceMode: boolean;
  isPaymentEnabled: boolean;
  hybridVersion: string;
  adminEmail: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user }) => {
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

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            HYBRID ENGINE v{config?.hybridVersion}
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
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">అదనపు ఫీల్డ్ 1 (Field 1)</label>
                      <input
                        type="text"
                        value={plan.customField1 || ''}
                        onChange={(e) => updatePlan(plan.id, 'customField1', e.target.value)}
                        placeholder="భవిష్యత్తు అవసరాల కోసం..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">అదనపు ఫీల్డ్ 2 (Field 2)</label>
                      <input
                        type="text"
                        value={plan.customField2 || ''}
                        onChange={(e) => updatePlan(plan.id, 'customField2', e.target.value)}
                        placeholder="భవిష్యత్తు అవసరాల కోసం..."
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:border-cyan-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => handleSavePlan(plan)}
                      disabled={isSaving}
                      className="w-1/2 py-2 rounded-xl bg-cyan-500 text-slate-950 text-[10px] font-extrabold hover:bg-cyan-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Save className="w-3 h-3" />
                      {isSaving ? 'Saving...' : 'ప్లాన్ సేవ్ చేయండి'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Global Admin Access Toggle */}
            {config && (
              <div className="flex justify-end pt-4 gap-4 items-center">
                <div className="text-right">
                  <h4 className="text-xs font-bold text-white">అడ్మిన్ యాక్సెస్ (Admin Access)</h4>
                  <p className="text-[10px] text-slate-500">పేమెంట్ లేకుండా టెస్టింగ్ కోసం ఉపయోగించండి.</p>
                </div>
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
                  className={`w-24 h-10 rounded-xl transition-all relative flex items-center px-1 ${config.isPaymentEnabled ? 'bg-slate-800' : 'bg-emerald-500 shadow-lg shadow-emerald-500/20'}`}
                >
                  <div className={`text-[10px] font-bold w-full text-center ${config.isPaymentEnabled ? 'text-slate-500' : 'text-white'}`}>
                    {config.isPaymentEnabled ? 'OFF' : 'ON'}
                  </div>
                  <div className={`absolute w-8 h-8 rounded-lg bg-white transition-all shadow-md ${config.isPaymentEnabled ? 'left-1' : 'right-1'}`} />
                </button>
              </div>
            )}
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
                  <label className="text-xs font-bold text-slate-400 block mb-2">Hybrid Engine Version</label>
                  <input
                    type="text"
                    value={config.hybridVersion}
                    onChange={(e) => setConfig({ ...config, hybridVersion: e.target.value })}
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
                  <span className="text-[10px] font-bold uppercase">Hybrid Core Alert</span>
                </div>
                <p className="text-[10px] text-amber-200/80 leading-relaxed">
                  The PWA and TWA configurations are locked to the Hybrid Core version. Any manual changes to `vite.config.ts` or `assetlinks.json` require Admin Master PIN validation.
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

        {/* Tab 4: Security */}
        {activeTab === 4 && (
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
                    placeholder="6606"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveSecurity}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-red-500 text-white text-xs font-extrabold hover:bg-red-400 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isSaving ? 'Updating Security...' : 'Update Admin Credentials'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
