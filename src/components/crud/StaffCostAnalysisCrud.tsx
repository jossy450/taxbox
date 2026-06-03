import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { formatNaira } from '../TaxChart';
import HelpBanner from '../ui/HelpBanner';
import FieldTooltip from '../ui/FieldTooltip';
import EmptyState from '../ui/EmptyState';
import WalkthroughGuide from '../ui/WalkthroughGuide';
import * as XLSX from 'xlsx';
import type { StaffCostAnalysis } from '../../types/auth';

const WALKTHROUGH_STEPS = [
  { title: 'Staff Cost Analysis', description: 'This module tracks employee benefit and staff costs as per your audited financial statements for each tax year.', icon: '👥' },
  { title: 'Add a Record', description: 'Click "+ Add Record" to enter staff cost data for a specific year. Fill in total staff cost, number of staff, and Lagos-specific breakdowns.', icon: '➕' },
  { title: 'Year Filter', description: 'Use the year dropdown at the top to switch between different tax years and view historical data.', icon: '📅' },
  { title: 'Summary Cards', description: 'The summary cards at the top give you instant totals for staff cost, headcount, and pension contributions.', icon: '📊' },
];

const STORAGE_KEY = 'taxbox_staffcost';

const TEMPLATE_HEADERS = ['Year', 'TotalStaffCost', 'NumberStaff', 'SalariesWages', 'PensionContribution', 'OtherBenefits', 'ResidentsInLagos', 'LagosStaffNumber', 'LagosSalariesWages', 'LagosPension', 'LagosOtherBenefits'];

const emptyRecord = (companyId: string, year: number): StaffCostAnalysis => ({
  id: crypto.randomUUID(),
  companyId,
  year,
  totalStaffCost: 0,
  numberStaff: 0,
  salariesWages: 0,
  pensionContribution: 0,
  otherBenefits: 0,
  residentsInLagos: 0,
  lagosStaffNumber: 0,
  lagosSalariesWages: 0,
  lagosPension: 0,
  lagosOtherBenefits: 0,
});

