'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'INR', symbol: '₹', rate: 83.12 },
  { code: 'LKR', symbol: 'Rs', rate: 324.50 },
];

const DOMAINS = [
  { id: 'university', name: 'University & Campus', icon: 'U', color: 'from-violet-500 to-purple-600', desc: 'Campus IT, labs, exam systems, academic facilities' },
  { id: 'healthcare', name: 'Healthcare & Clinical', icon: 'H', color: 'from-rose-500 to-pink-600', desc: 'Medical equipment, patient systems, facility safety' },
  { id: 'corporate', name: 'Corporate IT', icon: 'C', color: 'from-amber-500 to-orange-600', desc: 'Enterprise helpdesk, infrastructure, security' },
  { id: 'apartment', name: 'Property Management', icon: 'P', color: 'from-blue-500 to-cyan-600', desc: 'Tenant requests, maintenance, facility ops' },
  { id: 'mall', name: 'Retail Operations', icon: 'R', color: 'from-emerald-500 to-green-600', desc: 'Store management, safety, customer service' },
];

const PACKAGES = [
  { id: 'starter', name: 'Starter', price: 49, features: ['100 requests/month', 'AI Priority', 'Basic dashboard', '1 user'] },
  { id: 'professional', name: 'Professional', price: 149, popular: true, features: ['1,000 requests/month', 'AI Priority + Category', 'GenAI Resolution', 'Kanban board', '5 users', 'API access'] },
  { id: 'enterprise', name: 'Enterprise', price: 399, features: ['Unlimited requests', 'Full AI Suite', 'Agentic Workflow', 'Custom integrations', 'Unlimited users', 'SLA tracking', '24/7 support'] },
];

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [lang, setLang] = useState('en');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [selectedPackage, setSelectedPackage] = useState('');
  const [orgName, setOrgName] = useState('');
  const [deploying, setDeploying] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('rhq-user');
    if (!user) { router.push('/auth?mode=signup'); return; }
    const saved = localStorage.getItem('rhq-theme') as 'light' | 'dark' | null;
    const savedLang = localStorage.getItem('rhq-lang');
    const savedCur = localStorage.getItem('rhq-currency');
    if (saved) setTheme(saved);
    if (savedLang) setLang(savedLang);
    if (savedCur) {
      const c = CURRENCIES.find(x => x.code === savedCur);
      if (c) setCurrency(c);
    }
    setMounted(true);
  }, [router]);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('rhq-theme', theme);
    }
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light');

  const changeCurrency = (code: string) => {
    const c = CURRENCIES.find(x => x.code === code);
    if (c) { setCurrency(c); localStorage.setItem('rhq-currency', code); }
  };

  const changeLang = (code: string) => {
    setLang(code);
    localStorage.setItem('rhq-lang', code);
  };

  const formatPrice = (usd: number) => {
    const converted = usd * currency.rate;
    return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const deploy = () => {
    if (!orgName || !selectedDomain || !selectedPackage) return;
    setDeploying(true);
    localStorage.setItem('rhq-org', JSON.stringify({ name: orgName, domain: selectedDomain, package: selectedPackage }));
    localStorage.setItem('rhq-domain', selectedDomain);
    setTimeout(() => {
      router.push(`/dashboard?domain=${selectedDomain}`);
    }, 2500);
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const isDark = theme === 'dark';
  const bg = isDark ? '#09090b' : '#ffffff';
  const bgCard = isDark ? '#18181b' : '#ffffff';
  const border = isDark ? '#27272a' : '#e5e5e5';
  const text = isDark ? '#fafafa' : '#18181b';
  const textMuted = isDark ? '#a1a1aa' : '#71717a';
  const inputBg = isDark ? '#09090b' : '#f8f8f8';

  return (
    <div className="min-h-screen" style={{ background: bg, color: text }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: isDark ? 'rgba(9,9,11,0.9)' : 'rgba(255,255,255,0.9)', borderBottom: `1px solid ${border}` }}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">R</div>
            <span className="text-xl font-bold">ResolveHQ</span>
          </div>
          <div className="flex items-center gap-3">
            <select value={lang} onChange={(e) => changeLang(e.target.value)} className="text-xs px-2 py-1.5 rounded-lg cursor-pointer" style={{ background: bgCard, border: `1px solid ${border}`, color: text }}>
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
            <select value={currency.code} onChange={(e) => changeCurrency(e.target.value)} className="text-xs px-2 py-1.5 rounded-lg cursor-pointer" style={{ background: bgCard, border: `1px solid ${border}`, color: text }}>
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
            </select>
            <button onClick={toggleTheme} className="p-2 rounded-lg" style={{ background: bgCard, border: `1px solid ${border}` }}>
              {isDark ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg> : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>}
            </button>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-6 pt-8">
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${step >= s ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white' : ''}`} style={step < s ? { background: bgCard, border: `1px solid ${border}` } : undefined}>
                {s}
              </div>
              {s < 3 && <div className="w-16 h-1 rounded-full" style={{ background: step > s ? 'linear-gradient(90deg, #6366f1, #a855f7)' : border }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-3xl mx-auto px-6 pb-20">
        {/* Step 1: Select Domain */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Select your industry</h2>
            <p className="mb-8" style={{ color: textMuted }}>The AI will adapt its categorization and resolution expertise to your domain</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DOMAINS.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setSelectedDomain(d.id)}
                  className={`p-5 rounded-2xl text-left transition ${selectedDomain === d.id ? 'ring-2 ring-indigo-500' : ''}`}
                  style={{ background: bgCard, border: `1px solid ${selectedDomain === d.id ? '#6366f1' : border}` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${d.color} flex items-center justify-center font-bold text-white text-lg mb-3`}>
                    {d.icon}
                  </div>
                  <h3 className="font-semibold mb-1">{d.name}</h3>
                  <p className="text-sm" style={{ color: textMuted }}>{d.desc}</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => selectedDomain && setStep(2)}
              disabled={!selectedDomain}
              className="mt-8 w-full py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold transition hover:opacity-90 disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Select Package */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Choose your plan</h2>
            <p className="mb-8" style={{ color: textMuted }}>Select the package that fits your organization's needs</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PACKAGES.map((pkg) => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg.id)}
                  className={`p-5 rounded-2xl text-left transition relative ${selectedPackage === pkg.id ? 'ring-2 ring-indigo-500' : ''}`}
                  style={{ background: bgCard, border: `1px solid ${selectedPackage === pkg.id ? '#6366f1' : border}` }}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500 text-white">
                      Popular
                    </div>
                  )}
                  <h3 className="font-semibold mb-2">{pkg.name}</h3>
                  <div className="text-3xl font-bold mb-4">{formatPrice(pkg.price)}<span className="text-sm font-normal" style={{ color: textMuted }}>/mo</span></div>
                  <ul className="space-y-2">
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm" style={{ color: textMuted }}>
                        <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(1)} className="flex-1 py-4 rounded-xl font-semibold transition" style={{ background: bgCard, border: `1px solid ${border}` }}>
                Back
              </button>
              <button
                onClick={() => selectedPackage && setStep(3)}
                disabled={!selectedPackage}
                className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold transition hover:opacity-90 disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Organization Setup */}
        {step === 3 && !deploying && (
          <div>
            <h2 className="text-2xl font-bold mb-2">Setup your organization</h2>
            <p className="mb-8" style={{ color: textMuted }}>Final step - name your organization to deploy your platform</p>
            <div className="rounded-2xl p-6" style={{ background: bgCard, border: `1px solid ${border}` }}>
              <label className="block text-sm font-medium mb-2">Organization Name</label>
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="e.g., University of Technology, TechCorp Inc."
                className="w-full px-4 py-3.5 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/50 mb-6"
                style={{ background: inputBg, border: `1px solid ${border}`, color: text }}
              />
              
              <div className="rounded-xl p-4 mb-6" style={{ background: inputBg, border: `1px solid ${border}` }}>
                <h4 className="font-semibold mb-3">Your Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span style={{ color: textMuted }}>Industry</span><span className="font-medium">{DOMAINS.find(d => d.id === selectedDomain)?.name}</span></div>
                  <div className="flex justify-between"><span style={{ color: textMuted }}>Package</span><span className="font-medium">{PACKAGES.find(p => p.id === selectedPackage)?.name}</span></div>
                  <div className="flex justify-between"><span style={{ color: textMuted }}>Monthly Cost</span><span className="font-medium">{formatPrice(PACKAGES.find(p => p.id === selectedPackage)?.price || 0)}</span></div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-4 rounded-xl font-semibold transition" style={{ background: inputBg, border: `1px solid ${border}` }}>
                  Back
                </button>
                <button
                  onClick={deploy}
                  disabled={!orgName}
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold transition hover:opacity-90 disabled:opacity-50"
                >
                  Deploy Platform
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Deploying */}
        {deploying && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg className="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Deploying your platform...</h2>
            <p style={{ color: textMuted }}>Setting up {orgName} with AI-powered service resolution</p>
            <div className="mt-8 space-y-3 text-sm" style={{ color: textMuted }}>
              <p className="flex items-center justify-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Configuring AI models for {DOMAINS.find(d => d.id === selectedDomain)?.name}</p>
              <p className="flex items-center justify-center gap-2"><svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Setting up dashboard and analytics</p>
              <p className="flex items-center justify-center gap-2"><div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> Initializing your workspace...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
