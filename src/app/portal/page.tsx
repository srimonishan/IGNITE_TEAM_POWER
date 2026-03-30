'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { ServiceRequest, AIAnalysis, Priority, Status } from '@/lib/types';

interface StoredUser {
  uid: string;
  name: string;
  email: string;
  role: string;
  unit?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  extracted?: { title: string; description: string; location: string };
  analysis?: AIAnalysis;
  requestCreated?: boolean;
}

const PRIORITY_STYLES: Record<Priority, string> = {
  CRITICAL: 'bg-red-500/10 text-red-400 border border-red-500/20',
  HIGH: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  MEDIUM: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  LOW: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
};

const STATUS_STYLES: Record<Status, string> = {
  NEW: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  ASSIGNED: 'bg-violet-500/10 text-violet-400 border border-violet-500/20',
  IN_PROGRESS: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
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

function ShimmerLine({ width }: { width: string }) {
  return (
    <div
      className={`h-3 rounded-full bg-zinc-700/50 ${width}`}
      style={{
        background: 'linear-gradient(90deg, rgba(63,63,70,0.3) 25%, rgba(82,82,91,0.5) 50%, rgba(63,63,70,0.3) 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
      }}
    />
  );
}

function AnalysisPanel({
  analysis,
  loading,
  isCritical,
}: {
  analysis: AIAnalysis | null;
  loading: boolean;
  isCritical: boolean;
}) {
  if (!loading && !analysis) return null;

  return (
    <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-5">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <h3 className="text-sm font-semibold text-zinc-200">AI Analysis</h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          {['Classifying category...', 'Predicting priority...', 'Generating resolution...'].map((label) => (
            <div key={label} className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-zinc-400">{label}</span>
              </div>
              <ShimmerLine width="w-3/4" />
            </div>
          ))}
          <style jsx>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        </div>
      ) : analysis ? (
        <div className="space-y-4">
          {isCritical && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
              <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-xs font-semibold text-red-400">CRITICAL PRIORITY — Immediate attention required</span>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${PRIORITY_STYLES[analysis.predictedPriority]}`}>
              {analysis.predictedPriority}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {analysis.predictedCategory}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
              {Math.round(analysis.confidence * 100)}% confidence
            </span>
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-400 mb-1">Summary</p>
            <p className="text-sm text-zinc-200 leading-relaxed">{analysis.summary}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-400 mb-1">Reasoning</p>
            <p className="text-sm text-zinc-400 leading-relaxed">{analysis.reasoning}</p>
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-400 mb-2">Resolution Steps</p>
            <ol className="space-y-1.5">
              {analysis.resolutionSteps.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-zinc-300">
                  <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <svg className="w-4 h-4 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs text-zinc-400">Estimated: {analysis.estimatedTime}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function TenantPortal() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState('dark');
  const [user, setUser] = useState<StoredUser | null>(null);
  const [activeTab, setActiveTab] = useState<'submit' | 'requests'>('submit');
  const [submitMode, setSubmitMode] = useState<'form' | 'chat'>('form');

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formAnalysis, setFormAnalysis] = useState<AIAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Requests state
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const t = localStorage.getItem('rhq-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', t);
    setTheme(t);
    const stored = localStorage.getItem('rhq-user');
    if (!stored) {
      router.push('/auth');
      return;
    }
    try {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setLocation(parsed.unit || '');
    } catch {
      router.push('/auth');
    }
  }, [router]);

  const fetchRequests = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingRequests(true);
      const res = await fetch(`/api/requests?tenantUid=${user.uid}`);
      const data = await res.json();
      if (data.requests) {
        const sorted = [...data.requests].sort(
          (a: ServiceRequest, b: ServiceRequest) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRequests(sorted);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingRequests(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'requests' && user) {
      fetchRequests();
      const interval = setInterval(fetchRequests, 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, user, fetchRequests]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
    localStorage.removeItem('rhq-user');
    router.push('/');
  };

  const handleExportPDF = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    const requestRows = requests.map((req) => {
      const date = new Date(req.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      let row = `<tr>
        <td>${req.title}</td>
        <td>${req.category}</td>
        <td><span class="priority-${req.priority.toLowerCase()}">${req.priority}</span></td>
        <td><span class="status-${req.status.toLowerCase().replace('_', '-')}">${req.status.replace('_', ' ')}</span></td>
        <td>${req.location}</td>
        <td>${date}</td>
      </tr>`;
      if (req.aiAnalysis) {
        const steps = req.aiAnalysis.resolutionSteps?.map((s, i) => `<li>${i + 1}. ${s}</li>`).join('') || '';
        row += `<tr class="ai-row"><td colspan="6">
          <div class="ai-block">
            <strong>AI Summary:</strong> ${req.aiAnalysis.summary || 'N/A'}
            ${steps ? `<div class="steps"><strong>Resolution Steps:</strong><ul>${steps}</ul></div>` : ''}
          </div>
        </td></tr>`;
      }
      return row;
    }).join('');

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ResolveHQ Report</title><style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a2e; padding: 40px; }
      .header { border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 24px; }
      .header h1 { font-size: 22px; color: #4f46e5; margin-bottom: 6px; }
      .meta { font-size: 12px; color: #666; line-height: 1.8; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 12px; }
      th { background: #4f46e5; color: #fff; padding: 10px 12px; text-align: left; font-weight: 600; }
      td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; vertical-align: top; }
      tr:nth-child(even):not(.ai-row) { background: #f9fafb; }
      .ai-row td { background: #f0f0ff; padding: 8px 12px; }
      .ai-block { font-size: 11px; line-height: 1.6; color: #444; }
      .ai-block .steps { margin-top: 6px; }
      .ai-block ul { list-style: none; padding: 0; margin: 4px 0 0 0; }
      .ai-block li { padding: 2px 0; }
      .priority-critical { color: #dc2626; font-weight: 700; }
      .priority-high { color: #ea580c; font-weight: 600; }
      .priority-medium { color: #ca8a04; font-weight: 600; }
      .priority-low { color: #16a34a; font-weight: 600; }
      .status-new { color: #2563eb; } .status-assigned { color: #7c3aed; }
      .status-in-progress { color: #d97706; } .status-completed { color: #16a34a; }
      .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #aaa; text-align: center; }
      @media print { body { padding: 20px; } }
    </style></head><body>
      <div class="header">
        <h1>ResolveHQ &mdash; My Service Requests Report</h1>
        <div class="meta">
          <div><strong>Tenant:</strong> ${user?.name || 'N/A'}</div>
          <div><strong>Unit:</strong> ${user?.unit || 'N/A'}</div>
          <div><strong>Email:</strong> ${user?.email || 'N/A'}</div>
          <div><strong>Generated:</strong> ${dateStr}</div>
        </div>
      </div>
      <table>
        <thead><tr><th>Title</th><th>Category</th><th>Priority</th><th>Status</th><th>Location</th><th>Date</th></tr></thead>
        <tbody>${requestRows || '<tr><td colspan="6" style="text-align:center;padding:24px;color:#999;">No requests found</td></tr>'}</tbody>
      </table>
      <div class="footer">Generated by ResolveHQ on ${dateStr}</div>
    </body></html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.onload = () => printWindow.print();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !user) return;

    setSubmitting(true);
    setAnalyzing(true);
    setFormAnalysis(null);
    setFormSuccess(false);

    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          tenantUid: user.uid,
          tenantName: user.name,
          tenantUnit: user.unit,
        }),
      });

      const data = await res.json();
      if (res.ok && data.request?.aiAnalysis) {
        setFormAnalysis(data.request.aiAnalysis);
        setFormSuccess(true);
        setTitle('');
        setDescription('');
        setLocation(user.unit || '');
      }
    } catch {
      // handle silently
    } finally {
      setSubmitting(false);
      setAnalyzing(false);
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !user || chatSending) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: chatInput.trim(),
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setChatSending(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          tenantUid: user.uid,
          tenantName: user.name,
          tenantUnit: user.unit,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.analysis?.summary || 'Your request has been processed.',
        extracted: data.extracted,
        analysis: data.analysis,
        requestCreated: !!data.request,
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: 'assistant', content: 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setChatSending(false);
    }
  };

  if (!mounted || !user) {
    return <div className="min-h-screen bg-[#09090b]" />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-[#09090b]/80 backdrop-blur-xl border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">R</div>
              <span className="text-lg font-bold tracking-tight hidden sm:block">ResolveHQ</span>
            </div>

            <div className="flex items-center bg-zinc-900 rounded-xl p-1 border border-zinc-800">
              <button
                onClick={() => setActiveTab('submit')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'submit'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Submit Request
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                  activeTab === 'requests'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                My Requests
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-zinc-300 font-medium">{user.name}</span>
              {user.unit && (
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold">
                  {user.unit}
                </span>
              )}
            </div>
            <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              Export PDF
            </button>
            <button onClick={() => { const next = theme === 'dark' ? 'light' : 'dark'; setTheme(next); localStorage.setItem('rhq-theme', next); document.documentElement.setAttribute('data-theme', next); }} className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition" aria-label="Toggle theme">
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              ) : (
                <svg className="w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              )}
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/5 border border-zinc-800 hover:border-red-500/20 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ==================== TAB: SUBMIT REQUEST ==================== */}
        {activeTab === 'submit' && (
          <div>
            {/* Mode toggle */}
            <div className="flex items-center gap-3 mb-6">
              <h1 className="text-2xl font-bold">Submit a Request</h1>
              <div className="flex items-center bg-zinc-900 rounded-xl p-1 border border-zinc-800 ml-auto">
                <button
                  onClick={() => setSubmitMode('form')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    submitMode === 'form'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Form
                </button>
                <button
                  onClick={() => setSubmitMode('chat')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    submitMode === 'chat'
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  AI Chat
                </button>
              </div>
            </div>

            {/* ======= FORM MODE ======= */}
            {submitMode === 'form' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <form onSubmit={handleFormSubmit} className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-6 space-y-5">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Title</label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g. Water leak in bathroom"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Description</label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe the issue in detail..."
                        required
                        rows={5}
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm transition resize-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1.5">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Unit A-301, Bathroom"
                        className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm transition"
                      />
                    </div>

                <div className="mt-4">
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Select Building</label>
                  <div className="grid grid-cols-5 gap-2">
                    {['A', 'B', 'C', 'D', 'E'].map(b => (
                      <button key={b} type="button" onClick={() => { const unit = user?.unit || ''; setLocation(`Block ${b}${unit ? `, ${unit}` : ''}`); }} className={`p-3 rounded-xl text-center transition ${location.startsWith(`Block ${b}`) ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-400' : 'bg-zinc-900 border border-zinc-800 text-zinc-500 hover:border-zinc-700'}`}>
                        <div className="text-lg font-bold">{b}</div>
                        <div className="text-[9px]">Block {b}</div>
                      </button>
                    ))}
                  </div>
                </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                      <svg className="w-4 h-4 text-indigo-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-xs text-indigo-300/70">Category and priority auto-detected by AI</span>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || !title.trim() || !description.trim()}
                      className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Analyzing & Submitting...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          Submit Request
                        </>
                      )}
                    </button>
                  </form>

                  {formSuccess && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-emerald-300 font-medium">Request submitted successfully!</span>
                    </div>
                  )}
                </div>

                <AnalysisPanel
                  analysis={formAnalysis}
                  loading={analyzing}
                  isCritical={formAnalysis?.predictedPriority === 'CRITICAL'}
                />
              </div>
            )}

            {/* ======= AI CHAT MODE ======= */}
            {submitMode === 'chat' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col" style={{ height: 'calc(100vh - 220px)', minHeight: '480px' }}>
                  {/* Chat messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.length === 0 && (
                      <div className="flex flex-col items-center justify-center h-full text-center px-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                          <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <h3 className="text-sm font-semibold text-zinc-200 mb-1">Describe your issue</h3>
                        <p className="text-xs text-zinc-500 max-w-xs">
                          Tell me what&apos;s wrong in plain language. AI will extract the details, classify it, and create a request automatically.
                        </p>
                      </div>
                    )}

                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                          }`}
                        >
                          <p>{msg.content}</p>

                          {msg.role === 'assistant' && msg.extracted && (
                            <div className="mt-3 pt-3 border-t border-zinc-600/50 space-y-2">
                              <p className="text-xs font-semibold text-zinc-400">Extracted Request:</p>
                              <div className="text-xs space-y-1 text-zinc-300">
                                <p><span className="text-zinc-500">Title:</span> {msg.extracted.title}</p>
                                <p><span className="text-zinc-500">Location:</span> {msg.extracted.location}</p>
                              </div>
                            </div>
                          )}

                          {msg.role === 'assistant' && msg.analysis && (
                            <div className="mt-3 pt-3 border-t border-zinc-600/50 space-y-2">
                              <div className="flex flex-wrap gap-1.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${PRIORITY_STYLES[msg.analysis.predictedPriority]}`}>
                                  {msg.analysis.predictedPriority}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                  {msg.analysis.predictedCategory}
                                </span>
                              </div>
                            </div>
                          )}

                          {msg.requestCreated && (
                            <div className="mt-3 pt-3 border-t border-zinc-600/50">
                              <div className="flex items-center gap-1.5 text-emerald-400">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-xs font-semibold">Request created</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {chatSending && (
                      <div className="flex justify-start">
                        <div className="bg-zinc-800 rounded-2xl px-4 py-3 border border-zinc-700">
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs text-zinc-400">Analyzing your issue...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Chat input */}
                  <div className="p-4 border-t border-zinc-800">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleChatSend();
                          }
                        }}
                        placeholder="Describe your issue in plain English..."
                        disabled={chatSending}
                        className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 text-sm transition disabled:opacity-50"
                      />
                      <button
                        onClick={handleChatSend}
                        disabled={!chatInput.trim() || chatSending}
                        className="px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Show analysis of last assistant message */}
                {chatMessages.filter((m) => m.role === 'assistant' && m.analysis).length > 0 && (
                  <AnalysisPanel
                    analysis={
                      [...chatMessages]
                        .reverse()
                        .find((m) => m.role === 'assistant' && m.analysis)?.analysis || null
                    }
                    loading={chatSending}
                    isCritical={
                      [...chatMessages]
                        .reverse()
                        .find((m) => m.role === 'assistant' && m.analysis)
                        ?.analysis?.predictedPriority === 'CRITICAL'
                    }
                  />
                )}

                {chatMessages.filter((m) => m.role === 'assistant' && m.analysis).length === 0 && chatSending && (
                  <AnalysisPanel analysis={null} loading={true} isCritical={false} />
                )}
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB: MY REQUESTS ==================== */}
        {activeTab === 'requests' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">My Requests</h1>
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Auto-refreshing
              </div>
            </div>

            {loadingRequests && requests.length === 0 ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-2xl bg-zinc-900/50 border border-zinc-800 p-5 animate-pulse">
                    <div className="flex gap-3 mb-3">
                      <div className="h-5 w-16 rounded bg-zinc-800" />
                      <div className="h-5 w-20 rounded bg-zinc-800" />
                    </div>
                    <div className="h-4 w-3/4 rounded bg-zinc-800 mb-2" />
                    <div className="h-3 w-1/2 rounded bg-zinc-800" />
                  </div>
                ))}
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
                  <svg className="w-8 h-8 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-sm text-zinc-400 mb-1">No requests yet.</p>
                <p className="text-xs text-zinc-600">Submit your first request above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                  >
                    <div className="p-5">
                      <div className="flex flex-wrap items-center gap-2 mb-2.5">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${PRIORITY_STYLES[req.priority]}`}>
                          {req.priority}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase ${STATUS_STYLES[req.status]}`}>
                          {req.status.replace('_', ' ')}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
                          {req.category}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{req.title}</h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {req.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {timeAgo(req.createdAt)}
                        </span>
                      </div>

                      {req.aiAnalysis?.summary && (
                        <p className="mt-2.5 text-xs text-zinc-400 leading-relaxed line-clamp-2">
                          {req.aiAnalysis.summary}
                        </p>
                      )}

                      <div className="mt-3 flex items-center gap-1 text-[10px] text-zinc-600">
                        <svg
                          className={`w-3 h-3 transition-transform ${expandedId === req.id ? 'rotate-180' : ''}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        {expandedId === req.id ? 'Hide' : 'Show'} AI analysis
                      </div>
                    </div>

                    {expandedId === req.id && req.aiAnalysis && (
                      <div className="border-t border-zinc-800 px-5 pb-5 pt-4">
                        <AnalysisPanel
                          analysis={req.aiAnalysis}
                          loading={false}
                          isCritical={req.aiAnalysis.predictedPriority === 'CRITICAL'}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

              {/* Hotline Contacts */}
              <div className="mt-8 card p-5">
                <h3 className="text-sm font-semibold mb-4">Emergency Hotline Contacts</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { name: 'Emergency Services', number: '911', desc: 'Fire, medical, police' },
                    { name: 'Building Management', number: '(555) 100-2000', desc: '24/7 property office' },
                    { name: 'Maintenance Hotline', number: '(555) 100-2001', desc: 'Urgent repairs' },
                    { name: 'Security Desk', number: '(555) 100-2002', desc: 'Security concerns' },
                    { name: 'Water Emergency', number: '(555) 100-2003', desc: 'Flooding, pipe burst' },
                    { name: 'Elevator Emergency', number: '(555) 100-2004', desc: 'Stuck elevator' },
                  ].map(h => (
                    <div key={h.name} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold">{h.name}</p>
                        <p className="text-[11px] text-indigo-400 font-medium">{h.number}</p>
                        <p className="text-[10px] text-zinc-600">{h.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
          </div>
        )}
      </main>
    </div>
  );
}
