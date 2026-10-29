import React, { useState, useEffect } from 'react';
import { TOP_UP_PACKS, TopUpPack } from '../data/plansData';
import { Database, Zap, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Plus, Gift, ArrowLeft } from 'lucide-react';

interface DataPacksProps {
  onOpenRecharge: () => void;
  onBack: () => void;
}

export const DataPacks: React.FC<DataPacksProps> = ({ onOpenRecharge, onBack }) => {
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

  const [isPaymentEnabled, setIsPaymentEnabled] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem('airecharge_config');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (typeof parsed.isPaymentEnabled === 'boolean') return parsed.isPaymentEnabled;
      }
    } catch (e) {}
    return false; // Default trailer mode or as configured
  });

  useEffect(() => {
    const loadDynamicData = async () => {
      try {
        const res = await fetch('/api/plans');
        if (res.ok) {
          const data = await res.json();
          if (data.topups && Array.isArray(data.topups) && data.topups.length > 0) {
            setTopups(data.topups);
            localStorage.setItem('airecharge_topups', JSON.stringify(data.topups));
          }
          if (data.config && typeof data.config.isPaymentEnabled === 'boolean') {
            setIsPaymentEnabled(data.config.isPaymentEnabled);
          }
        }
      } catch (err) {
        // Fallback to cached state
      }
    };

    loadDynamicData();

    // Listen to real-time events triggered from Admin Panel
    const handlePlansUpdated = (event: any) => {
      if (event.detail) {
        if (Array.isArray(event.detail.topups)) {
          setTopups(event.detail.topups);
        } else if (Array.isArray(event.detail)) {
          // If array of topups or plans
          const hasMB = event.detail.some((item: any) => item.dataMB !== undefined);
          if (hasMB) setTopups(event.detail);
        }
      }
    };

    const handleConfigUpdated = (event: any) => {
      if (event.detail && typeof event.detail.isPaymentEnabled === 'boolean') {
        setIsPaymentEnabled(event.detail.isPaymentEnabled);
      }
    };

    window.addEventListener('airecharge_plans_updated', handlePlansUpdated);
    window.addEventListener('airecharge_config_updated', handleConfigUpdated);
    window.addEventListener('storage', loadDynamicData);

    return () => {
      window.removeEventListener('airecharge_plans_updated', handlePlansUpdated);
      window.removeEventListener('airecharge_config_updated', handleConfigUpdated);
      window.removeEventListener('storage', loadDynamicData);
    };
  }, []);

  return (
    <div className="space-y-12 pb-16 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-8">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="mt-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-lg cursor-pointer"
            title="మళ్ళీ వెనక్కి వెళ్ళండి"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="mt-1 px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 flex items-center gap-1.5 shadow-xl">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[11px] font-black bg-gradient-to-r from-cyan-400 via-emerald-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent tracking-tighter">
              H
            </span>
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
              <Database className="w-4 h-4" />
              AI Model Data Ecosystem
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              డేటా ప్యాక్‌లు (Data Packs)
            </h2>
            <p className="text-sm text-slate-400 max-w-xl">
              అడ్మిన్ ద్వారా కాన్ఫిగర్ చేయబడిన లైవ్ డేటా ప్యాక్‌లు. మీ వినియోగానికి కావలసిన అదనపు డేటాను ఇక్కడ తక్షణమే యాడ్ చేసుకోండి.
            </p>
          </div>
        </div>

        {/* Status Mode Badge */}
        <div className="flex items-center gap-2">
          {!isPaymentEnabled ? (
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5" />
              ట్రైలర్ ఉచిత మోడ్ (Trailer Preview Active)
            </span>
          ) : (
            <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              లైవ్ గేట్‌వే (Live Gateway Active)
            </span>
          )}
        </div>
      </div>

      {/* Boards Section: Micro Top-Ups */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">తక్షణ టాప్-అప్ ప్యాక్‌లు (Top-Ups)</h3>
            <p className="text-xs text-slate-400">అడ్మిన్ ప్యానెల్‌లో మార్చిన వివరాలు ఇక్కడ నేరుగా ప్రతిబింబిస్తాయి.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {topups.map((pack) => (
            <div 
              key={pack.id}
              className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-900 transition-all flex items-center justify-between group shadow-lg"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-extrabold text-white">{pack.name}</h4>
                  <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800">
                    {pack.id}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm">{pack.description}</p>
                
                <div className="pt-2 flex items-center gap-3 flex-wrap">
                  {/* TRAILER_MODE: If Payment is OFF, hide INR price and show Trailer Free Badge */}
                  {isPaymentEnabled ? (
                    <span className="text-2xl font-black font-mono text-emerald-400">
                      ₹{pack.priceINR}
                    </span>
                  ) : (
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                      ట్రైలర్ ఉచితం (Free)
                    </span>
                  )}

                  <span className="text-xs font-bold text-slate-300 uppercase tracking-tighter bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    +{pack.dataMB} MB EXTRA DATA
                  </span>
                </div>
              </div>
              
              <button
                onClick={onOpenRecharge}
                className="p-4 rounded-2xl bg-slate-800 text-slate-300 group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-emerald-400 group-hover:text-slate-950 transition-all cursor-pointer shadow-md shrink-0 ml-4"
                title={isPaymentEnabled ? "ఈ ప్యాక్ రీఛార్జ్ చేయండి" : "ట్రైలర్ ఉచితంగా యాక్టివేట్ చేయండి"}
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
