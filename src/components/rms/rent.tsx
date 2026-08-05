'use client';

import { useState, useRef } from 'react';
import { useSyncedStorage } from '@/hooks/use-synced-storage';
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
  Save,
  Crosshair,
  Loader2,
  X,
  FileText,
  CalendarDays,
  UserCheck,
  DollarSign,
  Hash,
  Ruler,
  Download,
  Upload,
} from 'lucide-react';
import { exportToExcel, importFromExcel, RENT_FIELDS } from '@/lib/import-export';
import { Combobox } from '@/components/ui/combobox';
import { LOCALITIES } from '@/lib/localities';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Rent {
  id: string;
  upn: string;
  // Location
  rentPropertyLocation: string;
  locationCode: string;
  exactLocation: string;
  propertyGhanaPostGPS: string;
  propertyLatitude: string;
  propertyLongitude: string;
  // Rent Object
  rentObjectName: string;
  rentCode: string;
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
  renterGhanaPostGPS: string;
  renterLatitude: string;
  renterLongitude: string;
  phone: string;
  email: string;
  tin: string;
  nationalId: string;
  // Other
  rentPT: string;
  rentPTCode: string;
  excludedFromRenting: boolean;
  comments: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockRents: Rent[] = [];

// ─── Constants ──────────────────────────────────────────────────────────────

// Rent Property Type → Categories → Codes (from official classification table)
const RENT_TYPE_CATEGORIES: Record<string, string[]> = {
  'Residential': ['1st Class Residential', '2nd Class Residential', '3rd Class Residential', '4th Class Residential', '5th Class Residential'],
  'Commercial': ['1st Class Commercial Area', '2nd Class Commercial Area', '3rd Class Commercial Area', '4th Class Commercial Area', '5th Class Commercial Area'],
  'Mixed Use': ['1st Class Mixed Development', '2nd Class Mixed Development', '3rd Class Mixed Development', '4th Class Mixed Development', '5th Class Mixed Development'],
  'Industrial Area': ['Light Industrial', 'Heavy Industrial', '3rd Class Industrial', '4th Class Industrial', '5th Class Industrial'],
  'Civic & Culture': ['Civic & Culture'],
  'Educational': ['Educational'],
  'Recreational': ['Recreational'],
  'Parastatals': ['1st Class', '2nd Class'],
  'Temporary Structure': ['Container', 'Wooden Kiosks/Sheds'],
};

const RENT_TYPE_CODE_MAP: Record<string, string> = {
  'Residential|1st Class Residential': '20101',
  'Residential|2nd Class Residential': '20111',
  'Residential|3rd Class Residential': '20121',
  'Residential|4th Class Residential': '20131',
  'Residential|5th Class Residential': '20141',
  'Commercial|1st Class Commercial Area': '20201',
  'Commercial|2nd Class Commercial Area': '20211',
  'Commercial|3rd Class Commercial Area': '20221',
  'Commercial|4th Class Commercial Area': '20231',
  'Commercial|5th Class Commercial Area': '20241',
  'Mixed Use|1st Class Mixed Development': '20301',
  'Mixed Use|2nd Class Mixed Development': '20311',
  'Mixed Use|3rd Class Mixed Development': '20321',
  'Mixed Use|4th Class Mixed Development': '20331',
  'Mixed Use|5th Class Mixed Development': '20341',
  'Industrial Area|Light Industrial': '20401',
  'Industrial Area|Heavy Industrial': '20402',
  'Industrial Area|3rd Class Industrial': '20411',
  'Industrial Area|4th Class Industrial': '20421',
  'Industrial Area|5th Class Industrial': '20431',
  'Civic & Culture|Civic & Culture': '20500',
  'Educational|Educational': '20601',
  'Recreational|Recreational': '20701',
  'Parastatals|1st Class': '20801',
  'Parastatals|2nd Class': '20811',
  'Temporary Structure|Container': '21101',
  'Temporary Structure|Wooden Kiosks/Sheds': '21102',
};

const RENT_TYPES = Object.keys(RENT_TYPE_CATEGORIES);

const VACANT_OPTIONS = ['Yes', 'No'];

// ─── Component ───────────────────────────────────────────────────────────────

export function RentPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rents, setRents] = useSyncedStorage<Rent[]>('rms-rents', mockRents);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const itemsPerPage = 10;

  // ── Import / Export ───────────────────────────────────────────────────────
  const handleExport = () => {
    if (rents.length === 0) { alert('No rent records to export.'); return; }
    exportToExcel(rents as unknown as Record<string, unknown>[], RENT_FIELDS, 'Rents');
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const imported = await importFromExcel<Rent>(file, RENT_FIELDS);
      if (imported.length === 0) { alert('No data found in the file.'); return; }
      const existing = new Map(rents.map((r) => [r.id, r]));
      for (const item of imported) {
        const key = item.id || `IMP-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        item.id = key;
        existing.set(key, item);
      }
      setRents(Array.from(existing.values()));
      alert(`${imported.length} rent record(s) imported successfully.`);
    } catch (err) {
      alert('Failed to import file. Please ensure it is a valid Excel file exported from this system.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Form State ───────────────────────────────────────────────────────────
  const defaultForm = {
    upn: '',
    rentPropertyLocation: '',
    locationCode: '',
    exactLocation: '',
    propertyGhanaPostGPS: '',
    propertyLatitude: '',
    propertyLongitude: '',
    rentObjectName: '',
    rentCode: '',
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
    renterGhanaPostGPS: '',
    renterLatitude: '',
    renterLongitude: '',
    phone: '',
    email: '',
    tin: '',
    nationalId: '',
    rentPT: '',
    rentPTCode: '',
    excludedFromRenting: false,
    comments: '',
  };

  const [form, setForm] = useState(defaultForm);
  const [locating, setLocating] = useState(false);

  /** Call our server-side proxy to get Ghana Post GPS address (avoids CORS) */
  const fetchGhanaPostGPS = async (lat: number, lon: number): Promise<string> => {
    try {
      const res = await fetch(`/api/ghana-post-gps?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      return data?.address || '';
    } catch {
      return '';
    }
  };

  /** Call our server-side proxy to get what3words address (avoids CORS) */
  const fetchWhat3Words = async (lat: number, lon: number): Promise<string> => {
    try {
      const res = await fetch(`/api/what3words?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      const words = data?.words || '';
      return words ? `///${words}` : '';
    } catch {
      return '';
    }
  };

  const reverseGeocode = async (lat: number, lon: number): Promise<{
    placeName: string;
    locationCode: string;
    ghanaPostGPS: string;
  }> => {
    try {
      // Run Nominatim, Ghana Post GPS, and what3words in parallel
      const [nominatimResult, ghanaPostGPS, w3w] = await Promise.all([
        // Nominatim (OpenStreetMap) for place name
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1&zoom=18&extratags=1&namedetails=1`,
          { headers: { 'User-Agent': 'RevMgmtSys/1.0' } }
        )
          .then((r) => r.json())
          .then((data) => {
            const addr = data.address || {};
            // Build a rich place name from best available parts
            const parts = [
              addr.road,
              addr.neighbourhood,
              addr.suburb,
              addr.hamlet,
              addr.village,
              addr.town,
              addr.city,
            ].filter(Boolean);
            const placeName = parts.length > 0
              ? parts.slice(0, 3).join(', ')
              : (data.display_name?.split(',').slice(0, 2).join(',').trim() || '');
            return { placeName, addr, display_name: data.display_name || '' };
          })
          .catch(() => ({ placeName: '', addr: {} as Record<string, string>, display_name: '' })),
        fetchGhanaPostGPS(lat, lon),
        fetchWhat3Words(lat, lon),
      ]);

      return {
        placeName: nominatimResult.placeName,
        locationCode: w3w,
        ghanaPostGPS,
      };
    } catch {
      return { placeName: '', locationCode: '', ghanaPostGPS: '' };
    }
  };

  const fetchGps = async () => {
    if (!navigator.geolocation) { alert('Geolocation is not supported.'); return; }
    setLocating(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
      });
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setForm((p) => ({ ...p, propertyLatitude: lat.toFixed(6), propertyLongitude: lon.toFixed(6) }));
      // Reverse geocode to auto-fill Exact Location, Location Code, and Ghana Post GPS
      const { placeName, locationCode: w3wCode, ghanaPostGPS } = await reverseGeocode(lat, lon);
      // Also try to match the Rent Property Location combobox
      const matchedLocality = (() => {
        const allText = `${placeName}`.toLowerCase();
        for (const loc of LOCALITIES) {
          if (allText.includes(loc.toLowerCase()) || loc.toLowerCase().includes(allText.split(',')[0].trim())) {
            return loc;
          }
        }
        // Try broader area match for the combobox
        for (const loc of LOCALITIES) {
          const areaWord = loc.split(' ')[0].toLowerCase();
          if (allText.includes(areaWord)) return loc;
        }
        return '';
      })();
      setForm((p) => ({
        ...p,
        rentPropertyLocation: matchedLocality || p.rentPropertyLocation,
        locationCode: w3wCode || p.locationCode,
        propertyGhanaPostGPS: ghanaPostGPS || p.propertyGhanaPostGPS,
      }));
    } catch (err) {
      alert('Unable to retrieve location: ' + (err instanceof GeolocationPositionError ? err.message : String(err)));
    } finally {
      setLocating(false);
    }
  };

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = rents.filter((r) => {
    const q = searchQuery.toLowerCase();
    return (
      r.renterName.toLowerCase().includes(q) ||
      r.upn.toLowerCase().includes(q) ||
      r.rentPropertyLocation.toLowerCase().includes(q) ||
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
      // Auto-fill category: if only one option, select it; otherwise reset
      const cats = RENT_TYPE_CATEGORIES[value] || [];
      const autoCat = cats.length === 1 ? cats[0] : '';
      const autoCode = autoCat ? (RENT_TYPE_CODE_MAP[`${value}|${autoCat}`] || '') : '';
      setForm((prev) => ({ ...prev, rentClass: value, rentCategory: autoCat, rentCode: autoCode }));
    } else if (name === 'rentCategory') {
      // Auto-fill code when category is selected
      const code = RENT_TYPE_CODE_MAP[`${form.rentClass}|${value}`] || '';
      setForm((prev) => ({ ...prev, rentCategory: value, rentCode: code }));
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
      rentPropertyLocation: rent.rentPropertyLocation,
      locationCode: rent.locationCode,
      exactLocation: rent.exactLocation,
      propertyGhanaPostGPS: rent.propertyGhanaPostGPS,
      propertyLatitude: rent.propertyLatitude,
      propertyLongitude: rent.propertyLongitude,
      rentObjectName: rent.rentObjectName,
      rentCode: rent.rentCode || '',
      rentClass: rent.rentClass,
      rentCategory: rent.rentCategory || (RENT_TYPE_CATEGORIES[rent.rentClass]?.[0]) || '',
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
      renterGhanaPostGPS: rent.renterGhanaPostGPS,
      renterLatitude: rent.renterLatitude,
      renterLongitude: rent.renterLongitude,
      phone: rent.phone,
      email: rent.email,
      tin: rent.tin,
      nationalId: rent.nationalId,
      rentPT: (rent as any).rentPT || '',
      rentPTCode: (rent as any).rentPTCode || '',
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
  const inputClass =     'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition';
  const labelClass =     'block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1.5';
  const cardClass =     'bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden';
  const cardHeaderClass =     'flex items-center gap-2.5 px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700';
  const cardBodyClass = 'p-5';

  // ── List View ─────────────────────────────────────────────────────────────
  if (view === 'list') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setForm(defaultForm); setEditingId(null); setView('form'); }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Rent
            </button>
            <button onClick={handleExport} className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap">
              <Download className="w-4 h-4" /> Export
            </button>
            <button onClick={() => fileInputRef.current?.click()} className="inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium px-3 py-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors whitespace-nowrap">
              <Upload className="w-4 h-4" /> Import
            </button>
            <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleImport} className="hidden" />
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
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{rent.rentPropertyLocation || rent.exactLocation || '-'}</td>
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

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        {/* CARD 1: LOCATION */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <MapPin className="w-4.5 h-4.5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Location</h2>
          </div>
          <div className={cardBodyClass}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
              <div className="sm:col-span-2 lg:col-span-3">
                <label className={`${labelClass} block`}>Rent Property Location</label>
                <Combobox
                  name="rentPropertyLocation"
                  value={form.rentPropertyLocation}
                  onChange={(e) => {
                    setForm((p) => ({
                      ...p,
                      rentPropertyLocation: e.target.value,
                    }));
                  }}
                  options={LOCALITIES.map((loc) => ({ value: loc, label: loc }))}
                  placeholder="Type to search location..."
                  emptyMessage="No location found"
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={`${labelClass} block`}>Location Code (what3words)</label>
                <div className="flex gap-1.5">
                  <input type="text" name="locationCode" value={form.locationCode} onChange={handleFormChange} placeholder="///word.word.word" className={inputClass} />
                  <button type="button" onClick={async () => {
                    const lat = parseFloat(form.propertyLatitude);
                    const lon = parseFloat(form.propertyLongitude);
                    if (!lat || !lon) { alert('Enter GPS coordinates first, or use the detect button.'); return; }
                    setLocating(true);
                    try {
                      const w3w = await fetchWhat3Words(lat, lon);
                      if (w3w) {
                        setForm((p) => ({ ...p, locationCode: w3w }));
                      } else {
                        alert('Could not determine what3words address. Ensure WHAT3WORDS_API_KEY is set in Vercel environment variables.');
                      }
                    } finally { setLocating(false); }
                  }} disabled={locating || !form.propertyLatitude || !form.propertyLongitude} className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium transition-colors" title="Lookup what3words from coordinates">
                    {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={`${labelClass} block`}>Exact Location</label>
                <input type="text" name="exactLocation" value={form.exactLocation} onChange={handleFormChange} placeholder="Enter exact location description" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={`${labelClass} block`}>Ghana Post GPS / Digital Address</label>
                <div className="flex gap-1.5">
                  <input type="text" name="propertyGhanaPostGPS" value={form.propertyGhanaPostGPS} onChange={handleFormChange} placeholder="XX-XXX-XXXX" className={inputClass} />
                  <button type="button" onClick={async () => {
                    const lat = parseFloat(form.propertyLatitude);
                    const lon = parseFloat(form.propertyLongitude);
                    if (!lat || !lon) { alert('Enter GPS coordinates first, or use the detect button.'); return; }
                    setLocating(true);
                    try {
                      const gps = await fetchGhanaPostGPS(lat, lon);
                      if (gps) {
                        setForm((p) => ({ ...p, propertyGhanaPostGPS: gps }));
                      } else {
                        alert('Could not determine Ghana Post GPS address for these coordinates. Please enter it manually (e.g. VO-123-4567).');
                      }
                    } finally { setLocating(false); }
                  }} disabled={locating || !form.propertyLatitude || !form.propertyLongitude} className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium transition-colors" title="Lookup Ghana Post GPS from coordinates">
                    {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={`${labelClass} block`}>GPS Coordinates (Lat/Long)</label>
                <div className="flex gap-1.5">
                  <input type="text" name="propertyLatitude" value={form.propertyLatitude} onChange={handleFormChange} placeholder="Latitude e.g. 5.603717" className={inputClass} />
                  <input type="text" name="propertyLongitude" value={form.propertyLongitude} onChange={handleFormChange} placeholder="Longitude e.g. -0.187028" className={inputClass} />
                  <button type="button" onClick={fetchGps} disabled={locating} className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-medium transition-colors" title="Detect GPS">
                    {locating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Crosshair className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2: RENT OBJECT */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <Building2 className="w-4.5 h-4.5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Rent Property Information</h2>
          </div>
          <div className={cardBodyClass}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
              <div>
                <label className={`${labelClass} block`}>Rent Property Number <span className="text-red-500">*</span></label>
                <input type="text" name="upn" value={form.upn} onChange={handleFormChange} placeholder="e.g. 865-0775-0553" className={inputClass} />
              </div>
              <div>
                <label className={`${labelClass} block`}>Rent Property Type Code</label>
                <input type="text" name="rentCode" value={form.rentCode} readOnly className={`${inputClass} bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed`} placeholder="Auto-filled" />
              </div>
              <div>
                <label className={`${labelClass} block`}>Rent Property Type</label>
                <select name="rentClass" value={form.rentClass} onChange={handleFormChange} className={inputClass}>
                  <option value="">Select type</option>
                  {RENT_TYPES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`${labelClass} block`}>Rent Property Category</label>
                <select name="rentCategory" value={form.rentCategory} onChange={handleFormChange} disabled={!form.rentClass} className={inputClass}>
                  <option value="">{form.rentClass ? 'Select category' : 'Select type first'}</option>
                  {(RENT_TYPE_CATEGORIES[form.rentClass] || []).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`${labelClass} block`}>Amount (GHS)</label>
                <input type="number" name="rentValue" value={form.rentValue} onChange={handleFormChange} placeholder="0.00" min="0" className={inputClass} />
              </div>
              <div>
                <label className={`${labelClass} block`}>Vacant</label>
                <select name="vacant" value={form.vacant} onChange={handleFormChange} className={inputClass}>
                  {VACANT_OPTIONS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: RENTER INFORMATION */}
        <div className={cardClass}>
          <div className={cardHeaderClass}>
            <User className="w-4.5 h-4.5 text-slate-600 dark:text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Occupant's Information</h2>
          </div>
          <div className={cardBodyClass}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-4">
              <div>
                <label className={`${labelClass} block`}>Unique ID</label>
                <input type="text" value={editingId || 'Auto-generated on save'} readOnly className={`${inputClass} bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 cursor-not-allowed font-mono text-xs`} />
              </div>
              <div className="sm:col-span-2 lg:col-span-2">
                <label className={`${labelClass} block`}>Occupant's Name <span className="text-red-500">*</span></label>
                <input type="text" name="renterName" value={form.renterName} onChange={handleFormChange} placeholder="Enter full name of occupant" className={inputClass} />
              </div>
              <div>
                <label className={`${labelClass} block`}>National ID Number</label>
                <input type="text" name="nationalId" value={form.nationalId} onChange={handleFormChange} placeholder="e.g. GHA-XXXXXXXXX" className={inputClass} />
              </div>
              <div className="sm:col-span-2">
                <label className={`${labelClass} block`}>Address</label>
                <input type="text" name="renterAddress" value={form.renterAddress} onChange={handleFormChange} placeholder="Enter occupant address" className={inputClass} />
              </div>
              <div>
                <label className={`${labelClass} block`}>Phone Number</label>
                <input type="text" name="phone" value={form.phone} onChange={handleFormChange} placeholder="e.g. 024 XXX XXXX" className={inputClass} />
              </div>
              <div>
                <label className={`${labelClass} block`}>Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="email@example.com" className={inputClass} />
              </div>
              <div>
                <label className={`${labelClass} block`}>Rent PT</label>
                <input type="text" name="rentPT" value={form.rentPT} onChange={handleFormChange} placeholder="Enter Rent PT" className={inputClass} />
              </div>
              <div>
                <label className={`${labelClass} block`}>Rent PT Code</label>
                <input type="text" name="rentPTCode" value={form.rentPTCode} onChange={handleFormChange} placeholder="Enter Rent PT Code" className={inputClass} />
              </div>
            </div>
          </div>
        </div>
        {/* ─── Action Buttons ──────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={handleCancel} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-500 hover:bg-slate-600 text-white text-sm font-medium transition-colors">
            <X className="w-4 h-4" />
            Cancel
          </button>
          <button onClick={handleSave} disabled={!form.upn || !form.renterName} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Save className="w-4 h-4" />
            {editingId ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

