import React from 'react';
import { SUBSCRIPTION_PLANS } from '../data/plansData';
import { Sparkles, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

interface SubscriptionPlansProps {
  onOpenRecharge: () => void;
  onBack: () => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ onOpenRecharge, onBack }) => {
  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            AI Subscription Plans
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            సబ్‌స్క్రిప్షన్ ప్లాన్‌లు (Subscription Plans)
          </h2>
          <p className="text-sm text-slate-400 max-w-xl">
            మా ప్రీమియం AI మోడల్స్ మరియు హై-స్పీడ్ గేట్‌వే యాక్సెస్ కోసం ప్లాన్‌ని ఎంచుకోండి.
          </p>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBSCRIPTION_PLANS.map((plan) => (
          <div 
            key={plan.id}
            className="group p-8 rounded-[2rem] bg-slate-900 border border-slate-800 hover:border-cyan-500/50 transition-all duration-300 relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-3xl group-hover:bg-cyan-500/10 transition-all" />

            <div className="space-y-6 relative z-10">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-2xl font-black text-white">{plan.name}</h4>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{plan.durationMonths} Month Validity</span>
                </div>
                {plan.badge && (
                  <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-black uppercase">
                    {plan.badge}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white font-mono">₹{plan.priceINR}</span>
                <span className="text-slate-500 text-sm font-medium">/ total</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">మొత్తం డేటా:</span>
                  <span className="text-sm font-bold text-cyan-400 font-mono">{plan.dataPackGB} GB</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">డైలీ లిమిట్:</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{plan.dailyLimitMB} MB</span>
                </div>
              </div>

              <ul className="space-y-3">
                {plan.features.slice(0, 4).map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs text-slate-300 leading-snug">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8 relative z-10">
              <button
                onClick={onOpenRecharge}
                className="w-full py-4 rounded-2xl bg-slate-800 group-hover:bg-cyan-500 text-slate-300 group-hover:text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-2"
              >
                SELECT PLAN
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
