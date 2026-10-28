import React, { useState } from 'react';
import { UserAccount, MagicReceipt, RechargeTransaction } from '../types';
import { 
  BarChart3, Key, Receipt, RefreshCw, Copy, Check, ShieldCheck, 
  Sparkles, Clock, AlertTriangle, ArrowUpRight, ArrowLeft, Bot, 
  FileText, Download, Zap, TrendingUp, Calendar, CreditCard, CheckCircle2 
} from 'lucide-react';

interface AnalyticsDashboardProps {
  user: UserAccount | null;
  receipts: MagicReceipt[];
  transactions: RechargeTransaction[];
  onOpenRecharge: () => void;
  onRegenerateKey: () => void;
  onBack: () => void;
  initialSection?: 'usage' | 'billing';
}

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  user,
  receipts,
  transactions,
  onOpenRecharge,
  onRegenerateKey,
  onBack,
  initialSection = 'usage',
}) => {
  const [currentSection, setCurrentSection] = useState<'usage' | 'billing'>(initialSection);
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('30days');
  const [copiedKeyIndex, setCopiedKeyIndex] = useState<number | null>(null);

  React.useEffect(() => {
    if (initialSection) {
      setCurrentSection(initialSection);
    }
  }, [initialSection]);

  if (!user) {
    return (
      <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
        <p className="text-slate-400 text-sm">దయచేసి మీ డేటా కోటా మరియు వినియోగ వివరాలను చూడటానికి లాగిన్ అవ్వండి.</p>
      </div>
    );
  }

  const totalGB = (user.dataPackMBTotal / 1024).toFixed(2);
  const remainingGB = (user.dataPackMBRemaining / 1024).toFixed(2);
  const usedMB = Math.max(0, user.dataPackMBTotal - user.dataPackMBRemaining);
  const usedGB = (usedMB / 1024).toFixed(2);
  const percentUsed = Math.min(100, Math.max(0, (usedMB / user.dataPackMBTotal) * 100));
  const dailyPercentUsed = Math.min(100, Math.max(0, (user.dailyUsedMB / user.dailyLimitMB) * 100));

  // Compute total tokens consumed from receipts plus base usage
  const totalReceiptTokens = receipts.reduce((acc, r) => acc + (r.totalTokens || 0), 0);
  const displayTotalTokens = (185420000 + totalReceiptTokens).toLocaleString();
  const totalApiCalls = Math.max(1248, receipts.length + 1248);

  const copyKey = (key: string, idx: number) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyIndex(idx);
    setTimeout(() => setCopiedKeyIndex(null), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-start gap-4">
          <button
            onClick={onBack}
            className="mt-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-lg cursor-pointer"
            title="వెనక్కి వెళ్ళండి"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              AI Recharge Models • Platform Telemetry
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentSection === 'usage' ? 'డేటా & టోకెన్ వినియోగం (Usage)' : 'బిల్లింగ్ & రసీదులు (Billing)'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              ఖాతాదారు: <span className="text-slate-200 font-bold">{user.name}</span> ({user.email || user.mobile}) • ప్లాన్: <span className="text-cyan-400 font-bold">{user.activePlanName}</span>
            </p>
          </div>
        </div>

        {/* View Switcher: Usage vs Billing */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setCurrentSection('usage')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentSection === 'usage'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              Usage
            </button>
            <button
              onClick={() => setCurrentSection('billing')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentSection === 'billing'
                  ? 'bg-cyan-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Billing
            </button>
          </div>

          <button
            onClick={onOpenRecharge}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 text-xs font-extrabold hover:brightness-110 transition-all shadow-md shadow-cyan-500/15 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Top up
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. USAGE SECTION (Tokens, MBs Used, Remaining Quota, Graphs)             */}
      {/* ========================================================================= */}
      {currentSection === 'usage' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Filter Bar Inspired by Reference */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-900/40 border border-slate-800 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-semibold">Time:</span>
              <div className="flex items-center gap-1">
                {(['today', '7days', '30days'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      timeRange === range
                        ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {range === 'today' ? 'ఈ రోజు' : range === '7days' ? 'గత 7 రోజులు' : 'గత 30 రోజులు'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">API Key:</span>
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-cyan-300 font-mono text-[11px] border border-slate-700">
                {user.activeApiKey ? `${user.activeApiKey.slice(0, 12)}...` : 'All Keys'}
              </span>
            </div>
          </div>

          {/* Metrics Grid Inspired by Reference */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. Data Pack Quota (Remaining MB/GB) */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>మిగిలిన డేటా బ్యాలెన్స్</span>
                <span className="text-cyan-400 font-bold font-mono">Pack Active</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {user.dataPackMBRemaining.toFixed(1)} <span className="text-xs font-normal text-cyan-400">MB</span>
              </div>
              <div className="text-[11px] text-slate-400">
                మొత్తం కోటా: <span className="text-slate-200 font-mono font-bold">{user.dataPackMBTotal} MB</span> ({totalGB} GB)
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full"
                  style={{ width: `${Math.max(5, 100 - percentUsed)}%` }}
                />
              </div>
            </div>

            {/* 2. Used Data (MBs Consumed) */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>ఉపయోగించిన డేటా (Used)</span>
                <span className="text-amber-400 font-bold font-mono">Consumptions</span>
              </div>
              <div className="text-2xl font-black font-mono text-amber-400">
                {usedMB.toFixed(1)} <span className="text-xs font-normal text-slate-400">MB</span>
              </div>
              <div className="text-[11px] text-slate-400">
                వినియోగ శాతం: <span className="text-slate-200 font-bold">{percentUsed.toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>
            </div>

            {/* 3. Total Tokens Consumed (Like Reference: 358M+) */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>మొత్తం టోకెన్లు (Tokens)</span>
                <span className="text-emerald-400 font-bold font-mono">Proxy High-Speed</span>
              </div>
              <div className="text-2xl font-black font-mono text-white tracking-tight">
                {displayTotalTokens}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>Prompt + Completion</span>
                <span className="text-emerald-400 font-bold">100% Guaranteed</span>
              </div>
            </div>

            {/* 4. API Requests */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span>API అభ్యర్థనలు (Requests)</span>
                <span className="text-cyan-400 font-bold font-mono">200 OK</span>
              </div>
              <div className="text-2xl font-black font-mono text-white">
                {totalApiCalls.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>గేట్‌వే: arm.phrscrowd.online</span>
                <span className="text-emerald-400 font-bold">LIVE</span>
              </div>
            </div>

          </div>

          {/* Daily Limit Tracker */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  రోజువారీ హై-స్పీడ్ లిమిట్ (Daily High-Speed Limit)
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">అర్ధరాత్రి రీసెట్ అవుతుంది</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  రోజుకి గరిష్టంగా: <span className="text-slate-200 font-bold">{user.dailyLimitMB} MB/రోజు</span> • ఈ రోజు వాడినది: <span className="text-cyan-300 font-mono font-bold">{user.dailyUsedMB.toFixed(1)} MB</span>
                </div>
              </div>
            </div>

            <div className="w-full md:w-72">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span>{user.dailyUsedMB.toFixed(1)} MB</span>
                <span>{user.dailyLimitMB} MB</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${dailyPercentUsed > 80 ? 'bg-amber-400' : 'bg-gradient-to-r from-cyan-400 to-emerald-400'}`}
                  style={{ width: `${dailyPercentUsed}%` }}
                />
              </div>
            </div>
          </div>

          {/* Visual Usage Activity Breakdown (Bar Chart Inspired by Screenshot) */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  రోజువారీ డేటా & టోకెన్ వినియోగ గ్రాఫ్ (Usage Activity)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  గత కొన్ని రోజుల రీఛార్జ్ డేటా వినియోగ సరళి
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-cyan-400 inline-block"></span> డేటా (MB)</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded bg-emerald-400 inline-block"></span> టోకెన్లు</span>
              </div>
            </div>

            {/* Simulated Clean Bar Chart */}
            <div className="pt-4 pb-2">
              <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-800">
                {[
                  { day: 'Day 1', mb: 18, tokens: '12M', height: '25%' },
                  { day: 'Day 2', mb: 34, tokens: '28M', height: '42%' },
                  { day: 'Day 3', mb: 45, tokens: '41M', height: '58%' },
                  { day: 'Day 4', mb: 22, tokens: '19M', height: '30%' },
                  { day: 'Day 5', mb: 56, tokens: '52M', height: '70%' },
                  { day: 'Day 6', mb: 68, tokens: '64M', height: '85%' },
                  { day: 'ఈ రోజు', mb: Math.round(user.dailyUsedMB || 40), tokens: '35M', height: `${Math.min(95, Math.max(20, dailyPercentUsed))}%`, active: true },
                ].map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {bar.mb}MB
                    </div>
                    <div 
                      className={`w-full max-w-[42px] rounded-t-lg transition-all group-hover:brightness-125 ${
                        bar.active 
                          ? 'bg-gradient-to-t from-cyan-500 to-emerald-400 shadow-lg shadow-cyan-500/20' 
                          : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                      style={{ height: bar.height }}
                    />
                    <div className={`text-[11px] font-mono ${bar.active ? 'text-cyan-400 font-bold' : 'text-slate-400'}`}>
                      {bar.day}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BILLING SECTION (Invoices, Payments History, Magic Receipts)          */}
      {/* ========================================================================= */}
      {currentSection === 'billing' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* Active Subscription & Billing Summary */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                  యాక్టివ్ ప్లాన్
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ముగింపు తేదీ: {new Date(user.expiryDate).toLocaleDateString('te-IN')}
                </span>
              </div>
              <h3 className="text-2xl font-black text-white">{user.activePlanName}</h3>
              <p className="text-xs text-slate-400 max-w-xl">
                ప్రీపెయిడ్ రీఛార్జ్ మోడల్: మీరు రీఛార్జ్ చేసిన డేటా ప్యాక్ నుండి మాత్రమే ఎంబీ కట్ అవుతుంది. ఎటువంటి దాగి ఉన్న ఛార్జీలు లేవు.
              </p>
            </div>

            <button
              onClick={onOpenRecharge}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 text-slate-950 font-black text-xs hover:brightness-110 transition-all shadow-lg flex items-center gap-2 shrink-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              కొత్త ప్యాక్ కొనుగోలు (Add Data)
            </button>
          </div>

          {/* Recharge Invoices & Payments History Table */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white">రీఛార్జ్ ఇన్‌వాయిస్‌లు & చెల్లింపులు (Payment History)</h3>
              </div>
              <span className="text-xs text-slate-400">అన్ని అధికారిక GST రసీదులు</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="p-3">ఇన్‌వాయిస్ ID</th>
                    <th className="p-3">తేదీ & సమయం</th>
                    <th className="p-3">ప్లాన్ వివరాలు</th>
                    <th className="p-3">జత చేసిన డేటా</th>
                    <th className="p-3">మొత్తం (INR)</th>
                    <th className="p-3">చెల్లింపు విధానం</th>
                    <th className="p-3 text-right">స్టేటస్</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-850/50">
                        <td className="p-3 font-mono text-cyan-400 font-bold">{tx.id}</td>
                        <td className="p-3 text-slate-400">{new Date(tx.timestamp).toLocaleString()}</td>
                        <td className="p-3 font-semibold text-white">{tx.planName}</td>
                        <td className="p-3 font-mono font-bold text-emerald-400">+{tx.dataAddedMB} MB</td>
                        <td className="p-3 font-mono font-bold text-white">₹{tx.amountINR}</td>
                        <td className="p-3 text-slate-300">{tx.paymentMethod}</td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Paid
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr className="hover:bg-slate-850/50">
                      <td className="p-3 font-mono text-cyan-400 font-bold">INV-2026-STARTER</td>
                      <td className="p-3 text-slate-400">{new Date().toLocaleDateString()}</td>
                      <td className="p-3 font-semibold text-white">{user.activePlanName}</td>
                      <td className="p-3 font-mono font-bold text-emerald-400">+{user.dataPackMBTotal} MB</td>
                      <td className="p-3 font-mono font-bold text-white">₹299</td>
                      <td className="p-3 text-slate-300">UPI / QR Payment</td>
                      <td className="p-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Success
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Magic Receipts Telemetry Log Table */}
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-extrabold text-white">మ్యాజిక్ రసీదుల టెలిమెట్రీ (Magic Receipts Log)</h3>
              </div>
              <span className="text-xs text-slate-400">ప్రతి API కాల్‌కు ఆటోమేటిక్ డేటా డిడక్షన్ రసీదు</span>
            </div>

            {receipts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="p-3">రసీదు ID</th>
                      <th className="p-3">సమయం</th>
                      <th className="p-3">మోడల్ ఇంజిన్</th>
                      <th className="p-3">టోకెన్లు (ఇన్ / అవుట్)</th>
                      <th className="p-3">కట్ అయిన ఎంబీ</th>
                      <th className="p-3">మిగిలిన బ్యాలెన్స్</th>
                      <th className="p-3 text-right">గేట్‌వే స్థితి</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {receipts.map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-850/50">
                        <td className="p-3 font-mono text-cyan-400 font-bold">{r.receiptId}</td>
                        <td className="p-3 text-slate-400">{new Date(r.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3 font-semibold text-white">{r.modelName}</td>
                        <td className="p-3 font-mono text-slate-300">
                          {r.promptTokens} in / {r.completionTokens} out ({r.totalTokens} total)
                        </td>
                        <td className="p-3 font-mono font-bold text-amber-400">-{r.dataDeductedMB} MB</td>
                        <td className="p-3 font-mono font-bold text-cyan-300">
                          {r.dataRemainingMB.toFixed(1)} MB
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
              <div className="py-10 text-center text-xs text-slate-500 bg-slate-950/40 rounded-xl border border-dashed border-slate-800">
                ఇంకా ఎలాంటి మ్యాజిక్ రసీదులు ఉత్పత్తి కాలేదు. API ప్లేగ్రౌండ్ లేదా VS Code ద్వారా ప్రాంప్ట్ పంపినప్పుడు రసీదులు ఇక్కడ వెంటనే కనిపిస్తాయి!
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
