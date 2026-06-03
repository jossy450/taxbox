import type { GrossIncome, PreTaxDeductions, RentInfo } from './types';
import { calculateLagosPaye2026, getDefaultDeductions, getDefaultRent } from './calculator';

const GUESS_ITERATIONS = 200;
const TOLERANCE = 100;

export function grossUpTargetNetPay(
  targetNetAnnual: number,
  deductions: PreTaxDeductions = getDefaultDeductions(),
  rent: RentInfo = getDefaultRent(),
): { grossIncome: GrossIncome; result: ReturnType<typeof calculateLagosPaye2026> } {
  let low = targetNetAnnual;
  let high = targetNetAnnual * 3;

  for (let i = 0; i < GUESS_ITERATIONS; i++) {
    const mid = (low + high) / 2;
    const grossIncome: GrossIncome = {
      basic: mid * 0.5,
      housing: mid * 0.15,
      transport: mid * 0.1,
      utility: mid * 0.05,
      wardrobe: mid * 0.03,
      lunch: mid * 0.02,
      bonus: mid * 0.05,
      thirteenthMonth: mid * 0.05,
      commission: mid * 0.03,
      otherAllowances: mid * 0.02,
    };

    const result = calculateLagosPaye2026({ grossIncome, deductions, rent }, false);
    const diff = result.netIncome - targetNetAnnual;

    if (Math.abs(diff) <= TOLERANCE) {
      return { grossIncome, result };
    }

    if (diff > 0) {
      high = mid;
    } else {
      low = mid;
    }
  }

  const finalGross = (low + high) / 2;
  const grossIncome: GrossIncome = {
    basic: finalGross * 0.5,
    housing: finalGross * 0.15,
    transport: finalGross * 0.1,
    utility: finalGross * 0.05,
    wardrobe: finalGross * 0.03,
    lunch: finalGross * 0.02,
    bonus: finalGross * 0.05,
    thirteenthMonth: finalGross * 0.05,
    commission: finalGross * 0.03,
    otherAllowances: finalGross * 0.02,
  };
  const result = calculateLagosPaye2026({ grossIncome, deductions, rent }, false);
  return { grossIncome, result };
}
