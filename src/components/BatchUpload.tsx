import { useRef, useState } from 'react'
import * as XLSX from 'xlsx'
import { calculateLagosPaye2026 } from '../engine/calculator'
import { formatNaira } from './TaxChart'
import type { EmployeeRecord, BatchResult, PayeResult } from '../engine/types'

const CSV_TEMPLATE_HEADERS = [
  'EmployeeID', 'Name', 'Basic', 'Housing', 'Transport',
  'Utility', 'Wardrobe', 'Lunch', 'Bonus', 'ThirteenthMonth',
  'Commission', 'OtherAllowances', 'NHF%', 'NHIS',
  'Pension%', 'LifeAssurance', 'AnnualRent', 'HasRentReceipt',
  'JoinDate', 'ExitDate',
];

export default function BatchUpload() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [results, setResults] = useState<BatchResult[]>([])
  const [loading, setLoading] = useState(false)

  function parseRow(row: Record<string, string>): EmployeeRecord | null {
    const n = (v: string) => parseFloat(v) || 0
    const b = (v: string) => v?.toLowerCase() === 'true' || v === '1'
    return {
      id: row['EmployeeID'] || '',
      name: row['Name'] || '',
      grossIncome: {
        basic: n(row['Basic']),
        housing: n(row['Housing']),
        transport: n(row['Transport']),
        utility: n(row['Utility']),
        wardrobe: n(row['Wardrobe']),
        lunch: n(row['Lunch']),
        bonus: n(row['Bonus']),
        thirteenthMonth: n(row['ThirteenthMonth']),
        commission: n(row['Commission']),
        otherAllowances: n(row['OtherAllowances']),
      },
      deductions: {
        nhfPercentage: n(row['NHF%']) || 2.5,
        nhis: n(row['NHIS']),
        pensionPercentage: n(row['Pension%']) || 8,
        lifeAssurance: n(row['LifeAssurance']),
      },
      rent: {
        annualRentPaid: n(row['AnnualRent']),
        hasRentReceipt: b(row['HasRentReceipt']),
      },
      joinDate: row['JoinDate'] || undefined,
      exitDate: row['ExitDate'] || undefined,
      isMidYear: !!(row['JoinDate'] || row['ExitDate']),
    }
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setLoading(true)

    const reader = new FileReader()
    reader.onload = evt => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const json = XLSX.utils.sheet_to_json<Record<string, string>>(sheet)
        const batch: BatchResult[] = []

        for (const row of json) {
          const emp = parseRow(row)
          if (!emp || !emp.id) continue
          const errors: string[] = []
          let result: PayeResult | null = null
          try {
            result = calculateLagosPaye2026({
              grossIncome: emp.grossIncome,
              deductions: emp.deductions,
              rent: emp.rent,
            }, true)
          } catch (err) {
            errors.push(String(err))
          }
          batch.push({ employee: emp, result: result!, errors })
        }

        setResults(batch)
      } catch (err) {
        console.error(err)
      }
      setLoading(false)
    }
    reader.readAsArrayBuffer(file)
  }

  function downloadTemplate() {
    const ws = XLSX.utils.aoa_to_sheet([CSV_TEMPLATE_HEADERS])
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Template')
    XLSX.writeFile(wb, 'paye_template.xlsx')
  }

  function downloadResults() {
    if (results.length === 0) return
    const rows = results.map(r => ({
      'Employee ID': r.employee.id,
      'Employee Name': r.employee.name,
      'Gross Pay': r.result?.monthly.grossPay ?? 0,
      'NHF': r.result?.statutoryDeductions.nhf ?? 0,
      'NHIS': r.result?.statutoryDeductions.nhis ?? 0,
      'Pension': r.result?.statutoryDeductions.pension ?? 0,
      'Life Assurance': r.result?.statutoryDeductions.lifeAssurance ?? 0,
      'Rent Relief': r.result?.rentRelief ?? 0,
      'Chargeable Income': r.result?.chargeableIncome ?? 0,
      'PAYE Deducted': r.result?.totalTax ?? 0,
      'Monthly Tax': r.result?.monthly.taxDeducted ?? 0,
      'Net Pay': r.result?.monthly.netPay ?? 0,
      'Effective Rate': r.result ? `${(r.result.effectiveTaxRate * 100).toFixed(2)}%` : '',
      'Errors': r.errors.join('; '),
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'PAYE Results')
    XLSX.writeFile(wb, 'paye_results.xlsx')
  }

  const totalTax = results.reduce((s, r) => s + (r.result?.totalTax ?? 0), 0)
  const totalNet = results.reduce((s, r) => s + (r.result?.monthly.netPay ?? 0), 0)

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Batch Payroll Processing</h3>
        <p className="text-sm text-gray-600 mb-4">
          Upload a CSV or Excel file matching the standardised template. 
          <button onClick={downloadTemplate} className="ml-2 text-blue-700 underline hover:text-blue-900">
            Download Template
          </button>
        </p>

        <div className="flex items-center gap-4">
          <label className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            <span className="text-gray-600">
              {loading ? 'Processing...' : 'Click to upload CSV or Excel file'}
            </span>
            <input ref={fileRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFile} className="hidden" />
          </label>
        </div>
      </div>

      {results.length > 0 && (
        <>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-sm text-blue-700">Employees Processed</p>
              <p className="text-2xl font-bold text-blue-900">{results.length}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-sm text-amber-700">Total Annual PAYE</p>
              <p className="text-2xl font-bold text-amber-900">{formatNaira(totalTax)}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
              <p className="text-sm text-emerald-700">Total Monthly Net Pay</p>
              <p className="text-2xl font-bold text-emerald-900">{formatNaira(totalNet)}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h4 className="font-semibold text-gray-900">Payroll Results</h4>
              <button
                onClick={downloadResults}
                className="px-4 py-1.5 bg-blue-900 text-white text-sm rounded-lg hover:bg-blue-800"
              >
                Export to Excel
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">ID</th>
                    <th className="text-left px-4 py-2 font-medium text-gray-600">Name</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Gross</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">PAYE</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Net Pay</th>
                    <th className="text-right px-4 py-2 font-medium text-gray-600">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {results.map((r, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-900">{r.employee.id}</td>
                      <td className="px-4 py-2 text-gray-900">{r.employee.name}</td>
                      <td className="px-4 py-2 text-right">{formatNaira(r.result?.monthly.grossPay ?? 0)}</td>
                      <td className="px-4 py-2 text-right text-red-600">{formatNaira(r.result?.monthly.taxDeducted ?? 0)}</td>
                      <td className="px-4 py-2 text-right text-emerald-700">{formatNaira(r.result?.monthly.netPay ?? 0)}</td>
                      <td className="px-4 py-2 text-right">
                        {r.result ? `${(r.result.effectiveTaxRate * 100).toFixed(1)}%` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
