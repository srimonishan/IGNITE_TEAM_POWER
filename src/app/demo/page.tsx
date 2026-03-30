'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const DOMAINS = [
  { id: 'university', name: 'University & Campus', icon: 'U', color: 'from-violet-500 to-purple-600' },
  { id: 'healthcare', name: 'Healthcare & Clinical', icon: 'H', color: 'from-rose-500 to-pink-600' },
  { id: 'corporate', name: 'Corporate IT', icon: 'C', color: 'from-amber-500 to-orange-600' },
  { id: 'apartment', name: 'Property Management', icon: 'P', color: 'from-blue-500 to-cyan-600' },
  { id: 'mall', name: 'Retail Operations', icon: 'R', color: 'from-emerald-500 to-green-600' },
];

export default function DemoPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rhq-theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) document.documentElement.setAttribute('data-theme', theme);
  }, [theme, mounted]);

  const selectDemo = (domainId: string) => {
    localStorage.setItem('rhq-demo', 'true');
    localStorage.setItem('rhq-domain', domainId);
    localStorage.setItem('rhq-org', JSON.stringify({ name: 'Demo Organization', domain: domainId, package: 'professional' }));
    router.push(`/dashboard?domain=${domainId}`);
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const isDark = theme === 'dark';
  const bg = isDark ? '#09090b' : '#ffffff';
  const bgCard = isDark ? '#18181b' : '#ffffff';
  const border = isDark ? '#27272a' : '#e5e5e5';
  const text = isDark ? '#fafafa' : '#18181b';
  const textMuted = isDark ? '#a1a1aa' : '#71717a';

  return (
    <div className="min-h-screen" style={{ background: bg, color: text }}>
      <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: isDark ? 'rgba(9,9,11,0.9)' : 'rgba(255,255,255,0.9)', borderBottom: `1px solid ${border}` }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">R</div>
            <span className="text-xl font-bold">ResolveHQ</span>
          </button>
          <button onClick={() => router.push('/auth?mode=signup')} className="text-sm px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium">
            Create Account
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm mb-6" style={{ background: bgCard, border: `1px solid ${border}` }}>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live Demo Mode
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Try ResolveHQ</h1>
          <p style={{ color: textMuted }}>Select an industry to explore the AI-powered service platform</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DOMAINS.map((d) => (
            <button
              key={d.id}
              onClick={() => selectDemo(d.id)}
              className="p-6 rounded-2xl text-left transition hover:scale-[1.02]"
              style={{ background: bgCard, border: `1px solid ${border}` }}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${d.color} flex items-center justify-center font-bold text-white text-xl mb-4`}>
                {d.icon}
              </div>
              <h3 className="text-lg font-semibold mb-1">{d.name}</h3>
              <p className="text-sm" style={{ color: textMuted }}>Try the AI agent configured for {d.name.toLowerCase()}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
