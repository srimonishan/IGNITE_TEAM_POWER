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

const PACKAGES = [
  {
    id: 'starter',
    name: 'Starter',
    price: 49,
    domain: 'corporate',
    features: ['Up to 100 requests/month', 'AI Priority Prediction', 'Email notifications', 'Basic dashboard', '1 admin user'],
    color: 'from-blue-500 to-cyan-500',
    popular: false,
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 149,
    domain: 'university',
    features: ['Up to 1,000 requests/month', 'AI Priority + Category', 'GenAI Resolution Steps', 'Kanban dashboard', '5 admin users', 'API access'],
    color: 'from-violet-500 to-purple-500',
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 399,
    domain: 'healthcare',
    features: ['Unlimited requests', 'Full AI Suite', 'Agentic Workflow', 'Custom integrations', 'Unlimited users', 'SLA tracking', '24/7 support'],
    color: 'from-amber-500 to-orange-500',
    popular: false,
  },
];

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'hi', label: 'हिंदी' },
  { code: 'ta', label: 'தமிழ்' },
];

const T: Record<string, Record<string, string>> = {
  en: {
    hero: 'AI-Powered Service Resolution',
    subtitle: 'Choose your plan and deploy your intelligent service platform in seconds',
    monthly: 'per month',
    getStarted: 'Get Started',
    popular: 'Most Popular',
    features: 'Features',
    selectCurrency: 'Currency',
    selectLanguage: 'Language',
    darkMode: 'Dark',
    lightMode: 'Light',
    trustedBy: 'Trusted by leading organizations worldwide',
  },
  es: {
    hero: 'Resolución de Servicios con IA',
    subtitle: 'Elija su plan y despliegue su plataforma de servicio inteligente en segundos',
    monthly: 'por mes',
    getStarted: 'Comenzar',
    popular: 'Más Popular',
    features: 'Características',
    selectCurrency: 'Moneda',
    selectLanguage: 'Idioma',
    darkMode: 'Oscuro',
    lightMode: 'Claro',
    trustedBy: 'Confiado por organizaciones líderes en todo el mundo',
  },
  fr: {
    hero: 'Résolution de Services par IA',
    subtitle: 'Choisissez votre plan et déployez votre plateforme de service intelligente',
    monthly: 'par mois',
    getStarted: 'Commencer',
    popular: 'Plus Populaire',
    features: 'Fonctionnalités',
    selectCurrency: 'Devise',
    selectLanguage: 'Langue',
    darkMode: 'Sombre',
    lightMode: 'Clair',
    trustedBy: 'Approuvé par des organisations leaders dans le monde',
  },
  hi: {
    hero: 'AI-संचालित सेवा समाधान',
    subtitle: 'अपनी योजना चुनें और सेकंडों में अपना बुद्धिमान सेवा प्लेटफ़ॉर्म तैनात करें',
    monthly: 'प्रति माह',
    getStarted: 'शुरू करें',
    popular: 'सबसे लोकप्रिय',
    features: 'विशेषताएं',
    selectCurrency: 'मुद्रा',
    selectLanguage: 'भाषा',
    darkMode: 'डार्क',
    lightMode: 'लाइट',
    trustedBy: 'दुनिया भर के प्रमुख संगठनों द्वारा विश्वसनीय',
  },
  ta: {
    hero: 'AI-இயக்கப்படும் சேவை தீர்வு',
    subtitle: 'உங்கள் திட்டத்தைத் தேர்ந்தெடுத்து உங்கள் புத்திசாலி சேவை தளத்தை வினாடிகளில் பயன்படுத்தவும்',
    monthly: 'மாதத்திற்கு',
    getStarted: 'தொடங்கு',
    popular: 'மிகவும் பிரபலம்',
    features: 'அம்சங்கள்',
    selectCurrency: 'நாணயம்',
    selectLanguage: 'மொழி',
    darkMode: 'இருண்ட',
    lightMode: 'ஒளி',
    trustedBy: 'உலகெங்கிலும் முன்னணி நிறுவனங்களால் நம்பகமானது',
  },
};

