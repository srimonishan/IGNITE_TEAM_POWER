'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const DOMAINS = [
  { id: 'apartment', name: 'Residential & Property', letter: 'R', color: 'bg-blue-500', desc: 'AI-powered property management for tenant requests, maintenance, and facility operations across residential complexes.', role: 'Property Manager Agent' },
  { id: 'university', name: 'University & Campus', letter: 'U', color: 'bg-violet-500', desc: 'Campus IT and facilities management covering lab systems, exam platforms, and academic infrastructure.', role: 'Campus IT Agent' },
  { id: 'healthcare', name: 'Healthcare & Clinical', letter: 'H', color: 'bg-rose-500', desc: 'Critical medical equipment monitoring, biohazard response, and hospital facility management.', role: 'Triage Director Agent' },
  { id: 'mall', name: 'Retail & Commercial', letter: 'M', color: 'bg-emerald-500', desc: 'Retail facility management covering safety compliance, tenant operations, and customer experience.', role: 'Operations Director Agent' },
  { id: 'corporate', name: 'Corporate & Enterprise IT', letter: 'C', color: 'bg-amber-500', desc: 'Enterprise IT support covering access control, cloud infrastructure, and security incidents.', role: 'DevOps Engineer Agent' },
];

const CAPABILITIES = [
  { title: 'Priority Prediction Engine', desc: 'NLP-based feature extraction and weighted scoring pipeline classifies urgency in real-time across domain-specific taxonomies.', tag: 'AI Feature' },
  { title: 'Resolution Generator', desc: 'Large language model generates context-aware, step-by-step resolution plans with domain expertise and time estimates.', tag: 'Generative AI' },
  { title: 'Agentic Workflow', desc: 'Autonomous pipeline analyzes, categorizes, prioritizes, triggers alerts, and suggests resolution without human intervention.', tag: 'Agentic AI' },
  { title: 'Dynamic Domain Intelligence', desc: 'Single platform serves five industries. Dynamic system prompts reshape the AI into a domain-specific expert on selection.', tag: 'Architecture' },
];

const STEPS = [
  { n: '01', title: 'Submit', desc: 'Users describe issues through structured forms or natural language chat input.' },
  { n: '02', title: 'Analyze', desc: 'AI agent classifies category, predicts priority, and evaluates urgency in real-time.' },
  { n: '03', title: 'Resolve', desc: 'Generative AI produces step-by-step resolution plans with domain-specific context.' },
  { n: '04', title: 'Track', desc: 'Kanban dashboard manages lifecycle with real-time status updates and assignments.' },
];

function ArrowIcon() {
  return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>;
}

