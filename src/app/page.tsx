'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const DOMAINS = [
  {
    id: 'apartment',
    name: 'Residential & Luxury Apartments',
    role: 'AI Property Manager',
    description: 'Intelligent tenant request handling, maintenance scheduling, and facility management for residential complexes.',
    icon: '🏢',
    gradient: 'from-blue-500 to-cyan-400',
    glow: 'shadow-blue-500/20',
    border: 'hover:border-blue-500/30',
    example: '"The elevator in Building B is making a grinding noise and stopped on Floor 3"',
    tags: ['Plumbing', 'HVAC', 'Elevator', 'Security'],
  },
  {
    id: 'university',
    name: 'University Campus',
    role: 'AI Campus IT & Facilities Manager',
    description: 'Academic infrastructure management covering IT systems, lab equipment, and campus-wide facility operations.',
    icon: '🎓',
    gradient: 'from-violet-500 to-purple-400',
    glow: 'shadow-violet-500/20',
    border: 'hover:border-violet-500/30',
    example: '"Lab Wi-Fi is down and final exams are in 30 minutes"',
    tags: ['Network', 'Lab Equipment', 'Exam Systems', 'AV'],
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Public Health',
    role: 'AI Triage Director',
    description: 'Critical medical equipment monitoring, biohazard response, and hospital facility management with patient safety focus.',
    icon: '🏥',
    gradient: 'from-rose-500 to-orange-400',
    glow: 'shadow-rose-500/20',
    border: 'hover:border-rose-500/30',
    example: '"Ventilator alarm in ICU Ward 3 — patient on life support"',
    tags: ['Biohazard', 'Med Equipment', 'Pharmacy', 'Emergency'],
  },
  {
    id: 'mall',
    name: 'Shopping Complex & Mall',
    role: 'AI Mall Operations Director',
    description: 'Retail facility management covering safety compliance, tenant operations, and customer experience optimization.',
    icon: '🛍️',
    gradient: 'from-emerald-500 to-green-400',
    glow: 'shadow-emerald-500/20',
    border: 'hover:border-emerald-500/30',
    example: '"Massive water leak in the food court near the main escalator"',
    tags: ['Fire Safety', 'Janitorial', 'Escalator', 'Parking'],
  },
  {
    id: 'corporate',
    name: 'Corporate IT Helpdesk',
    role: 'AI Senior DevOps Engineer',
    description: 'Enterprise IT support covering access control, cloud infrastructure, security incidents, and system automation.',
    icon: '💼',
    gradient: 'from-amber-500 to-yellow-400',
    glow: 'shadow-amber-500/20',
    border: 'hover:border-amber-500/30',
    example: '"CEO locked out of cloud infrastructure — board meeting in 10 minutes"',
    tags: ['Access Control', 'Cloud', 'Security', 'VPN'],
  },
];

const STEPS = [
  { num: '01', title: 'Submit', desc: 'User describes their issue via form or natural language chat', icon: '📝' },
  { num: '02', title: 'AI Analyzes', desc: 'Agentic AI classifies category, predicts priority, and assesses urgency', icon: '🧠' },
  { num: '03', title: 'AI Resolves', desc: 'GenAI generates domain-specific step-by-step resolution plan', icon: '⚡' },
  { num: '04', title: 'Track & Act', desc: 'Kanban dashboard tracks lifecycle with real-time alerts and assignments', icon: '📊' },
];

