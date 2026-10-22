import React, { useState } from 'react';
import { AIModel, AI_MODELS } from '../data/modelsData';
import { Search, Zap, Cpu, Code2, BrainCircuit, Globe2, Sparkles, Eye, ArrowUpRight, ShieldCheck } from 'lucide-react';

interface ModelsGridProps {
  onSelectModel: (model: AIModel) => void;
  onOpenRecharge: () => void;
}

export const ModelsGrid: React.FC<ModelsGridProps> = ({ onSelectModel, onOpenRecharge }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const providers = ['All', 'DeepSeek', 'Google', 'Anthropic', 'OpenAI', 'Meta', 'Mistral', 'xAI', 'Cohere', 'Perplexity'];
  const categories = ['All', 'Reasoning', 'Coding', 'Fast Chat', 'Multimodal', 'Search & RAG'];

  const filteredModels = AI_MODELS.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.capabilities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesProvider = selectedProvider === 'All' || m.provider === selectedProvider;
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;

    return matchesSearch && matchesProvider && matchesCategory;
  });

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
            <Cpu className="w-4 h-4" />
            20 AI Models Grid
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Choose Your AI Model Engine
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            All 20 models are unlocked on any active <span className="text-cyan-400 font-medium">sk-airecharge-</span> data pack.
          </p>
        </div>

        <button
          onClick={onOpenRecharge}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-xs font-extrabold hover:brightness-110 transition-all shadow-md shadow-cyan-500/15 flex items-center gap-2 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          Get Plan & Custom Key
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search model, provider or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>

        {/* Provider Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-500 shrink-0 mr-1">Provider:</span>
          {providers.map((p) => (
            <button
              key={p}
              onClick={() => setSelectedProvider(p)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedProvider === p
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Models Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            onClick={() => onSelectModel(model)}
            className="group rounded-2xl glass-panel glass-panel-hover p-5 flex flex-col justify-between relative cursor-pointer overflow-hidden"
          >
            {/* Top Bar */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-lg group-hover:scale-105 transition-transform">
                    {model.providerLogo}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
                      {model.name}
                    </h3>
                    <div className="text-[11px] text-slate-400 font-medium">
                      {model.provider} · <span className="text-slate-300">{model.category}</span>
                    </div>
                  </div>
                </div>

                {model.badge && (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 whitespace-nowrap">
                    {model.badge}
                  </span>
                )}
              </div>

              {/* Tagline */}
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
                {model.tagline}
              </p>

              {/* Stat Meters */}
              <div className="space-y-2 py-3 border-y border-slate-800/80 mb-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" /> Speed Index
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full"
                        style={{ width: `${model.speedRating}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-slate-200 font-bold">
                      {model.speedRating}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <BrainCircuit className="w-3.5 h-3.5 text-cyan-400" /> Reasoning Score
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${model.reasoningScore}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-slate-200 font-bold">
                      {model.reasoningScore}/100
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Context Window</span>
                  <span className="font-mono text-slate-200 font-bold">{model.contextWindow}</span>
                </div>
              </div>

              {/* Capabilities Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {model.capabilities.slice(0, 3).map((cap) => (
                  <span
                    key={cap}
                    className="text-[10px] font-medium text-slate-300 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase font-medium">Data Cost</span>
                <span className="text-xs font-bold font-mono text-cyan-400">
                  ~{model.costPer1kTokensInMB} MB / 1k tokens
                </span>
              </div>

              <div className="text-xs font-bold text-cyan-400 group-hover:text-cyan-300 flex items-center gap-1">
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
              setSelectedCategory('All');
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
