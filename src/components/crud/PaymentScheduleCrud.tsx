import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatNaira } from '../TaxChart';
import HelpBanner from '../ui/HelpBanner';
import EmptyState from '../ui/EmptyState';
import WalkthroughGuide from '../ui/WalkthroughGuide';
import * as XLSX from 'xlsx';
import type { PaymentSchedule } from '../../types/auth';

const WALKTHROUGH_STEPS = [
  { title: 'Schedule of Payments', description: 'A consolidated view of all tax payments made — PAYE, WHT, Direct Assessment, Development Levy, and Business Premises.', icon: '💳' },
  { title: 'Payment Types', description: 'Each payment is categorised by type. Use the filter buttons to view specific categories or see everything at once.', icon: '📂' },
  { title: 'Complete Trail', description: 'This gives you a complete audit trail of all payments made across all tax obligation types for the selected year.', icon: '🔍' },
];

const STORAGE_KEY = 'taxbox_payment_schedule';

const PAYMENT_TYPES: PaymentSchedule['paymentType'][] = [
  'paye', 'wht', 'direct_assessment', 'development_levy', 'business_premises',
];

const TYPE_LABELS: Record<PaymentSchedule['paymentType'], string> = {
  paye: 'PAYE',
  wht: 'Withholding Tax',
  direct_assessment: 'Direct Assessment',
  development_levy: 'Development Levy',
  business_premises: 'Business Premises',
};

const TEMPLATE_HEADERS = ['Year', 'PaymentType', 'Amount', 'PaymentDate', 'ReceiptNumber', 'Remarks'];

const emptyRecord = (companyId: string, year: number): PaymentSchedule => ({
  id: crypto.randomUUID(),
  companyId,
  year,
  paymentDate: '',
  paymentType: 'paye',
  amount: 0,
  receiptNumber: '',
  remarks: '',
});

export default function PaymentScheduleCrud() {
  const { user } = useAuth();
  const companyId = user?.id ?? 'unknown';
  const [records, setRecords] = useLocalStorage<PaymentSchedule[]>(STORAGE_KEY, []);
  const [filterYear, setFilterYear] = useState(2023);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<PaymentSchedule>(emptyRecord(companyId, filterYear));
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = records.filter(r =>
    r.companyId === companyId &&
    r.year === filterYear &&
    (filterType === 'all' || r.paymentType === filterType)
  ).sort((a, b) => b.paymentDate.localeCompare(a.paymentDate));

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ['2024', 'paye', '250000', '2024-02-15', 'PAYE/2024/001', 'Monthly PAYE remittance - Jan']]);
    ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, 'payment_schedule_template.xlsx');
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
    if (confirm('Delete this payment record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  }

  const totalByType = PAYMENT_TYPES.map(t => ({
    type: t,
    label: TYPE_LABELS[t],
    total: filtered.filter(r => r.paymentType === t).reduce((s, r) => s + r.amount, 0),
    count: filtered.filter(r => r.paymentType === t).length,
  }));

  const grandTotal = filtered.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Schedule of Payments</h1>
          <p className="text-sm text-gray-500 mt-1">Consolidated schedule of all tax remittances and payments</p>
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
            + Add Payment
          </button>
        </div>
      </div>

      <HelpBanner title="How to use Schedule of Payments">
        <p>Consolidate all tax payments in one place for a complete audit trail across all tax obligation types.</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Click <strong>"+ Add Payment"</strong> to log any tax payment made (PAYE, WHT, Direct Assessment, etc.).</li>
          <li>Select the <strong>payment type</strong> from the dropdown — this helps categorise and filter payments.</li>
          <li>Use the <strong>filter buttons</strong> above the table to view specific payment categories.</li>
          <li>The summary cards show totals by payment type and a grand total for the selected year.</li>
        </ol>
      </HelpBanner>

      <WalkthroughGuide steps={WALKTHROUGH_STEPS} storageKey="walkthrough_payments" />

      {filtered.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {totalByType.map(({ type, label, total, count }) => (
            <div key={type} className="bg-white rounded-xl p-3 border border-gray-200">
              <p className="text-xs text-gray-500 truncate">{label}</p>
              <p className="text-sm font-bold text-gray-900">{formatNaira(total)}</p>
              <p className="text-xs text-gray-400">{count} payment(s)</p>
            </div>
          ))}
          <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
            <p className="text-xs text-blue-700">Grand Total</p>
            <p className="text-base font-bold text-blue-900">{formatNaira(grandTotal)}</p>
            <p className="text-xs text-blue-400">{filtered.length} payment(s)</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'New'} Payment Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
              <select value={form.paymentType} onChange={e => setForm(f => ({ ...f, paymentType: e.target.value as PaymentSchedule['paymentType'] }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                {PAYMENT_TYPES.map(t => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₦)</label>
              <input type="number" value={form.amount || ''} onChange={e => setForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
              <input type="date" value={form.paymentDate} onChange={e => setForm(f => ({ ...f, paymentDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Number</label>
              <input value={form.receiptNumber} onChange={e => setForm(f => ({ ...f, receiptNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
              <input value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
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
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>
          <div className="flex gap-1">
            {['all', ...PAYMENT_TYPES].map(t => (
              <button key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterType === t ? 'bg-blue-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {t === 'all' ? 'All' : TYPE_LABELS[t as PaymentSchedule['paymentType']]}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Date</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Type</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Amount (₦)</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Receipt No.</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Remarks</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-4">
                  <EmptyState
                    icon="💳"
                    title="No payment records yet"
                    description={`No payment records found for ${filterYear}. Add your first payment to build the schedule.`}
                    action={{ label: '+ Add Payment', onClick: () => { setForm(emptyRecord(companyId, filterYear)); setEditing(null); setShowForm(true); } }}
                  />
                </td></tr>
              ) : (
                filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-900">{rec.paymentDate || '—'}</td>
                    <td className="px-4 py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {TYPE_LABELS[rec.paymentType]}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-medium">{formatNaira(rec.amount)}</td>
                    <td className="px-4 py-2.5 text-gray-600">{rec.receiptNumber || '—'}</td>
                    <td className="px-4 py-2.5 text-gray-600 max-w-xs truncate">{rec.remarks || '—'}</td>
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
