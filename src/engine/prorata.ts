import type { PayeInput, PayeResult } from './types';
import { calculateLagosPaye2026 } from './calculator';

export function calculateMidYear(
  input: PayeInput,
  monthsWorked: number,
): PayeResult {
  const annualResult = calculateLagosPaye2026(input, false);

  const ratio = monthsWorked / 12;

  return {
    ...annualResult,
    grossIncome: annualResult.grossIncome * ratio,
    statutoryDeductions: {
      ...annualResult.statutoryDeductions,
      total: annualResult.statutoryDeductions.total * ratio,
    },
    incomeAfterStatutoryDeductions: annualResult.incomeAfterStatutoryDeductions * ratio,
    chargeableIncome: annualResult.chargeableIncome * ratio,
    totalTax: annualResult.totalTax * ratio,
    netIncome: annualResult.netIncome * ratio,
    monthly: {
      grossPay: annualResult.grossIncome / 12,
      totalDeductions: (annualResult.statutoryDeductions.total + annualResult.totalTax) / 12,
      taxDeducted: annualResult.totalTax / 12,
      netPay: annualResult.netIncome / 12,
    },
  };
}

export function getMonthsBetween(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.max(0, (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth()) + 1);
}

export function getRemainingMonthsInYear(): number {
  const now = new Date();
  return 12 - now.getMonth();
}
