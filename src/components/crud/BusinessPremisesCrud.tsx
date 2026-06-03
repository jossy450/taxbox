import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatNaira } from '../TaxChart';
import HelpBanner from '../ui/HelpBanner';
import FieldTooltip from '../ui/FieldTooltip';
import EmptyState from '../ui/EmptyState';
import WalkthroughGuide from '../ui/WalkthroughGuide';
import * as XLSX from 'xlsx';
import type { BusinessPremise } from '../../types/auth';

const WALKTHROUGH_STEPS = [
  { title: 'Business Premises', description: 'Record all business/office locations and track premises-related payments and evidence for LIRS audit.', icon: '🏢' },
  { title: 'Add Premises', description: 'Click "+ Add Premise" to record a business location with its address, LGA, type, and payment details.', icon: '➕' },
  { title: 'Evidence Tracking', description: 'Toggle "Evidence Provided" to mark whether you have proof of payment for each premise.', icon: '📄' },
];

const STORAGE_KEY = 'taxbox_biz_premises';

const TEMPLATE_HEADERS = ['Year', 'Address', 'LGA', 'PremiseType', 'AmountPaid', 'EvidenceProvided', 'ReceiptNumber'];

const emptyRecord = (companyId: string, year: number): BusinessPremise => ({
  id: crypto.randomUUID(),
  companyId,
  year,
  address: '',
  lga: '',
  premiseType: 'Office',
  evidenceProvided: false,
  amountPaid: 0,
  receiptNumber: '',
});

export default function BusinessPremisesCrud() {
  const { user } = useAuth();
  const companyId = user?.id ?? 'unknown';
  const [records, setRecords] = useLocalStorage<BusinessPremise[]>(STORAGE_KEY, []);
  const [filterYear, setFilterYear] = useState(2023);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<BusinessPremise>(emptyRecord(companyId, filterYear));
  const [showForm, setShowForm] = useState(false);

  const filtered = records.filter(r => r.companyId === companyId && r.year === filterYear);

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ['2024', '20 Obafemi Awolowo Way, Ikeja', 'Ikeja', 'Office', '50000', 'TRUE', 'BP/2024/001']]);
    ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 25 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'BizPremises');
    XLSX.writeFile(wb, 'business_premises_template.xlsx');
  }

  function handleSave() {
    if (editing) {
      setRecords(prev => prev.map(r => r.id === editing ? form : r));
    } else {
      setRecords(prev => [...prev, { ...form, id: crypto.randomUUID() }]);
    }
    setShowForm(false);
    setEditing(null);
  }

  function handleEdit(id: string) {
    const rec = records.find(r => r.id === id);
    if (rec) { setForm(rec); setEditing(id); setShowForm(true); }
  }

  function handleDelete(id: string) {
    if (confirm('Delete this business premise record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  }

  const totalPaid = filtered.reduce((s, r) => s + r.amountPaid, 0);
  const withEvidence = filtered.filter(r => r.evidenceProvided).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Premises</h1>
          <p className="text-sm text-gray-500 mt-1">Business/office location records and payment evidence</p>
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
            + Add Premise
          </button>
        </div>
      </div>

      <HelpBanner title="How to use Business Premises">
        <p>Record your company's business/office locations for LIRS audit purposes. Each premise may require evidence of payment.</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click <strong>"+ Add Premise"</strong> to log a business location.</li>
          <li>Enter the <strong>address, LGA, premise type</strong> (Office, Warehouse, Retail, etc.), and <strong>amount paid</strong>.</li>
          <li>Toggle <strong>"Evidence Provided"</strong> when you have receipts or documentation for the premises.</li>
        </ol>
      </HelpBanner>

      <WalkthroughGuide steps={WALKTHROUGH_STEPS} storageKey="walkthrough_biz_premises" />

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-700">Premises on Record</p>
            <p className="text-xl font-bold text-blue-900">{filtered.length}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="text-sm text-amber-700">Total Amount Paid</p>
            <p className="text-xl font-bold text-amber-900">{formatNaira(totalPaid)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-sm text-emerald-700">With Evidence</p>
            <p className="text-xl font-bold text-emerald-900">{withEvidence}/{filtered.length}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'New'} Business Premise</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address / Location<FieldTooltip text="Full address of the business premise or office location" /></label>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LGA<FieldTooltip text="Local Government Area where the premise is located" /></label>
              <input value={form.lga} onChange={e => setForm(f => ({ ...f, lga: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Premise Type<FieldTooltip text="Type of business location: Office, Warehouse, Retail, Factory, etc." /></label>
              <select value={form.premiseType} onChange={e => setForm(f => ({ ...f, premiseType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="Office">Office</option>
                <option value="Warehouse">Warehouse</option>
                <option value="Retail">Retail</option>
                <option value="Factory">Factory</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Paid (₦)<FieldTooltip text="Amount paid for business premise registration/renewal" /></label>
              <input type="number" value={form.amountPaid || ''} onChange={e => setForm(f => ({ ...f, amountPaid: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
              <input value={form.receiptNumber} onChange={e => setForm(f => ({ ...f, receiptNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.evidenceProvided} onChange={e => setForm(f => ({ ...f, evidenceProvided: e.target.checked }))}
                className="w-4 h-4" id="biz-evidence" />
              <label htmlFor="biz-evidence" className="text-sm text-gray-700">Evidence Provided</label>
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Address</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">LGA</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Type</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Amount Paid</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Receipt</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Evidence</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-4">
                  <EmptyState
                    icon="🏢"
                    title="No business premises recorded"
                    description={`No business premises found for ${filterYear}. Add your first premise to start tracking.`}
                    action={{ label: '+ Add Premise', onClick: () => { setForm(emptyRecord(companyId, filterYear)); setEditing(null); setShowForm(true); } }}
                  />
                </td></tr>
              ) : (
                filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-900 max-w-xs truncate">{rec.address}</td>
                    <td className="px-4 py-2.5 text-gray-600">{rec.lga}</td>
                    <td className="px-4 py-2.5 text-gray-600">{rec.premiseType}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.amountPaid)}</td>
                    <td className="px-4 py-2.5 text-gray-600">{rec.receiptNumber || '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        rec.evidenceProvided ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>{rec.evidenceProvided ? 'Yes' : 'No'}</span>
                    </td>
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
