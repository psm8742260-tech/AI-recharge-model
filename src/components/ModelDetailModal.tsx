import React, { useState } from 'react';
import { AIModel } from '../data/modelsData';
import { X, Zap, BrainCircuit, Code2, Copy, Check, Terminal, ShieldCheck, Sparkles, Cpu, ArrowLeft } from 'lucide-react';

interface ModelDetailModalProps {
  model: AIModel | null;
  onClose: () => void;
  onOpenRecharge: () => void;
  onOpenPlaygroundWithModel: (modelId: string) => void;
}

export const ModelDetailModal: React.FC<ModelDetailModalProps> = ({
  model,
  onClose,
  onOpenRecharge,
  onOpenPlaygroundWithModel,
}) => {
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!model) return null;

  const sampleCurl = `curl -X POST https://api.airecharge.com/v1/chat/completions \\
  -H "Authorization: Bearer phrs-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.id}",
    "messages": [{"role": "user", "content": "Hello ${model.name}!"}]
  }'`;

  const copyCurl = () => {
    navigator.clipboard.writeText(sampleCurl);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-4 sm:p-6 relative shadow-2xl space-y-4 my-2 max-h-[95vh] overflow-y-auto">
        
        {/* Back Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/50 transition-all shadow-lg"
          title="మళ్ళీ వెనక్కి వెళ్ళండి"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Model Header */}
        <div className="flex items-start gap-4 pt-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
            {model.providerLogo}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold text-cyan-400 uppercase tracking-wider">{model.provider}</span>
              <span className="text-slate-600">·</span>
              <span className="text-[10px] text-slate-400">{model.category}</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-0.5">{model.name}</h2>
            <p className="text-[10px] text-slate-300 mt-0.5 leading-relaxed">{model.tagline}</p>
          </div>
        </div>

        {/* Extended Description */}
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-300 leading-relaxed">
          {model.description}
        </div>

        {/* Performance Benchmark Bar Matrix */}
        <div className="space-y-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[8px] font-bold text-emerald-400 uppercase tracking-tighter">Hybrid AI Engine Verified</span>
            <span className="text-[8px] text-slate-500 font-mono">v4.0.2</span>
          </div>
          <div className="grid grid-cols-3 gap-0.5 p-0.5 rounded-lg bg-emerald-500/5 border border-emerald-500/40 h-[36px] items-center">
            <div className="text-center min-w-0">
              <div className="text-[6px] text-slate-400 uppercase font-bold truncate">Speed</div>
              <div className="text-[10px] font-mono font-black text-amber-400 leading-none">{model.speedRating}<span className="text-[6px] text-slate-500">/100</span></div>
            </div>

            <div className="text-center min-w-0 border-x border-emerald-500/20">
              <div className="text-[6px] text-slate-400 uppercase font-bold truncate">Reasoning</div>
              <div className="text-[10px] font-mono font-black text-cyan-400 leading-none">{model.reasoningScore}<span className="text-[6px] text-slate-500">/100</span></div>
            </div>

            <div className="text-center min-w-0">
              <div className="text-[6px] text-slate-400 uppercase font-bold truncate">Coding</div>
              <div className="text-[10px] font-mono font-black text-emerald-400 leading-none">{model.codingScore}<span className="text-[6px] text-slate-500">/100</span></div>
            </div>
          </div>
        </div>

        {/* Data Quota & Token Economics */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Quota & Token Economics</h4>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Context Window</span>
              <span className="font-mono font-bold text-slate-100 text-sm">{model.contextWindow}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Token Density</span>
              <span className="font-mono font-bold text-cyan-400 text-sm">~{model.tokensPerMB.toLocaleString()} tokens / MB</span>
            </div>
          </div>
        </div>

        {/* cURL Usage Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" /> API Gateway cURL Example
            </h4>
            <button
              onClick={copyCurl}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedCurl ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
            {sampleCurl}
          </pre>
        </div>

        {/* CTA Modal Footer */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => {
              onClose();
              onOpenPlaygroundWithModel(model.id);
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            Test in Playground
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenRecharge();
            }}
            className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-emerald-400 hover:brightness-110 text-slate-950 text-xs font-extrabold transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Get Plan & Key (₹399/mo)
          </button>
        </div>

      </div>
    </div>
  );
};