export default function LandingPage() {
  const router = useRouter();
  const [visible, setVisible] = useState<Set<string>>(new Set());
  const refs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) setVisible((p) => { const n = new Set(p); n.add(e.target.id); return n; });
      }),
      { threshold: 0.1 }
    );
    Object.values(refs.current).forEach((el) => { if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const reg = (id: string) => (el: HTMLElement | null) => { refs.current[id] = el; };
  const vis = (id: string) => visible.has(id);

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="flex items-center justify-between px-6 lg:px-10 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm tracking-tight">R</div>
              <span className="text-base font-semibold tracking-tight">ResolveHQ</span>
            </div>
            <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
              <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
              <a href="#domains" className="hover:text-white transition-colors">Industries</a>
              <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard?domain=corporate')} className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2">
              Dashboard
            </button>
            <button onClick={() => router.push('/submit?domain=corporate')} className="text-sm px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors font-medium">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative px-6 pt-24 lg:pt-32 pb-20 max-w-4xl mx-auto text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/[0.07] rounded-full blur-[100px]" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-800 text-xs text-zinc-400 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
          Powered by Generative AI and Agentic Workflow
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08] mb-6">
          The intelligent service<br />
          platform for the<br />
          <span className="text-gradient">AI agent era</span>
        </h1>

        <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          ResolveHQ is the only service platform with a natively integrated AI agent, meaning
          every request improves the next one, enabling perfect resolution experiences that
          were never possible before.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <button onClick={() => document.getElementById('domains')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors font-medium text-sm">
            Select your industry
          </button>
          <button onClick={() => router.push('/submit?domain=university')} className="px-6 py-3 rounded-lg border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900 transition-all font-medium text-sm text-zinc-300">
            Try live demo
          </button>
        </div>

        {/* Product preview placeholder */}
        <div className="max-w-3xl mx-auto">
          <div className="img-placeholder rounded-2xl aspect-[16/9] flex items-center justify-center">
            <div className="text-center">
              <p className="text-zinc-600 text-sm font-medium">Product Dashboard Preview</p>
              <p className="text-zinc-700 text-xs mt-1">Add your screenshot here</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted */}
      <section className="border-y border-zinc-800/50 py-10">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-6">Designed for operations across every industry</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-zinc-600 text-sm font-medium">
            {['Property Management', 'Higher Education', 'Healthcare Systems', 'Retail Operations', 'Enterprise IT'].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works" ref={reg('how-it-works')}
        className={`py-24 px-6 max-w-6xl mx-auto transition-all duration-700 ${vis('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="text-center mb-16">
          <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-3">How it works</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">From request to resolution in seconds</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="card p-6 h-full">
                <span className="text-xs font-mono text-indigo-400 font-bold">{s.n}</span>
                <h3 className="text-lg font-semibold mt-3 mb-2">{s.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{s.desc}</p>
              </div>
              {i < 3 && <div className="hidden lg:block absolute top-1/2 -right-3 text-zinc-700">&#8594;</div>}
            </div>
          ))}
        </div>
      </section>

      {/* Domains */}
      <section
        id="domains" ref={reg('domains')}
        className={`py-24 px-6 max-w-7xl mx-auto transition-all duration-700 ${vis('domains') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="text-center mb-16">
          <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-3">Industries</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">One platform, every industry</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            Select your domain and the AI instantly adapts its categorization, priority logic, and resolution expertise to your industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {DOMAINS.map((d) => (
            <button
              key={d.id}
              onClick={() => router.push(`/dashboard?domain=${d.id}`)}
              className="card card-interactive p-7 text-left group animate-fade-up"
            >
              <div className="flex items-start justify-between mb-5">
                <div className={`w-10 h-10 rounded-xl ${d.color} flex items-center justify-center font-bold text-sm text-white`}>
                  {d.letter}
                </div>
                <div className="text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all">
                  <ArrowIcon />
                </div>
              </div>
              <h3 className="text-base font-semibold mb-1">{d.name}</h3>
              <p className="text-xs text-indigo-400 font-medium mb-3">{d.role}</p>
              <p className="text-sm text-zinc-400 leading-relaxed">{d.desc}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Capabilities */}
      <section
        id="capabilities" ref={reg('capabilities')}
        className={`py-24 px-6 max-w-6xl mx-auto transition-all duration-700 ${vis('capabilities') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="text-center mb-16">
          <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-3">AI Capabilities</p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Real AI. Real resolution.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CAPABILITIES.map((c) => (
            <div key={c.title} className="card p-7">
              <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20 mb-4">
                {c.tag}
              </span>
              <h3 className="text-lg font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-zinc-400 leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>

        {/* Product preview */}
        <div className="mt-12">
          <div className="img-placeholder rounded-2xl aspect-[16/7] flex items-center justify-center">
            <div className="text-center">
              <p className="text-zinc-600 text-sm font-medium">AI Analysis Interface Preview</p>
              <p className="text-zinc-700 text-xs mt-1">Add your screenshot here</p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section
        id="architecture" ref={reg('architecture')}
        className={`py-24 px-6 max-w-4xl mx-auto transition-all duration-700 ${vis('architecture') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      >
        <div className="card p-10">
          <div className="text-center mb-10">
            <p className="text-xs text-indigo-400 uppercase tracking-widest font-semibold mb-3">Architecture</p>
            <h2 className="text-2xl font-bold tracking-tight">Built for scale</h2>
            <p className="text-sm text-zinc-400 mt-2">Monolith with clean separation — designed for production microservices migration</p>
          </div>

          <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
            {['Client Request', 'AI Engine', 'Priority ML', 'GenAI LLM', 'Firestore', 'Dashboard'].map((s, i, a) => (
              <div key={s} className="flex items-center gap-2">
                <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-800 border border-zinc-700 text-zinc-300">{s}</span>
                {i < a.length - 1 && <span className="text-zinc-700 text-xs">&#8594;</span>}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            {['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Google Gemini 2.0', 'Firebase', 'REST API'].map((t) => (
              <span key={t} className="px-3 py-1 rounded-full text-xs bg-zinc-800/50 border border-zinc-800 text-zinc-500">{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to resolve intelligently?</h2>
        <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
          Select your industry and experience AI-powered service resolution in action.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button onClick={() => router.push('/dashboard?domain=university')} className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium text-sm transition-colors">
            Launch dashboard
          </button>
          <button onClick={() => router.push('/submit?domain=healthcare')} className="px-6 py-3 rounded-lg border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-900 font-medium text-sm text-zinc-300 transition-all">
            Try AI analysis
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-[10px]">R</div>
            <span className="text-sm font-semibold">ResolveHQ</span>
          </div>
          <p className="text-xs text-zinc-600">IGNITE Hackathon 2026 — Team POWER</p>
          <div className="flex gap-6 text-xs text-zinc-500">
            <button onClick={() => router.push('/dashboard?domain=corporate')} className="hover:text-white transition-colors">Dashboard</button>
            <button onClick={() => router.push('/submit?domain=corporate')} className="hover:text-white transition-colors">Submit Request</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
