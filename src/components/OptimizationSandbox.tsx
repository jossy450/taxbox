import { useState, useMemo } from 'react'
import { calculateLagosPaye2026, getDefaultDeductions } from '../engine/calculator'
import type { GrossIncome, PreTaxDeductions, PayeResult, RentInfo } from '../engine/types'
import { formatNaira } from './TaxChart'

const BASE_INCOME: GrossIncome = {
  basic: 500_000, housing: 150_000, transport: 100_000,
  utility: 50_000, wardrobe: 30_000, lunch: 20_000,
  bonus: 50_000, thirteenthMonth: 50_000, commission: 30_000, otherAllowances: 20_000,
};

export default function OptimizationSandbox() {
  const [basic, setBasic] = useState(BASE_INCOME.basic)
  const [pensionPct, setPensionPct] = useState(8)
  const [lifeAssurance, setLifeAssurance] = useState(0)
  const [annualRent, setAnnualRent] = useState(1_200_000)
  const [hasReceipt, setHasReceipt] = useState(true)

  const result: PayeResult = useMemo(() => {
    const income: GrossIncome = {
      ...BASE_INCOME, basic,
    }
    const deductions: PreTaxDeductions = {
      ...getDefaultDeductions(),
      pensionPercentage: pensionPct,
      lifeAssurance,
    }
    const rent: RentInfo = {
      annualRentPaid: annualRent,
      hasRentReceipt: hasReceipt,
    }
    return calculateLagosPaye2026({ grossIncome: income, deductions, rent }, true)
  }, [basic, pensionPct, lifeAssurance, annualRent, hasReceipt])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Tax Optimisation Sandbox</h3>
      <p className="text-sm text-gray-600 mb-6">
        Adjust sliders to see how voluntary pension contributions, rent relief, and life assurance affect your tax liability.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>Basic Salary</span>
              <span className="text-blue-900 font-semibold">{formatNaira(basic)}/mo</span>
            </label>
            <input type="range" min={100_000} max={2_000_000} step={10_000} value={basic}
              onChange={e => setBasic(Number(e.target.value))}
              className="w-full accent-blue-900" />
            <div className="flex justify-between text-xs text-gray-400">
              <span>₦100k</span><span>₦2M</span>
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>Pension Contribution</span>
              <span className="text-emerald-900 font-semibold">{pensionPct}%</span>
            </label>
            <input type="range" min={0} max={30} step={0.5} value={pensionPct}
              onChange={e => setPensionPct(Number(e.target.value))}
              className="w-full accent-emerald-700" />
            <div className="flex justify-between text-xs text-gray-400">
              <span>0%</span><span>30%</span>
            </div>
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>Life Assurance Premium (annual)</span>
              <span className="text-purple-900 font-semibold">{formatNaira(lifeAssurance)}/yr</span>
            </label>
            <input type="range" min={0} max={500_000} step={10_000} value={lifeAssurance}
              onChange={e => setLifeAssurance(Number(e.target.value))}
              className="w-full accent-purple-700" />
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium text-gray-700 mb-1">
              <span>Annual Rent Paid</span>
              <span className="text-amber-900 font-semibold">{formatNaira(annualRent)}/yr</span>
            </label>
            <input type="range" min={0} max={5_000_000} step={50_000} value={annualRent}
              onChange={e => setAnnualRent(Number(e.target.value))}
              className="w-full accent-amber-600" />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={hasReceipt} onChange={e => setHasReceipt(e.target.checked)}
              className="rounded border-gray-300" />
            I have rent receipts / tenancy agreement
          </label>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold text-gray-900">Results</h4>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Annual Gross</p>
              <p className="text-lg font-bold text-gray-900">{formatNaira(result.grossIncome)}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500">Chargeable Income</p>
              <p className="text-lg font-bold text-gray-900">{formatNaira(result.chargeableIncome)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs text-red-600">Annual Tax</p>
              <p className="text-lg font-bold text-red-700">{formatNaira(result.totalTax)}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-3">
              <p className="text-xs text-emerald-600">Annual Net</p>
              <p className="text-lg font-bold text-emerald-700">{formatNaira(result.netIncome)}</p>
            </div>
          </div>

          <div className="text-sm text-gray-600 space-y-1 pt-2 border-t border-gray-100">
            <div className="flex justify-between"><span>Rent Relief Claimed</span><span>{formatNaira(result.rentRelief)}</span></div>
            <div className="flex justify-between"><span>Pension Contribution</span><span>{formatNaira(result.statutoryDeductions.pension)}</span></div>
            <div className="flex justify-between"><span>NHF (2.5%)</span><span>{formatNaira(result.statutoryDeductions.nhf)}</span></div>
            <div className="flex justify-between"><span>NHIS</span><span>{formatNaira(result.statutoryDeductions.nhis)}</span></div>
            <div className="flex justify-between"><span>Life Assurance</span><span>{formatNaira(result.statutoryDeductions.lifeAssurance)}</span></div>
            <div className="flex justify-between font-medium text-gray-900 pt-1">
              <span>Effective Tax Rate</span>
              <span>{(result.effectiveTaxRate * 100).toFixed(2)}%</span>
            </div>
          </div>

          <div className="mt-3">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Monthly Net Pay</h5>
            <p className="text-3xl font-bold text-blue-900">{formatNaira(result.monthly.netPay)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
