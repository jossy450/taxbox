import { useState } from 'react'
import { calculateLagosPaye2026, getDefaultDeductions } from '../engine/calculator'
import type { GrossIncome, PayeResult, RentInfo, PreTaxDeductions } from '../engine/types'
import TaxChart, { formatNaira } from './TaxChart'
import ReverseCalculator from './ReverseCalculator'

const emptyIncome: GrossIncome = {
  basic: 0, housing: 0, transport: 0, utility: 0,
  wardrobe: 0, lunch: 0, bonus: 0, thirteenthMonth: 0,
  commission: 0, otherAllowances: 0,
};

export default function PersonaA() {
  const [income, setIncome] = useState<GrossIncome>({ ...emptyIncome, basic: 300_000, housing: 75_000, transport: 50_000 })
  const [annualRent, setAnnualRent] = useState(600_000)
  const [hasReceipt, setHasReceipt] = useState(true)
  const [result, setResult] = useState<PayeResult | null>(null)
  const [showGrossUp, setShowGrossUp] = useState(false)

  function updateField(field: keyof GrossIncome, value: string) {
    setIncome(prev => ({ ...prev, [field]: parseFloat(value) || 0 }))
  }

  function handleCalculate() {
    const deductions: PreTaxDeductions = getDefaultDeductions()
    const rent: RentInfo = { annualRentPaid: annualRent, hasRentReceipt: hasReceipt }
    setResult(calculateLagosPaye2026({ grossIncome: income, deductions, rent }, true))
  }

  const chartData = result
    ? ([
        { name: 'Net Pay', value: result.monthly.netPay },
        { name: 'PAYE Tax', value: result.monthly.taxDeducted },
        { name: 'Pension', value: result.statutoryDeductions.pension / 12 },
        { name: 'NHF', value: result.statutoryDeductions.nhf / 12 },
        { name: 'NHIS', value: result.statutoryDeductions.nhis / 12 },
        { name: 'Life Assurance', value: result.statutoryDeductions.lifeAssurance / 12 },
      ] as const).filter(d => d.value > 0) as unknown as { name: string; value: number }[]
    : []

  return (
    <div className="space-y-6">
      {showGrossUp ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Reverse Calculator</h2>
            <button onClick={() => setShowGrossUp(false)}
              className="text-sm text-blue-700 hover:text-blue-900 underline">
              Back to Quick Check
            </button>
          </div>
          <ReverseCalculator />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Individual Tax Calculator</h2>
            <button onClick={() => setShowGrossUp(true)}
              className="text-sm text-blue-700 hover:text-blue-900 underline">
              Try Reverse Calculator (Gross-Up)
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Income Breakdown</h3>
              <div className="grid grid-cols-2 gap-4">
                {([
                  ['Basic Salary', 'basic'],
                  ['Housing Allowance', 'housing'],
                  ['Transport Allowance', 'transport'],
                  ['Utility Allowance', 'utility'],
                  ['Wardrobe Allowance', 'wardrobe'],
                  ['Lunch Allowance', 'lunch'],
                  ['Bonus', 'bonus'],
                  ['13th Month', 'thirteenthMonth'],
                  ['Commission', 'commission'],
                  ['Other Allowances', 'otherAllowances'],
                ] as const).map(([label, field]) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
                      <input type="number" value={income[field] || ''}
                        onChange={e => updateField(field, e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Rent Relief Allowance (RRA)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Annual Rent Paid</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
                      <input type="number" value={annualRent || ''}
                        onChange={e => setAnnualRent(parseFloat(e.target.value) || 0)}
                        className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" />
                    </div>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex items-center gap-2 text-sm text-gray-700">
                      <input type="checkbox" checked={hasReceipt} onChange={e => setHasReceipt(e.target.checked)}
                        className="rounded border-gray-300" />
                      I have rent receipts
                    </label>
                  </div>
                </div>
              </div>

              <button onClick={handleCalculate}
                className="mt-6 w-full py-3 bg-blue-900 text-white font-medium rounded-lg hover:bg-blue-800 transition-colors">
                Calculate My PAYE
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Summary</h3>
              {result ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-700">Monthly Net Pay</p>
                    <p className="text-3xl font-bold text-blue-900">{formatNaira(result.monthly.netPay)}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-500">Gross Pay</p>
                      <p className="font-semibold">{formatNaira(result.monthly.grossPay)}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs text-red-600">Monthly Tax</p>
                      <p className="font-semibold text-red-700">{formatNaira(result.monthly.taxDeducted)}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-lg p-3">
                      <p className="text-xs text-emerald-600">Annual Net</p>
                      <p className="font-semibold text-emerald-700">{formatNaira(result.netIncome)}</p>
                    </div>
                    <div className="bg-amber-50 rounded-lg p-3">
                      <p className="text-xs text-amber-600">Tax Rate</p>
                      <p className="font-semibold text-amber-700">{(result.effectiveTaxRate * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                  <TaxChart data={chartData} />
                  <details className="text-xs text-gray-500">
                    <summary className="cursor-pointer">View bracket breakdown</summary>
                    <div className="mt-2 space-y-1">
                      {result.taxBrackets.map((b, i) => (
                        <div key={i} className="flex justify-between">
                          <span>{b.label} @ {(b.rate * 100).toFixed(0)}%</span>
                          <span>{formatNaira(b.taxInBand)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-4xl mb-2">📊</p>
                  <p className="text-sm">Enter your income details and click Calculate</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
