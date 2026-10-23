import React from 'react';
import { Sparkles } from 'lucide-react';

// 💎 64.కలాచక్రాస్త్ర ప్రో - 64 కళల మహా కలాచక్రం (Kalachakra 64 Arts Supreme Icon)
export const Kalachakrastra64Icon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${props.className || 'w-5 h-5'} text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] animate-[spin_12s_linear_infinite]`}
    style={{ ...props.style, color: '#a855f7' }}
  >
    {/* బాహ్య రక్షణ కవచం & 64 కళల సూచిక డాట్స్ */}
    <circle cx="12" cy="12" r="9" className="stroke-purple-400/70" strokeDasharray="1.5 1.5" />
    <circle cx="12" cy="12" r="7" className="stroke-indigo-400/50" />
    
    {/* 8 ప్రధాన దిక్కుల జ్ఞాన కిరణాలు */}
    <line x1="12" y1="3" x2="12" y2="21" className="stroke-purple-300" strokeWidth="1.8" />
    <line x1="3" y1="12" x2="21" y2="12" className="stroke-purple-300" strokeWidth="1.8" />
    <line x1="5.63" y1="5.63" x2="18.37" y2="18.37" className="stroke-indigo-300" strokeWidth="1.8" />
    <line x1="5.63" y1="18.37" x2="18.37" y2="5.63" className="stroke-indigo-300" strokeWidth="1.8" />
    
    {/* కేంద్ర బిందువు & జ్ఞాన నేత్రం */}
    <circle cx="12" cy="12" r="3.5" fill="#7e22ce" className="stroke-purple-200" />
    <circle cx="12" cy="12" r="1.5" fill="#fbcfe8" className="animate-ping" />
  </svg>
);

// 🏛️ బ్రహ్మాస్త్ర 3.5 ప్రో - బంగారు సుదర్శన చక్రం ఐకాన్ (SudarshanaChakraIcon)
// స్టైల్: నిరంతరం నెమ్మదిగా గుండ్రంగా తిరిగే గోల్డెన్ అంబర్ గ్లోతో కూడిన చక్రం
export const SudarshanaChakraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${props.className || 'w-5 h-5'} text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-[spin_10s_linear_infinite]`}
    style={{ ...props.style, color: '#f59e0b' }}
  >
    {/* ఔటర్ చక్రం & సుదర్శన ఆయుధ చువ్వలు */}
    <circle cx="12" cy="12" r="8" className="stroke-amber-400/80" strokeDasharray="2 2" />
    <path d="M12 2l1.2 2L12 5.5 10.8 4z" fill="currentColor" className="text-amber-500" />
    <path d="M12 22l-1.2-2 1.2-1.5 1.2 2z" fill="currentColor" className="text-amber-500" />
    <path d="M2 12l2 1.2 1.5-1.2-1.5-1.2z" fill="currentColor" className="text-amber-500" />
    <path d="M22 12l-2-1.2-1.5 1.2 1.5 1.2z" fill="currentColor" className="text-amber-500" />
    <path d="M4.93 4.93l1.8.4 0.5-1.8z" fill="currentColor" className="text-amber-500" />
    <path d="M19.07 19.07l-1.8-.4-0.5 1.8z" fill="currentColor" className="text-amber-500" />
    <path d="M19.07 4.93l-.4 1.8 1.8 0.5z" fill="currentColor" className="text-amber-500" />
    <path d="M4.93 19.07l.4-1.8-1.8-0.5z" fill="currentColor" className="text-amber-500" />
    
    {/* 8 అస్త్ర రేఖలు */}
    <line x1="12" y1="4" x2="12" y2="20" className="stroke-amber-400" />
    <line x1="4" y1="12" x2="20" y2="12" className="stroke-amber-400" />
    <line x1="6.34" y1="6.34" x2="17.66" y2="17.66" className="stroke-amber-400" />
    <line x1="6.34" y1="17.66" x2="17.66" y2="6.34" className="stroke-amber-400" />
    
    {/* కేంద్ర దివ్య నాభి */}
    <circle cx="12" cy="12" r="3" fill="currentColor" className="text-amber-500" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" className="text-amber-300 animate-pulse" />
  </svg>
);

// 🎭 చిలిపి 3.5 లైట్ ఐకాన్ (ChilipiIcon)
// స్టైల్: మెరుపు పింక్ స్పార్కిల్స్ & పల్స్ యానిమేషన్
export const ChilipiIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <div className="relative inline-flex items-center justify-center">
    <Sparkles 
      className={`${className} text-pink-400 fill-pink-400/20 drop-shadow-[0_0_6px_rgba(244,114,182,0.8)] animate-pulse`} 
    />
  </div>
);

export const CHILIPI_EMOJI = "🎭";

