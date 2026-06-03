import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatNaira } from '../TaxChart';
import HelpBanner from '../ui/HelpBanner';
import FieldTooltip from '../ui/FieldTooltip';
import EmptyState from '../ui/EmptyState';
import WalkthroughGuide from '../ui/WalkthroughGuide';
import * as XLSX from 'xlsx';
import type { ExpatriateRecord } from '../../types/auth';

const WALKTHROUGH_STEPS = [
  { title: 'Expatriate Payroll', description: 'Track expatriate staff payroll, deductions, and compliance documents for Lagos IRS audit purposes.', icon: '🌍' },
  { title: 'Add Expatriate', description: 'Click "+ Add Expatriate" to enter a new expat record with salary breakdown, deductions, and personal details.', icon: '➕' },
  { title: 'Compliance Ready', description: 'Use this alongside the Audit Checklist to ensure all expat compliance docs (quota, CERPAC, immigration returns) are tracked.', icon: '✅' },
];

const STORAGE_KEY = 'taxbox_expatriates';

const TEMPLATE_HEADERS = ['StaffNumber', 'LastName', 'FirstName', 'OtherName', 'Designation', 'ABC-ID', 'Location', 'Months', 'Basic', 'Housing', 'Transport', 'Utility', 'Dressing', 'Lunch', 'Leave', 'OtherAllowances', 'OneOffAllowances', 'Pension', 'NHIS', 'Gratuity', 'NHF', 'LifeAssurance'];

const emptyRecord = (companyId: string, year: number): ExpatriateRecord => ({
  id: crypto.randomUUID(),
  companyId,
  year,
  staffNumber: '',
  lastName: '',
  firstName: '',
  otherName: '',
  designation: '',
  abcId: '',
  location: '',
  months: 12,
  basic: 0, housing: 0, transport: 0, utility: 0,
  dressing: 0, lunch: 0, leave: 0, otherAllowances: 0,
  oneOffAllowances: 0, totalPay: 0,
  pension: 0, nhis: 0, gratuity: 0, nhf: 0, lifeAssurance: 0,
});

