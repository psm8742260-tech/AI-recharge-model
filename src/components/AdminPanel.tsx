import React, { useState, useEffect } from 'react';
import { Shield, Zap, Sparkles, Settings, Database, Save, Trash2, ShieldAlert, ShieldCheck, ArrowLeft, CreditCard, QrCode, Upload, FileArchive, Lock, Key, CheckCircle2, Loader2, Download, HardDrive, Check, Copy, ExternalLink, FolderDown, GitBranch, RefreshCw, Server, Terminal } from 'lucide-react';
import { SubscriptionPlan, TopUpPack } from '../data/plansData';
import { UserAccount } from '../types';
import { getDisplayVersion } from '../version';

interface AdminPanelProps {
  user: UserAccount | null;
  onBack: () => void;
  onOpenExportZip?: () => void;
  onLoginSuccess?: (user: UserAccount) => void;
}

interface AdminConfig {
  gatewayName: string;
  tokenDeductionMultiplier: number;
  defaultDailyLimitMB: number;
  isMaintenanceMode: boolean;
  isPaymentEnabled: boolean;
  hybridEngineStatus: string;
  adminEmail: string;
  adminMobile?: string;
  adminPassword?: string;
  masterPin?: string;
  upiId?: string;
  qrCodeUrl?: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onBack, onOpenExportZip, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [topups, setTopups] = useState<TopUpPack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [savingPlanId, setSavingPlanId] = useState<string | null>(null);
  const [savedPlanIds, setSavedPlanIds] = useState<{ [id: string]: boolean }>({});

  // Security Form States
  const [adminEmail, setAdminEmail] = useState('');
  const [adminMobile, setAdminMobile] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [masterPin, setMasterPin] = useState('');

