import React from 'react';
import { Globe, Check, X, Languages } from 'lucide-react';

export type LanguageCode = 'te' | 'ta' | 'hi' | 'ml' | 'kn' | 'en';

interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
  { code: 'en', name: 'English', nativeName: 'English' },
];

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onSelectLanguage: (code: LanguageCode) => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onSelectLanguage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Languages className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Select Language</h3>
              <p className="text-[10px] text-slate-500 font-bold">అప్లికేషన్ భాషను మార్చుకోండి</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onSelectLanguage(lang.code);
                onClose();
              }}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all border cursor-pointer ${
                currentLanguage === lang.code
                  ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <div className="flex flex-col text-left">
                <span className="text-sm font-bold">{lang.nativeName}</span>
                <span className="text-[10px] opacity-60 uppercase font-bold tracking-tighter">{lang.name}</span>
              </div>
              {currentLanguage === lang.code && (
                <div className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                  <Check className="w-3.5 h-3.5 stroke-[4]" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 bg-slate-950/30 border-t border-slate-800 text-center">
          <p className="text-[10px] text-slate-500 font-medium">
            భాషను ఎంచుకున్నాక అప్లికేషన్ అంతా ఆ భాషలోకి మారుతుంది.
          </p>
        </div>
      </div>
    </div>
  );
};