const FEATURES = [
  {
    title: 'NLP Priority Engine',
    desc: 'Feature extraction and weighted scoring ML pipeline for real-time priority prediction across domain-specific taxonomies.',
    icon: '🎯',
    tag: 'AI Feature',
  },
  {
    title: 'GenAI Resolution',
    desc: 'Google Gemini LLM generates context-aware, step-by-step resolution plans with domain expertise and time estimates.',
    icon: '🤖',
    tag: 'GenAI Feature',
  },
  {
    title: 'Agentic Workflow',
    desc: 'Autonomous pipeline: Analyze → Categorize → Prioritize → Alert → Suggest → Track. No human bottleneck.',
    icon: '🔄',
    tag: 'Agentic AI',
  },
  {
    title: 'Dynamic Domain AI',
    desc: 'One platform, five industries. Dynamic system prompts shape-shift the AI into a domain expert instantly.',
    icon: '🌐',
    tag: 'Architecture',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [activeDomain, setActiveDomain] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => { const n = new Set(prev); n.add(entry.target.id); return n; });
          }
        });
      },
      { threshold: 0.15 }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveDomain((prev) => (prev + 1) % DOMAINS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const ref = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  const isVisible = (id: string) => visibleSections.has(id);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 hero-gradient pointer-events-none" />
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-2 h-2 bg-indigo-500/30 rounded-full float" style={{ animationDelay: '0s' }} />
        <div className="absolute top-[60%] right-[15%] w-1.5 h-1.5 bg-purple-500/30 rounded-full float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[40%] left-[70%] w-1 h-1 bg-pink-500/30 rounded-full float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[80%] left-[30%] w-2 h-2 bg-blue-500/20 rounded-full float" style={{ animationDelay: '3s' }} />
      </div>

      <div className="relative z-10">
        {/* Nav */}
        <nav className="flex items-center justify-between px-6 lg:px-10 py-5 max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-500/30 pulse-glow">
              S
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">SmartOps AI</span>
              <span className="hidden sm:inline text-xs text-gray-500 ml-2">Intelligent Service Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard?domain=corporate')}
              className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/submit?domain=corporate')}
              className="text-sm px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/25 font-medium"
            >
              Submit Request
            </button>
          </div>
        </nav>

        {/* Hero */}
        <section className="text-center px-4 pt-16 lg:pt-24 pb-20 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium mb-8 fade-in">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Powered by Google Gemini AI + Agentic Workflow Engine
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 leading-[1.08] tracking-tight fade-in" style={{ animationDelay: '100ms' }}>
            The <span className="gradient-text">Intelligent</span> Service
            <br />
            Platform for <span className="gradient-text">Every</span> Industry
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed fade-in" style={{ animationDelay: '200ms' }}>
            An AI-powered platform that doesn&apos;t just track requests &mdash; it{' '}
            <span className="text-white font-medium">understands</span>,{' '}
            <span className="text-white font-medium">prioritizes</span>, and{' '}
            <span className="text-white font-medium">resolves</span> them autonomously.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 fade-in" style={{ animationDelay: '300ms' }}>
            <button
              onClick={() => {
                document.getElementById('domains')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-medium transition-all shadow-xl shadow-indigo-600/20 text-sm"
            >
              Select Your Industry
            </button>
            <button
              onClick={() => router.push('/submit?domain=university')}
              className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-medium transition-all text-sm text-gray-300"
            >
              Try Live Demo
            </button>
          </div>

          {/* Rotating Domain Preview */}
          <div className="max-w-lg mx-auto fade-in" style={{ animationDelay: '400ms' }}>
            <div className="glass-card rounded-2xl p-5 gradient-border">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{DOMAINS[activeDomain].icon}</span>
                <div className="text-left">
                  <p className={`text-sm font-semibold bg-gradient-to-r ${DOMAINS[activeDomain].gradient} bg-clip-text text-transparent`}>
                    {DOMAINS[activeDomain].role}
                  </p>
                  <p className="text-[10px] text-gray-500">{DOMAINS[activeDomain].name}</p>
                </div>
                <div className="ml-auto flex gap-1">
                  {DOMAINS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveDomain(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeDomain ? 'bg-indigo-500 w-4' : 'bg-gray-600'}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 italic text-left">{DOMAINS[activeDomain].example}</p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          ref={ref('how-it-works')}
          className={`px-4 pb-24 max-w-6xl mx-auto transition-all duration-700 ${isVisible('how-it-works') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="text-center mb-12">
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-3">Agentic Workflow</p>
            <h2 className="text-3xl md:text-4xl font-bold">How SmartOps AI Works</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                <div className="glass-card rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{step.icon}</span>
                    <span className="text-xs font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-md">
                      STEP {step.num}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 text-gray-600 text-lg">→</div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Domain Selector */}
        <section
          id="domains"
          ref={ref('domains')}
          className={`px-4 pb-24 max-w-7xl mx-auto transition-all duration-700 ${isVisible('domains') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="text-center mb-12">
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-3">Multi-Domain SaaS</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Choose Your Industry</h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Select your domain and the AI instantly adapts its categorization, priority logic, and resolution expertise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {DOMAINS.map((domain) => (
              <button
                key={domain.id}
                onClick={() => router.push(`/dashboard?domain=${domain.id}`)}
                className={`group relative glass-card rounded-2xl p-7 text-left transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${domain.glow} ${domain.border}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="text-4xl">{domain.icon}</span>
                  <svg className="w-5 h-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <h3 className={`text-lg font-bold mb-1 bg-gradient-to-r ${domain.gradient} bg-clip-text text-transparent`}>
                  {domain.name}
                </h3>
                <p className="text-xs text-indigo-400/80 font-medium mb-3">{domain.role}</p>
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">{domain.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {domain.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-gray-500 border border-white/5">
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          ref={ref('features')}
          className={`px-4 pb-24 max-w-6xl mx-auto transition-all duration-700 ${isVisible('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="text-center mb-12">
            <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-3">AI Capabilities</p>
            <h2 className="text-3xl md:text-4xl font-bold">Real AI. Not Fake Demos.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass-card rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{f.icon}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">
                    {f.tag}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Architecture */}
        <section
          id="arch"
          ref={ref('arch')}
          className={`px-4 pb-24 max-w-5xl mx-auto transition-all duration-700 ${isVisible('arch') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          <div className="glass-card rounded-2xl p-8 md:p-10 gradient-border">
            <div className="text-center mb-8">
              <p className="text-indigo-400 text-xs font-semibold uppercase tracking-widest mb-3">System Architecture</p>
              <h2 className="text-2xl font-bold">Built for Scale</h2>
              <p className="text-sm text-gray-400 mt-2">
                Monolith architecture with clean separation &mdash; designed for production microservices migration
              </p>
            </div>

            {/* Flow */}
            <div className="flex items-center justify-center gap-2 flex-wrap mb-8">
              {[
                { label: 'Client Request', color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
                { label: 'AI Engine', color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
                { label: 'Priority ML', color: 'bg-pink-500/15 text-pink-400 border-pink-500/20' },
                { label: 'GenAI LLM', color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
                { label: 'Firestore DB', color: 'bg-green-500/15 text-green-400 border-green-500/20' },
                { label: 'Dashboard', color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20' },
              ].map((item, i, arr) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${item.color}`}>
                    {item.label}
                  </span>
                  {i < arr.length - 1 && <span className="text-gray-700">→</span>}
                </div>
              ))}
            </div>

            {/* Tech */}
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'Next.js 14',
                'TypeScript',
                'Tailwind CSS',
                'Google Gemini 2.0',
                'Firebase Firestore',
                'REST API',
                'Agentic AI',
              ].map((tech) => (
                <span key={tech} className="px-3 py-1.5 rounded-full text-xs bg-white/[0.03] border border-white/[0.06] text-gray-400">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 pb-20 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Deploy Intelligent Operations?</h2>
          <p className="text-gray-400 mb-8">
            Select your industry and watch the AI shape-shift into a domain expert.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => router.push('/dashboard?domain=university')}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-medium shadow-xl shadow-indigo-600/20 text-sm transition-all"
            >
              Launch Demo Dashboard
            </button>
            <button
              onClick={() => router.push('/submit?domain=healthcare')}
              className="px-8 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 font-medium text-sm text-gray-300 transition-all"
            >
              Try AI Chat Input
            </button>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/5 py-8">
          <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xs">
                S
              </div>
              <span className="text-sm font-semibold">SmartOps AI</span>
            </div>
            <p className="text-xs text-gray-600">
              Built for IGNITE Hackathon 2026 &bull; Team POWER
            </p>
            <div className="flex gap-4 text-xs text-gray-500">
              <button onClick={() => router.push('/dashboard?domain=corporate')} className="hover:text-white transition-colors">Dashboard</button>
              <button onClick={() => router.push('/submit?domain=corporate')} className="hover:text-white transition-colors">Submit</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
