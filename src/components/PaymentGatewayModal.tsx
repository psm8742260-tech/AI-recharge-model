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
  const [plans, setPlans] = useState<SubscriptionPlan[]>(SUBSCRIPTION_PLANS);
  const [topups, setTopups] = useState<TopUpPack[]>(TOP_UP_PACKS);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[0]);
  const [selectedTopUp, setSelectedTopUp] = useState<TopUpPack>(TOP_UP_PACKS[0]);
  const [upiId, setUpiId] = useState('psm8742260@upi');
  const [utrRef, setUtrRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedApiKey, setGeneratedApiKey] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  // Every time modal opens, ALWAYS reset to Board 1
  useEffect(() => {
    if (isOpen) {
      setActiveBoard(1);
      setGeneratedApiKey(null);
      setUtrRef('');
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/admin/config');
      const data = await res.json();
      if (data.plans && data.plans.length > 0) {
        setPlans(data.plans);
        setSelectedPlan(data.plans[0]);
      }
      if (data.topups && data.topups.length > 0) {
        setTopups(data.topups);
        setSelectedTopUp(data.topups[0]);
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
      const body = isTopUp
        ? {
            planId: selectedTopUp.id,
            planName: selectedTopUp.name,
            durationMonths: 0,
            priceINR: selectedTopUp.priceINR,
            dataPackMB: selectedTopUp.dataMB,
            dailyLimitMB: user?.dailyLimitMB || 800,
            paymentMethod: `UPI QR (${upiId}${utrRef ? ` / UTR: ${utrRef}` : ''})`,
          }
        : {
            planId: selectedPlan.id,
            planName: selectedPlan.name,
            durationMonths: selectedPlan.durationMonths,
            priceINR: selectedPlan.priceINR,
            dataPackGB: selectedPlan.dataPackGB,
            dailyLimitMB: selectedPlan.dailyLimitMB,
            paymentMethod: `UPI QR (${upiId}${utrRef ? ` / UTR: ${utrRef}` : ''})`,
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
                Choose your quota duration to unlock <span className="text-cyan-400 font-bold">ALL 20 AI Models</span> with high-speed proxy gateway.
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
                          <span>Daily Limit:</span>
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlan(plan);
                          setActiveBoard(2); // Go directly to Board 2 (Payment Gateway QR)
                        }}
                        className={`w-full py-2.5 rounded-xl text-center text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                          selectedPlan.id === plan.id
                            ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-cyan-500/20'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Buy Now
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
                      <div className="pt-2 text-2xl font-mono font-extrabold text-emerald-400">
                        ₹{topup.priceINR} <span className="text-xs font-normal text-slate-400">/ +{topup.dataMB} MB</span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTopUp(topup);
                          setActiveBoard(2); // Go directly to Board 2 (Payment Gateway QR)
                        }}
                        className={`w-full py-2.5 rounded-xl text-center text-xs font-extrabold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                          selectedTopUp.id === topup.id
                            ? 'bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 shadow-cyan-500/20'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        Buy Now
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

        {/* BOARD 2: PAYMENT GATEWAY & DIRECT QR CODE BOARD */}
        {activeBoard === 2 && (
          <div className="space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <button
                onClick={() => setActiveBoard(1)}
                className="text-xs text-cyan-400 hover:underline mb-2 inline-block flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Subscription Plans
              </button>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                Payment Gateway - Scan & Pay (PhonePe / GPay / UPI)
              </h2>
              <p className="text-xs text-slate-400">
                Scan the QR code below or pay via UPI address to complete your recharge.
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

            {/* QR CODE GATEWAY BOX */}
            <div className="p-6 rounded-2xl bg-slate-950 border border-cyan-500/40 text-center space-y-4 shadow-xl max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5" /> Unified UPI QR Gateway
                </span>
              </div>

              {/* QR Code Canvas Box */}
              <div className="w-56 h-56 mx-auto bg-white p-3 rounded-2xl shadow-xl flex items-center justify-center border-2 border-cyan-400/60">
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
              </div>

              <div className="space-y-1">
                <div className="text-xs text-slate-400 font-medium">Scan using PhonePe, Google Pay, Paytm or BHIM</div>
                <div className="flex items-center justify-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 w-fit mx-auto">
                  <span className="text-sm font-extrabold text-cyan-300 font-mono">{upiId}</span>
                  <button
                    type="button"
                    onClick={() => copyApiKey(upiId)}
                    className="text-[10px] text-cyan-400 font-bold hover:underline"
                  >
                    {copiedKey ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Supported Payment Apps Bar */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex-wrap">
                <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">PhonePe</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">Google Pay</span>
                <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Paytm</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">BHIM UPI</span>
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