export default function ExpatriateCrud() {
  const { user } = useAuth();
  const companyId = user?.id ?? 'unknown';
  const [records, setRecords] = useLocalStorage<ExpatriateRecord[]>(STORAGE_KEY, []);
  const [filterYear, setFilterYear] = useState(2023);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<ExpatriateRecord>(emptyRecord(companyId, filterYear));
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = records.filter(r =>
    r.companyId === companyId &&
    r.year === filterYear &&
    (r.lastName.toLowerCase().includes(search.toLowerCase()) ||
     r.firstName.toLowerCase().includes(search.toLowerCase()))
  );

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ['EXP001', 'Doe', 'John', '', 'Manager', 'ABC123', 'Lagos', '12', '5000000', '200000', '150000', '100000', '80000', '60000', '50000', '30000', '0', '400000', '50000', '0', '30000', '20000']]);
    ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 18 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Expatriates');
    XLSX.writeFile(wb, 'expatriate_template.xlsx');
  }

  function computeTotal(rec: ExpatriateRecord) {
    const pay = rec.basic + rec.housing + rec.transport + rec.utility +
      rec.dressing + rec.lunch + rec.leave + rec.otherAllowances +
      rec.oneOffAllowances;
    return { ...rec, totalPay: pay };
  }

  function handleSave() {
    const saved = computeTotal(form);
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
    if (confirm('Delete this expatriate record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  }

  const totPay = filtered.reduce((s, r) => s + r.totalPay, 0);
  const totPension = filtered.reduce((s, r) => s + r.pension, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expatriate Payroll & Compliance</h1>
          <p className="text-sm text-gray-500 mt-1">Expatriate staff payroll, remittances and compliance tracking</p>
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
            + Add Expatriate
          </button>
        </div>
      </div>

      <HelpBanner title="How to use Expatriate Payroll & Compliance">
        <p>Record expatriate staff payroll details, allowances, and statutory deductions for each tax year.</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Select a <strong>tax year</strong> and click <strong>"+ Add Expatriate"</strong> to enter a new record.</li>
          <li>Fill in the expatriate's personal details, salary breakdown, and applicable deductions.</li>
          <li>Use <strong>"Download Template"</strong> to prepare data offline, then import via the upload option.</li>
          <li>The summary cards show totals for expat count, payroll, and pension contributions.</li>
        </ol>
      </HelpBanner>

      <WalkthroughGuide steps={WALKTHROUGH_STEPS} storageKey="walkthrough_expatriates" />

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-700">Total Expatriates</p>
            <p className="text-xl font-bold text-blue-900">{filtered.length}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="text-sm text-amber-700">Total Payroll</p>
            <p className="text-xl font-bold text-amber-900">{formatNaira(totPay)}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="text-sm text-purple-700">Pension</p>
            <p className="text-xl font-bold text-purple-900">{formatNaira(totPension)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-sm text-emerald-700">Avg Monthly Pay</p>
            <p className="text-xl font-bold text-emerald-900">{formatNaira(totPay / (filtered.length || 1))}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'New'} Expatriate Record</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Staff Number<FieldTooltip text="Unique identifier for the expatriate staff member" /></label>
              <input value={form.staffNumber} onChange={e => setForm(f => ({ ...f, staffNumber: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Designation<FieldTooltip text="Job title or role within the company" /></label>
              <input value={form.designation} onChange={e => setForm(f => ({ ...f, designation: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ABC ID<FieldTooltip text="LIRS ABC identification number assigned to the expatriate" /></label>
              <input value={form.abcId} onChange={e => setForm(f => ({ ...f, abcId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. of Months</label>
              <input type="number" value={form.months || ''} onChange={e => setForm(f => ({ ...f, months: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Basic (₦)<FieldTooltip text="Monthly basic salary of the expatriate" /></label>
              <input type="number" value={form.basic || ''} onChange={e => setForm(f => ({ ...f, basic: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Housing (₦)</label>
              <input type="number" value={form.housing || ''} onChange={e => setForm(f => ({ ...f, housing: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transport (₦)</label>
              <input type="number" value={form.transport || ''} onChange={e => setForm(f => ({ ...f, transport: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pension (₦)<FieldTooltip text="Employer pension contribution for the expatriate" /></label>
              <input type="number" value={form.pension || ''} onChange={e => setForm(f => ({ ...f, pension: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NHIS (₦)</label>
              <input type="number" value={form.nhis || ''} onChange={e => setForm(f => ({ ...f, nhis: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NHF (₦)</label>
              <input type="number" value={form.nhf || ''} onChange={e => setForm(f => ({ ...f, nhf: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Life Assurance (₦)<FieldTooltip text="Life assurance premium paid for the expatriate (tax-deductible)" /></label>
              <input type="number" value={form.lifeAssurance || ''} onChange={e => setForm(f => ({ ...f, lifeAssurance: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gratuity (₦)</label>
              <input type="number" value={form.gratuity || ''} onChange={e => setForm(f => ({ ...f, gratuity: parseFloat(e.target.value) || 0 }))}
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
        <div className="p-4 border-b border-gray-200">
          <input placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Designation</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Location</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Basic</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Total Pay</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Pension</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">NHIS</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">NHF</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={9} className="px-4 py-4">
                  <EmptyState
                    icon="🌍"
                    title="No expatriate records yet"
                    description={`No expatriate staff records found for ${filterYear}. Add your first expat record to start tracking.`}
                    action={{ label: '+ Add Expatriate', onClick: () => { setForm(emptyRecord(companyId, filterYear)); setEditing(null); setShowForm(true); } }}
                  />
                </td></tr>
              ) : (
                filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-900">{rec.lastName}, {rec.firstName}</td>
                    <td className="px-4 py-2.5 text-gray-600">{rec.designation}</td>
                    <td className="px-4 py-2.5 text-gray-600">{rec.location}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.basic)}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{formatNaira(rec.totalPay)}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.pension)}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.nhis)}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.nhf)}</td>
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
