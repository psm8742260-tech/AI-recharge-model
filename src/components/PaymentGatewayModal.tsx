import React, { useState, useEffect } from 'react';
import { SUBSCRIPTION_PLANS, TOP_UP_PACKS, SubscriptionPlan, TopUpPack } from '../data/plansData';
import { UserAccount } from '../types';
import confetti from 'canvas-confetti';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Key,
  Copy,
  Check,
  ArrowRight,
  QrCode,
  ArrowLeft,
  CreditCard,
  Zap,
  ExternalLink,
} from 'lucide-react';

interface PaymentGatewayModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onRechargeSuccess: (data: { user: UserAccount; generatedKey: string }) => void;
  onOpenPlayground: () => void;
}

export const PaymentGatewayModal: React.FC<PaymentGatewayModalProps> = ({
  isOpen,
  onClose,
  user,
  onRechargeSuccess,
  onOpenPlayground,
}) => {
  // activeBoard: 1 = Plans Selection, 2 = Payment QR Gateway, 3 = API Key Success
  const [activeBoard, setActiveBoard] = useState<1 | 2 | 3>(1);
  const [activeTab, setActiveTab] = useState<'plans' | 'topups'>('plans');
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
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(() => {
    try {
      const cached = localStorage.getItem('airecharge_plans');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch (e) {}
    return SUBSCRIPTION_PLANS[0];
  });
  const [selectedTopUp, setSelectedTopUp] = useState<TopUpPack>(TOP_UP_PACKS[0]);
  const [upiId, setUpiId] = useState('psm8742260@upi');
  const [utrRef, setUtrRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isPaymentEnabled, setIsPaymentEnabled] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('airecharge_config');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed.isPaymentEnabled === 'boolean') return parsed.isPaymentEnabled;
      }
    } catch (e) {}
    return false;
  });
  const [paytmNumber, setPaytmNumber] = useState('8466062260');
  const [googlePayNumber, setGooglePayNumber] = useState('8466062260');
  const [phonePeNumber, setPhonePeNumber] = useState('8466062260');
  const [accountNumber, setAccountNumber] = useState('8466062260');
  const [ifscCode, setIfscCode] = useState('PYTM0123456');
  const [accountHolderName, setAccountHolderName] = useState('AI Recharge PSM');
  const [bankName, setBankName] = useState('Paytm Payments Bank / SBI');
  const [cardPaymentDetails, setCardPaymentDetails] = useState('RuPay, Visa, MasterCard, All Debit/Credit Cards & Net Banking');
  const [isCardPaymentEnabled, setIsCardPaymentEnabled] = useState(true);
  const [isCardSaved, setIsCardSaved] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const handleCopyPaymentInfo = (text: string, type: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 3000);
  };

  const handleOpenPaymentApp = (app: 'gpay' | 'phonepe' | 'paytm') => {
    const amount = activeTab === 'plans' ? selectedPlan.priceINR : selectedTopUp.priceINR;
    const targetUpi = (upiId || 'psm8742260@upi').trim();
    const planTitle = activeTab === 'plans' ? selectedPlan.name : selectedTopUp.name;
    const note = encodeURIComponent(`AI Recharge ${planTitle}`);

    let androidIntent = '';
    let fallbackScheme = '';
    let appLabel = '';

    if (app === 'gpay') {
      appLabel = 'Google Pay';
      androidIntent = `intent://pay?pa=${encodeURIComponent(targetUpi)}&pn=AI%20Recharge&am=${amount}&cu=INR&tn=${note}#Intent;scheme=upi;package=com.google.android.apps.nbu.paisa.user;end`;
      fallbackScheme = `tez://upi/pay?pa=${encodeURIComponent(targetUpi)}&pn=AI%20Recharge&am=${amount}&cu=INR&tn=${note}`;
    } else if (app === 'phonepe') {
      appLabel = 'PhonePe';
      androidIntent = `intent://pay?pa=${encodeURIComponent(targetUpi)}&pn=AI%20Recharge&am=${amount}&cu=INR&tn=${note}#Intent;scheme=upi;package=com.phonepe.app;end`;
      fallbackScheme = `phonepe://pay?pa=${encodeURIComponent(targetUpi)}&pn=AI%20Recharge&am=${amount}&cu=INR&tn=${note}`;
    } else if (app === 'paytm') {
      appLabel = 'Paytm';
      androidIntent = `intent://pay?pa=${encodeURIComponent(targetUpi)}&pn=AI%20Recharge&am=${amount}&cu=INR&tn=${note}#Intent;scheme=upi;package=net.one97.paytm;end`;
      fallbackScheme = `paytmmp://pay?pa=${encodeURIComponent(targetUpi)}&pn=AI%20Recharge&am=${amount}&cu=INR&tn=${note}`;
    }

    const universalUpi = `upi://pay?pa=${encodeURIComponent(targetUpi)}&pn=AI%20Recharge&am=${amount}&cu=INR&tn=${note}`;
    const copyVal = app === 'gpay' 
      ? (googlePayNumber || targetUpi) 
      : app === 'phonepe' 
      ? (phonePeNumber || targetUpi) 
      : (paytmNumber || targetUpi);

    navigator.clipboard.writeText(copyVal).catch(() => {});
    setCopiedType(app);
    setTimeout(() => setCopiedType(null), 3500);

    const isAndroid = typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent);
    const targetUrl = isAndroid ? androidIntent : fallbackScheme;

    try {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.target = '_top';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) document.body.removeChild(a);
      }, 200);
    } catch (e) {
      try {
        if (window.top) window.top.location.href = fallbackScheme;
        else window.location.href = fallbackScheme;
      } catch (e2) {
        window.open(universalUpi, '_top');
      }
    }
  };

  const handleSaveCardAndIfsc = () => {
    const cardNum = accountNumber || '8466062260';
    const ifsc = ifscCode || 'PYTM0123456';
    const name = accountHolderName || 'AI Recharge PSM';
    const bName = bankName || 'Paytm Payments Bank / SBI';

    const fullInfo = `ఖాతా / కార్డ్ నంబరు: ${cardNum}\nIFSC కోడ్: ${ifsc}\nఖాతాదారుని పేరు: ${name}\nబ్యాంక్: ${bName}`;
    navigator.clipboard.writeText(fullInfo).catch(() => {});
    setIsCardSaved(true);
    setCopiedType('cardsave');
    setTimeout(() => setCopiedType(null), 4000);
  };

  // Every time modal opens, ALWAYS reset to Board 1
  useEffect(() => {
    if (isOpen) {
      setActiveBoard(1);
      setGeneratedApiKey(null);
      setUtrRef('');
      fetchPlans();
    }
  }, [isOpen]);

  useEffect(() => {
    const handlePlansUpdated = (event: any) => {
      if (event.detail) {
        if (Array.isArray(event.detail)) {
          setPlans(event.detail);
          setSelectedPlan((prev) => event.detail.find((p: any) => p.id === prev.id) || event.detail[0]);
        } else {
          if (Array.isArray(event.detail.plans)) {
            setPlans(event.detail.plans);
            setSelectedPlan((prev) => event.detail.plans.find((p: any) => p.id === prev.id) || event.detail.plans[0]);
          }
          if (Array.isArray(event.detail.topups)) {
            setTopups(event.detail.topups);
            setSelectedTopUp((prev) => event.detail.topups.find((t: any) => t.id === prev.id) || event.detail.topups[0]);
          }
        }
      }
    };

    const handleConfigUpdated = (event: any) => {
      if (event.detail) {
        if (typeof event.detail.isPaymentEnabled === 'boolean') {
          setIsPaymentEnabled(event.detail.isPaymentEnabled);
        }
        if (event.detail.qrCodeUrl !== undefined) {
          setQrCodeUrl(event.detail.qrCodeUrl);
        }
        if (event.detail.upiId) {
          setUpiId(event.detail.upiId);
        }
        if (event.detail.paytmNumber !== undefined) {
          setPaytmNumber(event.detail.paytmNumber);
        }
        if (event.detail.googlePayNumber !== undefined) {
          setGooglePayNumber(event.detail.googlePayNumber);
        }
        if (event.detail.phonePeNumber !== undefined) {
          setPhonePeNumber(event.detail.phonePeNumber);
        }
        if (event.detail.accountNumber !== undefined) {
          setAccountNumber(event.detail.accountNumber);
        }
        if (event.detail.ifscCode !== undefined) {
          setIfscCode(event.detail.ifscCode);
        }
        if (event.detail.accountHolderName !== undefined) {
          setAccountHolderName(event.detail.accountHolderName);
        }
        if (event.detail.bankName !== undefined) {
          setBankName(event.detail.bankName);
        }
        if (event.detail.cardPaymentDetails !== undefined) {
          setCardPaymentDetails(event.detail.cardPaymentDetails);
        }
        if (typeof event.detail.isCardPaymentEnabled === 'boolean') {
          setIsCardPaymentEnabled(event.detail.isCardPaymentEnabled);
        }
      }
    };

    window.addEventListener('airecharge_plans_updated', handlePlansUpdated);
    window.addEventListener('airecharge_config_updated', handleConfigUpdated);
    return () => {
      window.removeEventListener('airecharge_plans_updated', handlePlansUpdated);
      window.removeEventListener('airecharge_config_updated', handleConfigUpdated);
    };
  }, []);

  const fetchPlans = async () => {
    try {
      const cachedPlans = localStorage.getItem('airecharge_plans');
      if (cachedPlans) {
        const parsed = JSON.parse(cachedPlans);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPlans(parsed);
          setSelectedPlan((prev) => parsed.find((p: any) => p.id === prev.id) || parsed[0]);
        }
      }

      const cachedTopups = localStorage.getItem('airecharge_topups');
      if (cachedTopups) {
        const parsed = JSON.parse(cachedTopups);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTopups(parsed);
          setSelectedTopUp((prev) => parsed.find((p: any) => p.id === prev.id) || parsed[0]);
        }
      }

      const cachedConfig = localStorage.getItem('airecharge_config');
      if (cachedConfig) {
        try {
          const cfg = JSON.parse(cachedConfig);
          if (cfg.upiId) setUpiId(cfg.upiId);
          if (cfg.qrCodeUrl !== undefined) setQrCodeUrl(cfg.qrCodeUrl);
          if (typeof cfg.isPaymentEnabled === 'boolean') setIsPaymentEnabled(cfg.isPaymentEnabled);
          if (cfg.paytmNumber) setPaytmNumber(cfg.paytmNumber);
          if (cfg.googlePayNumber) setGooglePayNumber(cfg.googlePayNumber);
          if (cfg.phonePeNumber) setPhonePeNumber(cfg.phonePeNumber);
          if (cfg.accountNumber) setAccountNumber(cfg.accountNumber);
          if (cfg.ifscCode) setIfscCode(cfg.ifscCode);
          if (cfg.accountHolderName) setAccountHolderName(cfg.accountHolderName);
          if (cfg.bankName) setBankName(cfg.bankName);
          if (cfg.cardPaymentDetails) setCardPaymentDetails(cfg.cardPaymentDetails);
          if (typeof cfg.isCardPaymentEnabled === 'boolean') setIsCardPaymentEnabled(cfg.isCardPaymentEnabled);
        } catch (e) {}
      }

      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.plans && data.plans.length > 0) {
        setPlans(data.plans);
        setSelectedPlan((prev) => data.plans.find((p: any) => p.id === prev.id) || data.plans[0]);
        localStorage.setItem('airecharge_plans', JSON.stringify(data.plans));
      }
      if (data.topups && data.topups.length > 0) {
        setTopups(data.topups);
        setSelectedTopUp((prev) => data.topups.find((p: any) => p.id === prev.id) || data.topups[0]);
        localStorage.setItem('airecharge_topups', JSON.stringify(data.topups));
      }
      if (data.config) {
        if (data.config.upiId) setUpiId(data.config.upiId);
        if (data.config.qrCodeUrl !== undefined) setQrCodeUrl(data.config.qrCodeUrl);
        if (typeof data.config.isPaymentEnabled === 'boolean') {
          setIsPaymentEnabled(data.config.isPaymentEnabled);
        }
        if (data.config.paytmNumber) setPaytmNumber(data.config.paytmNumber);
        if (data.config.googlePayNumber) setGooglePayNumber(data.config.googlePayNumber);
        if (data.config.phonePeNumber) setPhonePeNumber(data.config.phonePeNumber);
        if (data.config.accountNumber) setAccountNumber(data.config.accountNumber);
        if (data.config.ifscCode) setIfscCode(data.config.ifscCode);
        if (data.config.accountHolderName) setAccountHolderName(data.config.accountHolderName);
        if (data.config.bankName) setBankName(data.config.bankName);
        if (data.config.cardPaymentDetails) setCardPaymentDetails(data.config.cardPaymentDetails);
        if (typeof data.config.isCardPaymentEnabled === 'boolean') {
          setIsCardPaymentEnabled(data.config.isCardPaymentEnabled);
        }
      }
    } catch (err) {
      console.error('Failed to fetch plans config:', err);
    }
  };

  if (!isOpen) return null;

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    try {
      const isTopUp = activeTab === 'topups';
      const effectivePrice = isPaymentEnabled ? (isTopUp ? selectedTopUp.priceINR : selectedPlan.priceINR) : 0;
      const effectiveMethod = isPaymentEnabled 
        ? `UPI QR (${upiId}${utrRef ? ` / UTR: ${utrRef}` : ''})`
        : 'ట్రైలర్ ఉచిత యాక్టివేషన్ (Trailer Free Mode)';

      const body = isTopUp
        ? {
            planId: selectedTopUp.id,
            planName: selectedTopUp.name,
            durationMonths: 0,
            priceINR: effectivePrice,
            dataPackMB: selectedTopUp.dataMB,
            dailyLimitMB: user?.dailyLimitMB || 800,
            paymentMethod: effectiveMethod,
          }
        : {
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            durationMonths: selectedPlan.durationMonths,
            priceINR: effectivePrice,
            dataPackGB: selectedPlan.dataPackGB,
            dailyLimitMB: selectedPlan.dailyLimitMB,
            paymentMethod: effectiveMethod,
          };

      const res = await fetch('/api/plans/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setGeneratedApiKey(data.generatedKey);
        onRechargeSuccess({ user: data.user, generatedKey: data.generatedKey });

        // Trigger Confetti Celebration
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
        });

        // Transition to Board 3 (API Key Ready)
        setActiveBoard(3);
      }
    } catch (err) {
      console.error('Payment execution error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto p-3 sm:p-6 flex items-start justify-center bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-5xl w-full p-4 sm:p-8 relative shadow-2xl space-y-6 my-4 sm:my-8 max-h-[92vh] overflow-y-auto">
        
        {/* Top Close Button */}
        <button
          onClick={() => {
            setActiveBoard(1);
            setGeneratedApiKey(null);
            onClose();
          }}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-all shadow-md z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* BOARD 1: SUBSCRIPTION PLANS & DATA PACKS SELECTION */}
        {activeBoard === 1 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                PE Money Gateway - Subscription Plans
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Select Subscription Plan
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Choose your quota duration to unlock <span className="text-cyan-400 font-bold">ALL 26 AI Models & Agents</span> with high-speed proxy gateway.
              </p>

              {/* Sub-tabs: Plans vs Topups */}
              <div className="mt-4 flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800 w-fit">
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'plans'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Subscription Plans (1-3 Months)
                </button>
                <button
                  onClick={() => setActiveTab('topups')}
                  className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeTab === 'topups'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Micro Top-Up Packs
                </button>
              </div>
            </div>

            {/* Plans Grid */}
            {activeTab === 'plans' ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 min-w-0">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all relative min-w-0 ${
                      selectedPlan.id === plan.id
                        ? 'bg-slate-850 border-cyan-500 shadow-xl shadow-cyan-500/10'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {plan.badge && (
                      <span className="absolute -top-3 left-4 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 shadow-md">
                        {plan.badge}
                      </span>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h3 className="text-base font-extrabold text-white">{plan.name}</h3>
                        <div className="text-xs text-slate-400 font-medium">
                          {plan.durationMonths} Month{plan.durationMonths > 1 ? 's' : ''} Validity
                        </div>
                      </div>

                      <div className="py-2">
                        {isPaymentEnabled ? (
                          <>
                            <div className="text-3xl font-extrabold font-mono text-cyan-400">
                              ₹{plan.priceINR}
                            </div>
                            <div className="text-[11px] text-slate-400 font-medium">
                              ${plan.priceUSD} USD / total
                            </div>
                          </>
                        ) : (
                          <div className="text-sm font-black font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl w-fit">
                            ట్రైలర్ ఉచితం (Trailer Free)
                          </div>
                        )}
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Data Pack:</span>
                          <span className="font-bold text-cyan-300 font-mono">{plan.dataPackGB} GB</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Daily Limit:</span>
                          <span className="font-bold text-emerald-400 font-mono">{plan.dailyLimitMB} MB/day</span>
                        </div>
                        {plan.customField1 && (
                          <div className="flex items-center justify-between text-slate-300 border-t border-slate-800 pt-1 mt-1">
                            <span>Total Requests:</span>
                            <span className="font-bold text-cyan-400 font-mono">{plan.customField1}</span>
                          </div>
                        )}
                        {plan.customField2 && (
                          <div className="flex items-center justify-between text-slate-300">
                            <span>Chars/Request:</span>
                            <span className="font-bold text-cyan-400 font-mono">{plan.customField2}</span>
                          </div>
                        )}
                      </div>

                      <ul className="space-y-1.5 pt-2">
                        {plan.features.slice(2).map((feat, idx) => (
                          <li key={idx} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlan(plan);
                          setActiveBoard(2); // Go directly to Board 2
                        }}
                        className={`w-full py-2.5 rounded-xl text-center text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                          selectedPlan.id === plan.id
                            ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-cyan-500/20'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isPaymentEnabled ? 'Buy Now' : 'ట్రైలర్ యాక్టివేట్ (Free)'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Top-ups Grid */
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {topups.map((topup) => (
                  <div
                    key={topup.id}
                    onClick={() => setSelectedTopUp(topup)}
                    className={`p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                      selectedTopUp.id === topup.id
                        ? 'bg-slate-850 border-cyan-500 shadow-xl shadow-cyan-500/10'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="space-y-2">
                      <h3 className="text-base font-extrabold text-white">{topup.name}</h3>
                      <p className="text-xs text-slate-300 leading-relaxed">{topup.description}</p>
                      <div className="pt-2 text-xl font-mono font-extrabold text-emerald-400">
                        {isPaymentEnabled ? `₹${topup.priceINR}` : 'ట్రైలర్ ఉచితం (Free)'}{' '}
                        <span className="text-xs font-normal text-slate-400">/ +{topup.dataMB} MB</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTopUp(topup);
                          setActiveBoard(2); // Go directly to Board 2
                        }}
                        className={`w-full py-2.5 rounded-xl text-center text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                          selectedTopUp.id === topup.id
                            ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-cyan-500/20'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isPaymentEnabled ? 'Buy Now' : 'ట్రైలర్ యాక్టివేట్ (Free)'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 flex items-center justify-center border-t border-slate-800">
              <div className="text-[10px] text-slate-500 flex items-center gap-2 uppercase tracking-widest font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Secure Hybrid Gateway Payment System
              </div>
            </div>
          </div>
        )}

        {/* BOARD 2: PAYMENT GATEWAY QR OR TRAILER ACTIVATION */}
        {activeBoard === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <button
                onClick={() => setActiveBoard(1)}
                className="text-xs text-cyan-400 hover:underline mb-2 inline-block flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Subscription Plans
              </button>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                {isPaymentEnabled 
                  ? 'Payment Gateway - Scan & Pay (PhonePe / GPay / UPI)' 
                  : 'ట్రైలర్ టెస్టింగ్ యాక్టివేషన్ (Trailer Mode Instant Activation)'}
              </h2>
              <p className="text-xs text-slate-400">
                {isPaymentEnabled 
                  ? 'Scan the QR code below or pay via UPI address to complete your recharge.'
                  : 'ప్రస్తుతం ట్రైలర్ మోడ్ యాక్టివ్‌గా ఉంది. ఎటువంటి పేమెంట్ లేదా QR కోడ్ అవసరం లేకుండా నేరుగా ఉచితంగా యాక్టివేట్ చేసుకోండి.'}
              </p>
            </div>

            {/* Order Summary */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 font-medium block">Selected Pack</span>
                <span className="text-base font-extrabold text-white">
                  {activeTab === 'plans' ? selectedPlan.name : selectedTopUp.name}
                </span>
                <div className="text-xs text-cyan-400 font-mono mt-0.5">
                  {activeTab === 'plans' ? `${selectedPlan.dataPackGB} GB AI Data Pack` : `${selectedTopUp.dataMB} MB Boost`}
                </div>
              </div>

              <div className="text-right">
                {isPaymentEnabled ? (
                  <>
                    <span className="text-2xl font-extrabold font-mono text-emerald-400">
                      ₹{activeTab === 'plans' ? selectedPlan.priceINR : selectedTopUp.priceINR}
                    </span>
                    <span className="text-[10px] text-slate-500 block">All taxes included</span>
                  </>
                ) : (
                  <>
                    <span className="text-base font-black font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl inline-block">
                      ఉచితం (₹0)
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">ట్రైలర్ మోడ్ యాక్టివ్</span>
                  </>
                )}
              </div>
            </div>

            {isPaymentEnabled ? (
              /* Commercial Payment Gateway with QR Code */
              <div className="space-y-4">
                <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 text-center space-y-4 shadow-xl max-w-md mx-auto">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5" /> Unified UPI QR Gateway
                    </span>
                  </div>

                  {/* QR Code Canvas Box or Dynamic Image */}
                  <div className="w-56 h-56 mx-auto bg-white p-2 rounded-2xl shadow-xl flex items-center justify-center border-2 border-cyan-400/60 overflow-hidden">
                    {qrCodeUrl ? (
                      <img src={qrCodeUrl} alt="UPI QR" className="w-full h-full object-contain" />
                    ) : (
                      <div className="w-full h-full border-4 border-slate-900 rounded-xl p-2.5 flex flex-col justify-between bg-slate-50 relative">
                        <div className="flex justify-between">
                          <div className="w-10 h-10 bg-slate-900 rounded-lg"></div>
                          <div className="w-8 h-8 bg-slate-900 rounded-lg"></div>
                        </div>
                        <div className="text-center font-mono font-black text-slate-900 text-xs tracking-tight py-1 bg-cyan-100 rounded border border-cyan-300">
                          SCAN & PAY ₹{activeTab === 'plans' ? selectedPlan.priceINR : selectedTopUp.priceINR}
                        </div>
                        <div className="flex justify-between items-end">
                          <div className="w-8 h-8 bg-slate-900 rounded-lg"></div>
                          <div className="w-10 h-10 bg-slate-900 rounded-lg"></div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Direct Payment Action Buttons (Google Pay, PhonePe, Paytm, Card Saving) */}
                  <div className="space-y-3 pt-3 border-t border-slate-800 text-left">
                    <div className="text-[11px] font-bold text-slate-400 text-center uppercase tracking-wider">
                      డైరెక్ట్ చెల్లింపు బటన్లు (Payment Action Buttons)
                    </div>

                    {/* 4 Pure Compact Round Icons Only */}
                    <div className="flex items-center justify-center gap-4 py-1">
                      {/* 1. Google Pay Icon */}
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentApp('gpay')}
                        className="w-12 h-12 rounded-full bg-white hover:bg-slate-100 border-2 border-blue-400 hover:border-blue-500 shadow-lg flex items-center justify-center cursor-pointer transition-all active:scale-90 shrink-0"
                        title="Google Pay"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                        </svg>
                      </button>

                      {/* 2. PhonePe Icon */}
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentApp('phonepe')}
                        className="w-12 h-12 rounded-full bg-[#5f259f] hover:bg-[#521f8a] border-2 border-purple-400 shadow-lg flex items-center justify-center text-white cursor-pointer transition-all active:scale-90 shrink-0"
                        title="PhonePe"
                      >
                        <span className="font-sans font-black text-xl leading-none select-none">पे</span>
                      </button>

                      {/* 3. Paytm Icon */}
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentApp('paytm')}
                        className="w-12 h-12 rounded-full bg-white hover:bg-slate-100 border-2 border-sky-400 hover:border-sky-500 shadow-lg flex items-center justify-center cursor-pointer transition-all active:scale-90 shrink-0"
                        title="Paytm"
                      >
                        <span className="font-sans font-black text-xs text-[#002e6e] tracking-tight select-none">
                          Pay<span className="text-[#00baf2]">tm</span>
                        </span>
                      </button>

                      {/* 4. Saving Card & IFSC Icon */}
                      <button
                        type="button"
                        onClick={handleSaveCardAndIfsc}
                        className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all active:scale-90 shadow-lg border-2 shrink-0 ${
                          isCardSaved 
                            ? 'bg-emerald-600 border-emerald-400 text-white ring-2 ring-emerald-400/50' 
                            : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500 text-emerald-400'
                        }`}
                        title="సేవింగ్ కార్డు (నంబరు & IFSC ఆటో సేవ్)"
                      >
                        <CreditCard className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Feedback Toast Banner when any button is clicked */}
                    {copiedType && (
                      <div className="p-2.5 rounded-xl bg-cyan-950/70 border border-cyan-500/40 text-center animate-in fade-in slide-in-from-top-1 duration-300 flex items-center justify-center gap-2 shadow-md">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-xs font-bold text-cyan-200">
                          {copiedType === 'gpay' && 'Google Pay ఓపెన్ అవుతోంది... VPA నంబర్ సేవ్ అయింది!'}
                          {copiedType === 'phonepe' && 'PhonePe ఓపెన్ అవుతోంది... VPA నంబర్ సేవ్ అయింది!'}
                          {copiedType === 'paytm' && 'Paytm ఓపెన్ అవుతోంది... VPA నంబర్ సేవ్ అయింది!'}
                          {copiedType === 'cardsave' && 'నంబరు మరియు IFSC కోడ్ ఆటోమేటిక్‌గా సేవ్ అయింది!'}
                          {copiedType === 'upi' && 'UPI VPA ఐడీ కాపీ చేయబడింది!'}
                          {copiedType === 'acc' && 'ఖాతా/కార్డ్ నంబరు కాపీ చేయబడింది!'}
                          {copiedType === 'ifsc' && 'IFSC కోడ్ కాపీ చేయబడింది!'}
                        </span>
                      </div>
                    )}

                    {/* Saving Card & IFSC Automatic Details Box (When user clicks 'సేవింగ్ కార్డు') */}
                    {isCardSaved && (
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/40 space-y-2.5 animate-in fade-in zoom-in-95 duration-300 shadow-md">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>కార్డ్ / బ్యాంక్ వివరాలు ఆటోమేటిక్‌గా సేవ్ అయ్యాయి:</span>
                          </div>
                          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                            SAVED
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-400 block">ఖాతా / కార్డ్ నంబరు</span>
                              <span className="font-mono font-bold text-slate-100">{accountNumber}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyPaymentInfo(accountNumber, 'acc')}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold cursor-pointer"
                            >
                              {copiedType === 'acc' ? 'కాపీడ్!' : 'కాపీ'}
                            </button>
                          </div>

                          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                            <div>
                              <span className="text-[10px] text-slate-400 block">IFSC కోడ్</span>
                              <span className="font-mono font-bold text-emerald-300 uppercase">{ifscCode}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleCopyPaymentInfo(ifscCode, 'ifsc')}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold cursor-pointer"
                            >
                              {copiedType === 'ifsc' ? 'కాపీడ్!' : 'కాపీ'}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          <span>ఖాతాదారుని పేరు: <strong className="text-slate-200">{accountHolderName}</strong></span>
                          <span>బ్యాంక్: <strong className="text-slate-200">{bankName}</strong></span>
                        </div>
                      </div>
                    )}

                    {/* Single Line Compact UPI VPA Copy Bar */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <span className="px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold border border-cyan-500/30 shrink-0">
                          UPI VPA
                        </span>
                        <span className="text-xs font-mono font-bold text-cyan-300 truncate">{upiId}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyPaymentInfo(upiId, 'upi')}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ml-2"
                      >
                        {copiedType === 'upi' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedType === 'upi' ? 'కాపీడ్!' : 'కాపీ'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <label className="text-xs font-medium text-slate-300 block">
                    UPI Reference VPA or 12-digit UTR (Optional):
                  </label>
                  <input
                    type="text"
                    value={utrRef}
                    onChange={(e) => setUtrRef(e.target.value)}
                    placeholder="Enter 12-digit UTR or your UPI ID"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    After completing the payment in your payment app, click below to verify and generate your API key instantly.
                  </p>
                </div>

                {/* Complete Payment Button */}
                <button
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="w-full max-w-md mx-auto py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-extrabold text-sm hover:brightness-110 transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 block"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Verifying Payment & Minting API Key...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      I Have Paid - Verify & Activate API Key
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* TRAILER FREE MODE ACTIVATION BOX */
              <div className="p-8 rounded-3xl bg-slate-950 border-2 border-amber-500/40 text-center space-y-6 shadow-2xl max-w-md mx-auto animate-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/20">
                  <Sparkles className="w-8 h-8 animate-pulse" />
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full">
                    ట్రైలర్ టెస్టింగ్ మోడ్ (Trailer Mode)
                  </span>
                  <h3 className="text-xl font-black text-white">
                    ఉచిత తక్షణ యాక్టివేషన్
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    అడ్మిన్ చేత అమౌంట్స్ ఆఫ్ చేయబడ్డాయి. ఎటువంటి చెల్లింపు లేదా QR కోడ్ అవసరం లేకుండా నేరుగా ప్యాక్ మరియు API కీని ఉచితంగా యాక్టివేట్ చేసుకోండి.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-left space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span>యాక్సెస్:</span>
                    <span className="font-bold text-cyan-400">అన్ని 26 AI మోడల్స్</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>డేటా కోటా:</span>
                    <span className="font-bold text-emerald-400 font-mono">
                      {activeTab === 'plans' ? `${selectedPlan.dataPackGB} GB` : `+${selectedTopUp.dataMB} MB`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>ఖరీదు (Cost):</span>
                    <span className="font-black text-amber-400">₹0 (ఉచితం)</span>
                  </div>
                </div>

                {/* 1-Click Instant Free Activation Button */}
                <button
                  onClick={handleProcessPayment}
                  disabled={isProcessing}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 text-slate-950 font-black text-sm hover:brightness-110 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      యాక్టివేట్ అవుతోంది...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 text-slate-950 fill-current" />
                      ఉచితంగా తక్షణమే యాక్టివేట్ చేయండి (Instant 1-Click Activation)
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* BOARD 3: CUSTOM API KEY READY CELEBRATION */}
        {activeBoard === 3 && generatedApiKey && (
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-400 to-emerald-400 p-0.5 mx-auto shadow-xl shadow-cyan-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                PE Money Activated Successfully
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Your phrs- API Key is Ready!
              </h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Data pack balance is now updated to your account. Use this key to route requests to all 26 AI models & agents.
              </p>
            </div>

            {/* Generated API Key Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/40 shadow-inner max-w-lg mx-auto space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Key className="w-4 h-4" /> Custom Gateway Key
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">Active</span>
              </div>

              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <code className="font-mono text-cyan-300 text-sm sm:text-base font-bold truncate">
                  {generatedApiKey}
                </code>
                <button
                  onClick={() => copyApiKey(generatedApiKey)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors flex items-center gap-1 shrink-0"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey ? 'Copied!' : 'Copy API Key'}
                </button>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                onClick={() => {
                  setActiveBoard(1);
                  setGeneratedApiKey(null);
                  onClose();
                  onOpenPlayground();
                }}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:brightness-110 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                Launch API Playground
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
