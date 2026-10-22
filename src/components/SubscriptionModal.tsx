import React, { useState, useEffect } from 'react';
import { SUBSCRIPTION_PLANS, TOP_UP_PACKS, SubscriptionPlan, TopUpPack } from '../data/plansData';
import { UserAccount } from '../types';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, ShieldCheck, Sparkles, Key, Zap, Copy, Check, ArrowRight, CreditCard, QrCode } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserAccount | null;
  onRechargeSuccess: (data: { user: UserAccount; generatedKey: string }) => void;
  onOpenPlayground: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  user,
  onRechargeSuccess,
  onOpenPlayground,
}) => {
  const [activeTab, setActiveTab] = useState<'plans' | 'topups'>('plans');
  const [plans, setPlans] = useState<SubscriptionPlan[]>(SUBSCRIPTION_PLANS);
  const [topups, setTopups] = useState<TopUpPack[]>(TOP_UP_PACKS);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[0]);
  const [selectedTopUp, setSelectedTopUp] = useState<TopUpPack>(TOP_UP_PACKS[0]);
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState('psm8742260@upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activationData, setActivationData] = useState<{ generatedKey: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  const [isPaymentEnabled, setIsPaymentEnabled] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.plans) setPlans(data.plans);
      if (data.topups) setTopups(data.topups);
      if (data.config) setIsPaymentEnabled(data.config.isPaymentEnabled !== false);
      
      // Update selected if plans changed
      if (data.plans && data.plans.length > 0) {
        setSelectedPlan(data.plans[0]);
      }
      if (data.topups && data.topups.length > 0) {
        setSelectedTopUp(data.topups[0]);
      }
    } catch (err) {
      console.error('Failed to fetch plans:', err);
    }
  };

  if (!isOpen) return null;

  const handleProcessPayment = async () => {
    setIsProcessing(true);
    try {
      const isTopUp = activeTab === 'topups';
      const body = isTopUp
        ? {
            planId: selectedTopUp.id,
            planName: selectedTopUp.name,
            durationMonths: 0,
            priceINR: selectedTopUp.priceINR,
            dataPackMB: selectedTopUp.dataMB,
            dailyLimitMB: user?.dailyLimitMB || 800,
            paymentMethod: paymentMethod === 'upi' ? `UPI (${upiId})` : paymentMethod,
          }
        : {
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            durationMonths: selectedPlan.durationMonths,
            priceINR: selectedPlan.priceINR,
            dataPackMB: selectedPlan.dataPackMB,
            dailyLimitMB: selectedPlan.dailyLimitMB,
            paymentMethod: paymentMethod === 'upi' ? `UPI (${upiId})` : paymentMethod,
          };

      const res = await fetch('/api/plans/recharge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setActivationData({ generatedKey: data.generatedKey });
        onRechargeSuccess({ user: data.user, generatedKey: data.generatedKey });

        // Trigger Confetti Celebration
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      console.error('Payment error:', err);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 sm:p-8 relative shadow-2xl space-y-6 my-8">
        
        {/* Close button */}
        <button
          onClick={() => {
            setActivationData(null);
            setIsCheckoutStep(false);
            onClose();
          }}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 hover:bg-slate-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* STEP 3: ACTIVATED KEY CELEBRATION */}
        {activationData ? (
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
                Data pack balance is now updated to your account. Use this key to route requests to all 20 AI models.
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
                  {activationData.generatedKey}
                </code>
                <button
                  onClick={() => copyApiKey(activationData.generatedKey)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition-colors flex items-center gap-1 shrink-0"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedKey ? 'Copied' : 'Copy Key'}
                </button>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <button
                onClick={() => {
                  setActivationData(null);
                  setIsCheckoutStep(false);
                  onClose();
                  onOpenPlayground();
                }}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:brightness-110 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
              >
                Launch API Playground
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : isCheckoutStep ? (
          /* STEP 2: CHECKOUT & PAYMENT */
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <button
                onClick={() => setIsCheckoutStep(false)}
                className="text-xs text-cyan-400 hover:underline mb-2 inline-block"
              >
                ← Back to Duration Options
              </button>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Complete PE Money Payment
              </h2>
              <p className="text-xs text-slate-400">
                Instant activation with automatic phrs- key generation.
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
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  ₹{activeTab === 'plans' ? selectedPlan.priceINR : selectedTopUp.priceINR}
                </span>
                <span className="text-[10px] text-slate-500 block">All taxes included</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Select Payment Option
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-cyan-400" />
                  UPI / QR Code
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-cyan-400" />
                  Credit / Debit Card
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-2 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Zap className="w-5 h-5 text-cyan-400" />
                  Net Banking
                </button>
              </div>

              {paymentMethod === 'upi' && (
                <div className="pt-2 space-y-2">
                  <span className="text-xs text-slate-300 font-medium block">UPI VPA Address:</span>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Supports Google Pay, PhonePe, Paytm, and BHIM UPI.
                  </p>
                </div>
              )}
            </div>

            {/* Pay Button */}
            <button
              onClick={handleProcessPayment}
              disabled={isProcessing}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-extrabold text-sm hover:brightness-110 transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Verifying Payment & Minting API Key...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5" />
                  Pay ₹{activeTab === 'plans' ? selectedPlan.priceINR : selectedTopUp.priceINR} & Activate Instantly
                </>
              )}
            </button>
          </div>
        ) : (
          /* STEP 1: DURATION & PLAN SELECTION */
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" />
                PE Money Prepaid Packs (Hybrid Engine)
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Select PE Quota Duration
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                All plans unlock <span className="text-cyan-400 font-bold">ALL 20 AI Models</span> with custom phrs- gateway keys.
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

            {/* Plans Selection Grid */}
            {activeTab === 'plans' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className={`p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all relative ${
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
                        <div className="text-3xl font-extrabold font-mono text-cyan-400">
                          ₹{plan.priceINR}
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium">
                          ${plan.priceUSD} USD / total
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1 text-xs">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Data Pack:</span>
                          <span className="font-bold text-cyan-300 font-mono">{plan.dataPackGB} GB</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Daily Speed Limit:</span>
                          <span className="font-bold text-emerald-400 font-mono">{plan.dailyLimitMB} MB/day</span>
                        </div>
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
                      <div
                        className={`w-full py-2 rounded-xl text-center text-xs font-bold transition-all ${
                          selectedPlan.id === plan.id
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {selectedPlan.id === plan.id ? 'Selected Option' : 'Select Plan'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Topups Grid */
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
                      <div className="pt-2 text-2xl font-mono font-extrabold text-emerald-400">
                        ₹{topup.priceINR} <span className="text-xs font-normal text-slate-400">/ +{topup.dataMB} MB</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                      <div
                        className={`w-full py-2 rounded-xl text-center text-xs font-bold transition-all ${
                          selectedTopUp.id === topup.id
                            ? 'bg-cyan-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {selectedTopUp.id === topup.id ? 'Selected Top-Up' : 'Select Boost'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Proceed CTA */}
            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <div className="text-xs text-slate-400">
                Selected:{' '}
                <span className="text-white font-bold">
                  {activeTab === 'plans' ? selectedPlan.name : selectedTopUp.name}
                </span>{' '}
                (₹{activeTab === 'plans' ? selectedPlan.priceINR : selectedTopUp.priceINR})
              </div>

              <button
                onClick={() => {
                  if (isPaymentEnabled) {
                    setIsCheckoutStep(true);
                  } else {
                    handleProcessPayment();
                  }
                }}
                className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:brightness-110 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-cyan-500/20 flex items-center gap-2 cursor-pointer"
              >
                {!isPaymentEnabled ? 'అడ్మిన్ యాక్సెస్: ఇన్‌స్టంట్ యాక్టివేట్' : 'Proceed to Checkout'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
