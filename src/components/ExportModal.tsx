import React, { useState, useEffect } from 'react';
import { Download, FileArchive, X, FolderCheck, CheckCircle2, ShieldCheck, Loader2, Copy, Check, ExternalLink } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose }) => {
  const [downloadingType, setDownloadingType] = useState<'bundle' | 'public_html' | null>(null);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [hasCopied, setHasCopied] = useState<boolean>(false);
  const [bundleSize, setBundleSize] = useState<string>('36.5 MB');

  useEffect(() => {
    fetch('/api/admin/bundle-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.sizeMb) setBundleSize(data.sizeMb);
      })
      .catch(() => {});
  }, []);

  if (!isOpen) return null;

  const directBundleUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/cpanel-bundle.zip`
    : '/cpanel-bundle.zip';

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(directBundleUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = directBundleUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 3000);
    } catch (err) {
      console.warn('Failed to copy link:', err);
    }
  };

  const handleDownloadBundle = () => {
    setDownloadingType('bundle');
    setErrorMessage('');
    setDownloadSuccessMessage('');

    try {
      // 1. Direct browser download trigger via native anchor
      const link = document.createElement('a');
      link.href = '/cpanel-bundle.zip';
      link.download = 'airecharge-cpanel-bundle.zip';
      link.target = '_self';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => link.remove(), 1000);

      // 2. Direct window.location assignment fallback for mobile Chrome/Android
      setTimeout(() => {
        try {
          window.location.assign('/cpanel-bundle.zip');
        } catch (e) {
          console.warn('Location assign fallback error:', e);
        }
      }, 250);

      setDownloadSuccessMessage('✅ ZIP ఫైల్ డౌన్‌లోడ్ ప్రారంభమైంది! మీ మొబైల్ "Downloads" లేదా నోటిఫికేషన్ చూడండి.');
    } catch (err: any) {
      console.warn('Download error:', err);
      setErrorMessage('డౌన్‌లోడ్ ప్రారంభించడంలో సమస్య ఏర్పడింది. కింద ఉన్న డైరెక్ట్ లింక్ ఉపయోగించండి.');
    } finally {
      setTimeout(() => setDownloadingType(null), 1200);
    }
  };

  const handleDownloadPublicHtml = () => {
    setDownloadingType('public_html');
    setErrorMessage('');
    setDownloadSuccessMessage('');

    try {
      const link = document.createElement('a');
      link.href = '/api/export-public-html';
      link.download = 'cpanel_public_html.zip';
      link.target = '_self';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => link.remove(), 1000);

      setTimeout(() => {
        try {
          window.location.assign('/api/export-public-html');
        } catch (e) {
          console.warn('Location assign fallback error:', e);
        }
      }, 250);

      setDownloadSuccessMessage('✅ static public_html ZIP డౌన్‌లోడ్ ప్రారంభమైంది! Downloads చూడండి.');
    } catch (err: any) {
      console.warn('Public html download error:', err);
      setErrorMessage('డౌన్‌లోడ్ చేయడంలో సమస్య ఏర్పడింది. దయచేసి మళ్ళీ ప్రయత్నించండి.');
    } finally {
      setTimeout(() => setDownloadingType(null), 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/30 rounded-3xl p-5 sm:p-7 shadow-2xl shadow-cyan-500/10 text-white overflow-hidden max-h-[92vh] overflow-y-auto">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-indigo-600" />
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-all cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-lg">
            <FileArchive className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              cPanel లైవ్ డిప్లాయ్‌మెంట్ ZIP
            </h2>
            <p className="text-xs text-cyan-400 font-medium">Ready-to-Deploy Full Package ({bundleSize})</p>
          </div>
        </div>

        {/* Highlight Box: Full Production Package */}
        <div className="p-4 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 100% పబ్లిక్ html రూట్ సిద్ధం (Full Bundle):
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono font-bold">
              {bundleSize} (~37 MB)
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            ఈ ZIP లో కంపైల్ అయిన పూర్తి <strong>public_html</strong> ఫైల్స్ (index.html, assets, .htaccess మరియు అన్ని ఇమేజ్‌లు) నేరుగా రూట్ ఫోల్డర్‌లో ఉన్నాయి. దీనిని cPanel public_html లో ఎక్స్‌ట్రాక్ట్ చేయగానే లైవ్ రన్ అవుతుంది!
          </p>
        </div>

        {/* Direct Download Link & Copy URL Box */}
        <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl mb-4 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
            <span>డైరెక్ట్ డౌన్‌లోడ్ లింక్ (DIRECT URL):</span>
            <span className="text-emerald-400 font-mono">{bundleSize} ZIP</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={directBundleUrl}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 select-all outline-none truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer active:scale-95"
            >
              {hasCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">కాపీ అయింది!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Status or Success Notification */}
        {downloadSuccessMessage && (
          <div className="p-3.5 mb-4 bg-emerald-950/60 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 mb-4 bg-rose-950/60 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold">
            {errorMessage}
          </div>
        )}

        {/* Action Download Buttons */}
        <div className="space-y-3">
          {/* Primary Native Download Button / Anchor */}
          <a
            href="/cpanel-bundle.zip"
            download="airecharge-cpanel-bundle.zip"
            onClick={handleDownloadBundle}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 font-black text-sm tracking-wide transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer text-center"
          >
            {downloadingType === 'bundle' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                <span>ZIP డౌన్‌లోడ్ అవుతోంది... ({bundleSize})</span>
              </>
            ) : (
              <>
                <Download className="w-5 h-5 text-slate-950" />
                <span>cPanel కంప్లీట్ బండిల్ ZIP డౌన్‌లోడ్ ({bundleSize})</span>
              </>
            )}
          </a>

          {/* Secondary Option: Static Only public_html */}
          <a
            href="/api/export-public-html"
            download="cpanel_public_html.zip"
            onClick={handleDownloadPublicHtml}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            {downloadingType === 'public_html' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                <span>డౌన్‌లోడ్ అవుతోంది...</span>
              </>
            ) : (
              <>
                <FolderCheck className="w-4 h-4 text-slate-400" />
                <span>కేవలం Static public_html ZIP (సర్వర్ లేకుండా)</span>
              </>
            )}
          </a>

          {/* Open in new browser tab fallback */}
          <div className="pt-1 flex items-center justify-between text-xs text-slate-400">
            <span>మొబైల్ బ్రౌజర్‌లో తెరవడానికి:</span>
            <a
              href="/cpanel-bundle.zip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline font-bold flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              కొత్త విండోలో డౌన్‌లోడ్ చేయండి
            </a>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs text-slate-400 hover:text-white font-bold transition-all text-center cursor-pointer mt-2"
          >
            మూసివేయి (Close)
          </button>
        </div>

      </div>
    </div>
  );
};
