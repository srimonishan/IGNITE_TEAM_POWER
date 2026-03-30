'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type Status = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED';

interface AIAnalysis {
  predictedPriority: Priority;
  predictedCategory: string;
  confidence: number;
  summary: string;
  resolutionSteps: string[];
  estimatedTime: string;
  reasoning: string;
}

interface ServiceRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  location: string;
  status: Status;
  domain: string;
  timestamp: string;
  assignedTo?: string;
  aiAnalysis?: AIAnalysis;
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  total: number;
  byStatus: Record<Status, number>;
  byPriority: Record<Priority, number>;
  criticalCount: number;
  recentAlerts: ServiceRequest[];
}

const DOMAIN_META: Record<string, { name: string; icon: string; gradient: string; role: string }> = {
  apartment: { name: 'Residential Apartments', icon: '🏢', gradient: 'from-blue-500 to-cyan-400', role: 'AI Property Manager' },
  university: { name: 'University Campus', icon: '🎓', gradient: 'from-violet-500 to-purple-400', role: 'AI Campus IT Manager' },
  healthcare: { name: 'Healthcare', icon: '🏥', gradient: 'from-rose-500 to-orange-400', role: 'AI Triage Director' },
  mall: { name: 'Shopping Mall', icon: '🛍️', gradient: 'from-emerald-500 to-green-400', role: 'AI Mall Ops Director' },
  corporate: { name: 'Corporate IT', icon: '💼', gradient: 'from-amber-500 to-yellow-400', role: 'AI DevOps Engineer' },
};

