'use client';

import { useState, useMemo } from 'react';
import {
  Search, Filter, Clock, UserPlus, Pencil, Trash2, LogIn,
  CreditCard, FileText, Shield, Settings, ChevronLeft,
  ChevronRight, Download, Eye, XCircle, CheckCircle2, Home,
} from 'lucide-react';

type ActionCategory = 'auth' | 'user' | 'payment' | 'business' | 'property' | 'system';

interface AuditEntry {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  category: ActionCategory;
  target: string;
  details: string;
  ipAddress: string;
  status: 'Success' | 'Failed';
}

const mockAuditLog: AuditEntry[] = [
  { id: 'AUD-4821', timestamp: '2024-12-18 14:32:05', user: 'Kwame Asante', action: 'User Login', category: 'auth', target: 'k.asante@kma.gov.gh', details: 'Successful login from Chrome on Windows', ipAddress: '102.156.44.12', status: 'Success' },
  { id: 'AUD-4820', timestamp: '2024-12-18 14:28:41', user: 'Abena Mensah', action: 'Payment Recorded', category: 'payment', target: 'PAY-98234', details: 'Received GH₨ 2,400 from Royal Supermarket via Mobile Money', ipAddress: '102.156.44.18', status: 'Success' },
  { id: 'AUD-4819', timestamp: '2024-12-18 13:55:12', user: 'Akua Boateng', action: 'Audit Report Exported', category: 'system', target: 'RPT-AUDIT-Q4-2024', details: 'Exported Q4 2024 audit report as PDF', ipAddress: '102.156.44.25', status: 'Success' },
  { id: 'AUD-4818', timestamp: '2024-12-18 13:40:08', user: 'Kofi Boateng', action: 'Property Rate Updated', category: 'property', target: 'PROP-2024-0087', details: 'Updated annual rate for Suame Industrial plot', ipAddress: '102.156.44.31', status: 'Success' },
  { id: 'AUD-4817', timestamp: '2024-12-18 12:18:55', user: 'Ama Darko', action: 'User Created', category: 'user', target: 'USR-012', details: 'Created account for Oheneba Agyeman with Admin role', ipAddress: '102.156.44.14', status: 'Success' },
  { id: 'AUD-4816', timestamp: '2024-12-18 11:45:33', user: 'Yaw Owusu', action: 'Payment Recorded', category: 'payment', target: 'PAY-98218', details: 'Received GH₨ 600 from Nana Akwasi Mensah via Cash', ipAddress: '102.156.44.22', status: 'Success' },
  { id: 'AUD-4815', timestamp: '2024-12-18 11:20:09', user: 'Unknown', action: 'Failed Login Attempt', category: 'auth', target: 'admin@kma.gov.gh', details: 'Invalid password, attempt 3 of 5 before lockout', ipAddress: '197.231.88.55', status: 'Failed' },
  { id: 'AUD-4814', timestamp: '2024-12-18 10:50:42', user: 'Efua Owusu', action: 'Business Registration', category: 'business', target: 'BIZ-2024-045', details: 'Registered new business: Kumasi Fresh Foods at Kejetia', ipAddress: '102.156.44.19', status: 'Success' },
  { id: 'AUD-4813', timestamp: '2024-12-18 10:15:28', user: 'Nana Akwasi Mensah', action: 'Bill Generated', category: 'payment', target: 'BILL-2024-1234', details: 'Generated Q1 2025 property tax bill for Bantama Ward 12', ipAddress: '102.156.44.27', status: 'Success' },
  { id: 'AUD-4812', timestamp: '2024-12-18 09:48:16', user: 'Kwabena Amponsah', action: 'Role Changed', category: 'user', target: 'USR-010', details: 'Changed role to Suspended for Kwabena Amponsah', ipAddress: '102.156.44.30', status: 'Success' },
  { id: 'AUD-4811', timestamp: '2024-12-18 09:30:00', user: 'Afia Acheampong', action: 'Receipt Issued', category: 'payment', target: 'RCP-2024-0451', details: 'Issued receipt for GH₨ 2,400 Business Operating Permit Fee', ipAddress: '102.156.44.16', status: 'Success' },
  { id: 'AUD-4810', timestamp: '2024-12-18 09:02:44', user: 'Oheneba Agyeman', action: 'System Config Updated', category: 'system', target: 'CFG-RATE-Y2025', details: 'Updated business rate multiplier from 1.15 to 1.20 for FY2025', ipAddress: '102.156.44.11', status: 'Success' },
  { id: 'AUD-4809', timestamp: '2024-12-17 17:25:31', user: 'Abena Mensah', action: 'Business Updated', category: 'business', target: 'BIZ-2024-012', details: 'Updated licence status to Active for Adom Filling Station', ipAddress: '102.156.44.18', status: 'Success' },
  { id: 'AUD-4808', timestamp: '2024-12-17 16:48:19', user: 'Kofi Boateng', action: 'User Login', category: 'auth', target: 'k.boateng@kma.gov.gh', details: 'Successful login from Safari on macOS', ipAddress: '102.156.44.31', status: 'Success' },
  { id: 'AUD-4807', timestamp: '2024-12-17 16:10:55', user: 'Akosua Frimpong', action: 'Report Viewed', category: 'system', target: 'RPT-REV-MONTHLY', details: 'Viewed November 2024 monthly revenue summary', ipAddress: '102.156.44.23', status: 'Success' },
  { id: 'AUD-4806', timestamp: '2024-12-17 15:35:02', user: 'Unknown', action: 'Failed Login Attempt', category: 'auth', target: 'superuser@kma.gov.gh', details: 'Account does not exist', ipAddress: '197.231.88.102', status: 'Failed' },
];