export default function StaffCostAnalysisCrud() {
  const { user } = useAuth();
  const companyId = user?.id ?? 'unknown';
  const [records, setRecords] = useLocalStorage<StaffCostAnalysis[]>(STORAGE_KEY, []);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<StaffCostAnalysis>(emptyRecord(companyId, filterYear));
  const [showForm, setShowForm] = useState(false);

  const filtered = records.filter(r => r.companyId === companyId && r.year === filterYear);

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ['2024', '50000000', '120', '40000000', '4000000', '6000000', '100', '90', '35000000', '3500000', '5000000']]);
    ws['!cols'] = TEMPLATE_HEADERS.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'StaffCost');
    XLSX.writeFile(wb, 'staff_cost_template.xlsx');
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
    if (confirm('Delete this staff cost record?')) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Staff Cost Analysis</h1>
          <p className="text-sm text-gray-500 mt-1">Employee benefit and staff cost analysis per audited financial statement</p>
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

      <HelpBanner title="How to use Staff Cost Analysis">
        <p>This module helps you record and analyse employee benefit and staff costs from your audited financial statements for each tax year.</p>
        <ol className="list-decimal list-inside space-y-1">
          <li><strong>Select a year</strong> using the dropdown to view or add data for that period.</li>
          <li>Click <strong>"+ Add Record"</strong> to enter staff cost figures for the selected year.</li>
          <li>Use <strong>"Download Template"</strong> to get an Excel file you can fill offline and import.</li>
          <li>The <strong>summary cards</strong> show instant totals for cost, headcount, and pension.</li>
        </ol>
      </HelpBanner>

      <WalkthroughGuide steps={WALKTHROUGH_STEPS} storageKey="walkthrough_staffcost" />

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{editing ? 'Edit' : 'New'} Staff Cost Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Staff Cost (₦)<FieldTooltip text="Total employee cost as per the audited financial statement for this year" /></label>
              <input type="number" value={form.totalStaffCost || ''} onChange={e => setForm(f => ({ ...f, totalStaffCost: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Staff<FieldTooltip text="Total number of employees across all locations" /></label>
              <input type="number" value={form.numberStaff || ''} onChange={e => setForm(f => ({ ...f, numberStaff: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salaries & Wages (₦)<FieldTooltip text="Total gross salaries and wages paid to all employees" /></label>
              <input type="number" value={form.salariesWages || ''} onChange={e => setForm(f => ({ ...f, salariesWages: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pension Contribution (₦)<FieldTooltip text="Employer pension contribution (statutory minimum is 10% of basic)" /></label>
              <input type="number" value={form.pensionContribution || ''} onChange={e => setForm(f => ({ ...f, pensionContribution: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Other Benefits (₦)<FieldTooltip text="Other employee benefits not captured in salaries or pension (NHIS, housing, transport, etc.)" /></label>
              <input type="number" value={form.otherBenefits || ''} onChange={e => setForm(f => ({ ...f, otherBenefits: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Residents in Lagos<FieldTooltip text="Number of employees residing in Lagos State (relevant for Lagos IRS audit)" /></label>
              <input type="number" value={form.residentsInLagos || ''} onChange={e => setForm(f => ({ ...f, residentsInLagos: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lagos Staff Number<FieldTooltip text="Number of staff working in Lagos offices/locations" /></label>
              <input type="number" value={form.lagosStaffNumber || ''} onChange={e => setForm(f => ({ ...f, lagosStaffNumber: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lagos Salaries & Wages (₦)<FieldTooltip text="Salary component attributable to Lagos-based staff" /></label>
              <input type="number" value={form.lagosSalariesWages || ''} onChange={e => setForm(f => ({ ...f, lagosSalariesWages: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lagos Pension (₦)<FieldTooltip text="Pension contribution for Lagos-based employees" /></label>
              <input type="number" value={form.lagosPension || ''} onChange={e => setForm(f => ({ ...f, lagosPension: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lagos Other Benefits (₦)<FieldTooltip text="Other benefits for Lagos-based staff" /></label>
              <input type="number" value={form.lagosOtherBenefits || ''} onChange={e => setForm(f => ({ ...f, lagosOtherBenefits: parseFloat(e.target.value) || 0 }))}
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

      {filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-700">Total Staff Cost</p>
            <p className="text-xl font-bold text-blue-900">{formatNaira(filtered[0].totalStaffCost)}</p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <p className="text-sm text-purple-700">Number of Staff</p>
            <p className="text-xl font-bold text-purple-900">{filtered.reduce((s, r) => s + r.numberStaff, 0)}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="text-sm text-amber-700">Lagos Staff</p>
            <p className="text-xl font-bold text-amber-900">{filtered.reduce((s, r) => s + r.lagosStaffNumber, 0)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-sm text-emerald-700">Pension Contribution</p>
            <p className="text-xl font-bold text-emerald-900">{formatNaira(filtered.reduce((s, r) => s + r.pensionContribution, 0))}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600"># Staff</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Salaries</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Pension</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Other Benefits</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Total Cost</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Lagos #</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Lagos Salary</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-4">
                  <EmptyState
                    icon="📊"
                    title="No staff cost records yet"
                    description={`No records found for ${filterYear}. Add your first record to start tracking staff costs.`}
                    action={{ label: '+ Add Record', onClick: () => { setForm(emptyRecord(companyId, filterYear)); setEditing(null); setShowForm(true); } }}
                  />
                </td></tr>
              ) : (
                filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-900">{rec.numberStaff}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.salariesWages)}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.pensionContribution)}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.otherBenefits)}</td>
                    <td className="px-4 py-2.5 text-right font-medium">{formatNaira(rec.totalStaffCost)}</td>
                    <td className="px-4 py-2.5 text-right">{rec.lagosStaffNumber}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.lagosSalariesWages)}</td>
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
