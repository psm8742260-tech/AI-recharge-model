import React from 'react';
import { SUBSCRIPTION_PLANS, TOP_UP_PACKS } from '../data/plansData';
import { Database, Zap, Sparkles, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

interface DataPacksProps {
  onOpenRecharge: () => void;
  onBack: () => void;
}

export const DataPacks: React.FC<DataPacksProps> = ({ onOpenRecharge, onBack }) => {
  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
        <div className="space-y-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
            <Database className="w-4 h-4" />
            AI Model Data Ecosystem
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            డేటా ప్యాక్‌లు (Data Packs)
          </h2>
          <p className="text-sm text-slate-400 max-w-xl">
            మీకు కావాల్సిన అదనపు డేటాను ఇక్కడ టాప్-అప్ చేసుకోండి.
          </p>
        </div>
      </div>

      {/* Boards Section: Micro Top-Ups */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <h3 className="text-xl font-bold text-white">తక్షణ టాప్-అప్ ప్యాక్‌లు (Top-Ups)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {TOP_UP_PACKS.map((pack) => (
            <div 
              key={pack.id}
              className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:bg-slate-900 transition-all flex items-center justify-between group"
            >
              <div className="space-y-1">
                <h4 className="text-lg font-extrabold text-white">{pack.name}</h4>
                <p className="text-xs text-slate-400">{pack.description}</p>
                <div className="pt-2 flex items-center gap-3">
                   <span className="text-xl font-black font-mono text-emerald-400">₹{pack.priceINR}</span>
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                     +{pack.dataMB} MB EXTRA
                   </span>
                </div>
              </div>
              
              <button
                onClick={onOpenRecharge}
                className="p-4 rounded-2xl bg-slate-800 text-slate-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
  </svg>
);
