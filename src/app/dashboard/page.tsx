'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type Status = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';

interface AIAnalysis { predictedPriority: Priority; predictedCategory: string; confidence: number; summary: string; resolutionSteps: string[]; estimatedTime: string; reasoning: string; }
interface ServiceRequest { id: string; title: string; description: string; category: string; priority: Priority; location: string; status: Status; domain: string; timestamp: string; assignedTo?: string; aiAnalysis?: AIAnalysis; createdAt: string; updatedAt: string; }
interface Stats { total: number; byStatus: Record<Status, number>; byPriority: Record<Priority, number>; criticalCount: number; recentAlerts: ServiceRequest[]; }

const META: Record<string, { name: string; letter: string; color: string; role: string }> = {
  apartment: { name: 'Residential & Property', letter: 'R', color: 'bg-blue-500', role: 'Property Manager Agent' },
  university: { name: 'University & Campus', letter: 'U', color: 'bg-violet-500', role: 'Campus IT Agent' },
  healthcare: { name: 'Healthcare & Clinical', letter: 'H', color: 'bg-rose-500', role: 'Triage Director Agent' },
  mall: { name: 'Retail & Commercial', letter: 'M', color: 'bg-emerald-500', role: 'Operations Director Agent' },
  corporate: { name: 'Corporate & Enterprise IT', letter: 'C', color: 'bg-amber-500', role: 'DevOps Engineer Agent' },
};

const PRI: Record<Priority, { bg: string; text: string; border: string; dot: string }> = {
  CRITICAL: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', dot: 'bg-red-500' },
  HIGH: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', dot: 'bg-orange-500' },
  MEDIUM: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20', dot: 'bg-yellow-500' },
  LOW: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
};

const STAT: Record<Status, { label: string; color: string; dot: string }> = {
  NEW: { label: 'New', color: 'text-blue-400', dot: 'bg-blue-500' },
  ASSIGNED: { label: 'Assigned', color: 'text-violet-400', dot: 'bg-violet-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-400', dot: 'bg-amber-500' },
  COMPLETED: { label: 'Completed', color: 'text-emerald-400', dot: 'bg-emerald-500' },
};

const STATUSES: Status[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];

