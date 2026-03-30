'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

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

export default function SubmitPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<'form' | 'chat'>('form');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [loc, setLoc] = useState('');
  const [chat, setChat] = useState('');

  useEffect(() => {
    const u = localStorage.getItem('rhq-user');
    if (!u) { router.push('/auth'); return; }
    try { const parsed = JSON.parse(u); setUser(parsed); setLoc(parsed.unit || ''); } catch { router.push('/auth'); }
    setMounted(true);
  }, [router]);

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: desc, location: loc, tenantUid: user?.uid, tenantName: user?.name, tenantUnit: user?.unit }),
      });
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
      const r = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chat, tenantUid: user?.uid, tenantName: user?.name, tenantUnit: user?.unit }),
      });
      const d = await r.json();
      setResult({ request: d.request, analysis: d.analysis, alert: d.alert });
    } catch { alert('Processing failed'); }
    finally { setLoading(false); }
  };

  const analysis: Analysis | null = result?.request?.aiAnalysis || result?.analysis || null;

  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <nav className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="flex items-center justify-between px-6 lg:px-10 py-4 max-w-7xl mx-auto">
          <button onClick={() => router.push(user?.role === 'admin' ? '/dashboard' : '/portal')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm">R</div>
            <span className="text-base font-semibold tracking-tight">ResolveHQ</span>
          </button>
          <div className="flex items-center gap-2">
            {user && <span className="text-xs text-zinc-500">{user.name}{user.unit ? ` - ${user.unit}` : ''}</span>}
            <button onClick={() => router.push(user?.role === 'admin' ? '/dashboard' : '/portal')} className="text-sm px-4 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition text-zinc-300">
              {user?.role === 'admin' ? 'Dashboard' : 'My Requests'}
            </button>
            <button onClick={async () => { try { await signOut(auth); } catch {} localStorage.removeItem('rhq-user'); router.push('/'); }} className="text-xs px-3 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 transition text-zinc-400">Sign out</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-xs text-white">A</div>
          <span className="text-xs text-zinc-500 font-medium">Property Management AI Agent</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Submit a service request</h1>
        <p className="text-sm text-zinc-400 mb-8">AI will automatically classify, prioritize, and generate a resolution plan.</p>

        <div className="flex gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800 w-fit mb-8">
          {(['form', 'chat'] as const).map((t) => (
            <button key={t} onClick={() => setMode(t)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${mode === t ? 'bg-indigo-600 text-white' : 'text-zinc-400 hover:text-white'}`}>
              {t === 'form' ? 'Form Input' : 'AI Chat'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            {mode === 'form' ? (
              <form onSubmit={submitForm} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Title</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Brief title of the issue" required className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Description</label>
                  <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Describe the issue in detail..." required rows={5} className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Location / Unit</label>
                  <input type="text" value={loc} onChange={(e) => setLoc(e.target.value)} placeholder="e.g. Unit A-301, Building B Lobby" className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm" />
                </div>
                <p className="text-[11px] text-zinc-600">Category and priority are automatically detected by AI.</p>
                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium text-sm transition">
                  {loading ? 'AI agent analyzing...' : 'Submit and Analyze'}
                </button>
              </form>
            ) : (
              <form onSubmit={submitChat} className="space-y-5">
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-6">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-[10px] font-bold">AI</div>
                    <div>
                      <p className="text-sm font-medium">Property AI Agent</p>
                      <p className="text-[10px] text-zinc-500">ResolveHQ Assistant</p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-400 mb-4">Describe your issue in plain language. The AI will extract all the details and create a service request automatically.</p>
                  <textarea value={chat} onChange={(e) => setChat(e.target.value)} placeholder="e.g. The kitchen faucet in my unit A-301 has been dripping non-stop since yesterday..." rows={6} required className="w-full px-4 py-3 rounded-xl bg-[#09090b] border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm resize-none" />
                </div>
                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-medium text-sm transition">
                  {loading ? 'Processing...' : 'Send to AI Agent'}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2">
            {loading && (
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-4 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 text-indigo-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </div>
                <p className="text-sm font-medium mb-3">Analyzing request</p>
                <div className="space-y-2 text-xs text-zinc-600">
                  <p className="rounded-lg py-2 px-3 bg-zinc-800/50 animate-pulse">Classifying category...</p>
                  <p className="rounded-lg py-2 px-3 bg-zinc-800/50 animate-pulse">Predicting priority...</p>
                  <p className="rounded-lg py-2 px-3 bg-zinc-800/50 animate-pulse">Generating resolution...</p>
                </div>
              </div>
            )}
            {result && analysis && !loading && (
              <div className="space-y-4 animate-fade-up">
                {result.alert && (
                  <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 animate-pulse" />
                    <span className="text-xs text-red-400 font-medium">{result.alert.message}</span>
                  </div>
                )}
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Analysis Result</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-semibold border ${PRI_STYLE[analysis.predictedPriority] || ''}`}>{analysis.predictedPriority}</span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{analysis.predictedCategory}</span>
                    <span className="px-2.5 py-1 rounded-md text-[10px] bg-zinc-800 text-zinc-400 border border-zinc-700">{Math.round(analysis.confidence * 100)}% confidence</span>
                  </div>
                  <p className="text-sm text-zinc-300">{analysis.summary}</p>
                </div>
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-2">Reasoning</p>
                  <p className="text-xs text-zinc-400">{analysis.reasoning}</p>
                </div>
                <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-5">
                  <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-3">Resolution Steps</p>
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
                <button onClick={() => router.push(user?.role === 'admin' ? '/dashboard' : '/portal')} className="w-full py-2.5 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-sm font-medium text-zinc-300 transition">
                  View in {user?.role === 'admin' ? 'Dashboard' : 'My Requests'}
                </button>
              </div>
            )}
            {!loading && !result && (
              <div className="rounded-2xl bg-zinc-900 border border-zinc-800 p-8 text-center">
                <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-600 font-bold text-sm">AI</div>
                <p className="text-sm text-zinc-500 font-medium">AI Insight Panel</p>
                <p className="text-xs text-zinc-600 mt-1">Submit a request to see AI analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
