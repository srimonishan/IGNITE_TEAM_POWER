'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const FEATURES = [
  { icon: '01', title: 'AI Priority Prediction', desc: 'Automatically classify request urgency using NLP' },
  { icon: '02', title: 'GenAI Resolution', desc: 'Get AI-generated step-by-step resolution plans' },
  { icon: '03', title: 'Agentic Workflow', desc: 'Autonomous analyze, classify, alert, resolve pipeline' },
  { icon: '04', title: 'Real-time Dashboard', desc: 'Kanban board with live status updates' },
];

const INDUSTRIES = [
  { id: 'university', name: 'Higher Education', icon: 'U' },
  { id: 'healthcare', name: 'Healthcare', icon: 'H' },
  { id: 'corporate', name: 'Enterprise IT', icon: 'C' },
  { id: 'apartment', name: 'Property Management', icon: 'P' },
  { id: 'mall', name: 'Retail Operations', icon: 'R' },
];

export default function LandingPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rhq-theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('rhq-theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light');

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const isDark = theme === 'dark';
  const bg = isDark ? '#09090b' : '#ffffff';
  const bgAlt = isDark ? '#18181b' : '#f8f8f8';
  const border = isDark ? '#27272a' : '#e5e5e5';
  const text = isDark ? '#fafafa' : '#18181b';
  const textMuted = isDark ? '#a1a1aa' : '#71717a';

  return (
    <div style={{ background: bg, color: text }} className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl" style={{ background: isDark ? 'rgba(9,9,11,0.9)' : 'rgba(255,255,255,0.9)', borderBottom: `1px solid ${border}` }}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">R</div>
              <span className="text-xl font-bold tracking-tight">ResolveHQ</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: textMuted }}>
              <a href="#features" className="hover:opacity-80 transition">Features</a>
              <a href="#industries" className="hover:opacity-80 transition">Industries</a>
              <a href="#pricing" className="hover:opacity-80 transition">Pricing</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2.5 rounded-lg transition" style={{ background: bgAlt }}>
              {isDark ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button onClick={() => router.push('/auth')} className="text-sm px-4 py-2 rounded-lg transition" style={{ background: bgAlt }}>
              Sign In
            </button>
            <button onClick={() => router.push('/auth?mode=signup')} className="text-sm px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:opacity-90 transition">
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-8" style={{ background: bgAlt, border: `1px solid ${border}` }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Powered by Google Gemini 2.0 AI
          </div>
          
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
            AI-Powered Service
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Resolution Platform
            </span>
          </h1>
          
          <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: textMuted }}>
            Transform how your organization handles service requests. AI analyzes, prioritizes, and resolves issues automatically.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => router.push('/auth?mode=signup')} className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition shadow-lg shadow-indigo-500/25">
              Start Free Trial
            </button>
            <button onClick={() => router.push('/demo')} className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold text-lg transition" style={{ background: bgAlt, border: `1px solid ${border}` }}>
              View Live Demo
            </button>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl overflow-hidden" style={{ background: bgAlt, border: `1px solid ${border}`, boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 25px 50px -12px rgba(0,0,0,0.15)' }}>
            <div className="h-10 flex items-center gap-2 px-4" style={{ borderBottom: `1px solid ${border}` }}>
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="ml-4 text-xs" style={{ color: textMuted }}>ResolveHQ Dashboard</span>
            </div>
            <div className="p-8 text-center">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {['New', 'Assigned', 'In Progress', 'Completed'].map((s, i) => (
                  <div key={s} className="rounded-xl p-4" style={{ background: bg }}>
                    <div className="text-xs mb-2" style={{ color: textMuted }}>{s}</div>
                    <div className="text-2xl font-bold">{[12, 8, 15, 47][i]}</div>
                  </div>
                ))}
              </div>
              <p className="text-sm" style={{ color: textMuted }}>Real-time Kanban dashboard with AI-powered insights</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6" style={{ background: bgAlt }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">AI-First Features</h2>
            <p style={{ color: textMuted }}>Every feature designed to save time and improve resolution rates</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-2xl p-6 transition hover:scale-[1.02]" style={{ background: bg, border: `1px solid ${border}` }}>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm" style={{ color: textMuted }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Industries */}
      <section id="industries" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Every Industry</h2>
            <p style={{ color: textMuted }}>One platform that adapts to your specific needs</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {INDUSTRIES.map((ind) => (
              <button key={ind.id} onClick={() => router.push('/auth?mode=signup')} className="rounded-2xl p-6 text-center transition hover:scale-[1.02]" style={{ background: bgAlt, border: `1px solid ${border}` }}>
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xl mx-auto mb-3">
                  {ind.icon}
                </div>
                <div className="font-medium text-sm">{ind.name}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6" style={{ background: bgAlt }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Operations?</h2>
          <p className="mb-8" style={{ color: textMuted }}>Join thousands of organizations using AI to resolve issues faster</p>
          <button onClick={() => router.push('/auth?mode=signup')} className="px-10 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-lg hover:opacity-90 transition">
            Create Free Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6" style={{ borderTop: `1px solid ${border}` }}>
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">R</div>
            <span className="font-semibold">ResolveHQ</span>
          </div>
          <p className="text-sm" style={{ color: textMuted }}>IGNITE Hackathon 2026 - Team POWER</p>
        </div>
      </footer>
    </div>
  );
}
