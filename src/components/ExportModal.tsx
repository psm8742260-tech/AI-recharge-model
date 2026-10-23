import React, { useState } from 'react';
import { Download, FileArchive, Server, Globe, X, FolderCheck } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [downloadingType, setDownloadingType] = useState<'public_html' | 'main' | null>(null);

  if (!isOpen) return null;

  const handleDownloadPublicHtml = () => {
    setDownloadingType('public_html');
    const link = document.createElement('a');
    link.href = '/api/export-public-html';
    link.download = 'cpanel_public_html.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingType(null);
    }, 2000);
  };

  const handleDownloadMainZip = () => {
    setDownloadingType('main');
    const link = document.createElement('a');
    link.href = '/api/export-zip';
    link.download = 'airecharge-cpanel-main.zip';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadingType(null);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/10 text-white overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg">
            <FileArchive className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              cPanel ఎక్స్పోర్ట్ ఆప్షన్స్
            </h2>
            <p className="text-xs text-cyan-400 font-medium">Download ZIP for cPanel Upload</p>
          </div>
        </div>

        <div className="space-y-4 my-6">
          {/* Public HTML Option Info */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" /> public_html డైరెక్ట్ అప్‌లోడ్ (Static Build):
              </span>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                .htaccess Included
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              దీనిని మీ cPanel లోని <code className="text-emerald-300 bg-slate-950 px-1.5 py-0.5 rounded font-mono">public_html</code> ఫోల్డర్ లో ఎక్స్‌ట్రాక్ట్ చేయండి. ఇందులో వెబ్‌సైట్ ఫైల్స్ మరియు SPA రీరైట్ కోసం <code className="text-emerald-300 bg-slate-950 px-1 py-0.5 rounded font-mono">.htaccess</code> రెడీగా ఉన్నాయి.
            </p>
          </div>

          {/* Node.js Server Option Info */}
          <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Server className="w-4 h-4 text-cyan-400" /> cPanel Node.js App (Full Source):
              </span>
              <span className="text-cyan-400 font-mono text-xs">server.js Ready</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              cPanel "Setup Node.js App" ఉపయోగిస్తుంటే ఈ జిప్ ఫైల్ ఎంచుకోండి. ఇందులో <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded font-mono">server.js</code> ప్రవేశద్వారం ఉంది.
            </p>
          </div>
        </div>

        {/* Action Download Buttons */}
        <div className="space-y-3 pt-2">
          {/* Primary Option: public_html Static Build */}
          <button
            onClick={handleDownloadPublicHtml}
            disabled={downloadingType !== null}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
          >
            {downloadingType === 'public_html' ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                public_html ఫైల్ డౌన్‌లోడ్ అవుతోంది...
              </>
            ) : (
              <>
                <FolderCheck className="w-5 h-5" />
                public_html ZIP డౌన్‌లోడ్ చేయండి (Recommended)
              </>
            )}
          </button>

          {/* Secondary Option: Node.js App Source */}
          <button
            onClick={handleDownloadMainZip}
            disabled={downloadingType !== null}
            className="w-full py-3 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {downloadingType === 'main' ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-200 border-t-transparent rounded-full animate-spin" />
                Node.js Main ZIP డౌన్‌లోడ్ అవుతోంది...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 text-cyan-400" />
                cPanel Node.js App ZIP డౌన్‌లోడ్ చేయండి
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-2 text-xs text-slate-400 hover:text-white font-bold transition-all text-center"
          >
            మూసివేయి (Close)
          </button>
        </div>

      </div>
    </div>
  );
};

