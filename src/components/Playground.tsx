import React, { useState } from 'react';
import { AIModel, AI_MODELS } from '../data/modelsData';
import { UserAccount, MagicReceipt } from '../types';
import { Terminal, Send, Copy, Check, Sparkles, Receipt, Zap, ShieldAlert, Cpu, Code2 } from 'lucide-react';

interface PlaygroundProps {
  user: UserAccount | null;
  initialModelId?: string;
  onOpenRecharge: () => void;
  onReceiptGenerated: (receipt: MagicReceipt) => void;
}

export const Playground: React.FC<PlaygroundProps> = ({
  user,
  initialModelId,
  onOpenRecharge,
  onReceiptGenerated,
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(initialModelId || 'deepseek-v3');
  const [promptInput, setPromptInput] = useState<string>(
    'Explain how quantum computing handles superposition in simple terms.'
  );
  const [temperature, setTemperature] = useState<number>(0.7);
  const [activeCodeTab, setActiveCodeTab] = useState<'curl' | 'python' | 'js'>('curl');
  const [isLoading, setIsLoading] = useState(false);
  const [responseOutput, setResponseOutput] = useState<string>('');
  const [latestReceipt, setLatestReceipt] = useState<MagicReceipt | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const selectedModel = AI_MODELS.find((m) => m.id === selectedModelId) || AI_MODELS[0];
  const apiKey = user?.activeApiKey || 'phrs-demo-key-unauthenticated';

  const handleRunRequest = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setResponseOutput('');

    try {
      const res = await fetch('/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: selectedModelId,
          messages: [{ role: 'user', content: promptInput }],
          temperature,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error?.message || 'Error processing request through reverse proxy.');
        return;
      }

      const reply = data.choices?.[0]?.message?.content || 'No output text returned.';
      setResponseOutput(reply);

      if (data.magicReceipt) {
        setLatestReceipt(data.magicReceipt);
        onReceiptGenerated(data.magicReceipt);
      }
    } catch (err: any) {
      console.error('Playground execution error:', err);
      setErrorMessage(err.message || 'Failed to connect to gateway proxy.');
    } finally {
      setIsLoading(false);
    }
  };

  const getCodeSnippet = () => {
    if (activeCodeTab === 'curl') {
      return `curl -X POST http://localhost:3000/api/v1/chat/completions \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${selectedModelId}",
    "messages": [
      {"role": "user", "content": "${promptInput.replace(/'/g, "\\'")}"}
    ],
    "temperature": ${temperature}
  }'`;
    }

    if (activeCodeTab === 'python') {
      return `from openai import OpenAI

# Initialize client using AI Recharge Models Reverse Proxy
client = OpenAI(
    base_url="http://localhost:3000/api/v1",
    api_key="${apiKey}"
)

response = client.chat.completions.create(
    model="${selectedModelId}",
    messages=[{"role": "user", "content": "${promptInput.replace(/"/g, '\\"')}"}],
    temperature=${temperature}
)

print(response.choices[0].message.content)
# Access Magic Receipt headers/metadata
print("Magic Receipt:", response.magicReceipt)`;
    }

    return `// JavaScript / Node.js using fetch API
const response = await fetch('http://localhost:3000/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: '${selectedModelId}',
    messages: [{ role: 'user', content: '${promptInput.replace(/'/g, "\\'")}' }],
    temperature: ${temperature}
  })
});

const data = await response.json();
console.log('AI Output:', data.choices[0].message.content);
console.log('Magic Receipt:', data.magicReceipt);`;
  };

  const copySnippet = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center gap-1.5">
            <Terminal className="w-4 h-4" />
            Reverse Proxy Gateway Sandbox
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Live API Playground
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Test any model using your active <code className="text-cyan-300 font-mono">phrs-</code> bearer key and inspect live magic receipts.
          </p>
        </div>

        <button
          onClick={onOpenRecharge}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400 text-xs font-bold hover:bg-slate-850 transition-all flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          Recharge Data Pack
        </button>
      </div>

      {/* Main Grid Split: Config & Playground (Left) vs Output & Receipt (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Prompt Config & Code Snippets (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Model & Temp Selector */}
          <div className="p-5 rounded-2xl glass-panel space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Select AI Model Engine
                </label>
                <select
                  value={selectedModelId}
                  onChange={(e) => setSelectedModelId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-medium focus:outline-none focus:border-cyan-500"
                >
                  {AI_MODELS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.providerLogo} {m.name} ({m.provider})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1.5">
                  Temperature ({temperature})
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full accent-cyan-400 cursor-pointer mt-2"
                />
              </div>

            </div>

            {/* Quick Prompt Presets */}
            <div className="flex items-center gap-2 pt-2 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-500 font-semibold shrink-0">Presets:</span>
              <button
                onClick={() => setPromptInput('Write a Python script to compute Fibonacci numbers using dynamic programming.')}
                className="text-[10px] text-slate-400 hover:text-cyan-300 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg shrink-0"
              >
                Python Code
              </button>
              <button
                onClick={() => setPromptInput('Analyze the trade-offs between Monolithic and Microservices backend architectures.')}
                className="text-[10px] text-slate-400 hover:text-cyan-300 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg shrink-0"
              >
                System Architecture
              </button>
              <button
                onClick={() => setPromptInput('Summarize key breakthroughs in LLM reasoning models like DeepSeek R1 and OpenAI o1.')}
                className="text-[10px] text-slate-400 hover:text-cyan-300 bg-slate-950 border border-slate-800 px-2.5 py-1 rounded-lg shrink-0"
              >
                AI Deep Dive
              </button>
            </div>

            {/* Prompt Textarea */}
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1.5">
                Input Prompt
              </label>
              <textarea
                rows={4}
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="Enter prompt for reverse proxy gateway..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 font-mono leading-relaxed"
              />
            </div>

            {/* Execute Button */}
            <button
              onClick={handleRunRequest}
              disabled={isLoading || !promptInput.trim()}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 text-slate-950 font-extrabold text-xs hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Routing Prompt via sk-airecharge Proxy...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Request to {selectedModel.name}
                </>
              )}
            </button>
          </div>

          {/* Code Snippets Panel */}
          <div className="p-5 rounded-2xl glass-panel space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Integration Snippets
                </h3>
              </div>

              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveCodeTab('curl')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                    activeCodeTab === 'curl' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  cURL
                </button>
                <button
                  onClick={() => setActiveCodeTab('python')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                    activeCodeTab === 'python' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Python
                </button>
                <button
                  onClick={() => setActiveCodeTab('js')}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded ${
                    activeCodeTab === 'js' ? 'bg-cyan-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  Node.js
                </button>
              </div>
            </div>

            <div className="relative">
              <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
                {getCodeSnippet()}
              </pre>
              <button
                onClick={copySnippet}
                className="absolute top-3 right-3 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded-md transition-colors flex items-center gap-1"
              >
                {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                {copiedCode ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Output & Live Magic Receipt (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Output Display */}
          <div className="p-5 rounded-2xl glass-panel space-y-3 min-h-[220px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-cyan-400" /> AI Gateway Response
                </span>
                <span className="text-[10px] font-mono text-slate-500">{selectedModel.name}</span>
              </div>

              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Gateway Error</span>
                    {errorMessage}
                  </div>
                </div>
              )}

              {isLoading && (
                <div className="py-12 text-center space-y-3">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Interception & token computation in progress...</p>
                </div>
              )}

              {!isLoading && !errorMessage && responseOutput && (
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto">
                  {responseOutput}
                </div>
              )}

              {!isLoading && !errorMessage && !responseOutput && (
                <div className="py-12 text-center text-xs text-slate-500">
                  Click "Send Request" to test reverse proxy response.
                </div>
              )}
            </div>
          </div>

          {/* Live Magic Receipt Card */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-cyan-500/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-white">Magic Receipt Headers</h3>
                  <span className="text-[10px] text-slate-400">Real-Time Data Pack Deduction</span>
                </div>
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {latestReceipt ? 'Receipt Verified' : 'Awaiting Request'}
              </span>
            </div>

            {latestReceipt ? (
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Receipt ID:</span>
                  <span className="text-slate-200 font-bold">{latestReceipt.receiptId}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Prompt Tokens</span>
                    <span className="font-bold text-slate-200">{latestReceipt.promptTokens}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Completion Tokens</span>
                    <span className="font-bold text-slate-200">{latestReceipt.completionTokens}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">MB Deducted:</span>
                    <span className="font-bold text-amber-400">{latestReceipt.dataDeductedMB} MB</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Data Pack Remaining:</span>
                    <span className="font-bold text-cyan-400">
                      {(latestReceipt.dataRemainingMB / 1024).toFixed(2)} GB ({latestReceipt.dataRemainingMB.toFixed(1)} MB)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 text-[11px]">Daily High-Speed Used:</span>
                    <span className="font-bold text-emerald-400">
                      {latestReceipt.dailyUsedMB.toFixed(1)} / {latestReceipt.dailyLimitMB} MB
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-500 text-right">
                  HTTP Status: {latestReceipt.gatewayStatus}
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                <p>Run a prompt to generate your first live magic receipt.</p>
                <p className="text-[10px] text-slate-600">Calculates exact tokens and updates quota balance in real-time.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