function ago(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'now'; if (m < 60) return `${m}m`; const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`; return `${Math.floor(h / 24)}d`;
}

function DashboardContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const domain = sp.get('domain') || 'corporate';
  const m = META[domain] || META.corporate;

  const [reqs, setReqs] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [sel, setSel] = useState<ServiceRequest | null>(null);
  const [priFilter, setPriFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const p = new URLSearchParams({ domain }); if (priFilter) p.set('priority', priFilter);
      const [r, s] = await Promise.all([fetch(`/api/requests?${p}`), fetch(`/api/dashboard?domain=${domain}`)]);
      const rd = await r.json(); const sd = await s.json();
      setReqs(rd.requests || []); setStats(sd.stats || null);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [domain, priFilter]);

  useEffect(() => { load(); const t = setInterval(load, 5000); return () => clearInterval(t); }, [load]);

  const updStatus = async (id: string, s: Status) => {
    await fetch(`/api/requests/${id}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: s }) });
    load(); if (sel?.id === id) setSel((p) => p ? { ...p, status: s } : null);
  };

  const assign = async (id: string, to: string) => {
    await fetch(`/api/requests/${id}/assign`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assignedTo: to }) });
    load();
  };

  const crits = reqs.filter((r) => r.priority === 'CRITICAL' && r.status !== 'COMPLETED');
  const col = (s: Status) => reqs.filter((r) => r.status === s);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 max-w-[1600px] mx-auto">
          <button onClick={() => router.push('/')} className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-indigo-600 flex items-center justify-center font-bold text-xs">R</div>
            <span className="text-sm font-semibold tracking-tight hidden sm:block">ResolveHQ</span>
          </button>
          <div className="flex items-center gap-2">
            <select value={domain} onChange={(e) => router.push(`/dashboard?domain=${e.target.value}`)} className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none cursor-pointer">
              {Object.entries(META).map(([k, v]) => <option key={k} value={k} className="bg-zinc-900">{v.name}</option>)}
            </select>
            <button onClick={() => router.push(`/submit?domain=${domain}`)} className="text-xs px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors font-medium">
              New request
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className={`w-8 h-8 rounded-lg ${m.color} flex items-center justify-center font-bold text-xs text-white`}>{m.letter}</div>
          <div>
            <h1 className="text-base font-semibold">{m.name}</h1>
            <p className="text-[10px] text-zinc-500">{m.role} &middot; Kanban Dashboard</p>
          </div>
        </div>

        {/* Alert */}
        {crits.length > 0 && (
          <div className="animate-pulse-soft mb-5 bg-red-500/5 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
              <div>
                <p className="text-red-400 font-medium text-xs">{crits.length} critical {crits.length === 1 ? 'request requires' : 'requests require'} immediate attention</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {crits.slice(0, 4).map((r) => (
                    <button key={r.id} onClick={() => setSel(r)} className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20 transition-colors">{r.title}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {[
              { l: 'Total', v: stats.total, c: 'text-white' },
              { l: 'Critical', v: stats.byPriority.CRITICAL, c: 'text-red-400' },
              { l: 'In Progress', v: stats.byStatus.IN_PROGRESS, c: 'text-amber-400' },
              { l: 'Completed', v: stats.byStatus.COMPLETED, c: 'text-emerald-400' },
            ].map((s) => (
              <div key={s.l} className="card p-4">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">{s.l}</p>
                <p className={`text-xl font-bold mt-1 ${s.c}`}>{s.v}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] text-zinc-500 font-medium">Priority</span>
          {['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button key={p} onClick={() => setPriFilter(p)} className={`text-[10px] px-2.5 py-1 rounded-md transition-all ${priFilter === p ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'}`}>
              {p || 'All'}
            </button>
          ))}
          <span className="ml-auto text-[10px] text-zinc-600 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
          </span>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
          {STATUSES.map((status) => {
            const items = col(status); const cfg = STAT[status];
            return (
              <div key={status} className="card p-4 min-h-[260px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-medium">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((req) => {
                    const pc = PRI[req.priority];
                    return (
                      <button key={req.id} onClick={() => setSel(req)} className="w-full text-left p-3 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700 transition-all group">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${pc.bg} ${pc.text} border ${pc.border}`}>{req.priority}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{req.category}</span>
                        </div>
                        <h4 className="text-xs font-medium mb-1 line-clamp-2 group-hover:text-white transition-colors">{req.title}</h4>
                        <p className="text-[10px] text-zinc-600 line-clamp-2 mb-1.5">{req.aiAnalysis?.summary || req.description}</p>
                        <div className="flex items-center justify-between text-[9px] text-zinc-700">
                          <span>{req.location}</span>
                          <span>{ago(req.createdAt)}</span>
                        </div>
                      </button>
                    );
                  })}
                  {items.length === 0 && <p className="text-center py-8 text-zinc-700 text-[10px]">No requests</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      {sel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSel(null)} />
          <div className="relative w-full max-w-md bg-[#0c0c14] border-l border-zinc-800 overflow-y-auto animate-slide-right">
            <div className="p-6">
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1 pr-4">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${PRI[sel.priority].bg} ${PRI[sel.priority].text} border ${PRI[sel.priority].border}`}>{sel.priority}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{sel.category}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] ${STAT[sel.status].color} bg-zinc-800 border border-zinc-700`}>{STAT[sel.status].label}</span>
                  </div>
                  <h2 className="text-lg font-semibold leading-tight">{sel.title}</h2>
                </div>
                <button onClick={() => setSel(null)} className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div className="mb-5">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-1.5">Description</p>
                <p className="text-xs text-zinc-300 leading-relaxed">{sel.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-5">
                {[{ l: 'Location', v: sel.location }, { l: 'Created', v: ago(sel.createdAt) }, { l: 'Assigned', v: sel.assignedTo || 'Unassigned' }, { l: 'Domain', v: META[sel.domain]?.name || sel.domain }].map((i) => (
                  <div key={i.l} className="bg-zinc-900 rounded-lg p-2.5 border border-zinc-800">
                    <p className="text-[9px] text-zinc-600 uppercase">{i.l}</p>
                    <p className="text-xs font-medium mt-0.5">{i.v}</p>
                  </div>
                ))}
              </div>

              <div className="mb-5">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => updStatus(sel.id, s)} disabled={sel.status === s}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${sel.status === s ? `${STAT[s].dot} text-white` : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'}`}
                    >{STAT[s].label}</button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-2">Assign</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Team Alpha', 'Team Beta', 'IT Lead', 'Maintenance', 'Security'].map((n) => (
                    <button key={n} onClick={() => assign(sel.id, n)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] transition-all ${sel.assignedTo === n ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-500 border border-zinc-800 hover:border-zinc-700'}`}
                    >{n}</button>
                  ))}
                </div>
              </div>

              {sel.aiAnalysis && (
                <div className="border-t border-zinc-800 pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center text-[9px] font-bold">AI</div>
                      <p className="text-xs font-semibold">Insight panel</p>
                    </div>
                    <span className="text-[10px] text-indigo-400 font-medium">{Math.round(sel.aiAnalysis.confidence * 100)}%</span>
                  </div>

                  <div className="w-full bg-zinc-800 rounded-full h-1 mb-4">
                    <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${sel.aiAnalysis.confidence * 100}%` }} />
                  </div>

                  <div className="bg-zinc-900 rounded-xl p-3.5 border border-zinc-800 mb-3">
                    <p className="text-[9px] text-zinc-600 uppercase mb-1">Summary</p>
                    <p className="text-xs text-zinc-300">{sel.aiAnalysis.summary}</p>
                  </div>

                  <div className="bg-zinc-900 rounded-xl p-3.5 border border-zinc-800 mb-3">
                    <p className="text-[9px] text-zinc-600 uppercase mb-1">Reasoning</p>
                    <p className="text-xs text-zinc-400">{sel.aiAnalysis.reasoning}</p>
                  </div>

                  <div className="bg-zinc-900 rounded-xl p-3.5 border border-zinc-800 mb-3">
                    <p className="text-[9px] text-zinc-600 uppercase mb-2">Resolution steps</p>
                    <ol className="space-y-2">
                      {sel.aiAnalysis.resolutionSteps.map((s, i) => (
                        <li key={i} className="flex gap-2 text-[11px]">
                          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center text-[9px] font-bold">{i + 1}</span>
                          <span className="text-zinc-300">{s}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex items-center justify-between bg-zinc-900 rounded-xl p-3.5 border border-zinc-800">
                    <span className="text-[10px] text-zinc-500">Estimated time</span>
                    <span className="text-xs font-medium text-indigo-400">{sel.aiAnalysis.estimatedTime}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>}>
      <DashboardContent />
    </Suspense>
  );
}
