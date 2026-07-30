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
  Upload,
  Home,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Property {
  propNumber: string;
  owner: string;
  ownerContact: string;
  propertyType: string;
  category: string;
  floors: number;
  rooms: number;
  propertyUse: string;
  valuation: number;
  occupancyStatus: 'Occupied' | 'Vacant' | 'Under Construction';
  buildingPermit: string;
  gpsCoordinates: string;
  digitalAddress: string;
  plotNumber: string;
  streetName: string;
  ward: string;
  electoralArea: string;
  zone: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockProperties: Property[] = [];

// ─── Constants ──────────────────────────────────────────────────────────────

const propertyTypes = [
  'Residential',
  'Commercial',
  'Industrial',
  'Institutional',
  'Mixed Use',
  'Vacant Land',
];

const occupancyStatuses = ['All', 'Occupied', 'Vacant', 'Under Construction'];

const propertyCategories: Record<string, string[]> = {
  Residential: [
    'Single Family Home',
    'Apartment Block',
    'Townhouse',
    'Duplex',
    'Bungalow',
    'Compound House',
  ],
  Commercial: [
    'Office Complex',
    'Shopping Mall',
    'Retail Store',
    'Hotel',
    'Restaurant Building',
    'Warehouse',
  ],
  Industrial: [
    'Warehouse / Factory',
    'Processing Plant',
    'Workshop',
    'Cold Storage',
    'Heavy Industrial',
  ],
  Institutional: [
    'School Building',
    'Hospital / Clinic Building',
    'Church / Religious Building',
    'Government Building',
    'Community Centre',
  ],
  'Mixed Use': [
    'Commercial-Residential Block',
    'Retail-Office Hybrid',
    'Live-Work Space',
  ],
  'Vacant Land': [
    'Undeveloped Plot',
    'Agricultural Land',
    'Future Development Plot',
  ],
};

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
  const [form, setForm] = useState({
    propNumber: '',
    owner: '',
    ownerContact: '',
    propertyType: '',
    category: '',
    floors: '',
    rooms: '',
    propertyUse: '',
    valuation: '',
    occupancyStatus: 'Occupied',
    buildingPermit: '',
    gpsCoordinates: '',
    digitalAddress: '',
    plotNumber: '',
    streetName: '',
    ward: '',
    electoralArea: '',
    zone: '',
  });

  // ── Derived categories based on selected property type ──────────────────
  const availableCategories = form.propertyType
    ? propertyCategories[form.propertyType] || []
    : [];

  // ── Filtering & Pagination ───────────────────────────────────────────────
  const filtered = properties.filter((p) => {
    const matchSearch =
      searchQuery === '' ||
      p.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.propNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.streetName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = typeFilter === 'All' || p.propertyType === typeFilter;
    const matchStatus =
      statusFilter === 'All' || p.occupancyStatus === statusFilter;
    return matchSearch && matchType && matchStatus;
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
      if (name === 'propertyType') {
        updated.category = '';
      }
      return updated;
    });
  };

  const handleSave = () => {
    if (!form.owner || !form.propertyType) return;
    const newProp: Property = {
      propNumber: form.propNumber || `PROP-${String(properties.length + 1).padStart(4, '0')}`,
      owner: form.owner,
      ownerContact: form.ownerContact,
      propertyType: form.propertyType,
      category: form.category,
      floors: parseInt(form.floors) || 1,
      rooms: parseInt(form.rooms) || 1,
      propertyUse: form.propertyUse,
      valuation: parseFloat(form.valuation) || 0,
      occupancyStatus: (form.occupancyStatus as 'Occupied' | 'Vacant' | 'Under Construction') || 'Occupied',
      buildingPermit: form.buildingPermit,
      gpsCoordinates: form.gpsCoordinates,
      digitalAddress: form.digitalAddress,
      plotNumber: form.plotNumber,
      streetName: form.streetName,
      ward: form.ward,
      electoralArea: form.electoralArea,
      zone: form.zone,
    };
    setProperties((prev) => [...prev, newProp]);
    setForm({
      propNumber: '', owner: '', ownerContact: '', propertyType: '', category: '', floors: '', rooms: '', propertyUse: '', valuation: '', occupancyStatus: 'Occupied', buildingPermit: '', gpsCoordinates: '', digitalAddress: '', plotNumber: '', streetName: '', ward: '', electoralArea: '', zone: '',
    });
    setView('list');
  };

  const handleCancel = () => {
    setView('list');
  };

  const handleDelete = (propNumber: string) => {
    setProperties((prev) => prev.filter((p) => p.propNumber !== propNumber));
  };

  // ── Form Field Helper ────────────────────────────────────────────────────
  const inputClass =
    'w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition';
  const labelClass =
    'text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5';
  const sectionHeaderClass =
    'text-lg font-semibold text-slate-900 dark:text-white mb-4 pb-2 border-b border-slate-200 dark:border-slate-700';

  // ── Status Badge Helper ─────────────────────────────────────────────────
  const statusBadge = (status: Property['occupancyStatus']) => {
    const styles: Record<
      Property['occupancyStatus'],
      string
    > = {
      Occupied:
        'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
      Vacant:
        'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
      'Under Construction':
        'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
    };
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  // ── Format Valuation ────────────────────────────────────────────────────
  const formatValuation = (amount: number) =>
    amount.toLocaleString('en-GH');

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
              Property Registration
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage and register properties within the assembly. Track
              valuations, occupancy, and rates collection.
            </p>
          </div>
          <button
            onClick={() => setView('form')}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors whitespace-nowrap"
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
              placeholder="Search by property number, owner, or street..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={`${inputClass} w-full sm:w-48`}
          >
            <option value="All">All Property Types</option>
            {propertyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className={`${inputClass} w-full sm:w-48`}
          >
            {occupancyStatuses.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Occupancy Statuses' : s}
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
                    Property #
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Owner
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Property Type
                  </th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hidden lg:table-cell">
                    Category
                  </th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    Valuation
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
                      colSpan={7}
                      className="text-center py-12 text-slate-400 dark:text-slate-500"
                    >
                      <Home className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      No properties found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  paged.map((prop) => (
                    <tr
                      key={prop.propNumber}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {prop.propNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                        {prop.owner}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                        {prop.propertyType}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap hidden lg:table-cell">
                        {prop.category}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        GH₵ {formatValuation(prop.valuation)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {statusBadge(prop.occupancyStatus)}
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
                            onClick={() => handleDelete(prop.propNumber)}
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
            Register New Property
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Fill in the details below to register a new property.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* ─── Section 1: Property Details ──────────────────────────────── */}
        <section>
          <h2 className={sectionHeaderClass}>Property Details</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Property Number */}
            <div>
              <label className={`${labelClass} block`}>Property Number</label>
              <input
                type="text"
                name="propNumber"
                value={form.propNumber}
                onChange={handleFormChange}
                placeholder="e.g. PRP-2024-011"
                className={inputClass}
              />
            </div>

            {/* Property Owner */}
            <div>
              <label className={`${labelClass} block`}>Property Owner</label>
              <input
                type="text"
                name="owner"
                value={form.owner}
                onChange={handleFormChange}
                placeholder="Enter full name of property owner"
                className={inputClass}
              />
            </div>

            {/* Owner Contact */}
            <div>
              <label className={`${labelClass} block`}>Owner Contact</label>
              <input
                type="tel"
                name="ownerContact"
                value={form.ownerContact}
                onChange={handleFormChange}
                placeholder="e.g. +233 24 567 8901"
                className={inputClass}
              />
            </div>

            {/* Property Type */}
            <div>
              <label className={`${labelClass} block`}>Property Type</label>
              <select
                name="propertyType"
                value={form.propertyType}
                onChange={handleFormChange}
                className={inputClass}
              >
                <option value="">Select property type</option>
                {propertyTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Property Category */}
            <div>
              <label className={`${labelClass} block`}>Property Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleFormChange}
                disabled={availableCategories.length === 0}
                className={`${inputClass} ${availableCategories.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <option value="">
                  {form.propertyType
                    ? 'Select category'
                    : 'Select a property type first'}
                </option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Floors */}
            <div>
              <label className={`${labelClass} block`}>Number of Floors</label>
              <input
                type="number"
                name="floors"
                value={form.floors}
                onChange={handleFormChange}
                placeholder="e.g. 2"
                min="0"
                className={inputClass}
              />
            </div>

            {/* Number of Rooms */}
            <div>
              <label className={`${labelClass} block`}>Number of Rooms</label>
              <input
                type="number"
                name="rooms"
                value={form.rooms}
                onChange={handleFormChange}
                placeholder="e.g. 8"
                min="0"
                className={inputClass}
              />
            </div>

            {/* Property Use */}
            <div>
              <label className={`${labelClass} block`}>Property Use</label>
              <input
                type="text"
                name="propertyUse"
                value={form.propertyUse}
                onChange={handleFormChange}
                placeholder="e.g. Private Residence"
                className={inputClass}
              />
            </div>

            {/* Valuation */}
            <div>
              <label className={`${labelClass} block`}>Valuation (GH₵)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-slate-400 font-medium">
                  GH₵
                </span>
                <input
                  type="number"
                  name="valuation"
                  value={form.valuation}
                  onChange={handleFormChange}
                  placeholder="e.g. 450000"
                  min="0"
                  className={`${inputClass} pl-14`}
                />
              </div>
            </div>

            {/* Occupancy Status */}
            <div>
              <label className={`${labelClass} block`}>Occupancy Status</label>
              <select
                name="occupancyStatus"
                value={form.occupancyStatus}
                onChange={handleFormChange}
                className={inputClass}
              >
                <option value="Occupied">Occupied</option>
                <option value="Vacant">Vacant</option>
                <option value="Under Construction">Under Construction</option>
              </select>
            </div>

            {/* Building Permit Number */}
            <div>
              <label className={`${labelClass} block`}>
                Building Permit Number
              </label>
              <input
                type="text"
                name="buildingPermit"
                value={form.buildingPermit}
                onChange={handleFormChange}
                placeholder="e.g. BP-KMA-2024-0111"
                className={inputClass}
              />
            </div>
          </div>
        </section>

        {/* ─── Section 2: Location ──────────────────────────────────────── */}
        <section>
          <h2 className={sectionHeaderClass}>Location</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* GPS Coordinates */}
            <div>
              <label className={`${labelClass} block`}>GPS Coordinates</label>
              <input
                type="text"
                name="gpsCoordinates"
                value={form.gpsCoordinates}
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

            {/* Plot Number */}
            <div>
              <label className={`${labelClass} block`}>Plot Number</label>
              <input
                type="text"
                name="plotNumber"
                value={form.plotNumber}
                onChange={handleFormChange}
                placeholder="e.g. BLK-A/LOT-12"
                className={inputClass}
              />
            </div>

            {/* Street Name */}
            <div>
              <label className={`${labelClass} block`}>Street Name</label>
              <input
                type="text"
                name="streetName"
                value={form.streetName}
                onChange={handleFormChange}
                placeholder="e.g. Kejetia Road"
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
          </div>
        </section>

        {/* ─── Section 3: Documents ────────────────────────────────────── */}
        <section>
          <h2 className={sectionHeaderClass}>Documents</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Property Photograph */}
            <div>
              <label className={`${labelClass} block`}>
                Property Photograph
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="property-photo"
                />
                <label
                  htmlFor="property-photo"
                  className={`${inputClass} flex items-center justify-center gap-2 cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 transition-colors py-8 border-dashed`}
                >
                  <Upload className="w-5 h-5 text-slate-400" />
                  <span className="text-slate-500 dark:text-slate-400">
                    Click to upload property photograph
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
                  id="property-docs"
                />
                <label
                  htmlFor="property-docs"
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
            Save Property
          </button>
        </div>
      </div>
    </div>
  );
}
