import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatNaira } from '../TaxChart';
import HelpBanner from '../ui/HelpBanner';
import FieldTooltip from '../ui/FieldTooltip';
import EmptyState from '../ui/EmptyState';
import WalkthroughGuide from '../ui/WalkthroughGuide';
import * as XLSX from 'xlsx';
import type { DirectAssessment } from '../../types/auth';

const WALKTHROUGH_STEPS = [
  { title: 'Direct Assessment', description: 'Track direct (self) assessment tax computations and payments. This covers tax assessed directly on the company\'s income.', icon: '📝' },
  { title: 'Income & Tax', description: 'Enter the gross income, chargeable income, and tax computed for the assessment period.', icon: '📊' },
  { title: 'Payment Tracking', description: 'Mark the assessment as paid/unpaid and record the receipt number and payment date for audit.', icon: '✅' },
];

const STORAGE_KEY = 'taxbox_direct_assessment';

const TEMPLATE_HEADERS = ['Year', 'GrossIncome', 'ChargeableIncome', 'TaxComputed', 'Paid', 'PaymentDate', 'ReceiptNumber'];

const emptyRecord = (companyId: string, year: number): DirectAssessment => ({
  id: crypto.randomUUID(),
  companyId,
  year,
  grossIncome: 0,
  chargeableIncome: 0,
  taxComputed: 0,
  paid: false,
  paymentDate: '',
  receiptNumber: '',
});

export default function DirectAssessmentCrud() {
  const { user } = useAuth();
  const companyId = user?.id ?? 'unknown';
  const [records, setRecords] = useLocalStorage<DirectAssessment[]>(STORAGE_KEY, []);
  const [filterYear, setFilterYear] = useState(2023);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<DirectAssessment>(emptyRecord(companyId, filterYear));
  const [showForm, setShowForm] = useState(false);

  const filtered = records.filter(r => r.companyId === companyId && r.year === filterYear);

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ['2024', '50000000', '35000000', '3500000', 'TRUE', '2024-06-30', 'DA/2024/001']]);
    ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DirectAssessment');
    XLSX.writeFile(wb, 'direct_assessment_template.xlsx');
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
    if (confirm('Delete this direct assessment record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Direct Assessment</h1>
          <p className="text-sm text-gray-500 mt-1">Direct/Self assessment tax computation and payment tracking</p>
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

      <HelpBanner title="How to use Direct Assessment">
        <p>Record and track direct (self) assessment tax — the tax assessed directly on a company's income by LIRS.</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Select the <strong>tax year</strong> and click <strong>"+ Add Record"</strong> to create a new assessment entry.</li>
          <li>Enter the <strong>gross income, chargeable income, and tax computed</strong> from your assessment notice.</li>
          <li>Once payment is made, toggle <strong>Paid</strong> and enter the receipt number and date.</li>
        </ol>
      </HelpBanner>

      <WalkthroughGuide steps={WALKTHROUGH_STEPS} storageKey="walkthrough_direct_assessment" />

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'New'} Direct Assessment</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gross Income (₦)<FieldTooltip text="Total gross income for the assessment period as per the company's records" /></label>
              <input type="number" value={form.grossIncome || ''} onChange={e => setForm(f => ({ ...f, grossIncome: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chargeable Income (₦)<FieldTooltip text="Income after all allowable deductions and reliefs — the amount on which tax is computed" /></label>
              <input type="number" value={form.chargeableIncome || ''} onChange={e => setForm(f => ({ ...f, chargeableIncome: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Computed (₦)<FieldTooltip text="Total tax payable as per the direct assessment computation" /></label>
              <input type="number" value={form.taxComputed || ''} onChange={e => setForm(f => ({ ...f, taxComputed: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
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
                className="w-4 h-4" id="da-paid" />
              <label htmlFor="da-paid" className="text-sm text-gray-700">Paid</label>
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
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Gross Income</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Chargeable</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Tax Computed</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Receipt No.</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Paid</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-4">
                  <EmptyState
                    icon="📝"
                    title="No direct assessment records yet"
                    description={`No direct assessment records found for ${filterYear}. Add your first assessment record.`}
                    action={{ label: '+ Add Record', onClick: () => { setForm(emptyRecord(companyId, filterYear)); setEditing(null); setShowForm(true); } }}
                  />
                </td></tr>
              ) : (
                filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{rec.year}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.grossIncome)}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.chargeableIncome)}</td>
                    <td className="px-4 py-2.5 text-right text-red-600">{formatNaira(rec.taxComputed)}</td>
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
