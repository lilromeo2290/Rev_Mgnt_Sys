'use client';

import { useState, useRef } from 'react';
import {
  Building,
  Phone,
  Mail,
  Globe,
  Calendar,
  DollarSign,
  FileText,
  Shield,
  Database,
  Bell,
  Save,
  Upload,
  Download,
  RefreshCw,
} from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('assembly');
  const [saved, setSaved] = useState(false);

  const tabs = [
    { id: 'assembly', label: 'Assembly Info', icon: Building },
    { id: 'financial', label: 'Financial', icon: DollarSign },
    { id: 'billing', label: 'Billing Config', icon: FileText },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'backup', label: 'Backup & Restore', icon: Database },
  ];

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure system-wide settings and preferences</p>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
        {activeTab === 'assembly' && <AssemblySettings />}
        {activeTab === 'financial' && <FinancialSettings />}
        {activeTab === 'billing' && <BillingSettings />}
        {activeTab === 'security' && <SecuritySettings />}
        {activeTab === 'notifications' && <NotificationSettings />}
        {activeTab === 'backup' && <BackupSettings />}
      </div>
    </div>
  );
}

function AssemblySettings() {
  const [logoPreview, setLogoPreview] = useState('');
  const [logoName, setLogoName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    setLogoName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoPreview(ev.target.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview('');
    setLogoName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">Assembly Information</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assembly Name</label>
          <input type="text" defaultValue="" placeholder="Enter assembly name" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assembly Code</label>
          <input type="text" defaultValue="" placeholder="Enter assembly code" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Telephone</label>
          <input type="tel" defaultValue="" placeholder="Enter telephone number" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
          <input type="email" defaultValue="" placeholder="Enter email address" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Website</label>
          <input type="url" defaultValue="" placeholder="Enter website URL" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Physical Address</label>
          <input type="text" defaultValue="" placeholder="Enter physical address" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="lg:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assembly Logo</label>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden ${logoPreview ? 'border-emerald-400 dark:border-emerald-600' : 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700'}`}>
              {logoPreview ? (
                <img src={logoPreview} alt="Assembly Logo" className="w-full h-full object-contain" />
              ) : (
                <Building className="w-8 h-8 text-emerald-500" />
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Upload Logo
                </button>
                {logoPreview && (
                  <button
                    onClick={handleRemoveLogo}
                    className="px-3 py-2 border border-red-300 dark:border-red-700 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                )}
              </div>
              {logoName && (
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">{logoName}</p>
              )}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Assembly Description</label>
          <textarea rows={3} defaultValue="" placeholder="Enter assembly description" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition resize-none" />
        </div>
      </div>
    </div>
  );
}

function FinancialSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">Financial Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Currency</label>
          <select defaultValue="GHS" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition">
            <option value="GHS">GH₵ - Ghana Cedis</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Financial Year Start</label>
          <select defaultValue="january" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition">
            <option value="january">January</option>
            <option value="april">April</option>
            <option value="july">July</option>
            <option value="october">October</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Current Financial Year</label>
          <input type="text" defaultValue="" placeholder="e.g. 2026" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Tax Rate (%)</label>
          <input type="number" defaultValue="" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Penalty Rate (%)</label>
          <input type="number" defaultValue="5" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Interest Rate (%)</label>
          <input type="number" defaultValue="2" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">Billing Configuration</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Bill Prefix</label>
          <input type="text" defaultValue="" placeholder="e.g. KMA-BILL" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Receipt Prefix</label>
          <input type="text" defaultValue="" placeholder="e.g. KMA-REC" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Default Due Days</label>
          <input type="number" defaultValue="" placeholder="e.g. 30" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Penalty After (Days)</label>
          <input type="number" defaultValue="" placeholder="e.g. 15" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Auto-Generate Bills</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Automatically generate bills at the start of each period</p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Include QR Code on Bills</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Add QR code and barcode to printed bills</p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Digital Signature</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Include assembly digital signature on receipts</p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Duplicate Bill Detection</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Prevent generation of duplicate bills</p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
        </div>
      </div>
    </div>
  );
}

function SecuritySettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">Security Settings</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Session Timeout (Minutes)</label>
          <input type="number" defaultValue="30" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Max Login Attempts</label>
          <input type="number" defaultValue="5" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password Min Length</label>
          <input type="number" defaultValue="8" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Account Lockout Duration (Minutes)</label>
          <input type="number" defaultValue="15" className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Two-Factor Authentication (2FA)</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Require 2FA for all users</p>
          </div>
          <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Audit Trail Logging</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Log all user activities</p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
        </div>
      </div>
    </div>
  );
}

function NotificationSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">Notification Settings</h2>
      <div className="space-y-4">
        {[
          { label: 'SMS Due Date Reminders', desc: 'Send SMS reminder before bill due date', defaultChecked: true },
          { label: 'Email Due Date Reminders', desc: 'Send email reminder before bill due date', defaultChecked: true },
          { label: 'Payment Confirmation SMS', desc: 'Send SMS after successful payment', defaultChecked: true },
          { label: 'Payment Confirmation Email', desc: 'Send email after successful payment', defaultChecked: false },
          { label: 'Overdue Bill Alerts', desc: 'Notify when bills become overdue', defaultChecked: true },
          { label: 'System Notifications', desc: 'Show in-app system notifications', defaultChecked: true },
          { label: 'Daily Collection Summary', desc: 'Send daily revenue summary to admins', defaultChecked: false },
          { label: 'Weekly Revenue Report', desc: 'Email weekly revenue report', defaultChecked: true },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{item.desc}</p>
            </div>
            <input type="checkbox" defaultChecked={item.defaultChecked} className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BackupSettings() {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">Backup & Restore</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Automatic Daily Backup</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Automatically backup database daily at midnight</p>
          </div>
          <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
        </div>
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Backup Retention (Days)</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">How long to keep backup files</p>
          </div>
          <input type="number" defaultValue="90" className="w-24 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3 mt-4">
        <button className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Download className="w-4 h-4" /> Manual Backup Now
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <Upload className="w-4 h-4" /> Restore from Backup
        </button>
        <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> Download Latest Backup
        </button>
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Recent Backups</h3>
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <div className="flex items-center justify-center px-4 py-8 text-sm text-slate-400 dark:text-slate-500">
            No backups yet. Click "Manual Backup Now" to create your first backup.
          </div>
        </div>
      </div>
    </div>
  );
}
