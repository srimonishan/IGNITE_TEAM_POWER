'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { ServiceRequest, DashboardStats, Priority, Status, AppUser, UserRole } from '@/lib/types';

type Tab = 'dashboard' | 'users' | 'chat';

const PRIORITIES: Priority[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
const STATUSES: Status[] = ['NEW', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];

const PRIORITY_STYLE: Record<Priority, string> = {
  CRITICAL: 'bg-red-500/10 text-red-400 border border-red-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  LOW: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
};

const STATUS_COLOR: Record<Status, { text: string; dot: string }> = {
  NEW: { text: 'text-blue-400', dot: 'bg-blue-500' },
  ASSIGNED: { text: 'text-violet-400', dot: 'bg-violet-500' },
  IN_PROGRESS: { text: 'text-amber-400', dot: 'bg-amber-500' },
  COMPLETED: { text: 'text-emerald-400', dot: 'bg-emerald-500' },
};

const STATUS_LABEL: Record<Status, string> = {
  NEW: 'New',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [adminUser, setAdminUser] = useState<AppUser | null>(null);
  const [tab, setTab] = useState<Tab>('dashboard');

  // Dashboard state
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'ALL'>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Users state
  const [users, setUsers] = useState<AppUser[]>([]);
  const [staffMembers, setStaffMembers] = useState<AppUser[]>([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'tenant' as UserRole, unit: '', specialization: '' });
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: 'Hello! I\'m your ResolveHQ AI assistant. I can help you analyze maintenance trends, suggest optimizations, and answer questions about your property operations. What would you like to know?', timestamp: new Date().toISOString() },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auth guard
  useEffect(() => {
    const raw = localStorage.getItem('rhq-user');
    if (!raw) { router.push('/auth'); return; }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.role !== 'admin') { router.push('/auth'); return; }
      setAdminUser(parsed);
    } catch {
      router.push('/auth');
    }
    setMounted(true);
  }, [router]);

  const loadRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/requests');
      const data = await res.json();
      if (data.requests) setRequests(data.requests);
    } catch {}
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard');
      const data = await res.json();
      if (data.stats) setStats(data.stats);
    } catch {}
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch {}
  }, []);

  const loadStaff = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.users) setStaffMembers(data.users.filter((u: any) => u.role === 'staff'));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    loadRequests();
    loadStats();
    loadUsers();
    loadStaff();
    const interval = setInterval(() => {
      loadRequests();
      loadStats();
      loadStaff();
    }, 5000);
    return () => clearInterval(interval);
  }, [mounted, loadRequests, loadStats, loadUsers, loadStaff]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSignOut = async () => {
    try { await signOut(auth); } catch {}
    localStorage.removeItem('rhq-user');
    router.push('/auth');
  };

  const handleStatusUpdate = async (id: string, status: Status) => {
    try {
      await fetch('/api/requests', { method: 'GET' });
      const res = await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r));
      }
    } catch {
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r));
    }
    if (selectedRequest?.id === id) {
      setSelectedRequest((prev) => prev ? { ...prev, status, updatedAt: new Date().toISOString() } : prev);
    }
    loadRequests();
    loadStats();
  };

  const handleAssign = async (id: string, team: string, staffUid?: string) => {
    try {
      await fetch(`/api/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedTo: team, assignedToUid: staffUid || '', status: 'ASSIGNED' }),
      });
    } catch {
      setRequests((prev) => prev.map((r) => r.id === id ? { ...r, assignedTo: team, assignedToUid: staffUid || '', status: 'ASSIGNED' as Status, updatedAt: new Date().toISOString() } : r));
    }
    if (selectedRequest?.id === id) {
      setSelectedRequest((prev) => prev ? { ...prev, assignedTo: team, assignedToUid: staffUid || '', status: 'ASSIGNED' as Status } : prev);
    }
    loadRequests();
    loadStats();
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      setUserError('Name, email, and password are required');
      return;
    }
    if (newUser.password.length < 6) {
      setUserError('Password must be at least 6 characters');
      return;
    }
    setUserLoading(true);
    setUserError('');

    const adminRaw = localStorage.getItem('rhq-user');
    let adminEmail = '';
    let adminPassword = '';
    try {
      const currentUser = auth.currentUser;
      adminEmail = currentUser?.email || '';
    } catch {}

    try {
      const result = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
      const uid = result.user.uid;

      // Re-authenticate as admin — prompt is stored from current session
      if (adminRaw) {
        try {
          const adminData = JSON.parse(adminRaw);
          adminEmail = adminData.email || adminEmail;
        } catch {}
      }

      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          unit: newUser.role === 'tenant' ? newUser.unit : '',
          specialization: newUser.role === 'staff' ? newUser.specialization : '',
          createdBy: adminUser?.uid || '',
        }),
      });

      // Sign admin back in — we need to store admin password for re-auth
      // Since we can't retrieve the password, we sign back in using the admin's stored session
      // The admin will need to provide password or use token refresh
      // For now, Firebase should maintain the admin session via persistence
      // But createUserWithEmailAndPassword signs in as the new user, so we attempt re-auth
      if (adminEmail && adminPassword) {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      }

      setNewUser({ name: '', email: '', password: '', role: 'tenant', unit: '', specialization: '' });
      setShowAddUser(false);
      loadUsers();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') setUserError('Email already in use');
      else setUserError(err.message || 'Failed to create user');
    } finally {
      setUserLoading(false);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/users?uid=${uid}`, { method: 'DELETE' });
      loadUsers();
    } catch {}
  };

  const handleChangeRole = async (uid: string, currentRole: UserRole) => {
    const newRole: UserRole = currentRole === 'admin' ? 'tenant' : 'admin';
    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, role: newRole }),
      });
      loadUsers();
    } catch {}
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: chatInput.trim(), timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    const context = stats
      ? `Property overview: ${stats.total} total requests. By status: ${stats.byStatus.NEW} new, ${stats.byStatus.ASSIGNED} assigned, ${stats.byStatus.IN_PROGRESS} in progress, ${stats.byStatus.COMPLETED} completed. Critical issues: ${stats.criticalCount}. By priority: ${stats.byPriority.CRITICAL} critical, ${stats.byPriority.HIGH} high, ${stats.byPriority.MEDIUM} medium, ${stats.byPriority.LOW} low.`
      : 'No stats available yet.';

    try {
      const res = await fetch('/api/ai/admin-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg.content, context }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply || 'Sorry, I could not process that request.', timestamp: new Date().toISOString() }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Connection error. Please try again.', timestamp: new Date().toISOString() }]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleExportPDF = () => {
    const w = window.open('', '_blank');
    if (!w) return;

    const criticalReqs = requests.filter((r) => r.priority === 'CRITICAL');
    const statsTable = stats
      ? `<table style="width:100%;border-collapse:collapse;margin-bottom:24px">
          <tr style="background:#f1f5f9"><th style="padding:10px;border:1px solid #cbd5e1;text-align:left">Metric</th><th style="padding:10px;border:1px solid #cbd5e1;text-align:right">Count</th></tr>
          <tr><td style="padding:10px;border:1px solid #cbd5e1">Total Requests</td><td style="padding:10px;border:1px solid #cbd5e1;text-align:right">${stats.total}</td></tr>
          <tr><td style="padding:10px;border:1px solid #cbd5e1">New</td><td style="padding:10px;border:1px solid #cbd5e1;text-align:right">${stats.byStatus.NEW}</td></tr>
          <tr><td style="padding:10px;border:1px solid #cbd5e1">Assigned</td><td style="padding:10px;border:1px solid #cbd5e1;text-align:right">${stats.byStatus.ASSIGNED}</td></tr>
          <tr><td style="padding:10px;border:1px solid #cbd5e1">In Progress</td><td style="padding:10px;border:1px solid #cbd5e1;text-align:right">${stats.byStatus.IN_PROGRESS}</td></tr>
          <tr><td style="padding:10px;border:1px solid #cbd5e1">Completed</td><td style="padding:10px;border:1px solid #cbd5e1;text-align:right">${stats.byStatus.COMPLETED}</td></tr>
          <tr style="background:#fef2f2"><td style="padding:10px;border:1px solid #cbd5e1;font-weight:bold;color:#dc2626">Critical (Active)</td><td style="padding:10px;border:1px solid #cbd5e1;text-align:right;font-weight:bold;color:#dc2626">${stats.criticalCount}</td></tr>
        </table>`
      : '';

    const requestRows = requests
      .map(
        (r) =>
          `<tr>
            <td style="padding:8px;border:1px solid #cbd5e1;font-size:13px">${r.title}</td>
            <td style="padding:8px;border:1px solid #cbd5e1;font-size:13px">${r.priority}</td>
            <td style="padding:8px;border:1px solid #cbd5e1;font-size:13px">${r.status}</td>
            <td style="padding:8px;border:1px solid #cbd5e1;font-size:13px">${r.category}</td>
            <td style="padding:8px;border:1px solid #cbd5e1;font-size:13px">${r.location}</td>
            <td style="padding:8px;border:1px solid #cbd5e1;font-size:13px">${r.assignedTo || '—'}</td>
            <td style="padding:8px;border:1px solid #cbd5e1;font-size:13px">${new Date(r.createdAt).toLocaleDateString()}</td>
          </tr>`
      )
      .join('');

    const aiSections = requests
      .filter((r) => r.aiAnalysis)
      .slice(0, 20)
      .map(
        (r) =>
          `<div style="margin-bottom:16px;padding:12px;border:1px solid #e2e8f0;border-radius:8px">
            <h4 style="margin:0 0 6px;color:#4338ca">${r.title} (${r.priority})</h4>
            <p style="margin:0 0 4px;font-size:13px"><strong>Summary:</strong> ${r.aiAnalysis!.summary}</p>
            <p style="margin:0 0 4px;font-size:13px"><strong>Reasoning:</strong> ${r.aiAnalysis!.reasoning}</p>
            <p style="margin:0 0 4px;font-size:13px"><strong>Est. Time:</strong> ${r.aiAnalysis!.estimatedTime}</p>
            <p style="margin:0 0 4px;font-size:13px"><strong>Confidence:</strong> ${Math.round(r.aiAnalysis!.confidence * 100)}%</p>
            <p style="margin:0;font-size:13px"><strong>Steps:</strong> ${r.aiAnalysis!.resolutionSteps?.join('; ') || '—'}</p>
          </div>`
      )
      .join('');

    w.document.write(`<!DOCTYPE html><html><head><title>ResolveHQ Report — ${new Date().toLocaleDateString()}</title>
      <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:960px;margin:0 auto;padding:40px;color:#1e293b}
      h1{color:#4338ca}h2{color:#334155;border-bottom:2px solid #e2e8f0;padding-bottom:8px}
      @media print{body{padding:20px}}</style></head><body>
      <h1>ResolveHQ — Property Report</h1>
      <p style="color:#64748b">Generated on ${new Date().toLocaleString()} by ${adminUser?.name || 'Admin'}</p>
      <h2>Dashboard Statistics</h2>${statsTable}
      <h2>All Requests (${requests.length})</h2>
      <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
        <tr style="background:#f1f5f9">
          <th style="padding:8px;border:1px solid #cbd5e1;text-align:left;font-size:13px">Title</th>
          <th style="padding:8px;border:1px solid #cbd5e1;text-align:left;font-size:13px">Priority</th>
          <th style="padding:8px;border:1px solid #cbd5e1;text-align:left;font-size:13px">Status</th>
          <th style="padding:8px;border:1px solid #cbd5e1;text-align:left;font-size:13px">Category</th>
          <th style="padding:8px;border:1px solid #cbd5e1;text-align:left;font-size:13px">Location</th>
          <th style="padding:8px;border:1px solid #cbd5e1;text-align:left;font-size:13px">Assigned</th>
          <th style="padding:8px;border:1px solid #cbd5e1;text-align:left;font-size:13px">Date</th>
        </tr>
        ${requestRows}
      </table>
      ${aiSections ? `<h2>AI Analysis</h2>${aiSections}` : ''}
      </body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  const filteredRequests = priorityFilter === 'ALL' ? requests : requests.filter((r) => r.priority === priorityFilter);

  const kanbanColumns: { status: Status; items: ServiceRequest[] }[] = STATUSES.map((s) => ({
    status: s,
    items: filteredRequests.filter((r) => r.status === s),
  }));

  const criticalAlerts = requests.filter((r) => r.priority === 'CRITICAL' && r.status !== 'COMPLETED');

  if (!mounted) return <div className="min-h-screen bg-[#09090b]" />;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 border-b border-zinc-800/80 bg-[#09090b]/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">R</div>
              <span className="text-lg font-bold tracking-tight">ResolveHQ</span>
            </div>
            <div className="hidden sm:flex items-center bg-zinc-900 rounded-lg p-1 border border-zinc-800">
              {([['dashboard', 'Dashboard'], ['users', 'Users'], ['chat', 'AI Chat']] as [Tab, string][]).map(([t, label]) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    tab === t ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {tab === 'dashboard' && (
              <>
                <button onClick={handleExportPDF} className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Export PDF
                </button>
                <a href="/submit" className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  New Request
                </a>
              </>
            )}
            <div className="flex items-center gap-2 pl-3 border-l border-zinc-800">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                {adminUser?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="hidden md:block text-sm text-zinc-400">{adminUser?.name || 'Admin'}</span>
              <button onClick={handleSignOut} className="ml-1 p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition" title="Sign out">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile Tabs */}
        <div className="sm:hidden flex border-t border-zinc-800">
          {([['dashboard', 'Dashboard'], ['users', 'Users'], ['chat', 'AI Chat']] as [Tab, string][]).map(([t, label]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium text-center transition ${
                tab === t ? 'text-indigo-400 border-b-2 border-indigo-500' : 'text-zinc-500'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        {/* ─── TAB 1: DASHBOARD ─── */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Requests', value: stats?.total ?? 0, icon: '📋', accent: 'from-zinc-800 to-zinc-900' },
                { label: 'Critical', value: stats?.criticalCount ?? 0, icon: '🔴', accent: 'from-red-950/50 to-zinc-900' },
                { label: 'In Progress', value: stats?.byStatus.IN_PROGRESS ?? 0, icon: '⚡', accent: 'from-amber-950/30 to-zinc-900' },
                { label: 'Completed', value: stats?.byStatus.COMPLETED ?? 0, icon: '✅', accent: 'from-emerald-950/30 to-zinc-900' },
              ].map((s) => (
                <div key={s.label} className={`rounded-xl p-5 bg-gradient-to-br ${s.accent} border border-zinc-800/80`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">{s.label}</span>
                    <span className="text-lg">{s.icon}</span>
                  </div>
                  <p className="text-3xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Critical Alerts */}
            {criticalAlerts.length > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                  <span className="text-sm font-semibold text-red-400">{criticalAlerts.length} Critical Alert{criticalAlerts.length > 1 ? 's' : ''}</span>
                </div>
                <div className="space-y-2">
                  {criticalAlerts.slice(0, 3).map((a) => (
                    <button
                      key={a.id}
                      onClick={() => { setSelectedRequest(a); setDetailOpen(true); }}
                      className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/15 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-red-300">{a.title}</span>
                        <span className="text-xs text-red-400/60">{a.location}</span>
                      </div>
                      <span className="text-xs text-red-400/50">{timeAgo(a.createdAt)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Priority Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-zinc-500 font-medium mr-1">Filter:</span>
              <button
                onClick={() => setPriorityFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  priorityFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                }`}
              >
                All ({requests.length})
              </button>
              {PRIORITIES.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    priorityFilter === p ? PRIORITY_STYLE[p] : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {p} ({requests.filter((r) => r.priority === p).length})
                </button>
              ))}
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {kanbanColumns.map((col) => (
                <div key={col.status} className="rounded-xl border border-zinc-800/80 bg-zinc-900/30">
                  <div className="p-4 border-b border-zinc-800/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLOR[col.status].dot}`} />
                      <span className={`text-sm font-semibold ${STATUS_COLOR[col.status].text}`}>{STATUS_LABEL[col.status]}</span>
                    </div>
                    <span className="text-xs text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">{col.items.length}</span>
                  </div>
                  <div className="p-3 space-y-3 max-h-[600px] overflow-y-auto">
                    {col.items.length === 0 ? (
                      <p className="text-center text-xs text-zinc-600 py-8">No requests</p>
                    ) : (
                      col.items.map((req) => (
                        <button
                          key={req.id}
                          onClick={() => { setSelectedRequest(req); setDetailOpen(true); }}
                          className="w-full text-left rounded-lg border border-zinc-800 bg-zinc-900/80 hover:border-zinc-700 hover:bg-zinc-900 p-3.5 transition group"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_STYLE[req.priority]}`}>{req.priority}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{req.category}</span>
                          </div>
                          <h4 className="text-sm font-medium text-zinc-200 group-hover:text-white mb-1 line-clamp-2">{req.title}</h4>
                          {req.aiAnalysis?.summary && (
                            <p className="text-xs text-zinc-500 line-clamp-2 mb-2">{req.aiAnalysis.summary}</p>
                          )}
                          <div className="flex items-center justify-between text-[11px] text-zinc-600">
                            <span className="flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              {req.location}
                            </span>
                            <span>{timeAgo(req.createdAt)}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 2: USERS ─── */}
        {tab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">User Management</h2>
                <p className="text-sm text-zinc-500">{users.length} registered users</p>
              </div>
              <button
                onClick={() => setShowAddUser(!showAddUser)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/20"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Add User
              </button>
            </div>

            {/* Add User Form */}
            {showAddUser && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
                <h3 className="text-base font-semibold mb-4">Create New User</h3>
                {userError && <div className="mb-4 px-4 py-2.5 rounded-lg text-sm bg-red-500/10 text-red-400 border border-red-500/20">{userError}</div>}
                <form onSubmit={handleAddUser} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Email</label>
                    <input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="user@email.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Password (min 6)</label>
                    <input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1.5">Role</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                      className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-indigo-500/50 text-sm"
                    >
                      <option value="tenant">Tenant</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  {newUser.role === 'staff' && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Specialization</label>
                      <select
                        value={newUser.specialization}
                        onChange={(e) => setNewUser({ ...newUser, specialization: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-indigo-500/50 text-sm"
                      >
                        <option value="">Select specialization</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Plumber">Plumber</option>
                        <option value="HVAC Technician">HVAC Technician</option>
                        <option value="General Maintenance">General Maintenance</option>
                        <option value="Security">Security</option>
                        <option value="Cleaning">Cleaning</option>
                        <option value="Elevator Technician">Elevator Technician</option>
                      </select>
                    </div>
                  )}
                  {newUser.role === 'tenant' && (
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Unit</label>
                      <input
                        type="text"
                        value={newUser.unit}
                        onChange={(e) => setNewUser({ ...newUser, unit: e.target.value })}
                        placeholder="e.g. A-301"
                        className="w-full px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm"
                      />
                    </div>
                  )}
                  <div className="flex items-end gap-3">
                    <button
                      type="submit"
                      disabled={userLoading}
                      className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium transition disabled:opacity-50"
                    >
                      {userLoading ? 'Creating...' : 'Create User'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowAddUser(false); setUserError(''); }}
                      className="px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Users Table */}
            <div className="rounded-xl border border-zinc-800/80 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3.5">User</th>
                      <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3.5">Role</th>
                      <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3.5 hidden md:table-cell">Unit</th>
                      <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3.5 hidden lg:table-cell">Created</th>
                      <th className="text-right text-xs font-medium text-zinc-500 uppercase tracking-wider px-5 py-3.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {users.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-sm text-zinc-600">No users found</td></tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.uid} className="hover:bg-zinc-900/30 transition">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-zinc-300">
                                {u.name?.[0]?.toUpperCase() || '?'}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-zinc-200">{u.name}</p>
                                <p className="text-xs text-zinc-500">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                              u.role === 'admin'
                                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                : u.role === 'staff'
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}>
                              {u.role}
                            </span>
                            {u.role === 'staff' && u.specialization && (
                              <span className="ml-2 text-[10px] text-zinc-500">{u.specialization}</span>
                            )}
                          </td>
                          <td className="px-5 py-4 hidden md:table-cell">
                            <span className="text-sm text-zinc-400">{u.unit || '—'}</span>
                          </td>
                          <td className="px-5 py-4 hidden lg:table-cell">
                            <span className="text-sm text-zinc-500">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleChangeRole(u.uid, u.role)}
                                className="px-3 py-1.5 text-xs font-medium rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
                                title={`Switch to ${u.role === 'admin' ? 'tenant' : 'admin'}`}
                              >
                                {u.role === 'admin' ? '→ Tenant' : '→ Admin'}
                              </button>
                              {u.uid !== adminUser?.uid && (
                                <button
                                  onClick={() => handleDeleteUser(u.uid)}
                                  className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition"
                                  title="Delete user"
                                >
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 3: AI CHAT ─── */}
        {tab === 'chat' && (
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 flex flex-col" style={{ height: 'calc(100vh - 140px)' }}>
              {/* Chat Header */}
              <div className="p-4 border-b border-zinc-800/50 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                  <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                </div>
                <div>
                  <h3 className="text-sm font-semibold">ResolveHQ AI Assistant</h3>
                  <p className="text-xs text-zinc-500">Ask about property trends, maintenance insights, and recommendations</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-zinc-800 border border-zinc-700/50 text-zinc-200'
                    }`}>
                      <div className="text-sm whitespace-pre-wrap leading-relaxed">
                        {msg.role === 'assistant' ? (
                          msg.content.split('\n').map((line, li) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <p key={li} className="font-semibold text-white mt-2 mb-1">{line.replace(/\*\*/g, '')}</p>;
                            }
                            if (line.startsWith('- ') || line.startsWith('• ')) {
                              return <p key={li} className="ml-3 before:content-['•'] before:mr-2 before:text-indigo-400">{line.replace(/^[-•]\s*/, '')}</p>;
                            }
                            if (line.startsWith('```')) return null;
                            if (line.trim() === '') return <br key={li} />;
                            return <p key={li}>{line}</p>;
                          })
                        ) : (
                          msg.content
                        )}
                      </div>
                      <p className={`text-[10px] mt-1.5 ${msg.role === 'user' ? 'text-indigo-200/60' : 'text-zinc-500'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-zinc-800 border border-zinc-700/50 rounded-xl px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-zinc-800/50">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleSendChat(); }}
                  className="flex items-center gap-3"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about maintenance trends, resource planning..."
                    className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm"
                    disabled={chatLoading}
                  />
                  <button
                    type="submit"
                    disabled={chatLoading || !chatInput.trim()}
                    className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-40 disabled:hover:bg-indigo-600"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─── DETAIL SLIDE-OVER PANEL ─── */}
      {detailOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setDetailOpen(false)} />
          <div className="relative w-full max-w-lg bg-[#0c0c0f] border-l border-zinc-800 overflow-y-auto animate-slide-in">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#0c0c0f]/90 backdrop-blur-xl border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold truncate pr-4">Request Details</h2>
              <button onClick={() => setDetailOpen(false)} className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="px-6 py-5 space-y-6">
              {/* Title & Badges */}
              <div>
                <h3 className="text-lg font-bold mb-3">{selectedRequest.title}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PRIORITY_STYLE[selectedRequest.priority]}`}>{selectedRequest.priority}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full bg-zinc-800 ${STATUS_COLOR[selectedRequest.status].text}`}>
                    {STATUS_LABEL[selectedRequest.status]}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400">{selectedRequest.category}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">Description</h4>
                <p className="text-sm text-zinc-300 leading-relaxed">{selectedRequest.description}</p>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Location</h4>
                  <p className="text-sm text-zinc-300">{selectedRequest.location}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Created</h4>
                  <p className="text-sm text-zinc-300">{new Date(selectedRequest.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Assigned To</h4>
                  <p className="text-sm text-zinc-300">{selectedRequest.assignedTo || 'Unassigned'}</p>
                </div>
                {selectedRequest.tenantName && (
                  <div>
                    <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Tenant</h4>
                    <p className="text-sm text-zinc-300">{selectedRequest.tenantName} {selectedRequest.tenantUnit ? `(${selectedRequest.tenantUnit})` : ''}</p>
                  </div>
                )}
              </div>

              {/* AI Analysis */}
              {selectedRequest.aiAnalysis && (
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                    <h4 className="text-sm font-semibold text-indigo-400">AI Analysis</h4>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Summary</p>
                    <p className="text-sm text-zinc-300">{selectedRequest.aiAnalysis.summary}</p>
                  </div>

                  <div>
                    <p className="text-xs text-zinc-500 mb-1">Reasoning</p>
                    <p className="text-sm text-zinc-300">{selectedRequest.aiAnalysis.reasoning}</p>
                  </div>

                  {selectedRequest.aiAnalysis.resolutionSteps?.length > 0 && (
                    <div>
                      <p className="text-xs text-zinc-500 mb-2">Resolution Steps</p>
                      <ol className="space-y-1.5">
                        {selectedRequest.aiAnalysis.resolutionSteps.map((step, i) => (
                          <li key={i} className="flex gap-2 text-sm text-zinc-300">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs flex items-center justify-center font-bold">{i + 1}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Est. Time</p>
                      <p className="text-sm font-medium text-zinc-300">{selectedRequest.aiAnalysis.estimatedTime}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 mb-1">Confidence</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
                            style={{ width: `${Math.round(selectedRequest.aiAnalysis.confidence * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-indigo-400">{Math.round(selectedRequest.aiAnalysis.confidence * 100)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Status Actions */}
              <div>
                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Update Status</h4>
                <div className="flex flex-wrap gap-2">
                  {STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusUpdate(selectedRequest.id, s)}
                      disabled={selectedRequest.status === s}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selectedRequest.status === s
                          ? `${STATUS_COLOR[s].text} bg-zinc-800 opacity-60 cursor-default`
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {STATUS_LABEL[s]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assign to Staff */}
              <div>
                <h4 className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">Assign to Staff</h4>
                {staffMembers.length === 0 ? (
                  <p className="text-xs text-zinc-600">No staff members registered yet.</p>
                ) : (
                  <div className="space-y-2">
                    {staffMembers.map((staff) => (
                      <button
                        key={staff.uid}
                        onClick={() => handleAssign(selectedRequest.id, `${staff.name} (${staff.specialization || 'General'})`, staff.uid)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${
                          selectedRequest.assignedToUid === staff.uid
                            ? 'bg-indigo-600/20 border border-indigo-500/30'
                            : 'bg-zinc-800/50 hover:bg-zinc-800 border border-transparent'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold flex-shrink-0">
                          {staff.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{staff.name}</p>
                          <p className="text-[10px] text-zinc-500">{staff.specialization || 'General Maintenance'}</p>
                        </div>
                        {selectedRequest.assignedToUid === staff.uid && (
                          <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .animate-slide-in {
          animation: slideIn 0.25s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
