import { useState } from 'react'
import { grossUpTargetNetPay } from '../engine/grossUp'
import { formatNaira } from './TaxChart'

export default function ReverseCalculator() {
  const [targetNet, setTargetNet] = useState('500000')
  const [result, setResult] = useState<ReturnType<typeof grossUpTargetNetPay> | null>(null)

  function handleCalculate() {
    const annual = parseFloat(targetNet) * 12
    const res = grossUpTargetNetPay(annual)
    setResult(res)
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Reverse Calculator (Gross-Up)</h3>
      <p className="text-sm text-gray-600 mb-4">
        Enter your desired monthly take-home pay to find the required gross salary under the 2026 NTA regime.
      </p>

      <div className="flex items-end gap-3 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Desired Monthly Net Pay</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
            <input
              type="number"
              value={targetNet}
              onChange={e => setTargetNet(e.target.value)}
              className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        <button
          onClick={handleCalculate}
          className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          Calculate
        </button>
      </div>

      {result && (
        <div className="print-area space-y-4">
          <div className="no-print flex justify-end">
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
              </svg>
              Print / PDF
            </button>
          </div>
          <div className="print-grid grid grid-cols-2 gap-4">
            <div className="print-card bg-blue-50 rounded-lg p-4">
              <p className="print-text-sm text-blue-700 mb-1">Required Monthly Gross</p>
              <p className="print-text-xl font-bold text-blue-900">{formatNaira(result.result.monthly.grossPay)}</p>
            </div>
            <div className="print-card bg-emerald-50 rounded-lg p-4">
              <p className="print-text-sm text-emerald-700 mb-1">Monthly Net Pay</p>
              <p className="print-text-xl font-bold text-emerald-900">{formatNaira(result.result.monthly.netPay)}</p>
            </div>
            <div className="print-card bg-amber-50 rounded-lg p-4">
              <p className="print-text-sm text-amber-700 mb-1">Monthly Tax</p>
              <p className="print-text-xl font-bold text-amber-900">{formatNaira(result.result.monthly.taxDeducted)}</p>
            </div>
            <div className="print-card bg-purple-50 rounded-lg p-4">
              <p className="print-text-sm text-purple-700 mb-1">Effective Tax Rate</p>
              <p className="print-text-xl font-bold text-purple-900">{(result.result.effectiveTaxRate * 100).toFixed(1)}%</p>
            </div>
          </div>

          <details className="text-sm text-gray-600">
            <summary className="cursor-pointer font-medium text-gray-700">Breakdown of Gross Income Components</summary>
            <div className="mt-2 space-y-1 pl-2">
              {Object.entries(result.grossIncome).map(([key, val]) => (
                <div key={key} className="flex justify-between">
                  <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                  <span>{formatNaira(val)}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      )}
    </div>
  )
}
