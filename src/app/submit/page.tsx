'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const META: Record<string, { name: string; letter: string; color: string; role: string }> = {
  apartment: { name: 'Residential & Property', letter: 'R', color: 'bg-blue-500', role: 'Property Manager Agent' },
  university: { name: 'University & Campus', letter: 'U', color: 'bg-violet-500', role: 'Campus IT Agent' },
  healthcare: { name: 'Healthcare & Clinical', letter: 'H', color: 'bg-rose-500', role: 'Triage Director Agent' },
  mall: { name: 'Retail & Commercial', letter: 'M', color: 'bg-emerald-500', role: 'Operations Director Agent' },
  corporate: { name: 'Corporate & Enterprise IT', letter: 'C', color: 'bg-amber-500', role: 'DevOps Engineer Agent' },
};

const PRI_STYLE: Record<string, string> = {
  CRITICAL: 'bg-red-500/10 text-red-400 border-red-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  LOW: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

interface Analysis {
  predictedPriority: string;
  predictedCategory: string;
  confidence: number;
  summary: string;
  resolutionSteps: string[];
  estimatedTime: string;
  reasoning: string;
}

function SubmitContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const domain = sp.get('domain') || 'corporate';
  const m = META[domain] || META.corporate;

  const [mode, setMode] = useState<'form' | 'chat'>('form');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loc, setLoc] = useState('');
  const [chat, setChat] = useState('');

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, description: desc, location: loc, domain }) });
      const d = await r.json();
      setResult({ request: d.request, alert: d.alert });
    } catch { alert('Submission failed'); }
    finally { setLoading(false); }
  };

  const submitChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chat.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch('/api/ai/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: chat, domain }) });
      const d = await r.json();
      setResult({ request: d.request, analysis: d.analysis, alert: d.alert });
    } catch { alert('Processing failed'); }
    finally { setLoading(false); }
  };

  const analysis: Analysis | null = result?.request?.aiAnalysis || result?.analysis || null;

  const inputClass = 'w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all text-sm';

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="flex items-center justify-between px-6 lg:px-10 py-4 max-w-7xl mx-auto">
          <button onClick={() => router.push('/')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">R</div>
            <span className="text-base font-semibold tracking-tight">ResolveHQ</span>
          </button>
          <div className="flex items-center gap-2">
            <select value={domain} onChange={(e) => router.push(`/submit?domain=${e.target.value}`)} className="text-xs px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none cursor-pointer">
              {Object.entries(META).map(([k, v]) => <option key={k} value={k} className="bg-zinc-900">{v.name}</option>)}
            </select>
            <button onClick={() => router.push(`/dashboard?domain=${domain}`)} className="text-sm px-4 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition-all text-zinc-300">
              Dashboard
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-8 h-8 rounded-lg ${m.color} flex items-center justify-center font-bold text-xs text-white`}>{m.letter}</div>
          <span className="text-xs text-zinc-500 font-medium">{m.role}</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Submit a service request</h1>
        <p className="text-sm text-zinc-400 mb-8">The AI agent will automatically classify, prioritize, and generate a resolution plan.</p>

        {/* Mode */}
        <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit mb-8">
          {(['form', 'chat'] as const).map((t) => (
            <button key={t} onClick={() => setMode(t)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${mode === t ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}>
              {t === 'form' ? 'Form input' : 'Natural language'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Input */}
          <div className="lg:col-span-3">
            {mode === 'form' ? (
              <form onSubmit={submitForm} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief title of the issue" required className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Description</label>
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the issue in detail. More context enables better AI analysis..." required rows={5} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Location</label>
                  <input type="text" value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="e.g. Lab 3, Building B Floor 2, ICU Ward 5" className={inputClass} />
                </div>
                <p className="text-[11px] text-zinc-600">Category and priority are automatically detected by the AI agent.</p>
                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium text-sm transition-colors">
                  {loading ? 'AI agent analyzing...' : 'Submit and analyze'}
                </button>
              </form>
            ) : (
              <form onSubmit={submitChat} className="space-y-5">
                <div className="card p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-bold">AI</div>
                    <div>
                      <p className="text-sm font-medium">{m.role}</p>
                      <p className="text-[10px] text-zinc-500">ResolveHQ Agent</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
                    Describe your issue in natural language. The agent will extract structured data, detect category and priority, and generate a full resolution plan.
                  </p>
                  <textarea value={chat} onChange={(e) => setChat(e.target.value)} placeholder="e.g. The main server in Lab 3 crashed and students can't access the exam portal..." rows={6} required className={`${inputClass} resize-none`} />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium text-sm transition-colors">
                  {loading ? 'Processing...' : 'Send to AI agent'}
                </button>
              </form>
            )}
          </div>

          {/* Analysis panel */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="card p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-indigo-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </div>
                <p className="text-sm font-medium mb-3">Analyzing request</p>
                <div className="space-y-2 text-xs text-zinc-600">
                  <p className="shimmer rounded-lg py-2 px-3">Classifying category...</p>
                  <p className="shimmer rounded-lg py-2 px-3">Predicting priority...</p>
                  <p className="shimmer rounded-lg py-2 px-3">Generating resolution...</p>
                </div>
              </div>
            )}

            {result && analysis && !loading && (
              <div className="animate-fade-up space-y-4">
                {result.alert && (
                  <div className="animate-pulse-soft bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-xs text-red-400 font-medium">{result.alert.message}</span>
                  </div>
                )}

                <div className="card p-5">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Analysis result</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border ${PRI_STYLE[analysis.predictedPriority] || ''}`}>{analysis.predictedPriority}</span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{analysis.predictedCategory}</span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">{Math.round(analysis.confidence * 100)}% confidence</span>
                  </div>
                  <p className="text-sm text-zinc-300 leading-relaxed">{analysis.summary}</p>
                </div>

                <div className="card p-5">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Reasoning</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">{analysis.reasoning}</p>
                </div>

                <div className="card p-5">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Resolution steps</p>
                  <ol className="space-y-2">
                    {analysis.resolutionSteps.map((s: string, i: number) => (
                      <li key={i} className="flex gap-2.5 text-xs">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-[9px] font-bold">{i + 1}</span>
                        <span className="text-zinc-300 pt-0.5">{s}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between text-[10px] text-zinc-600">
                    <span>Est. {analysis.estimatedTime}</span>
                    <span>Gemini 2.0 Flash</span>
                  </div>
                </div>

                <button onClick={() => router.push(`/dashboard?domain=${domain}`)} className="w-full py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-sm font-medium text-zinc-300 transition-all">
                  View in dashboard
                </button>
              </div>
            )}

            {!loading && !result && (
              <div className="card p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-600 font-bold text-sm">AI</div>
                <p className="text-sm text-zinc-500 font-medium">Insight panel</p>
                <p className="text-xs text-zinc-600 mt-1">Submit a request to see AI analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>}>
      <SubmitContent />
    </Suspense>
  );
}
