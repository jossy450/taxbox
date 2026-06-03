import type { PayeInput, PayeResult, TaxBracket, DeductionBreakdown, MonthlyBreakdown } from './types';

const BRACKETS_2026: { label: string; from: number; to: number; rate: number }[] = [
  { label: 'First ₦800,000', from: 0, to: 800_000, rate: 0 },
  { label: 'Next ₦2,200,000', from: 800_000, to: 3_000_000, rate: 0.15 },
  { label: 'Next ₦9,000,000', from: 3_000_000, to: 12_000_000, rate: 0.18 },
  { label: 'Next ₦13,000,000', from: 12_000_000, to: 25_000_000, rate: 0.21 },
  { label: 'Next ₦25,000,000', from: 25_000_000, to: 50_000_000, rate: 0.23 },
  { label: 'Above ₦50,000,000', from: 50_000_000, to: Infinity, rate: 0.25 },
];

function annualize(value: number, isMonthly: boolean): number {
  return isMonthly ? value * 12 : value;
}

function computeStatutoryDeductions(
  income: PayeInput['grossIncome'],
  deductions: PayeInput['deductions'],
  isMonthly: boolean,
): DeductionBreakdown {
  const basic = annualize(income.basic, isMonthly);
  const housing = annualize(income.housing, isMonthly);
  const transport = annualize(income.transport, isMonthly);
  const nhis = annualize(deductions.nhis, isMonthly);
  const lifeAssurance = annualize(deductions.lifeAssurance, isMonthly);

  const nhf = basic * (deductions.nhfPercentage / 100);
  const pension = (basic + housing + transport) * (deductions.pensionPercentage / 100);

  return { nhf, nhis, pension, lifeAssurance, total: nhf + nhis + pension + lifeAssurance };
}

function applyBrackets(chargeableIncome: number): TaxBracket[] {
  const brackets: TaxBracket[] = [];
  let remaining = chargeableIncome;

  for (const band of BRACKETS_2026) {
    const bandWidth = band.to === Infinity ? remaining : band.to - band.from;
    const taxableInBand = Math.max(0, Math.min(remaining, bandWidth));
    const taxInBand = taxableInBand * band.rate;
    brackets.push({ ...band, taxableInBand, taxInBand });
    remaining -= taxableInBand;
    if (remaining <= 0) break;
  }

  return brackets;
}

export function calculateLagosPaye2026(
  input: PayeInput,
  isMonthly: boolean = true,
): PayeResult {
  const grossIncome = annualize(input.grossIncome.basic, isMonthly)
    + annualize(input.grossIncome.housing, isMonthly)
    + annualize(input.grossIncome.transport, isMonthly)
    + annualize(input.grossIncome.utility, isMonthly)
    + annualize(input.grossIncome.wardrobe, isMonthly)
    + annualize(input.grossIncome.lunch, isMonthly)
    + annualize(input.grossIncome.bonus, isMonthly)
    + annualize(input.grossIncome.thirteenthMonth, isMonthly)
    + annualize(input.grossIncome.commission, isMonthly)
    + annualize(input.grossIncome.otherAllowances, isMonthly);

  const statutoryDeductions = computeStatutoryDeductions(input.grossIncome, input.deductions, isMonthly);

  const incomeAfterStatutoryDeductions = grossIncome - statutoryDeductions.total;

  const rentRelief = input.rent.hasRentReceipt && input.rent.annualRentPaid > 0
    ? Math.min(input.rent.annualRentPaid * 0.2, 500_000)
    : 0;

  const chargeableIncome = Math.max(0, incomeAfterStatutoryDeductions - rentRelief);

  const taxBrackets = applyBrackets(chargeableIncome);
  const totalTax = taxBrackets.reduce((sum, b) => sum + b.taxInBand, 0);
  const effectiveTaxRate = chargeableIncome > 0 ? totalTax / chargeableIncome : 0;
  const netIncome = grossIncome - statutoryDeductions.total - totalTax;

  const monthly: MonthlyBreakdown = {
    grossPay: grossIncome / 12,
    totalDeductions: (statutoryDeductions.total + totalTax) / 12,
    taxDeducted: totalTax / 12,
    netPay: netIncome / 12,
  };

  return {
    grossIncome,
    statutoryDeductions,
    incomeAfterStatutoryDeductions,
    rentRelief,
    chargeableIncome,
    taxBrackets,
    totalTax,
    effectiveTaxRate,
    netIncome,
    monthly,
  };
}

export function getDefaultDeductions(): PayeInput['deductions'] {
  return {
    nhfPercentage: 2.5,
    nhis: 0,
    pensionPercentage: 8,
    lifeAssurance: 0,
  };
}

export function getDefaultRent(): PayeInput['rent'] {
  return { annualRentPaid: 0, hasRentReceipt: false };
}

export const TAX_BRACKET_LABELS = BRACKETS_2026.map(b => b.label);

export function calculateOldPita(chargeableIncome: number): { totalTax: number; brackets: TaxBracket[] } {
  const oldBrackets = [
    { label: 'First ₦300,000', from: 0, to: 300_000, rate: 0.07 },
    { label: 'Next ₦300,000', from: 300_000, to: 600_000, rate: 0.11 },
    { label: 'Next ₦500,000', from: 600_000, to: 1_100_000, rate: 0.15 },
    { label: 'Next ₦500,000', from: 1_100_000, to: 1_600_000, rate: 0.19 },
    { label: 'Next ₦1,600,000', from: 1_600_000, to: 3_200_000, rate: 0.21 },
    { label: 'Above ₦3,200,000', from: 3_200_000, to: Infinity, rate: 0.24 },
  ];

  const brackets: TaxBracket[] = [];
  let remaining = chargeableIncome;

  for (const band of oldBrackets) {
    const bandWidth = band.to === Infinity ? remaining : band.to - band.from;
    const taxableInBand = Math.max(0, Math.min(remaining, bandWidth));
    const taxInBand = taxableInBand * band.rate;
    brackets.push({ ...band, taxableInBand, taxInBand });
    remaining -= taxableInBand;
    if (remaining <= 0) break;
  }

  const totalTax = brackets.reduce((sum, b) => sum + b.taxInBand, 0);
  return { totalTax, brackets };
}