export default function PricingPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [lang, setLang] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('rhq-theme') as 'light' | 'dark' | null;
    const savedLang = localStorage.getItem('rhq-lang') || 'en';
    const savedCur = localStorage.getItem('rhq-currency');
    if (savedTheme) setTheme(savedTheme);
    if (savedLang) setLang(savedLang);
    if (savedCur) {
      const c = CURRENCIES.find(x => x.code === savedCur);
      if (c) setCurrency(c);
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rhq-theme', theme);
  }, [theme, mounted]);

  const toggleTheme = () => setTheme(p => p === 'light' ? 'dark' : 'light');

  const changeCurrency = (code: string) => {
    const c = CURRENCIES.find(x => x.code === code);
    if (c) {
      setCurrency(c);
      localStorage.setItem('rhq-currency', code);
    }
  };

  const changeLang = (code: string) => {
    setLang(code);
    localStorage.setItem('rhq-lang', code);
  };

  const t = (key: string) => T[lang]?.[key] || T.en[key] || key;

  const formatPrice = (usd: number) => {
    const converted = usd * currency.rate;
    return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  const selectPackage = (pkg: typeof PACKAGES[0]) => {
    localStorage.setItem('rhq-package', pkg.id);
    localStorage.setItem('rhq-domain', pkg.domain);
    router.push(`/dashboard?domain=${pkg.domain}`);
  };

  if (!mounted) return <div className="min-h-screen" style={{ background: 'var(--bg, #09090b)' }} />;

  const bg = theme === 'dark' ? '#09090b' : '#ffffff';
  const bgCard = theme === 'dark' ? '#18181b' : '#ffffff';
  const border = theme === 'dark' ? '#27272a' : '#e5e5e5';
  const text = theme === 'dark' ? '#fafafa' : '#18181b';
  const textMuted = theme === 'dark' ? '#a1a1aa' : '#71717a';

  return (
    <div className="min-h-screen" style={{ background: bg, color: text }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: theme === 'dark' ? 'rgba(9,9,11,0.8)' : 'rgba(255,255,255,0.8)', borderBottom: `1px solid ${border}` }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm text-white">R</div>
            <span className="text-lg font-semibold tracking-tight">ResolveHQ</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language */}
            <select
              value={lang}
              onChange={(e) => changeLang(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg cursor-pointer"
              style={{ background: bgCard, border: `1px solid ${border}`, color: text }}
            >
              {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>

            {/* Currency */}
            <select
              value={currency.code}
              onChange={(e) => changeCurrency(e.target.value)}
              className="text-xs px-2 py-1.5 rounded-lg cursor-pointer"
              style={{ background: bgCard, border: `1px solid ${border}`, color: text }}
            >
              {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>)}
            </select>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors"
              style={{ background: bgCard, border: `1px solid ${border}` }}
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-16 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6" style={{ background: theme === 'dark' ? '#27272a' : '#f4f4f5', color: textMuted }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Powered by Google Gemini AI
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
          {t('hero')}
        </h1>
        <p className="text-lg max-w-2xl mx-auto mb-12" style={{ color: textMuted }}>
          {t('subtitle')}
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              className="relative rounded-2xl p-6 transition-all hover:scale-[1.02]"
              style={{
                background: bgCard,
                border: pkg.popular ? '2px solid #8b5cf6' : `1px solid ${border}`,
                boxShadow: pkg.popular ? '0 0 40px rgba(139, 92, 246, 0.15)' : undefined,
              }}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500 text-white">
                  {t('popular')}
                </div>
              )}

              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${pkg.color} flex items-center justify-center font-bold text-white text-lg mb-4`}>
                {pkg.name[0]}
              </div>

              <h3 className="text-xl font-semibold mb-2">{pkg.name}</h3>

              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold">{formatPrice(pkg.price)}</span>
                <span className="text-sm" style={{ color: textMuted }}>/{t('monthly')}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span style={{ color: textMuted }}>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => selectPackage(pkg)}
                className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                  pkg.popular
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:opacity-90'
                    : ''
                }`}
                style={!pkg.popular ? { background: theme === 'dark' ? '#27272a' : '#f4f4f5', color: text } : undefined}
              >
                {t('getStarted')}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="pb-20 px-6">
        <p className="text-center text-sm mb-8" style={{ color: textMuted }}>{t('trustedBy')}</p>
        <div className="flex flex-wrap justify-center gap-8 opacity-50" style={{ color: textMuted }}>
          {['Amazon', 'Microsoft', 'Google', 'Meta', 'Apple'].map(name => (
            <span key={name} className="text-lg font-semibold">{name}</span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: `1px solid ${border}` }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-[10px] text-white">R</div>
          <span className="text-sm font-semibold">ResolveHQ</span>
        </div>
        <p className="text-xs" style={{ color: textMuted }}>IGNITE Hackathon 2026 — Team POWER</p>
      </footer>
    </div>
  );
}
