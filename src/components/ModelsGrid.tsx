import React, { useState } from 'react';
import { AIModel, AI_MODELS } from '../data/modelsData';
import { 
  Kalachakrastra64Icon, 
  SudarshanaChakraIcon, 
  ChilipiIcon,
  BrahmastraUltraIcon,
  ChatGPTIcon,
  GarudastraIcon,
  AgneyastraIcon
} from './Kalachakrastra64Icon';
import { Search, Zap, Cpu, Code2, BrainCircuit, Globe2, Sparkles, Eye, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface ModelsGridProps {
  onSelectModel: (model: AIModel) => void;
  onOpenRecharge: () => void;
  onOpenDataPacks: () => void;
}

export const ModelsGrid: React.FC<ModelsGridProps> = ({ onSelectModel, onOpenRecharge, onOpenDataPacks }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');

  const providers = ['All', 'Brahmastra', 'DeepSeek', 'Google', 'Anthropic', 'OpenAI', 'Meta', 'Mistral', 'xAI', 'Cohere', 'Perplexity', 'Flux'];

  const filteredModels = AI_MODELS.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.capabilities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProvider = selectedProvider === 'All' || m.provider === selectedProvider;

    return matchesSearch && matchesProvider;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <span 
              className="p-1.5 bg-slate-900 border text-cyan-400 rounded-lg animate-hybrid-engine-glow transition-all shadow-md inline-flex items-center justify-center shrink-0"
              title="హైబ్రిడ్ ఇంజన్ 5-రంగుల సైక్లింగ్ గ్లో ఐకాన్"
            >
              <Cpu className="w-4 h-4" />
            </span>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900 border border-cyan-500/30 shadow-sm">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-wider">
                మొత్తం {AI_MODELS.length} AI ఏజెంట్లు
              </span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2 flex-wrap">
            <span>Choose Your AI Model Engine</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            మొత్తం <strong className="text-slate-900 font-extrabold">{AI_MODELS.length} మంది ఏజెంట్లు</strong> are unlocked on any active <span className="text-cyan-600 font-bold font-mono">phrs-airecharge-</span> data pack.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={onOpenDataPacks}
            className="px-2 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-[11px] font-extrabold hover:bg-emerald-400 transition-all shadow-sm flex items-center gap-1 shrink-0"
          >
            Data Pack
          </button>
          <button
            onClick={onOpenRecharge}
            className="px-2 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-[11px] font-extrabold hover:brightness-110 transition-all shadow-sm shadow-cyan-500/15 flex items-center gap-1 shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Get Plan & Custom Key
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search model, provider or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
        </div>

        {/* Provider Pills with Exact Agent Counts */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0 mr-1">Provider:</span>
          {providers.map((p) => {
            const count = p === 'All' ? AI_MODELS.length : AI_MODELS.filter((m) => m.provider === p).length;
            return (
              <button
                key={p}
                onClick={() => setSelectedProvider(p)}
                className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                  selectedProvider === p
                    ? 'bg-slate-800 text-white border border-slate-700 font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <span>{p}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                  selectedProvider === p ? 'bg-cyan-500 text-slate-950 font-black' : 'bg-slate-850 text-slate-400'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model, idx) => (
          <div
            key={model.id}
            onClick={() => onSelectModel(model)}
            className="group rounded-2xl glass-panel glass-panel-hover p-5 flex flex-col justify-between relative cursor-pointer overflow-hidden"
          >
            {/* Top Bar */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg group-hover:scale-105 transition-transform overflow-hidden">
                    {model.id === 'kalachakrastra-64-pro' ? (
                      <Kalachakrastra64Icon className="w-6 h-6" />
                    ) : model.id === 'brahmastra-3-5-pro' ? (
                      <SudarshanaChakraIcon className="w-6 h-6" />
                    ) : model.id === 'chilipi-3-5-lite' ? (
                      <ChilipiIcon className="w-6 h-6" />
                    ) : model.id === 'chatgpt-agent' ? (
                      <ChatGPTIcon className="w-6 h-6" />
                    ) : model.id === 'brahmastra-3-5-ultra' ? (
                      <BrahmastraUltraIcon className="w-6 h-6" />
                    ) : model.id === 'garudastra-pro' ? (
                      <GarudastraIcon className="w-6 h-6" />
                    ) : model.id === 'agneyastra-ultra' ? (
                      <AgneyastraIcon className="w-6 h-6" />
                    ) : (
                      model.providerLogo
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-cyan-600 transition-colors flex items-center gap-1.5">
                      {model.name}
                    </h3>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {model.provider} · <span className="text-slate-700 font-semibold">{model.category}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono font-black px-1.5 py-0.5 rounded bg-slate-900 text-cyan-300 border border-slate-800" title={`Agent #${idx + 1} of ${AI_MODELS.length}`}>
                    #{idx + 1}
                  </span>
                  {model.badge && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 whitespace-nowrap">
                      {model.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Tagline */}
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                {model.tagline}
              </p>

              {/* Stat Meters */}
              <div className="space-y-2 py-3 border-y border-slate-200 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1 font-medium">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Speed Index
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${model.speedRating}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-slate-800 font-bold">
                      {model.speedRating}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1 font-medium">
                    <BrainCircuit className="w-3.5 h-3.5 text-cyan-600" /> Reasoning Score
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${model.reasoningScore}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-slate-800 font-bold">
                      {model.reasoningScore}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Context Window</span>
                  <span className="font-mono text-slate-800 font-bold">{model.contextWindow}</span>
                </div>
              </div>

              {/* Capabilities Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {model.capabilities.slice(0, 3).map((cap) => (
                  <span
                    key={cap}
                    className="text-[10px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Data Cost</span>
                <span className="text-xs font-black font-mono text-cyan-700">
                  ~{model.costPer1kTokensInMB} MB / 1k tokens
                </span>
              </div>

              <div className="text-xs font-bold text-cyan-700 group-hover:text-cyan-600 flex items-center gap-1">
                Model Details
                <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-16 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 text-sm">No AI models match your search criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedProvider('All');
            }}
            className="mt-3 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-lg transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}

    </div>
  );
};