  // PIN Unlock Screen State
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);

  // Tab 6 cPanel Export States
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<string | null>(null);
  const [copiedZipUrl, setCopiedZipUrl] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [bundleSize, setBundleSize] = useState('37.2 MB');
  const [copiedSecretKey, setCopiedSecretKey] = useState<string | null>(null);

  // In-app Notification Toast State
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleCopyText = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedSecretKey(keyId);
    setTimeout(() => setCopiedSecretKey(null), 2500);
  };

  const handleDownloadZip = () => {
    setIsDownloadingZip(true);
    setDownloadSuccess(false);

    try {
      const fullUrl = `${window.location.origin}/cpanel_public_html.zip`;
      
      // 1. Trigger window.open to bypass iframe sandbox restriction
      const newWin = window.open(fullUrl, '_blank');
      if (!newWin) {
        // 2. Fallback to top location
        window.location.href = fullUrl;
      }

      setTimeout(() => {
        setIsDownloadingZip(false);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(false), 5000);
      }, 1000);
    } catch (e) {
      window.location.href = '/cpanel_public_html.zip';
      setIsDownloadingZip(false);
      setDownloadSuccess(true);
    }
  };

  const handleCopyZipUrl = () => {
    const fullUrl = `${window.location.origin}/cpanel_public_html.zip`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopiedZipUrl(true);
      setTimeout(() => setCopiedZipUrl(false), 3000);
    }).catch(() => {
      // Fallback
      setCopiedZipUrl(true);
      setTimeout(() => setCopiedZipUrl(false), 3000);
    });
  };

  // QR Code File Upload Ref
  const qrFileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const cachedPlans = localStorage.getItem('airecharge_plans');
      if (cachedPlans) {
        try {
          const parsed = JSON.parse(cachedPlans);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPlans(parsed);
          }
        } catch (e) {}
      }

      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(data.config);
          if (data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
            setPlans(data.plans);
            localStorage.setItem('airecharge_plans', JSON.stringify(data.plans));
          }
          setTopups(data.topups || []);
          setAdminEmail(data.config.adminEmail || '');
          setAdminMobile(data.config.adminMobile || '');
          setAdminPassword(data.config.adminPassword || '');
          setMasterPin(data.config.masterPin || '');
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setIsLoading(false);
    }

    try {
      const bundleRes = await fetch('/api/admin/bundle-info');
      if (bundleRes.ok) {
        const bundleData = await bundleRes.json();
        if (bundleData.sizeMb) {
          setBundleSize(bundleData.sizeMb);
        }
      }
    } catch {
      // fallback stays 36.5 MB
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchReceipts = async () => {
    try {
      const res = await fetch('/api/admin/receipts');
      if (res.ok) {
        const data = await res.json();
        setReceipts(data.receipts || []);
      }
    } catch (err) {
      console.error('Failed to fetch receipts:', err);
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchAdminData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && user.isAdmin) {
      if (activeTab === 3) fetchUsers();
      if (activeTab === 4) fetchReceipts();
    }
  }, [activeTab, user]);

  const handleVerifyPin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const inputVal = pinInput.trim();
    if (!inputVal) return;
    setIsVerifyingPin(true);
    setPinError('');

    try {
      const res = await fetch('/api/admin/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: inputVal, password: inputVal, email: inputVal, mobile: inputVal }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        localStorage.setItem('airecharge_user_account', JSON.stringify(data.user));
        if (onLoginSuccess) onLoginSuccess(data.user);
        fetchAdminData();
        setIsVerifyingPin(false);
        return;
      } else {
        setPinError(data.message || 'చెల్లని అడ్మిన్ మాస్టర్ పిన్ లేదా వివరాలు.');
      }
    } catch (err) {
      console.warn('Verify PIN server endpoint fallback:', err);
    }

    // Client-side Fallback Verification for Master PIN / Password / Email / Mobile
    if (
      inputVal === '6606.0k' ||
      inputVal === '2634T' ||
      inputVal.toLowerCase() === 'psm8742260@gmail.com' ||
      inputVal === '8466062260' ||
      inputVal === '6606'
    ) {
      const adminUser: UserAccount = {
        id: 'usr_admin_master',
        email: 'psm8742260@gmail.com',
        name: 'Purushotham',
        mobile: '8466062260',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150',
        activePlanId: 'plan-1m',
        activePlanName: 'Master Admin Access',
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
            status: 'active',
          },
        ],
      };
      localStorage.setItem('airecharge_user_account', JSON.stringify(adminUser));
      if (onLoginSuccess) onLoginSuccess(adminUser);
      fetchAdminData();
    } else {
      setPinError('చెల్లని అడ్మిన్ మాస్టర్ పిన్ (6606.0k) లేదా పాస్‌వర్డ్ (2634T)');
    }
    setIsVerifyingPin(false);
  };

  /* TRAILER_MODE_TOGGLE - Controls whether amounts and QR code payments are visible to users or in free trailer test mode */
  const handleTogglePaymentMode = async () => {
    if (!config) return;
    const newConfig = { ...config, isPaymentEnabled: !config.isPaymentEnabled };
    setConfig(newConfig);
    setIsSaving(true);
    try {
      localStorage.setItem('airecharge_config', JSON.stringify(newConfig));
      window.dispatchEvent(new CustomEvent('airecharge_config_updated', { detail: newConfig }));
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig }),
      });
      if (newConfig.isPaymentEnabled) {
        showToast('🟢 అమౌంట్స్ ఆన్ చేయబడ్డాయి (యూజర్లకి ధరలు మరియు QR పేమెంట్ కనిపిస్తాయి - Commercial Mode)');
      } else {
        showToast('⚪ అమౌంట్స్ ఆఫ్ చేయబడ్డాయి (ట్రైలర్ టెస్టింగ్ మోడ్ - ధరలు దాచబడ్డాయి)');
      }
    } catch (err) {
      console.error('Failed to toggle payment mode:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleQrImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('దయచేసి సరైన ఫోటో లేదా ఇమేజ్ ఫైల్ మాత్రమే ఎంచుకోండి.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast('ఇమేజ్ సైజు 10MB కంటే తక్కువగా ఉండాలి.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      if (typeof reader.result === 'string' && config) {
        const updatedConfig = { ...config, qrCodeUrl: reader.result };
        setConfig(updatedConfig);
        localStorage.setItem('airecharge_config', JSON.stringify(updatedConfig));
        window.dispatchEvent(new CustomEvent('airecharge_config_updated', { detail: updatedConfig }));
        try {
          await fetch('/api/admin/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ config: updatedConfig }),
          });
          showToast('కొత్త QR కోడ్ విజయవంతంగా అప్‌లోడ్ చేయబడింది! యూజర్లకు ఇదే కనిపిస్తుంది.');
        } catch (err) {
          console.error('Failed to save QR code:', err);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveConfig = async () => {
    if (!config) return;
    setIsSaving(true);
    try {
      localStorage.setItem('airecharge_config', JSON.stringify(config));
      window.dispatchEvent(new CustomEvent('airecharge_config_updated', { detail: config }));
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });
      showToast('వ్యవస్థ మరియు QR గేట్‌వే సెట్టింగ్‌లు సేవ్ చేయబడ్డాయి! (Settings Saved!)');
    } catch (err) {
      console.error('Failed to save config:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveTopups = async (updatedList?: TopUpPack[]) => {
    const listToSave = updatedList || topups;
    setIsSaving(true);
    try {
      localStorage.setItem('airecharge_topups', JSON.stringify(listToSave));
      window.dispatchEvent(new CustomEvent('airecharge_plans_updated', { detail: { plans, topups: listToSave } }));
      await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topups: listToSave }),
      });
      showToast('డేటా ప్యాక్ వివరాలు సేవ్ చేయబడ్డాయి! యూజర్లకు లైవ్ అప్‌డేట్ అయ్యాయి.');
    } catch (err) {
      console.error('Failed to save topups:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePlan = async (plan: SubscriptionPlan) => {
    setSavingPlanId(plan.id);
    setIsSaving(true);

    const updatedPlans = plans.map(p => p.id === plan.id ? plan : p);
    try {
      localStorage.setItem('airecharge_plans', JSON.stringify(updatedPlans));
      window.dispatchEvent(new CustomEvent('airecharge_plans_updated', { detail: { plans: updatedPlans, topups } }));
    } catch (e) {
      console.error('Failed to sync plans locally:', e);
    }

    try {
      await fetch(`/api/admin/plans/${plan.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      });

      await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plans: updatedPlans }),
      }).catch(() => {});

      // Mark as saved -> turns button to RED
      setSavedPlanIds(prev => ({ ...prev, [plan.id]: true }));
      showToast(`${plan.name} విజయవంతంగా సేవ్ చేయబడింది!`);
    } catch (err) {
      console.error('Failed to save plan to backend:', err);
      // Still set saved because local storage is updated
      setSavedPlanIds(prev => ({ ...prev, [plan.id]: true }));
    } finally {
      setSavingPlanId(null);
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
      showToast('సెక్యూరిటీ సెట్టింగ్‌లు విజయవంతంగా అప్‌డేట్ అయ్యాయి!');
    } catch (err) {
      console.error('Failed to save security:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const updatePlan = (id: string, field: keyof SubscriptionPlan, value: any) => {
    setPlans(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, [field]: value } : p);
      try {
        localStorage.setItem('airecharge_plans', JSON.stringify(updated));
        window.dispatchEvent(new CustomEvent('airecharge_plans_updated', { detail: updated }));
      } catch (e) {}
      return updated;
    });
    setSavedPlanIds(prev => ({ ...prev, [id]: false }));
  };

  // Render Admin PIN Unlock Screen if user is not Admin
  if (!user || !user.isAdmin) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center animate-in fade-in duration-300">
        <div className="flex justify-start">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-md"
            title="మళ్ళీ వెనక్కి వెళ్ళండి"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/20">
          <ShieldAlert className="w-8 h-8 text-cyan-400 animate-pulse" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">అడ్మిన్ మాస్టర్ అన్‌లాక్ (Admin Master Access)</h2>
          <p className="text-xs text-slate-400 mt-2">
            అడ్మిన్ ప్యానెల్ తెరిచేందుకు మాస్టర్ సెక్యూరిటీ పిన్ (6606.0k) లేదా పాస్‌వర్డ్ (2634T) ఎంటర్ చేయండి.
          </p>
        </div>

        <form onSubmit={handleVerifyPin} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              autoFocus
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError('');
              }}
              placeholder="Enter PIN (e.g. 6606.0k) or Password"
              className="w-full bg-slate-950 border-2 border-cyan-500/40 rounded-xl px-4 py-3 text-center text-sm font-mono font-bold text-cyan-400 placeholder-slate-500 focus:outline-none focus:border-cyan-400 shadow-inner"
            />
          </div>

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {pinError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isVerifyingPin || !pinInput.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isVerifyingPin ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  పరిశీలిస్తోంది...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-slate-950" />
                  అన్‌లాక్ చేయండి (Unlock)
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setPinInput('6606.0k');
                handleVerifyPin();
              }}
              className="py-3 px-3 bg-slate-800 hover:bg-slate-750 text-cyan-400 font-bold text-xs rounded-xl border border-slate-700 hover:border-cyan-500/50 transition-all cursor-pointer shrink-0"
              title="ఆటో ఫిల్ & లాగిన్"
            >
              1-క్లిక్ లాగిన్
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-slate-800">
          <p className="text-[10px] text-slate-500">
            అనుమతించబడిన జీమెయిల్: <span className="text-cyan-400 font-mono font-bold">psm8742260@gmail.com</span> | పిన్: <span className="text-cyan-400 font-mono font-bold">6606.0k</span>
          </p>
        </div>
      </div>
    );
  }

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
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-slate-900 border-2 border-cyan-500 text-white shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-3 duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold leading-relaxed">{toastNotification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-lg cursor-pointer"
              title="మళ్ళీ వెనక్కి వెళ్ళండి"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5 shadow-xl ml-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[11px] font-black bg-gradient-to-r from-cyan-400 via-emerald-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tighter">
                H
              </span>
            </div>
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
              Configure token economics, recharge plans, QR code gateway, and Amounts (ON/OFF).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {config && (
            <>
              <div className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-xl">
                <div className="flex flex-col text-right">
                  <span className="text-[9px] uppercase font-black tracking-tighter text-slate-400">
                    అమౌంట్స్ (Amounts)
                  </span>
                  <span className={`text-[10px] font-bold flex items-center justify-end gap-1 ${config.isPaymentEnabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {config.isPaymentEnabled ? 'ఆన్ (ON)' : 'ఆఫ్ (OFF)'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTogglePaymentMode}
                  disabled={isSaving}
                  aria-label="Toggle Amounts Mode"
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    config.isPaymentEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                  title={config.isPaymentEnabled ? "అమౌంట్స్ ఆన్" : "అమౌంట్స్ ఆఫ్"}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      config.isPaymentEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
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
                className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all flex items-center gap-1.5 border shadow-md ${
                  config.isPaymentEnabled
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                }`}
              >
                <ShieldCheck className={`w-3.5 h-3.5 ${config.isPaymentEnabled ? 'animate-pulse' : ''}`} />
                ACCESS: {config.isPaymentEnabled ? 'ON' : 'OFF'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* 6 Main Admin Tabs Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-2 bg-slate-950 rounded-2xl border border-slate-800/80 shadow-xl">
        <button
          onClick={() => setActiveTab(0)}
          className={`p-3 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left cursor-pointer border ${
            activeTab === 0
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20 font-black'
              : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 0 ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>1/6</span>
            <Settings className="w-4 h-4" />
          </div>
          <span className="truncate">వ్యవస్థ సెట్టింగ్‌లు (System)</span>
        </button>

        <button
          onClick={() => setActiveTab(1)}
          className={`p-3 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left cursor-pointer border ${
            activeTab === 1
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20 font-black'
              : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 1 ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>2/6</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="truncate">ప్లాన్‌లు & రేట్లు (Plans)</span>
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`p-3 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left cursor-pointer border ${
            activeTab === 2
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20 font-black'
              : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 2 ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>3/6</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="truncate">QR & పేమెంట్స్ (Payments)</span>
        </button>

        <button
          onClick={() => setActiveTab(3)}
          className={`p-3 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left cursor-pointer border ${
            activeTab === 3
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20 font-black'
              : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 3 ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>4/6</span>
            <Database className="w-4 h-4" />
          </div>
          <span className="truncate">యూజర్ డేటాబేస్ (Users)</span>
        </button>

        <button
          onClick={() => setActiveTab(4)}
          className={`p-3 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left cursor-pointer border ${
            activeTab === 4
              ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 border-cyan-400 shadow-lg shadow-cyan-500/20 font-black'
              : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 4 ? 'bg-slate-950 text-cyan-400' : 'bg-slate-800 text-slate-400'}`}>5/6</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="truncate">సెక్యూరిటీ & పిన్ (Security)</span>
        </button>

        <button
          onClick={() => setActiveTab(5)}
          className={`p-3 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left cursor-pointer border ${
            activeTab === 5
              ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20 font-black'
              : 'bg-slate-900/60 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 5 ? 'bg-slate-950 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>6/6</span>
            <FileArchive className="w-4 h-4" />
          </div>
          <span className="truncate">📦 cPanel ZIP (సర్వర్)</span>
        </button>
      </div>

      {/* Tab Content Areas */}
      <div className="mt-8">
        {/* Tab 1/6: System Settings */}
        {activeTab === 0 && config && (
          <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

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
                  className={`w-10 h-5 rounded-full transition-colors relative ${config.isMaintenanceMode ? 'bg-amber-500' : 'bg-slate-800'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${config.isMaintenanceMode ? 'left-5.5' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-extrabold hover:bg-cyan-400 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg shadow-cyan-500/10"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Updating Core...' : 'Sync System Settings'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2/6: Plans & Topup Rates */}
        {activeTab === 1 && (
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

                  <div className="pt-4 flex items-center justify-between gap-2">
                    {savedPlanIds[plan.id] ? (
                      <span className="text-[11px] font-bold text-red-400 flex items-center gap-1.5 animate-in fade-in duration-300">
                        <CheckCircle2 className="w-4 h-4 text-red-500 shrink-0" />
                        <span>యూజర్లకు సేవ్ అయింది!</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-medium">
                        మార్పులు చేసి సేవ్ చేయండి
                      </span>
                    )}

                    <button
                      onClick={() => handleSavePlan(plan)}
                      disabled={savingPlanId === plan.id}
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 ${
                        savedPlanIds[plan.id]
                          ? 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-400 shadow-red-600/50 ring-2 ring-red-500/30'
                          : savingPlanId === plan.id
                          ? 'bg-red-500 text-white animate-pulse shadow-red-500/40 border border-red-400'
                          : 'bg-red-600 hover:bg-red-500 text-white border border-red-500 shadow-md shadow-red-600/30'
                      }`}
                    >
                      {savingPlanId === plan.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>సేవ్ అవుతోంది...</span>
                        </>
                      ) : savedPlanIds[plan.id] ? (
                        <>
                          <Check className="w-4 h-4 text-white stroke-[3]" />
                          <span>సేవ్ చేయబడింది (Saved)</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 text-white" />
                          <span>సేవ్ చేయండి</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3/6: QR Code & Payment Config */}
        {activeTab === 2 && config && (
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

              {/* Buttons Row */}
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
                  onClick={async () => {
                    if (config) {
                      const updated = { ...config, qrCodeUrl: '' };
                      setConfig(updated);
                      localStorage.setItem('airecharge_config', JSON.stringify(updated));
                      window.dispatchEvent(new CustomEvent('airecharge_config_updated', { detail: updated }));
                      try {
                        await fetch('/api/admin/config', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ config: updated }),
                        });
                        showToast('QR కోడ్ విజయవంతంగా తొలగించబడింది! (QR Deleted!)');
                      } catch (err) {
                        console.error('Failed to delete QR:', err);
                      }
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black hover:border-rose-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  DELETE QR
                </button>
              </div>
            </div>

            {/* Dynamic Data Pack Management Cards - 5 Boards */}
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
                {topups.map((tp) => (
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
                      onClick={() => handleSaveTopups()}
                      disabled={isSaving}
                      className="w-full mt-6 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-300 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-slate-700/50 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSaving ? 'సేవ్ అవుతోంది...' : 'Feed & Save'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* PWA / TWA Integration Details */}
            <div className="p-6 rounded-2xl glass-panel space-y-4 border-slate-700/50 max-w-2xl">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">PWA & Mobile Web Support</h4>
              </div>
              <p className="text-xs text-slate-400">
                PWA / TWA standalone web app and mobile browser configurations are active for all users.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4/6: User Database */}
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

        {/* Tab 5/6: Security & Credentials */}
        {activeTab === 4 && (
          <div className="max-w-xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-6 rounded-2xl glass-panel space-y-6 border-slate-700/50">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-500" />
                Admin Master Credentials & Security
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
                <button
                  onClick={handleSaveSecurity}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-lg bg-red-500 text-white text-[10px] font-black hover:bg-red-400 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : 'Save Credentials'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5/6: Security ends */}

        {/* Tab 6/6: cPanel ZIP Deployment */}
        {activeTab === 5 && (
          <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main ZIP Download Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/30 shadow-2xl shadow-emerald-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/30 shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      <FileArchive className="w-7 h-7 text-emerald-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        cPanel హోస్టింగ్ ZIP బండిల్
                      </h3>
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full shadow-sm">
                        {bundleSize} ZIP
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-full">
                        పూర్తి ప్యాకేజీ (~37 MB)
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                      మీ AI రీఛార్జ్ మోడల్స్ పోర్టల్‌ని నేరుగా cPanel వెబ్ హోస్టింగ్‌లో అప్‌లోడ్ చేసి లైవ్ రన్ చేయడానికి అవసరమైన పూర్తి ప్రొడక్షన్ బండిల్ (పరిమాణం: {bundleSize} / ~37 MB).
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isDownloadingZip}
                    className="px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-80"
                  >
                    {isDownloadingZip ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                        <span>డౌన్‌లోడ్ అవుతోంది...</span>
                      </>
                    ) : downloadSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-slate-950" />
                        <span>✅ cpanel_public_html.zip (38 MB) డౌన్‌లోడ్ అయింది!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>పూర్తి cpanel_public_html.zip (38 MB)</span>
                      </>
                    )}
                  </button>

                  <a
                    href="/cpanel_public_html.zip"
                    download="cpanel_public_html.zip"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-slate-700 flex items-center justify-center gap-2 transition-all shadow-md text-center cursor-pointer"
                    title="డైరెక్ట్ లింక్ డౌన్‌లోడ్"
                  >
                    <FolderDown className="w-4 h-4 text-cyan-400" />
                    <span>డైరెక్ట్ సేవ్ (38 MB)</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="relative z-10 pt-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyZipUrl}
                    className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    {copiedZipUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">డౌన్‌లోడ్ లింక్ కాపీ అయింది!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>డైరెక్ట్ URL కాపీ చేయండి</span>
                      </>
                    )}
                  </button>



                  {onOpenExportZip && (
                    <button
                      type="button"
                      onClick={onOpenExportZip}
                      className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-500/50 text-slate-300 hover:text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>ఎక్స్‌పోర్ట్ మోడల్ ఓపెన్ చేయండి</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ఫైల్ పాత్: /cpanel-bundle.zip</span>
                </div>
              </div>
            </div>



            {/* GitHub to cPanel Auto-Deployment (CI/CD) Section */}
            <div className="p-6 sm:p-8 rounded-3xl glass-panel space-y-6 border border-cyan-500/20 bg-gradient-to-br from-slate-900/90 via-slate-950/90 to-cyan-950/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/25 shrink-0">
                    <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                      <GitBranch className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg sm:text-xl font-black text-white">
                        GitHub ➔ cPanel ఆటో-డిప్లాయ్‌మెంట్ (Auto-Deploy)
                      </h4>
                      <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full flex items-center gap-1 shadow-sm">
                        <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin" />
                        లైవ్ సింక్ సిద్ధంగా ఉంది
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1">
                      మీరు GitHub లో కోడ్ పుష్ చేయగానే ఆటోమేటిక్‌గా ప్రొడక్షన్ బిల్డ్ అయి మీ cPanel సర్వర్ (<code className="text-cyan-300 font-mono text-[11px]">arm.phrscrowd.online</code>) కి చేరిపోతుంది.
                    </p>
                  </div>
                </div>
              </div>

              {/* How it works visual pipeline */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative z-10">
                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Git Push</div>
                    <div className="text-[10px] text-slate-400">GitHub కి కోడ్ పంపడం</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">GitHub Actions</div>
                    <div className="text-[10px] text-slate-400">npm run build రన్ అవుతుంది</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">FTP Sync</div>
                    <div className="text-[10px] text-slate-400">cPanel కి ఫైల్స్ చేరతాయి</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 bg-emerald-950/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-300">వెంటనే లైవ్</div>
                    <div className="text-[10px] text-slate-400">arm.phrscrowd.online</div>
                  </div>
                </div>
              </div>

              {/* GitHub Settings Instructions Box */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <h5 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider">
                    GitHub లో చేయవలసిన 1-నిమిషం సెట్టింగ్ (GitHub Secrets)
                  </h5>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  మీ GitHub రిపాజిటరీలో <span className="text-white font-bold">Settings ➔ Secrets and variables ➔ Actions</span> కి వెళ్ళి <span className="text-emerald-400 font-bold">"New repository secret"</span> క్లిక్ చేసి కింద ఇచ్చిన విలువలను జోడించండి:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Secret Name:</div>
                      <code className="text-cyan-300 font-mono font-bold text-xs">FTP_PASSWORD</code>
                      <div className="text-[10px] text-slate-500 mt-0.5">మీ cPanel / FTP పాస్‌వర్డ్</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText('FTP_PASSWORD', 'FTP_PASSWORD')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSecretKey === 'FTP_PASSWORD' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecretKey === 'FTP_PASSWORD' ? 'కాపీడ్!' : 'పేరు కాపీ'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">FTP Server (ఆటోమేటిక్):</div>
                      <code className="text-slate-300 font-mono text-xs">phrscrowd.online</code>
                      <div className="text-[10px] text-slate-500 mt-0.5">డిఫాల్ట్‌గా సెట్ చేయబడింది</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText('phrscrowd.online', 'FTP_SERVER')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSecretKey === 'FTP_SERVER' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecretKey === 'FTP_SERVER' ? 'కాపీడ్!' : 'కాపీ'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">FTP Username (ఆటోమేటిక్):</div>
                      <code className="text-slate-300 font-mono text-xs">phrscrow</code>
                      <div className="text-[10px] text-slate-500 mt-0.5">డిఫాల్ట్‌గా సెట్ చేయబడింది</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText('phrscrow', 'FTP_USERNAME')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSecretKey === 'FTP_USERNAME' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecretKey === 'FTP_USERNAME' ? 'కాపీడ్!' : 'కాపీ'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400 font-bold">Server Directory (ఆటోమేటిక్):</div>
                      <code className="text-slate-300 font-mono text-xs">/public_html/arm/</code>
                      <div className="text-[10px] text-slate-500 mt-0.5">డిఫాల్ట్‌గా సెట్ చేయబడింది</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText('/public_html/arm/', 'FTP_DIR')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                    >
                      {copiedSecretKey === 'FTP_DIR' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecretKey === 'FTP_DIR' ? 'కాపీడ్!' : 'కాపీ'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 text-[11px] text-cyan-200/90 leading-relaxed flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-cyan-100">గమనిక:</span> మీ ప్రాజెక్ట్‌లో <code className="text-cyan-300 font-mono">.github/workflows/deploy.yml</code> మరియు cPanel Git కోసం <code className="text-cyan-300 font-mono">.cpanel.yml</code> ఇప్పటికే పర్ఫెక్ట్‌గా సిద్ధం చేయబడ్డాయి. మీరు కేవలం మీ cPanel పాస్‌వర్డ్ <code className="text-cyan-300 font-mono">FTP_PASSWORD</code> గా ఇస్తే చాలు, ప్రతి పుష్ ఆటోమేటిక్‌గా సర్వర్‌కి చేరుతుంది!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
