'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, Suspense } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

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
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('rhq-theme') as 'light' | 'dark' | null;
    if (saved) setTheme(saved);
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) document.documentElement.setAttribute('data-theme', theme);
  }, [theme, mounted]);

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      localStorage.setItem('rhq-user', JSON.stringify({
        uid: user.uid,
        name: user.displayName || 'User',
        email: user.email,
        photo: user.photoURL,
        provider: 'google',
      }));
      router.push('/onboarding');
    } catch (err: any) {
      console.error('Google auth error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try again.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Add localhost to Firebase authorized domains.');
      } else {
        setError(err.message || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill all fields'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true);
    setError('');
    try {
      let user;
      if (mode === 'signup') {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
        if (name) await updateProfile(user, { displayName: name });
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
      }
      localStorage.setItem('rhq-user', JSON.stringify({
        uid: user.uid,
        name: user.displayName || name || email.split('@')[0],
        email: user.email,
        provider: 'email',
      }));
      router.push('/onboarding');
    } catch (err: any) {
      console.error('Email auth error:', err);
      if (err.code === 'auth/email-already-in-use') setError('This email is already registered. Try signing in.');
      else if (err.code === 'auth/invalid-credential') setError('Invalid email or password.');
      else if (err.code === 'auth/user-not-found') setError('No account found. Please sign up first.');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password.');
      else if (err.code === 'auth/weak-password') setError('Password must be at least 6 characters.');
      else setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
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
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 50%, #c026d3 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-white text-lg">R</div>
            <span className="text-2xl font-bold text-white">ResolveHQ</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-5">
            Intelligent service resolution for modern teams
          </h1>
          <p className="text-lg text-white/75 leading-relaxed">
            AI analyzes, prioritizes, and resolves service requests automatically across every industry.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            {['A','B','C','D','E'].map((l, i) => (
              <div key={l} className="w-9 h-9 rounded-full border-2 border-white/30 bg-white/20 flex items-center justify-center text-white text-xs font-semibold backdrop-blur">{l}</div>
            ))}
          </div>
          <p className="text-sm text-white/75">Trusted by 10,000+ teams</p>
        </div>
      </div>

      {/* Right Auth Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[420px]">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white">R</div>
            <span className="text-xl font-bold">ResolveHQ</span>
          </div>

          <h2 className="text-3xl font-bold mb-1.5">
            {mode === 'signup' ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-base mb-8" style={{ color: textMuted }}>
            {mode === 'signup' ? 'Start your free trial today' : 'Sign in to your organization'}
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-red-500/10 text-red-500 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-medium text-sm transition hover:opacity-90 disabled:opacity-50 mb-4"
            style={{ background: bgCard, border: `1px solid ${border}` }}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
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

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px" style={{ background: border }} />
            <span className="text-xs" style={{ color: textMuted }}>or continue with email</span>
            <div className="flex-1 h-px" style={{ background: border }} />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: textMuted }}>Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/40" style={{ background: inputBg, border: `1px solid ${border}`, color: text }} />
              </div>
            )}
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: textMuted }}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className="w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/40" style={{ background: inputBg, border: `1px solid ${border}`, color: text }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: textMuted }}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required className="w-full px-4 py-3 rounded-xl text-sm outline-none transition focus:ring-2 focus:ring-indigo-500/40" style={{ background: inputBg, border: `1px solid ${border}`, color: text }} />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm transition hover:opacity-90 disabled:opacity-50">
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: textMuted }}>
            {mode === 'signup' ? (
              <>Already have an account? <button onClick={() => router.push('/auth')} className="text-indigo-500 font-medium hover:underline">Sign in</button></>
            ) : (
              <>New to ResolveHQ? <button onClick={() => router.push('/auth?mode=signup')} className="text-indigo-500 font-medium hover:underline">Create account</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <AuthContent />
    </Suspense>
  );
}
