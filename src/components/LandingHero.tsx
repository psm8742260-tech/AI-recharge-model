import React from 'react';
import { Bot, Zap, ShieldCheck, Key, ArrowRight, Sparkles, CheckCircle2, Cpu, Receipt } from 'lucide-react';

interface LandingHeroProps {
  onOpenAuth: () => void;
  onExploreModels: () => void;
  onOpenRecharge: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onOpenAuth,
  onExploreModels,
  onOpenRecharge,
}) => {
  return (
    <div className="relative overflow-hidden pt-4 pb-12 bg-grid-pattern">
      {/* Glow Effects - Reduced */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-cyan-500/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-2xl mx-auto space-y-4">
          
          {/* Main Headline - More Compact */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
            AI Data Packs for{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              20 Top Models
            </span>
          </h1>

          {/* Subtitle - More Compact */}
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            Get a custom <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-xs">phrs-</code> key and route prompts with real-time token-to-MB quota deduction.
          </p>

          {/* Login Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto px-6 py-2.5 text-xs font-extrabold rounded-xl text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:brightness-110 transition-all shadow-md shadow-cyan-500/15 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Google / Email Login
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onExploreModels}
              className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold rounded-xl text-slate-200 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Cpu className="w-4 h-4 text-cyan-400" />
              Explore Models
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
