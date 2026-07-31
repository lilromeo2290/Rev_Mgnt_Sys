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
  Loader2,
  FileText,
  CalendarDays,
  UserCheck,
  DollarSign,
  Hash,
  Ruler,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Rent {
  id: string;
  upn: string;
  // Location
  streetName: string;
  houseNo: string;
  streetCode: string;
  neighbourhood: string;
  floor: string;
  doorNo: string;
  // Rent Object
  rentObjectName: string;
  rentClass: string;
  rentCategory: string;
  rentUnit: string;
  rentValue: string;
  vacant: string;
  // Contract
  startDate: string;
  endDate: string;
  contractId: string;
  contractValue: string;
  area: string;
  // Renter Information
  renterName: string;
  renterAddress: string;
  renterGps: string;
  phone: string;
  email: string;
  tin: string;
  nationalId: string;
  // Other
  excludedFromRenting: boolean;
  comments: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockRents: Rent[] = [];

// ─── Constants ──────────────────────────────────────────────────────────────

const RENT_CLASS_CATEGORIES: Record<string, string> = {
  'Bill Boards': 'Advertising',
  'Assembly Hall': 'Assembly Facilities',
  'Assembly Conference Room': 'Assembly Facilities',
  'Community Centres': 'Community Facilities',
  'Sub-district/Metro Halls': 'Community Facilities',
  'Assembly Forecourt': 'Assembly Facilities',
  'Others': 'Others',
  'Stores': 'Retail/Storage',
  'Stalls': 'Retail/Storage',
  'Sheds': 'Retail/Storage',
  'Rent of Undeveloped Lands': 'Land & Property',
  'Hiring of Parks': 'Parks & Recreation',
  'Rent on Leased Buildings': 'Land & Property',
  'Rent for Vendor Stands': 'Retail/Storage',
  'Guest House': 'Hospitality',
  'Restaurant/Canteen': 'Hospitality',
  'Club House': 'Hospitality',
  'Stadium': 'Recreation & Sports',
};

const RENT_CATEGORIES = [...new Set(Object.values(RENT_CLASS_CATEGORIES))];

const RENT_CLASSES = Object.keys(RENT_CLASS_CATEGORIES);

const RENT_UNITS = [
  'Whole Building',
  'Single Room',
  'Flat/Apartment',
  'Office Space',
  'Warehouse',
  'Shop/Stall',
  'Hall/Event Space',
  'Other',
];

const VACANT_OPTIONS = ['Yes', 'No'];

// ─── Component ───────────────────────────────────────────────────────────────

export function RentPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rents, setRents] = useLocalStorage<Rent[]>('rms-rents', mockRents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const itemsPerPage = 10;

  // ── Form State ───────────────────────────────────────────────────────────
  const defaultForm = {
    upn: '',
    streetName: '',
    houseNo: '',
    streetCode: '',
    neighbourhood: '',
    floor: '',
    doorNo: '',
    rentObjectName: '',
    rentClass: '',
    rentCategory: '',
    rentUnit: '',
    rentValue: '',
    vacant: 'No',
    startDate: '',
    endDate: '',
    contractId: '',
    contractValue: '',
    area: '',
    renterName: '',
    renterAddress: '',
    renterGps: '',
    phone: '',
    email: '',
    tin: '',
    nationalId: '',
    excludedFromRenting: false,
    comments: '',
  };

  const [form, setForm] = useState(defaultForm);
  const [locatingRenter, setLocatingRenter] = useState(false);

  // ── Geolocation ──────────────────────────────────────────────────────────
  const fetchGpsFromLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please enter the GPS address manually.');
      return;
    }
    setLocatingRenter(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const gpsString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        setForm((prev) => ({ ...prev, renterGps: gpsString }));
        setLocatingRenter(false);
      },
      (error) => {
        let message = 'Unable to retrieve location.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please allow location access in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable. Please try again or enter manually.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;
        }
        alert(message);
        setLocatingRenter(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = rents.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.renterName.toLowerCase().includes(q) ||
      r.upn.toLowerCase().includes(q) ||
      r.streetName.toLowerCase().includes(q) ||
      r.rentObjectName.toLowerCase().includes(q) ||
      r.rentClass.toLowerCase().includes(q) ||
      r.contractId.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const startIdx = (currentPage - 1) * itemsPerPage;
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
    } else if (name === 'rentClass') {
      // Auto-fill category when class is selected
      const cat = RENT_CLASS_CATEGORIES[value] || '';
      setForm((prev) => ({ ...prev, rentClass: value, rentCategory: cat }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    if (!form.upn || !form.renterName) return;
    if (editingId) {
      setRents((prev) =>
        prev.map((r) => (r.id === editingId ? { ...r, ...form } : r))
      );
      setEditingId(null);
    } else {
      const newRent: Rent = {
        id: `RNT-${Date.now()}`,
        ...form,
      };
      setRents((prev) => [...prev, newRent]);
    }
    setForm(defaultForm);
    setView('list');
  };

  const handleEdit = (rent: Rent) => {
    setForm({
      upn: rent.upn,
      streetName: rent.streetName,
      houseNo: rent.houseNo,
      streetCode: rent.streetCode,
      neighbourhood: rent.neighbourhood,
      floor: rent.floor,
      doorNo: rent.doorNo,
      rentObjectName: rent.rentObjectName,
      rentClass: rent.rentClass,
      rentCategory: rent.rentCategory || RENT_CLASS_CATEGORIES[rent.rentClass] || '',
      rentUnit: rent.rentUnit,
      rentValue: rent.rentValue,
      vacant: rent.vacant,
      startDate: rent.startDate,
      endDate: rent.endDate,
      contractId: rent.contractId,
      contractValue: rent.contractValue,
      area: rent.area,
      renterName: rent.renterName,
      renterAddress: rent.renterAddress,
      renterGps: rent.renterGps,
      phone: rent.phone,
      email: rent.email,
      tin: rent.tin,
      nationalId: rent.nationalId,
      excludedFromRenting: rent.excludedFromRenting,
      comments: rent.comments,
    });
    setEditingId(rent.id);
    setView('form');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this rent record?')) {
      setRents((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleCancel = () => {
    setForm(defaultForm);
    setEditingId(null);
    setView('list');
  };

  // ── Shared classes ──────────────────────────────────────────────────────
  const inputClass =
    'w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-500';
  const labelClass =
    'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5';
  const cardClass =
    'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 sm:p-6 mb-4';
  const cardHeaderClass =
    'flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700';
  const cardBodyClass = 'space-y-4';

  // ── List View ─────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Rent Management</h1>
            <button
              onClick={() => { setForm(defaultForm); setEditingId(null); setView('form'); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Rent
            </button>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by renter, UPN, street, rent object, class..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3">UPN</th>
                    <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3">Location</th>
                    <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3">Rent Object</th>
                    <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3">Renter</th>
                    <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3">Rent Value</th>
                    <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3">Vacant</th>
                    <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3">Status</th>
                    <th className="text-xs uppercase text-slate-500 dark:text-slate-400 font-medium px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                  {paged.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-500 dark:text-slate-400">
                        {searchQuery ? 'No rents match your search.' : 'No rents recorded yet. Click "Add Rent" to create one.'}
                      </td>
                    </tr>
                  ) : (
                    paged.map((rent) => (
                      <tr key={rent.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{rent.upn}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{rent.streetName}, {rent.houseNo}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">{rent.rentObjectName || '--NA--'}</td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{rent.renterName}</td>
                        <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{rent.rentValue ? `GHS ${Number(rent.rentValue).toLocaleString()}` : '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                            rent.vacant === 'Yes'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            {rent.vacant || 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex text-xs font-medium px-2 py-0.5 rounded-full ${
                            rent.excludedFromRenting
                              ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          }`}>
                            {rent.excludedFromRenting ? 'Excluded' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleEdit(rent)} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(rent.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  Showing {showingFrom}–{showingTo} of {filtered.length}
                </span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-slate-600 dark:text-slate-300 px-2">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 disabled:opacity-30 transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Form View ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={handleCancel} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {editingId ? 'Edit Rent' : 'Add Rent'}
              {form.upn ? ` — UPN: ${form.upn}` : ''}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleCancel} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
            <button onClick={handleSave} disabled={!form.upn || !form.renterName} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Save className="w-4 h-4" /> Save
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-6">
        {/* CARD 1: LOCATION */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Location</h2>
          </div>
          <div className={cardBodyClass}>
            {/* UPN — full width */}
            <div>
              <label className={labelClass}>UPN <span className="text-red-500">*</span></label>
              <input type="text" name="upn" value={form.upn} onChange={handleFormChange} placeholder="e.g. 865-0775-0553" className={inputClass} />
            </div>
            {/* Street Name | House No. — 2-column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Street Name</label>
                <input type="text" name="streetName" value={form.streetName} onChange={handleFormChange} placeholder="Enter street name" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>House No.</label>
                <input type="text" name="houseNo" value={form.houseNo} onChange={handleFormChange} placeholder="e.g. 26" className={inputClass} />
              </div>
            </div>
            {/* Street Code | Neighbourhood — 2-column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Street Code</label>
                <input type="text" name="streetCode" value={form.streetCode} onChange={handleFormChange} placeholder="Enter street code" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Neighbourhood</label>
                <input type="text" name="neighbourhood" value={form.neighbourhood} onChange={handleFormChange} placeholder="Enter neighbourhood" className={inputClass} />
              </div>
            </div>
            {/* Floor | Door No. — 2-column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Floor</label>
                <input type="text" name="floor" value={form.floor} onChange={handleFormChange} placeholder="e.g. 2nd" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Door No.</label>
                <input type="text" name="doorNo" value={form.doorNo} onChange={handleFormChange} placeholder="e.g. A1" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: RENT OBJECT */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Rent Object</h2>
          </div>
          <div className={cardBodyClass}>
            {/* Rent Object Name — full width */}
            <div>
              <label className={labelClass}>Rent Object Name</label>
              <input type="text" name="rentObjectName" value={form.rentObjectName} onChange={handleFormChange} placeholder="Enter rent object name" className={inputClass} />
            </div>
            {/* Rent Class | Category — 2-column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Rent Class</label>
                <select name="rentClass" value={form.rentClass} onChange={handleFormChange} className={inputClass}>
                  <option value="">Select rent class</option>
                  {RENT_CLASSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <select name="rentCategory" value={form.rentCategory} onChange={handleFormChange} disabled={!form.rentClass} className={inputClass}>
                  <option value="">{form.rentClass ? 'Category auto-filled' : 'Select class first'}</option>
                  {RENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Rent Unit | Rent Value — 2-column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Rent Unit</label>
                <select name="rentUnit" value={form.rentUnit} onChange={handleFormChange} className={inputClass}>
                  <option value="">Select unit</option>
                  {RENT_UNITS.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>
            </div>
            {/* Rent Value | Vacant — 2-column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Rent Value (GHS)</label>
                <input type="number" name="rentValue" value={form.rentValue} onChange={handleFormChange} placeholder="0.00" min="0" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Vacant</label>
                <select name="vacant" value={form.vacant} onChange={handleFormChange} className={inputClass}>
                  {VACANT_OPTIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: CONTRACT */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Contract</h2>
          </div>
          <div className={cardBodyClass}>
            {/* Start Date | End Date — 2-column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleFormChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>End Date</label>
                <input type="date" name="endDate" value={form.endDate} onChange={handleFormChange} className={inputClass} />
              </div>
            </div>
            {/* Contract ID | Contract Value — 2-column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Contract ID</label>
                <input type="text" name="contractId" value={form.contractId} onChange={handleFormChange} placeholder="Enter contract ID" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Contract Value (GHS)</label>
                <input type="number" name="contractValue" value={form.contractValue} onChange={handleFormChange} placeholder="0.00" min="0" className={inputClass} />
              </div>
            </div>
            {/* Area — full width */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Area (m²)</label>
                <input type="number" name="area" value={form.area} onChange={handleFormChange} placeholder="0.00" min="0" step="0.01" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 4: RENTER INFORMATION */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Renter Information</h2>
          </div>
          <div className={cardBodyClass}>
            {/* Renter Name — full width */}
            <div>
              <label className={labelClass}>Renter Name <span className="text-red-500">*</span></label>
              <input type="text" name="renterName" value={form.renterName} onChange={handleFormChange} placeholder="Enter full name of renter" className={inputClass} />
            </div>
            {/* Renter Address | Renter GhanaPost GPS — 2-column */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Renter Address</label>
                <input type="text" name="renterAddress" value={form.renterAddress} onChange={handleFormChange} placeholder="Enter renter address" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Renter GhanaPost GPS</label>
                <div className="flex gap-2">
                  <input type="text" name="renterGps" value={form.renterGps} onChange={handleFormChange} placeholder="e.g. AK-034-5521" className={`${inputClass} flex-1`} />
                  <button type="button" onClick={fetchGpsFromLocation} disabled={locatingRenter} className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50 transition-colors whitespace-nowrap" title="Use device GPS">
                    {locatingRenter ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                    {locatingRenter ? '...' : 'GPS'}
                  </button>
                </div>
              </div>
            </div>
            {/* Phone | Email | TIN — 3-column */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Phone</label>
                <input type="text" name="phone" value={form.phone} onChange={handleFormChange} placeholder="e.g. 024 XXX XXXX" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email</label>
                <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="email@example.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>TIN</label>
                <input type="text" name="tin" value={form.tin} onChange={handleFormChange} placeholder="Tax Identification Number" className={inputClass} />
              </div>
            </div>
            {/* National ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>National ID</label>
                <input type="text" name="nationalId" value={form.nationalId} onChange={handleFormChange} placeholder="e.g. GHA-XXXXXXXXX" className={inputClass} />
              </div>
            </div>
          </div>
        </div>

        {/* CARD 5: OTHER */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/30 flex items-center justify-center">
              <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            </div>
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Other</h2>
          </div>
          <div className={cardBodyClass}>
            {/* Excluded from renting */}
            <label className="inline-flex items-center gap-3 cursor-pointer">
              <input type="checkbox" name="excludedFromRenting" checked={form.excludedFromRenting} onChange={handleFormChange} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Excluded from renting</span>
            </label>
            {/* Comments */}
            <div>
              <label className={labelClass}>Comments</label>
              <textarea name="comments" value={form.comments} onChange={handleFormChange} rows={3} placeholder="Additional notes or comments" className={inputClass} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
