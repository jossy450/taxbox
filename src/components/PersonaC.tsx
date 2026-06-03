import { useState } from 'react'
import { computeComparative } from '../engine/comparative'
import { formatNaira } from './TaxChart'
import OptimizationSandbox from './OptimizationSandbox'

export default function PersonaC() {
  const [annualGross, setAnnualGross] = useState('6_000_000')
  const [comparison, setComparison] = useState<ReturnType<typeof computeComparative> | null>(null)
  const [showSandbox, setShowSandbox] = useState(false)

  function handleCompare() {
    const gross = parseFloat(annualGross.replace(/,/g, ''))
    if (!gross) return
    setComparison(computeComparative(gross))
  }

  return (
    <div className="space-y-6">
      {showSandbox ? (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Tax Optimisation Sandbox</h2>
            <button onClick={() => setShowSandbox(false)}
              className="text-sm text-blue-700 hover:text-blue-900 underline">
              Back to Audit & Comparison
            </button>
          </div>
          <OptimizationSandbox />
        </>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tax Consultant — Audit & Comparison</h2>
              <p className="text-sm text-gray-600 mt-1">
                Compare old PITA (CRA) vs new NTA (RRA) regimes and run optimisation scenarios.
              </p>
            </div>
            <button onClick={() => setShowSandbox(true)}
              className="px-4 py-2 bg-emerald-700 text-white text-sm rounded-lg hover:bg-emerald-600">
              Open Optimisation Sandbox
            </button>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Regime Comparison</h3>
            <div className="flex items-end gap-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Gross Income</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₦</span>
                  <input type="text" value={annualGross}
                    onChange={e => setAnnualGross(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <button onClick={handleCompare}
                className="px-6 py-2 bg-blue-900 text-white rounded-lg hover:bg-blue-800">
                Compare
              </button>
            </div>

            {comparison && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <h4 className="font-semibold text-red-800 mb-3">Old PITA Regime (CRA)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>CRA Deducted</span><span>{formatNaira(comparison.oldRegime.cra)}</span></div>
                      <div className="flex justify-between"><span>Chargeable Income</span><span>{formatNaira(comparison.oldRegime.chargeableIncome)}</span></div>
                      <div className="flex justify-between font-bold text-red-700"><span>Total Tax</span><span>{formatNaira(comparison.oldRegime.totalTax)}</span></div>
                      <div className="flex justify-between"><span>Net Income</span><span>{formatNaira(comparison.oldRegime.netIncome)}</span></div>
                      <div className="flex justify-between"><span>Effective Rate</span><span>{(comparison.oldRegime.effectiveTaxRate * 100).toFixed(2)}%</span></div>
                    </div>
                  </div>

                  <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
                    <h4 className="font-semibold text-emerald-800 mb-3">New NTA Regime (RRA)</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>RRA Deducted</span><span>{formatNaira(comparison.newRegime.rentRelief)}</span></div>
                      <div className="flex justify-between"><span>Chargeable Income</span><span>{formatNaira(comparison.newRegime.chargeableIncome)}</span></div>
                      <div className="flex justify-between font-bold text-emerald-700"><span>Total Tax</span><span>{formatNaira(comparison.newRegime.totalTax)}</span></div>
                      <div className="flex justify-between"><span>Net Income</span><span>{formatNaira(comparison.newRegime.netIncome)}</span></div>
                      <div className="flex justify-between"><span>Effective Rate</span><span>{(comparison.newRegime.effectiveTaxRate * 100).toFixed(2)}%</span></div>
                    </div>
                  </div>
                </div>

                <div className={`rounded-lg p-4 border ${comparison.difference.taxDelta >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <h4 className="font-semibold text-gray-900 mb-2">Difference Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Tax Change</p>
                      <p className={`text-lg font-bold ${comparison.difference.taxDelta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {comparison.difference.taxDelta >= 0 ? '-' : '+'}{formatNaira(Math.abs(comparison.difference.taxDelta))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">% Change</p>
                      <p className={`text-lg font-bold ${comparison.difference.percentageChange <= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {comparison.difference.percentageChange >= 0 ? '-' : '+'}{Math.abs(comparison.difference.percentageChange).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Monthly Impact</p>
                      <p className={`text-lg font-bold ${comparison.difference.taxDelta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {comparison.difference.taxDelta >= 0 ? '-' : '+'}{formatNaira(Math.abs(comparison.difference.monthlySavings))}
                      </p>
                    </div>
                  </div>
                </div>

                <details className="text-sm text-gray-600">
                  <summary className="cursor-pointer font-medium text-gray-700">New Regime Bracket Breakdown</summary>
                  <div className="mt-2 space-y-1">
                    {comparison.newRegime.taxBrackets.filter(b => b.taxableInBand > 0).map((b, i) => (
                      <div key={i} className="flex justify-between">
                        <span>{b.label} @ {(b.rate * 100).toFixed(0)}%</span>
                        <span>{formatNaira(b.taxInBand)} on {formatNaira(b.taxableInBand)}</span>
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
