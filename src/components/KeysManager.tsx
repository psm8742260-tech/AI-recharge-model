import React, { useState } from 'react';
import { UserAccount } from '../types';
import { Key, Copy, Check, RefreshCw, ArrowLeft, ShieldCheck, Zap } from 'lucide-react';

interface KeysManagerProps {
  user: UserAccount | null;
  onRegenerateKey: () => void;
  onBack: () => void;
}

export const KeysManager: React.FC<KeysManagerProps> = ({
  user,
  onRegenerateKey,
  onBack,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-slate-800 space-y-4">
        <p className="text-slate-400 text-sm">దయచేసి మీ API కీలను చూడటానికి లాగిన్ అవ్వండి.</p>
      </div>
    );
  }

  const copyKey = (key: string, idx: number) => {
    navigator.clipboard.writeText(key);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleRegenerate = async () => {
    if (!confirm('మీరు ఖచ్చితంగా కొత్త API కీని జనరేట్ చేయాలనుకుంటున్నారా? పాత కీ వెంటనే పని చేయడం ఆగిపోతుంది.')) {
      return;
    }
    setIsRegenerating(true);
    await onRegenerateKey();
    setIsRegenerating(false);
  };

  const activeKey = user.keysHistory.find(k => k.status === 'active');

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="mt-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-lg"
            title="మళ్ళీ వెనక్కి వెళ్ళండి"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
              <Key className="w-4 h-4" />
              API Gateway Keys Management
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              మీ API తాళం (Keys)
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              మీరు కొనుగోలు చేసిన డేటా ప్యాక్‌ని ఉపయోగించడానికి ఈ కీలను వాడండి.
            </p>
          </div>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          కొత్త కీని జనరేట్ చేయండి
        </button>
      </div>

      {/* Primary Active Key Card */}
      {activeKey && (
        <div className="p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-900/20 border border-cyan-500/30 shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="w-32 h-32 text-cyan-400" />
          </div>

          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">ప్రస్తుతం వాడుకలో ఉన్న కీ (Active Key)</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Prefix: phrs-</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1 w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-between group/key">
                <code className="font-mono text-xl sm:text-2xl font-bold text-cyan-300 truncate">
                  {activeKey.key}
                </code>
                <button
                  onClick={() => copyKey(activeKey.key, -1)}
                  className="p-3 rounded-xl bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
                  title="కాపీ చేయండి"
                >
                  {copiedIndex === -1 ? <Check className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                </button>
              </div>
              
              <div className="w-full md:w-auto flex flex-row md:flex-col gap-3">
                 <div className="flex-1 md:w-40 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">డేటా బ్యాలెన్స్</span>
                    <span className="text-lg font-mono font-extrabold text-white">{(user.dataPackMBRemaining / 1024).toFixed(2)} GB</span>
                 </div>
                 <div className="flex-1 md:w-40 p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">స్టేటస్</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Proxy Live
                    </span>
                 </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center md:text-left">
              ఈ కీని మీ అప్లికేషన్ హెడర్లలో <code className="text-cyan-400 font-bold px-1.5 py-0.5 bg-slate-800 rounded">x-api-key</code> గా పంపండి.
            </p>
          </div>
        </div>
      )}

      {/* Keys History Table */}
      <div className="glass-panel p-6 rounded-3xl space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
          <Key className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-extrabold text-white">కీల చరిత్ర (Keys History)</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-4">API Key</th>
                <th className="p-4">సృష్టించిన తేదీ</th>
                <th className="p-4">స్థితి (Status)</th>
                <th className="p-4 text-right">చర్య (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {user.keysHistory.map((k, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-4 font-mono text-cyan-300/80 font-bold">{k.key}</td>
                  <td className="p-4 text-slate-400">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    {k.status === 'active' ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-extrabold border border-emerald-500/20">
                        Active
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-500 text-[10px] font-extrabold">
                        Revoked
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => copyKey(k.key, idx)}
                      className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-xl transition-all inline-flex items-center gap-2"
                    >
                      {copiedIndex === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedIndex === idx ? 'కాపీ అయింది' : 'కాపీ చేయండి'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