const CATEGORY_CONFIG: Record<ActionCategory, { icon: React.ElementType; label: string; style: string }> = {
  auth: { icon: LogIn, label: 'Authentication', style: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  user: { icon: UserPlus, label: 'User Mgmt', style: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400' },
  payment: { icon: CreditCard, label: 'Payment', style: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  business: { icon: FileText, label: 'Business', style: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  property: { icon: Home, label: 'Property', style: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
  system: { icon: Settings, label: 'System', style: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' },
};

const PER_PAGE = 10;

function getActionIcon(action: string) {
  if (action.includes('Login')) return <LogIn className="w-3.5 h-3.5" />;
  if (action.includes('Created') || action.includes('Registration')) return <UserPlus className="w-3.5 h-3.5" />;
  if (action.includes('Updated') || action.includes('Changed')) return <Pencil className="w-3.5 h-3.5" />;
  if (action.includes('Deleted')) return <Trash2 className="w-3.5 h-3.5" />;
  return <FileText className="w-3.5 h-3.5" />;
}

export function AuditTrailPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedEntry, setSelectedEntry] = useState<AuditEntry | null>(null);

  const filtered = useMemo(() => {
    let data = mockAuditLog;
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (e) =>
          e.user.toLowerCase().includes(q) ||
          e.action.toLowerCase().includes(q) ||
          e.target.toLowerCase().includes(q) ||
          e.details.toLowerCase().includes(q) ||
          e.id.toLowerCase().includes(q),
      );
    }
    if (categoryFilter !== 'all') data = data.filter((e) => e.category === categoryFilter);
    if (statusFilter !== 'all') data = data.filter((e) => e.status === statusFilter);
    return data;
  }, [search, categoryFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const successCount = mockAuditLog.filter((e) => e.status === 'Success').length;
  const failedCount = mockAuditLog.filter((e) => e.status === 'Failed').length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Total Events</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{mockAuditLog.length}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
              <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Successful</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{successCount}</p>
        </div>
        <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 dark:bg-red-900/30">
              <Shield className="w-5 h-5 text-red-500 dark:text-red-400" />
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">Failed / Blocked</span>
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{failedCount}</p>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by user, action, target, details..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white pl-10 pr-4 py-2.5 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition" />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white pl-9 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition cursor-pointer">
                <option value="all">All Categories</option>
                {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (<option key={key} value={key}>{cfg.label}</option>))}
              </select>
            </div>
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="appearance-none rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition cursor-pointer">
              <option value="all">All Status</option>
              <option value="Success">Success</option>
              <option value="Failed">Failed</option>
            </select>
            <button className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2.5 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors shrink-0">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3 w-24">Time</th>
                <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3">User</th>
                <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3">Action</th>
                <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3 hidden lg:table-cell">Target</th>
                <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3">Category</th>
                <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3">Status</th>
                <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3 text-center">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {paginated.map((entry) => {
                const catCfg = CATEGORY_CONFIG[entry.category];
                const CatIcon = catCfg.icon;
                return (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">
                        {entry.timestamp.split(' ')[1]}
                        <br className="sm:hidden" />
                        <span className="hidden sm:inline"> </span>
                        <span className="text-[10px] opacity-70">{entry.timestamp.split(' ')[0]}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-[10px] font-bold shrink-0`}>
                          {entry.user === 'Unknown' ? '?' : entry.user.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                        <span className={`text-sm font-medium truncate max-w-[120px] block ${entry.user === 'Unknown' ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{entry.user}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-sm text-slate-900 dark:text-white font-medium">
                        {getActionIcon(entry.action)}{entry.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-300">{entry.target}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${catCfg.style}`}>
                        <CatIcon className="w-3 h-3" />{catCfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${entry.status === 'Success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setSelectedEntry(entry)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="View details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-400 dark:text-slate-500">No audit entries match your filters.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 px-4 py-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Showing {(page - 1) * PER_PAGE + 1}&ndash;{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button disabled={page <= 1} onClick={() => setPage((p: number) => p - 1)} className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
            {Array.from({ length: totalPages }, (_: unknown, i: number) => i + 1).map((p: number) => (
              <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${p === page ? 'bg-emerald-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}`}>{p}</button>
            ))}
            <button disabled={page >= totalPages} onClick={() => setPage((p: number) => p + 1)} className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {selectedEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedEntry(null)} />
          <div className="relative w-full max-w-lg rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">Audit Entry Details</h3>
              <button onClick={() => setSelectedEntry(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">Entry ID</span><span className="text-sm font-mono text-slate-900 dark:text-white">{selectedEntry.id}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">Timestamp</span><span className="text-sm text-slate-900 dark:text-white">{selectedEntry.timestamp}</span></div>
              <div className="border-t border-slate-100 dark:border-slate-700/60" />
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">User</span><span className={`text-sm font-medium ${selectedEntry.user === 'Unknown' ? 'text-red-500 dark:text-red-400' : 'text-slate-900 dark:text-white'}`}>{selectedEntry.user}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">Action</span><span className="text-sm font-medium text-slate-900 dark:text-white">{selectedEntry.action}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">Target</span><span className="text-sm font-mono text-slate-600 dark:text-slate-300">{selectedEntry.target}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">Category</span><span className={`inline-flex text-xs font-medium px-2.5 py-0.5 rounded-full ${CATEGORY_CONFIG[selectedEntry.category].style}`}>{selectedEntry.category}</span></div>
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">Status</span><span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${selectedEntry.status === 'Success' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>{selectedEntry.status}</span></div>
              <div className="border-t border-slate-100 dark:border-slate-700/60" />
              <div><span className="text-sm text-slate-500 dark:text-slate-400">Details</span><p className="text-sm text-slate-900 dark:text-white mt-1 leading-relaxed">{selectedEntry.details}</p></div>
              <div className="flex items-center justify-between"><span className="text-sm text-slate-500 dark:text-slate-400">IP Address</span><span className="text-sm font-mono text-slate-600 dark:text-slate-300">{selectedEntry.ipAddress}</span></div>
            </div>
            <div className="flex items-center justify-end border-t border-slate-200 dark:border-slate-700 px-6 py-4">
              <button onClick={() => setSelectedEntry(null)} className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
