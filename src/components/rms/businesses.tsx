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

const mockBusinesses: Business[] = [
  {
    regNumber: 'BIZ-2024-001',
    name: 'Kumasi Pharmacy',
    owner: 'Nana Akwasi Mensah',
    type: 'Pharmacy',
    category: 'Healthcare',
    subCategory: 'Retail Pharmacy',
    tin: 'TIN-9087654321',
    status: 'Active',
    dateRegistered: '2024-01-15',
    ghanaCard: 'GHA-123456789-0',
    phone: '+233 24 567 8901',
    email: 'nana.mensah@email.com',
    gpsAddress: 'AK-034-5521',
    digitalAddress: 'AK-034-5521',
    residentialAddress: '12 Kejetia Road, Kumasi',
    businessAddress: '24 Ahodwo Roundabout, Kumasi',
    ward: 'Ahodwo',
    electoralArea: 'Bantama',
    zone: 'Zone A',
    revenueArea: 'Bantama Revenue Area',
    licenseNumber: 'LIC-PH-2024-001',
  },
  {
    regNumber: 'BIZ-2024-002',
    name: 'Royal Hotel',
    owner: 'Kwame Asante',
    type: 'Hotel',
    category: 'Hospitality',
    subCategory: 'Three-Star Hotel',
    tin: 'TIN-8076543210',
    status: 'Active',
    dateRegistered: '2024-02-03',
    ghanaCard: 'GHA-234567890-1',
    phone: '+233 20 123 4567',
    email: 'royal.hotel@email.com',
    gpsAddress: 'GA-512-8932',
    digitalAddress: 'GA-512-8932',
    residentialAddress: '5 Liberation Road, Accra',
    businessAddress: '10 Independence Avenue, Accra',
    ward: 'Osu',
    electoralArea: 'Osu Klottey',
    zone: 'Zone C',
    revenueArea: 'Korle Klottey Revenue Area',
    licenseNumber: 'LIC-HT-2024-002',
  },
  {
    regNumber: 'BIZ-2024-003',
    name: "Osei Barbershop",
    owner: 'Kofi Osei',
    type: 'Barbering Salon',
    category: 'Personal Care',
    subCategory: 'Gents Barbershop',
    tin: 'TIN-7065432109',
    status: 'Active',
    dateRegistered: '2024-02-20',
    ghanaCard: 'GHA-345678901-2',
    phone: '+233 27 987 6543',
    email: 'osei.barber@email.com',
    gpsAddress: 'AK-078-3345',
    digitalAddress: 'AK-078-3345',
    residentialAddress: '8 Tafo Road, Kumasi',
    businessAddress: '15 Tafo Road, Kumasi',
    ward: 'Tafo',
    electoralArea: 'Tafo Pankrono',
    zone: 'Zone B',
    revenueArea: 'Tafo Revenue Area',
    licenseNumber: 'LIC-BB-2024-003',
  },
  {
    regNumber: 'BIZ-2024-004',
    name: 'Mama Afia Restaurant',
    owner: 'Afia Boateng',
    type: 'Restaurant',
    category: 'Food & Beverage',
    subCategory: 'Local Cuisine',
    tin: 'TIN-6054321098',
    status: 'Active',
    dateRegistered: '2024-03-10',
    ghanaCard: 'GHA-456789012-3',
    phone: '+233 50 234 5678',
    email: 'afia.rest@email.com',
    gpsAddress: 'AK-092-7781',
    digitalAddress: 'AK-092-7781',
    residentialAddress: '3 Suame Magazine, Kumasi',
    businessAddress: '7 Suame Roundabout, Kumasi',
    ward: 'Suame',
    electoralArea: 'Suame',
    zone: 'Zone D',
    revenueArea: 'Suame Revenue Area',
    licenseNumber: 'LIC-RS-2024-004',
  },
  {
    regNumber: 'BIZ-2024-005',
    name: 'Cool Breeze Cold Store',
    owner: 'Emmanuel Tetteh',
    type: 'Cold Store',
    category: 'Retail',
    subCategory: 'Frozen Foods',
    tin: 'TIN-5043210987',
    status: 'Inactive',
    dateRegistered: '2024-03-25',
    ghanaCard: 'GHA-567890123-4',
    phone: '+233 26 345 6789',
    email: 'cool.breeze@email.com',
    gpsAddress: 'GA-201-4456',
    digitalAddress: 'GA-201-4456',
    residentialAddress: '18 Teshie Road, Accra',
    businessAddress: '22 Teshie Nungua Road, Accra',
    ward: 'Teshie',
    electoralArea: 'Teshie Nungua',
    zone: 'Zone E',
    revenueArea: 'Korle Klottey Revenue Area',
    licenseNumber: 'LIC-CS-2024-005',
  },
  {
    regNumber: 'BIZ-2024-006',
    name: 'Abossey Okai Supermarket',
    owner: 'Adwoa Frimpong',
    type: 'Supermarket',
    category: 'Retail',
    subCategory: 'General Merchandise',
    tin: 'TIN-4032109876',
    status: 'Active',
    dateRegistered: '2024-04-12',
    ghanaCard: 'GHA-678901234-5',
    phone: '+233 24 678 9012',
    email: 'abossey.shop@email.com',
    gpsAddress: 'GA-305-6678',
    digitalAddress: 'GA-305-6678',
    residentialAddress: '9 Abossey Okai, Accra',
    businessAddress: '14 Abossey Okai, Accra',
    ward: 'Abossey Okai',
    electoralArea: 'Ablekuma South',
    zone: 'Zone F',
    revenueArea: 'Ablekuma Revenue Area',
    licenseNumber: 'LIC-SM-2024-006',
  },
  {
    regNumber: 'BIZ-2024-007',
    name: 'Goil Fuel Station - Konongo',
    owner: 'Kwabena Darko',
    type: 'Fuel Station',
    category: 'Energy',
    subCategory: 'Petroleum Retail',
    tin: 'TIN-3021098765',
    status: 'Active',
    dateRegistered: '2024-05-01',
    ghanaCard: 'GHA-789012345-6',
    phone: '+233 20 890 1234',
    email: 'darko.fuel@email.com',
    gpsAddress: 'AK-156-2290',
    digitalAddress: 'AK-156-2290',
    residentialAddress: '6 Konongo Road, Kumasi',
    businessAddress: '1 Accra-Kumasi Highway, Konongo',
    ward: 'Konongo',
    electoralArea: 'Asante Akim Central',
    zone: 'Zone G',
    revenueArea: 'Asante Akim Revenue Area',
    licenseNumber: 'LIC-FS-2024-007',
  },
  {
    regNumber: 'BIZ-2024-008',
    name: 'Grace Hair Salon',
    owner: 'Grace Amponsah',
    type: 'Hair Salon',
    category: 'Personal Care',
    subCategory: 'Ladies Hair Salon',
    tin: 'TIN-2010987654',
    status: 'Active',
    dateRegistered: '2024-05-18',
    ghanaCard: 'GHA-890123456-7',
    phone: '+233 50 567 8901',
    email: 'grace.salon@email.com',
    gpsAddress: 'AK-045-8812',
    digitalAddress: 'AK-045-8812',
    residentialAddress: '10 Nhyiaeso, Kumasi',
    businessAddress: '16 Nhyiaeso, Kumasi',
    ward: 'Nhyiaeso',
    electoralArea: 'Nhyiaeso',
    zone: 'Zone A',
    revenueArea: 'Nhyiaeso Revenue Area',
    licenseNumber: 'LIC-HS-2024-008',
  },
  {
    regNumber: 'BIZ-2024-009',
    name: 'Hope Medical Clinic',
    owner: 'Dr. Yaw Ofori',
    type: 'Clinic',
    category: 'Healthcare',
    subCategory: 'General Practice',
    tin: 'TIN-1009876543',
    status: 'Active',
    dateRegistered: '2024-06-05',
    ghanaCard: 'GHA-901234567-8',
    phone: '+233 27 123 4567',
    email: 'dr.ofori@email.com',
    gpsAddress: 'GA-408-1123',
    digitalAddress: 'GA-408-1123',
    residentialAddress: '25 Madina Road, Accra',
    businessAddress: '30 Madina Estate, Accra',
    ward: 'Madina',
    electoralArea: 'Madina',
    zone: 'Zone H',
    revenueArea: 'La Nkwantanang Revenue Area',
    licenseNumber: 'LIC-CL-2024-009',
  },
  {
    regNumber: 'BIZ-2024-010',
    name: 'St. Johns Catholic Hospital',
    owner: 'Rev. Fr. Peter Agyeman',
    type: 'Hospital',
    category: 'Healthcare',
    subCategory: 'Faith-Based Hospital',
    tin: 'TIN-0098765432',
    status: 'Active',
    dateRegistered: '2024-06-22',
    ghanaCard: 'GHA-012345678-9',
    phone: '+233 20 456 7890',
    email: 'st.johns@email.com',
    gpsAddress: 'AK-223-6674',
    digitalAddress: 'AK-223-6674',
    residentialAddress: '50 Manhyia, Kumasi',
    businessAddress: '55 Manhyia Palace Road, Kumasi',
    ward: 'Manhyia',
    electoralArea: 'Manhyia South',
    zone: 'Zone C',
    revenueArea: 'Manhyia Revenue Area',
    licenseNumber: 'LIC-HO-2024-010',
  },
  {
    regNumber: 'BIZ-2024-011',
    name: 'Good Shepherd School Complex',
    owner: 'Mrs. Elizabeth Owusu',
    type: 'School',
    category: 'Education',
    subCategory: 'Basic Education (K-9)',
    tin: 'TIN-9987654321',
    status: 'Inactive',
    dateRegistered: '2024-07-10',
    ghanaCard: 'GHA-112233445-6',
    phone: '+233 24 789 0123',
    email: 'owusu.school@email.com',
    gpsAddress: 'AK-310-9901',
    digitalAddress: 'AK-310-9901',
    residentialAddress: '40 Dichemso, Kumasi',
    businessAddress: '45 Dichemso, Kumasi',
    ward: 'Dichemso',
    electoralArea: 'Dichemso',
    zone: 'Zone D',
    revenueArea: 'Asokwa Revenue Area',
    licenseNumber: 'LIC-SC-2024-011',
  },
  {
    regNumber: 'BIZ-2024-012',
    name: 'Apex Manufacturing Ltd',
    owner: 'Ibrahim Musah',
    type: 'Manufacturing',
    category: 'Industry',
    subCategory: 'Plastic Products',
    tin: 'TIN-8876543210',
    status: 'Active',
    dateRegistered: '2024-07-28',
    ghanaCard: 'GHA-223344556-7',
    phone: '+233 50 890 1234',
    email: 'musah.manuf@email.com',
    gpsAddress: 'GA-615-3347',
    digitalAddress: 'GA-615-3347',
    residentialAddress: '15 Tema Industrial Area',
    businessAddress: '20 Tema Heavy Industrial Area',
    ward: 'Tema Industrial',
    electoralArea: 'Tema East',
    zone: 'Zone I',
    revenueArea: 'Tema Revenue Area',
    licenseNumber: 'LIC-MF-2024-012',
  },
];

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
