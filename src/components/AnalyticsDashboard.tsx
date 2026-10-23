import React, { useState } from 'react';
import { UserAccount, MagicReceipt, RechargeTransaction } from '../types';
import { BarChart3, Key, Receipt, RefreshCw, Copy, Check, ShieldCheck, Sparkles, Clock, AlertTriangle, ArrowUpRight, ArrowLeft } from 'lucide-react';

interface AnalyticsDashboardProps {
  user: UserAccount | null;
  receipts: MagicReceipt[];
  transactions: RechargeTransaction[];
  onOpenRecharge: () => void;
  onRegenerateKey: () => void;
  onBack: () => void;
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  user,
  receipts,
  transactions,
  onOpenRecharge,
  onRegenerateKey,
  onBack,
}) => {
  const [copiedKeyIndex, setCopiedKeyIndex] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
        <p className="text-slate-400 text-sm">Please sign in to view your data quota analytics and magic receipts.</p>
      </div>
    );
  }

  const totalGB = (user.dataPackMBTotal / 1024).toFixed(2);
  const remainingGB = (user.dataPackMBRemaining / 1024).toFixed(2);
  const usedGB = ((user.dataPackMBTotal - user.dataPackMBRemaining) / 1024).toFixed(2);
  const percentUsed = Math.min(100, Math.max(0, ((user.dataPackMBTotal - user.dataPackMBRemaining) / user.dataPackMBTotal) * 100));

  const dailyPercentUsed = Math.min(100, Math.max(0, (user.dailyUsedMB / user.dailyLimitMB) * 100));

  const copyKey = (key: string, idx: number) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyIndex(idx);
    setTimeout(() => setCopiedKeyIndex(null), 2000);
  };

  const handleRegenerate = async () => {
    if (!confirm('Are you sure you want to regenerate your active API key? Your previous key will be revoked immediately.')) {
      return;
    }
    setIsRegenerating(true);
    await onRegenerateKey();
    setIsRegenerating(false);
  };

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
              <BarChart3 className="w-4 h-4" />
              PE Money Quota Analytics & Magic Receipts
            </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            PE Usage Dashboard
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time PE data pack consumption telemetry for <span className="text-slate-200 font-bold">{user.email}</span>.
          </p>
        </div>
      </div>

        <button
          onClick={onOpenRecharge}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 text-xs font-extrabold hover:brightness-110 transition-all shadow-md shadow-cyan-500/15 flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Recharge PE Money
        </button>
      </div>

      {/* Top Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Data Quota Balance Card */}
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Active PE Money Quota</span>
            <span className="text-cyan-400 font-bold font-mono">PE {user.activePlanName}</span>
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono text-white">
              {remainingGB} <span className="text-xs font-normal text-slate-400">GB left / {totalGB} GB</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Used: <span className="text-slate-200 font-mono font-bold">{usedGB} GB</span> ({percentUsed.toFixed(1)}%)
            </div>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
              style={{ width: `${100 - percentUsed}%` }}
            />
          </div>
        </div>

        {/* Daily High-Speed Limit Card */}
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Daily High-Speed Usage</span>
            <span className="text-emerald-400 font-bold font-mono">Resets Midnight</span>
          </div>

          <div>
            <div className="text-3xl font-extrabold font-mono text-white">
              {user.dailyUsedMB.toFixed(1)} <span className="text-xs font-normal text-slate-400">/ {user.dailyLimitMB} MB</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Daily quota limit: <span className="text-slate-200 font-bold">{user.dailyLimitMB} MB/day</span>
            </div>
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full ${
                dailyPercentUsed > 80 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${dailyPercentUsed}%` }}
            />
          </div>
        </div>

        {/* Active API Keys Summary */}
        <div className="p-6 rounded-2xl glass-panel relative overflow-hidden space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>API Gateway Status</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Proxy Active
            </span>
          </div>

          <div>
            <div className="text-xs font-mono text-cyan-300 font-bold truncate">
              {user.activeApiKey}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Generated: {new Date().toLocaleDateString()}
            </div>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate API Key
          </button>
        </div>

      </div>

      {/* API Key Management Table */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-extrabold text-white">Active & Past API Keys</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Format: phrs-...</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3">API Key</th>
                <th className="p-3">Created Date</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {user.keysHistory.map((k, idx) => (
                <tr key={idx} className="hover:bg-slate-900/50">
                  <td className="p-3 font-mono text-cyan-300 font-bold">{k.key}</td>
                  <td className="p-3">{new Date(k.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    {k.status === 'active' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px] font-bold">
                        Revoked
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => copyKey(k.key, idx)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-md transition-colors inline-flex items-center gap-1"
                    >
                      {copiedKeyIndex === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedKeyIndex === idx ? 'Copied' : 'Copy'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Magic Receipts Telemetry Log Table */}
      <div className="p-6 rounded-2xl glass-panel space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-extrabold text-white">Reverse Proxy Magic Receipts Log</h3>
          </div>
          <span className="text-xs text-slate-400">Shows recent API call deductions</span>
        </div>

        {receipts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3">Receipt ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Model Engine</th>
                  <th className="p-3">Tokens (In / Out)</th>
                  <th className="p-3">MB Deducted</th>
                  <th className="p-3">Remaining Balance</th>
                  <th className="p-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {receipts.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50">
                    <td className="p-3 font-mono text-cyan-400 font-bold">{r.receiptId}</td>
                    <td className="p-3 text-slate-400">{new Date(r.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 font-semibold text-white">{r.modelName}</td>
                    <td className="p-3 font-mono text-slate-300">
                      {r.promptTokens} in / {r.completionTokens} out ({r.totalTokens} total)
                    </td>
                    <td className="p-3 font-mono font-bold text-amber-400">-{r.dataDeductedMB} MB</td>
                    <td className="p-3 font-mono font-bold text-cyan-300">
                      {(r.dataRemainingMB / 1024).toFixed(2)} GB
                    </td>
                    <td className="p-3 text-right font-mono text-[11px] text-emerald-400">
                      200 OK
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-slate-500">
            No magic receipts generated yet. Test a prompt in the API Playground to view real-time log entries!
          </div>
        )}
      </div>

    </div>
  );
};
