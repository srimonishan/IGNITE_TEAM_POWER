'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { AppUser, ServiceRequest, Priority, Status, AIAnalysis } from '@/lib/types';

const PRIORITY_STYLE: Record<Priority, string> = {
  CRITICAL: 'bg-red-500/10 text-red-400 border border-red-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  LOW: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
};

const STATUS_BADGE: Record<string, string> = {
  ASSIGNED: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
};

const COLUMN_CONFIG: {
  key: Status;
  label: string;
  border: string;
  dot: string;
  headerBg: string;
}[] = [
  { key: 'ASSIGNED', label: 'Assigned', border: 'border-blue-500/40', dot: 'bg-blue-400', headerBg: 'bg-blue-500/5' },
  { key: 'IN_PROGRESS', label: 'In Progress', border: 'border-amber-500/40', dot: 'bg-amber-400', headerBg: 'bg-amber-500/5' },
  { key: 'COMPLETED', label: 'Completed', border: 'border-emerald-500/40', dot: 'bg-emerald-400', headerBg: 'bg-emerald-500/5' },
];

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function StaffPortal() {
  const router = useRouter();
  const [user, setUser] = useState<AppUser | null>(null);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReq, setSelectedReq] = useState<ServiceRequest | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const raw = localStorage.getItem('rhq-user');
    if (!raw) { router.push('/auth'); return; }
    try {
      const parsed = JSON.parse(raw) as AppUser;
      if (parsed.role !== 'staff') { router.push('/auth'); return; }
      setUser(parsed);
      const t = localStorage.getItem('rhq-theme') || 'dark';
      document.documentElement.setAttribute('data-theme', t);
      setTheme(t);
    } catch {
      router.push('/auth');
    }
  }, [router]);

  const loadRequests = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/requests?assignedToUid=${user.uid}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 3000);
    return () => clearInterval(interval);
  }, [loadRequests]);

  const handleStatusUpdate = async (id: string, newStatus: Status) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/requests/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await loadRequests();
        if (selectedReq?.id === id) {
          setSelectedReq((prev) => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (err) {
      console.error('Status update failed:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSignOut = async () => {
    try { await signOut(auth); } catch { /* ignore */ }
    localStorage.removeItem('rhq-user');
    router.push('/auth');
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('rhq-theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const assigned = requests.filter((r) => r.status === 'ASSIGNED');
  const inProgress = requests.filter((r) => r.status === 'IN_PROGRESS');
  const completed = requests.filter((r) => r.status === 'COMPLETED');
  const completedToday = completed.filter((r) => {
    return new Date(r.updatedAt).toDateString() === new Date().toDateString();
  });

  const columnData: Record<string, ServiceRequest[]> = {
    ASSIGNED: assigned,
    IN_PROGRESS: inProgress,
    COMPLETED: completed,
  };

  if (!user) return <div className="min-h-screen bg-[#09090b]" />;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* ── Nav ── */}
      <nav className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center font-bold text-white text-sm">R</div>
            <span className="text-xl font-bold tracking-tight">ResolveHQ</span>
            <span className="hidden sm:inline text-xs text-zinc-500 ml-1 border-l border-zinc-800 pl-3">Staff Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-zinc-200 leading-tight">{user.name}</p>
                {user.specialization && (
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {user.specialization}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <button
              onClick={handleSignOut}
              className="px-3.5 py-1.5 rounded-lg text-sm bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition"
            >
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-6">
        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Assigned', value: assigned.length, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
            { label: 'In Progress', value: inProgress.length, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
            { label: 'Completed Today', value: completedToday.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl p-5 bg-zinc-900/50 border border-zinc-800 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                <svg className={`w-6 h-6 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Kanban Board ── */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-500">Loading your requests...</p>
            </div>
          </div>
        ) : requests.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <div>
                <p className="text-lg font-semibold text-zinc-300">No requests assigned to you yet.</p>
                <p className="text-sm text-zinc-600 mt-1">When the admin assigns maintenance requests, they&apos;ll appear here.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {COLUMN_CONFIG.map((col) => {
              const items = columnData[col.key] || [];
              return (
                <div key={col.key} className="flex flex-col min-h-[400px]">
                  {/* Column header */}
                  <div className={`flex items-center justify-between mb-3 pb-3 border-b-2 ${col.border} ${col.headerBg} rounded-t-lg px-3 pt-3`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${col.dot} animate-pulse`} />
                      <h2 className="text-sm font-semibold text-zinc-200">{col.label}</h2>
                    </div>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400">
                      {items.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="flex flex-col gap-3 flex-1">
                    {items.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center rounded-xl border border-dashed border-zinc-800 py-12">
                        <p className="text-xs text-zinc-600">No {col.label.toLowerCase()} requests</p>
                      </div>
                    ) : (
                      items.map((req) => (
                        <button
                          key={req.id}
                          onClick={() => setSelectedReq(req)}
                          className={`group text-left rounded-xl bg-zinc-900/70 border p-4 transition-all duration-200 hover:border-zinc-600 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 ${
                            selectedReq?.id === req.id
                              ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
                              : 'border-zinc-800'
                          }`}
                        >
                          {/* Badges row */}
                          <div className="flex flex-wrap gap-1.5 mb-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${PRIORITY_STYLE[req.priority]}`}>
                              {req.priority}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                              {req.category}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-sm font-semibold text-zinc-100 leading-snug mb-2 group-hover:text-white transition-colors">
                            {req.title}
                          </h3>

                          {/* Meta */}
                          <div className="space-y-1 mb-2">
                            {req.location && (
                              <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {req.location}
                              </p>
                            )}
                            {req.tenantName && (
                              <p className="text-xs text-zinc-500 flex items-center gap-1.5">
                                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                {req.tenantName}{req.tenantUnit ? ` · Unit ${req.tenantUnit}` : ''}
                              </p>
                            )}
                          </div>

                          {/* AI Summary preview */}
                          {req.aiAnalysis?.summary && (
                            <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-2">
                              {req.aiAnalysis.summary}
                            </p>
                          )}

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                            <span className="text-[10px] text-zinc-600">{timeAgo(req.createdAt)}</span>
                            {req.aiAnalysis && (
                              <span className="text-[10px] text-amber-500/70 font-medium flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                AI Analyzed
                              </span>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* ── Slide-over Detail Panel ── */}
      {selectedReq && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity"
            onClick={() => setSelectedReq(null)}
          />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-[#0c0c0e] border-l border-zinc-800 z-50 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Panel header */}
            <div className="sticky top-0 bg-[#0c0c0e]/90 backdrop-blur-xl border-b border-zinc-800 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-zinc-100 truncate pr-4">Request Details</h2>
              <button
                onClick={() => setSelectedReq(null)}
                className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Title + badges */}
              <div>
                <h3 className="text-xl font-bold text-white mb-3">{selectedReq.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${PRIORITY_STYLE[selectedReq.priority]}`}>
                    {selectedReq.priority}
                  </span>
                  <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                    {selectedReq.category}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_BADGE[selectedReq.status] || ''}`}>
                    {selectedReq.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3">
                {selectedReq.location && (
                  <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Location</p>
                    <p className="text-sm text-zinc-200">{selectedReq.location}</p>
                  </div>
                )}
                {selectedReq.tenantName && (
                  <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Tenant</p>
                    <p className="text-sm text-zinc-200">
                      {selectedReq.tenantName}{selectedReq.tenantUnit ? ` · Unit ${selectedReq.tenantUnit}` : ''}
                    </p>
                  </div>
                )}
                <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Submitted</p>
                  <p className="text-sm text-zinc-200">{timeAgo(selectedReq.createdAt)}</p>
                </div>
                <div className="rounded-lg bg-zinc-900/50 border border-zinc-800 p-3">
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">Last Updated</p>
                  <p className="text-sm text-zinc-200">{timeAgo(selectedReq.updatedAt)}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-4">
                  {selectedReq.description}
                </p>
              </div>

              {/* AI Analysis */}
              {selectedReq.aiAnalysis && (
                <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h4 className="text-sm font-bold text-amber-400">AI Analysis</h4>
                    {selectedReq.aiAnalysis.confidence != null && (
                      <span className="ml-auto text-xs text-amber-500/60 font-medium">
                        {Math.round(selectedReq.aiAnalysis.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 mb-1 font-medium">Summary</p>
                    <p className="text-sm text-zinc-300 leading-relaxed">{selectedReq.aiAnalysis.summary}</p>
                  </div>

                  {selectedReq.aiAnalysis.reasoning && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-1 font-medium">Reasoning</p>
                      <p className="text-sm text-zinc-400 leading-relaxed">{selectedReq.aiAnalysis.reasoning}</p>
                    </div>
                  )}

                  {selectedReq.aiAnalysis.resolutionSteps?.length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-2 font-medium">Resolution Steps</p>
                      <ol className="space-y-2">
                        {selectedReq.aiAnalysis.resolutionSteps.map((step: string, i: number) => (
                          <li key={i} className="flex gap-2.5 text-sm">
                            <span className="flex-shrink-0 w-5 h-5 rounded bg-amber-500/10 text-amber-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-zinc-300 leading-snug">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {selectedReq.aiAnalysis.estimatedTime && (
                    <div className="flex items-center gap-1.5 pt-1 border-t border-amber-500/10">
                      <svg className="w-3.5 h-3.5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-zinc-500">Estimated: {selectedReq.aiAnalysis.estimatedTime}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Status update actions */}
              <div className="rounded-xl bg-zinc-900/50 border border-zinc-800 p-5">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Update Status</h4>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${STATUS_BADGE[selectedReq.status] || 'bg-zinc-800 text-zinc-400'}`}>
                    {selectedReq.status.replace('_', ' ')}
                  </span>

                  {selectedReq.status === 'ASSIGNED' && (
                    <>
                      <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <button
                        disabled={updatingId === selectedReq.id}
                        onClick={() => handleStatusUpdate(selectedReq.id, 'IN_PROGRESS')}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingId === selectedReq.id ? 'Updating...' : 'Start Work'}
                      </button>
                    </>
                  )}

                  {selectedReq.status === 'IN_PROGRESS' && (
                    <>
                      <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <button
                        disabled={updatingId === selectedReq.id}
                        onClick={() => handleStatusUpdate(selectedReq.id, 'COMPLETED')}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {updatingId === selectedReq.id ? 'Updating...' : 'Mark Complete'}
                      </button>
                    </>
                  )}

                  {selectedReq.status === 'COMPLETED' && (
                    <span className="flex items-center gap-1.5 text-sm text-emerald-400 font-medium">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
