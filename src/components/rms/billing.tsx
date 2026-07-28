'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Eye,
  Printer,
  XCircle,
  FileText,
  Zap,
  DollarSign,
  AlertTriangle,
  Clock,
  X,
  Save,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Bill {
  id: string;
  billNumber: string;
  date: string;
  entityName: string;
  entityType: 'Business' | 'Property';
  category: string;
  revenueItem: string;
  amount: number;
  previousBalance: number;
  penalty: number;
  totalDue: number;
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue';
  dueDate: string;
}

interface BillFormData {
  entityName: string;
  entityType: 'Business' | 'Property';
  revenueItem: string;
  amount: number;
  previousBalance: number;
  penalty: number;
  dueDate: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const REVENUE_ITEMS = [
  'Business Operating Permit',
  'Property Rate',
  'Market Toll',
  'Signage Fees',
  'Building Permit Fees',
  'Environmental Fees',
  'Liquor License',
  'Food Vendor Permit',
  'Advertising Levy',
  'Development Levy',
  'Sanitation Fees',
  'Fire Safety Cert',
];

const RATE_AMOUNTS: Record<string, number> = {
  'Business Operating Permit': 300,
  'Property Rate': 600,
  'Market Toll': 50,
  'Signage Fees': 100,
  'Building Permit Fees': 500,
  'Environmental Fees': 75,
  'Liquor License': 200,
  'Food Vendor Permit': 80,
  'Advertising Levy': 300,
  'Development Levy': 150,
  'Sanitation Fees': 60,
  'Fire Safety Cert': 350,
};

const ENTITIES = [
  { name: 'Kumasi Pharmacy', type: 'Business' as const, category: 'Healthcare' },
  { name: 'Royal Hotel', type: 'Business' as const, category: 'Hospitality' },
  { name: 'Mama Afia Restaurant', type: 'Business' as const, category: 'Food & Beverage' },
  { name: 'Apex Manufacturing Ltd', type: 'Business' as const, category: 'Industry' },
  { name: 'Abossey Okai Supermarket', type: 'Business' as const, category: 'Retail' },
  { name: 'Osei Barbershop', type: 'Business' as const, category: 'Personal Care' },
  { name: 'Goil Fuel Station - Konongo', type: 'Business' as const, category: 'Energy' },
  { name: '14 Kejetia Lane, Kumasi', type: 'Property' as const, category: 'Residential' },
  { name: 'Plot 24 Ahodwo Roundabout', type: 'Property' as const, category: 'Commercial' },
  { name: '55 Manhyia Palace Road', type: 'Property' as const, category: 'Commercial' },
  { name: 'Block A, Dichemso Estates', type: 'Property' as const, category: 'Residential' },
  { name: 'Grace Hair Salon', type: 'Business' as const, category: 'Personal Care' },
  { name: 'Hope Medical Clinic', type: 'Business' as const, category: 'Healthcare' },
  { name: 'Good Shepherd School Complex', type: 'Business' as const, category: 'Education' },
  { name: 'St. Johns Catholic Hospital', type: 'Business' as const, category: 'Healthcare' },
];

const initialBills: Bill[] = [
  {
    id: '1',
    billNumber: 'BILL-2024-0156',
    date: '2024-11-01',
    entityName: 'Kumasi Pharmacy',
    entityType: 'Business',
    category: 'Healthcare',
    revenueItem: 'Business Operating Permit',
    amount: 300,
    previousBalance: 0,
    penalty: 0,
    totalDue: 300,
    status: 'Paid',
    dueDate: '2024-11-30',
  },
  {
    id: '2',
    billNumber: 'BILL-2024-0157',
    date: '2024-11-01',
    entityName: 'Royal Hotel',
    entityType: 'Business',
    category: 'Hospitality',
    revenueItem: 'Business Operating Permit',
    amount: 450,
    previousBalance: 150,
    penalty: 22.5,
    totalDue: 622.5,
    status: 'Partial',
    dueDate: '2024-11-30',
  },
  {
    id: '3',
    billNumber: 'BILL-2024-0158',
    date: '2024-10-15',
    entityName: '14 Kejetia Lane, Kumasi',
    entityType: 'Property',
    category: 'Residential',
    revenueItem: 'Property Rate',
    amount: 250,
    previousBalance: 500,
    penalty: 75,
    totalDue: 825,
    status: 'Overdue',
    dueDate: '2024-10-30',
  },
  {
    id: '4',
    billNumber: 'BILL-2024-0159',
    date: '2024-11-05',
    entityName: 'Mama Afia Restaurant',
    entityType: 'Business',
    category: 'Food & Beverage',
    revenueItem: 'Food Vendor Permit',
    amount: 80,
    previousBalance: 0,
    penalty: 0,
    totalDue: 80,
    status: 'Paid',
    dueDate: '2024-12-05',
  },
  {
    id: '5',
    billNumber: 'BILL-2024-0160',
    date: '2024-11-05',
    entityName: 'Apex Manufacturing Ltd',
    entityType: 'Business',
    category: 'Industry',
    revenueItem: 'Environmental Fees',
    amount: 75,
    previousBalance: 75,
    penalty: 0,
    totalDue: 150,
    status: 'Unpaid',
    dueDate: '2024-12-05',
  },
  {
    id: '6',
    billNumber: 'BILL-2024-0161',
    date: '2024-10-20',
    entityName: 'Plot 24 Ahodwo Roundabout',
    entityType: 'Property',
    category: 'Commercial',
    revenueItem: 'Property Rate',
    amount: 1200,
    previousBalance: 0,
    penalty: 0,
    totalDue: 1200,
    status: 'Paid',
    dueDate: '2024-11-20',
  },
  {
    id: '7',
    billNumber: 'BILL-2024-0162',
    date: '2024-11-10',
    entityName: 'Abossey Okai Supermarket',
    entityType: 'Business',
    category: 'Retail',
    revenueItem: 'Signage Fees',
    amount: 100,
    previousBalance: 200,
    penalty: 30,
    totalDue: 330,
    status: 'Unpaid',
    dueDate: '2024-12-10',
  },
  {
    id: '8',
    billNumber: 'BILL-2024-0163',
    date: '2024-10-01',
    entityName: 'Osei Barbershop',
    entityType: 'Business',
    category: 'Personal Care',
    revenueItem: 'Sanitation Fees',
    amount: 60,
    previousBalance: 120,
    penalty: 18,
    totalDue: 198,
    status: 'Overdue',
    dueDate: '2024-10-31',
  },
  {
    id: '9',
    billNumber: 'BILL-2024-0164',
    date: '2024-11-12',
    entityName: 'Goil Fuel Station - Konongo',
    entityType: 'Business',
    category: 'Energy',
    revenueItem: 'Fire Safety Cert',
    amount: 350,
    previousBalance: 0,
    penalty: 0,
    totalDue: 350,
    status: 'Paid',
    dueDate: '2024-12-12',
  },
  {
    id: '10',
    billNumber: 'BILL-2024-0165',
    date: '2024-11-12',
    entityName: '55 Manhyia Palace Road',
    entityType: 'Property',
    category: 'Commercial',
    revenueItem: 'Building Permit Fees',
    amount: 500,
    previousBalance: 0,
    penalty: 0,
    totalDue: 500,
    status: 'Unpaid',
    dueDate: '2024-12-12',
  },
  {
    id: '11',
    billNumber: 'BILL-2024-0166',
    date: '2024-09-15',
    entityName: 'Block A, Dichemso Estates',
    entityType: 'Property',
    category: 'Residential',
    revenueItem: 'Development Levy',
    amount: 150,
    previousBalance: 300,
    penalty: 45,
    totalDue: 495,
    status: 'Overdue',
    dueDate: '2024-10-15',
  },
  {
    id: '12',
    billNumber: 'BILL-2024-0167',
    date: '2024-11-15',
    entityName: 'Grace Hair Salon',
    entityType: 'Business',
    category: 'Personal Care',
    revenueItem: 'Market Toll',
    amount: 50,
    previousBalance: 0,
    penalty: 0,
    totalDue: 50,
    status: 'Paid',
    dueDate: '2024-12-15',
  },
  {
    id: '13',
    billNumber: 'BILL-2024-0168',
    date: '2024-11-15',
    entityName: 'Hope Medical Clinic',
    entityType: 'Business',
    category: 'Healthcare',
    revenueItem: 'Liquor License',
    amount: 200,
    previousBalance: 200,
    penalty: 30,
    totalDue: 430,
    status: 'Partial',
    dueDate: '2024-12-15',
  },
  {
    id: '14',
    billNumber: 'BILL-2024-0169',
    date: '2024-11-18',
    entityName: 'Good Shepherd School Complex',
    entityType: 'Business',
    category: 'Education',
    revenueItem: 'Advertising Levy',
    amount: 300,
    previousBalance: 0,
    penalty: 0,
    totalDue: 300,
    status: 'Unpaid',
    dueDate: '2024-12-18',
  },
  {
    id: '15',
    billNumber: 'BILL-2024-0170',
    date: '2024-11-18',
    entityName: 'St. Johns Catholic Hospital',
    entityType: 'Business',
    category: 'Healthcare',
    revenueItem: 'Business Operating Permit',
    amount: 450,
    previousBalance: 450,
    penalty: 67.5,
    totalDue: 967.5,
    status: 'Overdue',
    dueDate: '2024-11-01',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return `GH₵ ${amount.toLocaleString(undefined, { minimumFractionDigits: amount % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function BillingPage() {
  const [bills, setBills] = useState<Bill[]>(initialBills);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [revenueAreaFilter, setRevenueAreaFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 8;

  // ── Form data ───────────────────────────────────────────────────────────

  const [formData, setFormData] = useState<BillFormData>({
    entityName: '',
    entityType: 'Business',
    revenueItem: '',
    amount: 0,
    previousBalance: 0,
    penalty: 0,
    dueDate: '',
  });

  // ── Filtering ───────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    return bills.filter((b) => {
      const matchSearch =
        searchQuery === '' ||
        b.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.revenueItem.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        statusFilter === 'All' || b.status === statusFilter;
      const matchCategory =
        categoryFilter === 'All' || b.category === categoryFilter;
      const matchRevenueArea =
        revenueAreaFilter === 'All' ||
        (b.entityType === revenueAreaFilter);
      const matchDateFrom =
        dateFrom === '' || b.date >= dateFrom;
      const matchDateTo =
        dateTo === '' || b.date <= dateTo;
      return matchSearch && matchStatus && matchCategory && matchRevenueArea && matchDateFrom && matchDateTo;
    });
  }, [bills, searchQuery, statusFilter, categoryFilter, revenueAreaFilter, dateFrom, dateTo]);

  // ── Pagination ──────────────────────────────────────────────────────────

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * itemsPerPage;
  const paged = filtered.slice(startIdx, startIdx + itemsPerPage);
  const showingFrom = filtered.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + itemsPerPage, filtered.length);

  // ── Status badge ───────────────────────────────────────────────────────

  const StatusBadge = ({ status }: { status: Bill['status'] }) => {
    const styles: Record<Bill['status'], string> = {
      Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      Partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
      Unpaid: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
      Overdue: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
    };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}>
        {status === 'Overdue' && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
        )}
        {status}
      </span>
    );
  };

  // ── Stats ──────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const totalBilled = bills.reduce((sum, b) => sum + b.totalDue, 0);
    const paid = bills
      .filter((b) => b.status === 'Paid')
      .reduce((sum, b) => sum + b.totalDue, 0);
    const outstanding = totalBilled - paid;
    const overdue = bills
      .filter((b) => b.status === 'Overdue')
      .reduce((sum, b) => sum + b.totalDue, 0);
    return {
      total: bills.length,
      totalBilled,
      outstanding,
      overdue,
    };
  }, [bills]);

  // ── Auto-fill amount when revenue item changes ──────────────────────────

  const handleRevenueItemChange = (item: string) => {
    const amount = RATE_AMOUNTS[item] || 0;
    const penalty = Math.round(amount * 0.05 * 100) / 100;
    setFormData((p) => ({
      ...p,
      revenueItem: item,
      amount,
      penalty,
    }));
  };

  // ── Generate bill ──────────────────────────────────────────────────────

  const handleGenerateBill = () => {
    if (!formData.entityName || !formData.revenueItem || formData.amount <= 0) return;

    const newBillNumber = `BILL-2024-${String(bills.length + 156).padStart(4, '0')}`;
    const totalDue = formData.amount + formData.previousBalance + formData.penalty;

    const newBill: Bill = {
      id: String(bills.length + 1),
      billNumber: newBillNumber,
      date: new Date().toISOString().split('T')[0],
      entityName: formData.entityName,
      entityType: formData.entityType,
      category: ENTITIES.find((e) => e.name === formData.entityName)?.category ?? 'General',
      revenueItem: formData.revenueItem,
      amount: formData.amount,
      previousBalance: formData.previousBalance,
      penalty: formData.penalty,
      totalDue,
      status: 'Unpaid',
      dueDate: formData.dueDate || '',
    };

    setBills((prev) => [newBill, ...prev]);
    setShowModal(false);
    setFormData({
      entityName: '',
      entityType: 'Business',
      revenueItem: '',
      amount: 0,
      previousBalance: 0,
      penalty: 0,
      dueDate: '',
    });
    setCurrentPage(1);
  };

  // ── Cancel bill ────────────────────────────────────────────────────────

  const handleCancelBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
  };

  // ── CSS classes ──────────────────────────────────────────────────────────

  const inputClass =
    'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition';
  const labelClass =
    'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';
  const btnPrimary =
    'inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap';
  const btnSecondary =
    'inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap';

  // ══════════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════════

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Bill Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate, track, and manage revenue bills for businesses and properties.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowModal(true)} className={btnPrimary}>
            <Plus className="w-4 h-4" />
            Generate Bill
          </button>
          <button className={btnSecondary}>
            <Zap className="w-4 h-4" />
            Bulk Generate
          </button>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bills Generated</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.total.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/30">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Billed</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.totalBilled)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/30">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Outstanding</p>
              <p className="text-xl font-bold text-amber-700 dark:text-amber-400">{formatCurrency(stats.outstanding)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-50 dark:bg-red-900/30">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Overdue</p>
              <p className="text-xl font-bold text-red-700 dark:text-red-400">{formatCurrency(stats.overdue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by bill #, entity, or revenue item..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={`${inputClass} pl-10`}
          />
        </div>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setCurrentPage(1);
          }}
          className={`${inputClass} w-full sm:w-40`}
          title="From date"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setCurrentPage(1);
          }}
          className={`${inputClass} w-full sm:w-40`}
          title="To date"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={`${inputClass} w-full sm:w-40`}
        >
          <option value="All">All Statuses</option>
          <option value="Paid">Paid</option>
          <option value="Partial">Partial</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Overdue">Overdue</option>
        </select>
        <select
          value={revenueAreaFilter}
          onChange={(e) => {
            setRevenueAreaFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={`${inputClass} w-full sm:w-40`}
        >
          <option value="All">All Revenue Areas</option>
          <option value="Business">Business</option>
          <option value="Property">Property</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className={`${inputClass} w-full sm:w-44`}
        >
          <option value="All">All Categories</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Hospitality">Hospitality</option>
          <option value="Food & Beverage">Food & Beverage</option>
          <option value="Industry">Industry</option>
          <option value="Retail">Retail</option>
          <option value="Personal Care">Personal Care</option>
          <option value="Energy">Energy</option>
          <option value="Residential">Residential</option>
          <option value="Commercial">Commercial</option>
          <option value="Education">Education</option>
        </select>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  Bill #
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  Date
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  Entity
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hidden lg:table-cell">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hidden md:table-cell">
                  Revenue Item
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  Amount
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hidden xl:table-cell">
                  Prev. Bal.
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hidden xl:table-cell">
                  Penalty
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  Total Due
                </th>
                <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {paged.length === 0 ? (
                <tr>
                  <td
                    colSpan={11}
                    className="text-center py-12 text-slate-400 dark:text-slate-500"
                  >
                    <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                    No bills found matching your criteria.
                  </td>
                </tr>
              ) : (
                paged.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {bill.billNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {bill.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white text-sm">
                          {bill.entityName}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          {bill.entityType}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap hidden lg:table-cell">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {bill.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap hidden md:table-cell">
                      {bill.revenueItem}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(bill.amount)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-500 dark:text-slate-400 whitespace-nowrap hidden xl:table-cell">
                      {bill.previousBalance > 0 ? formatCurrency(bill.previousBalance) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 whitespace-nowrap hidden xl:table-cell">
                      {bill.penalty > 0 ? formatCurrency(bill.penalty) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                      {formatCurrency(bill.totalDue)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={bill.status} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          title="View Bill"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          title="Print Bill"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        {bill.status !== 'Paid' && (
                          <button
                            onClick={() => handleCancelBill(bill.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Cancel Bill"
                          >
                            <XCircle className="w-4 h-4" />
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

      {/* ── Pagination ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Showing {showingFrom}–{showingTo} of {filtered.length} bills
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={safeCurrentPage === 1}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                page === safeCurrentPage
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={safeCurrentPage === totalPages}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── Generate Bill Modal ────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Generate New Bill
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Entity Selection */}
              <div>
                <label className={labelClass}>Business / Property</label>
                <select
                  value={formData.entityName}
                  onChange={(e) => {
                    const entity = ENTITIES.find((ent) => ent.name === e.target.value);
                    setFormData((p) => ({
                      ...p,
                      entityName: e.target.value,
                      entityType: entity?.type ?? 'Business',
                    }));
                  }}
                  className={inputClass}
                >
                  <option value="">Select entity...</option>
                  {ENTITIES.map((e) => (
                    <option key={e.name} value={e.name}>
                      {e.name} ({e.type} – {e.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Revenue Item */}
              <div>
                <label className={labelClass}>Revenue Item</label>
                <select
                  value={formData.revenueItem}
                  onChange={(e) => handleRevenueItemChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select revenue item...</option>
                  {REVENUE_ITEMS.map((item) => (
                    <option key={item} value={item}>
                      {item} ({formatCurrency(RATE_AMOUNTS[item])})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount (auto-filled) */}
              <div>
                <label className={labelClass}>Amount (GH₵)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.amount || ''}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      amount: Number(e.target.value),
                    }))
                  }
                  className={inputClass}
                />
              </div>

              {/* Previous Balance */}
              <div>
                <label className={labelClass}>Previous Balance (GH₵)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.previousBalance || ''}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      previousBalance: Number(e.target.value),
                    }))
                  }
                  placeholder="0"
                  className={inputClass}
                />
              </div>

              {/* Penalty (auto-calculated) */}
              <div>
                <label className={labelClass}>Penalty (GH₵)</label>
                <input
                  type="number"
                  min={0}
                  value={formData.penalty || ''}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      penalty: Number(e.target.value),
                    }))
                  }
                  className={inputClass}
                />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  Auto-calculated as 5% of amount. Adjust manually if needed.
                </p>
              </div>

              {/* Due Date */}
              <div>
                <label className={labelClass}>Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      dueDate: e.target.value,
                    }))
                  }
                  className={inputClass}
                />
              </div>

              {/* Preview Summary */}
              {formData.revenueItem && formData.amount > 0 && (
                <div className="rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3">
                  <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                    Bill Preview
                  </p>
                  <div className="space-y-1 text-sm text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span>Amount:</span>
                      <span className="font-medium">{formatCurrency(formData.amount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Previous Balance:</span>
                      <span className="font-medium">{formatCurrency(formData.previousBalance)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Penalty:</span>
                      <span className="font-medium text-red-600 dark:text-red-400">{formatCurrency(formData.penalty)}</span>
                    </div>
                    <div className="border-t border-emerald-200 dark:border-emerald-800 pt-1 mt-1 flex justify-between">
                      <span className="font-semibold text-emerald-700 dark:text-emerald-400">Total Due:</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(formData.amount + formData.previousBalance + formData.penalty)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-700 px-6 py-4">
              <button onClick={() => setShowModal(false)} className={btnSecondary}>
                <X className="w-4 h-4" />
                Cancel
              </button>
              <button
                onClick={handleGenerateBill}
                className={btnPrimary}
                disabled={
                  !formData.entityName ||
                  !formData.revenueItem ||
                  formData.amount <= 0
                }
              >
                <Save className="w-4 h-4" />
                Generate Bill
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
