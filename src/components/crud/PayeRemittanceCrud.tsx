import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatNaira } from '../TaxChart';
import HelpBanner from '../ui/HelpBanner';
import EmptyState from '../ui/EmptyState';
import WalkthroughGuide from '../ui/WalkthroughGuide';
import * as XLSX from 'xlsx';
import type { PAYERemittance } from '../../types/auth';

const WALKTHROUGH_STEPS = [
  { title: 'PAYE Remittance', description: 'Track monthly PAYE remittances to LIRS. Record receipts, amounts, and verification status for each month.', icon: '💰' },
  { title: 'Monthly Tracking', description: 'Each month of the tax year can have a remittance record with the amount paid, receipt number, and date.', icon: '📅' },
  { title: 'Status Workflow', description: 'Mark remittances as Pending → Remitted → Verified as you receive confirmation from LIRS.', icon: '🔄' },
];

const STORAGE_KEY = 'taxbox_paye_remittances';

const TEMPLATE_HEADERS = ['Year', 'Month', 'Amount', 'ReceiptNumber', 'RemittanceDate', 'Status'];

const emptyRecord = (companyId: string, year: number): PAYERemittance => ({
  id: crypto.randomUUID(),
  companyId,
  year,
  month: 1,
  amount: 0,
  receiptNumber: '',
  remittanceDate: '',
  status: 'pending',
});

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function PayeRemittanceCrud() {
  const { user } = useAuth();
  const companyId = user?.id ?? 'unknown';
  const [records, setRecords] = useLocalStorage<PAYERemittance[]>(STORAGE_KEY, []);
  const [filterYear, setFilterYear] = useState(2023);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<PAYERemittance>(emptyRecord(companyId, filterYear));
  const [showForm, setShowForm] = useState(false);

  const filtered = records.filter(r => r.companyId === companyId && r.year === filterYear)
    .sort((a, b) => a.month - b.month);

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ['2024', '1', '250000', 'PAYE/2024/001', '2024-02-15', 'remitted']]);
    ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'PAYERemittance');
    XLSX.writeFile(wb, 'paye_remittance_template.xlsx');
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
    if (confirm('Delete this PAYE remittance record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  }

  const totalRemitted = filtered.filter(r => r.status === 'remitted' || r.status === 'verified').reduce((s, r) => s + r.amount, 0);
  const totalPending = filtered.filter(r => r.status === 'pending').reduce((s, r) => s + r.amount, 0);
  const totalVerified = filtered.filter(r => r.status === 'verified').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">PAYE Remittance</h1>
          <p className="text-sm text-gray-500 mt-1">Monthly PAYE remittance receipts and tracking</p>
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
            + Add Remittance
          </button>
        </div>
      </div>

      <HelpBanner title="How to use PAYE Remittance">
        <p>Track monthly PAYE remittances made to the Lagos State Internal Revenue Service (LIRS).</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click <strong>"+ Add Remittance"</strong> to record a PAYE payment for a specific month.</li>
          <li>Enter the <strong>amount paid, receipt number, and remittance date</strong> from your LIRS payment receipt.</li>
          <li>Update the <strong>status</strong> as you progress: Pending → Remitted → Verified.</li>
          <li>The summary cards show total remitted, verified, and pending amounts for the selected year.</li>
        </ol>
      </HelpBanner>

      <WalkthroughGuide steps={WALKTHROUGH_STEPS} storageKey="walkthrough_paye_remit" />

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-sm text-emerald-700">Total Remitted</p>
            <p className="text-xl font-bold text-emerald-900">{formatNaira(totalRemitted)}</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-700">Verified</p>
            <p className="text-xl font-bold text-blue-900">{formatNaira(totalVerified)}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="text-sm text-amber-700">Pending</p>
            <p className="text-xl font-bold text-amber-900">{formatNaira(totalPending)}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'New'} PAYE Remittance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select value={form.month} onChange={e => setForm(f => ({ ...f, month: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
              <input type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
              <input value={form.receiptNumber} onChange={e => setForm(f => ({ ...f, receiptNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Remittance Date</label>
              <input type="date" value={form.remittanceDate} onChange={e => setForm(f => ({ ...f, remittanceDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as PAYERemittance['status'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option value="pending">Pending</option>
                <option value="remitted">Remitted</option>
                <option value="verified">Verified</option>
              </select>
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
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Month</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Amount (₦)</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Receipt No.</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Date</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-4">
                  <EmptyState
                    icon="💰"
                    title="No PAYE remittance records yet"
                    description={`No remittance records found for ${filterYear}. Add your first PAYE remittance to start tracking.`}
                    action={{ label: '+ Add Remittance', onClick: () => { setForm(emptyRecord(companyId, filterYear)); setEditing(null); setShowForm(true); } }}
                  />
                </td></tr>
              ) : (
                filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{MONTHS[rec.month - 1]}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.amount)}</td>
                    <td className="px-4 py-2.5 text-gray-600">{rec.receiptNumber || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600">{rec.remittanceDate || '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        rec.status === 'verified' ? 'bg-emerald-100 text-emerald-700' :
                        rec.status === 'remitted' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>{rec.status}</span>
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
