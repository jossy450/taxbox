import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatNaira } from '../TaxChart';
import HelpBanner from '../ui/HelpBanner';
import FieldTooltip from '../ui/FieldTooltip';
import EmptyState from '../ui/EmptyState';
import WalkthroughGuide from '../ui/WalkthroughGuide';
import * as XLSX from 'xlsx';
import type { WHTRecord } from '../../types/auth';

const WALKTHROUGH_STEPS = [
  { title: 'WHT Schedule', description: 'Track withholding tax deductions from vendors, suppliers, and other payments. WHT is deducted at source and remitted to LIRS.', icon: '🧾' },
  { title: 'Auto-Calculation', description: 'Enter the gross payment and select the WHT rate. The WHT amount is calculated automatically (Gross × Rate).', icon: '⚡' },
  { title: 'Remittance Tracking', description: 'Mark each WHT record as remitted or unremitted, and record the receipt number and date for audit trail.', icon: '✅' },
];

const STORAGE_KEY = 'taxbox_wht';

const TEMPLATE_HEADERS = ['VendorName', 'VendorType', 'GrossPayment', 'WHTRate', 'Remitted', 'RemittanceDate', 'ReceiptNumber'];

const emptyRecord = (companyId: string, year: number): WHTRecord => ({
  id: crypto.randomUUID(),
  companyId,
  year,
  vendorName: '',
  vendorType: 'Supplier',
  grossPayment: 0,
  whtRate: 5,
  whtAmount: 0,
  remitted: false,
  remittanceDate: '',
  receiptNumber: '',
});

