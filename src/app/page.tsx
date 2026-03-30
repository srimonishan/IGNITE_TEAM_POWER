'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem('rhq-user');
    if (user) {
      try {
        const u = JSON.parse(user);
        if (u.role === 'admin') { router.push('/dashboard'); return; }
        if (u.role === 'tenant') { router.push('/portal'); return; }
      } catch {}
    }
  }, [router]);

  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white">R</div>
            <span className="text-xl font-bold tracking-tight">ResolveHQ</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#how" className="hover:text-white transition">How It Works</a>
            <a href="#ai" className="hover:text-white transition">AI</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/auth')} className="text-sm px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition">Sign In</button>
            <button onClick={() => router.push('/auth?mode=signup')} className="text-sm px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium transition">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-zinc-900 border border-zinc-800 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            AI-Powered Apartment Service Platform
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
            Smart Maintenance
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              for Modern Living
            </span>
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Tenants report issues. AI instantly classifies, prioritizes, and generates resolution plans. Property managers resolve faster than ever.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => router.push('/auth?mode=signup')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition shadow-lg shadow-indigo-500/25">
              Start Managing
            </button>
            <button onClick={() => router.push('/auth')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 border border-zinc-800 font-semibold text-lg hover:border-zinc-700 transition">
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl overflow-hidden bg-zinc-900/50 border border-zinc-800" style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div className="h-10 flex items-center gap-2 px-4 border-b border-zinc-800">
              <div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-xs text-zinc-500">Admin Dashboard - ResolveHQ Apartments</span>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[{ l: 'New', v: 8, c: 'text-blue-400' }, { l: 'Assigned', v: 5, c: 'text-violet-400' }, { l: 'In Progress', v: 12, c: 'text-amber-400' }, { l: 'Completed', v: 34, c: 'text-emerald-400' }].map((s) => (
                  <div key={s.l} className="rounded-xl p-4 bg-zinc-800/50 border border-zinc-700/50">
                    <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">{s.l}</div>
                    <div className={`text-2xl font-bold ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {['Elevator stuck - B3', 'Water leak - A201', 'No AC - C105', 'Parking dispute'].map((t, i) => (
                  <div key={t} className="rounded-lg p-3 bg-zinc-800/30 border border-zinc-700/30">
                    <div className="flex gap-1.5 mb-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${['bg-red-500/10 text-red-400', 'bg-orange-500/10 text-orange-400', 'bg-yellow-500/10 text-yellow-400', 'bg-emerald-500/10 text-emerald-400'][i]}`}>
                        {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'][i]}
                      </span>
                    </div>
                    <p className="text-xs font-medium text-zinc-300">{t}</p>
                    <p className="text-[10px] text-zinc-600 mt-1">AI analyzed</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Roles */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Two Experiences, One Platform</h2>
            <p className="text-zinc-400">Role-based access tailored for property managers and residents</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-8 bg-zinc-900/50 border border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold mb-5">A</div>
              <h3 className="text-xl font-bold mb-2">Admin / Property Manager</h3>
              <p className="text-sm text-zinc-400 mb-5">Full control over requests, tenants, and operations</p>
              <ul className="space-y-2.5">
                {['Kanban dashboard with lifecycle management', 'AI-powered priority and category analysis', 'User management - add/remove tenants and admins', 'AI Admin Chat for operational insights', 'PDF report export', 'Real-time critical alerts'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl p-8 bg-zinc-900/50 border border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold mb-5">T</div>
              <h3 className="text-xl font-bold mb-2">Tenant / Resident</h3>
              <p className="text-sm text-zinc-400 mb-5">Simple, intuitive interface for reporting issues</p>
              <ul className="space-y-2.5">
                {['Submit requests via structured form', 'Natural language AI chat to report issues', 'Track request status in real-time', 'AI-generated resolution updates', 'View assigned priorities and categories', 'Instant acknowledgement and ETA'].map((f) => (
                  <li key={f} className="flex items-center gap-2.5 text-sm text-zinc-300">
                    <svg className="w-4 h-4 text-emerald-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-16 px-6 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">How It Works</h2>
            <p className="text-zinc-400">From issue report to resolution in minutes</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { n: '01', t: 'Tenant Reports', d: 'Tenant describes the issue via form or natural language chat input' },
              { n: '02', t: 'AI Analyzes', d: 'Gemini AI classifies category, predicts priority, and generates resolution steps' },
              { n: '03', t: 'Admin Manages', d: 'Property manager sees requests on Kanban board with AI insights' },
              { n: '04', t: 'Issue Resolved', d: 'Maintenance team follows AI-generated steps. Tenant gets updates.' },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl p-6 bg-[#09090b] border border-zinc-800">
                <div className="w-10 h-10 rounded-lg bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold text-sm mb-4">{s.n}</div>
                <h3 className="font-semibold mb-2">{s.t}</h3>
                <p className="text-sm text-zinc-500">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section id="ai" className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">AI-First Architecture</h2>
            <p className="text-zinc-400">Every request is enhanced by Google Gemini 2.0</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: 'ML', t: 'Priority Prediction Engine', d: 'NLP keyword extraction and weighted scoring pipeline classifies urgency across apartment-specific taxonomies in real-time.' },
              { icon: 'AI', t: 'GenAI Resolution Generator', d: 'Large language model generates context-aware, step-by-step maintenance resolution plans with time estimates.' },
              { icon: 'AG', t: 'Agentic Workflow', d: 'Autonomous pipeline: analyze request, classify category, predict priority, trigger alerts, and suggest resolution without human input.' },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl p-6 bg-zinc-900/50 border border-zinc-800">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm mb-4">{f.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{f.t}</h3>
                <p className="text-sm text-zinc-400">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="features" className="py-16 px-6 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Apartment-Specific Categories</h2>
            <p className="text-zinc-400">AI automatically classifies requests into these maintenance categories</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { c: 'Plumbing', i: 'P' }, { c: 'Electrical', i: 'E' }, { c: 'HVAC', i: 'H' },
              { c: 'Elevator', i: 'EL' }, { c: 'Security', i: 'S' }, { c: 'Pest Control', i: 'PC' },
              { c: 'Janitorial', i: 'J' }, { c: 'Noise', i: 'N' }, { c: 'Parking', i: 'PK' },
              { c: 'Structural', i: 'ST' }, { c: 'Appliance', i: 'AP' }, { c: 'Common Area', i: 'CA' },
            ].map((cat) => (
              <div key={cat.c} className="rounded-xl p-4 bg-[#09090b] border border-zinc-800 text-center">
                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 mx-auto mb-2">{cat.i}</div>
                <p className="text-xs font-medium">{cat.c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Built With</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Google Gemini 2.0', 'Firebase Auth', 'Firestore', 'REST API'].map((t) => (
              <span key={t} className="px-4 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-300">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-zinc-900/30">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Modernize Your Property?</h2>
          <p className="text-zinc-400 mb-8">Stop using WhatsApp groups and spreadsheets. Let AI handle the chaos.</p>
          <button onClick={() => router.push('/auth?mode=signup')} className="px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-zinc-800">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">R</div>
            <span className="font-semibold">ResolveHQ</span>
          </div>
          <p className="text-sm text-zinc-600">IGNITE Hackathon 2026 - Team POWER</p>
        </div>
      </footer>
    </div>
  );
}