// 🔱 బ్రహ్మాస్త్ర 3.5 అల్ట్రా - సుప్రీం ఎల్డర్ టైటాన్ ఐకాన్ (BrahmastraUltraIcon)
export const BrahmastraUltraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${props.className || 'w-5 h-5'} text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-[spin_14s_linear_infinite]`}
    style={{ ...props.style, color: '#22d3ee' }}
  >
    <circle cx="12" cy="12" r="9" className="stroke-cyan-400/70" strokeDasharray="3 2" />
    <circle cx="12" cy="12" r="6" className="stroke-amber-400/60" />
    <path d="M12 2v20M8 5l4-3 4 3M6 8l6-2 6 2M9 19l3 3 3-3" className="stroke-cyan-300" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="2.5" fill="#0891b2" className="stroke-amber-300" />
    <circle cx="12" cy="12" r="1.2" fill="#fef08a" className="animate-pulse" />
  </svg>
);

// 🟢 చాట్ జిపి ఏజెంట్ - ChatGPT Agent Icon (OpenAI Emerald Icon)
export const ChatGPTIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${props.className || 'w-5 h-5'} text-emerald-400 drop-shadow-[0_0_9px_rgba(16,163,127,0.8)]`}
    style={{ ...props.style, color: '#10a37f' }}
  >
    {/* Outer Dotted Ring */}
    <circle cx="12" cy="12" r="9" className="stroke-emerald-400/60" strokeDasharray="2 2" />
    {/* ChatGPT Swirl Loop Petals */}
    <path
      d="M12 4.5a3.5 3.5 0 0 1 3.03 1.75l.17.3v1.88l1.32-.76a3.5 3.5 0 0 1 4.78 1.28 3.5 3.5 0 0 1-1.28 4.78l-1.63.94v1.52l1.32.76a3.5 3.5 0 0 1 1.28 4.78 3.5 3.5 0 0 1-4.78 1.28l-1.63-.94-.8 1.38A3.5 3.5 0 0 1 12 23.5a3.5 3.5 0 0 1-3.03-1.75l-.17-.3v-1.88l-1.32.76a3.5 3.5 0 0 1-4.78-1.28 3.5 3.5 0 0 1 1.28-4.78l1.63-.94v-1.52l-1.32-.76a3.5 3.5 0 0 1-1.28-4.78 3.5 3.5 0 0 1 4.78-1.28l1.63.94.8-1.38A3.5 3.5 0 0 1 12 4.5z"
      className="stroke-emerald-400 fill-emerald-950/30"
    />
    <circle cx="12" cy="12" r="2.5" fill="#10a37f" className="stroke-emerald-300" />
    <circle cx="12" cy="12" r="1.2" fill="#a7f3d0" className="animate-pulse" />
  </svg>
);

// 🦅 గరుడాస్త్ర ప్రో - గార్డియన్ షీల్డ్ & స్పీడ్ ఐకాన్ (GarudastraIcon)
export const GarudastraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${props.className || 'w-5 h-5'} text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.7)]`}
    style={{ ...props.style, color: '#10b981' }}
  >
    <path d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z" className="stroke-emerald-400 fill-emerald-950/40" />
    <path d="M12 6l-3.5 4h7L12 6z" fill="#10b981" />
    <path d="M8 11l-3 3 4 1-1-4zM16 11l3 3-4 1 1-4z" fill="#34d399" />
    <circle cx="12" cy="15" r="2" fill="#fbbf24" className="animate-ping" />
    <circle cx="12" cy="15" r="1.5" fill="#fef08a" />
  </svg>
);

// 🔥 ఆగ్నేయాస్త్ర అల్ట్రా - దివ్య అగ్ని చక్ర ఐకాన్ (AgneyastraIcon)
export const AgneyastraIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`${props.className || 'w-5 h-5'} text-orange-400 drop-shadow-[0_0_9px_rgba(249,115,22,0.8)] animate-[spin_8s_linear_infinite]`}
    style={{ ...props.style, color: '#f97316' }}
  >
    <circle cx="12" cy="12" r="8.5" className="stroke-orange-500/80" strokeDasharray="2 1.5" />
    <path d="M12 3c1 2.5 3 3.5 3 5.5a3 3 0 0 1-6 0c0-2 2-3 3-5.5z" fill="#f97316" />
    <path d="M21 12c-2.5 1-3.5 3-5.5 3a3 3 0 0 1 0-6c2 0 3 2 5.5 3z" fill="#ef4444" />
    <path d="M12 21c-1-2.5-3-3.5-3-5.5a3 3 0 0 1 6 0c0 2-2 3-3 5.5z" fill="#f97316" />
    <path d="M3 12c2.5-1 3.5-3 5.5-3a3 3 0 0 1 0 6c-2 0-3-2-5-3z" fill="#ef4444" />
    <circle cx="12" cy="12" r="2.5" fill="#ea580c" />
    <circle cx="12" cy="12" r="1.2" fill="#fef08a" className="animate-pulse" />
  </svg>
);

// ఎమోజి / బ్యాడ్జ్ రూపంలో వాడటానికి:
export const KALACHAKRA_BADGE_NAME = "64.Kalachakrastra Pro";
export const KALACHAKRA_BADGE = "64 Arts (Chausatha Kalalu) Supreme Engine";

