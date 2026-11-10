import React, { useState, useEffect } from 'react';
import { Shield, Zap, Sparkles, Settings, Database, Save, Trash2, ShieldAlert, ShieldCheck, ArrowLeft, CreditCard, QrCode, Upload, FileArchive, Lock, Key, CheckCircle2, Loader2, Download, HardDrive, Check, Copy, ExternalLink, FolderDown, GitBranch, RefreshCw, Server, Terminal } from 'lucide-react';
import { SubscriptionPlan, TopUpPack, SUBSCRIPTION_PLANS, TOP_UP_PACKS } from '../data/plansData';
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
  phonePeNumber?: string;
  paytmNumber?: string;
  googlePayNumber?: string;
  accountNumber?: string;
  ifscCode?: string;
  accountHolderName?: string;
  bankName?: string;
  cardPaymentDetails?: string;
  isCardPaymentEnabled?: boolean;
  qrCodeUrl?: string;
}

const DEFAULT_ADMIN_CONFIG: AdminConfig = {
  gatewayName: 'AI Recharge HYBRID GATEWAY',
  tokenDeductionMultiplier: 1.15,
  defaultDailyLimitMB: 800,
  isMaintenanceMode: false,
  isPaymentEnabled: true,
  hybridEngineStatus: 'ACTIVE',
  adminEmail: 'psm8742260@gmail.com',
  adminMobile: '8466062260',
  adminPassword: '2634T',
  masterPin: '6606.0k',
  upiId: 'psm8742260@upi',
  phonePeNumber: '8466062260',
  paytmNumber: '8466062260',
  googlePayNumber: '8466062260',
  accountNumber: '8466062260',
  ifscCode: 'PYTM0123456',
  accountHolderName: 'AI Recharge PSM',
  bankName: 'Paytm Payments Bank / SBI',
  cardPaymentDetails: 'RuPay, Visa, MasterCard, All Debit/Credit Cards & Net Banking',
  isCardPaymentEnabled: true,
  qrCodeUrl: ''
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onBack, onOpenExportZip, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState<AdminConfig>(() => {
    try {
      const cached = localStorage.getItem('airecharge_config');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') return { ...DEFAULT_ADMIN_CONFIG, ...parsed };
      }
    } catch (e) {}
    return DEFAULT_ADMIN_CONFIG;
  });
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [receipts, setReceipts] = useState<any[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(() => {
    try {
      const cached = localStorage.getItem('airecharge_plans');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return SUBSCRIPTION_PLANS;
  });
  const [topups, setTopups] = useState<TopUpPack[]>(() => {
    try {
      const cached = localStorage.getItem('airecharge_topups');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return TOP_UP_PACKS;
  });
  const [isLoading, setIsLoading] = useState(false);
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
  const [adminCardSaved, setAdminCardSaved] = useState(false);
  const [showPaymentDetailsEdit, setShowPaymentDetailsEdit] = useState(false);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 4000);
  };

  const handleAdminOpenApp = (app: 'gpay' | 'phonepe' | 'paytm') => {
    const upi = (config.upiId || 'psm8742260@upi').trim();
    const query = `pa=${encodeURIComponent(upi)}&pn=AI%20Recharge&cu=INR`;
    let directUrl = '';
    let appLabel = '';

    if (app === 'gpay') {
      appLabel = 'Google Pay';
      directUrl = `tez://upi/pay?${query}`;
    } else if (app === 'phonepe') {
      appLabel = 'PhonePe';
      directUrl = `phonepe://pay?${query}`;
    } else if (app === 'paytm') {
      appLabel = 'Paytm';
      directUrl = `paytmmp://pay?${query}`;
    }

    navigator.clipboard.writeText(upi).catch(() => {});

    try {
      const a = document.createElement('a');
      a.href = directUrl;
      a.target = '_top';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 500);
    } catch (err) {
      try {
        if (window.top) window.top.location.href = directUrl;
        else window.location.href = directUrl;
      } catch (e2) {
        window.open(directUrl, '_top');
      }
    }

    showToast(`${appLabel} ఓపెన్ చేయబడుతోంది... (${upi} కాపీ అయింది)`);
  };

  const handleAdminSaveCard = () => {
    const cardNum = config.accountNumber || '8466062260';
    const ifsc = config.ifscCode || 'PYTM0123456';
    navigator.clipboard.writeText(`ఖాతా/కార్డ్ నంబరు: ${cardNum}\nIFSC: ${ifsc}`).catch(() => {});
    setAdminCardSaved(true);
    showToast(`కార్డ్ నంబరు (${cardNum}) & IFSC (${ifsc}) ఆటోమేటిక్‌గా సేవ్ అయింది!`);
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

      const cachedTopups = localStorage.getItem('airecharge_topups');
      if (cachedTopups) {
        try {
          const parsed = JSON.parse(cachedTopups);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setTopups(parsed);
          }
        } catch (e) {}
      }

      const res = await fetch('/api/admin/config');
      if (res.ok) {
        const data = await res.json();
        if (data.config) {
          setConfig(prev => ({ ...DEFAULT_ADMIN_CONFIG, ...data.config }));
          if (data.plans && Array.isArray(data.plans) && data.plans.length > 0) {
            setPlans(data.plans);
            localStorage.setItem('airecharge_plans', JSON.stringify(data.plans));
          } else {
            setPlans(SUBSCRIPTION_PLANS);
          }
          if (data.topups && Array.isArray(data.topups) && data.topups.length > 0) {
            setTopups(data.topups);
            localStorage.setItem('airecharge_topups', JSON.stringify(data.topups));
          } else {
            setTopups(TOP_UP_PACKS);
          }
          setAdminEmail(data.config.adminEmail || 'psm8742260@gmail.com');
          setAdminMobile(data.config.adminMobile || '8466062260');
          setAdminPassword(data.config.adminPassword || '2634T');
          setMasterPin(data.config.masterPin || '6606.0k');
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
      <div className="max-w-md mx-auto my-12 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl space-y-6 text-center animate-in fade-in duration-300">
        <div className="flex justify-start">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 hover:text-cyan-700 hover:border-cyan-400 transition-all shadow-sm"
            title="మళ్ళీ వెనక్కి వెళ్ళండి"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mx-auto shadow-md">
          <ShieldAlert className="w-8 h-8 text-cyan-600 animate-pulse" />
        </div>

        <div>
          <h2 className="text-2xl font-black text-slate-900">అడ్మిన్ మాస్టర్ అన్‌లాక్ (Admin Master Access)</h2>
          <p className="text-xs text-slate-600 mt-2">
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
              className="w-full bg-slate-50 border-2 border-cyan-500 rounded-xl px-4 py-3 text-center text-sm font-mono font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-600 shadow-inner"
            />
          </div>

          {pinError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {pinError}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isVerifyingPin || !pinInput.trim()}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isVerifyingPin ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  పరిశీలిస్తోంది...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-white" />
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
              className="py-3 px-3 bg-slate-100 hover:bg-slate-200 text-cyan-800 font-bold text-xs rounded-xl border border-slate-300 hover:border-cyan-500 transition-all cursor-pointer shrink-0"
              title="ఆటో ఫిల్ & లాగిన్"
            >
              1-క్లిక్ లాగిన్
            </button>
          </div>
        </form>

        <div className="pt-2 border-t border-slate-200">
          <p className="text-[10px] text-slate-500">
            అనుమతించబడిన జీమెయిల్: <span className="text-cyan-700 font-mono font-bold">psm8742260@gmail.com</span> | పిన్: <span className="text-cyan-700 font-mono font-bold">6606.0k</span>
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
    <div className="space-y-6 pb-16 bg-transparent p-4 sm:p-8 text-slate-800 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed top-5 right-5 z-50 p-4 rounded-2xl bg-white border-2 border-cyan-500 text-slate-900 shadow-2xl flex items-center gap-3 animate-in slide-in-from-top-3 duration-300 max-w-md">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs font-bold leading-relaxed">{toastNotification}</span>
        </div>
      )}

      {/* Top Header Section */}
      <div className="space-y-4">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between gap-2 w-full">
          <button
            onClick={onBack}
            className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:text-cyan-700 hover:border-cyan-500 transition-all shadow-sm cursor-pointer flex items-center gap-2 shrink-0 text-xs font-bold"
            title="మళ్ళీ వెనక్కి వెళ్ళండి"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>వెనక్కి</span>
          </button>

          <button
            onClick={handleTogglePaymentMode}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 border shadow-md cursor-pointer shrink-0 active:scale-95 ${
              config.isPaymentEnabled
                ? 'bg-emerald-50 border-emerald-400 text-emerald-800 hover:bg-emerald-100 shadow-emerald-200/40 ring-2 ring-emerald-300/60'
                : 'bg-rose-50 border-rose-400 text-rose-800 hover:bg-rose-100 shadow-rose-200/40 ring-2 ring-rose-300/60'
            }`}
            title="అడ్మిన్ యాక్సెస్ / అమౌంట్స్ ఆన్/ఆఫ్"
          >
            <ShieldCheck className={`w-4 h-4 shrink-0 ${config.isPaymentEnabled ? 'animate-pulse text-emerald-600' : 'text-rose-600'}`} />
            <span className="text-[12px] uppercase tracking-wide font-black">
              {config.isPaymentEnabled ? '🟢 ACCESS: ON' : '🔴 ACCESS: OFF'}
            </span>
          </button>
        </div>

        {/* Title Section */}
        <div className="pt-2">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="text-xs font-black uppercase tracking-wider text-cyan-800 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-cyan-600 shrink-0" />
              <span>Master Control Admin Panel</span>
            </div>
            <div className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 flex items-center gap-1.5 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] font-black bg-gradient-to-r from-cyan-600 via-emerald-600 to-indigo-600 bg-clip-text text-transparent tracking-tighter">
                HYBRID GATEWAY
              </span>
            </div>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Gateway Management
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Configure token economics, recharge plans, QR code gateway, and Amounts (ON/OFF).
          </p>
        </div>
      </div>

      {/* 6 Main Admin Tabs Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        <button
          onClick={() => setActiveTab(0)}
          className={`p-3 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left cursor-pointer border ${
            activeTab === 0
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-600 shadow-md font-black'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 0 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>1/6</span>
            <Settings className="w-4 h-4" />
          </div>
          <span className="truncate">వ్యవస్థ సెట్టింగ్‌లు (System)</span>
        </button>

        <button
          onClick={() => setActiveTab(1)}
          className={`p-3 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left cursor-pointer border ${
            activeTab === 1
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-600 shadow-md font-black'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 1 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>2/6</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="truncate">ప్లాన్‌లు & రేట్లు (Plans)</span>
        </button>

        <button
          onClick={() => setActiveTab(2)}
          className={`p-3 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left cursor-pointer border ${
            activeTab === 2
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-600 shadow-md font-black'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 2 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>3/6</span>
            <CreditCard className="w-4 h-4" />
          </div>
          <span className="truncate">QR & పేమెంట్స్ (Payments)</span>
        </button>

        <button
          onClick={() => setActiveTab(3)}
          className={`p-3 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left cursor-pointer border ${
            activeTab === 3
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-600 shadow-md font-black'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 3 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>4/6</span>
            <Database className="w-4 h-4" />
          </div>
          <span className="truncate">యూజర్ డేటాబేస్ (Users)</span>
        </button>

        <button
          onClick={() => setActiveTab(4)}
          className={`p-3 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left cursor-pointer border ${
            activeTab === 4
              ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white border-cyan-600 shadow-md font-black'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 4 ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>5/6</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <span className="truncate">సెక్యూరిటీ & పిన్ (Security)</span>
        </button>

        <button
          onClick={() => setActiveTab(5)}
          className={`p-3 text-xs font-bold rounded-xl transition-all flex flex-col sm:flex-row items-center justify-center gap-2 text-center sm:text-left cursor-pointer border ${
            activeTab === 5
              ? 'bg-gradient-to-r from-emerald-600 to-cyan-600 text-white border-emerald-600 shadow-md font-black'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${activeTab === 5 ? 'bg-white/20 text-white' : 'bg-slate-100 text-emerald-700'}`}>6/6</span>
            <FileArchive className="w-4 h-4" />
          </div>
          <span className="truncate">📦 cPanel ZIP (సర్వర్)</span>
        </button>
      </div>

      {/* Tab Content Areas */}
      <div className="mt-8">
        {/* Tab 1/6: System Settings */}
        {activeTab === 0 && (
          <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Gateway Instance Name</label>
                <input
                  type="text"
                  value={config.gatewayName}
                  onChange={(e) => setConfig({ ...config, gatewayName: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Hybrid Engine Status</label>
                <input
                  type="text"
                  value={config.hybridEngineStatus}
                  onChange={(e) => setConfig({ ...config, hybridEngineStatus: e.target.value })}
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-500 cursor-not-allowed outline-none"
                  disabled
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Token MB Multiplier</label>
                <input
                  type="number"
                  step="0.05"
                  value={config.tokenDeductionMultiplier}
                  onChange={(e) => setConfig({ ...config, tokenDeductionMultiplier: parseFloat(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1">Multiplies the calculated MB deduction for each request.</p>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Default Daily Limit (MB)</label>
                <input
                  type="number"
                  value={config.defaultDailyLimitMB}
                  onChange={(e) => setConfig({ ...config, defaultDailyLimitMB: parseInt(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${config.isMaintenanceMode ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`} />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Maintenance Mode</h4>
                  <p className="text-[10px] text-slate-500">Enable to block all gateway proxy requests.</p>
                </div>
              </div>
              <button
                onClick={() => setConfig({ ...config, isMaintenanceMode: !config.isMaintenanceMode })}
                className={`w-10 h-5 rounded-full transition-colors relative ${config.isMaintenanceMode ? 'bg-amber-500' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${config.isMaintenanceMode ? 'left-5.5' : 'left-0.5'}`} />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                onClick={handleSaveConfig}
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 text-white text-xs font-extrabold hover:bg-cyan-700 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer shadow-md shadow-cyan-600/20"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Updating Core...' : 'Sync System Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 2/6: Plans & Topup Rates */}
        {activeTab === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4 hover:border-slate-300 transition-all">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">PE {plan.name}</h3>
                    <div className="p-1 rounded bg-slate-100 border border-slate-200 text-[10px] font-mono text-cyan-800">{plan.id}</div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">ధర (Price INR)</label>
                      <input
                        type="number"
                        value={plan.priceINR}
                        onChange={(e) => updatePlan(plan.id, 'priceINR', parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">డేటా ప్యాక్ (Data Pack GB)</label>
                      <input
                        type="number"
                        value={plan.dataPackGB}
                        onChange={(e) => {
                          const gb = parseFloat(e.target.value);
                          updatePlan(plan.id, 'dataPackGB', gb);
                          updatePlan(plan.id, 'dataPackMB', gb * 1024);
                        }}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">డైలీ లిమిట్ (Daily Limit MB)</label>
                      <input
                        type="number"
                        value={plan.dailyLimitMB}
                        onChange={(e) => updatePlan(plan.id, 'dailyLimitMB', parseInt(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">మొత్తం రిక్వెస్ట్లు (Total Requests)</label>
                      <input
                        type="text"
                        value={plan.customField1 || ''}
                        onChange={(e) => updatePlan(plan.id, 'customField1', e.target.value)}
                        placeholder="ఉదా: 5000"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase mb-1 block">రిక్వెస్ట్ కి అక్షరాలు (Chars per Request)</label>
                      <input
                        type="text"
                        value={plan.customField2 || ''}
                        onChange={(e) => updatePlan(plan.id, 'customField2', e.target.value)}
                        placeholder="ఉదా: 4 సంఖ్యలు"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-2">
                    {savedPlanIds[plan.id] ? (
                      <span className="text-[11px] font-bold text-red-600 flex items-center gap-1.5 animate-in fade-in duration-300">
                        <CheckCircle2 className="w-4 h-4 text-red-600 shrink-0" />
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
                      className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-95 ${
                        savedPlanIds[plan.id]
                          ? 'bg-red-600 hover:bg-red-700 text-white border-2 border-red-500 shadow-red-500/30 ring-2 ring-red-400/40'
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
        {activeTab === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* QR Code & UPI Config */}
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
                <QrCode className="w-4 h-4 text-cyan-600" />
                QR Code & UPI Gateway Settings
              </h3>
              <div className="grid grid-cols-1 gap-5">
                {/* 1. UPI ID Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                      యూపీఐ ఐడీ (UPI ID)
                    </label>
                    <span className="text-[10px] text-cyan-700 font-mono font-bold bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      లైవ్ UPI
                    </span>
                  </div>
                  <input
                    type="text"
                    value={config.upiId || ''}
                    onChange={(e) => setConfig({ ...config, upiId: e.target.value })}
                    placeholder="psm8742260@upi"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none font-mono shadow-sm"
                  />
                </div>

                {/* Square QR Code Board */}
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-700 block">
                    QR Code Gateway Board
                  </label>
                  
                  <div className="flex flex-col items-center justify-center">
                    <div 
                      onClick={() => qrFileInputRef.current?.click()}
                      className="w-48 h-48 sm:w-52 sm:h-52 shrink-0 bg-slate-50 border-2 border-dashed border-cyan-400 rounded-2xl p-2.5 flex flex-col items-center justify-center relative cursor-pointer hover:border-cyan-600 transition-all group overflow-hidden shadow-md"
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
                          <div className="w-10 h-10 rounded-xl bg-cyan-100 border border-cyan-300 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                            <QrCode className="w-5 h-5 text-cyan-600" />
                          </div>
                          <span className="text-xs font-bold text-slate-700">QR Board</span>
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
                        className="text-[10px] text-rose-600 hover:text-rose-700 underline font-semibold cursor-pointer mt-3"
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

              {/* 1. Three QR Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => qrFileInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-cyan-800 border border-slate-300 text-[11px] font-black hover:border-cyan-500 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Upload className="w-3.5 h-3.5" />
                  UPLOAD QR
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-cyan-600 text-white text-[11px] font-black hover:bg-cyan-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-600/20 disabled:opacity-50 active:scale-95"
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
                  className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-black hover:border-rose-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  DELETE QR
                </button>
              </div>

              {/* 2. DIRECTLY UNDER THE THREE BUTTONS: GPay, PhonePe, Paytm, Saving Card Pure Icons */}
              <div className="pt-3 border-t border-slate-200 space-y-2 text-center">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                    యాప్స్ & కార్డ్ ఐకాన్స్ (1-ట్యాప్)
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowPaymentDetailsEdit(prev => !prev)}
                    className="text-[10px] text-cyan-700 hover:text-cyan-900 font-bold underline cursor-pointer"
                  >
                    {showPaymentDetailsEdit ? 'వివరాలు దాచు' : '⚙️ వివరాలు మార్చు'}
                  </button>
                </div>

                {/* 4 Pure Compact Round Icons Only */}
                <div className="flex items-center justify-center gap-3.5 py-1">
                  {/* Google Pay Icon */}
                  <button
                    type="button"
                    onClick={() => handleAdminOpenApp('gpay')}
                    className="w-11 h-11 rounded-full bg-white hover:bg-slate-50 border-2 border-blue-400 hover:border-blue-600 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer transition-all active:scale-90 shrink-0"
                    title="Google Pay"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                  </button>

                  {/* PhonePe Icon */}
                  <button
                    type="button"
                    onClick={() => handleAdminOpenApp('phonepe')}
                    className="w-11 h-11 rounded-full bg-[#5f259f] hover:bg-[#521f8a] border-2 border-purple-300 shadow-md hover:shadow-lg flex items-center justify-center text-white cursor-pointer transition-all active:scale-90 shrink-0"
                    title="PhonePe"
                  >
                    <span className="font-sans font-black text-lg leading-none select-none">पे</span>
                  </button>

                  {/* Paytm Icon */}
                  <button
                    type="button"
                    onClick={() => handleAdminOpenApp('paytm')}
                    className="w-11 h-11 rounded-full bg-white hover:bg-slate-50 border-2 border-sky-400 hover:border-sky-600 shadow-md hover:shadow-lg flex items-center justify-center cursor-pointer transition-all active:scale-90 shrink-0"
                    title="Paytm"
                  >
                    <span className="font-sans font-black text-[11px] text-[#002e6e] tracking-tight select-none">
                      Pay<span className="text-[#00baf2]">tm</span>
                    </span>
                  </button>

                  {/* Saving Card Icon */}
                  <button
                    type="button"
                    onClick={handleAdminSaveCard}
                    className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-md hover:shadow-lg border-2 shrink-0 ${
                      adminCardSaved 
                        ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-300' 
                        : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-500 text-emerald-700'
                    }`}
                    title="సేవింగ్ కార్డు (నంబరు & IFSC ఆటో సేవ్)"
                  >
                    <CreditCard className="w-5 h-5" />
                  </button>
                </div>

                {/* Auto-Loaded Card & IFSC Details Chip when 'సేవింగ్ కార్డు' is touched */}
                {adminCardSaved && (
                  <div className="p-3.5 rounded-2xl bg-emerald-50 border-2 border-emerald-400 space-y-2 animate-in fade-in duration-300 shadow-sm">
                    <div className="flex items-center justify-between border-b border-emerald-200 pb-1.5">
                      <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        కార్డ్ వివరాలు ఆటోమేటిక్‌గా సేవ్ అయ్యాయి (Auto-Saved Details):
                      </span>
                      <span className="text-[10px] font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        COPIED
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-white rounded-xl border border-emerald-200 flex justify-between items-center">
                        <span className="text-slate-600 font-medium text-[11px]">ఖాతా/కార్డ్ నంబరు:</span>
                        <span className="font-mono font-bold text-slate-900">{config.accountNumber || '8466062260'}</span>
                      </div>
                      <div className="p-2 bg-white rounded-xl border border-emerald-200 flex justify-between items-center">
                        <span className="text-slate-600 font-medium text-[11px]">IFSC కోడ్:</span>
                        <span className="font-mono font-bold text-emerald-800">{config.ifscCode || 'PYTM0123456'}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 px-1 pt-0.5">
                      <span>ఖాతాదారు: <strong className="text-slate-800">{config.accountHolderName || 'AI Recharge PSM'}</strong></span>
                      <span>బ్యాంక్: <strong className="text-slate-800">{config.bankName || 'Paytm Payments Bank / SBI'}</strong></span>
                    </div>
                  </div>
                )}

                {/* Optional Expandable Configuration Box (if Admin wishes to edit phone numbers / bank details) */}
                {showPaymentDetailsEdit && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-300 space-y-3 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-800">పేమెంట్ యాప్స్ & బ్యాంక్ ఫీడింగ్ వివరాలు</h4>
                      <button
                        type="button"
                        onClick={handleSaveConfig}
                        disabled={isSaving}
                        className="px-3 py-1 bg-cyan-600 text-white text-[10px] font-bold rounded-lg hover:bg-cyan-700 transition-colors"
                      >
                        {isSaving ? 'సేవ్ అవుతోంది...' : 'సేవ్ చేయండి'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">GPay నంబర్/UPI</label>
                        <input
                          type="text"
                          value={config.googlePayNumber || ''}
                          onChange={(e) => setConfig({ ...config, googlePayNumber: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none font-mono"
                          placeholder="8466062260"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">PhonePe నంబర్/UPI</label>
                        <input
                          type="text"
                          value={config.phonePeNumber || ''}
                          onChange={(e) => setConfig({ ...config, phonePeNumber: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none font-mono"
                          placeholder="8466062260"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">Paytm నంబర్/UPI</label>
                        <input
                          type="text"
                          value={config.paytmNumber || ''}
                          onChange={(e) => setConfig({ ...config, paytmNumber: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none font-mono"
                          placeholder="8466062260"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">ఖాతా / కార్డ్ నంబరు</label>
                        <input
                          type="text"
                          value={config.accountNumber || ''}
                          onChange={(e) => setConfig({ ...config, accountNumber: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none font-mono"
                          placeholder="8466062260"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 block mb-1">IFSC కోడ్</label>
                        <input
                          type="text"
                          value={config.ifscCode || ''}
                          onChange={(e) => setConfig({ ...config, ifscCode: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 outline-none font-mono uppercase"
                          placeholder="PYTM0123456"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dynamic Data Pack Management Cards - 5 Boards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  Data Pack Inventory Management ({topups.length} Boards)
                </h3>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3 py-1 rounded-full">
                  మొత్తం 5 డేటా బోర్డులు
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {topups.map((tp) => (
                  <div key={tp.id} className="p-6 rounded-3xl bg-white border border-slate-200 flex flex-col justify-between hover:border-emerald-500 shadow-sm transition-all group">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200 uppercase font-mono">
                          Board #{tp.id.replace('topup-', '').toUpperCase()}
                        </span>
                        <Zap className="w-4 h-4 text-emerald-600" />
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Pack Name</label>
                          <input 
                            type="text" 
                            value={tp.name} 
                            onChange={(e) => setTopups(prev => prev.map(p => p.id === tp.id ? { ...p, name: e.target.value } : p))}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:border-emerald-600 focus:bg-white outline-none"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Price (₹)</label>
                            <input 
                              type="number" 
                              value={tp.priceINR} 
                              onChange={(e) => setTopups(prev => prev.map(p => p.id === tp.id ? { ...p, priceINR: parseInt(e.target.value) || 0 } : p))}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-emerald-700 font-bold outline-none"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Data (MB)</label>
                            <input 
                              type="number" 
                              value={tp.dataMB} 
                              onChange={(e) => setTopups(prev => prev.map(p => p.id === tp.id ? { ...p, dataMB: parseInt(e.target.value) || 0 } : p))}
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-cyan-700 font-bold outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSaveTopups()}
                      disabled={isSaving}
                      className="w-full mt-6 py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 border border-slate-200 cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" />
                      {isSaving ? 'సేవ్ అవుతోంది...' : 'Feed & Save'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* PWA / TWA Integration Details */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-md space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-600" />
                <h4 className="text-sm font-bold text-slate-900">PWA & Mobile Web Support</h4>
              </div>
              <p className="text-xs text-slate-600">
                PWA / TWA standalone web app and mobile browser configurations are active for all users.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4/6: User Database */}
        {activeTab === 3 && (
          <div className="rounded-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider">User / ID</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Plan</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Data Remaining</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.avatar} className="w-8 h-8 rounded-full border border-slate-300" alt="" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{u.name}</div>
                            <div className="text-[10px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-800">{u.activePlanName}</div>
                        <div className="text-[10px] text-slate-500">ID: {u.activePlanId}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-cyan-700 font-bold">
                        {(u.dataPackMBRemaining / 1024).toFixed(2)} / {(u.dataPackMBTotal / 1024).toFixed(1)} GB
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${u.isAdmin ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
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
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-3">
              <ShieldAlert className="w-4 h-4 text-red-600" />
              Admin Master Credentials & Security
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Primary Admin Email</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Admin Mobile Number</label>
                <input
                  type="text"
                  value={adminMobile}
                  onChange={(e) => setAdminMobile(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Master Password</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-2">Master Security PIN</label>
                <input
                  type="text"
                  value={masterPin}
                  onChange={(e) => setMasterPin(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white outline-none font-mono"
                  placeholder="6606.0k"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={handleSaveSecurity}
                disabled={isSaving}
                className="px-4 py-2 rounded-lg bg-red-600 text-white text-[10px] font-black hover:bg-red-700 transition-all flex items-center gap-1.5 disabled:opacity-50 shadow-md cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Credentials'}
              </button>
            </div>
          </div>
        )}

        {/* Tab 5/6: Security ends */}

        {/* Tab 6/6: cPanel ZIP Deployment */}
        {activeTab === 5 && (
          <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Main ZIP Download Card */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-50/80 via-white to-cyan-50/80 border border-emerald-300 shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-600 p-0.5 shadow-md shrink-0 flex items-center justify-center text-white">
                    <FileArchive className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                        cPanel హోస్టింగ్ ZIP బండిల్
                      </h3>
                      <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full shadow-sm">
                        {bundleSize} ZIP
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-cyan-100 text-cyan-800 border border-cyan-300 rounded-full">
                        పూర్తి ప్యాకేజీ (~37 MB)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 max-w-xl">
                      మీ AI రీఛార్జ్ మోడల్స్ పోర్టల్‌ని నేరుగా cPanel వెబ్ హోస్టింగ్‌లో అప్‌లోడ్ చేసి లైవ్ రన్ చేయడానికి అవసరమైన పూర్తి ప్రొడక్షన్ బండిల్ (పరిమాణం: {bundleSize} / ~37 MB).
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={isDownloadingZip}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-black text-xs shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-80"
                  >
                    {isDownloadingZip ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-white" />
                        <span>డౌన్‌లోడ్ అవుతోంది...</span>
                      </>
                    ) : downloadSuccess ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-white" />
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
                    className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-cyan-800 font-bold text-xs border border-slate-300 flex items-center justify-center gap-2 transition-all shadow-sm text-center cursor-pointer"
                    title="డైరెక్ట్ లింక్ డౌన్‌లోడ్"
                  >
                    <FolderDown className="w-4 h-4 text-cyan-600" />
                    <span>డైరెక్ట్ సేవ్ (38 MB)</span>
                  </a>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="relative z-10 pt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleCopyZipUrl}
                    className="px-3 py-2 rounded-lg bg-white border border-slate-300 hover:border-cyan-500 text-slate-700 hover:text-cyan-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {copiedZipUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">డౌన్‌లోడ్ లింక్ కాపీ అయింది!</span>
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
                      className="px-3 py-2 rounded-lg bg-white border border-slate-300 hover:border-emerald-500 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>ఎక్స్‌పోర్ట్ మోడల్ ఓపెన్ చేయండి</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] font-mono text-slate-500 flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ఫైల్ పాత్: /cpanel-bundle.zip</span>
                </div>
              </div>
            </div>



            {/* GitHub to cPanel Auto-Deployment (CI/CD) Section */}
            <div className="p-6 sm:p-8 rounded-3xl space-y-6 border border-cyan-200 bg-gradient-to-br from-cyan-50/50 via-white to-slate-50 shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 p-0.5 shadow-md shrink-0 flex items-center justify-center text-white">
                    <GitBranch className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg sm:text-xl font-black text-slate-900">
                        GitHub ➔ cPanel ఆటో-డిప్లాయ్‌మెంట్ (Auto-Deploy)
                      </h4>
                      <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full flex items-center gap-1 shadow-sm">
                        <RefreshCw className="w-3 h-3 text-emerald-600 animate-spin" />
                        లైవ్ సింక్ సిద్ధంగా ఉంది
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      మీరు GitHub లో కోడ్ పుష్ చేయగానే ఆటోమేటిక్‌గా ప్రొడక్షన్ బిల్డ్ అయి మీ cPanel సర్వర్ (<code className="text-cyan-700 font-mono text-[11px] font-bold">arm.phrscrowd.online</code>) కి చేరిపోతుంది.
                    </p>
                  </div>
                </div>
              </div>

              {/* How it works visual pipeline */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 relative z-10">
                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Git Push</div>
                    <div className="text-[10px] text-slate-500">GitHub కి కోడ్ పంపడం</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    2
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">GitHub Actions</div>
                    <div className="text-[10px] text-slate-500">npm run build రన్ అవుతుంది</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 font-bold text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">FTP Sync</div>
                    <div className="text-[10px] text-slate-500">cPanel కి ఫైల్స్ చేరతాయి</div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-emerald-300 bg-emerald-50/50 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-800">వెంటనే లైవ్</div>
                    <div className="text-[10px] text-slate-500">arm.phrscrowd.online</div>
                  </div>
                </div>
              </div>

              {/* GitHub Settings Instructions Box */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-700" />
                  <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                    GitHub లో చేయవలసిన 1-నిమిషం సెట్టింగ్ (GitHub Secrets)
                  </h5>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  మీ GitHub రిపాజిటరీలో <span className="text-slate-900 font-bold">Settings ➔ Secrets and variables ➔ Actions</span> కి వెళ్ళి <span className="text-emerald-700 font-bold">"New repository secret"</span> క్లిక్ చేసి కింద ఇచ్చిన విలువలను జోడించండి:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-sm">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">Secret Name:</div>
                      <code className="text-cyan-800 font-mono font-bold text-xs">FTP_PASSWORD</code>
                      <div className="text-[10px] text-slate-500 mt-0.5">మీ cPanel / FTP పాస్‌వర్డ్</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText('FTP_PASSWORD', 'FTP_PASSWORD')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200 shadow-sm"
                    >
                      {copiedSecretKey === 'FTP_PASSWORD' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecretKey === 'FTP_PASSWORD' ? 'కాపీడ్!' : 'పేరు కాపీ'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-sm">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">FTP Server (ఆటోమేటిక్):</div>
                      <code className="text-slate-700 font-mono text-xs">phrscrowd.online</code>
                      <div className="text-[10px] text-slate-500 mt-0.5">డిఫాల్ట్‌గా సెట్ చేయబడింది</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText('phrscrowd.online', 'FTP_SERVER')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200 shadow-sm"
                    >
                      {copiedSecretKey === 'FTP_SERVER' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecretKey === 'FTP_SERVER' ? 'కాపీడ్!' : 'కాపీ'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-sm">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">FTP Username (ఆటోమేటిక్):</div>
                      <code className="text-slate-700 font-mono text-xs">phrscrow</code>
                      <div className="text-[10px] text-slate-500 mt-0.5">డిఫాల్ట్‌గా సెట్ చేయబడింది</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText('phrscrow', 'FTP_USERNAME')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200 shadow-sm"
                    >
                      {copiedSecretKey === 'FTP_USERNAME' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecretKey === 'FTP_USERNAME' ? 'కాపీడ్!' : 'కాపీ'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-sm">
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold">Server Directory (ఆటోమేటిక్):</div>
                      <code className="text-slate-700 font-mono text-xs">/public_html/arm/</code>
                      <div className="text-[10px] text-slate-500 mt-0.5">డిఫాల్ట్‌గా సెట్ చేయబడింది</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyText('/public_html/arm/', 'FTP_DIR')}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer border border-slate-200 shadow-sm"
                    >
                      {copiedSecretKey === 'FTP_DIR' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSecretKey === 'FTP_DIR' ? 'కాపీడ్!' : 'కాపీ'}</span>
                    </button>
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
