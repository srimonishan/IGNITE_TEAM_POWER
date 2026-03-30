'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

function ThemeToggle({ theme, toggle }: { theme: string; toggle: () => void }) {
  return (
    <button onClick={toggle} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition" aria-label="Toggle theme">
      {theme === 'dark' ? (
        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      ) : (
        <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
      )}
    </button>
  );
}

function BuildingSVG() {
  return (
    <svg viewBox="0 0 400 300" className="w-full max-w-md mx-auto opacity-80 animate-fade-up" style={{ animationDelay: '400ms' }}>
      {/* Building 1 */}
      <rect x="40" y="80" width="80" height="220" rx="4" fill="url(#b1)" className="animate-building" style={{ animationDelay: '200ms' }} />
      {[0,1,2,3,4,5,6].map(r => [0,1].map(c => (
        <rect key={`w1-${r}-${c}`} x={55 + c * 35} y={95 + r * 28} width="20" height="16" rx="2" fill="rgba(99,102,241,0.3)" />
      )))}
      {/* Building 2 (tall) */}
      <rect x="140" y="40" width="100" height="260" rx="4" fill="url(#b2)" className="animate-building" style={{ animationDelay: '400ms' }} />
      {[0,1,2,3,4,5,6,7,8].map(r => [0,1,2].map(c => (
        <rect key={`w2-${r}-${c}`} x={152 + c * 30} y={55 + r * 27} width="18" height="14" rx="2" fill={r < 2 ? 'rgba(251,191,36,0.4)' : 'rgba(99,102,241,0.25)'} />
      )))}
      {/* Building 3 */}
      <rect x="260" y="100" width="90" height="200" rx="4" fill="url(#b3)" className="animate-building" style={{ animationDelay: '600ms' }} />
      {[0,1,2,3,4,5].map(r => [0,1].map(c => (
        <rect key={`w3-${r}-${c}`} x={275 + c * 35} y={115 + r * 28} width="22" height="16" rx="2" fill="rgba(16,185,129,0.3)" />
      )))}
      {/* Ground */}
      <rect x="0" y="296" width="400" height="4" rx="2" fill="rgba(99,102,241,0.2)" />
      {/* Trees */}
      <circle cx="30" cy="275" r="12" fill="rgba(16,185,129,0.2)" />
      <rect x="28" y="280" width="4" height="16" rx="1" fill="rgba(16,185,129,0.15)" />
      <circle cx="370" cy="270" r="15" fill="rgba(16,185,129,0.2)" />
      <rect x="368" y="278" width="4" height="18" rx="1" fill="rgba(16,185,129,0.15)" />
      <defs>
        <linearGradient id="b1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4338ca" stopOpacity="0.3" /><stop offset="1" stopColor="#4338ca" stopOpacity="0.1" /></linearGradient>
        <linearGradient id="b2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6366f1" stopOpacity="0.35" /><stop offset="1" stopColor="#6366f1" stopOpacity="0.1" /></linearGradient>
        <linearGradient id="b3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8b5cf6" stopOpacity="0.3" /><stop offset="1" stopColor="#8b5cf6" stopOpacity="0.1" /></linearGradient>
      </defs>
    </svg>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const saved = localStorage.getItem('rhq-theme') || 'dark';
    setTheme(saved);
    document.documentElement.setAttribute('data-theme', saved);
    setMounted(true);
    const user = localStorage.getItem('rhq-user');
    if (user) {
      try {
        const u = JSON.parse(user);
        if (u.role === 'admin') { router.push('/dashboard'); return; }
        if (u.role === 'staff') { router.push('/staff'); return; }
        if (u.role === 'tenant') { router.push('/portal'); return; }
      } catch {}
    }
  }, [router]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('rhq-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/[0.07] rounded-full blur-[120px] pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">R</div>
            <span className="text-lg font-bold tracking-tight">ResolveHQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-zinc-500">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how" className="hover:text-white transition">How It Works</a>
            <a href="#ai" className="hover:text-white transition">AI Engine</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle theme={theme} toggle={toggleTheme} />
            <button onClick={() => router.push('/auth')} className="text-[13px] px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition">Sign In</button>
            <button onClick={() => router.push('/auth?mode=signup')} className="text-[13px] px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium transition shadow-lg shadow-indigo-500/20">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] text-zinc-400 bg-white/[0.03] border border-white/[0.06] mb-8 animate-fade-up">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
            AI-Powered Smart Service Platform
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
            Smart Apartment
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">Service Management</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
            Your residents report maintenance issues. AI instantly classifies, prioritizes, and generates resolution plans. Your team resolves faster than ever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <button onClick={() => router.push('/auth?mode=signup')} className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition shadow-xl shadow-indigo-500/25">
              Start Managing
              <svg className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <button onClick={() => router.push('/auth')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] font-semibold text-base hover:bg-white/[0.06] transition">Sign In</button>
          </div>
          <BuildingSVG />
        </div>
      </section>

      {/* Live Dashboard Preview */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl overflow-hidden bg-[#0c0c10] border border-white/[0.06] animate-glow" style={{ boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)' }}>
            <div className="h-11 flex items-center gap-2 px-5 bg-white/[0.02] border-b border-white/[0.04]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" /><div className="w-3 h-3 rounded-full bg-[#febc2e]" /><div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-4 text-[11px] text-zinc-600 font-medium">Admin Dashboard</span>
              <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[{ l: 'New', v: 8, c: 'text-blue-400' }, { l: 'Assigned', v: 12, c: 'text-violet-400' }, { l: 'In Progress', v: 5, c: 'text-amber-400' }, { l: 'Completed', v: 34, c: 'text-emerald-400' }].map((s) => (
                  <div key={s.l} className="rounded-xl p-3.5 bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{s.l}</div>
                    <div className={`text-2xl font-bold mt-0.5 ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { t: 'Elevator stuck - B3', p: 'CRITICAL', pc: 'bg-red-500/10 text-red-400', cat: 'ELEVATOR' },
                  { t: 'Kitchen faucet leak', p: 'HIGH', pc: 'bg-orange-500/10 text-orange-400', cat: 'PLUMBING' },
                  { t: 'AC not cooling', p: 'MEDIUM', pc: 'bg-yellow-500/10 text-yellow-400', cat: 'HVAC' },
                  { t: 'Light bulb replace', p: 'LOW', pc: 'bg-emerald-500/10 text-emerald-400', cat: 'ELECTRICAL' },
                ].map((r) => (
                  <div key={r.t} className="rounded-xl p-3.5 bg-white/[0.015] border border-white/[0.04]">
                    <div className="flex gap-1.5 mb-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${r.pc}`}>{r.p}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] text-indigo-400 bg-indigo-500/10">{r.cat}</span>
                    </div>
                    <p className="text-xs font-medium text-zinc-200">{r.t}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">AI analyzed</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <p className="text-[13px] text-indigo-400 font-medium tracking-wide uppercase mb-3">Workflow</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">From Issue to Resolution</h2>
            <p className="text-zinc-500">Fully automated pipeline powered by AI</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 stagger">
            {[
              { n: '01', t: 'Report', d: 'Resident describes the issue via form or natural language AI chat', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
              { n: '02', t: 'AI Analyzes', d: 'AI classifies into 13 categories, predicts priority, generates resolution steps', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
              { n: '03', t: 'Assign', d: 'Admin assigns to the right maintenance staff on the Kanban board', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
              { n: '04', t: 'Resolve', d: 'Staff follows AI resolution steps. Resident gets real-time status updates.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.06] group hover:border-indigo-500/20 transition">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">{s.icon}</div>
                <div className="text-[11px] text-indigo-400 font-bold tracking-wider mb-2">STEP {s.n}</div>
                <h3 className="font-semibold mb-2">{s.t}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[13px] text-indigo-400 font-medium tracking-wide uppercase mb-3">Features</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything You Need</h2>
            <p className="text-zinc-500">Comprehensive apartment maintenance management</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {[
              { t: 'Kanban Dashboard', d: 'Real-time board tracking requests through NEW, ASSIGNED, IN PROGRESS, and COMPLETED stages.', i: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" /></svg> },
              { t: 'AI Priority Detection', d: 'NLP analyzes descriptions to classify urgency. Safety hazards auto-escalate to CRITICAL.', i: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
              { t: 'GenAI Resolution Plans', d: 'AI generates step-by-step maintenance instructions with time estimates for every request.', i: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
              { t: 'Critical Alerts', d: 'Instant alerts for CRITICAL requests like gas leaks, floods, or elevator traps. SLA breach warnings.', i: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg> },
              { t: 'AI Chat Assistant', d: 'Residents describe issues in plain language. AI extracts title, category, priority, and location.', i: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
              { t: 'Staff Assignment', d: 'Assign requests to electricians, plumbers, or HVAC techs. Staff see their own Kanban board.', i: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/20 transition">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">{f.i}</div>
                <h3 className="font-semibold mb-2">{f.t}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <p className="text-[13px] text-indigo-400 font-medium tracking-wide uppercase mb-3">Intelligence</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">AI at Every Layer</h2>
            <p className="text-zinc-500">Three distinct AI capabilities working together</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { tag: 'AI Feature', t: 'Priority Prediction Engine', d: 'NLP keyword extraction and weighted scoring classifies urgency across 13 apartment-specific categories in real-time.', badge: 'ML Pipeline' },
              { tag: 'GenAI Feature', t: 'Resolution Generator', d: 'Large language model generates context-aware, step-by-step maintenance resolution plans with time estimates.', badge: 'LLM' },
              { tag: 'Agentic AI', t: 'Autonomous Workflow', d: 'End-to-end: analyze, classify category, predict priority, trigger alerts, generate resolution, suggest assignment.', badge: 'Autonomous' },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl p-7 bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/20 transition">
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{f.tag}</span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">{f.badge}</span>
                </div>
                <h3 className="text-lg font-bold mb-3">{f.t}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold mb-2">13 Maintenance Categories</h2>
            <p className="text-zinc-500 text-sm">AI automatically classifies every request</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {['Plumbing', 'Electrical', 'HVAC', 'Elevator', 'Security', 'Pest Control', 'Janitorial', 'Noise', 'Parking', 'Structural', 'Appliance', 'Common Area', 'Other'].map((c) => (
              <div key={c} className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.04] text-center hover:border-white/[0.1] transition">
                <p className="text-[11px] font-medium text-zinc-400">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/[0.04] to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-5">Ready to Get Started?</h2>
          <p className="text-zinc-400 text-lg mb-8">Modern maintenance management for modern apartments.</p>
          <button onClick={() => router.push('/auth?mode=signup')} className="px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition shadow-xl shadow-indigo-500/25">
            Create Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">R</div>
            <span className="font-semibold text-sm">ResolveHQ</span>
            <span className="text-zinc-600 text-sm ml-2">Apartment Service Management</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
