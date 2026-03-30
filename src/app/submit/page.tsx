'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const DOMAIN_META: Record<string, { name: string; icon: string; gradient: string; role: string }> = {
  apartment: { name: 'Residential Apartments', icon: '🏢', gradient: 'from-blue-500 to-cyan-400', role: 'AI Property Manager' },
  university: { name: 'University Campus', icon: '🎓', gradient: 'from-violet-500 to-purple-400', role: 'AI Campus IT Manager' },
  healthcare: { name: 'Healthcare', icon: '🏥', gradient: 'from-rose-500 to-orange-400', role: 'AI Triage Director' },
  mall: { name: 'Shopping Mall', icon: '🛍️', gradient: 'from-emerald-500 to-green-400', role: 'AI Mall Ops Director' },
  corporate: { name: 'Corporate IT', icon: '💼', gradient: 'from-amber-500 to-yellow-400', role: 'AI DevOps Engineer' },
};

interface AIAnalysis {
  predictedPriority: string;
  predictedCategory: string;
  confidence: number;
  summary: string;
  resolutionSteps: string[];
  estimatedTime: string;
  reasoning: string;
}

const PRIORITY_STYLES: Record<string, string> = {
  CRITICAL: 'bg-red-500/15 text-red-400 border-red-500/30',
  HIGH: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  MEDIUM: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  LOW: 'bg-green-500/15 text-green-400 border-green-500/30',
};

function SubmitContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain') || 'corporate';
  const meta = DOMAIN_META[domain] || DOMAIN_META.corporate;

  const [mode, setMode] = useState<'form' | 'chat'>('form');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [chatMessage, setChatMessage] = useState('');

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, location, domain }),
      });
      const data = await res.json();
      setResult({ request: data.request, alert: data.alert });
    } catch {
      alert('Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatMessage, domain }),
      });
      const data = await res.json();
      setResult({ request: data.request, analysis: data.analysis, alert: data.alert });
    } catch {
      alert('Failed to process message');
    } finally {
      setLoading(false);
    }
  };

  const analysis: AIAnalysis | null = result?.request?.aiAnalysis || result?.analysis || null;

  return (
    <div className="min-h-screen hero-gradient">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 lg:px-10 py-5 max-w-7xl mx-auto">
        <button onClick={() => router.push('/')} className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold shadow-lg shadow-indigo-500/25">
            S
          </div>
          <span className="text-lg font-bold tracking-tight">SmartOps AI</span>
        </button>
        <div className="flex items-center gap-2">
          <div className={`hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent font-semibold border border-white/10`}>
            <span>{meta.icon}</span>
            <span>{meta.role}</span>
          </div>
          <select
            value={domain}
            onChange={(e) => router.push(`/submit?domain=${e.target.value}`)}
            className="text-xs px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none cursor-pointer"
          >
            {Object.entries(DOMAIN_META).map(([k, v]) => (
              <option key={k} value={k} className="bg-gray-900">{v.icon} {v.name}</option>
            ))}
          </select>
          <button
            onClick={() => router.push(`/dashboard?domain=${domain}`)}
            className="text-xs px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-1">Submit a Service Request</h1>
          <p className="text-gray-400 text-sm">
            Our AI agent will automatically classify, prioritize, and generate resolution steps.
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/[0.06] w-fit mb-8">
          {(['form', 'chat'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === m ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25' : 'text-gray-400 hover:text-white'
              }`}
            >
              {m === 'form' ? '📝 Form Input' : '💬 AI Chat'}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Input (3 cols) */}
          <div className="lg:col-span-3">
            {mode === 'form' ? (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief title of the issue"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the issue in detail — the more context, the better the AI analysis..."
                    required
                    rows={5}
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Lab 3, Building B Floor 2, ICU Ward 5"
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all"
                  />
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Category & Priority auto-detected by AI &bull; Powered by Gemini 2.0
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-xl shadow-indigo-600/20 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      AI Agent Analyzing...
                    </span>
                  ) : 'Submit & Analyze with AI'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleChatSubmit} className="space-y-5">
                <div className="glass-card rounded-2xl p-6 gradient-border">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">AI</span>
                    <div>
                      <span className="text-sm font-semibold">{meta.role}</span>
                      <span className="text-[10px] text-gray-500 ml-2">SmartOps AI Agent</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Describe your issue in natural language. I&apos;ll extract the structured data, detect category and priority, and generate a full resolution plan.
                  </p>
                  <textarea
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder={`Try: "The main server in Lab 3 crashed and students can't access the exam portal. This is extremely urgent..."`}
                    rows={6}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/40 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-xl shadow-indigo-600/20 text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      AI Processing...
                    </span>
                  ) : '🤖 Send to AI Agent'}
                </button>
              </form>
            )}
          </div>

          {/* AI Analysis Panel (2 cols) */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="glass-card rounded-2xl p-8 text-center gradient-border">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-indigo-600/20 flex items-center justify-center">
                  <svg className="animate-spin h-7 w-7 text-indigo-400" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                </div>
                <h3 className="font-semibold mb-3">AI Agent Processing</h3>
                <div className="text-xs text-gray-500 space-y-2">
                  <p className="shimmer rounded-lg px-3 py-2">Analyzing request content...</p>
                  <p className="shimmer rounded-lg px-3 py-2" style={{ animationDelay: '0.3s' }}>Classifying category and priority...</p>
                  <p className="shimmer rounded-lg px-3 py-2" style={{ animationDelay: '0.6s' }}>Generating resolution steps...</p>
                </div>
              </div>
            )}

            {result && analysis && !loading && (
              <div className="fade-in space-y-4">
                {result.alert && (
                  <div className="alert-pulse bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-xs text-red-400 font-medium">{result.alert.message}</span>
                  </div>
                )}

                <div className="glass-card rounded-2xl p-5 gradient-border">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">AI Analysis Result</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${PRIORITY_STYLES[analysis.predictedPriority] || ''}`}>
                      {analysis.predictedPriority}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs font-medium bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                      {analysis.predictedCategory}
                    </span>
                    <span className="px-3 py-1 rounded-lg text-xs bg-white/5 text-gray-400 border border-white/10">
                      {Math.round(analysis.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">{analysis.summary}</p>
                </div>

                <div className="glass-card rounded-2xl p-5">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">AI Reasoning</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{analysis.reasoning}</p>
                </div>

                <div className="glass-card rounded-2xl p-5">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Resolution Steps</h3>
                  <ol className="space-y-2.5">
                    {analysis.resolutionSteps.map((step: string, i: number) => (
                      <li key={i} className="flex gap-3 text-xs">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                        <span className="text-gray-300 pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-600">
                    <span>Est: {analysis.estimatedTime}</span>
                    <span>Gemini 2.0 Flash</span>
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/dashboard?domain=${domain}`)}
                  className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-medium transition-all"
                >
                  View in Dashboard →
                </button>
              </div>
            )}

            {!loading && !result && (
              <div className="glass-card rounded-2xl p-8 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center text-3xl">🧠</div>
                <p className="text-sm text-gray-500 mb-2">AI Insight Panel</p>
                <p className="text-xs text-gray-600">Submit a request to see the analysis</p>
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    }>
      <SubmitContent />
    </Suspense>
  );
}
