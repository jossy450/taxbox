import { useState } from 'react'
import { calculateLagosPaye2026, getDefaultDeductions } from '../engine/calculator'
import type { GrossIncome, PayeResult, RentInfo, PreTaxDeductions } from '../engine/types'
import TaxChart, { formatNaira } from './TaxChart'
import TaxComputationTable from './TaxComputationTable'
import ScenarioManager from './ScenarioManager'
import { grossUpTargetNetPay } from '../engine/grossUp'

const emptyIncome: GrossIncome = {
  basic: 0, housing: 0, transport: 0, utility: 0,
  wardrobe: 0, lunch: 0, bonus: 0, thirteenthMonth: 0,
  commission: 0, otherAllowances: 0,
};

type Direction = 'incomeToTax' | 'taxToIncome';

export default function PersonaA() {
  const [direction, setDirection] = useState<Direction>('incomeToTax');
  const [isMonthly, setIsMonthly] = useState(true);
  const [income, setIncome] = useState<GrossIncome>({ ...emptyIncome, basic: 300_000, housing: 75_000, transport: 50_000 })
  const [annualRent, setAnnualRent] = useState(600_000)
  const [hasReceipt, setHasReceipt] = useState(true)
  const [result, setResult] = useState<PayeResult | null>(null)
  const [targetNet, setTargetNet] = useState('500000')
  const [reverseResult, setReverseResult] = useState<ReturnType<typeof grossUpTargetNetPay> | null>(null)

  const periodLabel = isMonthly ? 'Monthly' : 'Annual';

  function updateField(field: keyof GrossIncome, value: string) {
    const num = parseFloat(value)
    setIncome(prev => ({ ...prev, [field]: !isNaN(num) && num >= 0 ? num : 0 }))
  }

  function handleCalculate() {
    const deductions: PreTaxDeductions = getDefaultDeductions()
    const rent: RentInfo = { annualRentPaid: annualRent, hasRentReceipt: hasReceipt }
    setResult(calculateLagosPaye2026({ grossIncome: income, deductions, rent }, isMonthly))
  }

  function handleCalculateReverse() {
    const annual = parseFloat(targetNet) * (isMonthly ? 12 : 1)
    if (!annual) return
    setReverseResult(grossUpTargetNetPay(annual))
  }

  const rawChartData = result
    ? isMonthly
      ? [
          { name: 'Net Pay', value: result.monthly.netPay },
          { name: 'PAYE Tax', value: result.monthly.taxDeducted },
          { name: 'Pension', value: result.statutoryDeductions.pension / 12 },
          { name: 'NHF', value: result.statutoryDeductions.nhf / 12 },
          { name: 'NHIS', value: result.statutoryDeductions.nhis / 12 },
          { name: 'Life Assurance', value: result.statutoryDeductions.lifeAssurance / 12 },
        ]
      : [
          { name: 'Net Pay', value: result.netIncome },
          { name: 'PAYE Tax', value: result.totalTax },
          { name: 'Pension', value: result.statutoryDeductions.pension },
          { name: 'NHF', value: result.statutoryDeductions.nhf },
          { name: 'NHIS', value: result.statutoryDeductions.nhis },
          { name: 'Life Assurance', value: result.statutoryDeductions.lifeAssurance },
        ]
    : [];
  const chartData: { name: string; value: number }[] = rawChartData.filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">2026 PAYE Calculator</h2>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => { setDirection('incomeToTax'); setReverseResult(null); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${direction === 'incomeToTax' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            Income → Tax
          </button>
          <button onClick={() => { setDirection('taxToIncome'); setResult(null); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${direction === 'taxToIncome' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            Tax → Income
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {direction === 'incomeToTax' ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{periodLabel} Income Breakdown</h3>
                <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
                  <button onClick={() => setIsMonthly(true)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${isMonthly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                    Monthly
                  </button>
                  <button onClick={() => setIsMonthly(false)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${!isMonthly ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
                    Annual
                  </button>
                </div>
              </div>
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
            </>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reverse Calculator (Gross-Up)</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter your desired monthly take-home pay to find the required gross salary under the 2026 regime.
              </p>
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Desired Monthly Net Pay</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                    <input type="number" value={targetNet}
                      onChange={e => setTargetNet(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <button onClick={handleCalculateReverse}
                  className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors">
                  Calculate
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {direction === 'incomeToTax' ? 'Your Summary' : 'Required Gross'}
            </h3>
            {(result || reverseResult) && (
              <button onClick={() => window.print()}
                className="no-print flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
                </svg>
                Print / PDF
              </button>
            )}
          </div>

          {direction === 'incomeToTax' && result ? (
            <div className="print-area space-y-4">
              <div className="print-card bg-blue-50 rounded-lg p-4 text-center">
                <p className="print-text-sm text-blue-700">{periodLabel} Net Pay</p>
                <p className="print-text-xl font-bold text-blue-900">{formatNaira(isMonthly ? result.monthly.netPay : result.netIncome)}</p>
              </div>
              <div className="print-grid grid grid-cols-2 gap-3">
                <div className="print-card bg-gray-50 rounded-lg p-3">
                  <p className="print-text-sm text-gray-500">{periodLabel} Gross Pay</p>
                  <p className="print-font-bold">{formatNaira(isMonthly ? result.monthly.grossPay : result.grossIncome)}</p>
                </div>
                <div className="print-card bg-red-50 rounded-lg p-3">
                  <p className="print-text-sm text-red-600">{periodLabel} Tax</p>
                  <p className="print-font-bold text-red-700">{formatNaira(isMonthly ? result.monthly.taxDeducted : result.totalTax)}</p>
                </div>
                <div className="print-card bg-emerald-50 rounded-lg p-3">
                  <p className="print-text-sm text-emerald-600">{isMonthly ? 'Annual Net' : 'Monthly Net'}</p>
                  <p className="print-font-bold text-emerald-700">{formatNaira(isMonthly ? result.netIncome : result.monthly.netPay)}</p>
                </div>
                <div className="print-card bg-amber-50 rounded-lg p-3">
                  <p className="print-text-sm text-amber-600">Effective Tax Rate</p>
                  <p className="print-font-bold text-amber-700">{(result.effectiveTaxRate * 100).toFixed(1)}%</p>
                </div>
                <div className="print-card bg-red-50 rounded-lg p-3">
                  <p className="print-text-sm text-red-600">{isMonthly ? 'Annual Tax Due' : 'Monthly Tax Due'}</p>
                  <p className="print-font-bold text-red-700">{formatNaira(isMonthly ? result.totalTax : result.monthly.taxDeducted)}</p>
                </div>
              </div>
              <TaxChart data={chartData} />
              <TaxComputationTable result={result} regime="2026" />
              <ScenarioManager
                currentResult={result}
                currentIncome={income}
                currentAnnualRent={annualRent}
                currentHasReceipt={hasReceipt}
                currentIsMonthly={isMonthly}
              />
            </div>
          ) : direction === 'taxToIncome' && reverseResult ? (
            <div className="print-area space-y-4">
              <div className="print-card bg-blue-50 rounded-lg p-4 text-center">
                <p className="print-text-sm text-blue-700">Required Monthly Gross</p>
                <p className="print-text-xl font-bold text-blue-900">{formatNaira(reverseResult.result.monthly.grossPay)}</p>
              </div>
              <div className="print-grid grid grid-cols-2 gap-3">
                <div className="print-card bg-emerald-50 rounded-lg p-3">
                  <p className="print-text-sm text-emerald-600">Monthly Net Pay</p>
                  <p className="print-font-bold text-emerald-700">{formatNaira(reverseResult.result.monthly.netPay)}</p>
                </div>
                <div className="print-card bg-red-50 rounded-lg p-3">
                  <p className="print-text-sm text-red-600">Monthly Tax</p>
                  <p className="print-font-bold text-red-700">{formatNaira(reverseResult.result.monthly.taxDeducted)}</p>
                </div>
                <div className="print-card bg-amber-50 rounded-lg p-3">
                  <p className="print-text-sm text-amber-600">Effective Tax Rate</p>
                  <p className="print-font-bold text-amber-700">{(reverseResult.result.effectiveTaxRate * 100).toFixed(1)}%</p>
                </div>
                <div className="print-card bg-red-50 rounded-lg p-3">
                  <p className="print-text-sm text-red-600">Annual Tax Due</p>
                  <p className="print-font-bold text-red-700">{formatNaira(reverseResult.result.totalTax)}</p>
                </div>
              </div>
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer">View breakdown</summary>
                <div className="mt-2 space-y-1">
                  {Object.entries(reverseResult.grossIncome).map(([key, val]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span>{formatNaira(val)}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">📊</p>
              <p className="text-sm">
                {direction === 'incomeToTax'
                  ? 'Enter your income details and click Calculate'
                  : 'Enter your desired net pay and click Calculate'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
