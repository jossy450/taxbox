import type { PayeInput, TaxBracket } from './types';
import { calculateLagosPaye2026, getDefaultDeductions, getDefaultRent, calculateOldPita } from './calculator';

export interface ComparativeResult {
  newRegime: {
    totalTax: number;
    effectiveTaxRate: number;
    chargeableIncome: number;
    rentRelief: number;
    taxBrackets: TaxBracket[];
    netIncome: number;
  };
  oldRegime: {
    cra: number;
    chargeableIncome: number;
    totalTax: number;
    effectiveTaxRate: number;
    taxBrackets: TaxBracket[];
    netIncome: number;
  };
  difference: {
    taxDelta: number;
    percentageChange: number;
    annualSavings: number;
    monthlySavings: number;
  };
}

export function computeComparative(
  grossIncome: number,
  deductions: PayeInput['deductions'] = getDefaultDeductions(),
  rent: PayeInput['rent'] = getDefaultRent(),
): ComparativeResult {
  const income: PayeInput = {
    grossIncome: {
      basic: grossIncome * 0.5,
      housing: grossIncome * 0.15,
      transport: grossIncome * 0.1,
      utility: grossIncome * 0.05,
      wardrobe: grossIncome * 0.03,
      lunch: grossIncome * 0.02,
      bonus: grossIncome * 0.05,
      thirteenthMonth: grossIncome * 0.05,
      commission: grossIncome * 0.03,
      otherAllowances: grossIncome * 0.02,
    },
    deductions,
    rent,
  };

  const newResult = calculateLagosPaye2026(income, false);

  const { basic, housing, transport } = income.grossIncome;
  const pension = (basic + housing + transport) * (deductions.pensionPercentage / 100);
  const nhf = basic * (deductions.nhfPercentage / 100);
  const nhis = deductions.nhis;
  const lifeAssurance = deductions.lifeAssurance;
  const totalDeductions = pension + nhf + nhis + lifeAssurance;

  const oldCra = 200_000 + 0.2 * grossIncome;
  const oldChargeableIncome = Math.max(0, grossIncome - totalDeductions - oldCra);

  const oldResult = calculateOldPita(oldChargeableIncome);

  const oldNetIncome = grossIncome - totalDeductions - oldResult.totalTax;

  const taxDelta = oldResult.totalTax - newResult.totalTax;

  return {
    newRegime: {
      totalTax: newResult.totalTax,
      effectiveTaxRate: newResult.effectiveTaxRate,
      chargeableIncome: newResult.chargeableIncome,
      rentRelief: newResult.rentRelief,
      taxBrackets: newResult.taxBrackets,
      netIncome: newResult.netIncome,
    },
    oldRegime: {
      cra: oldCra,
      chargeableIncome: oldChargeableIncome,
      totalTax: oldResult.totalTax,
      effectiveTaxRate: oldChargeableIncome > 0 ? oldResult.totalTax / oldChargeableIncome : 0,
      taxBrackets: oldResult.brackets,
      netIncome: oldNetIncome,
    },
    difference: {
      taxDelta,
      percentageChange: oldResult.totalTax > 0 ? (taxDelta / oldResult.totalTax) * 100 : 0,
      annualSavings: taxDelta,
      monthlySavings: taxDelta / 12,
    },
  };
}

export function comparePersona(
  input: PayeInput,
): ComparativeResult {
  const totalIncome = input.grossIncome.basic
    + input.grossIncome.housing
    + input.grossIncome.transport
    + input.grossIncome.utility
    + input.grossIncome.wardrobe
    + input.grossIncome.lunch
    + input.grossIncome.bonus
    + input.grossIncome.thirteenthMonth
    + input.grossIncome.commission
    + input.grossIncome.otherAllowances;
  return computeComparative(totalIncome, input.deductions, input.rent);
}