const PRI: Record<Priority, { dot: string; bg: string; text: string; border: string }> = {
  CRITICAL: { dot: 'bg-red-500', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  HIGH: { dot: 'bg-orange-500', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  MEDIUM: { dot: 'bg-yellow-500', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  LOW: { dot: 'bg-green-500', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
};

const STAT: Record<Status, { label: string; color: string; bg: string }> = {
  NEW: { label: 'New', color: 'text-blue-400', bg: 'bg-blue-500' },
  ASSIGNED: { label: 'Assigned', color: 'text-purple-400', bg: 'bg-purple-500' },
  IN_PROGRESS: { label: 'In Progress', color: 'text-amber-400', bg: 'bg-amber-500' },
  COMPLETED: { label: 'Completed', color: 'text-green-400', bg: 'bg-green-500' },
};

const STATUSES: Status[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];

function timeAgo(d: string): string {
  const ms = Date.now() - new Date(d).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const domain = searchParams.get('domain') || 'corporate';
  const meta = DOMAIN_META[domain] || DOMAIN_META.corporate;

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selected, setSelected] = useState<ServiceRequest | null>(null);
  const [filterPri, setFilterPri] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const p = new URLSearchParams({ domain });
      if (filterPri) p.set('priority', filterPri);
      const [r, s] = await Promise.all([
        fetch(`/api/requests?${p}`),
        fetch(`/api/dashboard?domain=${domain}`),
      ]);
      const rd = await r.json();
      const sd = await s.json();
      setRequests(rd.requests || []);
      setStats(sd.stats || null);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [domain, filterPri]);

  useEffect(() => {
    fetchData();
    const t = setInterval(fetchData, 5000);
    return () => clearInterval(t);
  }, [fetchData]);

  const updateStatus = async (id: string, s: Status) => {
    await fetch(`/api/requests/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: s }),
    });
    fetchData();
    if (selected?.id === id) setSelected((p) => (p ? { ...p, status: s } : null));
  };

  const assignReq = async (id: string, to: string) => {
    await fetch(`/api/requests/${id}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assignedTo: to }),
    });
    fetchData();
  };

  const criticals = requests.filter((r) => r.priority === 'CRITICAL' && r.status !== 'COMPLETED');
  const byStatus = (s: Status) => requests.filter((r) => r.status === s);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-10 w-10 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading {meta.name} dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-[#030014]/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center justify-between px-4 lg:px-6 py-3 max-w-[1600px] mx-auto">
          <button onClick={() => router.push('/')} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-sm shadow-lg shadow-indigo-500/25">S</div>
            <span className="text-base font-bold tracking-tight hidden sm:block">SmartOps AI</span>
          </button>
          <div className="flex items-center gap-2">
            <select
              value={domain}
              onChange={(e) => router.push(`/dashboard?domain=${e.target.value}`)}
              className="text-xs px-3 py-2 rounded-lg bg-white/5 border border-white/[0.08] text-white focus:outline-none cursor-pointer"
            >
              {Object.entries(DOMAIN_META).map(([k, v]) => (
                <option key={k} value={k} className="bg-gray-900">{v.icon} {v.name}</option>
              ))}
            </select>
            <button
              onClick={() => router.push(`/submit?domain=${domain}`)}
              className="text-xs px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/20 font-medium"
            >
              + New Request
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-5">
        {/* Domain Header */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">{meta.icon}</span>
          <div>
            <h1 className={`text-lg font-bold bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}>{meta.name}</h1>
            <p className="text-[10px] text-gray-500">{meta.role} &bull; Real-time Kanban Dashboard</p>
          </div>
        </div>

        {/* Critical Alert */}
        {criticals.length > 0 && (
          <div className="alert-pulse mb-5 bg-red-500/[0.08] border border-red-500/25 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-3 h-3 rounded-full bg-red-500" />
              <div>
                <p className="text-red-400 font-semibold text-sm">
                  {criticals.length} CRITICAL {criticals.length === 1 ? 'request requires' : 'requests require'} immediate attention
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {criticals.slice(0, 4).map((r) => (
                    <button key={r.id} onClick={() => setSelected(r)} className="text-[10px] px-2 py-1 rounded-md bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors">
                      {r.title}
                    </button>
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
              { label: 'Total', value: stats.total, color: 'text-white' },
              { label: 'Critical', value: stats.byPriority.CRITICAL, color: 'text-red-400' },
              { label: 'In Progress', value: stats.byStatus.IN_PROGRESS, color: 'text-amber-400' },
              { label: 'Completed', value: stats.byStatus.COMPLETED, color: 'text-green-400' },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">{s.label}</p>
                <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs text-gray-500">Priority:</span>
          <div className="flex gap-1">
            {['', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
              <button
                key={p}
                onClick={() => setFilterPri(p)}
                className={`text-[10px] px-2.5 py-1 rounded-md transition-all ${
                  filterPri === p
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white/5 text-gray-500 hover:bg-white/10 border border-white/[0.06]'
                }`}
              >
                {p || 'All'}
              </button>
            ))}
          </div>
          <span className="ml-auto text-[10px] text-gray-600">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 mr-1 animate-pulse" />
            Live &bull; 5s refresh
          </span>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STATUSES.map((status) => {
            const col = byStatus(status);
            const cfg = STAT[status];
            return (
              <div key={status} className="glass-card rounded-xl p-4 min-h-[280px]">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${cfg.bg}`} />
                    <span className={`text-xs font-bold ${cfg.color}`}>{cfg.label}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-500 font-medium">{col.length}</span>
                </div>
                <div className="space-y-2.5">
                  {col.map((req) => {
                    const pc = PRI[req.priority];
                    return (
                      <button
                        key={req.id}
                        onClick={() => setSelected(req)}
                        className="w-full text-left p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.12] hover:bg-white/[0.05] transition-all group"
                      >
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${pc.bg} ${pc.text} border ${pc.border}`}>{req.priority}</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{req.category}</span>
                        </div>
                        <h4 className="text-xs font-semibold mb-1 line-clamp-2 group-hover:text-white transition-colors">{req.title}</h4>
                        <p className="text-[10px] text-gray-600 line-clamp-2 mb-2">{req.aiAnalysis?.summary || req.description}</p>
                        <div className="flex items-center justify-between text-[9px] text-gray-600">
                          <span>📍 {req.location}</span>
                          <span>{timeAgo(req.createdAt)}</span>
                        </div>
                      </button>
                    );
                  })}
                  {col.length === 0 && (
                    <div className="text-center py-10 text-gray-700 text-[10px]">No requests</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-md bg-[#08081a] border-l border-white/[0.06] overflow-y-auto slide-in-right">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex-1 pr-4">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${PRI[selected.priority].bg} ${PRI[selected.priority].text} border ${PRI[selected.priority].border}`}>{selected.priority}</span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{selected.category}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] ${STAT[selected.status].color} bg-white/5 border border-white/[0.08]`}>{STAT[selected.status].label}</span>
                  </div>
                  <h2 className="text-lg font-bold leading-tight">{selected.title}</h2>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Description */}
              <div className="mb-5">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Description</p>
                <p className="text-xs text-gray-300 leading-relaxed">{selected.description}</p>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {[
                  { l: 'Location', v: selected.location },
                  { l: 'Created', v: timeAgo(selected.createdAt) },
                  { l: 'Assigned', v: selected.assignedTo || 'Unassigned' },
                  { l: 'Domain', v: DOMAIN_META[selected.domain]?.name || selected.domain },
                ].map((m) => (
                  <div key={m.l} className="bg-white/[0.02] rounded-lg p-2.5">
                    <p className="text-[9px] text-gray-600 uppercase">{m.l}</p>
                    <p className="text-xs font-medium">{m.v}</p>
                  </div>
                ))}
              </div>

              {/* Status */}
              <div className="mb-5">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Lifecycle Status</p>
                <div className="flex flex-wrap gap-1.5">
                  {STATUSES.map((s) => (
                    <button key={s} onClick={() => updateStatus(selected.id, s)} disabled={selected.status === s}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${selected.status === s ? `${STAT[s].bg} text-white` : 'bg-white/5 text-gray-500 hover:bg-white/10 border border-white/[0.06]'}`}
                    >{STAT[s].label}</button>
                  ))}
                </div>
              </div>

              {/* Assign */}
              <div className="mb-5">
                <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Assign To</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Team Alpha', 'Team Beta', 'IT Lead', 'Maintenance', 'Security'].map((n) => (
                    <button key={n} onClick={() => assignReq(selected.id, n)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] transition-all ${selected.assignedTo === n ? 'bg-indigo-600 text-white' : 'bg-white/5 text-gray-500 hover:bg-white/10 border border-white/[0.06]'}`}
                    >{n}</button>
                  ))}
                </div>
              </div>

              {/* AI Insight */}
              {selected.aiAnalysis && (
                <div className="border-t border-white/5 pt-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-bold">AI</span>
                    <h3 className="text-xs font-bold">AI Insight Panel</h3>
                    <span className="text-[9px] text-indigo-400 ml-auto">{Math.round(selected.aiAnalysis.confidence * 100)}% confidence</span>
                  </div>

                  <div className="w-full bg-white/5 rounded-full h-1 mb-4">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 rounded-full transition-all" style={{ width: `${selected.aiAnalysis.confidence * 100}%` }} />
                  </div>

                  <div className="bg-white/[0.02] rounded-xl p-3.5 mb-3">
                    <p className="text-[9px] text-gray-600 uppercase mb-1">Summary</p>
                    <p className="text-xs text-gray-300">{selected.aiAnalysis.summary}</p>
                  </div>

                  <div className="bg-white/[0.02] rounded-xl p-3.5 mb-3">
                    <p className="text-[9px] text-gray-600 uppercase mb-1">Reasoning</p>
                    <p className="text-xs text-gray-400">{selected.aiAnalysis.reasoning}</p>
                  </div>

                  <div className="bg-white/[0.02] rounded-xl p-3.5 mb-3">
                    <p className="text-[9px] text-gray-600 uppercase mb-2.5">Resolution Steps</p>
                    <ol className="space-y-2">
                      {selected.aiAnalysis.resolutionSteps.map((step, i) => (
                        <li key={i} className="flex gap-2 text-[11px]">
                          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center text-[9px] font-bold">{i + 1}</span>
                          <span className="text-gray-300">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="flex items-center justify-between bg-white/[0.02] rounded-xl p-3.5">
                    <span className="text-[10px] text-gray-500">Estimated Time</span>
                    <span className="text-xs font-semibold text-indigo-400">{selected.aiAnalysis.estimatedTime}</span>
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
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
