'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';
  
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('rhq-theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) document.documentElement.setAttribute('data-theme', theme);
  }, [theme, mounted]);

  const handleGoogleAuth = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('rhq-user', JSON.stringify({ name: 'Admin User', email: 'admin@example.com', provider: 'google' }));
      router.push('/onboarding');
    }, 1500);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('rhq-user', JSON.stringify({ name: name || email.split('@')[0], email, provider: 'email' }));
      router.push('/onboarding');
    }, 1000);
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
    <div className="min-h-screen flex" style={{ background: bg, color: text }}>
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold text-white">R</div>
          <span className="text-2xl font-bold text-white">ResolveHQ</span>
        </div>
        
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Transform your service operations with AI
          </h1>
          <p className="text-lg text-white/80">
            Join thousands of organizations using intelligent automation to resolve issues faster and smarter.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex -space-x-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-white text-xs font-medium">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <p className="text-sm text-white/80">Trusted by 10,000+ teams worldwide</p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">R</div>
            <span className="text-xl font-bold">ResolveHQ</span>
          </div>

          <h2 className="text-2xl font-bold mb-2">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="mb-8" style={{ color: textMuted }}>
            {mode === 'signup' ? 'Start your free trial today' : 'Sign in to continue to your dashboard'}
          </p>

          {/* Google Auth Button */}
          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-medium transition hover:opacity-90 disabled:opacity-50"
            style={{ background: bgCard, border: `1px solid ${border}` }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px" style={{ background: border }} />
            <span className="text-sm" style={{ color: textMuted }}>or</span>
            <div className="flex-1 h-px" style={{ background: border }} />
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/50"
                  style={{ background: inputBg, border: `1px solid ${border}`, color: text }}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: inputBg, border: `1px solid ${border}`, color: text }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/50"
                style={{ background: inputBg, border: `1px solid ${border}`, color: text }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold transition hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: textMuted }}>
            {mode === 'signup' ? (
              <>Already have an account? <button onClick={() => router.push('/auth')} className="text-indigo-500 font-medium hover:underline">Sign in</button></>
            ) : (
              <>Don't have an account? <button onClick={() => router.push('/auth?mode=signup')} className="text-indigo-500 font-medium hover:underline">Create one</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <AuthContent />
    </Suspense>
  );
}
