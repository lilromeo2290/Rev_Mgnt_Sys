'use client';

import { useState, useCallback } from 'react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  Search,
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Building2,
  Award,
  MapPin,
  Briefcase,
  User,
  Save,
  Crosshair,
  Loader2,
  Printer,
  X,
  FileText,
} from 'lucide-react';
import { BUSINESS_CLASSES, BUSINESS_CLASS_CATEGORIES } from '@/lib/fee-schedule';
import type { FeeCategory } from '@/lib/fee-schedule';

// ─── Types ───────────────────────────────────────────────────────────────────

interface BusinessCert {
  id: string;
  certNumber: string;
  regNumber: string;
  businessName: string;
  ownerName: string;
  businessType: string;
  category: string;
  businessAddress: string;
  dateRegistered: string;
  dateIssued: string;
  expiryDate: string;
  status: string;
  assemblyName: string;
  assemblyAddress: string;
  tradingName: string;
  receiptNumber: string;
}

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
  // New fields
  streetName: string;
  houseNo: string;
  streetCode: string;
  localityCode: string;
  daAssignmentNo: string;
  businessCertNo: string;
  businessPermit: string;
  employees: string;
  yearEstablished: string;
  excludedFromFees: boolean;
  ownerAddress: string;
  ownerGps: string;
  ownerTin: string;
  comments: string;
}

// ─── Mock Data ───────────────────────────────────────────────────────────────

const mockBusinesses: Business[] = [];

// ─── Component ───────────────────────────────────────────────────────────────

const businessTypes = BUSINESS_CLASSES;

const defaultForm = {
  regNumber: '',
  name: '',
  ownerName: '',
  type: '',
  category: '',
  subCategory: '',
  tin: '',
  licenseNumber: '',
  dateRegistered: '',
  status: 'Active',
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
  streetName: '',
  houseNo: '',
  streetCode: '',
  localityCode: '',
  daAssignmentNo: '',
  businessCertNo: '',
  businessPermit: '',
  employees: '',
  yearEstablished: '',
  excludedFromFees: false,
  ownerAddress: '',
  ownerGps: '',
  ownerTin: '',
  comments: '',
};

