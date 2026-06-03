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
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700 mb-1">Required Monthly Gross</p>
              <p className="text-2xl font-bold text-blue-900">{formatNaira(result.result.monthly.grossPay)}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4">
              <p className="text-sm text-emerald-700 mb-1">Monthly Net Pay</p>
              <p className="text-2xl font-bold text-emerald-900">{formatNaira(result.result.monthly.netPay)}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4">
              <p className="text-sm text-amber-700 mb-1">Monthly Tax</p>
              <p className="text-2xl font-bold text-amber-900">{formatNaira(result.result.monthly.taxDeducted)}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-700 mb-1">Effective Tax Rate</p>
              <p className="text-2xl font-bold text-purple-900">{(result.result.effectiveTaxRate * 100).toFixed(1)}%</p>
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
