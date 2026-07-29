'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Upload,
  Building2,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Business {
  regNumber: string;
  name: string;
  owner: string;
  type: string;
  category: string;
  tin: string;
  status: 'Active' | 'Inactive';
  dateRegistered: string;
  ghanaCard: string;
  phone: string;
  email: string;
  gpsAddress: string;
  digitalAddress: string;
  residentialAddress: string;
  businessAddress: string;
  ward: string;
  electoralArea: string;
  zone: string;
  revenueArea: string;
  licenseNumber: string;
  subCategory: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockBusinesses: Business[] = [];

// ─── Business Type → Category mapping ────────────────────────────────────────

const businessTypeCategories: Record<string, string[]> = {
  Pharmacy: ['Healthcare', 'Pharmaceutical'],
  Hotel: ['Hospitality', 'Tourism'],
  Restaurant: ['Food & Beverage', 'Hospitality'],
  'Drinking Spot': ['Food & Beverage', 'Entertainment'],
  'Cold Store': ['Retail', 'Food & Beverage'],
  Supermarket: ['Retail', 'Wholesale'],
  'Fuel Station': ['Energy', 'Transportation'],
  'Barbering Salon': ['Personal Care', 'Services'],
  'Hair Salon': ['Personal Care', 'Services'],
  Clinic: ['Healthcare', 'Medical Services'],
  Hospital: ['Healthcare', 'Medical Services'],
  School: ['Education', 'Social Services'],
  Bank: ['Finance', 'Services'],
  NGO: ['Social Services', 'Non-Profit'],
  Church: ['Religious', 'Non-Profit'],
  Manufacturing: ['Industry', 'Production'],
  'Retail Shop': ['Retail', 'Commerce'],
  Other: ['General', 'Services'],
};

const businessTypes = Object.keys(businessTypeCategories);

// ─── Component ───────────────────────────────────────────────────────────────

export function BusinessesPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [businesses, setBusinesses] = useState<Business[]>(mockBusinesses);
  const itemsPerPage = 10;

  // ── Form State ───────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    regNumber: '',
    name: '',
    type: '',
    category: '',
    subCategory: '',
    tin: '',
    licenseNumber: '',
    dateRegistered: '',
    status: 'Active',
    ownerName: '',
    ghanaCard: '',
    phone: '',
    email: '',
    gpsAddress: '',
    digitalAddress: '',
    residentialAddress: '',
    businessAddress: '',
    ward: '',
    electoralArea: '',
    zone: '',
    revenueArea: '',
  });

  // ── Derived categories based on selected business type ───────────────────
  const availableCategories = form.type
    ? businessTypeCategories[form.type] || []
    : [];

  // ── Filtering & Pagination ───────────────────────────────────────────────
  const filtered = businesses.filter((b) => {
    const matchSearch =
      searchQuery === '' ||
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.regNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchType = typeFilter === 'All' || b.type === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIdx = (safeCurrentPage - 1) * itemsPerPage;
  const paged = filtered.slice(startIdx, startIdx + itemsPerPage);
  const showingFrom = filtered.length === 0 ? 0 : startIdx + 1;
  const showingTo = Math.min(startIdx + itemsPerPage, filtered.length);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset category and sub-category when type changes
      if (name === 'type') {
        updated.category = '';
        updated.subCategory = '';
      }
      return updated;
    });
  };

  const handleSave = () => {
    if (!form.name || !form.type) return;
    const newBusiness: Business = {
      regNumber: form.regNumber || `BIZ-${String(businesses.length + 1).padStart(4, '0')}`,
      name: form.name,
      owner: form.ownerName,
      type: form.type,
      category: form.category,
      tin: form.tin,
      status: (form.status as 'Active' | 'Inactive') || 'Active',
      dateRegistered: form.dateRegistered || new Date().toISOString().split('T')[0],
      ghanaCard: form.ghanaCard,
      phone: form.phone,
      email: form.email,
      gpsAddress: form.gpsAddress,
      digitalAddress: form.digitalAddress,
      residentialAddress: form.residentialAddress,
      businessAddress: form.businessAddress,
      ward: form.ward,
      electoralArea: form.electoralArea,
      zone: form.zone,
      revenueArea: form.revenueArea,
      licenseNumber: form.licenseNumber,
      subCategory: form.subCategory,
    };
    setBusinesses((prev) => [...prev, newBusiness]);
    setForm({
      regNumber: '', name: '', type: '', category: '', subCategory: '', tin: '', licenseNumber: '', dateRegistered: '', status: 'Active', ownerName: '', ghanaCard: '', phone: '', email: '', gpsAddress: '', digitalAddress: '', residentialAddress: '', businessAddress: '', ward: '', electoralArea: '', zone: '', revenueArea: '',
    });
    setView('list');
  };

  const handleCancel = () => {
    setView('list');
  };

  const handleDelete = (regNumber: string) => {
    setBusinesses((prev) => prev.filter((b) => b.regNumber !== regNumber));
  };

  // ── Form Field Helper ────────────────────────────────────────────────────
  const inputClass =
    'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition';
  const labelClass =
    'text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';
  const sectionHeaderClass =
    'text-lg font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700';

  // ══════════════════════════════════════════════════════════════════════════
  //  LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Business Registration
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage and register businesses within the assembly. Track revenue
              collection and compliance.
            </p>
          </div>
          <button
            onClick={() => setView('form')}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Register New Business
          </button>
        </div>

        {/* ── Search & Filters ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, owner, or registration number..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={`${inputClass} w-full sm:w-44`}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={`${inputClass} w-full sm:w-48`}
          >
            <option value="All">All Business Types</option>
            {businessTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Reg #
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Business Name
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Owner
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hidden lg:table-cell">
                    Category
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hidden md:table-cell">
                    TIN
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
                      colSpan={8}
                      className="text-center py-12 text-slate-400 dark:text-slate-500"
                    >
                      <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      No businesses found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paged.map((biz) => (
                    <tr
                      key={biz.regNumber}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {biz.regNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {biz.name}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {biz.owner}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {biz.type}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap hidden lg:table-cell">
                        {biz.category}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap hidden md:table-cell">
                        {biz.tin}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            biz.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                          }`}
                        >
                          {biz.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button
                            className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(biz.regNumber)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-slate-500 dark:text-slate-400">
            Showing {showingFrom}-{showingTo} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={safeCurrentPage <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {safeCurrentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={safeCurrentPage >= totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  FORM VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleCancel}
          className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Register New Business
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Fill in the details below to register a new business.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* ─── Section 1: Business Details ──────────────────────────────── */}
        <section>
          <h2 className={sectionHeaderClass}>Business Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Business Registration Number */}
            <div>
              <label className={`${labelClass} block`}>
                Business Registration Number
              </label>
              <input
                type="text"
                name="regNumber"
                value={form.regNumber}
                onChange={handleFormChange}
                placeholder="e.g. BIZ-2024-013"
                className={inputClass}
              />
            </div>

            {/* Business Name */}
            <div>
              <label className={`${labelClass} block`}>Business Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="Enter business name"
                className={inputClass}
              />
            </div>

            {/* Business Type */}
            <div>
              <label className={`${labelClass} block`}>Business Type</label>
              <select
                name="type"
                value={form.type}
                onChange={handleFormChange}
                className={inputClass}
              >
                <option value="">Select business type</option>
                {businessTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className={`${labelClass} block`}>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                disabled={availableCategories.length === 0}
                className={`${inputClass} ${availableCategories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {form.type ? 'Select category' : 'Select a business type first'}
                </option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub-category */}
            <div>
              <label className={`${labelClass} block`}>Sub-category</label>
              <input
                type="text"
                name="subCategory"
                value={form.subCategory}
                onChange={handleFormChange}
                placeholder="Enter sub-category"
                className={inputClass}
              />
            </div>

            {/* Tax Identification Number */}
            <div>
              <label className={`${labelClass} block`}>
                Tax Identification Number (TIN)
              </label>
              <input
                type="text"
                name="tin"
                value={form.tin}
                onChange={handleFormChange}
                placeholder="e.g. TIN-1234567890"
                className={inputClass}
              />
            </div>

            {/* Business License Number */}
            <div>
              <label className={`${labelClass} block`}>
                Business License Number
              </label>
              <input
                type="text"
                name="licenseNumber"
                value={form.licenseNumber}
                onChange={handleFormChange}
                placeholder="e.g. LIC-PH-2024-001"
                className={inputClass}
              />
            </div>

            {/* Date Registered */}
            <div>
              <label className={`${labelClass} block`}>Date Registered</label>
              <input
                type="date"
                name="dateRegistered"
                value={form.dateRegistered}
                onChange={handleFormChange}
                className={inputClass}
              />
            </div>

            {/* Business Status */}
            <div>
              <label className={`${labelClass} block`}>Business Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleFormChange}
                className={inputClass}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        </section>

        {/* ─── Section 2: Owner Details ────────────────────────────────── */}
        <section>
          <h2 className={sectionHeaderClass}>Owner Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Owner Name */}
            <div>
              <label className={`${labelClass} block`}>Owner Name</label>
              <input
                type="text"
                name="ownerName"
                value={form.ownerName}
                onChange={handleFormChange}
                placeholder="Enter full name of owner"
                className={inputClass}
              />
            </div>

            {/* Ghana Card Number */}
            <div>
              <label className={`${labelClass} block`}>
                Ghana Card Number
              </label>
              <input
                type="text"
                name="ghanaCard"
                value={form.ghanaCard}
                onChange={handleFormChange}
                placeholder="e.g. GHA-123456789-0"
                className={inputClass}
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className={`${labelClass} block`}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleFormChange}
                placeholder="e.g. +233 24 567 8901"
                className={inputClass}
              />
            </div>

            {/* Email Address */}
            <div>
              <label className={`${labelClass} block`}>Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleFormChange}
                placeholder="e.g. owner@email.com"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* ─── Section 3: Address Details ──────────────────────────────── */}
        <section>
          <h2 className={sectionHeaderClass}>Address Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* GPS Address */}
            <div>
              <label className={`${labelClass} block`}>GPS Address</label>
              <input
                type="text"
                name="gpsAddress"
                value={form.gpsAddress}
                onChange={handleFormChange}
                placeholder="e.g. AK-034-5521"
                className={inputClass}
              />
            </div>

            {/* Digital Address */}
            <div>
              <label className={`${labelClass} block`}>Digital Address</label>
              <input
                type="text"
                name="digitalAddress"
                value={form.digitalAddress}
                onChange={handleFormChange}
                placeholder="e.g. AK-034-5521"
                className={inputClass}
              />
            </div>

            {/* Residential Address */}
            <div>
              <label className={`${labelClass} block`}>
                Residential Address
              </label>
              <input
                type="text"
                name="residentialAddress"
                value={form.residentialAddress}
                onChange={handleFormChange}
                placeholder="Enter residential address"
                className={inputClass}
              />
            </div>

            {/* Business Address */}
            <div>
              <label className={`${labelClass} block`}>
                Business Address
              </label>
              <input
                type="text"
                name="businessAddress"
                value={form.businessAddress}
                onChange={handleFormChange}
                placeholder="Enter business address"
                className={inputClass}
              />
            </div>

            {/* Ward */}
            <div>
              <label className={`${labelClass} block`}>Ward</label>
              <input
                type="text"
                name="ward"
                value={form.ward}
                onChange={handleFormChange}
                placeholder="Enter ward"
                className={inputClass}
              />
            </div>

            {/* Electoral Area */}
            <div>
              <label className={`${labelClass} block`}>Electoral Area</label>
              <input
                type="text"
                name="electoralArea"
                value={form.electoralArea}
                onChange={handleFormChange}
                placeholder="Enter electoral area"
                className={inputClass}
              />
            </div>

            {/* Zone */}
            <div>
              <label className={`${labelClass} block`}>Zone</label>
              <input
                type="text"
                name="zone"
                value={form.zone}
                onChange={handleFormChange}
                placeholder="e.g. Zone A"
                className={inputClass}
              />
            </div>

            {/* Revenue Area */}
            <div>
              <label className={`${labelClass} block`}>Revenue Area</label>
              <input
                type="text"
                name="revenueArea"
                value={form.revenueArea}
                onChange={handleFormChange}
                placeholder="Enter revenue area"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* ─── Section 4: Documents ────────────────────────────────────── */}
        <section>
          <h2 className={sectionHeaderClass}>Documents</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Business Photograph */}
            <div>
              <label className={`${labelClass} block`}>
                Business Photograph
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="business-photo"
                />
                <label
                  htmlFor="business-photo"
                  className={`${inputClass} flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors py-8 border-dashed`}
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">
                    Click to upload business photograph
                  </span>
                </label>
              </div>
            </div>

            {/* Supporting Documents */}
            <div>
              <label className={`${labelClass} block`}>
                Supporting Documents
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  multiple
                  className="hidden"
                  id="supporting-docs"
                />
                <label
                  htmlFor="supporting-docs"
                  className={`${inputClass} flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors py-8 border-dashed`}
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">
                    Click to upload supporting documents
                  </span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Action Buttons ──────────────────────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={handleCancel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
          >
            Save Business
          </button>
        </div>
      </div>
    </div>
  );
}
