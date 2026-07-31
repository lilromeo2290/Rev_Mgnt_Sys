'use client';

import { useState } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  Search,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  User,
  Building2,
  Crosshair,
  Save,
  X,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Property {
  propNumber: string;
  streetName: string;
  houseNo: string;
  streetCode: string;
  ghanaPostGPS: string;
  localityCode: string;
  ownerName: string;
  ownerAddress: string;
  ownerGPS: string;
  phone: string;
  email: string;
  tin: string;
  nationalId: string;
  ownershipType: string;
  propertyUseType: string;
  value: string;
  rooms: string;
  hasBuildingPermit: string;
  permitNumber: string;
  excludedFromRating: boolean;
  comments: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockProperties: Property[] = [];

// ─── Constants ──────────────────────────────────────────────────────────────

const OWNERSHIP_TYPES = [
  'Private Individual',
  'Private Company',
  'Government',
  'State Enterprise',
  'Religious Body',
  'Traditional Authority',
  'Joint Ownership',
  'Other',
];

const propertyUseTypes = [
  '20121 : Residential : 3rd Class Residential : 420',
  '20122 : Residential : 2nd Class Residential : 520',
  '20123 : Residential : 1st Class Residential : 750',
  '20201 : Commercial : 3rd Class Commercial : 650',
  '20202 : Commercial : 2nd Class Commercial : 850',
  '20203 : Commercial : 1st Class Commercial : 1200',
  '20301 : Industrial : Light Industrial : 500',
  '20302 : Industrial : Heavy Industrial : 800',
  '20401 : Institutional : Educational : 400',
  '20402 : Institutional : Health : 450',
  '20501 : Mixed Use : Residential-Commercial : 900',
];

const propertyTypes = ['All', 'Residential', 'Commercial', 'Industrial', 'Institutional', 'Mixed Use'];
const occupancyStatuses = ['All', 'Occupied', 'Vacant', 'Under Construction'];

// ─── Component ───────────────────────────────────────────────────────────────

export function PropertiesPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [properties, setProperties] = useLocalStorage<Property[]>('rms-properties', mockProperties);
  const itemsPerPage = 10;

  // ── Form State ───────────────────────────────────────────────────────────
  const defaultForm = {
    propNumber: '',
    streetName: '',
    houseNo: '',
    streetCode: '',
    ghanaPostGPS: '',
    localityCode: '',
    ownerName: '',
    ownerAddress: '',
    ownerGPS: '',
    phone: '',
    email: '',
    tin: '',
    nationalId: '',
    ownershipType: '',
    propertyUseType: '',
    value: '',
    rooms: '',
    hasBuildingPermit: 'No',
    permitNumber: '',
    excludedFromRating: false,
    comments: '',
  };

  const [form, setForm] = useState(defaultForm);

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = properties.filter((p) => {
    const matchSearch =
      searchQuery === '' ||
      p.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.propNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.streetName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'All' || p.propertyUseType.toLowerCase().includes(typeFilter.toLowerCase());
    return matchSearch && matchType;
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
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    if (!form.ownerName || !form.propertyUseType) return;
    const newProp: Property = {
      propNumber: form.propNumber || `UPN-${String(properties.length + 1).padStart(4, '0')}`,
      ...form,
    };
    setProperties((prev) => [...prev, newProp]);
    setForm({ ...defaultForm });
    setView('list');
  };

  const handleCancel = () => {
    setView('list');
  };

  const handleDelete = (propNumber: string) => {
    setProperties((prev) => prev.filter((p) => p.propNumber !== propNumber));
  };

  // ── Form Helpers ─────────────────────────────────────────────────────────
  const inputClass =
    'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition';
  const labelClass =
    'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1';

  const cardClass = 'rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden';
  const cardHeaderClass = 'flex items-center gap-2.5 px-5 py-3.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700';
  const cardBodyClass = 'p-5 space-y-4';

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Occupied: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      Vacant: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
      'Under Construction': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status] || 'bg-slate-100 text-slate-600'}`}>
        {status}
      </span>
    );
  };

  const formatVal = (v: string) => {
    const n = parseFloat(v);
    if (isNaN(n)) return 'GH₵ 0';
    return `GH\u20b5 ${n.toLocaleString('en-GH')}`;
  };

  // ══════════════════════════════════════════════════════════════════════════
  //  LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════
  if (view === 'list') {
    return (
      <div className="space-y-6">
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Property Registration</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage and register properties within the assembly.
            </p>
          </div>
          <button
            onClick={() => setView('form')}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register New Property
          </button>
        </div>

        {/* ── Search & Filters ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by UPN, owner, or street..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className={`${inputClass} w-full sm:w-48`}
          >
            {propertyTypes.map((t) => (
              <option key={t} value={t}>{t === 'All' ? 'All Property Types' : t}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className={`${inputClass} w-full sm:w-48`}
          >
            {occupancyStatuses.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">UPN</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Owner</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Property Use Type</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Value</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Street</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 dark:text-slate-500">
                      <Home className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      No properties found.
                    </td>
                  </tr>
                ) : (
                  paged.map((prop) => (
                    <tr key={prop.propNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{prop.propNumber}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">{prop.ownerName}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap max-w-[200px] truncate">{prop.propertyUseType.split(':')[1] ? prop.propertyUseType.split(':')[1].trim() : prop.propertyUseType}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{formatVal(prop.value)}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{prop.streetName}</td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors cursor-pointer" title="Edit"><Pencil className="w-4 h-4" /></button>
                          <button onClick={() => handleDelete(prop.propNumber)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
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
          <p className="text-slate-500 dark:text-slate-400">Showing {showingFrom}-{showingTo} of {filtered.length}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safeCurrentPage <= 1} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">{safeCurrentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safeCurrentPage >= totalPages} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  FORM VIEW — 3-Card Layout
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button onClick={handleCancel} className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Register New Property</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Fill in the details below to register a new property.</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* ════════════════════════════════════════════════════════════════
           CARD 1: LOCATION
           ════════════════════════════════════════════════════════════════ */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Location</h2>
          </div>
          <div className={cardBodyClass}>
            {/* Row 1: Street Name (wider) | House No. | Street Code */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-5">
                <label className={labelClass}>Street Name</label>
                <input type="text" name="streetName" value={form.streetName} onChange={handleFormChange} placeholder="Enter street name" className={inputClass} />
              </div>
              <div className="col-span-6 sm:col-span-3">
                <label className={labelClass}>House No.</label>
                <input type="text" name="houseNo" value={form.houseNo} onChange={handleFormChange} placeholder="e.g. 26" className={inputClass} />
              </div>
              <div className="col-span-6 sm:col-span-4">
                <label className={labelClass}>Street Code</label>
                <input type="text" name="streetCode" value={form.streetCode} onChange={handleFormChange} placeholder="Enter code" className={inputClass} />
              </div>
            </div>
            {/* Row 2: GhanaPost GPS (with button) | Locality Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>GhanaPost GPS</label>
                <div className="relative">
                  <input type="text" name="ghanaPostGPS" value={form.ghanaPostGPS} onChange={handleFormChange} placeholder="XX-XXX-XXXX" className={`${inputClass} pr-10`} />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer" title="Get GPS">
                    <Crosshair className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div>
                <label className={labelClass}>Locality Code</label>
                <input type="text" name="localityCode" value={form.localityCode} onChange={handleFormChange} placeholder="Enter locality code" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
           CARD 2: OWNER INFORMATION
           ════════════════════════════════════════════════════════════════ */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Owner Information</h2>
          </div>
          <div className={cardBodyClass}>
            {/* Owner Name — full width */}
            <div>
              <label className={labelClass}>Owner Name <span className="text-red-500">*</span></label>
              <input type="text" name="ownerName" value={form.ownerName} onChange={handleFormChange} placeholder="Enter full name of property owner" className={inputClass} />
            </div>
            {/* Owner Address | Owner GhanaPost GPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Owner Address</label>
                <input type="text" name="ownerAddress" value={form.ownerAddress} onChange={handleFormChange} placeholder="Enter owner address" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Owner GhanaPost GPS</label>
                <input type="text" name="ownerGPS" value={form.ownerGPS} onChange={handleFormChange} placeholder="XX-XXX-XXXX" className={inputClass} />
              </div>
            </div>
            {/* Phone | Email | TIN — 3-column */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Phone <span className="text-red-500">*</span></label>
                <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} placeholder="e.g. 0544370388" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="name@example.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>TIN</label>
                <input type="text" name="tin" value={form.tin} onChange={handleFormChange} placeholder="Enter TIN" className={inputClass} />
              </div>
            </div>
            {/* National ID | Ownership Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>National ID</label>
                <input type="text" name="nationalId" value={form.nationalId} onChange={handleFormChange} placeholder="Enter national ID number" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Ownership Type</label>
                <select name="ownershipType" value={form.ownershipType} onChange={handleFormChange} className={inputClass}>
                  <option value="">Select type</option>
                  {OWNERSHIP_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
           CARD 3: PROPERTY INFORMATION
           ════════════════════════════════════════════════════════════════ */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Property Information</h2>
          </div>
          <div className={cardBodyClass}>
            {/* Property Use Type | Value (GHS) | Rooms — 3-column */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Property Use Type <span className="text-red-500">*</span></label>
                <select name="propertyUseType" value={form.propertyUseType} onChange={handleFormChange} className={inputClass}>
                  <option value="">Select use type</option>
                  {propertyUseTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Value (GHS)</label>
                <input type="number" name="value" value={form.value} onChange={handleFormChange} placeholder="0.00" min="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Rooms</label>
                <input type="number" name="rooms" value={form.rooms} onChange={handleFormChange} placeholder="e.g. 3" min="0" className={inputClass} />
              </div>
            </div>
            {/* Building Permit (radio) | Permit Number */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Building Permit</label>
                <div className="flex items-center gap-6 mt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hasBuildingPermit" value="Yes" checked={form.hasBuildingPermit === 'Yes'} onChange={handleFormChange} className="accent-emerald-600 w-4 h-4" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Yes</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="hasBuildingPermit" value="No" checked={form.hasBuildingPermit === 'No'} onChange={handleFormChange} className="accent-emerald-600 w-4 h-4" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">No</span>
                  </label>
                </div>
              </div>
              <div>
                <label className={labelClass}>Permit Number</label>
                <input type="text" name="permitNumber" value={form.permitNumber} onChange={handleFormChange} placeholder="Enter permit number" disabled={form.hasBuildingPermit === 'No'} className={`${inputClass} ${form.hasBuildingPermit === 'No' ? 'opacity-50 cursor-not-allowed' : ''}`} />
              </div>
            </div>
            {/* Excluded from rating checkbox */}
            <div className="flex items-center gap-2">
              <input type="checkbox" name="excludedFromRating" checked={form.excludedFromRating} onChange={handleFormChange} className="accent-emerald-600 w-4 h-4 rounded cursor-pointer" />
              <label htmlFor="excludedFromRating" className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">Excluded from rating</label>
            </div>
            {/* Comments — full width textarea */}
            <div>
              <label className={labelClass}>Comments</label>
              <textarea name="comments" value={form.comments} onChange={handleFormChange} rows={3} placeholder="Add any additional notes..." className={`${inputClass} resize-y`} />
            </div>
          </div>
        </div>

        {/* ─── Action Buttons ──────────────────────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            onClick={handleCancel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
