import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { calculateLagosPaye2026, getDefaultDeductions } from '../../engine/calculator';
import HelpBanner from '../ui/HelpBanner';
import EmptyState from '../ui/EmptyState';
import WalkthroughGuide from '../ui/WalkthroughGuide';
import type { TaxRecord, Employee } from '../../types/auth';
import { formatNaira } from '../TaxChart';

const WALKTHROUGH_STEPS = [
  { title: 'Tax Records', description: 'View and manage PAYE computation results for your employees by period. Generate, submit, and approve records.', icon: '📋' },
  { title: 'Select Period', description: 'Choose the tax year and month, then click "Compute All for Period" to generate PAYE records for all active employees.', icon: '📅' },
  { title: 'Review & Approve', description: 'Review computed tax amounts, then submit for approval. Status flows: Computed → Submitted → Approved.', icon: '✅' },
];

const TAX_RECORDS_KEY = 'taxbox_taxrecords';
const EMPLOYEES_KEY = 'taxbox_employees';

export default function TaxRecordCrud() {
  const { user } = useAuth();
  const companyId = user?.id ?? 'unknown';
  const [records, setRecords] = useLocalStorage<TaxRecord[]>(TAX_RECORDS_KEY, []);
  const [employees] = useLocalStorage<Employee[]>(EMPLOYEES_KEY, []);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  const companyEmployees = employees.filter(e => e.companyId === companyId);

  const filtered = records.filter(r =>
    r.companyId === companyId &&
    r.month === filterMonth &&
    r.taxYear === filterYear
  );

  function computeAll() {
    const newRecords: TaxRecord[] = [];
    for (const emp of companyEmployees) {
      const result = calculateLagosPaye2026({
        grossIncome: {
          basic: emp.basicSalary,
          housing: emp.housing,
          transport: emp.transport,
          utility: 0, wardrobe: 0, lunch: 0,
          bonus: 0, thirteenthMonth: 0, commission: 0, otherAllowances: 0,
        },
        deductions: getDefaultDeductions(),
        rent: { annualRentPaid: 0, hasRentReceipt: false },
      }, true);

      newRecords.push({
        id: crypto.randomUUID(),
        employeeId: emp.id,
        employeeName: emp.name,
        companyId,
        taxYear: filterYear,
        month: filterMonth,
        grossPay: result.monthly.grossPay,
        taxDeducted: result.monthly.taxDeducted,
        netPay: result.monthly.netPay,
        chargeableIncome: result.chargeableIncome,
        effectiveRate: result.effectiveTaxRate,
        status: 'computed',
        createdAt: new Date().toISOString(),
      });
    }
    setRecords(prev => {
      const cleaned = prev.filter(r => !(r.companyId === companyId && r.month === filterMonth && r.taxYear === filterYear));
      return [...cleaned, ...newRecords];
    });
  }

  function updateStatus(id: string, status: TaxRecord['status']) {
    setRecords(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  }

  const totalTax = filtered.reduce((s, r) => s + r.taxDeducted, 0);
  const totalGross = filtered.reduce((s, r) => s + r.grossPay, 0);
  const totalNet = filtered.reduce((s, r) => s + r.netPay, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tax Records</h1>
          <p className="text-sm text-gray-500 mt-1">PAYE computation history by period</p>
        </div>
      </div>

      <HelpBanner title="How to use Tax Records">
        <p>Generate and manage PAYE computation records for your employees each month.</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Select the <strong>tax year and month</strong> you want to compute for.</li>
          <li>Click <strong>"Compute All for Period"</strong> to calculate PAYE for all active employees automatically.</li>
          <li>Review the computed amounts, then change <strong>status</strong> from Computed → Submitted → Approved.</li>
        </ol>
      </HelpBanner>

      <WalkthroughGuide steps={WALKTHROUGH_STEPS} storageKey="walkthrough_taxrecords" />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              {[2026, 2025, 2024].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('en', { month: 'long' })}</option>
              ))}
            </select>
          </div>
          <button onClick={computeAll}
            disabled={companyEmployees.length === 0}
            className="px-6 py-2 bg-blue-900 text-white text-sm font-medium rounded-lg hover:bg-blue-800 disabled:opacity-50">
            Compute All for Period
          </button>
        </div>
      </div>

      {filtered.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
            <p className="text-sm text-blue-700">Total Gross Pay</p>
            <p className="text-xl font-bold text-blue-900">{formatNaira(totalGross)}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
            <p className="text-sm text-amber-700">Total PAYE</p>
            <p className="text-xl font-bold text-amber-900">{formatNaira(totalTax)}</p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <p className="text-sm text-emerald-700">Total Net Pay</p>
            <p className="text-xl font-bold text-emerald-900">{formatNaira(totalNet)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Employee</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Gross</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Chargeable</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">PAYE</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Net</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Rate</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-2.5 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-4">
                  <EmptyState
                    icon="📋"
                    title="No tax records for this period"
                    description="Select a year and month, then click 'Compute All for Period' to generate PAYE records for all active employees."
                    action={{ label: 'Compute All', onClick: () => {} }}
                  />
                </td></tr>
              ) : (
                filtered.map(rec => (
                  <tr key={rec.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{rec.employeeName}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.grossPay)}</td>
                    <td className="px-4 py-2.5 text-right">{formatNaira(rec.chargeableIncome / 12)}</td>
                    <td className="px-4 py-2.5 text-right text-red-600">{formatNaira(rec.taxDeducted)}</td>
                    <td className="px-4 py-2.5 text-right text-emerald-700">{formatNaira(rec.netPay)}</td>
                    <td className="px-4 py-2.5 text-right">{(rec.effectiveRate * 100).toFixed(1)}%</td>
                    <td className="px-4 py-2.5 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        rec.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        rec.status === 'submitted' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>{rec.status}</span>
                    </td>
                    <td className="px-4 py-2.5 text-right space-x-2">
                      {rec.status === 'computed' && (
                        <button onClick={() => updateStatus(rec.id, 'submitted')}
                          className="text-blue-700 hover:text-blue-900 text-xs font-medium">Submit</button>
                      )}
                      {rec.status === 'submitted' && (
                        <button onClick={() => updateStatus(rec.id, 'approved')}
                          className="text-emerald-700 hover:text-emerald-900 text-xs font-medium">Approve</button>
                      )}
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
