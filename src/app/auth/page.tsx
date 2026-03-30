'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [role, setRole] = useState<'admin' | 'tenant'>('tenant');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const saveAndRedirect = async (uid: string, userName: string, userEmail: string, photo?: string | null) => {
    const existing = await fetch(`/api/users`).then(r => r.json()).catch(() => ({ users: [] }));
    const found = existing.users?.find((u: any) => u.uid === uid || u.email === userEmail);

    if (found) {
      localStorage.setItem('rhq-user', JSON.stringify(found));
      router.push(found.role === 'admin' ? '/dashboard' : '/portal');
      return;
    }

    const newUser = { uid, name: userName, email: userEmail, role, unit, phone: '', createdBy: '' };
    await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser),
    }).catch(() => {});
    localStorage.setItem('rhq-user', JSON.stringify(newUser));
    router.push(role === 'admin' ? '/dashboard' : '/portal');
  };

  const handleGoogle = async () => {
    setLoading(true); setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const u = result.user;
      await saveAndRedirect(u.uid, u.displayName || 'User', u.email || '', u.photoURL);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') setError('Popup closed. Try again.');
      else if (err.code === 'auth/unauthorized-domain') setError('Add localhost to Firebase authorized domains.');
      else setError(err.message || 'Auth failed');
    } finally { setLoading(false); }
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Fill all fields'); return; }
    if (password.length < 6) { setError('Password needs 6+ characters'); return; }
    setLoading(true); setError('');
    try {
      let user;
      if (mode === 'signup') {
        const r = await createUserWithEmailAndPassword(auth, email, password);
        user = r.user;
        if (name) await updateProfile(user, { displayName: name });
      } else {
        const r = await signInWithEmailAndPassword(auth, email, password);
        user = r.user;
      }
      await saveAndRedirect(user.uid, user.displayName || name || email.split('@')[0], user.email || email);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setError('Email already registered. Sign in instead.');
      else if (err.code === 'auth/invalid-credential') setError('Invalid email or password.');
      else if (err.code === 'auth/user-not-found') setError('No account found. Sign up first.');
      else if (err.code === 'auth/wrong-password') setError('Incorrect password.');
      else setError(err.message || 'Auth failed');
    } finally { setLoading(false); }
  };

  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;

  return (
    <div className="min-h-screen flex bg-[#09090b] text-white">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4338ca 0%, #6d28d9 50%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-20">
            <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center font-bold text-white text-lg">R</div>
            <span className="text-2xl font-bold text-white tracking-tight">ResolveHQ</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-5">Smart Apartment<br />Service Management</h1>
          <p className="text-lg text-white/70 leading-relaxed mb-10">AI-powered maintenance tracking, automated priority detection, and instant resolution for residential properties.</p>
          <div className="space-y-4">
            {['AI auto-classifies plumbing, electrical, HVAC issues', 'Tenants submit requests via form or natural chat', 'Admin Kanban dashboard with real-time updates'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-white/80 text-sm">
                <svg className="w-5 h-5 text-emerald-300 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex -space-x-2">
            {['A','B','C','D'].map((l) => (
              <div key={l} className="w-8 h-8 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center text-white text-xs font-semibold backdrop-blur">{l}</div>
            ))}
          </div>
          <p className="text-sm text-white/60">Managing 500+ apartment units</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-[440px]">
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white">R</div>
            <span className="text-xl font-bold">ResolveHQ</span>
          </div>

          <h2 className="text-3xl font-bold mb-1.5">{mode === 'signup' ? 'Create account' : 'Welcome back'}</h2>
          <p className="text-zinc-400 mb-7">{mode === 'signup' ? 'Set up your apartment management account' : 'Sign in to your account'}</p>

          {error && <div className="mb-5 px-4 py-3 rounded-xl text-sm bg-red-500/10 text-red-400 border border-red-500/20">{error}</div>}

          {/* Role Selector */}
          {mode === 'signup' && (
            <div className="mb-6">
              <label className="block text-xs font-medium text-zinc-400 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-3">
                {([['admin', 'Property Admin', 'Manage all requests and tenants'], ['tenant', 'Tenant / Resident', 'Submit and track service requests']] as const).map(([r, title, desc]) => (
                  <button key={r} type="button" onClick={() => setRole(r)} className={`p-4 rounded-xl text-left transition ${role === r ? 'ring-2 ring-indigo-500 bg-indigo-500/10' : 'bg-zinc-900 border border-zinc-800 hover:border-zinc-700'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-3 h-3 rounded-full ${role === r ? 'bg-indigo-500' : 'bg-zinc-700'}`} />
                      <span className="text-sm font-semibold">{title}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 ml-5">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleGoogle} disabled={loading} className="w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-medium text-sm bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition disabled:opacity-50 mb-4">
            {loading ? <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /> : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Continue with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-4 my-5">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm" />
                </div>
                {role === 'tenant' && (
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Apartment Unit</label>
                    <input type="text" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="e.g. A-301, B-105" className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm" />
                  </div>
                )}
              </>
            )}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition disabled:opacity-50">
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500">
            {mode === 'signup' ? (
              <>Already have an account? <button onClick={() => setMode('signin')} className="text-indigo-400 font-medium hover:underline">Sign in</button></>
            ) : (
              <>New here? <button onClick={() => setMode('signup')} className="text-indigo-400 font-medium hover:underline">Create account</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