export function BusinessesPage() {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingRegNumber, setEditingRegNumber] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [locatingBusiness, setLocatingBusiness] = useState(false);
  const [locatingOwner, setLocatingOwner] = useState(false);
  const [viewingCert, setViewingCert] = useState<BusinessCert | null>(null);
  const [businesses, setBusinesses] = useLocalStorage<Business[]>('rms-businesses', mockBusinesses);
  const itemsPerPage = 10;

  // ── Form State ───────────────────────────────────────────────────────────
  const [form, setForm] = useState({ ...defaultForm });

  // ── Geolocation: Fetch GPS from device location ─────────────────────
  const fetchGpsFromLocation = (
    target: 'business' | 'owner'
  ) => {
    const setLoading = target === 'business' ? setLocatingBusiness : setLocatingOwner;

    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser. Please enter the GPS address manually.');
      return;
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const gpsString = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
        if (target === 'business') {
          setForm((prev) => ({ ...prev, gpsAddress: gpsString }));
        } else {
          setForm((prev) => ({ ...prev, ownerGps: gpsString }));
        }
        setLoading(false);
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
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  // ── Derived categories based on selected business type ───────────────────
  const availableCategories: FeeCategory[] = form.type
    ? (BUSINESS_CLASS_CATEGORIES[form.type] || [])
    : [];

  // ── Get fee details for selected category ──────────────────────────────
  const selectedCategoryFee = availableCategories.find(
    (c) => c.name === form.category
  );

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
    const { name, type } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (e.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value };
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
    const regNum = form.regNumber || `BIZ-${String(businesses.length + 1).padStart(4, '0')}`;
    const newBusiness: Business = {
      regNumber: regNum,
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
      // New fields
      streetName: form.streetName,
      houseNo: form.houseNo,
      streetCode: form.streetCode,
      localityCode: form.localityCode,
      daAssignmentNo: form.daAssignmentNo,
      businessCertNo: form.businessCertNo,
      businessPermit: form.businessPermit,
      employees: form.employees,
      yearEstablished: form.yearEstablished,
      excludedFromFees: form.excludedFromFees,
      ownerAddress: form.ownerAddress,
      ownerGps: form.ownerGps,
      ownerTin: form.ownerTin,
      comments: form.comments,
    };

    if (editingRegNumber) {
      setBusinesses((prev) =>
        prev.map((b) =>
          b.regNumber === editingRegNumber
            ? { ...b, ...newBusiness, businessName: newBusiness.name, ownerName: newBusiness.owner, businessType: newBusiness.type, category: newBusiness.category, businessAddress: newBusiness.businessAddress }
            : b
        )
      );
    } else {
      setBusinesses((prev) => [...prev, newBusiness]);
    }

    // Auto-generate business certificate
    try {
      const existingCerts = JSON.parse(localStorage.getItem('rms-business-certs') || '[]');
      const certSeq = existingCerts.length + 1;
      const today = new Date().toISOString().split('T')[0];
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      const expiryStr = expiryDate.toISOString().split('T')[0];
      const assemblyName = (() => {
        try { const r = JSON.parse(localStorage.getItem('rms-settings-assembly') || '{}'); return r.name || 'Kumasi Metropolitan Assembly'; } catch { return 'Kumasi Metropolitan Assembly'; }
      })();
      const assemblyAddress = (() => {
        try { const r = JSON.parse(localStorage.getItem('rms-settings-assembly') || '{}'); return r.address || ''; } catch { return ''; }
      })();
      const newCert = {
        id: `CRT-${Date.now()}`,
        certNumber: `CRT-${String(certSeq).padStart(4, '0')}`,
        regNumber: regNum,
        businessName: newBusiness.name,
        ownerName: newBusiness.owner,
        businessType: newBusiness.type,
        category: newBusiness.category,
        businessAddress: newBusiness.businessAddress,
        dateRegistered: newBusiness.dateRegistered,
        dateIssued: today,
        expiryDate: expiryStr,
        status: 'Active' as const,
        assemblyName,
        assemblyAddress,
        tradingName: newBusiness.name,
        receiptNumber: `RCT-${String(certSeq).padStart(4, '0')}`,
      };
      existingCerts.push(newCert);
      localStorage.setItem('rms-business-certs', JSON.stringify(existingCerts));
    } catch { /* cert generation failure should not block registration */ }

    setEditingRegNumber(null);
    setForm({ ...defaultForm });
    setView('list');
  };

  const handleCancel = () => {
    setEditingRegNumber(null);
    setForm({ ...defaultForm });
    setView('list');
  };

  const handleEdit = (biz: Business) => {
    setEditingRegNumber(biz.regNumber);
    setForm({
      regNumber: biz.regNumber,
      name: biz.name,
      ownerName: biz.owner,
      type: biz.type,
      category: biz.category,
      subCategory: biz.subCategory || '',
      tin: biz.tin,
      licenseNumber: biz.licenseNumber,
      dateRegistered: biz.dateRegistered,
      status: biz.status,
      ghanaCard: biz.ghanaCard,
      phone: biz.phone,
      email: biz.email,
      gpsAddress: biz.gpsAddress,
      digitalAddress: biz.digitalAddress,
      residentialAddress: biz.residentialAddress,
      businessAddress: biz.businessAddress,
      ward: biz.ward,
      electoralArea: biz.electoralArea,
      zone: biz.zone,
      revenueArea: biz.revenueArea,
      streetName: (biz as any).streetName || '',
      houseNo: (biz as any).houseNo || '',
      streetCode: (biz as any).streetCode || '',
      localityCode: (biz as any).localityCode || '',
      daAssignmentNo: (biz as any).daAssignmentNo || '',
      businessCertNo: (biz as any).businessCertNo || '',
      businessPermit: (biz as any).businessPermit || '',
      employees: (biz as any).employees || '',
      yearEstablished: (biz as any).yearEstablished || '',
      excludedFromFees: (biz as any).excludedFromFees || false,
      ownerAddress: (biz as any).ownerAddress || '',
      ownerGps: (biz as any).ownerGps || '',
      ownerTin: (biz as any).ownerTin || '',
      comments: (biz as any).comments || '',
    });
    setView('form');
  };

  const handleDelete = (regNumber: string) => {
    if (!confirm('Are you sure you want to delete this business? This action cannot be undone.')) return;
    setBusinesses((prev) => prev.filter((b) => b.regNumber !== regNumber));
  };

  // ── Certificate View & Print ─────────────────────────────────────────────
  const handleViewCertificate = (regNumber: string) => {
    try {
      const certs: BusinessCert[] = JSON.parse(localStorage.getItem('rms-business-certs') || '[]');
      const cert = certs.find((c) => c.regNumber === regNumber);
      if (cert) {
        setViewingCert(cert);
      } else {
        alert('No certificate found for this business. Certificates are generated automatically when a business is saved.');
      }
    } catch {
      alert('Error reading certificate data.');
    }
  };

  const handlePrintCertificate = (cert: BusinessCert) => {
    // Read assembly name dynamically from settings at print time
    const _asmSettings = (() => { try { return JSON.parse(localStorage.getItem('rms-settings-assembly') || '{}'); } catch { return {}; } })();
    const dynAssemblyName = _asmSettings.name || cert.assemblyName || 'Kumasi Metropolitan Assembly';
    const dynAssemblyAddress = _asmSettings.address || cert.assemblyAddress || '';
    const fmtDate = (d: string) => {
      if (!d) return '..................';
      try {
        const dt = new Date(d);
        return dt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch { return d; }
    };
    const getOrdinal = (day: number) => {
      const s = ['th','st','nd','rd'];
      const v = day % 100;
      return day + (s[(v-20)%10] || s[v] || s[0]);
    };
    let dayOrd = '..................';
    let monthName = '..................';
    let yearShort = '........';
    if (cert.dateIssued) {
      try {
        const d = new Date(cert.dateIssued);
        dayOrd = getOrdinal(d.getDate());
        monthName = d.toLocaleDateString('en-US', { month: 'long' });
        yearShort = String(d.getFullYear()).slice(-2);
      } catch {}
    }
    const expiryYear = cert.expiryDate ? new Date(cert.expiryDate).getFullYear() : new Date().getFullYear() + 1;
    const assemblyShort = dynAssemblyName.replace(/\b(Metropolitan|Municipal|District|Assembly)\b/gi, '').trim().split(' ')[0];

    const win = window.open('', '_blank', 'width=900,height=1200');
    if (!win) { alert('Please allow popups to print the certificate.'); return; }
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>Business Registration Certificate - ${cert.certNumber}</title>
  <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4 portrait; margin: 12mm; }
    body {
      font-family: 'Inter', Arial, sans-serif;
      color: #111;
      background: #f0ece2;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 20px;
    }
    .certificate-outer {
      width: 750px;
      background: #fff;
      position: relative;
      padding: 6px;
    }
    .certificate-outer::before {
      content: '';
      position: absolute;
      inset: 0;
      border: 14px solid #B5A642;
      border-radius: 4px;
      pointer-events: none;
    }
    .certificate-outer::after {
      content: '';
      position: absolute;
      inset: 10px;
      border: 2px solid #B5A642;
      border-radius: 2px;
      pointer-events: none;
    }
    .cert-inner {
      margin: 22px;
      padding: 40px 50px 35px;
      position: relative;
    }
    .corner { position: absolute; width: 60px; height: 60px; border-color: #B5A642; border-style: solid; }
    .corner-tl { top: 0; left: 0; border-width: 3px 0 0 3px; }
    .corner-tr { top: 0; right: 0; border-width: 3px 3px 0 0; }
    .corner-bl { bottom: 0; left: 0; border-width: 0 0 3px 3px; }
    .corner-br { bottom: 0; right: 0; border-width: 0 3px 3px 0; }
    .header-logos { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; padding: 0 20px; }
    .logo-block { text-align: center; width: 160px; }
    .coat-of-arms { line-height: 1; color: #1a1a1a; }
    .logo-label { font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px; color: #333; }
    .assembly-seal { line-height: 1; color: #8B0000; }
    .assembly-name { text-align: center; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; color: #0a0a0a; margin-bottom: 2px; }
    .assembly-subtitle { text-align: center; font-size: 10px; color: #666; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 18px; }
    .cert-title { text-align: center; font-family: 'Playfair Display', serif; font-size: 34px; font-style: italic; font-weight: 700; color: #B22222; margin-bottom: 28px; letter-spacing: 1px; }
    .cert-body { text-align: center; font-family: 'Inter', Georgia, serif; font-size: 14px; line-height: 2.2; color: #111; }
    .cert-body .intro { font-weight: 700; font-size: 15px; margin-bottom: 6px; }
    .dotted-field { font-family: 'Caveat', cursive; font-size: 20px; color: #00008B; font-weight: 700; border-bottom: 2px dotted #333; display: inline-block; min-width: 300px; padding: 0 8px 2px; vertical-align: baseline; }
    .assembly-reiterate { font-weight: 800; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; }
    .gold-separator { border: none; height: 2px; background: linear-gradient(90deg, transparent, #B5A642, transparent); margin: 24px 0 20px; }
    .cert-footer { margin-top: 30px; }
    .issued-at { text-align: center; font-size: 13px; font-weight: 600; margin-bottom: 14px; color: #222; }
    .date-line { text-align: center; font-size: 14px; line-height: 2; }
    .date-line .handwritten { font-family: 'Caveat', cursive; font-size: 19px; color: #00008B; font-weight: 700; border-bottom: 2px dotted #555; display: inline-block; min-width: 70px; padding: 0 4px 1px; }
    .validity-section { text-align: center; margin-top: 18px; }
    .valid-until { font-size: 13px; font-weight: 700; color: #222; }
    .renew-yearly { font-family: 'Playfair Display', serif; font-size: 14px; font-style: italic; color: #B22222; margin-top: 2px; font-weight: 700; }
    .signature-section { margin-top: 28px; text-align: center; }
    .sign-line { width: 260px; border-bottom: 2px dotted #333; margin: 0 auto 6px; }
    .sign-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #333; }
    .receipt-line { margin-top: 18px; font-size: 11px; color: #333; }
    .receipt-line .receipt-val { font-family: 'Caveat', cursive; font-size: 16px; font-weight: 700; color: #000; }
    .watermark { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-35deg); font-size: 72px; color: rgba(181, 166, 66, 0.06); font-weight: 900; pointer-events: none; white-space: nowrap; letter-spacing: 12px; text-transform: uppercase; z-index: 0; }
    .flourish-top { text-align: center; font-size: 22px; color: #B5A642; margin-bottom: 6px; letter-spacing: 6px; }
    .status-badge { display: inline-block; padding: 2px 14px; border-radius: 3px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }
    .status-active { background: #d4edda; color: #155724; }
    .status-inactive { background: #f8d7da; color: #721c24; }
    .cert-no-small { text-align: center; font-size: 9px; color: #888; margin-top: 10px; letter-spacing: 1px; }
  </style>
</head>
<body>
  <div class="certificate-outer">
    <div class="cert-inner">
      <div class="watermark">OFFICIAL CERTIFICATE</div>
      <div class="corner corner-tl"></div>
      <div class="corner corner-tr"></div>
      <div class="corner corner-bl"></div>
      <div class="corner corner-br"></div>
      <div class="header-logos">
        <div class="logo-block">
          <div class="coat-of-arms"><img src="/logos/ghana-coat-of-arms.webp" style="width:180px; height:180px; object-fit:contain;" /></div>
          <div class="logo-label">Republic of Ghana</div>
        </div>
        <div class="logo-block">
          <div class="assembly-seal"><img src="/logos/assembly-seal.png" style="width:180px; height:180px; object-fit:contain;" /></div>
          <div class="logo-label">${dynAssemblyName.toUpperCase()}</div>
        </div>
      </div>
      <div class="flourish-top">✦ ✦ ✦</div>
      <div class="assembly-name">${dynAssemblyName.toUpperCase()}</div>
      ${dynAssemblyAddress ? `<div class="assembly-subtitle">${dynAssemblyAddress.toUpperCase()}</div>` : '<div class="assembly-subtitle"></div>'}
      <div class="cert-title">Certificate Of Registration</div>
      <div class="cert-body">
        <div class="intro">I Hereby Certify that</div>
        <div style="margin: 8px 0;"><span class="dotted-field">${cert.businessName.toUpperCase()}</span></div>
        <div>Has complied with the bye-laws/directives of the</div>
        <div class="assembly-reiterate" style="margin: 6px 0;">${dynAssemblyName.toUpperCase()}</div>
        <div>and has duly been permitted to operate within the ${assemblyShort} Municipality</div>
        ${cert.tradingName && cert.tradingName !== cert.businessName ? `<div style="margin-top: 8px;">as <span class="dotted-field">${cert.tradingName.toUpperCase()}</span></div>` : ''}
      </div>
      <hr class="gold-separator">
      <div class="cert-footer">
        <div class="issued-at">Give under my hand at ${assemblyShort}</div>
        <div class="date-line">this <span class="handwritten">${dayOrd}</span> day of <span class="handwritten">${monthName}</span> 20<span class="handwritten">${yearShort}</span></div>
        <div class="validity-section">
          <div class="valid-until">Valid until 31st December ${expiryYear}</div>
          <div class="renew-yearly">Renew Yearly</div>
        </div>
        <div class="signature-section">
          <div class="sign-line"></div>
          <div class="sign-title">Municipal Co-ordinating Director</div>
        </div>
        <div class="receipt-line">RECEIPT No: <span class="receipt-val">${cert.receiptNumber}</span></div>
        <div class="cert-no-small">${cert.certNumber} | Reg: ${cert.regNumber}</div>
      </div>
    </div>
  </div>
  <script>window.onload = function() { window.print(); }</script>
</body>
</html>`);
    win.document.close();
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
            onClick={() => { setEditingRegNumber(null); setForm({ ...defaultForm }); setView('form'); }}
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
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className={`${inputClass} w-full sm:w-44`}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
            className={`${inputClass} w-full sm:w-48`}
          >
            <option value="All">All Business Classes</option>
            {businessTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Reg #</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Business Name</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Owner</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Business Class</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hidden lg:table-cell">Category</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap hidden md:table-cell">TIN</th>
                  <th className="text-left px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {paged.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400 dark:text-slate-500">
                      <Building2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
                      No businesses found. Click "Register New Business" to add one.
                    </td>
                  </tr>
                ) : (
                  paged.map((biz) => (
                    <tr key={biz.regNumber} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{biz.regNumber}</td>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">{biz.name}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{biz.owner}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{biz.type}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap hidden lg:table-cell">{biz.category}</td>
                      <td className="px-4 py-3 font-mono text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap hidden md:table-cell">{biz.tin}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          biz.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                        }`}>
                          {biz.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1">
                          <button onClick={() => handleViewCertificate(biz.regNumber)} className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors" title="View Certificate">
                            <FileText className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEdit(biz)} className="p-1.5 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(biz.regNumber)} className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors" title="Delete">
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
          <p className="text-slate-500 dark:text-slate-400">Showing {showingFrom}-{showingTo} of {filtered.length}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safeCurrentPage <= 1} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">{safeCurrentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safeCurrentPage >= totalPages} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Certificate Modal ──────────────────────────────────────────── */}
        {viewingCert && (() => {
          const getOrdinal = (day: number) => {
            const s = ['th','st','nd','rd'];
            const v = day % 100;
            return day + (s[(v-20)%10] || s[v] || s[0]);
          };
          // Read assembly name dynamically from settings at view time
          const _asm = (() => { try { return JSON.parse(localStorage.getItem('rms-settings-assembly') || '{}'); } catch { return {}; } })();
          const dynAssemblyName = _asm.name || viewingCert.assemblyName || 'Kumasi Metropolitan Assembly';
          let dayOrd = '..................';
          let monthName = '..................';
          let yearShort = '........';
          if (viewingCert.dateIssued) {
            try {
              const d = new Date(viewingCert.dateIssued);
              dayOrd = getOrdinal(d.getDate());
              monthName = d.toLocaleDateString('en-US', { month: 'long' });
              yearShort = String(d.getFullYear()).slice(-2);
            } catch {}
          }
          const expiryYear = viewingCert.expiryDate ? new Date(viewingCert.expiryDate).getFullYear() : new Date().getFullYear() + 1;
          const assemblyShort = dynAssemblyName.replace(/\b(Metropolitan|Municipal|District|Assembly)\b/gi, '').trim().split(' ')[0];

          return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setViewingCert(null)}>
            <div className="rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-800 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-500/20">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Business Registration Certificate</h3>
                    <p className="text-xs text-slate-400">{viewingCert.certNumber}</p>
                  </div>
                </div>
                <button onClick={() => setViewingCert(null)} className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Certificate Preview - matches the print design */}
              <div className="p-4">
                <div className="bg-[#f0ece2] rounded-lg p-6">
                  <div className="bg-white relative" style={{ padding: '6px' }}>
                    {/* Gold border effect */}
                    <div className="absolute inset-0 border-[10px] border-[#B5A642] rounded" style={{ pointerEvents: 'none' }} />
                    <div className="absolute rounded" style={{ inset: '8px', border: '1.5px solid #B5A642', pointerEvents: 'none' }} />

                    <div className="relative mx-[16px] my-[16px] py-8 px-10">
                      {/* Corner ornaments */}
                      <div className="absolute top-0 left-0 w-10 h-10 border-t-2 border-l-2 border-[#B5A642]" />
                      <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-[#B5A642]" />
                      <div className="absolute bottom-0 left-0 w-10 h-10 border-b-2 border-l-2 border-[#B5A642]" />
                      <div className="absolute bottom-0 right-0 w-10 h-10 border-b-2 border-r-2 border-[#B5A642]" />

                      {/* Header Logos */}
                      <div className="flex justify-between items-start mb-3 px-4">
                        <div className="text-center w-28">
                          <img src="/logos/ghana-coat-of-arms.webp" className="w-44 h-44 object-contain" />
                          <div className="text-[7px] font-bold uppercase tracking-wider text-slate-600 mt-1">Republic of Ghana</div>
                        </div>
                        <div className="text-center w-28">
                          <img src="/logos/assembly-seal.png" className="w-44 h-44 object-contain" />
                          <div className="text-[7px] font-bold uppercase tracking-wider text-slate-600 mt-1">{dynAssemblyName.toUpperCase()}</div>
                        </div>
                      </div>

                      {/* Decorative flourish */}
                      <div className="text-center text-[#B5A642] text-sm tracking-[6px] mb-1">✦ ✦ ✦</div>

                      {/* Assembly Name */}
                      <div className="text-center text-lg font-black uppercase tracking-[2px] text-[#0a0a0a]">
                        {dynAssemblyName.toUpperCase()}
                      </div>
                      {viewingCert.assemblyAddress && (
                        <div className="text-center text-[9px] text-slate-500 uppercase tracking-[3px] mb-4">
                          {viewingCert.assemblyAddress.toUpperCase()}
                        </div>
                      )}

                      {/* Certificate Title */}
                      <div className="text-center my-4">
                        <span className="text-2xl italic font-bold text-[#B22222]" style={{ fontFamily: 'Georgia, serif' }}>
                          Certificate Of Registration
                        </span>
                      </div>

                      {/* Body */}
                      <div className="text-center text-sm leading-[2.2] text-[#111]">
                        <div className="font-bold text-[15px] mb-1">I Hereby Certify that</div>
                        <div className="my-2">
                          <span className="text-lg font-bold border-b-2 border-dotted border-slate-500 inline-block min-w-[250px] px-2 pb-0.5" style={{ color: '#00008B', fontFamily: 'Georgia, cursive' }}>
                            {viewingCert.businessName.toUpperCase()}
                          </span>
                        </div>
                        <div>Has complied with the bye-laws/directives of the</div>
                        <div className="font-extrabold uppercase text-xs tracking-[1px] my-1">
                          {dynAssemblyName.toUpperCase()}
                        </div>
                        <div>and has duly been permitted to operate within the {assemblyShort} Municipality</div>
                        {viewingCert.tradingName && viewingCert.tradingName !== viewingCert.businessName && (
                          <div className="mt-2">
                            as <span className="text-lg font-bold border-b-2 border-dotted border-slate-500 inline-block min-w-[200px] px-2 pb-0.5" style={{ color: '#00008B', fontFamily: 'Georgia, cursive' }}>
                              {viewingCert.tradingName.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Gold separator */}
                      <div className="h-[2px] my-5" style={{ background: 'linear-gradient(90deg, transparent, #B5A642, transparent)' }} />

                      {/* Footer */}
                      <div className="mt-6">
                        <div className="text-center text-xs font-semibold text-slate-800 mb-3">
                          Give under my hand at {assemblyShort}
                        </div>
                        <div className="text-center text-sm leading-[2]">
                          this <span className="text-base font-bold border-b-2 border-dotted border-slate-400 inline-block min-w-[50px] px-1" style={{ color: '#00008B', fontFamily: 'Georgia, cursive' }}>{dayOrd}</span> day of <span className="text-base font-bold border-b-2 border-dotted border-slate-400 inline-block min-w-[70px] px-1" style={{ color: '#00008B', fontFamily: 'Georgia, cursive' }}>{monthName}</span> 20<span className="text-base font-bold border-b-2 border-dotted border-slate-400 inline-block min-w-[40px] px-1" style={{ color: '#00008B', fontFamily: 'Georgia, cursive' }}>{yearShort}</span>
                        </div>
                        <div className="text-center mt-4">
                          <div className="text-xs font-bold text-slate-800">Valid until 31st December {expiryYear}</div>
                          <div className="text-sm italic font-bold text-[#B22222] mt-0.5" style={{ fontFamily: 'Georgia, serif' }}>Renew Yearly</div>
                        </div>
                        <div className="text-center mt-6">
                          <div className="w-48 border-b-2 border-dotted border-slate-500 mx-auto mb-1" />
                          <div className="text-[9px] font-bold uppercase tracking-[1.5px] text-slate-600">
                            Municipal Co-ordinating Director
                          </div>
                        </div>
                        <div className="mt-4 text-[10px] text-slate-700 text-center">
                          RECEIPT No: <span className="font-bold text-sm" style={{ fontFamily: 'Georgia, cursive' }}>{viewingCert.receiptNumber}</span>
                        </div>
                        <div className="text-center text-[8px] text-slate-400 mt-2 tracking-wide">
                          {viewingCert.certNumber} | Reg: {viewingCert.regNumber}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 px-5 py-3 border-t border-slate-700 bg-slate-800 rounded-b-2xl">
                <button onClick={() => setViewingCert(null)} className="px-4 py-2 rounded-lg border border-slate-600 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors">
                  Close
                </button>
                <button onClick={() => handlePrintCertificate(viewingCert)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#B5A642] hover:bg-[#9a8d38] text-white text-sm font-medium transition-colors">
                  <Printer className="w-4 h-4" />
                  Print Certificate
                </button>
              </div>
            </div>
          </div>
          );
        })()}      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  FORM VIEW
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4">
        <button onClick={handleCancel} className="p-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {editingRegNumber ? 'Edit Business' : 'Register New Business'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {editingRegNumber ? 'Update the business details below.' : 'Fill in the details below to register a new business.'}
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* ─── Section 1: Fee Schedule (Business Class / Category / Amount) ── */}
        <section>
          <h2 className={sectionHeaderClass}>
            <span className="inline-flex items-center gap-2"><Briefcase className="w-5 h-5" /> Fee Schedule Classification</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* Business Class */}
            <div>
              <label className={`${labelClass} block`}>Business Class <span className="text-red-500">*</span></label>
              <select name="type" value={form.type} onChange={handleFormChange} className={inputClass}>
                <option value="">Select business class</option>
                {businessTypes.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* Category (dynamic from fee schedule) */}
            <div>
              <label className={`${labelClass} block`}>Category <span className="text-red-500">*</span></label>
              <select name="category" value={form.category} onChange={handleFormChange} className={inputClass} disabled={!form.type}>
                <option value="">Select category</option>
                {availableCategories.map((c) => (
                  <option key={c.name} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Amount (auto-filled from fee schedule) */}
            <div>
              <label className={`${labelClass} block`}>Amount</label>
              <input type="text" value={selectedCategoryFee ? `GH\u20b5 ${selectedCategoryFee.amount.toLocaleString()}` : ''} readOnly placeholder="Select a category to see amount" className={`${inputClass} bg-slate-50 dark:bg-slate-800/50 text-emerald-700 dark:text-emerald-400 font-semibold`} />
            </div>

            {/* Ceiling (auto-filled from fee schedule) */}
            <div>
              <label className={`${labelClass} block`}>Ceiling</label>
              <input type="text" value={selectedCategoryFee?.ceiling ? `GH\u20b5 ${selectedCategoryFee.ceiling.toLocaleString()}` : ''} readOnly placeholder="No ceiling" className={`${inputClass} bg-slate-50 dark:bg-slate-800/50 text-amber-700 dark:text-amber-400 font-semibold`} />
            </div>

            {/* Unit (auto-filled from fee schedule) */}
            <div>
              <label className={`${labelClass} block`}>Unit</label>
              <input type="text" value={selectedCategoryFee?.unit || ''} readOnly placeholder="—" className={`${inputClass} bg-slate-50 dark:bg-slate-800/50 text-purple-700 dark:text-purple-400 font-semibold`} />
            </div>
          </div>
        </section>

        {/* ─── Section 2: Business Details ──────────────────────────────── */}
        <section>
          <h2 className={sectionHeaderClass}>
            <span className="inline-flex items-center gap-2"><Building2 className="w-5 h-5" /> Business Details</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className={`${labelClass} block`}>Business Registration Number</label>
              <input type="text" name="regNumber" value={form.regNumber} onChange={handleFormChange} placeholder="Auto-generated if blank" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Business Name <span className="text-red-500">*</span></label>
              <input type="text" name="name" value={form.name} onChange={handleFormChange} placeholder="Enter business name" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Tax Identification Number (TIN)</label>
              <input type="text" name="tin" value={form.tin} onChange={handleFormChange} placeholder="e.g. TIN-1234567890" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Business License Number</label>
              <input type="text" name="licenseNumber" value={form.licenseNumber} onChange={handleFormChange} placeholder="e.g. LIC-PH-2024-001" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Date Registered</label>
              <input type="date" name="dateRegistered" value={form.dateRegistered} onChange={handleFormChange} className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Business Status</label>
              <select name="status" value={form.status} onChange={handleFormChange} className={inputClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className={`${labelClass} block`}>Business Address <span className="text-red-500">*</span></label>
              <input type="text" name="businessAddress" value={form.businessAddress} onChange={handleFormChange} placeholder="Enter business address" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Phone Number</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} placeholder="e.g. +233 24 567 8901" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleFormChange} placeholder="e.g. business@email.com" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Year Established</label>
              <input type="text" name="yearEstablished" value={form.yearEstablished} onChange={handleFormChange} placeholder="e.g. 2020" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Number of Employees</label>
              <input type="text" name="employees" value={form.employees} onChange={handleFormChange} placeholder="e.g. 15" className={inputClass} />
            </div>
          </div>
        </section>

        {/* ─── Section 3: Business Location / GPS ────────────────────────── */}
        <section>
          <h2 className={sectionHeaderClass}>
            <span className="inline-flex items-center gap-2"><MapPin className="w-5 h-5" /> Business Location</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className={`${labelClass} block`}>GhanaPost GPS Address</label>
              <div className="flex gap-2">
                <input type="text" name="gpsAddress" value={form.gpsAddress} onChange={handleFormChange} placeholder="e.g. AK-034-5521 or lat, lng" className={`${inputClass} flex-1`} />
                <button onClick={() => fetchGpsFromLocation('business')} disabled={locatingBusiness} className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50 transition-colors whitespace-nowrap" title="Use device GPS to get coordinates">
                  {locatingBusiness ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                  {locatingBusiness ? 'Locating...' : 'Use Location'}
                </button>
              </div>
              {form.gpsAddress && !locatingBusiness && (
                <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  GPS coordinates captured
                </p>
              )}
            </div>
            <div>
              <label className={`${labelClass} block`}>Digital Address</label>
              <input type="text" name="digitalAddress" value={form.digitalAddress} onChange={handleFormChange} placeholder="e.g. AK-034-5521" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Street Name</label>
              <input type="text" name="streetName" value={form.streetName} onChange={handleFormChange} placeholder="Enter street name" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>House Number</label>
              <input type="text" name="houseNo" value={form.houseNo} onChange={handleFormChange} placeholder="e.g. 24" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Ward</label>
              <input type="text" name="ward" value={form.ward} onChange={handleFormChange} placeholder="Enter ward" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Electoral Area</label>
              <input type="text" name="electoralArea" value={form.electoralArea} onChange={handleFormChange} placeholder="Enter electoral area" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Zone</label>
              <input type="text" name="zone" value={form.zone} onChange={handleFormChange} placeholder="e.g. Zone A" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Revenue Area</label>
              <input type="text" name="revenueArea" value={form.revenueArea} onChange={handleFormChange} placeholder="Enter revenue area" className={inputClass} />
            </div>
          </div>
        </section>

        {/* ─── Section 4: Owner Details ────────────────────────────────── */}
        <section>
          <h2 className={sectionHeaderClass}>
            <span className="inline-flex items-center gap-2"><User className="w-5 h-5" /> Owner Details</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div>
              <label className={`${labelClass} block`}>Owner Name <span className="text-red-500">*</span></label>
              <input type="text" name="ownerName" value={form.ownerName} onChange={handleFormChange} placeholder="Enter full name of owner" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Ghana Card Number</label>
              <input type="text" name="ghanaCard" value={form.ghanaCard} onChange={handleFormChange} placeholder="e.g. GHA-123456789-0" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Owner Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleFormChange} placeholder="e.g. +233 24 567 8901" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Owner Address</label>
              <input type="text" name="ownerAddress" value={form.ownerAddress} onChange={handleFormChange} placeholder="Enter owner's residential address" className={inputClass} />
            </div>
            <div>
              <label className={`${labelClass} block`}>Owner GPS</label>
              <div className="flex gap-2">
                <input type="text" name="ownerGps" value={form.ownerGps} onChange={handleFormChange} placeholder="Owner's GPS coordinates" className={`${inputClass} flex-1`} />
                <button onClick={() => fetchGpsFromLocation('owner')} disabled={locatingOwner} className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50 transition-colors whitespace-nowrap" title="Use device GPS for owner location">
                  {locatingOwner ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                  {locatingOwner ? 'Locating...' : 'Use Location'}
                </button>
              </div>
              {form.ownerGps && !locatingOwner && (
                <p className="mt-1.5 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                  Owner GPS captured
                </p>
              )}
            </div>
            <div>
              <label className={`${labelClass} block`}>Owner TIN</label>
              <input type="text" name="ownerTin" value={form.ownerTin} onChange={handleFormChange} placeholder="Owner's TIN" className={inputClass} />
            </div>
          </div>
        </section>

        {/* ─── Section 5: Additional Info ────────────────────────────────── */}
        <section>
          <h2 className={sectionHeaderClass}>Additional Information</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="lg:col-span-2">
              <label className={`${labelClass} block`}>Comments / Notes</label>
              <textarea name="comments" value={form.comments} onChange={handleFormChange} placeholder="Any additional notes about this business..." rows={3} className={inputClass} />
            </div>
          </div>
        </section>

        {/* ─── Action Buttons ──────────────────────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button onClick={handleCancel} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors">
            <Save className="w-4 h-4" />
            {editingRegNumber ? 'Update Business' : 'Save Business'}
          </button>
        </div>
      </div>
    </div>
  );
}