export default function WhtScheduleCrud() {
  const { user } = useAuth();
  const companyId = user?.id ?? 'unknown';
  const [records, setRecords] = useLocalStorage<WHTRecord[]>(STORAGE_KEY, []);
  const [filterYear, setFilterYear] = useState(2023);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<WHTRecord>(emptyRecord(companyId, filterYear));
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = records.filter(r =>
    r.companyId === companyId &&
    r.year === filterYear &&
    r.vendorName.toLowerCase().includes(search.toLowerCase())
  );

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ['Vendor ABC Ltd', 'Supplier', '500000', '5', 'TRUE', '2024-03-15', 'WHT/2024/001']]);
    ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'WHT');
    XLSX.writeFile(wb, 'wht_template.xlsx');
  }

  function handleSave() {
    const whtAmount = form.grossPayment * (form.whtRate / 100);
    const saved = { ...form, whtAmount };
    if (editing) {
      setRecords(prev => prev.map(r => r.id === editing ? saved : r));
    } else {
      setRecords(prev => [...prev, { ...saved, id: crypto.randomUUID() }]);
    }
    setShowForm(false);
    setEditing(null);
  }

  function handleEdit(id: string) {
    const rec = records.find(r => r.id === id);
    if (rec) { setForm(rec); setEditing(id); setShowForm(true); }
  }

  function handleDelete(id: string) {
    if (confirm('Delete this WHT record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  }

  const totalGross = filtered.reduce((s, r) => s + r.grossPayment, 0);
  const totalWht = filtered.reduce((s, r) => s + r.whtAmount, 0);
  const remitted = filtered.filter(r => r.remitted).reduce((s, r) => s + r.whtAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WHT Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">Withholding Tax schedule and remittance tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
            {[2026, 2025, 2024, 2023].map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={downloadTemplate}
            className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
            Download Template
          </button>
          <button onClick={() => { setForm(emptyRecord(companyId, filterYear)); setEditing(null); setShowForm(true); }}
            className="px-4 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800">
            + Add WHT Record
          </button>
        </div>
      </div>

      <HelpBanner title="How to use the WHT Schedule">
        <p>Record withholding tax deductions from payments to vendors, suppliers, contractors, and other third parties.</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click <strong>"+ Add WHT Record"</strong> to log a new withholding tax deduction.</li>
          <li>Enter the <strong>vendor name, gross payment amount, and WHT rate</strong> (typically 5% or 10%). The WHT amount is auto-calculated.</li>
          <li>Toggle <strong>"Remitted"</strong> and enter the receipt number once payment is made to LIRS.</li>
          <li>The summary cards show total gross payments, WHT deducted, and amount remitted.</li>
        </ol>
      </HelpBanner>

      <WalkthroughGuide steps={WALKTHROUGH_STEPS} storageKey="walkthrough_wht" />

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-700">Total Vendors</p>
            <p className="text-xl font-bold text-blue-900">{filtered.length}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="text-sm text-amber-700">Gross Payments</p>
            <p className="text-xl font-bold text-amber-900">{formatNaira(totalGross)}</p>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <p className="text-sm text-red-700">WHT Deducted</p>
            <p className="text-xl font-bold text-red-900">{formatNaira(totalWht)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-sm text-emerald-700">WHT Remitted</p>
            <p className="text-xl font-bold text-emerald-900">{formatNaira(remitted)}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'New'} WHT Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name<FieldTooltip text="Name of the supplier, contractor, or service provider" /></label>
              <input value={form.vendorName} onChange={e => setForm(f => ({ ...f, vendorName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Type<FieldTooltip text="Category of vendor: Supplier, Contractor, Consultant, Landlord, etc." /></label>
              <input value={form.vendorType} onChange={e => setForm(f => ({ ...f, vendorType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gross Payment (₦)<FieldTooltip text="Total invoice amount before WHT deduction" /></label>
              <input type="number" value={form.grossPayment || ''} onChange={e => setForm(f => ({ ...f, grossPayment: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WHT Rate (%)<FieldTooltip text="Withholding tax rate: 5% for goods/supplies, 10% for services/contracts, 2.5% for certain items" /></label>
              <select value={form.whtRate} onChange={e => setForm(f => ({ ...f, whtRate: parseFloat(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value={5}>5%</option>
                <option value={10}>10%</option>
                <option value={2.5}>2.5%</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WHT Amount (₦) — auto-calc</label>
              <input type="number" value={(form.grossPayment * (form.whtRate / 100)).toFixed(2)} disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt No.</label>
              <input value={form.receiptNumber} onChange={e => setForm(f => ({ ...f, receiptNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remittance Date</label>
              <input type="date" value={form.remittanceDate} onChange={e => setForm(f => ({ ...f, remittanceDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.remitted} onChange={e => setForm(f => ({ ...f, remitted: e.target.checked }))}
                className="w-4 h-4" id="wht-remitted" />
              <label htmlFor="wht-remitted" className="text-sm text-gray-700">Remitted</label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={handleSave}
              className="px-6 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800">
              {editing ? 'Update' : 'Save'}
            </button>
            <button onClick={() => { setShowForm(false); setEditing(null); }}
              className="px-6 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <input placeholder="Search vendors..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Vendor</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Type</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Gross (₦)</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Rate</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">WHT (₦)</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Remitted</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Receipt</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-4">
                  <EmptyState
                    icon="🧾"
                    title="No WHT records yet"
                    description={`No withholding tax records found for ${filterYear}. Add your first WHT record to start tracking.`}
                    action={{ label: '+ Add WHT Record', onClick: () => { setForm(emptyRecord(companyId, filterYear)); setEditing(null); setShowForm(true); } }}
                  />
                </td></tr>
              ) : (
                filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{rec.vendorName}</td>
                    <td className="px-4 py-2.5 text-gray-600">{rec.vendorType}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.grossPayment)}</td>
                    <td className="px-4 py-2.5 text-right">{rec.whtRate}%</td>
                    <td className="px-4 py-2.5 text-right text-red-600">{formatNaira(rec.whtAmount)}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        rec.remitted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>{rec.remitted ? 'Yes' : 'No'}</span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{rec.receiptNumber || '—'}</td>
                    <td className="px-4 py-2.5 text-right space-x-2">
                      <button onClick={() => handleEdit(rec.id)} className="text-blue-700 hover:text-blue-900 text-xs font-medium">Edit</button>
                      <button onClick={() => handleDelete(rec.id)} className="text-red-600 hover:text-red-800 text-xs font-medium">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
