'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Locale, getTranslation } from '@/lib/i18n';

type Theme = 'light' | 'dark';

interface AppCtx {
  theme: Theme;
  toggleTheme: () => void;
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const Ctx = createContext<AppCtx>({
  theme: 'light',
  toggleTheme: () => {},
  locale: 'en',
  setLocale: () => {},
  t: (k) => k,
});

export function useApp() {
  return useContext(Ctx);
}

export function Providers({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');
  const [locale, setLocaleState] = useState<Locale>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rhq-theme') as Theme | null;
    const savedLoc = localStorage.getItem('rhq-locale') as Locale | null;
    if (saved === 'light' || saved === 'dark') setTheme(saved);
    if (savedLoc) setLocaleState(savedLoc);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('rhq-theme', theme);
  }, [theme, mounted]);

  const toggleTheme = useCallback(() => {
    setTheme((p) => (p === 'light' ? 'dark' : 'light'));
  }, []);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('rhq-locale', l);
  }, []);

  const t = useCallback(
    (key: string) => getTranslation(locale, key),
    [locale]
  );

  if (!mounted) return <div className="min-h-screen" />;

  return (
    <Ctx.Provider value={{ theme, toggleTheme, locale, setLocale, t }}>
      {children}
    </Ctx.Provider>
  );
}
