import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatNaira } from '../TaxChart';
import HelpBanner from '../ui/HelpBanner';
import EmptyState from '../ui/EmptyState';
import WalkthroughGuide from '../ui/WalkthroughGuide';
import * as XLSX from 'xlsx';
import type { DevelopmentLevy } from '../../types/auth';

const WALKTHROUGH_STEPS = [
  { title: 'Development Levy', description: 'Track development levy assessments based on staff count. The levy is calculated per employee and remitted to LIRS.', icon: '📈' },
  { title: 'Auto-Calculation', description: 'Enter the number of staff and amount per staff. The total levy is calculated automatically.', icon: '⚡' },
  { title: 'Payment Status', description: 'Mark each levy record as paid and enter the receipt number and payment date for audit evidence.', icon: '✅' },
];

const STORAGE_KEY = 'taxbox_dev_levy';

const TEMPLATE_HEADERS = ['Year', 'StaffCount', 'AmountPerStaff', 'Paid', 'PaymentDate', 'ReceiptNumber'];

const emptyRecord = (companyId: string, year: number): DevelopmentLevy => ({
  id: crypto.randomUUID(),
  companyId,
  year,
  staffCount: 0,
  amountPerStaff: 10000,
  totalAmount: 0,
  paid: false,
  paymentDate: '',
  receiptNumber: '',
});

export default function DevelopmentLevyCrud() {
  const { user } = useAuth();
  const companyId = user?.id ?? 'unknown';
  const [records, setRecords] = useLocalStorage<DevelopmentLevy[]>(STORAGE_KEY, []);
  const [filterYear, setFilterYear] = useState(2023);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<DevelopmentLevy>(emptyRecord(companyId, filterYear));
  const [showForm, setShowForm] = useState(false);

  const filtered = records.filter(r => r.companyId === companyId && r.year === filterYear);

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ['2024', '120', '10000', 'TRUE', '2024-03-30', 'DL/2024/001']]);
    ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DevLevy');
    XLSX.writeFile(wb, 'development_levy_template.xlsx');
  }

  function handleSave() {
    const totalAmount = form.staffCount * form.amountPerStaff;
    const saved = { ...form, totalAmount };
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
    if (confirm('Delete this development levy record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  }

  const totalDue = filtered.reduce((s, r) => s + r.totalAmount, 0);
  const totalPaid = filtered.filter(r => r.paid).reduce((s, r) => s + r.totalAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Development Levy</h1>
          <p className="text-sm text-gray-500 mt-1">Development levy assessment and payment tracking</p>
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
            + Add Record
          </button>
        </div>
      </div>

      <HelpBanner title="How to use Development Levy">
        <p>Track development levy assessments. The levy is calculated based on the number of employees and the applicable rate per staff.</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click <strong>"+ Add Record"</strong> to create a new development levy entry for a tax year.</li>
          <li>Enter the <strong>number of staff</strong> and the <strong>amount per staff</strong>. The total is calculated automatically.</li>
          <li>Once paid, mark as <strong>Paid</strong> and enter the receipt number and payment date.</li>
        </ol>
      </HelpBanner>

      <WalkthroughGuide steps={WALKTHROUGH_STEPS} storageKey="walkthrough_dev_levy" />

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-700">Total Due</p>
            <p className="text-xl font-bold text-blue-900">{formatNaira(totalDue)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-sm text-emerald-700">Total Paid</p>
            <p className="text-xl font-bold text-emerald-900">{formatNaira(totalPaid)}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="text-sm text-amber-700">Outstanding</p>
            <p className="text-xl font-bold text-amber-900">{formatNaira(totalDue - totalPaid)}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'New'} Development Levy</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Count</label>
              <input type="number" value={form.staffCount || ''} onChange={e => setForm(f => ({ ...f, staffCount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount Per Staff (₦)</label>
              <input type="number" value={form.amountPerStaff || ''} onChange={e => setForm(f => ({ ...f, amountPerStaff: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (₦) — auto-calc</label>
              <input type="number" value={(form.staffCount * form.amountPerStaff).toFixed(2)} disabled
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
              <input value={form.receiptNumber} onChange={e => setForm(f => ({ ...f, receiptNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input type="checkbox" checked={form.paid} onChange={e => setForm(f => ({ ...f, paid: e.target.checked }))}
                className="w-4 h-4" id="dl-paid" />
              <label htmlFor="dl-paid" className="text-sm text-gray-700">Paid</label>
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
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Year</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Staff Count</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Per Staff (₦)</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Total (₦)</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Receipt</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Paid</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-4">
                  <EmptyState
                    icon="📈"
                    title="No development levy records yet"
                    description={`No development levy records found for ${filterYear}. Add your first record.`}
                    action={{ label: '+ Add Record', onClick: () => { setForm(emptyRecord(companyId, filterYear)); setEditing(null); setShowForm(true); } }}
                  />
                </td></tr>
              ) : (
                filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{rec.year}</td>
                    <td className="px-4 py-2.5 text-right">{rec.staffCount}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.amountPerStaff)}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{formatNaira(rec.totalAmount)}</td>
                    <td className="px-4 py-2.5 text-gray-600">{rec.receiptNumber || '—'}</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        rec.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>{rec.paid ? 'Yes' : 'No'}</span>
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
