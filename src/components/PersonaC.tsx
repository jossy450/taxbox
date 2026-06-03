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
              <div className="print-area space-y-6">
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
                  <div className="print-card border border-red-200 rounded-lg p-4 bg-red-50">
                    <h4 className="print-font-bold text-red-800 print-mb-2">Old PITA Regime (CRA)</h4>
                    <div className="space-y-2 print-text-sm">
                      <div className="flex justify-between"><span>CRA Deducted</span><span>{formatNaira(comparison.oldRegime.cra)}</span></div>
                      <div className="flex justify-between"><span>Chargeable Income</span><span>{formatNaira(comparison.oldRegime.chargeableIncome)}</span></div>
                      <div className="flex justify-between print-font-bold text-red-700"><span>Total Tax</span><span>{formatNaira(comparison.oldRegime.totalTax)}</span></div>
                      <div className="flex justify-between"><span>Net Income</span><span>{formatNaira(comparison.oldRegime.netIncome)}</span></div>
                      <div className="flex justify-between"><span>Effective Rate</span><span>{(comparison.oldRegime.effectiveTaxRate * 100).toFixed(2)}%</span></div>
                    </div>
                  </div>

                  <div className="print-card border border-emerald-200 rounded-lg p-4 bg-emerald-50">
                    <h4 className="print-font-bold text-emerald-800 print-mb-2">New NTA Regime (RRA)</h4>
                    <div className="space-y-2 print-text-sm">
                      <div className="flex justify-between"><span>RRA Deducted</span><span>{formatNaira(comparison.newRegime.rentRelief)}</span></div>
                      <div className="flex justify-between"><span>Chargeable Income</span><span>{formatNaira(comparison.newRegime.chargeableIncome)}</span></div>
                      <div className="flex justify-between print-font-bold text-emerald-700"><span>Total Tax</span><span>{formatNaira(comparison.newRegime.totalTax)}</span></div>
                      <div className="flex justify-between"><span>Net Income</span><span>{formatNaira(comparison.newRegime.netIncome)}</span></div>
                      <div className="flex justify-between"><span>Effective Rate</span><span>{(comparison.newRegime.effectiveTaxRate * 100).toFixed(2)}%</span></div>
                    </div>
                  </div>
                </div>

                <div className={`print-card rounded-lg p-4 border ${comparison.difference.taxDelta >= 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                  <h4 className="print-font-bold text-gray-900 print-mb-2">Difference Summary</h4>
                  <div className="print-grid grid grid-cols-3 gap-4 print-text-sm">
                    <div>
                      <p className="text-gray-500">Tax Change</p>
                      <p className={`print-text-lg font-bold ${comparison.difference.taxDelta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {comparison.difference.taxDelta >= 0 ? '-' : '+'}{formatNaira(Math.abs(comparison.difference.taxDelta))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">% Change</p>
                      <p className={`print-text-lg font-bold ${comparison.difference.percentageChange <= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {comparison.difference.percentageChange >= 0 ? '-' : '+'}{Math.abs(comparison.difference.percentageChange).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Monthly Impact</p>
                      <p className={`print-text-lg font-bold ${comparison.difference.taxDelta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {comparison.difference.taxDelta >= 0 ? '-' : '+'}{formatNaira(Math.abs(comparison.difference.monthlySavings))}
                      </p>
                    </div>
                  </div>
                </div>

                <details className="print-text-sm text-gray-600">
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
