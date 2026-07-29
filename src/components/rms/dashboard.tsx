'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Building2,
  Home,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Landmark,
  Receipt,
  Users,
  CircleDollarSign,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const monthlyRevenue = [];

const revenueByCategory = [];

const topCollectors = [];

const recentPayments = [];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const fmt = (n: number) =>
  new Intl.NumberFormat('en-GH').format(n);

const fmtCurrency = (n: number) => `GH₵ ${fmt(n)}`;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/* ---------- Stat Card ---------- */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: number; // percentage, positive = good
  accent: string;
}

function StatCard({ icon, label, value, change, accent }: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <div
      className={`rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow flex flex-col gap-3`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${accent}`}
        >
          {icon}
        </span>
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
            isPositive
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ---------- Chart Card Wrapper ---------- */

function ChartCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow ${className}`}
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        {title}
      </h2>
      {children}
    </div>
  );
}

/* ---------- Table Card Wrapper ---------- */

function TableCard({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow overflow-hidden ${className}`}
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        {title}
      </h2>
      <div className="overflow-x-auto max-h-96 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

/* ---------- Custom Recharts Tooltip ---------- */

function RevenueTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg px-3 py-2 text-sm">
      <p className="font-medium text-slate-900 dark:text-white">{label}</p>
      <p className="text-emerald-600 dark:text-emerald-400 font-semibold">
        {fmtCurrency(payload[0].value)}
      </p>
    </div>
  );
}

/* ---------- Pie Custom Label ---------- */

const RADIAN = Math.PI / 180;
function renderPieLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: any) {
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="#475569"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-[11px]"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard Component
// ---------------------------------------------------------------------------

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Landmark className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Revenue Management System
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Kumasi Metropolitan Assembly — Dashboard Overview
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Fiscal Year 2024
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Stat Cards ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            label="Total Businesses"
            value="0"
            change={0}
            accent="bg-emerald-100 dark:bg-emerald-900/40"
          />
          <StatCard
            icon={<Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            label="Total Properties"
            value="0"
            change={0}
            accent="bg-emerald-100 dark:bg-emerald-900/40"
          />
          <StatCard
            icon={<CircleDollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            label="Amount Collected"
            value={fmtCurrency(0)}
            change={0}
            accent="bg-emerald-100 dark:bg-emerald-900/40"
          />
          <StatCard
            icon={<AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
            label="Outstanding"
            value={fmtCurrency(0)}
            change={0}
            accent="bg-amber-100 dark:bg-amber-900/40"
          />
        </div>

        {/* ── Charts Row ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Monthly Revenue Trend — 3/5 width */}
          <ChartCard
            title="Monthly Revenue Trend"
            className="lg:col-span-3"
          >
            <div className="h-72 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                  />
                  <YAxis
                    tickFormatter={(v) => `${v / 1000}k`}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    width={48}
                  />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fill="url(#emeraldGradient)"
                    dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 6, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          {/* Revenue by Category — 2/5 width */}
          <ChartCard
            title="Revenue by Category"
            className="lg:col-span-2"
          >
            <div className="h-72 sm:h-80 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueByCategory}
                    cx="50%"
                    cy="45%"
                    outerRadius={90}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                    label={renderPieLabel}
                    labelLine={false}
                  >
                    {revenueByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => fmtCurrency(value)}
                    contentStyle={{
                      borderRadius: '0.5rem',
                      border: '1px solid #e2e8f0',
                      fontSize: '0.875rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 w-full max-w-xs">
                {revenueByCategory.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <span
                      className="w-2.5 h-2.5 rounded-sm shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    {cat.name}
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        {/* ── Tables Row ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Top Revenue Collectors */}
          <TableCard title="Top Revenue Collectors">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-3 py-2.5">Name</th>
                  <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-3 py-2.5">Area</th>
                  <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-3 py-2.5 text-right">Amount</th>
                  <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-3 py-2.5 text-right">Bills</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {topCollectors.map((c) => (
                  <tr key={c.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="text-sm text-slate-900 dark:text-white font-medium px-3 py-3 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold shrink-0">
                        {c.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </span>
                      {c.name}
                    </td>
                    <td className="text-sm text-slate-600 dark:text-slate-400 px-3 py-3">{c.area}</td>
                    <td className="text-sm text-slate-900 dark:text-white font-medium px-3 py-3 text-right">
                      {fmtCurrency(c.amount)}
                    </td>
                    <td className="text-sm text-slate-600 dark:text-slate-400 px-3 py-3 text-right">{c.bills}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>

          {/* Recent Payments */}
          <TableCard title="Recent Payments">
            <table className="w-full text-left">
              <thead className="border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-3 py-2.5">Receipt #</th>
                  <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-3 py-2.5">Business</th>
                  <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-3 py-2.5 text-right">Amount</th>
                  <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-3 py-2.5">Date</th>
                  <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-3 py-2.5">Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {recentPayments.map((p) => (
                  <tr key={p.receipt} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="text-sm text-slate-900 dark:text-white font-mono px-3 py-3">{p.receipt}</td>
                    <td className="text-sm text-slate-900 dark:text-white font-medium px-3 py-3">{p.business}</td>
                    <td className="text-sm text-slate-900 dark:text-white font-medium px-3 py-3 text-right">
                      {fmtCurrency(p.amount)}
                    </td>
                    <td className="text-sm text-slate-600 dark:text-slate-400 px-3 py-3">{p.date}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                          p.method === 'Mobile Money'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : p.method === 'Bank Transfer'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        }`}
                      >
                        {p.method}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableCard>
        </div>
      </main>
    </div>
  );
}

export { DashboardPage };
