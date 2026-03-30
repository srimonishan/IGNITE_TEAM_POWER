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
        if (u.role === 'staff') { router.push('/staff'); return; }
        if (u.role === 'tenant') { router.push('/portal'); return; }
      } catch {}
    }
  }, [router]);

  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;

  return (
    <div className="min-h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/[0.07] rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/[0.05] rounded-full blur-[100px] pointer-events-none" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#09090b]/70 backdrop-blur-2xl border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">R</div>
            <span className="text-lg font-bold tracking-tight">ResolveHQ</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] text-zinc-500">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#roles" className="hover:text-white transition">Roles</a>
            <a href="#ai" className="hover:text-white transition">AI Engine</a>
            <a href="#arch" className="hover:text-white transition">Architecture</a>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/auth')} className="text-[13px] px-4 py-2 rounded-lg text-zinc-400 hover:text-white transition">Sign In</button>
            <button onClick={() => router.push('/auth?mode=signup')} className="text-[13px] px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium transition shadow-lg shadow-indigo-500/20">Get Started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-36 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[13px] text-zinc-400 bg-white/[0.03] border border-white/[0.06] mb-8 animate-fade-up">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
            Powered by Google Gemini 2.0 AI
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
            AI-Powered Apartment
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient">Service Management</span>
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '200ms' }}>
            Tenants report. AI classifies and prioritizes. Staff resolves. Property managers oversee everything from a real-time Kanban dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
            <button onClick={() => router.push('/auth?mode=signup')} className="group w-full sm:w-auto px-8 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-base transition shadow-xl shadow-indigo-500/25">
              Start Managing
              <svg className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <button onClick={() => router.push('/auth')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/[0.04] border border-white/[0.08] font-semibold text-base hover:bg-white/[0.06] transition">
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Live Dashboard Preview */}
      <section className="pb-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl overflow-hidden bg-[#0c0c10] border border-white/[0.06] animate-glow" style={{ boxShadow: '0 32px 64px -16px rgba(0,0,0,0.6)' }}>
            <div className="h-11 flex items-center gap-2 px-5 bg-white/[0.02] border-b border-white/[0.04]">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" /><div className="w-3 h-3 rounded-full bg-[#febc2e]" /><div className="w-3 h-3 rounded-full bg-[#28c840]" />
              <span className="ml-4 text-[11px] text-zinc-600 font-medium">Admin Dashboard — ResolveHQ Apartments</span>
              <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-500"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live</div>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-5 gap-3 mb-4">
                {[{ l: 'Total', v: 59, c: 'text-white' }, { l: 'New', v: 8, c: 'text-blue-400' }, { l: 'Assigned', v: 12, c: 'text-violet-400' }, { l: 'In Progress', v: 5, c: 'text-amber-400' }, { l: 'Completed', v: 34, c: 'text-emerald-400' }].map((s) => (
                  <div key={s.l} className="rounded-xl p-3.5 bg-white/[0.02] border border-white/[0.04]">
                    <div className="text-[10px] text-zinc-600 uppercase tracking-wider font-medium">{s.l}</div>
                    <div className={`text-xl font-bold mt-0.5 ${s.c}`}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { t: 'Elevator stuck B3', p: 'CRITICAL', pc: 'bg-red-500/10 text-red-400', cat: 'ELEVATOR', u: 'Unit B-302' },
                  { t: 'Kitchen faucet leak', p: 'HIGH', pc: 'bg-orange-500/10 text-orange-400', cat: 'PLUMBING', u: 'Unit A-201' },
                  { t: 'AC not cooling', p: 'MEDIUM', pc: 'bg-yellow-500/10 text-yellow-400', cat: 'HVAC', u: 'Unit C-105' },
                  { t: 'Light bulb replace', p: 'LOW', pc: 'bg-emerald-500/10 text-emerald-400', cat: 'ELECTRICAL', u: 'Unit D-408' },
                ].map((r) => (
                  <div key={r.t} className="rounded-xl p-3.5 bg-white/[0.015] border border-white/[0.04]">
                    <div className="flex gap-1.5 mb-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${r.pc}`}>{r.p}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] text-indigo-400 bg-indigo-500/10">{r.cat}</span>
                    </div>
                    <p className="text-xs font-medium text-zinc-200 mb-1">{r.t}</p>
                    <p className="text-[10px] text-zinc-600">{r.u} &middot; AI analyzed</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Roles */}
      <section id="roles" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[13px] text-indigo-400 font-medium tracking-wide uppercase mb-3">Role-Based Access</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Three Roles, One Platform</h2>
            <p className="text-zinc-500 max-w-xl mx-auto">Every user gets a tailored experience designed for their specific responsibilities</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger">
            {[
              { role: 'Admin', icon: 'A', color: 'from-indigo-500 to-purple-600', shadow: 'shadow-indigo-500/10', features: ['Kanban dashboard with lifecycle management', 'Assign requests to specific staff members', 'Add/manage tenants and staff accounts', 'AI Admin Chat for operational insights', 'PDF report export with AI analysis', 'Real-time critical alerts and SLA tracking'] },
              { role: 'Tenant', icon: 'T', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/10', features: ['Submit requests via form or AI chat', 'Natural language issue reporting', 'Track request status in real-time', 'View AI-generated resolution plans', 'Automatic priority and category detection', 'Instant acknowledgement with ETA'] },
              { role: 'Staff', icon: 'S', color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/10', features: ['Personal Kanban board of assignments', 'AI-generated resolution steps per request', 'Update status: Assigned > In Progress > Done', 'View tenant details and location info', 'Priority-based work ordering', 'Specialization-based task assignment'] },
            ].map((r) => (
              <div key={r.role} className="rounded-2xl p-7 bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center font-bold text-white text-lg mb-5 shadow-lg ${r.shadow}`}>{r.icon}</div>
                <h3 className="text-xl font-bold mb-1.5">{r.role}</h3>
                <p className="text-sm text-zinc-500 mb-5">
                  {r.role === 'Admin' ? 'Full control over operations' : r.role === 'Tenant' ? 'Report and track issues' : 'Handle assigned repairs'}
                </p>
                <ul className="space-y-2.5">
                  {r.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px] text-zinc-400">
                      <svg className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="features" className="py-20 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <p className="text-[13px] text-indigo-400 font-medium tracking-wide uppercase mb-3">Workflow</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">From Issue to Resolution</h2>
            <p className="text-zinc-500">Fully automated pipeline powered by AI at every step</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { n: '01', t: 'Tenant Reports', d: 'Tenant describes issue via structured form or natural language AI chat. Location and unit auto-filled.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
              { n: '02', t: 'AI Analyzes', d: 'Gemini 2.0 classifies into 13 apartment categories, predicts priority, generates resolution steps.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg> },
              { n: '03', t: 'Admin Assigns', d: 'Admin reviews on Kanban dashboard. Assigns to specific staff member based on specialization.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
              { n: '04', t: 'Staff Resolves', d: 'Staff follows AI resolution steps on their Kanban. Updates status. Tenant gets real-time updates.', icon: <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
            ].map((s) => (
              <div key={s.n} className="rounded-2xl p-6 bg-white/[0.02] border border-white/[0.06] relative group hover:border-indigo-500/20 transition">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4 group-hover:bg-indigo-500/20 transition">
                  {s.icon}
                </div>
                <div className="text-[11px] text-indigo-400 font-bold tracking-wider mb-2">STEP {s.n}</div>
                <h3 className="font-semibold mb-2">{s.t}</h3>
                <p className="text-[13px] text-zinc-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section id="ai" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[13px] text-indigo-400 font-medium tracking-wide uppercase mb-3">Intelligence</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">AI at Every Layer</h2>
            <p className="text-zinc-500">Three distinct AI capabilities working together</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { tag: 'AI Feature', t: 'Priority Prediction Engine', d: 'NLP-based keyword extraction and weighted scoring pipeline classifies urgency in real-time across 13 apartment-specific categories. Detects safety hazards, infrastructure failures, and routine maintenance.', badge: 'ML Pipeline' },
              { tag: 'GenAI Feature', t: 'Resolution Generator', d: 'Google Gemini 2.0 Flash generates context-aware, step-by-step maintenance resolution plans with time estimates and domain expertise for property management scenarios.', badge: 'Gemini 2.0' },
              { tag: 'Agentic AI', t: 'Autonomous Workflow', d: 'End-to-end pipeline: receives request, analyzes content, classifies category, predicts priority, triggers critical alerts, generates resolution plan, and suggests staff assignment — all without human intervention.', badge: 'Autonomous' },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl p-7 bg-white/[0.02] border border-white/[0.06] hover:border-indigo-500/20 transition group">
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

      {/* Categories Grid */}
      <section className="py-16 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent pointer-events-none" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">13 Apartment Categories</h2>
            <p className="text-zinc-500 text-sm">AI automatically classifies every request</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2.5">
            {[
              { c: 'Plumbing', i: '🔧' }, { c: 'Electrical', i: '⚡' }, { c: 'HVAC', i: '❄️' }, { c: 'Elevator', i: '🔼' },
              { c: 'Security', i: '🔒' }, { c: 'Pest', i: '🐛' }, { c: 'Janitorial', i: '🧹' }, { c: 'Noise', i: '🔊' },
              { c: 'Parking', i: '🅿️' }, { c: 'Structural', i: '🏗️' }, { c: 'Appliance', i: '🍳' }, { c: 'Common', i: '🏢' },
              { c: 'Other', i: '📋' },
            ].map((cat) => (
              <div key={cat.c} className="rounded-xl p-3 bg-white/[0.02] border border-white/[0.04] text-center hover:border-white/[0.1] transition">
                <div className="text-xl mb-1">{cat.i}</div>
                <p className="text-[11px] font-medium text-zinc-400">{cat.c}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section id="arch" className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[13px] text-indigo-400 font-medium tracking-wide uppercase mb-3">Architecture</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Built for Production</h2>
          </div>
          <div className="rounded-2xl p-8 bg-white/[0.02] border border-white/[0.06]">
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Google Gemini 2.0', 'Firebase Auth', 'Cloud Firestore', 'REST API'].map((t) => (
                <span key={t} className="px-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-zinc-300 font-medium">{t}</span>
              ))}
            </div>
            <div className="text-center text-sm text-zinc-600 font-mono">
              Tenant Request → AI Engine → Priority ML → GenAI LLM → Firestore → Admin Dashboard → Staff Assignment → Resolution
            </div>
          </div>
        </div>
      </section>

      {/* Demo Accounts */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Demo Accounts</h2>
            <p className="text-zinc-500 text-sm">Sign up with these credentials to test each role</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { role: 'Admin', email: 'admin@resolvehq.com', pass: 'Admin@123', color: 'border-indigo-500/30 bg-indigo-500/5' },
              { role: 'Tenant', email: 'tenant@resolvehq.com', pass: 'Tenant@123', color: 'border-emerald-500/30 bg-emerald-500/5' },
              { role: 'Electrician', email: 'electrician@resolvehq.com', pass: 'Staff@123', color: 'border-amber-500/30 bg-amber-500/5' },
            ].map((a) => (
              <div key={a.role} className={`rounded-xl p-5 border ${a.color}`}>
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">{a.role}</p>
                <div className="space-y-1.5 text-sm">
                  <p className="text-zinc-300"><span className="text-zinc-600 text-xs">Email:</span> {a.email}</p>
                  <p className="text-zinc-300"><span className="text-zinc-600 text-xs">Pass:</span> {a.pass}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/[0.04] to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-5">Ready to Modernize Your Property?</h2>
          <p className="text-zinc-400 text-lg mb-8">Stop managing maintenance through WhatsApp groups. Let AI bring order to chaos.</p>
          <button onClick={() => router.push('/auth?mode=signup')} className="px-10 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-lg transition shadow-xl shadow-indigo-500/25">
            Get Started Free
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-white/[0.04]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">R</div>
            <span className="font-semibold text-sm">ResolveHQ</span>
          </div>
          <p className="text-[13px] text-zinc-600">IGNITE Hackathon 2026 — Team POWER</p>
        </div>
      </footer>
    </div>
  );
}
